# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm start            # Run production server
npm run lint         # ESLint check

npm run prisma:generate   # Regenerate Prisma client after schema changes
npm run prisma:migrate    # Apply schema changes and create a migration
```

There is no test suite configured.

## Architecture

This is a Next.js 16 personal portfolio for an ML Engineer. It uses a **hybrid routing model**:

- **App Router** (`src/app/`) — main portfolio page, `/notes` page, and the contact form API route
- **Pages Router** (`src/pages/api/`) — all data CRUD API routes (notebooks, sections, pages, file uploads)

The `@/*` path alias resolves to `./src/*`.

### Key subsystems

**Portfolio home** (`src/app/page.tsx`): Composition root only — theme state, active-section tracking, resume modal, back-to-top. Sections live in `src/components/sections/` (Nav, Hero, About, Projects, Publications, Skills, Experience, Certifications, Contact, Footer). All data and copy live in `src/content/site.ts` — components never hardcode text. Shared primitives (`Section` shell with eyebrow/title, `Reveal` scroll-fade wrapper, `EASE` curve) are in `src/components/ui.tsx`. Scroll reveals use Framer Motion's `whileInView` — there is no `react-intersection-observer` dependency.

**Notes workspace** (`src/app/notes/`): OneNote-style editor at `/notes`. The entire UI lives in `OneNoteWorkspace.tsx` (a single large client component). It manages Notebook → Section → Page hierarchy, fetches data from the Pages Router API routes, and uses Tiptap for rich text editing with highlight, task list, placeholder, and image extensions. Images can be inserted via a toolbar button or drag-and-drop onto the editor; they upload through `POST /api/uploads` (JPG/PNG/WEBP/GIF, max 10 MB) and are embedded by URL.

**Notes API** (`src/pages/api/`): REST CRUD routes for the Notebook/Section/Page models. Four resource groups: `notebooks/`, `sections/`, `pages/`, `notes/` (full-text search). All backed by SQLite via Prisma.

**Database** (`prisma/`): SQLite (`prisma/dev.db`) with a three-level hierarchy: `Notebook → Section → Page`. Cascade deletes propagate down. The Prisma client is a singleton in `src/lib/prisma.ts` to avoid connection exhaustion in dev.

**Contact form** (`src/app/api/contact/route.ts`): App Router POST handler. Sends email via Nodemailer/SMTP. In development without SMTP credentials set, messages are saved to the `outbox/` directory instead of sent.

**File uploads** (`src/pages/api/uploads.ts`): Multipart upload handler using `formidable`. Saves files to `public/uploads/` and returns public URLs.

**PDF viewer** (`src/components/PDFViewer.tsx`): Wraps `react-pdf` to display `Ram-CV.pdf` (served from project root via `/Ram-CV.pdf`).

### Design system

All color decisions flow from CSS variables in `src/app/globals.css`. Palette: emerald `#157A5C` (`--accent`, spent sparingly — links, active states, status dot), muted blue `#4C6C8C` (`--accent-2`, secondary meta), warm paper `#F6F6F3` ground in light mode, charcoal-navy graphite `#14181D` in dark mode, ink `#1A2434` for headings. Primary buttons are ink-colored (`.btn-solid`), not accent-colored. Borders and whitespace instead of box shadows — shadows only where elevation is real (modals, menus).

Theming: `:root` holds light-mode tokens; `html[data-theme='dark']` overrides them. Theme state lives in `page.tsx` (persisted to `localStorage` under `portfolio_theme`) and sets `data-theme` on `<html>`. Components style exclusively through CSS variables (`var(--text-1)` etc. via inline styles or Tailwind arbitrary values) — there is no `!important` override layer, so dark mode works automatically for anything written with tokens. Never hardcode hex colors in components.

Reusable classes in `globals.css`: `.wrap` (page container), `.eyebrow`, `.btn`/`.btn-solid`/`.btn-quiet`/`.btn-accent`, `.chip`, `.panel`/`.panel-hover`, `.field`, `.link`. The Notes workspace CSS module consumes the same tokens, so palette changes propagate there automatically.

Fonts (set in `layout.tsx` via `next/font`): Schibsted Grotesk (`--font-display`/`--font-schibsted`, headings), Inter (`--font-inter`, body), JetBrains Mono (`--font-mono`, eyebrows/durations/tags).

Motion: one system — fade + 14px rise via `Reveal`, 60–80ms staggers, hover = border-color shift + ≤2px lift. No bounce springs, loops, or parallax. `prefers-reduced-motion` is honored globally.

### Environment variables

Copy `.env.example` to `.env.local` for local development. SMTP variables are optional in dev (falls back to `outbox/`):

| Variable | Purpose |
|---|---|
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP port (default 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | Sender address |
| `CONTACT_TO_EMAIL` | Recipient (defaults to `rammey115@gmail.com`) |
