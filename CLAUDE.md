# Cooking - Personal Projects Monorepo

## Overview

This is a personal monorepo for learning and practicing software architecture across multiple tech stacks (frontend, backend, fullstack, mobile, desktop, ML/AI).

## Repository Structure

```
cooking/
├── projects/           # All projects, categorized by type
│   ├── frontend/       # Next.js, Vue projects
│   ├── backend/        # Go, Node.js, Python APIs
│   ├── fullstack/      # Full-stack applications
│   ├── mobile/         # React Native, Expo apps
│   ├── desktop/        # Desktop applications
│   └── ml-ai/          # Machine Learning & AI projects
├── shared/             # Reusable code across projects
│   ├── ui-components/  # Shared UI components
│   ├── utils/          # Utility functions
│   └── configs/        # Shared configurations (ESLint, Prettier, TSConfig)
├── templates/          # Project scaffolding templates
│   ├── nextjs/         # Next.js 14 + TypeScript + SASS (primary frontend)
│   ├── golang/         # Go + Gin + GORM + PostgreSQL (clean architecture)
│   ├── nodejs/         # Express + TypeScript
│   ├── python/         # FastAPI + Pydantic
│   ├── react/          # React + Vite + TypeScript
│   └── docker/         # Dockerfile + Docker Compose + PostgreSQL
├── infrastructure/     # Infrastructure as Code
│   ├── docker/         # Docker Compose files
│   ├── kubernetes/     # K8s manifests
│   ├── terraform/      # Terraform configs
│   └── ci-cd/          # CI/CD pipeline configs
├── tools/              # Developer tooling
│   ├── scripts/        # Utility scripts (create-project.sh)
│   └── generators/     # Code generators
└── docs/               # Documentation & learnings
    ├── architecture/   # ADRs and design philosophy
    ├── guides/         # How-to guides
    └── learnings/      # Notes and insights
```

## Creating a New Project

```bash
# Using Makefile (recommended)
make new-project NAME=my-app TEMPLATE=nextjs
make new-project NAME=my-api TEMPLATE=golang

# Or directly
./tools/scripts/create-project.sh my-app nextjs

# Available templates: nextjs, golang, nodejs, python, react, docker
```

The script auto-detects the project category (frontend/backend/fullstack/mobile) based on the template type and places it in the correct `projects/<category>/` directory.

## Code Conventions

- **Files**: `kebab-case` (e.g., `user-service.ts`), Go uses `snake_case`
- **Variables/Functions**: `camelCase` (JS/TS/Python), `camelCase` exported / `camelCase` unexported (Go)
- **Classes/Components**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Max line length**: 100 characters
- **Indentation**: 2 spaces (JS/TS/JSON/YAML), 4 spaces (Python/Dockerfile), tabs (Go, Makefile)
- **Line endings**: LF (Unix-style, enforced via `.gitattributes` and `.editorconfig`)
- **Semicolons**: No semicolons (JS/TS — enforced by Prettier)
- **Quotes**: Single quotes (JS/TS), double quotes (JSX)
- **Trailing commas**: ES5-compatible (`es5` in Prettier)
- **Imports**: Sorted and grouped (enforced by `eslint-plugin-import`) — order: builtin → external → internal → parent/sibling → index → type
- **Type imports**: Use `import type` for type-only imports (enforced by `@typescript-eslint/consistent-type-imports`)
- **Equality**: Always use `===` / `!==` (enforced by `eqeqeq` rule)
- **Braces**: Always use braces for `if/else/for/while` (enforced by `curly` rule)
- **Console**: Avoid `console.log` — only `console.warn` and `console.error` are allowed

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve login redirect loop
docs: update API documentation
refactor: extract validation logic
test: add unit tests for user service
chore: update dependencies
```

## Branch Naming

- `project/<name>` — new project work
- `feature/<name>` — new features within a project
- `fix/<name>` — bug fixes

## Tech Stack Preferences

| Layer    | Primary                       | Secondary                           |
| -------- | ----------------------------- | ----------------------------------- |
| Frontend | Next.js, TypeScript           | Vue                                 |
| Styling  | Tailwind CSS, SASS            | Styled Components                   |
| Backend  | Go (Gin + GORM)               | Node.js (Express), Python (FastAPI) |
| Database | **PostgreSQL**                | SQLite (dev only)                   |
| Testing  | testify (Go), Vitest, pytest  | —                                   |
| CI/CD    | GitHub Actions                | —                                   |
| Infra    | Docker, Kubernetes, Terraform | —                                   |

## Golang Clean Architecture

The Go template follows Clean Architecture with 4 layers:

```
domain/         → Entities + Repository interfaces (no external deps)
services/       → Business logic (depends on domain interfaces)
repositories/   → Interface implementations (GORM + PostgreSQL)
handlers/       → HTTP layer (Gin)
```

Dependency rule: outer layers depend on inner layers via **interfaces**.

## npm Workspaces

This repo uses npm workspaces. Workspace paths:

- `projects/*/*` — all projects
- `shared/*` — shared packages

Run from root: `npm install` to install all workspace dependencies.

## Code Quality Tools

| Tool             | Config File                         | Purpose                                        |
| ---------------- | ----------------------------------- | ---------------------------------------------- |
| **Prettier**     | `.prettierrc`                       | Code formatting (JS/TS/JSON/YAML/MD/CSS)       |
| **ESLint**       | `.eslintrc.json`                    | Linting (JS/TS)                                |
| **EditorConfig** | `.editorconfig`                     | Editor-level formatting (indent, charset, EOL) |
| **Husky**        | `.husky/`                           | Git hooks (pre-commit, commit-msg)             |
| **lint-staged**  | `.lintstagedrc.json`                | Run linters on staged files only               |
| **commitlint**   | `commitlint.config.js`              | Enforce conventional commit messages           |
| **TypeScript**   | `shared/configs/tsconfig.base.json` | Strict type checking                           |

### Shared Configs (in `shared/configs/`)

Projects should extend these base configs for consistency:

- `prettier.config.js` — shared Prettier rules
- `eslint.base.js` — shared ESLint rules
- `tsconfig.base.json` — shared TypeScript compiler options

## Key Commands

```bash
make help           # Show all available commands
make setup          # Setup dev environment + install deps + init husky
make new-project    # Create project from template
make install        # Install deps for all projects
make test           # Run all tests
make lint           # Run all linters
make format         # Format all code
make format-check   # Check formatting without changes
make clean          # Remove build artifacts & node_modules
```

## Important Notes

- Each project MUST have its own README.md
- Use TypeScript for all JS/TS projects
- Use PostgreSQL as the default database for all projects
- Aim for >80% test coverage
- Document architecture decisions as ADRs in `docs/architecture/`
- The `shared/` directory is for code reused across multiple projects
- Templates in `templates/` use `{{PROJECT_NAME}}` as placeholder — replaced by create-project.sh
- Run `make setup` after cloning to initialize Husky git hooks
- All code must pass `lint` and `format:check` before merging (enforced by CI)
