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
        accent: "#00d4aa",
        "accent-dim": "rgba(0,212,170,0.15)",
        "bg-primary": "#0a0a0a",
        "bg-card": "#111111",
        "bg-card-hover": "#1a1a1a",
        "border-subtle": "#222222",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "accent-glow": "0 0 20px rgba(0,212,170,0.25)",
        "accent-glow-lg": "0 0 40px rgba(0,212,170,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
