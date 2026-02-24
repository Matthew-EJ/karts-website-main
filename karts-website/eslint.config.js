import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Flat ESLint configuration file
export default defineConfig([
  // Global directory and file ignores
  globalIgnores(['dist']),
  {
    // Target JavaScript and React files
    files: ['**/*.{js,jsx}'],
    // Inherit from recommended configurations
    extends: [
      js.configs.recommended,          // ESLint default recommended rules
      reactHooks.configs.flat.recommended, // React Hooks specific rules (e.g., exhaustive-deps)
      reactRefresh.configs.vite,       // Vite-specific React Refresh configuration
    ],
    languageOptions: {
      ecmaVersion: 2020,               // Use ECMAScript 2020 features
      globals: globals.browser,        // Define browser-environment globals (window, document, etc.)
      parserOptions: {
        ecmaVersion: 'latest',         // Support latest ECMAScript features
        ecmaFeatures: { jsx: true },   // Enable JSX support
        sourceType: 'module',          // Use ES modules
      },
    },
    // Customize or override specific linting rules
    rules: {
      // Custom rule: Allow unused variables if they start with uppercase or underscore (useful for React components or internal vars)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
