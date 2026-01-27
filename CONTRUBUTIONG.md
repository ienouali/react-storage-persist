# Contributing

Thank you for your interest in contributing! We welcome contributions from the community.

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues. When creating a bug report, include:

- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (browser, Node version, etc.)
- Code samples if applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- Clear title and description
- Use case and motivation
- Possible implementation approach
- Examples if applicable

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Add tests for your changes
4. Ensure all tests pass
5. Update documentation if needed
6. Submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/react-storage-persist.git
cd react-storage-persist

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test

# Run demo
npm run demo

# Build
npm run build
```

## Project Structure

```
react-storage-persist/
├── src/
│   ├── core/          # Core storage logic
│   ├── engines/       # Storage engines
│   ├── middleware/    # Middleware plugins
│   ├── react/         # React hooks
│   └── types/         # TypeScript types
├── tests/
│   ├── unit/          # Unit tests
│   └── e2e/           # E2E tests
└── demo/              # Demo application
```

## Testing

- Write tests for all new features
- Maintain or improve code coverage
- Run `npm test` before submitting PR
- Use descriptive test names

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Code Style

- Use TypeScript
- Follow existing code style
- Run `npm run lint` before committing
- Run `npm run format` to format code

## Commit Messages

Follow conventional commits format:

```
feat: add new feature
fix: fix bug
docs: update documentation
test: add tests
chore: update dependencies
refactor: refactor code
style: format code
```

## Pull Request Process

1. Update README.md with details of changes if needed
2. Update CHANGELOG.md following Keep a Changelog format
3. Ensure CI passes
4. Request review from maintainers
5. Address review feedback

## Questions?

Feel free to open an issue for questions or reach out to maintainers.

Thank you for contributing! 🎉