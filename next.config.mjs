/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import path from "path";
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
    sassOptions: {
        includePaths: [path.join(__dirname, 'scss')],
        prependData: "@import '/src/scss/variables.scss';",
    },
};

export default nextConfig;
