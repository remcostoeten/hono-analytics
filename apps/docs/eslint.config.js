/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      '@next/next': require('@next/eslint-plugin-next'),
    },
    rules: {
      // Core rules
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': 'off', // Turned off in favor of @typescript-eslint version

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'warn',

      // React rules
      'react/no-unescaped-entities': 'off',
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Next.js rules
      '@next/next/no-img-element': 'error',
      '@next/next/no-page-custom-font': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
    ],
  },
]
