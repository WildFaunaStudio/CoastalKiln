/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary background
        cream: '#F0EEE8',

        // Navigation button colors
        nav: {
          pieces: '#BC978A',
          glaze: '#6D72C3',
          reclaim: '#FF8C42',
          tips: '#4A5240',
          guilds: '#06A77D',
          discover: '#07C592',
        },

        // Card backgrounds (white for internal selections)
        card: {
          DEFAULT: '#FFFFFF',
          pieces: '#BC978A',
          glaze: '#6D72C3',
          reclaim: '#FF8C42',
          tips: '#4A5240',
          guilds: '#06A77D',
        },

        // Text colors
        text: {
          primary: '#2D2A26',
          secondary: '#5C5C5C',
          muted: '#8B8B8B',
        },

        // Accent (using guilds teal as primary accent)
        accent: {
          DEFAULT: '#06A77D',
          hover: '#059669',
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