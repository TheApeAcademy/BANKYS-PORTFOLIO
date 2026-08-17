# Zebraish

An npm workspace monorepo with two independently deployed Next.js apps sharing one
Supabase backend:

- **`apps/studio`** — the public, customer-facing app: marketing homepage, the `/start`
  project configurator, Flutterwave checkout, and the collaborator commission dashboard
  (`/dashboard`). See `apps/studio/README.md`.
- **`apps/admin`** — the founder-only admin control center (B.S.A.C.M.): projects,
  payments, collaborators, payouts, and the audit log. Deployed on its own domain, with
  no link to it anywhere in `apps/studio`. See `apps/admin/README.md`.
- **`packages/lib`** (`@zebraish/lib`) — code shared by both apps: Supabase client
  construction, the `profiles`/role auth helpers, currency/date formatting, and the
  pricing-catalogue TypeScript types. UI components are deliberately **not** shared —
  each app has its own `components/ui.tsx` tuned for its own audience.

Everything at the repo root outside `apps/`, `packages/`, and this file is leftover
source from the original static brochure site, superseded by `apps/studio/public/` —
safe to ignore.

## Architecture

Both apps authenticate against the same Supabase project (`rxyqoaucuwdgpbzgfjqp`,
`profiles.role` distinguishes `admin` from `collaborator`) and read/write the same
tables through the same Postgres RPC functions. There is one source of truth: a payment
recorded via the Flutterwave webhook (handled in `apps/studio`, no admin session)
appears immediately in `apps/admin`'s payments list, because both apps are reading the
same database — not two disconnected systems glued together.

Never trust the frontend for authorization: both apps re-check role server-side
(`requireAdmin()`/`requireCollaborator()` in `@zebraish/lib/auth` and each app's own
`proxy.ts` middleware), and every commission-affecting write goes through a
`SECURITY DEFINER` RPC gated by `is_privileged_caller()` — never a raw table write.

## Local development

```
npm install          # installs the whole workspace from the repo root
npm run dev --workspace=apps/studio   # http://localhost:3000
npm run dev --workspace=apps/admin    # http://localhost:3001 (or any other free port)
```

Each app needs its own `.env.local` (see each app's `.env.example`) — at minimum
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, both public-safe.

## Deployment

Two separate Vercel projects, both pointed at this same repo:

- `apps/studio` → Vercel project root directory `apps/studio` (this **replaces** the
  previous single-project setup that had its root directory set to `portal` — that
  directory no longer exists, so the existing Vercel project's Root Directory setting
  must be updated to `apps/studio` or its next deploy will fail to find a Next.js app).
- `apps/admin` → a **new** Vercel project, root directory `apps/admin`, its own domain,
  its own copy of the environment variables (same Supabase project, so the same
  `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, plus `SUPABASE_SERVICE_ROLE_KEY`
  only if/when admin-side service-role operations are added).
