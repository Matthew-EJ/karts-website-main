/** @type {import('tailwindcss').Config} */
export default {
  // Specify the paths to all of your template files
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Theme customization section
  theme: {
    // extend allows you to add custom styles without overriding the default theme
    extend: {},
  },
  // Add additional Tailwind plugins here (e.g., typography, aspect-ratio)
  plugins: [],
}