// PostCSS configuration: tool for transforming CSS with plugins
export default {
  plugins: {
    // Newer Tailwind CSS PostCSS plugin integration
    '@tailwindcss/postcss': {},
    // Automatically adds vendor prefixes to CSS rules (e.g., -webkit-, -ms-) for better browser compatibility
    autoprefixer: {},
  },
}