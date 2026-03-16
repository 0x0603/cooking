# KnockCard

NFC digital business card platform. Tap your phone → share your profile instantly.

## Features

- **Public Profile** — Beautiful, animated profile page with hero photo, contact info, social links
- **Dashboard** — Create and manage multiple cards, upload images, customize themes
- **Drag & Drop Sections** — Reorder About, Contact, Social, Gallery, Links sections
- **25+ Social Platforms** — LinkedIn, GitHub, Instagram, Zalo, Momo, and more
- **Save Contact** — One-tap vCard (.vcf) download
- **Exchange Contact** — Visitors can share their info back
- **Analytics** — Track views, saves, exchanges with daily charts
- **NFC Ready** — Each NFC tag maps to a unique profile URL
- **Themes** — Dark and light modes

## Tech Stack

| Layer       | Technology                   |
| ----------- | ---------------------------- |
| Framework   | Next.js 14 (App Router)      |
| Language    | TypeScript                   |
| Styling     | Tailwind CSS + Framer Motion |
| Database    | PostgreSQL (Neon)            |
| ORM         | Prisma                       |
| Auth        | NextAuth.js (Google, GitHub) |
| Storage     | Cloudinary                   |
| Drag & Drop | dnd-kit                      |
| Validation  | zod                          |
| Deploy      | Vercel                       |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)
- Google OAuth credentials
- GitHub OAuth credentials
- Cloudinary account

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your values in .env

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

See `.env.example` for all required variables.

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # OAuth login page
│   ├── (dashboard)/dashboard/ # Card management & analytics
│   ├── [slug]/                # Public profile (SSR)
│   └── api/                   # REST API routes
├── components/
│   ├── profile/               # Public card components
│   ├── dashboard/             # Editor, drag-drop, pickers
│   └── ui/                    # Button, Input, Dialog
├── lib/                       # Prisma, auth, vcard, platforms
└── types/                     # TypeScript definitions
```

## How It Works

1. **User signs in** via Google or GitHub
2. **Creates a card** with a unique slug (e.g., `knockcard.xyz/sang`)
3. **Edits sections** — drag to reorder, toggle visibility, customize content
4. **Publishes** the card
5. **Programs NFC tag** with the profile URL
6. **Someone taps** the NFC → profile loads in browser
7. **Visitor saves contact** (vCard) or **exchanges their info**
8. **User checks analytics** — views, saves, exchanges over time

## Deployment

Deploy to Vercel:

```bash
# Push to GitHub, then connect repo to Vercel
# Set environment variables in Vercel dashboard
# Vercel auto-deploys on push
```

**Estimated cost**: $0/mo on Vercel Hobby + Neon free tier.

## Roadmap

- [ ] Landing page (marketing)
- [ ] Custom themes (custom colors)
- [ ] QR code generation
- [ ] Custom domain support
- [ ] Team/company plans
- [ ] E-commerce: sell physical NFC cards
- [ ] Zapier/webhook integrations
- [ ] Payment section (Momo QR, VNPay)

## License

Private project.
