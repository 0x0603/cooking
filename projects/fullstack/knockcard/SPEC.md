# KnockCard — Product Specification

> NFC digital business card platform. Tap → Open profile → Connect.
> Domain: **knockcard.io**

## Tech Stack

| Layer       | Choice                       | Reason                               |
| ----------- | ---------------------------- | ------------------------------------ |
| Framework   | Next.js 14 (App Router)      | Fullstack, SSR for public profiles   |
| Language    | TypeScript                   | Type safety                          |
| Styling     | Tailwind CSS + Framer Motion | Rapid UI + animations from prototype |
| Database    | PostgreSQL (Neon)            | Free tier 0.5GB, managed             |
| ORM         | Prisma                       | Type-safe queries, migrations        |
| Auth        | NextAuth.js                  | Google/GitHub OAuth                  |
| Storage     | Cloudinary                   | Free 25GB, auto image optimization   |
| Cache       | Upstash Redis                | Free 10K commands/day, rate limiting |
| Drag & Drop | dnd-kit                      | Lightweight, accessible              |
| Deploy      | Vercel (Hobby)               | $0/mo, 100GB bandwidth               |
| Domain      | knockcard.io                 | ~$12/year                            |

**Total MVP cost: $0/mo** (domain ~$12/year only)

---

## Database Schema

### users

| Column     | Type         | Notes           |
| ---------- | ------------ | --------------- |
| id         | uuid (PK)    | gen_random_uuid |
| email      | varchar(255) | unique          |
| name       | varchar(255) |                 |
| avatar_url | text         | nullable        |
| created_at | timestamptz  | default now()   |
| updated_at | timestamptz  |                 |

### cards

| Column          | Type         | Notes                       |
| --------------- | ------------ | --------------------------- |
| id              | uuid (PK)    |                             |
| user_id         | uuid (FK)    | → users.id                  |
| slug            | varchar(100) | unique, indexed             |
| display_name    | varchar(255) |                             |
| title           | varchar(255) | job title                   |
| company         | varchar(255) | nullable                    |
| bio             | text         | nullable                    |
| cover_photo_url | text         | nullable                    |
| avatar_url      | text         | nullable                    |
| theme           | varchar(20)  | 'dark' / 'light' / 'custom' |
| theme_config    | jsonb        | custom colors, nullable     |
| is_published    | boolean      | default false               |
| created_at      | timestamptz  |                             |
| updated_at      | timestamptz  |                             |

### card_sections

| Column     | Type         | Notes                                                        |
| ---------- | ------------ | ------------------------------------------------------------ |
| id         | uuid (PK)    |                                                              |
| card_id    | uuid (FK)    | → cards.id, ON DELETE CASCADE                                |
| type       | varchar(50)  | about / contact / social / gallery / video / links / payment |
| title      | varchar(255) | nullable, override default section title                     |
| content    | jsonb        | flexible data per type                                       |
| sort_order | integer      | for drag-drop ordering                                       |
| is_visible | boolean      | default true                                                 |
| created_at | timestamptz  |                                                              |

#### content JSONB by type

```jsonc
// type: "about"
{ "text": "Building elegant digital experiences..." }

// type: "contact"
{ "items": [
  { "type": "phone", "label": "Phone", "value": "+84 123 456 789" },
  { "type": "email", "label": "Email", "value": "sang@example.com" },
  { "type": "website", "label": "Website", "value": "sangnguyen.dev" },
  { "type": "location", "label": "Location", "value": "Ho Chi Minh City" }
]}

// type: "social"
{ "items": [
  { "platform": "linkedin", "url": "https://linkedin.com/in/sang" },
  { "platform": "github", "url": "https://github.com/sang" },
  { "platform": "zalo", "url": "https://zalo.me/0123456789" },
  { "platform": "custom", "url": "https://...", "label": "My Blog", "icon_url": "..." }
]}

// type: "gallery"
{ "images": ["url1", "url2", "url3"], "columns": 2 }

// type: "video"
{ "url": "https://youtube.com/watch?v=...", "autoplay": false }

// type: "links"
{ "items": [
  { "label": "My Portfolio", "url": "https://...", "icon": "🎨" },
  { "label": "Download CV", "url": "https://...", "icon": "📄" }
]}

// type: "payment"
{ "methods": [
  { "type": "momo", "phone": "0123456789" },
  { "type": "vnpay", "qr_url": "https://..." }
]}
```

