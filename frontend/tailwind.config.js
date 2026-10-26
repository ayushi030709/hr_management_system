/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#121821",
          800: "#1A2230",
          700: "#232D3F",
          600: "#324158",
        },
        paper: "#F6F7F5",
        line: "#E2E5E1",
        teal: {
          600: "#0F6D66",
          700: "#0B5450",
        },
        amber: {
          500: "#C98A2C",
        },
        rust: {
          500: "#B4483B",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
