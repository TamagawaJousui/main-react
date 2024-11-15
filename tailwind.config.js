/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F9F6F7",
      },
    },
    fontFamily: {
      "concept-ja": ["Klee One Regular"],
      "concept-en": ["Playfair Light"],
      "section-title": ["Playfair Display SC Italic"],
      serif: ["游明朝体", "Yu Mincho", "YuMincho"],
      gothic: ["Zen Kaku Gothic Antique"],
    },
  },
  plugins: [],
};
