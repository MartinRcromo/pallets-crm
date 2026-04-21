/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        serif: ['"IBM Plex Serif"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        paper: '#FAFAF7',
        ink: '#1A1817',
        rust: {
          50: '#FBF3F0',
          100: '#F5E0D9',
          200: '#EAB5A5',
          300: '#DC8A72',
          400: '#C96444',
          500: '#B8391A',
          600: '#932E15',
          700: '#6E2310',
          800: '#49170B',
          900: '#240C05',
        },
      },
      boxShadow: {
        paper: '0 1px 0 rgba(26,24,23,0.04), 0 2px 8px -4px rgba(26,24,23,0.08)',
        card: '0 1px 2px rgba(26,24,23,0.04), 0 4px 16px -8px rgba(26,24,23,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
