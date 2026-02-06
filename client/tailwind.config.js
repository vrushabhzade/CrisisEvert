/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                crisis: {
                    bg: '#0a0a0f', // Deep dark blue/black
                    panel: '#151520', // Slightly lighter panel
                    accent: '#00f7ff', // Cyan for "Oracle" feel
                    alert: '#ff2a6d', // High contrast red/pink
                    warning: '#ffc107',
                    success: '#05d5aa'
                }
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'monospace'], // Tech feel
                sans: ['Inter', 'sans-serif']
            }
        },
    },
    plugins: [],
}
