/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0b1220',
        panel: '#111827',
        panel2: '#161f33',
        accent: {
          DEFAULT: '#6366f1',
          light: '#8b8ff7',
          dark: '#4f46e5',
        },
        success: '#10b981',
        danger: '#ef4444',
        warn: '#f59e0b',
        dim: '#94a3b8',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,102,241,0.3), 0 8px 30px -8px rgba(99,102,241,0.35)',
      },
    },
  },
  plugins: [],
}
