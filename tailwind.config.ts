// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.20), 0 2px 8px rgba(0,0,0,0.10)',
      },
      colors: {
        brand: {
          50:  '#f5f8ff',
          100: '#eaf0ff',
          200: '#cddbff',
          300: '#a8c0ff',
          400: '#6f95ff',
          500: '#3d6aff',
          600: '#2149db',
          700: '#1b3aae',
          800: '#182f8a',
          900: '#172a70',
        },
        // optional: keep your orange accents without colliding with the scale
        brandAlt: {
          400: '#FF9A3A',
          500: '#FF8A2A',
        },
      },
    },
  },
  plugins: [],
};

export default config;
