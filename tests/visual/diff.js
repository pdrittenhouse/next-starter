'use strict';

/**
 * Compares two computed-style snapshots and formats the result for review.
 *
 * The output is grouped by *property* first, not by element. That ordering is the
 * whole point: a purge regression is "border-radius vanished from 14 elements",
 * which reads as one finding. Grouped by element it reads as 14 findings and the
 * shape of the problem is lost.
 *
 * Element add/remove is reported separately from style change. A single inserted
 * <div> shifts every later :nth-of-type path, so without that separation one
 * markup change would masquerade as hundreds of style regressions.
 *
 * CSS custom properties (T12) are diffed on their own path, deliberately NOT folded
 * into `styles`. The standard-property loop below skips any property missing from the
 * current snapshot (`if (!(prop in cS)) continue`) because the property list is fixed
 * and a missing key means the list itself changed, not that a value regressed. Custom
 * properties are the opposite: the set is per-element and data-dependent, so a key that
 * DISAPPEARS is the most important signal there is — it means a declaration was removed
 * and the element silently fell back to an inherited or earlier-tier value. That is
 * exactly the regression X10 shipped past a green gate. Removal is therefore a failure
 * here, never a skip.
 */

/**
 * @param {object} baseline snapshot
 * @param {object} current  snapshot
 * @returns {object} structured diff
 */
/**
 * Largest length difference treated as measurement noise rather than a change, in px.
 *
 * E19 made `font-display: optional` deliberate: the browser decides PER PAGE LOAD whether to
 * keep the metric-matched fallback or swap to the real face, and the two differ by 0.01-0.16px
 * on anything a text metric influences. That was accepted knowingly, to kill the font-swap CLS
 * spike. The consequence is that exact string comparison of computed lengths cannot be stable,
 * for an open-ended set of selectors -- O3c is one instance (an image 0.12px taller, roughly
 * once per 80 targets) and O3b/O3d were others.
 *
 * 0.25px is chosen to sit above the documented 0.16px ceiling and far below anything a person
 * or a CLS score can register: a quarter pixel on a 1280px viewport is 0.02% of the width, and
 * CLS needs real movement of real content. Per-selector exclusions were the alternative and are
 * strictly worse -- they are whack-a-mole against a cause that can touch any text-sized
 * dimension, and each one blinds a property completely rather than just below the noise floor.
 *
 * @since 2.3.14
 */
const SUB_PIXEL_TOLERANCE_PX = 0.25;

/** Every component of a value, when it is purely a px-length list (`0px`, `1px 2px`). */
function pxComponents(value) {
  if (typeof value !== 'string' || value === '') return null;
  const parts = value.trim().split(/\s+/);
  const out = [];
  for (const part of parts) {
    const m = /^(-?\d*\.?\d+)px$/.exec(part);
    if (!m) return null;
    out.push(parseFloat(m[1]));
  }
  return out;
}

/**
 * Whether two computed values differ only by sub-pixel measurement noise.
 *
 * Deliberately conservative in three ways:
 *   - both sides must be pure px-length lists of the same arity; anything else (keywords,
 *     colours, `calc()`, mixed units) falls through to exact comparison as before;
 *   - a component crossing to or from exactly `0` is always reported, so a property being
 *     turned on or off never hides inside the tolerance;
 *   - the threshold applies per component, not to their sum.
 *
 * @param  {string} a Baseline value.
 * @param  {string} b Current value.
 * @return {boolean}
 */
function withinSubPixelNoise(a, b) {
  const pa = pxComponents(a);
  const pb = pxComponents(b);
  if (!pa || !pb || pa.length !== pb.length) return false;

  for (let i = 0; i < pa.length; i += 1) {
    // Zero is a state, not a measurement: 0px -> 0.2px means a rule started applying.
    if ((pa[i] === 0) !== (pb[i] === 0)) return false;
    if (Math.abs(pa[i] - pb[i]) > SUB_PIXEL_TOLERANCE_PX) return false;
  }

  return true;
}