### analytics_events

| Column     | Type         | Notes                          |
| ---------- | ------------ | ------------------------------ |
| id         | uuid (PK)    |                                |
| card_id    | uuid (FK)    | → cards.id                     |
| event_type | varchar(20)  | view / save_contact / exchange |
| visitor_ip | varchar(45)  | nullable                       |
| user_agent | text         | nullable                       |
| country    | varchar(100) | nullable, from IP              |
| city       | varchar(100) | nullable                       |
| referrer   | text         | nullable                       |
| created_at | timestamptz  | indexed                        |

### exchange_contacts

| Column     | Type         | Notes      |
| ---------- | ------------ | ---------- |
| id         | uuid (PK)    |            |
| card_id    | uuid (FK)    | → cards.id |
| name       | varchar(255) |            |
| email      | varchar(255) | nullable   |
| phone      | varchar(50)  | nullable   |
| note       | text         | nullable   |
| created_at | timestamptz  |            |

### nfc_tags

| Column       | Type         | Notes                |
| ------------ | ------------ | -------------------- |
| id           | uuid (PK)    |                      |
| tag_uid      | varchar(100) | unique, NFC chip ID  |
| card_id      | uuid (FK)    | → cards.id, nullable |
| activated_at | timestamptz  | nullable             |
| created_at   | timestamptz  |                      |

---

## Supported Social Platforms

| Category    | Platforms                                                |
| ----------- | -------------------------------------------------------- |
| Popular     | LinkedIn, GitHub, Instagram, Facebook, Twitter/X, TikTok |
| VN-specific | Zalo, Shopee, Lazada                                     |
| Messaging   | WhatsApp, Telegram, Viber, Line                          |
| Work        | Behance, Dribbble, Figma, Medium, Dev.to                 |
| Video       | YouTube, Twitch                                          |
| Music       | Spotify, SoundCloud                                      |
| Payment     | Momo, VNPay, PayPal                                      |
| Custom      | User-defined URL + icon + label                          |

---

## Pages & Routes

```
/                          Landing page (marketing)
/login                     Auth (Google/GitHub OAuth)
/dashboard                 Card list + analytics overview
/dashboard/cards/new       Create new card
/dashboard/cards/:id       Edit card (drag-drop sections)
/dashboard/analytics       Detailed analytics
/:slug                     Public profile page (SSR, cached)
```

---

## API Routes (Next.js)

```
GET    /api/auth/[...nextauth]   NextAuth handlers
GET    /api/me                   Current user

GET    /api/cards                List my cards
POST   /api/cards                Create card
GET    /api/cards/:id            Get card details
PUT    /api/cards/:id            Update card
DELETE /api/cards/:id            Delete card

PUT    /api/cards/:id/sections   Batch update section order (drag-drop)
POST   /api/cards/:id/sections   Add section
PUT    /api/sections/:id         Update section content
DELETE /api/sections/:id         Delete section

GET    /api/cards/:id/analytics  Analytics data
POST   /api/track                Track view/save/exchange event

POST   /api/exchange             Submit exchange contact form
GET    /api/cards/:id/exchanges  List received exchange contacts

POST   /api/upload               Upload image to Cloudinary

GET    /api/og/:slug             Open Graph image (dynamic)
```

---

## MVP Features

### Public Profile (`/:slug`)

