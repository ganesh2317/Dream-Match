import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      react,
    },
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // --- Catch undefined JSX components at lint time (root cause of Music2 crash) ---
      // Errors on <Music2 /> when Music2 is not imported — would have caught the original bug.
      'react/jsx-no-undef': 'error',

      // --- Unused vars: error for lowercase (real bugs), warn for uppercase (often intentional) ---
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]|motion', argsIgnorePattern: '^[A-Z_]|^_' }],

      // --- react-refresh: warn only (context files intentionally export hooks + providers together) ---
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // --- Hooks: warn (not always possible to add all dependencies safely, e.g. polling refs) ---
      'react-hooks/exhaustive-deps': 'warn',

      // --- setState-in-effect: warn (intentional in video playback / animation effects) ---
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
