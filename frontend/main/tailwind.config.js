/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#092b44',
        secondary: '#165072',
        accent: '#256e91',
        lightAccent: '#6e9eac',
        neutral: '#9e9d8a',
        dark: '#373f3f',
        light: '#1e4c61'
      }
    },
  },
  plugins: [],
}