/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0a0a0a',
        surface: '#141414',
        'surface-hover': '#1a1a1a',
        'card-bg': '#1a1a1e',
        'card-border': '#2d2d35',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
