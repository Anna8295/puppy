/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coffee: {
          950: "#1B120B",
          900: "#261A11",
          800: "#3A2A1C",
          700: "#55402A",
        },
        ink: {
          950: "#120B06",
        },
        bone: {
          100: "#F4ECDF",
          300: "#DCCDB6",
        },
        caramel: {
          300: "#E3B27B",
          400: "#CC8B4C",
          500: "#B0713A",
          600: "#8F5527",
        },
        clay: {
          600: "#8A6249",
        },
        sand: {
          100: "#F1E4CB",
          300: "#DDC7A1",
          500: "#C9AD86",
          700: "#9E7C54",
        },
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        body: ["'IBM Plex Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
