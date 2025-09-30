// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "g-indigo": {
          100: "#e0e7ff",
          600: "#5a21d0", // customize this hex to whatever you want
          700: "#4b1aa8",
        },
      },
    },
  },
  plugins: [],
}
