# Contract Management

AI-powered contract understanding and management for enterprise supplier contracts.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL + Prisma
- **Auth:** NextAuth.js v5 (credentials)
- **File Storage:** Local disk (`./uploads`) in dev, swappable to S3

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` - SQLite for local dev: `file:./dev.db`; or PostgreSQL for production
- `NEXTAUTH_URL` - App URL (e.g. `http://localhost:3000`)
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `OPENAI_API_KEY` - (Optional) For LLM-powered contract extraction. Get from [OpenAI API Keys](https://platform.openai.com/api-keys). **Never commit real keys**; `.env` is in `.gitignore`. Without it, extraction uses a stub (empty values + rules-based opportunities).

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema (SQLite: npm run db:push | PostgreSQL: npm run db:migrate)
npm run db:push

# Seed admin user + sample contracts
npm run db:seed
```

### 4. Run Development Server

```bash
npm dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to sign in.

### Seed Credentials

- **Email:** admin@example.com
- **Password:** Admin123!

### LLM Extraction (Optional)

To extract real contract data using AI:

1. Add `OPENAI_API_KEY` to `.env` (see `.env.example`)
2. Test the key: `GET /api/extract/test` or `GET /api/extract/test?ping=1` (makes a minimal API call)
3. Upload a PDF contract; extraction runs automatically and populates the dashboard

### Troubleshooting: Prisma "self-signed certificate" error

If `npm run db:generate` fails with "self-signed certificate in certificate chain" (common on corporate networks/proxies), the `db:generate` script includes a workaround. If it still fails, run manually:

```bash
# Windows PowerShell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; npx prisma generate

# macOS/Linux
NODE_TLS_REJECT_UNAUTHORIZED=0 npx prisma generate
```

This only affects the Prisma binary download, not your app's runtime. For a permanent fix, add your organization's root CA to `NODE_EXTRA_CA_CERTS`.

## Scripts

| Script       | Description                    |
| ------------ | ------------------------------ |
| `npm run dev` | Start dev server               |
| `npm run build` | Production build               |
| `npm run start` | Start production server        |
| `npm run db:generate` | Generate Prisma client         |
| `npm run db:push` | Push schema (no migrations)    |
| `npm run db:migrate` | Run migrations                 |
| `npm run db:seed` | Seed database                  |
| `npm run db:studio` | Open Prisma Studio             |

## Features

- **Auth & RBAC:** Sign in, role-based access (Admin, Legal, Procurement, ReadOnly)
- **Contract CRUD:** List, filter, search, create, update
- **PDF Upload:** Upload contract PDFs, stored locally with metadata in DB
- **Extraction:** PDF text extraction + LLM-powered MRO field extraction (or stub fallback when `OPENAI_API_KEY` is not set)
- **Dashboard:** Real extracted insights (key stats, opportunities) when LLM is configured
- **Activity Timeline:** Track uploads, extractions, status changes
- **Compare:** Side-by-side text diff between contract versions

## API Routes

- `GET /api/contracts` - List contracts (filters: search, type, status, risk)
- `POST /api/contracts` - Create contract + upload PDF
- `GET /api/contracts/[id]` - Contract detail with terms, clauses, obligations
- `PATCH /api/contracts/[id]` - Update contract
- `POST /api/contracts/[id]/extract` - Run MRO extraction (LLM or stub)
- `GET /api/contracts/[id]/activity` - Activity events
- `GET /api/contracts/[id]/compare?baseVersion=...&otherContract=...` - Text diff
- `GET /api/extract/test` - Check if `OPENAI_API_KEY` is set; `?ping=1` validates the key
- `GET /api/documents/[documentId]/file` - Stream PDF (auth required)

## Collaborators

To add team members (e.g. Sabbarish, Talia, Joe):

1. Open the repo on GitHub: [Contract_Management](https://github.com/avirshuk-alt/Contract_Management)
2. Settings → Collaborators → Add people
3. Each collaborator should:
   - Clone the repo
   - Copy `.env.example` to `.env` and add their own `OPENAI_API_KEY` (optional, for extraction)
   - Run `npm install`, `npm run db:push`, `npm run db:seed`, `npm run dev`
