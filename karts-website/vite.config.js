import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Vite configuration file: https://vite.dev/config/
export default defineConfig({
  // Plugins used to extend Vite functionality
  plugins: [
    // Standard React plugin for Vite, provides Hot Module Replacement (HMR) and JSX support
    react(),
    // Integration for Tailwind CSS within the Vite build pipeline
    tailwindcss()
  ],
})
