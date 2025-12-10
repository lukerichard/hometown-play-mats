/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ToyMaps custom colors (from CLAUDE.md)
        'grass': '#4CAF50',
        'road': '#333333',
        'centerline': '#FFEB3B',
        // New toy-themed colors
        'toy-grass': '#70D058',
        'toy-road': '#2D3436',
        'toy-stripe': '#FFEAA7',
        'toy-water': '#74B9FF',
        'toy-accent': '#FF7675',
      },
    },
  },
  plugins: [],
}
