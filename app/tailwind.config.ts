import containerQueries from "@tailwindcss/container-queries";
import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}", "./index.html"],
  darkMode: "class",
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ["Lexend var", ...defaultTheme.fontFamily.sans],
        druk: ["Druk"],
        drukx: ["Druk X"],
        solstice: ["Solstice"],
        hipnouma: ["Hipnouma"],
      },
      screens: {
        md: "720px",
        "2xl": "1600px",
      },
    },
  },
  plugins: [containerQueries],
} satisfies Config;
