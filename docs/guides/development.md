# Development Guide

Guide for developing projects in this repository.

## Prerequisites

- Node.js 18+ (for JS/TS projects)
- Python 3.10+ (for Python projects)
- Docker & Docker Compose
- Git

## Setup

### 1. Clone repository

```bash
git clone <repo-url>
cd cooking
```

### 2. Setup environment

```bash
# Run setup script
./tools/scripts/setup-env.sh
```

### 3. Create a new project

```bash
./tools/scripts/create-project.sh my-project react
cd projects/my-project
npm install
```

## Development Workflow

### 1. Create a new branch

```bash
git checkout -b feature/my-feature
# or
git checkout -b project/my-new-project
```

### 2. Development

- Write code
- Write tests
- Update documentation
- Commit frequently with clear messages

### 3. Testing

```bash
# Run tests
npm test
# or
pytest
```

### 4. Code Quality

- Linting: `npm run lint`
- Formatting: `npm run format`
- Type checking: `npm run type-check`

### 5. Commit & Push

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

## Best Practices

1. **Code Style**: Follow the project's style guide
2. **Testing**: Aim for >80% coverage
3. **Documentation**: Update docs when changing code
4. **Commits**: Use conventional commits
5. **Reviews**: Self-review before merging

## Troubleshooting

### Common Issues

**Issue**: Dependencies conflicts
**Solution**: Use exact versions or lock files

**Issue**: Port already in use
**Solution**: Change the port in .env or kill the process

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
