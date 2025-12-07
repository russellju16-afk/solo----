/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./admin/src/**/*.{js,ts,jsx,tsx,html}",
    "./admin/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        secondary: '#F97316',
        success: '#16A34A',
        warning: '#CA8A04',
        danger: '#EF4444',
        dark: '#1F2937',
        light: '#F3F4F6'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
