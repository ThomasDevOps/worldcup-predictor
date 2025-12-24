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
    },
  },
  plugins: [],
}
