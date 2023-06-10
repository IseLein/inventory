import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
        'atkinson': ['"Atkinson Hyperlegible"', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [],
} satisfies Config;
