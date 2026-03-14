# KnockCard — Project Instructions

## Overview

NFC digital business card platform. Users tap NFC → browser opens profile page → save/exchange contact. Built as fullstack Next.js app.

## Tech Stack

- **Framework**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Auth**: NextAuth.js (Google/GitHub OAuth)
- **Storage**: Cloudinary (images)
- **Drag & Drop**: dnd-kit
- **Validation**: zod

## Code Conventions

- No semicolons
- Single quotes
- 2-space indentation
- `camelCase` for variables/functions
- `PascalCase` for components
- `kebab-case` for file names
- `import type` for type-only imports
- Import order: builtin → external (alphabetical) → internal (alphabetical) → type imports
- No `console.log` — use `console.warn` or `console.error` only
- Always use `===` / `!==`

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Dashboard (auth required)
│   │   └── dashboard/
│   │       ├── cards/[id]/    # Card editor with drag-drop
│   │       ├── cards/new/     # Create card
│   │       └── analytics/     # Analytics page
│   ├── [slug]/                # Public profile (SSR)
│   └── api/                   # API routes
├── components/
│   ├── profile/               # Public profile components
│   ├── dashboard/             # Dashboard components
│   └── ui/                    # Shared UI primitives
├── lib/                       # Utilities (prisma, auth, vcard, platforms, analytics)
└── types/                     # TypeScript types
```

## Key Patterns

### Database

- Prisma schema at `prisma/schema.prisma`
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to sync with database
- Card sections use JSONB `content` field — cast with `as unknown as ContentType` when reading

### Drag & Drop Sections

- `sort_order` integer column on `card_sections`
- dnd-kit `SortableContext` + `verticalListSortingStrategy`
- On drag end: `arrayMove` → update local state → PUT `/api/cards/:id/sections` with batch reorder
- Single Prisma `$transaction` to update all sort orders

### Social Platforms

- Registry in `src/lib/platforms.ts` — 25+ platforms with icons, colors, base URLs
- Grouped by category (social, messaging, ecommerce, design, video, music, payment)
- Custom links supported (user provides URL + label)

### Public Profile

- SSR page at `src/app/[slug]/page.tsx`
- Sections rendered dynamically by `sort_order` via `section-renderer.tsx`
- Animations: Framer Motion `useInView` for scroll reveals, parallax on hero
- Theme support: dark / light (controlled by `card.theme`)

### Auth

- NextAuth with JWT strategy
- Session type extended in `src/types/next-auth.d.ts` to include `user.id`
- Dashboard routes protected via `getServerSession` in layout

### API Routes

- All mutations validate with zod schemas
- Auth-required routes check `getServerSession` + ownership
- Public routes: `/api/track` (analytics), `/api/exchange` (contact form)

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx prisma generate  # Regenerate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio (DB GUI)
```

## Environment Variables

Copy `.env.example` to `.env` and fill in values. Required for local dev:

- `DATABASE_URL` — PostgreSQL connection string (Neon)
- `NEXTAUTH_SECRET` — random string (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — `http://localhost:3000`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- `GITHUB_ID` / `GITHUB_SECRET` — GitHub OAuth
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
