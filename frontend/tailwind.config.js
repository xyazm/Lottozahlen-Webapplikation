/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rubBlue: '#17365c',
        rubGreen: '#8DAE25', 
        lightGray: '#f5f5f5',
      },
      fontFamily: {
        heading: ['Arial', 'sans-serif'],
        body: ['Times New Roman', 'serif'],
      },
      fontSize: {
        s: '15px',
        m: '18px',
        l: '21px',
        xl: '24px',
        'h1': '33px',
        'h2': '26px',
      },
      lineHeight: {
        h1: '42px',
        h2: '42px',
        l: '30px',
      },
      letterSpacing: {
        wide: '0.02em', 
      },
      keyframes: {
        'fade-in-out': {
          '0%, 100%': { opacity: '0' },
          '10%, 90%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-out': 'fade-in-out 3s forwards',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