/**
 * Element-SHAPE changes: the same element in the same place, rendered as a different tag.
 *
 * A distinct failure class, and it reads identically to an ordinary diff without this. One run
 * reported `changed 0, added 20, removed 20` across 83 targets because a nav's list and its items
 * had become `div`s: every descendant path was re-keyed, so the differ saw 20 elements vanish and
 * 20 appear, with **zero** property values changed. Nothing in the report said "these are the same
 * elements wearing different tags", which is the one sentence that would have aimed the
 * investigation correctly instead of at the styles.
 *
 * Paired by normalising every tag out of the path while keeping the `:nth-of-type` indices, then
 * requiring the class list to match too. Both conditions matter: the path alone would pair
 * unrelated siblings that happen to sit at the same index, and the classes alone would pair
 * repeated components anywhere in the document.
 *
 * Reported, never excused: a tag change is a real markup change — it alters semantics, what CSS
 * element selectors match, and what assistive technology announces. This only names it.
 *
 * @since  2.3.14
 * @param  string[] removedKeys Paths present in the baseline only.
 * @param  string[] addedKeys   Paths present in the current snapshot only.
 * @param  object   bEls        Baseline elements by path.
 * @param  object   cEls        Current elements by path.
 * @return Array<{from: string, to: string, tagFrom: string, tagTo: string, classes: string}>
 */
function tagChanges(removedKeys, addedKeys, bEls, cEls) {
  // `div:nth-of-type(2)` -> `*:nth-of-type(2)`; `ul` -> `*`.
  const shape = (path) => path.split('>').map((seg) => seg.replace(/^[a-zA-Z][\w-]*/, '*')).join('>');

  const byShape = new Map();
  for (const key of addedKeys) {
    const k = `${shape(key)}|${cEls[key].classes || ''}`;
    if (!byShape.has(k)) byShape.set(k, []);
    byShape.get(k).push(key);
  }

  const out = [];
  for (const key of removedKeys) {
    const k = `${shape(key)}|${bEls[key].classes || ''}`;
    const candidates = byShape.get(k);
    if (!candidates || candidates.length === 0) continue;
    const match = candidates.shift();
    if (bEls[key].tag === cEls[match].tag) continue; // same tag: a move, not a shape change
    out.push({
      from: key,
      to: match,
      tagFrom: bEls[key].tag,
      tagTo: cEls[match].tag,
      classes: cEls[match].classes || '',
    });
  }

  return out;
}

