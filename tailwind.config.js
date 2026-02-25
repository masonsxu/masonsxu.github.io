/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans SC', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        obsidian: '#0C0C0E',
        pearl: '#FCFCFC',
        gold: '#D4AF37',
        midnightIndigo: '#1E1B4B',
        zincMuted: '#A1A1AA',
        bg: '#0C0C0E',
        surface: '#121214',
        surfaceLight: '#1E1E21',
        primary: '#D4AF37',
        accent: '#F2D288',
        text: '#FCFCFC',
        muted: '#A1A1AA',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 90deg at 50% 50%, #00000000 50%, #0C0C0E 100%), radial-gradient(rgba(212,175,55,0.1) 0%, transparent 50%)',
      },
      animation: {
        'shimmer': 'shimmer 3s infinite linear',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
