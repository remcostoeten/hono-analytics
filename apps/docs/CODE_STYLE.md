# Code Style Guide for Docs

This document explains the ESLint and Prettier setup for the documentation site.

## Tools

- **ESLint**: Code linting and quality checks
- **Prettier**: Automatic code formatting

## Available Scripts

```bash
# Linting
npm run lint          # Check for linting issues
npm run lint:fix      # Auto-fix linting issues

# Formatting  
npm run format        # Format all files
npm run format:check  # Check formatting without changes
```

## Configuration

### ESLint (`.eslintrc.json`)
- Extends Next.js recommended configs
- TypeScript support enabled
- Custom rules for code quality
- Warns on unused variables
- Allows unescaped entities in React

### Prettier (`.prettierrc`)
- No semicolons
- Single quotes
- 2-space indentation
- Trailing commas (ES5)
- 80 character line length
- Arrow functions without parens

## Ignored Files

### ESLint
- Build artifacts (`.next`, `dist`)
- Config files (`.config.js`, `.config.mjs`)
- Generated files (`.source`)

### Prettier  
- Build artifacts
- Documentation files (`.md`, `.mdx`)
- Lock files

## Editor Integration

### VS Code
Install extensions:
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.format.enable": true
}
```

### Other Editors
Configure your editor to:
- Run ESLint on file save
- Format with Prettier on save
- Show linting errors inline

## Pre-commit Hooks (Optional)

To enforce formatting before commits:

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,scss}": ["prettier --write"]
  }
}
```