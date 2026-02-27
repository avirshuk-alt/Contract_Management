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

- `DATABASE_URL` - PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/contract_management`)
- `NEXTAUTH_URL` - App URL (e.g. `http://localhost:3000`)
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate

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
- **Extraction:** Lightweight PDF text extraction + heuristic clause/obligation parsing
- **Activity Timeline:** Track uploads, extractions, status changes
- **Compare:** Side-by-side text diff between contract versions

## API Routes

- `GET /api/contracts` - List contracts (filters: search, type, status, risk)
- `POST /api/contracts` - Create contract + upload PDF
- `GET /api/contracts/[id]` - Contract detail with terms, clauses, obligations
- `PATCH /api/contracts/[id]` - Update contract
- `GET /api/contracts/[id]/activity` - Activity events
- `GET /api/contracts/[id]/compare?baseVersion=...&otherContract=...` - Text diff
- `GET /api/documents/[documentId]/file` - Stream PDF (auth required)
