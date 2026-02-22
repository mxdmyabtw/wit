/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "system-ui", "sans-serif"],
        space: ["var(--font-space)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
