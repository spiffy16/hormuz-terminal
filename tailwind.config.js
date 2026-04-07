/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        terminal: {
          bg: '#05070a',
          panel: '#0a0f17',
          border: '#1a2332',
          dim: '#3a4a5f',
          text: '#c8d4e3',
          accent: '#00ff9d',
          amber: '#ffb020',
          red: '#ff3b47',
          blue: '#4fc3f7',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'blink': 'blink 1s step-end infinite',
        'pulse-red': 'pulseRed 1s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.97 },
        },
        blink: {
          '0%, 50%': { opacity: 1 },
          '50.01%, 100%': { opacity: 0 },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 59, 71, 0.7)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(255, 59, 71, 0.3)' },
        },
      },
    },
  },
  plugins: [],
};
