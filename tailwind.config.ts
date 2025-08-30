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
