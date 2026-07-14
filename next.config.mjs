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
        includePaths: [path.join(__dirname, 'scss')],
        prependData: "@import '/src/scss/variables.scss';",
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
