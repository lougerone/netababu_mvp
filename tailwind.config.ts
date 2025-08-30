import type { Config } from 'tailwindcss';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#FF9A3A', // lighter brand color
          500: '#FF8A2A', // main brand color (matching your gradient)
        }
      }
    },
  },
  plugins: [],
}

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


