
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#050505',
        surface: '#0F0F11',
        border: '#27272A',
        primary: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          dim: 'rgba(34, 211, 238, 0.1)'
        },
        secondary: {
          400: '#818cf8',
          500: '#6366f1',
        },
        warning: '#eab308',
        danger: '#ef4444',
        success: '#10b981'
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #1f1f1f 1px, transparent 1px), linear-gradient(to bottom, #1f1f1f 1px, transparent 1px)",
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 4s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
