import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: { liar: '#ff3d5a', amber: '#ff9f45', truth: '#35e0a1', ink: '#f4f4fb', line: '#272a40' },
    },
  },
  plugins: [],
};
export default config;
