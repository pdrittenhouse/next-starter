#!/usr/bin/env node
/**
 * Writes one standalone SVG per icon to `public/icons/`, decoded from the
 * `$sprites` map in the generated icon SCSS.
 *
 * ─── Why ────────────────────────────────────────────────────────────────────
 *
 * `_sprite-mask.scss` embedded each icon into the stylesheet as a
 * percent-encoded `data:` URI. Measured on the compiled global stylesheet:
 * **251 inline SVG data-URIs totalling 1019.7 KB — 36% of a 2830 KB file.**
 * Every icon in the set shipped on every page, whether or not the page used one.
 *
 * Referencing external files instead means the browser fetches only the icons a
 * page actually uses, each independently cacheable.
 *
 * ─── Why one file per icon, and not the existing spritemap ──────────────────
 *
 * `public/spritemap.svg` already exists for `<use href="/spritemap.svg#sprite-x">`,
 * and the obvious move is `mask-image: url(/spritemap.svg#sprite-x)`. That does
 * not work: the fragment names a `<symbol>`, and a `<symbol>` is not
 * standalone-renderable, so browsers render nothing. `url()` fragments only
 * render for an SVG view or a whole document. One file per icon avoids the
 * question and is what every browser handles identically.
 *
 * The cost is one request per distinct icon used on a page rather than zero.
 * Over HTTP/2 that is cheap, they are tiny, and they cache across navigations —
 * against 1 MB of blocking CSS on every page.
 *
 * ─── Source ─────────────────────────────────────────────────────────────────
 *
 * Decoded from the already-synced `$sprites` map rather than fetched from
 * WordPress, so this needs no new REST endpoint and cannot disagree with the
 * SCSS that references it — both come from the same generated file.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const GENERATED = join(
  projectRoot, 'src', 'scss', 'printing', '01-atoms', 'svg', 'generated', '_icons-generated.scss',
);
const OUT_DIR = join(projectRoot, 'public', 'icons');

/**
 * Pull `'name': "data:image/svg+xml,..."` pairs out of the `$sprites` map.
 *
 * A regex rather than a Sass parse: the file is machine-generated with one
 * entry per line in a known shape, and pulling in a Sass AST to read a map of
 * strings would be a lot of machinery for that.
 */
function extractSprites(scss) {
  const start = scss.indexOf('$sprites: (');
  if (start === -1) return [];

  // Stop at the closing `);` of the map so the later $svgicon-* maps, which
  // contain no payloads, are not scanned.
  const end = scss.indexOf('\n);', start);
  const block = scss.slice(start, end === -1 ? undefined : end);

  const out = [];
  const re = /'([^']+)':\s*"(data:image\/svg\+xml,[^"]*)"/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    out.push({ name: m[1], uri: m[2] });
  }
  return out;
}

/** `data:image/svg+xml,<percent-encoded>` → raw SVG markup. */
function decodeDataUri(uri) {
  const comma = uri.indexOf(',');
  const payload = uri.slice(comma + 1);

  // The spritemap plugin emits percent-encoded (not base64) SVG. decodeURIComponent
  // handles the %xx sequences; single quotes in attributes are left as-is and are
  // valid in XML.
  return decodeURIComponent(payload);
}

function main() {
  if (!existsSync(GENERATED)) {
    console.log('[build-icon-files] no generated icon SCSS — run sync-icons first. Skipped.');
    return;
  }

  const sprites = extractSprites(readFileSync(GENERATED, 'utf8'));
  if (!sprites.length) {
    console.error('[build-icon-files] found no sprites in the $sprites map — aborting rather than emptying public/icons.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const written = new Set();
  let bytes = 0;

  for (const { name, uri } of sprites) {
    let svg;
    try {
      svg = decodeDataUri(uri);
    } catch (error) {
      console.error(`[build-icon-files] could not decode '${name}': ${error.message}`);
      process.exit(1);
    }

    if (!svg.trimStart().startsWith('<svg')) {
      console.error(`[build-icon-files] '${name}' did not decode to SVG markup — aborting.`);
      process.exit(1);
    }

    const filename = `${name}.svg`;
    writeFileSync(join(OUT_DIR, filename), svg, 'utf8');
    written.add(filename);
    bytes += Buffer.byteLength(svg);
  }

  for (const existing of readdirSync(OUT_DIR)) {
    if (existing.endsWith('.svg') && !written.has(existing)) {
      rmSync(join(OUT_DIR, existing));
      console.log(`[build-icon-files] removed stale ${existing}`);
    }
  }

  console.log(
    `[build-icon-files] wrote ${written.size} icons to public/icons/ (${(bytes / 1024).toFixed(1)} KB total)`,
  );
}

main();
