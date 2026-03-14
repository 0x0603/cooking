# Tech Stack Recommendations

Tech stack suggestions and best practices for projects.

## Frontend: Next.js Stack

### Core (Selected)

- **Next.js 14+** - React framework with App Router
- **SCSS/SASS** - CSS preprocessor
- **ESLint** - Code linting

### Highly Recommended Additions

#### 1. TypeScript

- **Why**: Type safety, better DX, catch errors early
- **Package**: `typescript`, `@types/node`, `@types/react`

#### 2. Prettier

- **Why**: Code formatting, consistent style
- **Package**: `prettier`, `eslint-config-prettier`
- **Config**: `.prettierrc`, `.prettierignore`

#### 3. Path Aliases

- **Why**: Clean imports (`@/components` instead of `../../../components`)
- **Config**: `tsconfig.json` paths, `next.config.js`

#### 4. Environment Variables

- **Why**: Secure config management
- **Package**: Built-in Next.js support
- **Files**: `.env.local`, `.env.example`

#### 5. Testing

- **Vitest** or **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** or **Cypress** - E2E testing

#### 6. State Management (if needed)

- **Zustand** - Lightweight, simple
- **TanStack Query (React Query)** - Server state
- **Jotai** - Atomic state management

#### 7. Form Handling

- **React Hook Form** - Form validation
- **Zod** - Schema validation (works great with RHF)

#### 8. UI Components

- **shadcn/ui** - Copy-paste components
- **Radix UI** - Headless components
- **Tailwind CSS** - Utility-first CSS (optional, can be used with SCSS)

#### 9. Code Quality

- **Husky** - Git hooks
- **lint-staged** - Lint on commit
- **commitlint** - Conventional commits

#### 10. Performance & SEO

- **next-seo** - SEO optimization
- **next/image** - Optimized images
- **next/font** - Font optimization

### Optional but Useful

- **Storybook** - Component documentation
- **MSW (Mock Service Worker)** - API mocking
- **Sentry** - Error tracking
- **Analytics** - Vercel Analytics, Google Analytics

---

## Backend: Golang Stack

### Core (Selected)

- **Golang 1.21+**

### Highly Recommended Additions

#### 1. Web Framework

- **Gin** - Fast, lightweight (recommended)
- **Echo** - High performance
- **Fiber** - Express-like syntax
- **Chi** - Lightweight router

#### 2. Database

- **GORM** - ORM (easy to use)
- **sqlx** - Lightweight SQL toolkit
- **Ent** - Entity framework (type-safe)
- **pgx** - PostgreSQL driver

#### 3. Configuration

- **Viper** - Configuration management
- **godotenv** - Environment variables

#### 4. Validation

- **validator** - Struct validation
- **go-playground/validator** - Popular choice

#### 5. Authentication & Security

- **golang-jwt/jwt** - JWT tokens
- **bcrypt** - Password hashing
- **cors** - CORS middleware

#### 6. Logging

- **Zap** - Fast, structured logging (recommended)
- **Logrus** - Popular alternative
- **zerolog** - Zero allocation logger

#### 7. Testing

- **testify** - Testing toolkit
- **gomock** - Mock generation
- **httptest** - HTTP testing

#### 8. API Documentation

- **Swagger/OpenAPI** - API docs
- **go-swagger** - Swagger generation

#### 9. Database Migrations

- **golang-migrate** - Database migrations
- **sql-migrate** - Alternative

#### 10. Code Quality

- **golangci-lint** - Linter aggregator
- **gofmt** - Code formatting (built-in)
- **go vet** - Static analysis (built-in)

### Architecture Patterns

#### Project Structure

```
cmd/
  └── server/
      └── main.go
internal/
  ├── handlers/     # HTTP handlers
  ├── services/     # Business logic
  ├── repositories/ # Data access
  ├── models/       # Data models
  ├── middleware/   # HTTP middleware
  └── config/       # Configuration
pkg/                # Public packages
migrations/         # Database migrations
tests/              # Test files
```

#### Clean Architecture Layers

- **Handlers** - HTTP layer
- **Services** - Business logic
- **Repositories** - Data access
- **Models** - Domain models

### Optional but Useful

- **Docker** - Containerization
- **Air** - Live reload for development
- **Wire** - Dependency injection
- **gRPC** - RPC framework (if needed)
- **Prometheus** - Metrics
- **Jaeger** - Distributed tracing

---

## Full Stack Integration

### API Communication

- **REST API** - Standard REST
- **GraphQL** - For flexible queries
- **tRPC** - Type-safe APIs (TypeScript only)

### Authentication Flow

1. Next.js frontend calls Go backend
2. Go backend validates and returns JWT
3. Frontend stores token (httpOnly cookie recommended)
4. Include token in subsequent requests

### CORS Configuration

```go
// Go backend
config.AllowOrigins = []string{"http://localhost:3000"}
config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}
```

### Environment Variables

- Frontend: `.env.local` (public vars only)
- Backend: `.env` (all vars, never commit)

---

## Recommended Project Structure

### Next.js Project

```
app/                    # App Router (Next.js 13+)
├── (auth)/            # Route groups
├── api/               # API routes (optional)
├── globals.scss       # Global styles
components/
├── ui/                # Reusable UI components
├── features/          # Feature components
├── layouts/           # Layout components
lib/                   # Utilities
├── api/               # API client
├── utils/             # Helper functions
├── hooks/             # Custom hooks
├── types/             # TypeScript types
└── constants/         # Constants
public/                # Static files
styles/                # SCSS files
tests/                 # Test files
```

### Golang Project

```
cmd/
  └── server/
      └── main.go
internal/
  ├── api/
  │   ├── handlers/
  │   ├── middleware/
  │   └── routes.go
  ├── domain/
  │   ├── models/
  │   └── services/
  ├── infrastructure/
  │   ├── database/
  │   └── config/
  └── pkg/
      └── utils/
migrations/
tests/
```

---

## Development Workflow

### Frontend

```bash
npm run dev          # Development
npm run build        # Production build
npm run lint         # Lint code
npm run test         # Run tests
npm run type-check   # TypeScript check
```

### Backend

```bash
go run cmd/server/main.go  # Development
go build                    # Build binary
go test ./...              # Run tests
golangci-lint run          # Lint code
go mod tidy                # Clean dependencies
```

---

## Next Steps

1. **Choose specific versions** for each package
2. **Setup project structure** following recommendations
3. **Configure tools** (ESLint, Prettier, etc.)
4. **Create templates** with best practices
5. **Document decisions** in ADRs
