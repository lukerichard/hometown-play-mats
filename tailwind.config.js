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
      },
    },
  },
  plugins: [],
}
