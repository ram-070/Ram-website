# Ram's ML Engineer Portfolio

Personal portfolio site for a Machine Learning Engineer, built with Next.js, React, TypeScript, Tailwind CSS, and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm start
```

## Project layout

- `src/app` - App router pages, layout, and global styles
- `src/components` - Shared editors and UI components
- `src/content` - Static profile and certification data
- `src/lib` - Prisma and utility helpers
- `src/pages/api` - API routes used by the editors

## Notes

The repository keeps only the files needed by the app and its local editors. Generated setup/checklist documents were removed to reduce clutter.

## Contact form email setup

The contact form sends mail through SMTP. Copy `.env.example` to `.env.local` (or `.env.production`) and set your SMTP credentials.

Required variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `CONTACT_TO_EMAIL` (defaults to `rammey115@gmail.com`)

