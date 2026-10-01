/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        av: {
          bg: 'var(--av-bg)',
          bgAlt: 'var(--av-bg-alt)',
          elevated: 'var(--av-elevated)',
          field: 'var(--av-field)',
          hover: 'var(--av-hover)',
          active: 'var(--av-active)',
          line: 'var(--av-line)',
          lineStrong: 'var(--av-line-strong)',
          text: 'var(--av-text)',
          textSoft: 'var(--av-text-soft)',
          textDim: 'var(--av-text-dim)',
          accent: 'var(--av-accent)',
          accentSoft: 'var(--av-accent-soft)',
          brand: 'var(--av-brand)',
          ok: 'var(--av-ok)',
          okSoft: 'var(--av-ok-soft)',
          warn: 'var(--av-warn)',
          warnSoft: 'var(--av-warn-soft)',
          danger: 'var(--av-danger)',
          dangerSoft: 'var(--av-danger-soft)',
          glowA: 'var(--av-glow-a)',
          glowB: 'var(--av-glow-b)',
          scrim: 'var(--av-scrim)',
          header: 'var(--av-header)',
          ringTrack: 'var(--av-ring-track)',
          shadow: 'var(--av-shadow)',
        },
      },
    },
  },
  plugins: [],
};
