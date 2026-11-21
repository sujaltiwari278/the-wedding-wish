import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "360px",
        "3xl": "1920px",
        "4k": "2560px",
      },
      colors: {
        "rose-dusty": "#D8A7A7",
        blush: "#EBCACA",
        "soft-blush": "#F7E9E5",
        cream: "#FFF7F2",
        vintage: "#9C5968",
        deep: "#75404F",
      },
      fontFamily: {
        pixel: ["'Press Start 2P'", "monospace"],
        retro: ["'VT323'", "monospace"],
      },
      boxShadow: {
        pixel: "4px 4px 0px #75404F",
        "pixel-sm": "2px 2px 0px #75404F",
        "pixel-lg": "6px 6px 0px #75404F",
        "pixel-vintage": "4px 4px 0px #9C5968",
      },
    },
  },
  plugins: [],
};

export default config;
