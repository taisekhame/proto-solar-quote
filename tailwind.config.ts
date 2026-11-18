import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF6E5", // main background
        paper: "#FFFDF7", // cards, form panels, table areas
        ink: "#2B1A10", // dark brown: text everywhere + dark boxes
        accent: {
          DEFAULT: "#FF9E1B", // amber-orange: primary buttons, highlights, key figures
          deep: "#F08C00", // hover state
        },
      },
      fontFamily: {
        display: ["ui-rounded", "'Nunito'", "'Segoe UI'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 24px -8px rgba(43, 26, 16, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
