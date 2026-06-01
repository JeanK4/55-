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
        // Cálida paleta tierra/ocre
        cream:    '#FBF7F0',  // fondo principal
        ink:      '#1F2937',  // texto principal
        clay:     '#C2410C',  // acento cálido (terracota)
        sage:     '#4A6741',  // verde profundo
        gold:     '#D4A574',  // dorado suave
        rose:     '#B8526E',  // rosa profundo (sin ser infantil)
        sand:     '#E8DCC4',  // arena clara
        coffee:   '#5C4033',  // marrón profundo
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
        'soft': '0 4px 24px -8px rgba(92, 64, 51, 0.15)',
        'lift': '0 12px 40px -12px rgba(92, 64, 51, 0.25)',
      },
    },
  },
  plugins: [],
};