- [x] Hero photo + name + title overlay
- [x] border-bottom-right-radius hero accent
- [x] Shimmer + particle animations
- [x] Save Contact → download vCard (.vcf)
- [x] Exchange Contact → form popup
- [x] Scroll animations (fade-in, stagger, parallax)
- [x] Dynamic sections rendered by sort_order
- [x] Theme: dark / light
- [x] QR code fallback
- [x] SEO meta tags + Open Graph image
- [x] Mobile-first responsive

### Dashboard

- [ ] Google/GitHub OAuth login
- [ ] Create / edit / delete cards
- [ ] Upload cover photo + avatar (Cloudinary)
- [ ] Drag-drop section ordering (dnd-kit)
- [ ] Add/remove/toggle sections
- [ ] Custom social links (pick platform or custom URL)
- [ ] Theme picker (dark / light)
- [ ] Custom slug editor
- [ ] Publish/unpublish toggle
- [ ] Analytics overview (views, saves, exchanges, chart)

### NFC

- [ ] NFC tag → URL redirect to profile
- [ ] Admin: assign NFC tag UID to card

---

## Monetization (Post-MVP)

| Plan | Price     | Features                                                                                                             |
| ---- | --------- | -------------------------------------------------------------------------------------------------------------------- |
| Free | $0        | 1 card, 5 social links, basic sections, 7-day analytics, "Powered by KnockCard"                                      |
| Pro  | $5-10/mo  | Unlimited cards + links, all section types, unlimited analytics, custom domain, remove branding, custom theme colors |
| Team | $20-50/mo | Company card management, CRM export, team analytics                                                                  |

---

## Project Structure

```
projects/fullstack/knockcard/
├── prisma/
│   └── schema.prisma
├── public/
│   └── icons/                 # Social platform icons (SVG)
├── src/
│   ├── app/
│   │   ├── (marketing)/       # Landing page
│   │   │   └── page.tsx
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     # Dashboard shell
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx   # Overview
│   │   │   │   ├── cards/
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   └── analytics/page.tsx
│   │   ├── [slug]/
│   │   │   └── page.tsx       # Public profile (SSR)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── cards/route.ts
│   │   │   ├── cards/[id]/route.ts
│   │   │   ├── cards/[id]/sections/route.ts
│   │   │   ├── sections/[id]/route.ts
│   │   │   ├── track/route.ts
│   │   │   ├── exchange/route.ts
│   │   │   └── upload/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── profile/           # Public profile components
│   │   │   ├── hero.tsx
│   │   │   ├── section-renderer.tsx
│   │   │   ├── about-section.tsx
│   │   │   ├── contact-section.tsx
│   │   │   ├── social-section.tsx
│   │   │   ├── gallery-section.tsx
│   │   │   ├── links-section.tsx
│   │   │   ├── save-contact-btn.tsx
│   │   │   └── exchange-form.tsx
│   │   ├── dashboard/         # Dashboard components
│   │   │   ├── card-editor.tsx
│   │   │   ├── section-list.tsx       # Drag-drop sortable
│   │   │   ├── section-editor.tsx
│   │   │   ├── social-link-picker.tsx
│   │   │   ├── theme-picker.tsx
│   │   │   ├── image-upload.tsx
│   │   │   └── analytics-chart.tsx
│   │   └── ui/               # Shared UI primitives
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       └── card.tsx
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config
│   │   ├── cloudinary.ts      # Upload helper
│   │   ├── vcard.ts           # Generate .vcf file
│   │   ├── analytics.ts       # Track events
│   │   ├── platforms.ts       # Social platform registry
│   │   └── utils.ts
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── README.md
```

---

## Deployment Costs

| Users  | Estimated Cost        |
| ------ | --------------------- |
| 0-500  | $0/mo + $12/yr domain |
| 500-5K | ~$25/mo (Neon Pro)    |
| 5K-50K | ~$80-150/mo           |
| 50K+   | ~$300-500/mo          |
