/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        red: {
          50: '#fbf4f5',
          100: '#f7e9eb',
          200: '#eccad0',
          300: '#dfa2ab',
          400: '#ce6e7c',
          500: '#c04a5a',
          600: '#b23a48', // Primary
          700: '#942f3a',
          800: '#7a2932',
          900: '#65252c',
        },
        blue: {
          500: '#4A90E2', // Accent
          600: '#387bca',
        },
        gray: {
          50: '#F5F5F5', // Secondary
        }
      }
    },
  },
  plugins: [],
}
