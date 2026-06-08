/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core neutrals (zinc-based dark)
        'bg-base': '#0a0a0a',
        'bg-surface': '#111113',
        'bg-surface-2': '#18181b',
        'bg-surface-3': '#1f1f23',
        'bg-surface-4': '#27272a',
        'border-subtle': '#27272a',
        'border-default': '#3f3f46',
        'border-strong': '#52525b',

        // Text hierarchy
        'text-primary': '#fafafa',
        'text-secondary': '#a1a1aa',
        'text-tertiary': '#71717a',
        'text-muted': '#52525b',

        // Semantic accents
        'accent-blue': '#60a5fa',
        'accent-cyan': '#22d3ee',
        'accent-emerald': '#34d399',
        'accent-amber': '#fbbf24',
        'accent-orange': '#fb923c',
        'accent-red': '#f87171',

        // Primary action
        'btn-primary': '#e4e4e7',
        'btn-primary-hover': '#d4d4d8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(2.5rem, 5vw, 3.75rem)', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '600' }],
        'heading': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'subheading': ['clamp(1.25rem, 2.5vw, 1.5rem)', { lineHeight: '1.3', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'small': ['0.875rem', { lineHeight: '1.5' }],
        'xs': ['0.75rem', { lineHeight: '1.4' }],
        'code': ['0.8125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'code-lg': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
      },
      maxWidth: {
        'content': '1280px',
      },
    },
  },
  plugins: [],
};
