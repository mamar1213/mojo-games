/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mojo: {
          900: '#081c15',
          800: '#1b4332',
          700: '#2d6a4f',
          600: '#40916c',
          500: '#52b788',
          400: '#74c69d',
          300: '#95d5b2',
          200: '#b7e4c7',
          100: '#d8f3dc',
        },
        danger: '#e63946',
        gold: '#FFD700',
        silver: '#C0C0C0',
        bronze: '#CD7F32',
        warning: '#ffd166',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    }
  },
  plugins: []
}
