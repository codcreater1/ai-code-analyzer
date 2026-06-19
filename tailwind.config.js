export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: {
        premium: '0 24px 80px rgba(15, 23, 42, 0.22)',
        glow: '0 0 35px rgba(99, 102, 241, 0.28)'
      },
      animation: {
        float: 'float 7s ease-in-out infinite'
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } }
      }
    }
  },
  plugins: []
};
