/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'rizo-pink': '#F72585',
                'rizo-purple': '#7209B7',
                'rizo-dark-blue': '#3A0CA3',
                'rizo-blue': '#4361EE',
                'rizo-cyan': '#4CC9F0',
                'brand-navy': '#0F172A',
                'brand-offwhite': '#F8F9FA',
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                '3xl': '32px',
                '4xl': '40px',
            },
            boxShadow: {
                'premium': '0 20px 50px rgba(0, 0, 0, 0.05)',
                'vibrant': '0 20px 50px rgba(67, 97, 238, 0.15)',
            }
        },
    },
    plugins: [],
}
