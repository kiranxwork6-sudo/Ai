/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        gereply: {
          bg: '#080F0F',
          primary: '#00E676',
          secondary: '#00C56A',
          card: '#111919',
          cardBorder: '#1a2626',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#128C7E',
          teal: '#075E54',
          light: '#DCF8C6',
        }
      }
    },
  },
  plugins: [],
}
