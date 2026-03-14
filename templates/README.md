# Templates Summary

Overview of available templates.

## Next.js Template

**Location**: `templates/nextjs/`

### Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- SCSS/SASS
- ESLint + Prettier
- Vitest + React Testing Library

### Features

- TypeScript with strict mode
- SCSS support with module styles
- Path aliases (@/components, @/lib, etc.)
- API client utility
- Example components with tests
- Environment variables setup

### Usage

```bash
make new-project NAME=my-app TEMPLATE=nextjs
cd projects/frontend/my-app
npm install
npm run dev
```

---

## Golang Template

**Location**: `templates/golang/`

### Tech Stack

- Golang 1.21+
- Gin (Web framework)
- GORM (ORM)
- MySQL
- Viper (Configuration)
- Zap (Logging)
- testify (Testing)

### Features

- Clean architecture structure
- Database setup with GORM
- Configuration management
- Structured logging
- Middleware (Logger, Recovery, CORS)
- Example models, repositories, services
- Testing setup

### Usage

```bash
make new-project NAME=my-api TEMPLATE=golang
cd projects/backend/my-api
cp .env.example .env
# Update .env with your database credentials
go mod tidy
make run
```

---

## Available Templates

| Template | Category | Description                    |
| -------- | -------- | ------------------------------ |
| `nextjs` | frontend | Next.js + TypeScript + SCSS    |
| `react`  | frontend | React + TypeScript + Vite      |
| `golang` | backend  | Golang + Gin + GORM            |
| `nodejs` | backend  | Node.js + Express + TypeScript |
| `python` | backend  | Python + FastAPI               |

---

## Creating a New Template

1. Create directory in `templates/`
2. Setup project structure
3. Add README.md
4. Update `create-project.sh` to support new template
5. Test template creation
