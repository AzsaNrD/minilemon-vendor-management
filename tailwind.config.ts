import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        lemon: {
          50: '#FFFDF0',
          100: '#FFF9D6',
          200: '#FFF1A8',
          300: '#FFE76B',
          400: '#FFD93D',
          500: '#F5C518',
          600: '#D4A60E',
          700: '#A8810A',
        },
        ink: {
          50: '#F8F5EE',
          100: '#EFEAE0',
          200: '#E0D9CC',
          300: '#C4BCAE',
          400: '#9C9384',
          500: '#7A7163',
          600: '#5A5347',
          700: '#3F3A30',
          800: '#2C2820',
          900: '#1A1814',
        },
        cream: '#FAFAF5',
        leaf: {
          50: '#F2F8F3',
          100: '#E5F2E8',
          400: '#6BAA7A',
          500: '#3F8E4F',
          600: '#2F7340',
        },
        coral: {
          50: '#FDF1ED',
          100: '#FBE5E0',
          400: '#EC8975',
          500: '#E06650',
          600: '#C4503D',
        },
      },
      boxShadow: {
        soft: '0 1px 3px rgba(26,24,20,0.04), 0 4px 12px rgba(26,24,20,0.04)',
        card: '0 2px 4px rgba(26,24,20,0.03), 0 8px 24px rgba(26,24,20,0.06)',
        pop: '0 4px 8px rgba(26,24,20,0.06), 0 16px 40px rgba(26,24,20,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
