/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
  colors: {
    primary: "#24340c",
    secondary: "#6d5c3c",
    surface: "#fff8f2",
    "surface-low": "#fff2df",
    accent: "#660013"
  },
  borderRadius: {
    xl: "2rem",
    "2xl": "3rem"
  },
  fontFamily: {
    serif: ["Noto Serif"],
    sans: ["Inter"]
  }
},
  },
  plugins: [],
}