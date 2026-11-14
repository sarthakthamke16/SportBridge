/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF4500",
          orangeHover: "#e03e00",
          dark: "#0d1117",
          card: "#161b22",
          subtle: "#21262d",
          border: "#30363d",
          textSecondary: "#8b949e",
          green: "#238636",
          teal: "#0d9488",
          red: "#da3633"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
