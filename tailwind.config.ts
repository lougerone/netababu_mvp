import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#FFFDF8',
          100: '#FFF9F0',
          200: '#FFF6E6', // page bg
          300: '#FFE9C7',
        },
        ink: {
          700: '#113A66', // headings
          600: '#214C7A',
          500: '#2C5D8F',
        },
        saffron: {
          400: '#FF9E54',
          500: '#FF8A2A',
          600: '#E2711B',
        },
        leaf: { 500: '#24A452' },
      },
      boxShadow: {
        card: '0 10px 24px -12px rgba(17, 58, 102, .18)',
        soft: '0 6px 16px -8px rgba(0,0,0,.12)',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '22px',
      },
    },
  },
  plugins: [],
};

export default config;
