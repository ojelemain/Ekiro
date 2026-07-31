import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ekiti: {
          green: "#005826",
          gold: "#D4AF37",
          neutral: "#0A1A10",
          canvas: "#F4F7F5",
        },
      },
      fontFamily: {
        display: ["Source Serif 4", "Georgia", "serif"],
        body: ["Public Sans", "Arial", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        sm: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
