import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#ADFF00",
        "accent-dim": "rgba(173,255,0,0.15)",
        "bg-primary": "#0a0a0a",
        "bg-card": "#111111",
        "bg-card-hover": "#1a1a1a",
        "border-subtle": "#222222",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "accent-glow": "0 0 20px rgba(173,255,0,0.25)",
        "accent-glow-lg": "0 0 40px rgba(173,255,0,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
