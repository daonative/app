const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // use this for most borders
        "daonative-border": "rgba(49, 49, 74, 0.4)",
        "daonative-dark-100": "#222235",
        "daonative-dark-200": "#161624",
        "daonative-dark-300": "#10101C",
        // == DAOnative grey in figma
        "daonative-gray-100": "#F5EFFF",
        "daonative-gray-200": "#D6D7E3",
        "daonative-gray-300": "#B9B9B9",
        "daonative-gray-400": "#70708A",
        "daonative-gray-900": "#40405F",
        /* DAOnative primary blue */
        "daonative-primary-blue": "#214ADC"
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        space: ['"Space Grotesk"']

      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
