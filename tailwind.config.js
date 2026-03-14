/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#1a1a2e',
          text: '#c4c4d4',
          active: '#ffffff',
          accent: '#7f77dd',
          muted: '#6e6e8a',
          nav: '#8e8ea8',
          border: 'rgba(255,255,255,0.08)',
        },
        dash: {
          banner: 'linear-gradient(135deg, #1a1a2e 0%, #2d2a4a 100%)',
        },
        team: {
          admin: '#7f77dd',
          maintenance: '#1d9e75',
          leadership: '#378add',
          managers: '#d85a30',
          subsidiary: '#d4537e',
          marketing: '#ef9f27',
        },
      },
    },
  },
  plugins: [],
}
