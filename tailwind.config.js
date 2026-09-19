/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        festival: {
          marigold: '#F59E0B',
          saffron: '#EA580C',
          crimson: '#BE123C',
          vermilion: '#E11D48',
          gold: '#FBBF24',
          amberGlow: '#FDE68A',
          plum: '#2A0845',
          deepNight: '#0E021C',
          sanctum: '#18042B',
          cardBg: '#1F0A38',
          cardBorder: '#6B21A8',
          emerald: '#059669',
          lotus: '#FB7185',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        festive: ['Cinzel Decorative', 'Georgia', 'serif'],
        shloka: ['Rozha One', 'Cinzel Decorative', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(245, 158, 11, 0.45)',
        'gold-glow-lg': '0 0 40px rgba(251, 191, 36, 0.65)',
        'crimson-glow': '0 0 25px rgba(190, 18, 60, 0.4)',
        '3d-gold': '0 5px 0 #B45309, 0 10px 20px rgba(0,0,0,0.4)',
        '3d-gold-active': '0 2px 0 #B45309, 0 5px 10px rgba(0,0,0,0.4)',
        '3d-crimson': '0 5px 0 #881337, 0 10px 20px rgba(0,0,0,0.4)',
        '3d-crimson-active': '0 2px 0 #881337, 0 5px 10px rgba(0,0,0,0.4)',
        '3d-glass': '0 4px 0 rgba(245, 158, 11, 0.3), 0 8px 16px rgba(0,0,0,0.3)',
      },
      animation: {
        'diya-flicker': 'diyaFlicker 2s infinite alternate ease-in-out',
        'diya-float': 'diyaFloat 4s infinite ease-in-out',
        'float-slow': 'floatSlow 6s infinite ease-in-out',
        'float-sway': 'floatSway 7s infinite ease-in-out',
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'spin-slow': 'spin 18s linear infinite',
        'spin-reverse-slow': 'spinReverse 24s linear infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'shimmer-fast': 'shimmer 1.5s infinite linear',
        'modal-pop': 'modalPop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'modal-exit': 'modalExit 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'fadeIn': 'fadeIn 0.25s ease-out forwards',
        'fade-out': 'fadeOut 0.2s ease-in forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-up': 'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toast-in': 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toast-out': 'toastOut 0.25s ease-in forwards',
        'score-pop': 'scorePop 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-pulse': 'scalePulse 2s ease-in-out infinite',
      },
      keyframes: {
        diyaFlicker: {
          '0%, 100%': { transform: 'scale(1) rotate(-1deg)', opacity: '0.95', filter: 'drop-shadow(0 0 10px #F59E0B)' },
          '50%': { transform: 'scale(1.08) rotate(1.5deg)', opacity: '1', filter: 'drop-shadow(0 0 20px #FBBF24)' },
        },
        diyaFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(-1deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1.5deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(4deg)' },
        },
        floatSway: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(8px, -10px) rotate(3deg)' },
          '50%': { transform: 'translate(-6px, -18px) rotate(-2deg)' },
          '75%': { transform: 'translate(-10px, -8px) rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(0.98)' },
          '50%': { opacity: '0.95', transform: 'scale(1.02)' },
        },
        scalePulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
        spinReverse: {
          'from': { transform: 'rotate(360deg)' },
          'to': { transform: 'rotate(0deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        modalPop: {
          '0%': { opacity: '0', transform: 'scale(0.92) translateY(16px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        modalExit: {
          '0%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(0.94) translateY(12px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 24px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(-20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        toastOut: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-16px) scale(0.95)' },
        },
        scorePop: {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0.7)' },
          '40%': { opacity: '1', transform: 'translateY(-14px) scale(1.15)' },
          '100%': { opacity: '0', transform: 'translateY(-30px) scale(0.95)' },
        },
      }
    },
  },
  plugins: [],
}