function diffSnapshots(baseline, current) {
  const bEls = baseline.elements || {};
  const cEls = current.elements || {};
  const bKeys = new Set(Object.keys(bEls));
  const cKeys = new Set(Object.keys(cEls));

  const removed = [...bKeys].filter((k) => !cKeys.has(k));
  const added = [...cKeys].filter((k) => !bKeys.has(k));
  const shapeChanges = tagChanges(removed, added, bEls, cEls);
  const shared = [...bKeys].filter((k) => cKeys.has(k));

  /** property -> [{ key, tag, classes, from, to }] */
  const byProperty = {};
  let changedValueCount = 0;
  const changedElements = new Set();

  for (const key of shared) {
    const bS = bEls[key].styles || {};
    const cS = cEls[key].styles || {};
    for (const prop of Object.keys(bS)) {
      if (!(prop in cS)) continue;
      if (bS[prop] === cS[prop]) continue;
      if (withinSubPixelNoise(bS[prop], cS[prop])) continue;
      (byProperty[prop] = byProperty[prop] || []).push({
        key,
        tag: cEls[key].tag,
        classes: cEls[key].classes,
        from: bS[prop],
        to: cS[prop],
      });
      changedValueCount++;
      changedElements.add(key);
    }
  }

  // --- custom properties (T12) ---------------------------------------------------
  // Three outcomes per variable, all of them reportable: value changed, declaration
  // gone (fell back to inherited), declaration appeared.
  const varsByProperty = {};   // name -> [{ key, tag, classes, from, to, kind }]
  let varsChanged = 0;
  let varsRemoved = 0;
  let varsAdded = 0;
  for (const key of shared) {
    const bV = bEls[key].vars || {};
    const cV = cEls[key].vars || {};
    const seen = new Set([...Object.keys(bV), ...Object.keys(cV)]);
    for (const name of seen) {
      const from = bV[name];
      const to = cV[name];
      if (from === to) continue;
      let kind = 'changed';
      if (from === undefined) { kind = 'added'; varsAdded++; }
      else if (to === undefined) { kind = 'removed'; varsRemoved++; }
      else { varsChanged++; }
      (varsByProperty[name] = varsByProperty[name] || []).push({
        key, tag: cEls[key].tag, classes: cEls[key].classes, from, to, kind,
      });
    }
  }

  const bRoot = baseline.rootVars || {};
  const cRoot = current.rootVars || {};
  const rootNames = new Set([...Object.keys(bRoot), ...Object.keys(cRoot)]);
  const rootVarDiff = [];
  for (const name of rootNames) {
    const from = bRoot[name];
    const to = cRoot[name];
    if (from === to) continue;
    rootVarDiff.push({
      name, from, to,
      kind: from === undefined ? 'added' : (to === undefined ? 'removed' : 'changed'),
    });
  }
  rootVarDiff.sort((a, b) => a.name.localeCompare(b.name));

  // Properties present in one snapshot but not the other — i.e. the property set
  // itself changed, which invalidates comparison rather than indicating a regression.
  const bProps = new Set(Object.values(bEls)[0] ? Object.keys(Object.values(bEls)[0].styles) : []);
  const cProps = new Set(Object.values(cEls)[0] ? Object.keys(Object.values(cEls)[0].styles) : []);
  const propsAdded = [...cProps].filter((p) => !bProps.has(p));
  const propsRemoved = [...bProps].filter((p) => !cProps.has(p));

  return {
    url: current.url,
    viewport: current.viewport,
    clean: removed.length === 0 && added.length === 0 && changedValueCount === 0
      && propsAdded.length === 0 && propsRemoved.length === 0
      && rootVarDiff.length === 0 && Object.keys(varsByProperty).length === 0,
    counts: {
      baselineElements: bKeys.size,
      currentElements: cKeys.size,
      elementsRemoved: removed.length,
      elementsAdded: added.length,
      elementsChanged: changedElements.size,
      valuesChanged: changedValueCount,
      propertiesAffected: Object.keys(byProperty).length,
      rootVarsAffected: rootVarDiff.length,
      varsChanged,
      varsRemoved,
      varsAdded,
      varPropertiesAffected: Object.keys(varsByProperty).length,
      tagChanges: shapeChanges.length,
    },
    propertySetChanged: { added: propsAdded, removed: propsRemoved },
    tagChanges: shapeChanges,
    removed: removed.map((k) => ({ key: k, tag: bEls[k].tag, classes: bEls[k].classes })),
    added: added.map((k) => ({ key: k, tag: cEls[k].tag, classes: cEls[k].classes })),
    byProperty,
    rootVarDiff,
    varsByProperty,
  };
}

/**
 * Human-readable report. `limit` caps the per-property element list so one broad
 * change cannot produce thousands of lines.
 */
