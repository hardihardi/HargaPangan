import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#020617",
          light: "#f4f4f5",
        },
        surface: {
          DEFAULT: "#0f172a",
          light: "#ffffff",
        },
        accent: {
          DEFAULT: "#22c55e",
          soft: "#bbf7d0",
        },
      },
      boxShadow: {
        soft: "0 10px 25px -15px rgba(15,23,42,0.8)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};

export default config;