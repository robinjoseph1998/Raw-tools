import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-grotesk)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      colors: {
        space: {
          950: '#070b14',
          900: '#0c1019',
          800: '#111620',
          700: '#161c28',
          600: '#1c2330',
          500: '#242c3b',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'twinkle-slow': 'twinkle 6s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'status-pulse': 'statusPulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-left': 'slideInLeft 0.4s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        statusPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 24px rgba(34,211,238,0.2), 0 0 48px rgba(34,211,238,0.08)',
        'glow-purple': '0 0 24px rgba(168,85,247,0.2), 0 0 48px rgba(168,85,247,0.08)',
        'glow-blue': '0 0 24px rgba(96,165,250,0.2), 0 0 48px rgba(96,165,250,0.08)',
        'glow-pink': '0 0 24px rgba(244,114,182,0.18), 0 0 48px rgba(244,114,182,0.06)',
        'glow-cyan-lg': '0 0 40px rgba(34,211,238,0.25), 0 0 80px rgba(34,211,238,0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
