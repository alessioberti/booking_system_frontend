/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: "#1976D2",
        hoverPrimary: "#2196f3",
        success: "#008000",
        error: "#ff0000",
        delete: "#ff0000",
        back: "#4b5563",
      },
    },
  },
  plugins: [],
}

