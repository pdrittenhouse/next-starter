/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import path from "path";
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
            // WordPress media — supports both http (local) and https (production).
            { protocol: 'http',  hostname: wpHostname, port: '', pathname: '/**' },
            { protocol: 'https', hostname: wpHostname, port: '', pathname: '/**' },
        ],
    },
};

export default nextConfig;
