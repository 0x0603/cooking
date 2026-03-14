# {{PROJECT_NAME}}

REST API with Go, Gin, GORM, and PostgreSQL — following Clean Architecture principles.

## Architecture

```
cmd/server/main.go          ← Entry point & dependency wiring
internal/
├── domain/                 ← Domain layer (entities + repository interfaces)
│   ├── user.go             ← User entity (pure Go struct, no ORM tags)
│   └── repository.go       ← Repository interfaces (contracts)
├── models/                 ← Infrastructure layer (GORM models)
│   └── user.go             ← GORM model with DB tags
├── repositories/           ← Infrastructure layer (interface implementations)
│   └── user_repository.go  ← PostgreSQL + GORM implementation
├── services/               ← Application layer (business logic)
│   └── user_service.go     ← Depends on interfaces, not implementations
├── handlers/               ← Presentation layer (HTTP handlers)
│   └── health.go
├── middleware/              ← HTTP middleware
│   ├── cors.go
│   ├── logger.go
│   └── recovery.go
└── config/                 ← Configuration
    └── config.go
pkg/utils/                  ← Shared utilities
├── database.go             ← PostgreSQL connection
└── logger.go               ← Zap logger setup
```

### Dependency Flow (Clean Architecture)

```
Handler → Service → Repository Interface ← Repository Implementation
                         ↑                           ↓
                    domain.UserRepository       GORM + PostgreSQL
```

Services depend on **interfaces** (defined in `domain/`), not on concrete implementations.
This makes the business logic testable and database-agnostic.

## Tech Stack

| Component     | Library          |
| ------------- | ---------------- |
| Web framework | Gin              |
| ORM           | GORM             |
| Database      | PostgreSQL       |
| Config        | Viper + godotenv |
| Logging       | Zap              |
| Auth          | golang-jwt       |
| Password      | bcrypt           |
| Testing       | testify          |
| Linting       | golangci-lint    |

## Getting Started

```bash
# 1. Copy env and configure
cp .env.example .env

# 2. Start PostgreSQL (via Docker or local install)
docker run -d --name postgres -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB={{PROJECT_NAME}}_db \
  postgres:16-alpine

# 3. Install dependencies
go mod tidy

# 4. Run
make run
```

Server starts at `http://localhost:8080`.

## Commands

| Command              | Description            |
| -------------------- | ---------------------- |
| `make run`           | Run the server         |
| `make build`         | Build binary           |
| `make test`          | Run all tests          |
| `make test-coverage` | Tests with coverage    |
| `make lint`          | Run golangci-lint      |
| `make lint-fix`      | Lint and auto-fix      |
| `make tidy`          | Tidy go modules        |
| `make clean`         | Remove build artifacts |

## API Endpoints

| Method | Path           | Description  |
| ------ | -------------- | ------------ |
| GET    | `/health`      | Health check |
| GET    | `/api/v1/ping` | Ping/pong    |

## Environment Variables

| Variable         | Description                    | Default       |
| ---------------- | ------------------------------ | ------------- |
| `SERVER_PORT`    | Server port                    | `8080`        |
| `SERVER_HOST`    | Server host                    | `localhost`   |
| `ENVIRONMENT`    | `development` or `production`  | `development` |
| `DB_HOST`        | PostgreSQL host                | `localhost`   |
| `DB_PORT`        | PostgreSQL port                | `5432`        |
| `DB_USER`        | Database user                  | `postgres`    |
| `DB_PASSWORD`    | Database password              | —             |
| `DB_NAME`        | Database name                  | —             |
| `DB_SSLMODE`     | SSL mode (`disable`/`require`) | `disable`     |
| `JWT_SECRET`     | JWT signing key                | —             |
| `JWT_EXPIRATION` | Token expiry in hours          | `24`          |

## Adding a New Feature

1. Define entity in `internal/domain/` (pure struct)
2. Add repository interface in `internal/domain/repository.go`
3. Create GORM model in `internal/models/`
4. Implement repository in `internal/repositories/`
5. Write service in `internal/services/` (depends on interface)
6. Create handler in `internal/handlers/`
7. Wire dependencies in `cmd/server/main.go`
8. Add routes
