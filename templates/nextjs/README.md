# Next.js Project Template

Template for Next.js projects with TypeScript, SCSS, ESLint, Prettier, and Vitest.

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **SCSS/SASS** - CSS preprocessor
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing

## Features

- TypeScript setup with strict mode
- SCSS support with module styles
- ESLint + Prettier configuration
- Path aliases (@/components, @/lib, etc.)
- Vitest testing setup
- API client utility
- Example components
- Environment variables setup

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - TypeScript type checking
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
app/                    # Next.js App Router
├── layout.tsx         # Root layout
├── page.tsx           # Home page
components/            # React components
├── Button/           # Example component
lib/                  # Utilities
├── api/              # API client
├── utils/            # Helper functions
├── types/            # TypeScript types
styles/               # SCSS files
├── globals.scss      # Global styles
tests/                # Test files
├── setup.ts          # Test setup
public/               # Static files
```

## Path Aliases

- `@/components` → `./components`
- `@/lib` → `./lib`
- `@/styles` → `./styles`
- `@/types` → `./lib/types`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

## Testing

Tests are written with Vitest and React Testing Library:

```bash
npm run test
```

## Code Quality

- **ESLint**: Configured with Next.js, TypeScript, and Prettier
- **Prettier**: Auto-format on save (configure in your IDE)
- **TypeScript**: Strict mode enabled

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vitest Documentation](https://vitest.dev)
