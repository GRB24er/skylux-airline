import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sky: {
          midnight: "#030614",
          surface: "#0a0f1e",
          surface2: "#0f1628",
          surface3: "#141c35",
          card: "rgba(10,15,30,0.7)",
        },
        accent: {
          DEFAULT: "#6366f1",
          light: "#818cf8",
          glow: "rgba(99,102,241,0.15)",
        },
        hot: "#f43f5e",
        cyan: { DEFAULT: "#22d3ee", glow: "rgba(34,211,238,0.1)" },
      },
      fontFamily: {
        display: ["Instrument Serif", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out both",
        "ticker": "ticker 30s linear infinite",
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        ticker: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
    },
  },
  plugins: [],
};
export default config;
