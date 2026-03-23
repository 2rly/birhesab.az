import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          light: "#dbeafe",
        },
        accent: "#f59e0b",
        background: "#f0fdf4",
        surface: "#ffffff",
        foreground: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
      },
    },
  },
  plugins: [],
};
export default config;
