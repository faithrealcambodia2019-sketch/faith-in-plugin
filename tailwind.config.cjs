/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/app/**/*.{js,ts,jsx,tsx}",
    "./public/assets/js/faith-in-app.js",
    "./public/assets/js/faith-in-backend.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
      },
      colors: {
        brand: {
          vault: "#1FA88A",
          dark: "#15202B",
          bgStart: "#EAF8F4",
          bgEnd: "#F5FCF9",
        },
      },
    },
  },
  plugins: [],
};
