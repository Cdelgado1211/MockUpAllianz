/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.12)',
        glow: '0 0 0 1px rgba(59, 130, 246, 0.18), 0 24px 60px rgba(37, 99, 235, 0.15)'
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at 1px 1px, rgba(96,165,250,0.18) 1px, transparent 0)',
        'hero-glow':
          'linear-gradient(135deg, rgba(14,165,233,0.18), rgba(37,99,235,0.06) 40%, rgba(15,23,42,0.02))'
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' }
        }
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.2s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
