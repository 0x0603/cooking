# Quick Start Guide

A quick guide to get started with this repository.

## 1. Setup

```bash
# Clone the repository (if you haven't already)
git clone <your-repo-url>
cd cooking

# Setup development environment
make setup
# or
chmod +x tools/scripts/*.sh
```

## 2. Create Your First Project

### Option 1: Using Makefile (Recommended)

```bash
make new-project NAME=my-first-app TEMPLATE=react
```

### Option 2: Using the script directly

```bash
./tools/scripts/create-project.sh my-first-app react
```

### Option 3: Manual creation

```bash
mkdir -p projects/frontend/my-first-app
cd projects/frontend/my-first-app
# Initialize project manually
```

## 3. Available Templates

- `react` - React + TypeScript + Vite
- `nextjs` - Next.js + TypeScript
- `nodejs` - Node.js + Express + TypeScript
- `python` - Python + FastAPI

## 4. Development Workflow

```bash
# 1. Navigate to the project directory
cd projects/frontend/my-first-app

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 5. Push changes
git push origin project/my-first-app
```

## 5. Useful Commands

```bash
# Install dependencies for all projects
make install

# Run tests for all projects
make test

# Run linter
make lint

# Format code
make format

# Clean build artifacts
make clean

# View all commands
make help
```

## 6. Next Steps

1. **Read the documentation**:
   - [Development Guide](./docs/guides/development.md)
   - [Project Structure Guide](./docs/guides/project-structure.md)
   - [Architecture Philosophy](./docs/architecture/philosophy.md)

2. **Create more projects**:
   - Try different templates
   - Build fullstack applications
   - Experiment with new technologies

3. **Document learnings**:
   - Record insights in `docs/learnings/`
   - Write ADRs for important decisions
   - Update documentation as needed

4. **Share code**:
   - Create shared libraries in `shared/`
   - Build reusable components
   - Contribute new templates

## 7. Tips

- **Start small**: Begin with simple projects
- **Learn by doing**: Practice more than reading
- **Document everything**: Record what you learn
- **Refactor often**: Continuously improve code
- **Ask questions**: Understand "why", not just "how"

## 8. Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [System Design Primer](https://github.com/donnemartin/system-design-primer)

---

**Ready to start? Let's build something awesome!**
