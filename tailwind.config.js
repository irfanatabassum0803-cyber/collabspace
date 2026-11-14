/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#F7F5EF', // Warm ivory requested
          100: '#F0ECE3',
          200: '#E7E5DC', // Soft borders requested
          300: '#DDD8CB',
          400: '#CBC4B4',
        },
        olive: {
          deep: '#343D2D', // Deep olive requested
          950: '#232A1E',
          900: '#2C3426',
          850: '#343D2D', // Deep olive
          800: '#3D4835',
          700: '#4A5741',
          600: '#5A6A50',
          500: '#728467',
          sage: '#A5AE91', // Muted sage requested
          300: '#A5AE91',
          200: '#C7CEB8',
          100: '#E5E9DE',
          50: '#F3F5F0',
        },
        charcoal: {
          950: '#1A1C16',
          900: '#252720', // Charcoal requested
          800: '#34372D',
          700: '#494C40',
          600: '#64685A',
          500: '#848879',
          400: '#A3A698',
          300: '#C5C7BB',
          200: '#E7E5DC', // Soft borders
          100: '#EFEFEA',
          50: '#F6F6F2',
        },
        sage: {
          DEFAULT: '#A5AE91',
          500: '#A5AE91',
          400: '#B6BEA4',
          300: '#CCD3BE',
          200: '#DEE3D4',
          100: '#EEF1E9',
        },
        paper: '#FFFFFF',
      },
      fontFamily: {
        serif: ['"Newsreader"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'paper': '0 1px 3px rgba(37, 39, 32, 0.04), 0 10px 32px -4px rgba(37, 39, 32, 0.06)',
        'paper-lg': '0 2px 6px rgba(37, 39, 32, 0.04), 0 20px 48px -6px rgba(37, 39, 32, 0.08)',
        'subtle': '0 1px 2px rgba(37, 39, 32, 0.05)',
        'floating': '0 16px 40px -8px rgba(37, 39, 32, 0.12), 0 4px 12px rgba(37, 39, 32, 0.04)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
