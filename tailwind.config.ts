import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        chad: {
          black: "#050505",
          ink: "#101114",
          white: "#f8f7f2",
          lime: "#25f58a",
          mint: "#7fffd2",
          cyan: "#53b7ff",
          red: "#ff4f63",
          yellow: "#f8d957"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(37,245,138,0.28), 0 24px 80px rgba(37,245,138,0.12)"
      },
      animation: {
        "tape-left": "tape-left 28s linear infinite",
        "tape-right": "tape-right 28s linear infinite",
        floaty: "floaty 5s ease-in-out infinite",
        "slow-pulse": "slow-pulse 2.6s ease-in-out infinite"
      },
      keyframes: {
        "tape-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        "tape-right": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" }
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" }
        },
        "slow-pulse": {
          "0%, 100%": { opacity: "0.65" },
          "50%": { opacity: "1" }
        }
      }
    }
  },
  plugins: []
};

export default config;
