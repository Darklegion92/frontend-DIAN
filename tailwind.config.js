/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soltec: {
          50: '#fef7ed',
          100: '#feecd4',
          200: '#fdd8a8',
          300: '#fcb971',
          400: '#f99638',
          500: '#f67615',
          600: '#e75c0b',
          700: '#c0460c',
          800: '#983912',
          900: '#7b3012',
          950: '#431607',
          primary: '#f67615',
          secondary: '#fcb971',
          accent: '#e75c0b',
          light: '#feecd4',
          dark: '#7b3012',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soltec': '0 10px 25px -3px rgba(246, 118, 21, 0.1), 0 4px 6px -2px rgba(246, 118, 21, 0.05)',
        'soltec-lg': '0 25px 50px -12px rgba(246, 118, 21, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 