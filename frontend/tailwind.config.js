/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        orange: {
          400: '#FB923C',
          500: '#F97316'
        }
      },
      borderRadius: {
        'xl': '12px'
      }
    },
  },
  plugins: [],
}\n