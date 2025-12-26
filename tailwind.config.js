/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette from PRD
        background: '#0F172A',
        card: '#1E293B',
        primary: '#06B6D4',
        success: '#22C55E',
        warning: '#EAB308',
        live: '#EF4444',
        'text-primary': '#FFFFFF',
        'text-secondary': '#94A3B8',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
