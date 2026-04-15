/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50:  '#f7f7f7',
          100: '#e8e8e8',
          200: '#c8c8c8',
          400: '#9a9a9a',
          500: '#6b6b6b',
          600: '#4a4a4a',
          700: '#2e2e2e',
          800: '#1a1a1a',
          900: '#0f0f0f',
        },
      },
    },
  },
  plugins: [],
};
