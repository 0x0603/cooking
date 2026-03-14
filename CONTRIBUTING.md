# Contributing Guide

Guidelines for contributing to this repository (self-contribution).

## Workflow

### 1. Create a New Project

```bash
# Using the script
make new-project NAME=my-project TEMPLATE=react

# Or manually
mkdir -p projects/frontend/my-project
cd projects/frontend/my-project
# Initialize project...
```

### 2. Development

- **Branch naming**: `project/<project-name>` or `feature/<feature-name>`
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:`: New feature
  - `fix:`: Bug fix
  - `docs:`: Documentation
  - `refactor:`: Code refactoring
  - `test:`: Tests
  - `chore:`: Maintenance

### 3. Code Quality

- **Linting**: Run linter before committing
- **Testing**: Write tests for new code
- **Documentation**: Update README and docs as needed

### 4. Commit & Push

```bash
git add .
git commit -m "feat: add new feature"
git push origin project/my-project
```

## Code Conventions

### Naming Conventions

- **Files**: kebab-case (`my-component.tsx`)
- **Directories**: kebab-case (`my-feature/`)
- **Variables/Functions**: camelCase (`myVariable`)
- **Classes/Components**: PascalCase (`MyComponent`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Code Style

- Use TypeScript for JS/TS projects
- Follow ESLint/Prettier configs
- Maximum line length: 100 characters
- Use meaningful variable names
- Add comments for complex logic

### Testing

- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for UI components
- Aim for >80% coverage

## Documentation

### README for Each Project

Each project must have a README.md with:

- Project description
- Tech stack
- Setup instructions
- How to run
- API documentation (if applicable)
- Architecture overview

### Architecture Decisions

For important architecture decisions:

1. Create an ADR in `docs/architecture/`
2. Follow the ADR template
3. Link from the project README

## Review Process

1. **Self-review**: Review your own code
2. **Checklist**:
   - [ ] Code follows style guide
   - [ ] Tests pass
   - [ ] Documentation updated
   - [ ] No console.logs or debug code
   - [ ] Environment variables documented

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
