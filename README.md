# Charni POS v2

Mobile-first Point of Sale (POS) Progressive Web App (PWA) built for smartphone screens.

Rewrite of [Charni POS v1](../knpos) with the same Cloudflare + React stack, a cleaner project layout, and D1 schema managed via numbered SQL migrations instead of a single `schema.sql`.

## Features

- Product catalog and cart management
- Offline-capable PWA experience (`vite-plugin-pwa`)
- Google OAuth sign-in
- Product images stored in Cloudflare R2
- Data persisted in Cloudflare D1 (SQLite)

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Package mgr  | pnpm                                |
| Frontend     | React 19 + Vite 8 + TypeScript      |
| Styling      | Tailwind CSS (Shadcn UI patterns)   |
| State        | Zustand                             |
| Platform     | Cloudflare Pages + Functions        |
| Database     | Cloudflare D1                       |
| Storage      | Cloudflare R2 (product images)      |
| PWA          | vite-plugin-pwa                     |

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (installed as a dev dependency; also run `npx wrangler login` before first use)
- [tmux](https://github.com/tmux/tmux) (required for `make dev`)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Cloudflare login

```bash
npx wrangler login
```

Update [`wrangler.toml`](wrangler.toml) with your D1 database ID and R2 bucket after creating resources in the Cloudflare dashboard (or via `wrangler d1 create` / `wrangler r2 bucket create`).

### 3. Environment

Copy [`.env.example`](.env.example) to `.env.local` and fill in values. Never commit secrets.

| Variable           | Description                              |
|--------------------|------------------------------------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID for sign-in       |
| `R2_PUBLIC_URL`    | Public base URL for R2 product images    |

These are also set as Wrangler `[vars]` for Pages Functions in production.

### 4. Database migrations

```bash
# Local D1
make migrate

# Remote D1 (production/staging)
make remote-migrate
```

Migrations live in [`migrations/`](migrations/) and are applied in filename order.

### 5. Run development server

```bash
# Vite + Wrangler in parallel (recommended)
# Requires tmux. Runs Vite and Wrangler in split panes; creates session
# `charni-dev` if you are not already inside tmux.
make dev

# Vite only
pnpm dev
```

`make dev` runs the Vite dev server and `wrangler pages dev` side by side so `/api` routes proxy to Cloudflare Functions locally.

## Database Seeding

Seed scripts (products, events, shop setup) will mirror the v1 workflow once the schema stabilizes. Until then, see the [v1 seed scripts](../knpos/seed/) for reference.

Expected flow when seeding is implemented:

```bash
make seed          # local D1 + R2
make remote-seed   # remote D1 + R2
```

Seeding requires User ID 1 and Shop ID 1 to exist in D1 before product/event seeds run.

## Deployment

```bash
make deploy
```

Builds the app and deploys to Cloudflare Pages via Wrangler.

## Project Structure

```
charni-pos-v2/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route-level screens
│   ├── stores/         # Zustand stores
│   ├── lib/            # Utilities, API clients
│   └── types/          # Shared TypeScript types
├── functions/          # Cloudflare Pages Functions (API)
├── migrations/         # D1 SQL migrations
├── public/             # Static assets, PWA manifest
└── wrangler.toml       # Cloudflare bindings config
```

## Scripts

| Command              | Description                                      |
|----------------------|--------------------------------------------------|
| `pnpm dev`           | Start Vite dev server                            |
| `pnpm dev:wrangler`  | Start Wrangler Pages dev (API + static)          |
| `pnpm build`         | Production build                                 |
| `pnpm preview`       | Preview production build locally                 |
| `pnpm lint`          | Run ESLint                                       |
| `pnpm deploy`        | Build and deploy to Cloudflare Pages             |
| `make dev`           | Vite + Wrangler in parallel via tmux             |
| `make migrate`       | Apply local D1 migrations                        |
| `make remote-migrate`| Apply remote D1 migrations                       |
| `make deploy`        | Build and deploy to Cloudflare Pages             |

## Contributing

1. Create a feature branch from `main`
2. Run lint before opening a PR
3. Keep changes focused, one concern per PR
