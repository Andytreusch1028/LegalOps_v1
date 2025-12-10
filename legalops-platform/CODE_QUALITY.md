# Code Quality Tooling

This document describes the code quality tooling setup for the LegalOps platform.

## Overview

The project uses a comprehensive code quality stack to ensure consistent, maintainable, and error-free code:

- **ESLint**: Static code analysis and linting
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Run linters on staged files only

## ESLint Configuration

### Strict Rules Enabled

The project enforces strict TypeScript and code quality rules:

#### TypeScript Rules
- `@typescript-eslint/no-explicit-any`: **error** - Prevents use of `any` type
- `@typescript-eslint/no-unused-vars`: **error** - Catches unused variables (allows `_` prefix for intentionally unused)
- `@typescript-eslint/explicit-function-return-type`: **warn** - Encourages explicit return types
- `@typescript-eslint/no-non-null-assertion`: **warn** - Warns about `!` non-null assertions

#### Code Quality Rules
- `no-console`: **warn** - Only allows `console.warn` and `console.error`
- `no-debugger`: **error** - Prevents debugger statements in production
- `no-alert`: **error** - Prevents alert() usage
- `prefer-const`: **error** - Enforces const for variables that aren't reassigned
- `no-var`: **error** - Prevents var usage (use let/const)
- `eqeqeq`: **error** - Requires === and !== (except for null checks)
- `curly`: **error** - Requires curly braces for all control statements
- `no-throw-literal`: **error** - Requires throwing Error objects
- `prefer-template`: **warn** - Encourages template literals over string concatenation
- `no-nested-ternary`: **warn** - Discourages nested ternary operators
- `no-unneeded-ternary`: **error** - Prevents unnecessary ternary expressions

#### Import Organization
- `sort-imports`: **error** - Enforces sorted imports within statements

#### React Rules
- `react-hooks/rules-of-hooks`: **error** - Enforces Rules of Hooks
- `react-hooks/exhaustive-deps`: **warn** - Checks effect dependencies
- `react/jsx-no-target-blank`: **error** - Prevents security issues with target="_blank"
- `react/jsx-key`: **error** - Requires key prop in lists

### Running ESLint

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

## Prettier Configuration

Prettier is configured with the following settings:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false
}
```

### Running Prettier

```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check
```

## Pre-commit Hooks (Husky)

Husky is configured to run lint-staged before each commit. This ensures that only properly formatted and linted code is committed.

### What Happens on Commit

1. Husky triggers the pre-commit hook
2. lint-staged runs on staged files only
3. For `.js`, `.jsx`, `.ts`, `.tsx` files:
   - ESLint runs with auto-fix
   - Prettier formats the code
4. For `.json`, `.md`, `.yml`, `.yaml`, `.css`, `.scss` files:
   - Prettier formats the code
5. If any errors occur, the commit is blocked

### Bypassing Hooks (Not Recommended)

In rare cases where you need to bypass the pre-commit hook:

```bash
git commit --no-verify -m "Your commit message"
```

**Note**: This should only be used in exceptional circumstances.

## lint-staged Configuration

lint-staged is configured to run different tools based on file types:

```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ],
  "*.{css,scss}": [
    "prettier --write"
  ]
}
```

## IDE Integration

### VS Code

Install the following extensions for the best experience:

1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier** (`esbenp.prettier-vscode`)

Add to your `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### WebStorm / IntelliJ IDEA

1. Enable ESLint: Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Enable Prettier: Settings → Languages & Frameworks → JavaScript → Prettier
3. Enable "Run on save" for both tools

## Troubleshooting

### ESLint Errors After Pull

If you see ESLint errors after pulling changes:

```bash
# Reinstall dependencies
npm install

# Clear ESLint cache
npm run lint -- --cache-location .eslintcache
```

### Prettier Conflicts with ESLint

The configuration is designed to avoid conflicts. If you encounter any:

1. Prettier handles formatting
2. ESLint handles code quality
3. ESLint rules that conflict with Prettier are disabled

### Pre-commit Hook Not Running

If the pre-commit hook isn't running:

```bash
# Reinstall Husky
npm run prepare
```

### Slow Pre-commit Checks

lint-staged only runs on staged files, so it should be fast. If it's slow:

1. Check if you have many staged files
2. Consider committing in smaller batches
3. Ensure your `.gitignore` excludes build artifacts

## Best Practices

### Writing New Code

1. **Use TypeScript strictly**: Avoid `any`, use proper types
2. **Follow ESLint warnings**: They're there to help
3. **Let Prettier format**: Don't fight the formatter
4. **Write explicit return types**: Makes code more maintainable
5. **Use const by default**: Only use let when reassignment is needed

### Handling Warnings

- **Don't disable rules globally**: If a rule is problematic, discuss with the team
- **Use inline disables sparingly**: Only when absolutely necessary
- **Document why**: If you must disable a rule, explain why

```typescript
// Good: Documented exception
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyData: any = await fetchLegacyAPI(); // Legacy API returns untyped data

// Bad: No explanation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = something;
```

### Gradual Adoption

For existing code with many violations:

1. Fix new code first (enforced by pre-commit hooks)
2. Fix files as you touch them
3. Schedule dedicated cleanup sprints for critical files
4. Use `// eslint-disable-next-line` temporarily for legacy code

## Maintenance

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update ESLint
npm install eslint@latest --save-dev

# Update Prettier
npm install prettier@latest --save-dev

# Update Husky
npm install husky@latest --save-dev

# Update lint-staged
npm install lint-staged@latest --save-dev
```

### Adding New Rules

1. Discuss with the team
2. Add to `eslint.config.mjs`
3. Test on a few files first
4. Document in this file
5. Announce to the team

## Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [TypeScript ESLint](https://typescript-eslint.io/)

## Support

If you have questions or issues with the code quality tooling:

1. Check this documentation first
2. Search existing issues in the project
3. Ask in the team chat
4. Create an issue if it's a bug or enhancement request
