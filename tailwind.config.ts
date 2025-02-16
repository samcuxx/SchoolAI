import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "#f0fdfd",
          100: "#ccfbfb",
          200: "#99f6f6",
          300: "#66f2f2",
          400: "#1ae8e8",
          500: "#0bd1d1",
          600: "#09a7a7",
          700: "#077c7c",
          800: "#066666",
          900: "#044040",
        },
        secondary: {
          50: "#f0f9fe",
          100: "#e0f2fe",
          200: "#b9e6fe",
          300: "#7cd4fd",
          400: "#36bffa",
          500: "#0ea5ea",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
} satisfies Config;
