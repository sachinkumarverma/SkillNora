/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: { 50: '#f5f7ff', 100: '#e6eeff', 500: '#6366f1' }
            },
            keyframes: {
                shimmer: {
                    '100%': { transform: 'translateX(100%)' }
                }
            },
            animation: {
                shimmer: 'shimmer 1.5s infinite'
            }
        }
    },
    plugins: []
}
