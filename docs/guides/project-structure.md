# Project Structure Guide

Guide for structuring each project in `projects/`.

## Standard Structure for a Project

### Frontend Project (React/Vue)

```
my-frontend-project/
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/       # Common components (Button, Input, etc.)
│   │   └── features/     # Feature-specific components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── store/            # State management (Redux, Zustand, etc.)
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── styles/           # Global styles
│   ├── assets/           # Images, fonts, etc.
│   └── App.tsx           # Main app component
├── public/               # Static files
├── tests/                # Test files
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts        # or webpack.config.js
└── README.md
```

### Backend Project (Node.js/Express)

```
my-backend-project/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── config/           # Configuration files
│   └── app.ts            # Express app setup
├── tests/
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### Fullstack Project (Next.js)

```
my-fullstack-project/
├── src/
│   ├── app/              # Next.js App Router (or pages/)
│   │   ├── api/         # API routes
│   │   └── (routes)/    # Page routes
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript types
│   └── styles/           # Global styles
├── public/               # Static files
├── prisma/               # Database schema (if using Prisma)
├── tests/
├── .env.example
├── .gitignore
├── package.json
├── next.config.js
└── README.md
```

### Python API (FastAPI)

```
my-python-api/
├── app/
│   ├── api/              # API routes
│   │   └── v1/          # API versioning
│   ├── core/             # Core configuration
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── main.py           # FastAPI app
├── tests/
│   ├── unit/
│   └── integration/
├── alembic/              # Database migrations
├── .env.example
├── .gitignore
├── requirements.txt
├── pyproject.toml
└── README.md
```

## Best Practices

### 1. Separation of Concerns

- **Controllers**: Only handle HTTP requests/responses
- **Services**: Contain business logic
- **Models**: Data structure and database operations
- **Utils**: Pure functions, no side effects

### 2. Feature-based Organization (Optional)

For large projects, consider organizing by features:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types.ts
│   ├── dashboard/
│   └── profile/
├── shared/               # Shared across features
│   ├── components/
│   ├── utils/
│   └── types/
```

### 3. Testing Structure

```
tests/
├── unit/                 # Unit tests
│   ├── utils/
│   └── services/
├── integration/          # Integration tests
│   └── api/
└── e2e/                  # End-to-end tests
```

### 4. Configuration Files

- `.env.example`: Template for environment variables
- `.gitignore`: Ignore node_modules, .env, build files
- `tsconfig.json` / `pyproject.toml`: TypeScript/Python config
- `docker-compose.yml`: Local development setup

## Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Directories**: kebab-case (`user-management/`)
- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions/Variables**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`User`, `ApiResponse`)

## Documentation

Each project should have:

1. **README.md**: Overview, setup, usage
2. **API Documentation**: OpenAPI/Swagger for APIs
3. **Architecture Diagram**: Mermaid diagram for system design
4. **CHANGELOG.md**: Track changes and versions

## Examples

See existing projects in `projects/` for reference on specific structures.
