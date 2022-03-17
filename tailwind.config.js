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
        "daonative-gray-100": "#F5EFFF",
        "daonative-gray-200": "#D6D7E3",
        "daonative-gray-300": "#B9B9B9",
        "daonative-gray-400": "#70708A",
        "daonative-gray-900": "#40405F",
        /* DAOnative primary blue new color format @hotkartoffel is currently
           updating figma to make it easier to implement
        */
        "daonative-primary-blue": "#214ADC",
        "daonative-white": "#F5EFFF",
        "daonative-placeholder": "rgba(214, 215, 227, 0.5)",
        "daonative-subtitle": "#B9B9B9",
        "daonative-text": "#D6D7E3",
        "daonative-primary-purple": "rgba(130, 72, 229, 1)",
      },
      dropShadow: {
        'daonative': '0px 0px 5px rgba(160, 163, 189, 0.1)',
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
