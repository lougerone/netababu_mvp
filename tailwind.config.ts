import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      container: { center: true, padding: '1rem' },
      colors: {
        brand: {
          50: '#f5f8ff',
          100: '#eaf0ff',
          200: '#cddbff',
          300: '#a8c0ff',
          400: '#6f95ff',
          500: '#3d6aff',
          600: '#2149db',
          700: '#1b3aae',
          800: '#182f8a',
          900: '#172a70'
        }
      }
    }
  },
  plugins: []
};

export default config;

extend: {
  colors: {
    brand: {
      50:  '#E8F4F8',
      100: '#CBE7F1',
      200: '#9BD0E3',
      300: '#6EB8D4',
      400: '#3F9EC4',
      500: '#0F7DA6',   // Peacock Blue (primary)
      600: '#0D6B8F',
      700: '#0B5977',
      800: '#09485F',
      900: '#07384A'
    },
    saffron: {
      400: '#FF9E54',
      500: '#FF8A2A',  // Saffron (accent-2)
      600: '#E2711B'
    }
  },
  fontFamily: {
    display: ['Inter', 'ui-sans-serif', 'system-ui'],
    devanagari: ['"Noto Sans Devanagari"', 'Inter', 'sans-serif']
  },
  boxShadow: {
    'card': '0 1px 0 0 rgba(255,255,255,0.06), 0 8px 24px -20px rgba(0,0,0,0.6)'
  }
}
