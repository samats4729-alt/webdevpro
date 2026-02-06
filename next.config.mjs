/** @type {import('next').NextConfig} */
const nextConfig = {
    // Exclude heavy packages from bundling - they will be loaded from node_modules at runtime
    experimental: {
        instrumentationHook: true,
        serverComponentsExternalPackages: [
            'whatsapp-web.js',
            'puppeteer',
            'puppeteer-core',
            'qrcode-terminal',
            '@whiskeysockets/baileys', // Added Baileys
            'pino'
        ]
    },
    webpack: (config, { dev, isServer }) => {
        // Ignore optional dependencies of Baileys
        config.externals.push({
            'sharp': 'commonjs sharp',
            'jimp': 'commonjs jimp',
        });

        // Prevent bundling issues
        config.resolve.alias = {
            ...config.resolve.alias,
            'sharp': false,
            'jimp': false
        };

        if (dev) {
            config.watchOptions = {
                ignored: ['**/.wwebjs_auth/**', '**/baileys_auth_info/**'],
            };
        }
        return config;
    },
};

export default nextConfig;
