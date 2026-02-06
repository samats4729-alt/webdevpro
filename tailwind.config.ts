import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // New green accent palette (from reference)
                accent: {
                    DEFAULT: "#4ade80",
                    50: "#f0fdf4",
                    100: "#dcfce7",
                    200: "#bbf7d0",
                    300: "#86efac",
                    400: "#4ade80",
                    500: "#22c55e",
                    600: "#16a34a",
                    700: "#15803d",
                    800: "#166534",
                    900: "#14532d",
                },
                // Dark background palette
                dark: {
                    DEFAULT: "#0a0a0a",
                    50: "#141414",
                    100: "#1a1a1a",
                    200: "#1f1f1f",
                    300: "#262626",
                    400: "#2a2a2a",
                    500: "#333333",
                },
                // Card backgrounds
                card: {
                    DEFAULT: "#141414",
                    hover: "#1a1a1a",
                    border: "#262626",
                },
                // Platform colors
                whatsapp: "#25D366",
                telegram: "#0088cc",
                instagram: "#E4405F",
            },
            backdropBlur: {
                xs: "2px",
            },
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "glow": "glow 2s ease-in-out infinite alternate",
                "float": "float 6s ease-in-out infinite",
                "spin-slow": "spin 4s linear infinite",
            },
            keyframes: {
                glow: {
                    "0%": { boxShadow: "0 0 5px rgba(74, 222, 128, 0.3)" },
                    "100%": { boxShadow: "0 0 20px rgba(74, 222, 128, 0.5), 0 0 40px rgba(74, 222, 128, 0.2)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
            },
            boxShadow: {
                'glow-green': '0 0 40px rgba(74, 222, 128, 0.15)',
                'glow-green-lg': '0 0 80px rgba(74, 222, 128, 0.2)',
            },
        },
    },
    plugins: [],
};

export default config;
