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
          DEFAULT: '#667eea',
          dark: '#5a67d8',
        },
        secondary: {
          DEFAULT: '#764ba2',
          dark: '#6b46c1',
        },
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
      },
    },
  },
  plugins: [],
};

export default config;
