/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        devops: {
          bg: '#0a0d14',
          card: '#111726',
          panel: '#161f33',
          border: '#1f2d47',
          hover: '#243452',
          text: '#f1f5f9',
          muted: '#94a3b8'
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1'
        },
        status: {
          success: '#10b981',
          running: '#3b82f6',
          failed: '#ef4444',
          pending: '#f59e0b',
          cancelled: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite'
      }
    },
  },
  plugins: [],
}
