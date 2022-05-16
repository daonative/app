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
        "daonative-primary-purple": "rgb(176 130 255)",
        "daonative-component-bg": "#222235",
        'daonative-modal-border': "rgba(49, 49, 74, 0.4)",
      },
      dropShadow: {
        'daonative': '0px 0px 5px rgba(160, 163, 189, 0.1)',
      },
      boxShadow: {
        'daonative-blue': '0px 0px 15px rgba(47, 73, 209, 0.6)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'slide-in': 'slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)',
        enter: 'enter 200ms ease-out',
        leave: 'leave 150ms ease-in forwards',
      },
      keyframes: {
        enter: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        leave: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '100%': { transform: 'scale(0.9)', opacity: 0 },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        space: ['"Space Grotesk"']

      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
}
