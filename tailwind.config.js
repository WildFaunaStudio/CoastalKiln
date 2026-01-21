/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary backgrounds
        cream: '#F5F1E8',

        // Feature card backgrounds
        card: {
          pieces: '#C4A77D',
          glaze: '#7DD3C4',
          reclaim: '#B8D4B8',
          guilds: '#D4B8B8',
          kiln: '#D4C4A8',
          tips: '#A8C4D4',
        },

        // Text colors
        text: {
          primary: '#2D2A26',
          secondary: '#8B7355',
          muted: '#6B6560',
        },

        // Accent
        accent: {
          DEFAULT: '#D4A574',
          hover: '#C49464',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}