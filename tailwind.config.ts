import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        steel: '#e2e8f0',
        mist: '#f8fafc',
        signal: '#0f766e',
        warning: '#d97706',
        danger: '#dc2626',
        panel: '#f8fafc',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Segoe UI"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 18px 45px -28px rgba(15, 23, 42, 0.45)',
      },
      keyframes: {
        pulseLine: {
          '0%, 100%': { opacity: '0.35', transform: 'scaleX(0.96)' },
          '50%': { opacity: '1', transform: 'scaleX(1)' },
        },
        highlight: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(15, 118, 110, 0.18)' },
          '50%': { boxShadow: '0 0 0 10px rgba(15, 118, 110, 0)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
      },
      animation: {
        pulseLine: 'pulseLine 1.4s ease-in-out infinite',
        highlight: 'highlight 1.5s ease-out infinite',
        sweep: 'sweep 1.8s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;