function formatDiff(d, { limit = 6 } = {}) {
  const L = [];
  const label = `${d.url}${d.viewport ? `  [${d.viewport.width}x${d.viewport.height}]` : ''}`;

  if (d.clean) return `CLEAN  ${label}  (${d.counts.currentElements} elements)`;

  L.push(`CHANGED  ${label}`);
  const c = d.counts;
  L.push(`  elements: ${c.baselineElements} -> ${c.currentElements}`
    + `   changed ${c.elementsChanged}, added ${c.elementsAdded}, removed ${c.elementsRemoved}`);
  L.push(`  ${c.valuesChanged} value(s) across ${c.propertiesAffected} propert${c.propertiesAffected === 1 ? 'y' : 'ies'}`);
  if (c.rootVarsAffected || c.varPropertiesAffected) {
    L.push(`  custom properties: ${c.rootVarsAffected} at :root`
      + `, ${c.varsChanged} changed / ${c.varsRemoved} removed / ${c.varsAdded} added on elements`);
  }

  // Element-shape changes first, and labelled: they present as a pile of added/removed
  // elements with no value changes, which reads like an ordinary diff and sends the reader
  // looking at styles. Naming the class is the whole point of reporting it separately.
  if (d.tagChanges && d.tagChanges.length) {
    L.push('');
    L.push(`  ELEMENT SHAPE CHANGED — ${d.tagChanges.length} element(s) are in the same place with`
      + ' the same classes but a different tag. This is a markup change, not a style change: it'
      + ' alters semantics, which element selectors match, and what assistive technology'
      + ' announces. Every descendant path is re-keyed, which is why they also appear in the'
      + ' added/removed lists below.');
    for (const t of d.tagChanges.slice(0, 10)) {
      L.push(`      <${t.tagFrom}> -> <${t.tagTo}>   ${t.classes || '(no classes)'}`);
      L.push(`          ${t.from}`);
    }
    if (d.tagChanges.length > 10) {
      L.push(`      ... and ${d.tagChanges.length - 10} more`);
    }
  }

  // :root first — it is the palette, so a change here is usually the cause and the
  // per-element diffs below are its symptoms.
  if (d.rootVarDiff.length) {
    L.push('');
    L.push(`  :root custom properties (${d.rootVarDiff.length}) — the theme's token layer:`);
    for (const v of d.rootVarDiff.slice(0, limit * 4)) {
      if (v.kind === 'removed') {
        L.push(`    ${v.name}  REMOVED  (was ${JSON.stringify(v.from)})`);
      } else if (v.kind === 'added') {
        L.push(`    ${v.name}  ADDED  (${JSON.stringify(v.to)})`);
      } else {
        L.push(`    ${v.name}`);
        L.push(`        ${JSON.stringify(v.from)}  ->  ${JSON.stringify(v.to)}`);
      }
    }
    if (d.rootVarDiff.length > limit * 4) {
      L.push(`    ... and ${d.rootVarDiff.length - limit * 4} more`);
    }
  }

  const vprops = Object.entries(d.varsByProperty).sort((a, b) => b[1].length - a[1].length);
  if (vprops.length) {
    L.push('');
    L.push('  element custom properties (most affected first):');
    L.push('    NOTE a REMOVED declaration means the element fell back to an inherited or');
    L.push('    earlier-tier value. That is silent in rendering until the state that reads it');
    L.push('    occurs — :focus and :active values never appear in a computed-style capture.');
    for (const [name, hits] of vprops) {
      const nRemoved = hits.filter((h) => h.kind === 'removed').length;
      L.push(`    ${name}  —  ${hits.length} element(s)${nRemoved ? `, ${nRemoved} REMOVED` : ''}`);
      for (const h of hits.slice(0, limit)) {
        const who = h.classes ? `.${h.classes.split(' ').join('.')}` : h.tag;
        if (h.kind === 'removed') {
          L.push(`        ${who}   REMOVED  (was ${JSON.stringify(h.from)})`);
        } else if (h.kind === 'added') {
          L.push(`        ${who}   ADDED  (${JSON.stringify(h.to)})`);
        } else {
          L.push(`        ${who}`);
          L.push(`          ${JSON.stringify(h.from)}  ->  ${JSON.stringify(h.to)}`);
        }
      }
      if (hits.length > limit) L.push(`        ... and ${hits.length - limit} more`);
    }
  }

  if (d.propertySetChanged.added.length || d.propertySetChanged.removed.length) {
    L.push('');
    L.push('  !! THE PROPERTY SET ITSELF CHANGED — this diff is not a regression signal.');
    if (d.propertySetChanged.added.length) L.push(`     added:   ${d.propertySetChanged.added.join(', ')}`);
    if (d.propertySetChanged.removed.length) L.push(`     removed: ${d.propertySetChanged.removed.join(', ')}`);
    L.push('     Re-baseline deliberately rather than reading the rest of this report.');
  }

  const props = Object.entries(d.byProperty).sort((a, b) => b[1].length - a[1].length);
  if (props.length) {
    L.push('');
    L.push('  by property (most affected first):');
    for (const [prop, hits] of props) {
      L.push(`    ${prop}  —  ${hits.length} element(s)`);
      for (const h of hits.slice(0, limit)) {
        const who = h.classes ? `.${h.classes.split(' ').join('.')}` : h.tag;
        L.push(`        ${who}`);
        L.push(`          ${JSON.stringify(h.from)}  ->  ${JSON.stringify(h.to)}`);
      }
      if (hits.length > limit) L.push(`        ... and ${hits.length - limit} more`);
    }
  }

  const listSome = (title, arr) => {
    if (!arr.length) return;
    L.push('');
    L.push(`  ${title} (${arr.length}):`);
    for (const e of arr.slice(0, limit)) {
      L.push(`    ${e.classes ? `.${e.classes.split(' ').join('.')}` : e.tag}   ${e.key}`);
    }
    if (arr.length > limit) L.push(`    ... and ${arr.length - limit} more`);
  };
  listSome('elements removed', d.removed);
  listSome('elements added', d.added);

  return L.join('\n');
}

module.exports = { diffSnapshots, formatDiff };
