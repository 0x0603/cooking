# {{PROJECT_NAME}}

REST API with Node.js, Express, and TypeScript.

## Tech Stack

- Node.js 20
- Express 4
- TypeScript 5
- Helmet + CORS
- ESLint + Prettier
- Vitest

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Scripts

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `npm run dev`           | Start dev server (watch) |
| `npm run build`         | Compile TypeScript       |
| `npm start`             | Start production server  |
| `npm run test`          | Run tests in watch mode  |
| `npm run test:coverage` | Run tests with coverage  |
| `npm run lint`          | Run ESLint               |
| `npm run format`        | Format with Prettier     |

## API Endpoints

| Method | Path      | Description  |
| ------ | --------- | ------------ |
| GET    | `/health` | Health check |

## Project Structure

```
src/
├── routes/        # API route handlers
├── tests/         # Test files
└── index.ts       # Entry point & Express setup
```

Add directories as needed: `controllers/`, `services/`, `models/`, `middleware/`, `utils/`, `types/`.
