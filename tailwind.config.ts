import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        electric: "#0A2EE6", // main background
        sun: "#FFC400", // buttons, highlights, totals
        grape: "#2B0A4E", // secondary panels, cards, footers
      },
      fontFamily: {
        display: ["ui-rounded", "'Nunito'", "'Segoe UI'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
