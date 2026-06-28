/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#D4A04A',
          light:   '#e8b458',
          dark:    '#c4903a',
        },
      },
    },
  },
  plugins: [],
}
