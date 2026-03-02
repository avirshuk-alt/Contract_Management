# Route map & change summary

## Route structure (final)

| Route | Description |
|-------|-------------|
| `/` | **Home** – **Public.** When logged out: description view + “Log in” button; login form with “Return to Home”. When logged in: launcher tiles (Contracts Library, Dashboard, Comparison, Opportunities, Reports, Settings) + Logout. **Login exists only here.** |
| `/auth/signin` | Redirects to `/` (login is only on Home). |
| `/contracts` | **Contracts Library** – Upload (PDF/DOCX) + table. **Protected.** |
| `/contracts/[id]` | Contract detail. **Protected.** |
| `/dashboard` | Dashboard – KPIs, expiring/high-risk, recent uploads. **Protected.** |
| `/compare` | Comparison placeholder (link to contract compare). **Protected.** |
| `/opportunities` | Opportunities placeholder. **Protected.** |
| `/reports` | Reports placeholder. **Protected.** |
| `/suppliers` | Suppliers list. **Protected.** |
| `/suppliers/[id]` | Supplier detail. **Protected.** |
| `/workflows` | Workflows. **Protected.** |
| `/settings` | Settings. **Protected.** |

**Auth**
- Single hardcoded user: **admin@example.com** / **Admin123!** (NextAuth credentials + DB seed).
- Session persisted via secure cookie (NextAuth). No sign-up, forgot password, or OAuth.
- Any route other than `/` requires login; unauthenticated users are redirected to `/`.

**API** (unchanged)
- `GET/POST /api/contracts`, `GET/PATCH /api/contracts/[id]`, activity, compare, documents.

---

## Files added (this update)

- **components/home-guest-view.tsx** – Logged-out Home: description view + “Log in” button; login form with email/password, “Return to Home”, invalid-credentials error. Uses NextAuth `signIn` with redirect: false.
- **components/home-launcher.tsx** – Logged-in Home: 6 tiles (Contracts Library, Dashboard, Comparison, Opportunities, Reports, Settings) + Logout button. Same Card/design system.
- **app/compare/layout.tsx** – AppShell wrapper for compare.
- **app/compare/page.tsx** – Comparison placeholder page.
- **app/opportunities/layout.tsx** – AppShell wrapper for opportunities.
- **app/opportunities/page.tsx** – Opportunities placeholder page.
- **app/reports/layout.tsx** – AppShell wrapper for reports.
- **app/reports/page.tsx** – Reports placeholder page.

## Files changed (this update)

- **app/page.tsx** – Renders `HomeLauncher` when session exists, else `HomeGuestView`. No standalone welcome text; login/launcher are self-contained.
- **middleware.ts** – Protect all routes except `/`. Redirect `/auth` (and `/auth/signin`) to `/`. Unauthenticated access to any other path → redirect to `/`. Matcher updated to run on all page routes (excluding api, _next, static assets).
- **components/app-sidebar.tsx** – Added Comparison, Opportunities, Reports (with icons) after Dashboard; order: Home, Contracts Library, Dashboard, Comparison, Opportunities, Reports, Suppliers, Workflows, Settings.

## Files unchanged but relevant

- **app/auth/signin/page.tsx** – Still exists; middleware redirects `/auth/signin` to `/` so login is only on Home.
- **components/home-auth-actions.tsx** – No longer used by Home (replaced by HomeGuestView + HomeLauncher); can be removed or kept for reuse elsewhere.
- **lib/auth.ts** – NextAuth config unchanged; single credentials user from seed.

---

## Verification

- Login only with **admin@example.com** / **Admin123!**.
- Invalid credentials show: “Invalid credentials. Please use admin@example.com / Admin123!”.
- Login persists on refresh (NextAuth cookie).
- Visiting `/contracts`, `/dashboard`, etc. when logged out redirects to `/`.
- Home when logged in shows 6 tiles; clicking a tile navigates; Logout returns to Home and shows description + Log in.
- “Return to Home” on the sign-in form switches back to description view (no form).
- UI uses existing Card, Button, spacing, typography across all tabs.
