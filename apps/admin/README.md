# Zebraish Admin — Control Center (B.S.A.C.M.)

The founder-only admin app. Every route requires an authenticated `admin`-role session
(`proxy.ts` middleware, checked again server-side via `requireAdmin()` from
`@zebraish/lib/auth` in each page) — there is no public page here except `/login`, and
nothing in the customer-facing `apps/studio` links to this app at all.

- `/` — overview: project/commission counts, recent activity.
- `/projects`, `/projects/[id]` — every client project; manual creation, status changes,
  payment recording.
- `/payments` — every payment across all projects; refund/exclude actions.
- `/collaborators`, `/collaborators/[id]` — terms, commission rates, running totals; adding
  a collaborator also provisions their Supabase Auth login (for `apps/studio`'s `/dashboard`).
- `/payouts` — weekly pending-commission review, grouped by collaborator/week, mark-paid.
- `/audit-log` — append-only record of every commission-affecting action.

## Why a separate app

Per the founder's explicit architecture decision: a genuinely separate deployment (own
Vercel project, own domain), not just a route inside the customer-facing app, so that
even discovering the admin URL gets you nothing without authentication, and none of this
app's code ships as part of the public site's JS bundle. Same repo (npm workspace), same
Supabase backend, same RPC/audit-log authorization pattern — just deployed independently.

## Stack

Next.js 16 (App Router, Turbopack, Server Actions), Tailwind CSS v4, `@zebraish/lib`
(`../../packages/lib`) for Supabase clients, role/auth helpers, and formatting — see the
root `README.md` for the full monorepo layout.

## Environment variables

See `.env.example`. Same Supabase project as `apps/studio`:

```
NEXT_PUBLIC_SUPABASE_URL=https://rxyqoaucuwdgpbzgfjqp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Project Settings → API → anon/publishable key>
```

## Local development

```
npm install                            # from the repo root
npm run dev --workspace=apps/admin -- -p 3001
```

## Known limitations (tracked for later phases)

- Single role (`admin`) — no granular permissions, by design (the founder is currently
  the only admin user).
- No 2FA, session management, or rate limiting yet.
- No customer entity, price snapshots/versioning, project stage tracking, messaging,
  files, notifications, or analytics dashboard yet — this app currently has feature
  parity with the admin surface that used to live at `apps/studio`'s `/admin`, nothing more.
