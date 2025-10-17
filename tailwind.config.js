/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#197fe6",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
