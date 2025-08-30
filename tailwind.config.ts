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
      colors: {
        // keep your blue brand scale
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
        // optional orange accent you used earlier
        brandAlt: {
          400: '#FF9A3A',
          500: '#FF8A2A',
        },
      },
      // shadows tuned for dark backgrounds
      boxShadow: {
        card:       '0 1px 0 rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.45)',
        'card-hover':'0 1px 0 rgba(255,255,255,0.08), 0 12px 32px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.06) inset',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      transitionProperty: {
        colors: 'color, background-color, border-color, text-decoration-color, fill, stroke',
        shadow: 'box-shadow',
      },
    },
  },
  plugins: [],
};

export default config;
