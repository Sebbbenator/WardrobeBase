/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F1EB',
        'cream-dark': '#EDE6DC',
        ink: '#1C1917',
        'ink-muted': '#78716C',
        'ink-soft': '#A8A29E',
        line: '#E7E3DC',
        sage: '#6B7A5A',
        'sage-soft': '#D8DDCF',
        terracotta: '#B5654A',
        amber: '#C88A3D',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        display: ['2.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28, 25, 23, 0.04), 0 8px 24px -12px rgba(28, 25, 23, 0.08)',
        lift: '0 4px 16px -4px rgba(28, 25, 23, 0.12)',
      },
    },
  },
  plugins: [],
};
