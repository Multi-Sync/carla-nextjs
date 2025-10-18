# Contributing to Carla-Next.js

Thank you for your interest in contributing! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## 📜 Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Next.js project for testing
- An Interworky account (free at [interworky.com](https://interworky.com))

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/carla-nextjs.git
   cd carla-nextjs
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Link for local development**
   ```bash
   npm link
   ```

6. **Test in a Next.js project**
   ```bash
   cd /path/to/your/nextjs/project
   npm link carla-nextjs
   npx carla-nextjs --help
   ```

## 🛠️ Making Changes

### Branch Naming Convention

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks
- `test/` - Test additions/changes

Example: `feat/add-graphql-support`

### Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <subject>

# Examples
feat(cli): add verbose logging option
fix(scanner): handle nested route groups
docs(readme): update installation instructions
test(utils): add tests for file parser
chore(deps): update dependencies
```

**Types:**
- `feat` - New feature (minor version bump)
- `fix` - Bug fix (patch version bump)
- `BREAKING` - Breaking change (major version bump)
- `docs` - Documentation only
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding/updating tests
- `chore` - Maintenance tasks

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run `npm run lint` before committing
- Run `npm run format` to auto-format code
- Add JSDoc comments for public APIs
- Write tests for new features

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Test Requirements:**
- All new features must include tests
- Bug fixes should include regression tests
- Maintain >80% code coverage

## 📤 Submitting Changes

### Pull Request Process

1. **Update documentation**
   - Update README.md if needed
   - Add/update JSDoc comments
   - Update CHANGELOG.md

2. **Run quality checks**
   ```bash
   npm run lint
   npm run build
   npm test
   ```

3. **Push to your fork**
   ```bash
   git push origin feat/your-feature
   ```

4. **Create Pull Request**
   - Use a clear title following commit conventions
   - Describe what changed and why
   - Reference related issues (e.g., "Fixes #123")
   - Add screenshots for UI changes
   - Check "Allow edits from maintainers"

### PR Title Format

```
<type>: <description>

Examples:
feat: add GraphQL API scanning support
fix: resolve TypeScript parsing error in nested routes
docs: improve API key setup instructions
```

### What Happens Next?

1. **Automated checks** - CI runs tests and lints
2. **Code review** - Maintainers review your code
3. **Feedback** - You may be asked to make changes
4. **Merge** - Once approved, we'll merge your PR
5. **Release** - Your changes will be in the next npm release

## 🐛 Reporting Bugs

### Before Reporting

1. **Search existing issues** - Your bug may already be reported
2. **Try the latest version** - Bug might be fixed
3. **Check documentation** - Ensure you're using the tool correctly

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Run command '...'
2. See error '...'

**Expected behavior**
What you expected to happen.

**Environment:**
- OS: [e.g., macOS 14.0]
- Node.js: [e.g., 18.17.0]
- Next.js: [e.g., 14.0.3]
- carla-nextjs: [e.g., 1.0.0]

**Additional context**
Add any other context, screenshots, or logs.
```

## 💡 Suggesting Features

We love feature suggestions! Please:

1. **Check existing issues** - Feature might be planned
2. **Describe the use case** - Why is this needed?
3. **Provide examples** - Show how it would work
4. **Consider alternatives** - Are there other solutions?

### Feature Request Template

```markdown
**Problem Statement**
Describe the problem this feature would solve.

**Proposed Solution**
Describe your proposed solution.

**Example Usage**
\`\`\`bash
npx carla-nextjs your-feature --example
\`\`\`

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Screenshots, mockups, or examples.
```

## 🎨 Design Principles

When contributing, keep these principles in mind:

1. **Zero Config** - Should work out of the box
2. **Developer Experience** - Clear errors, helpful messages
3. **Performance** - Fast scanning and minimal overhead
4. **Compatibility** - Support common Next.js patterns
5. **Extensibility** - Easy to add new features

## 🏆 Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- README.md acknowledgments

## 📞 Getting Help

- **GitHub Discussions** - Ask questions
- **Discord** - Join our [community](https://discord.gg/interworky)
- **Email** - [hello@interworky.com](mailto:hello@interworky.com)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Interworky API Docs](https://interworky.com/docs/api)

---

**Thank you for contributing to Carla-Next.js! 🚀**
