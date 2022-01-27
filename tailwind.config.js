module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "daonative-dark-100": "#222235",
        "daonative-dark-200": "#161624",
        "daonative-dark-300": "#10101C",
        "daonative-gray-100": "#F5EFFF",
        "daonative-gray-200": "#D6D7E3",
        "daonative-gray-300": "#B9B9B9",
        "daonative-gray-400": "#70708A",
        "daonative-gray-900": "#40405F"
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
