import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17221b",
        cream: "#f6f7f2",
        leaf: { 50: "#eef7f0", 500: "#41945c", 600: "#347a4a", 700: "#2b633e" },
      },
      boxShadow: { sheet: "0 -12px 40px rgba(23,34,27,.16)" },
    },
  },
  plugins: [],
} satisfies Config;
