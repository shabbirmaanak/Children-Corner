/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        play: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#b45309',
        },
        calm: {
          light: '#e0e7ff',
          DEFAULT: '#6366f1',
          dark: '#4338ca',
        },
        focus: {
          light: '#dcfce7',
          DEFAULT: '#10b981',
          dark: '#047857',
        },
        storage: {
          light: '#ffedd5',
          DEFAULT: '#f97316',
          dark: '#c2410c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
