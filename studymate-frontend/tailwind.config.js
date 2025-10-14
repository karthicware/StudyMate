/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fce8f3',
          100: '#f7c4dc',
          200: '#f093c1',
          300: '#e862a5',
          400: '#e13885',
          500: '#da0d64',  // Base Primary Color
          600: '#c20b5a',
          700: '#a9094f',
          800: '#910844',
          900: '#780639',
        },
        success: {
          50: '#e6f7f6',
          100: '#b3e8e5',
          200: '#80d9d3',
          300: '#4dcac1',
          400: '#26bcb3',
          500: '#00a699',  // Airbnb Teal
          600: '#008f84',
          700: '#00786f',
          800: '#00615a',
          900: '#004a45',
        },
        warning: {
          50: '#fff8e6',
          100: '#ffecb3',
          200: '#ffe080',
          300: '#ffd44d',
          400: '#ffcb26',
          500: '#ffb400',  // Amber
          600: '#e6a200',
          700: '#cc9000',
          800: '#b37e00',
          900: '#996c00',
        },
        danger: {
          50: '#fce7ed',
          100: '#f7c2d1',
          200: '#f19ab5',
          300: '#eb7299',
          400: '#e74a7d',
          500: '#e31c5f',  // Deep Pink
          600: '#ca1855',
          700: '#b1154b',
          800: '#981141',
          900: '#7f0e37',
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      fontFamily: {
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
