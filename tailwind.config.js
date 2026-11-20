/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tokens definidos en globals.css (cambian con el tema claro/oscuro)
        cream:  'rgb(var(--color-cream) / <alpha-value>)',
        sand:   'rgb(var(--color-sand) / <alpha-value>)',
        ink:    'rgb(var(--color-ink) / <alpha-value>)',
        coffee: 'rgb(var(--color-coffee) / <alpha-value>)',
        clay:   'rgb(var(--color-clay) / <alpha-value>)',
        sage:   'rgb(var(--color-sage) / <alpha-value>)',
        rose:   'rgb(var(--color-rose) / <alpha-value>)',
        gold:   'rgb(var(--color-gold) / <alpha-value>)',
      },
      fontFamily: {
        // Tipografía editorial cálida — DM Serif para títulos, Plus Jakarta Sans para texto
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Tamaños grandes por defecto — accesibilidad para adultos mayores
        'base': ['1.125rem', { lineHeight: '1.7' }],   // 18px
        'lg':   ['1.25rem',  { lineHeight: '1.7' }],   // 20px
        'xl':   ['1.5rem',   { lineHeight: '1.6' }],   // 24px
        '2xl':  ['2rem',     { lineHeight: '1.3' }],   // 32px
        '3xl':  ['2.5rem',   { lineHeight: '1.2' }],   // 40px
        '4xl':  ['3.5rem',   { lineHeight: '1.1' }],   // 56px
        '5xl':  ['4.5rem',   { lineHeight: '1.05' }],  // 72px
      },
      borderRadius: {
        'soft':  '14px',
        'pill':  '999px',
      },
      boxShadow: {
        'soft': '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px -6px rgb(0 0 0 / 0.10)',
        'lift': '0 2px 4px rgb(0 0 0 / 0.04), 0 12px 32px -12px rgb(0 0 0 / 0.18)',
      },
    },
  },
  plugins: [],
};
