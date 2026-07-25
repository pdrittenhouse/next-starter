/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import path, { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ESM modules can evaluate before Next.js injects .env files into process.env.
// In production, env vars are real process vars so this block is a no-op.
// In dev, we read .env.local directly to ensure vars are available for config.
const envLocalPath = join(__dirname, '.env.local');
if (existsSync(envLocalPath)) {
  for (const line of readFileSync(envLocalPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^(['"`])([\s\S]*)\1$/, '$2');
    }
  }
}

// Derive the WordPress hostname for Next.js image optimization.
// Falls back to 'localhost' if the env var is missing or malformed.
let wpHostname = 'localhost';
try {
  const wpUrl = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL?.replace(/\/graphql$/, '');
  if (wpUrl) wpHostname = new URL(wpUrl).hostname;
} catch {
  // keep 'localhost' fallback
}

const nextConfig = {
    sassOptions: {
        // loadPaths is the Dart Sass / Turbopack key; includePaths was webpack/node-sass.
        // Both are kept so the config works if webpack mode is ever used.
        loadPaths: [path.join(__dirname, 'src', 'scss'), path.join(__dirname, 'node_modules')],
        includePaths: [path.join(__dirname, 'src', 'scss'), path.join(__dirname, 'node_modules')],
        additionalData: '@use "variables" as *;\n',
        silenceDeprecations: ['legacy-js-api', 'global-builtin', 'import', 'if-function', 'color-functions'],
    },
    images: {
        remotePatterns: [
            { protocol: 'http',  hostname: wpHostname, pathname: '/**' },
            { protocol: 'https', hostname: wpHostname, pathname: '/**' },
        ],
        // Local dev WP sites resolve to loopback IPs. This flag is gated on
        // dev so it never opens SSRF risk in production where WP is on a real
        // public IP.
        dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    },
};

export default nextConfig;
