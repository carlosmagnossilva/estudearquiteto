/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hub-dark': '#00425C',
        'hub-navy': '#0A1A2A',
      }
    },
  },
  plugins: [],
}
