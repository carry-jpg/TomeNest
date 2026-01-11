/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "libib-cyan": "#26C6DA",
        "libib-hover": "#00BCD4",
        "sidebar-bg": "#FFFFFF",
        "text-primary": "#37474F",
        "text-secondary": "#90A4AE",
      },
      boxShadow: {
        card: "0 2px 5px rgba(0,0,0,0.06)",
        "card-hover": "0 10px 20px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
};
