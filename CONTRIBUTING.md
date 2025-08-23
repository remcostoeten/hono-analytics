# Contributing to HONO Analytics

Thank you for your interest in contributing to HONO Analytics! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher  
- Docker (recommended for PostgreSQL)
- Git

### Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/hono-analytics.git
   cd hono-analytics
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Start Development**
   ```bash
   ./dev.sh
   ```

## Project Structure

```
hono-analytics/
├── backend/           # HONO API server
│   ├── src/
│   │   ├── db/        # Database schema and migrations
│   │   ├── routes/    # API endpoints
│   │   ├── utils/     # Utility functions
│   │   └── server.ts  # Main server entry
│   └── package.json
├── sdk/               # TypeScript SDK
│   ├── src/
│   │   ├── core/      # Core functionality
│   │   ├── react/     # React-specific code
│   │   └── index.ts   # Main SDK entry
│   └── package.json
├── example/           # Demo React app
└── dev.sh            # Development script
```

## Coding Standards

### TypeScript Guidelines

- **Strict TypeScript**: Enable all strict checks
- **Type Naming**: Prefix all types with `T` (e.g., `TUser`, `TAnalyticsOptions`)
- **Props Types**: Use `TProps` for component props when there's only one type per file
- **No `any`**: Always provide proper types

### Functional Programming Rules

- **No Classes**: Use functions and composition
- **Named Functions**: Use `function` declarations, not arrow function constants
- **Pure Functions**: Functions should be predictable with no side effects
- **Immutability**: Don't mutate arguments or external state

```typescript
// ✅ Good
export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent)
  return parser.getResult()
}

// ❌ Bad
export const parseUserAgent = (userAgent: string) => {
  // arrow function constant
}

class UserAgentParser {
  // classes not allowed
}
```

### React Guidelines

- **No Default Exports**: Use named exports only (except for pages/views)
- **Props Types**: Always use `TProps` for component props
- **Hooks**: Prefer functional components with hooks
- **Provider Pattern**: Use context for cross-cutting concerns

```tsx
// ✅ Good
type TProps = {
  children: ReactNode
  apiKey: string
}

export function AnalyticsProvider({ children, apiKey }: TProps) {
  // component logic
}

// ❌ Bad  
export default function AnalyticsProvider({ children, apiKey }) {
  // default export, untyped props
}
```

## Branch Naming

Use descriptive branch names with prefixes:

- `feature/add-metrics-dashboard`
- `fix/session-timeout-bug`
- `docs/update-api-reference`
- `refactor/database-schema`
- `chore/upgrade-dependencies`

## Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(sdk): add session timeout configuration
fix(backend): handle missing user agent header
docs(readme): update installation instructions
refactor(db): optimize queries for metrics endpoint
```

## Pull Request Guidelines

### Before Creating a PR

1. **Run Tests**
   ```bash
   pnpm type-check
   pnpm build
   ```

2. **Test Manually**
   - Start development environment
   - Verify your changes work as expected
   - Test edge cases

3. **Update Documentation**
   - Update README if adding features
   - Add JSDoc comments to public functions
   - Update API documentation if needed

### PR Template

When creating a pull request, include:

1. **Description**: What does this PR do and why?
2. **Changes**: List of specific changes made
3. **Testing**: How did you test the changes?
4. **Screenshots**: For UI changes (if applicable)
5. **Breaking Changes**: Any breaking changes and migration path

### Example PR Description

```markdown
## Description

Add session timeout configuration to SDK allowing users to customize the inactivity period.

## Changes

- Add `sessionTimeout` option to `TAnalyticsOptions`
- Update session management to use configurable timeout
- Add documentation for new option
- Update example app to demonstrate usage

## Testing

- Verified custom timeout works in example app
- Tested edge cases (0 timeout, very large timeout)
- Confirmed backwards compatibility

## Breaking Changes

None - new option is optional with sensible default.
```

## Database Migrations

When making database schema changes:

1. **Generate Migration**
   ```bash
   cd backend
   pnpm db:generate
   ```

2. **Test Migration**
   ```bash
   # Test on fresh database
   rm analytics.db  # if using SQLite
   pnpm db:migrate
   ```

3. **Document Changes**
   - Update schema documentation in README
   - Note any breaking changes

## Testing

### Manual Testing

1. **Start Development Environment**
   ```bash
   ./dev.sh
   ```

2. **Test Backend**
   - Visit http://localhost:8000/health
   - Test API endpoints with Postman/curl
   - Check database for expected changes

3. **Test SDK**
   - Use example app at http://localhost:3000
   - Check browser console for errors
   - Verify analytics events are sent

4. **Test Integration**
   - Ensure SDK communicates with backend
   - Verify data persistence in database
   - Test error handling

### Type Checking

```bash
# Check all packages
pnpm type-check

# Check specific package
pnpm --filter backend type-check
pnpm --filter sdk type-check
```

## Code Review Process

### As a Contributor

- Respond promptly to review feedback
- Make requested changes in separate commits
- Explain your reasoning if you disagree with feedback
- Test your changes after addressing feedback

### As a Reviewer

- Be constructive and specific in feedback
- Suggest improvements, don't just point out problems
- Consider the bigger picture and project goals
- Approve when code meets standards and requirements

## Documentation

### Code Documentation

- Add JSDoc comments to public functions
- Include examples in complex functions
- Document function parameters and return types
- Explain non-obvious business logic

```typescript
/**
 * Parse user agent string to extract browser, OS, and device information
 * 
 * @param userAgent - Raw user agent string from browser
 * @returns Parsed device information object
 * 
 * @example
 * ```typescript
 * const info = parseUserAgent('Mozilla/5.0...')
 * console.log(info.browser) // "Chrome 120"
 * ```
 */
export function parseUserAgent(userAgent: string): TDeviceInfo {
  // implementation
}
```

### README Updates

When adding features:

- Update feature list
- Add configuration examples
- Update API documentation
- Add troubleshooting info if needed

## Release Process

1. **Version Bump**
   - Update version in all package.json files
   - Follow semantic versioning (major.minor.patch)

2. **Changelog**
   - Document all changes since last release
   - Categorize as features, fixes, breaking changes

3. **Testing**
   - Full regression test
   - Test in production-like environment
   - Verify migrations work correctly

4. **Release**
   - Tag release in git
   - Create GitHub release with changelog
   - Deploy to production

## Getting Help

- **Issues**: Check existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Refer to README and code comments
- **Examples**: Check the example app for usage patterns

## Code of Conduct

- Be respectful and constructive
- Help newcomers and answer questions
- Focus on the code, not the person
- Follow project standards and guidelines
- Report inappropriate behavior to maintainers

## License

By contributing to HONO Analytics, you agree that your contributions will be licensed under the MIT License.
