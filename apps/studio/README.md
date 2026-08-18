# Zebraish Studio

The customer-facing Next.js app — one of two apps in this repo's npm workspace (see the
root `README.md` for the monorepo layout). Studio and the separate `apps/admin` control
center share one Supabase backend but are deployed independently, on different domains:

- `/` — the marketing homepage (ported verbatim from the original static site).
- `/all-work.html` — the project archive (served as-is, untouched, from `/public`).
- `/start` — the context-aware project configurator: branches by project type, prices
  live as you go, saves a resumable draft, then hands off to WhatsApp and Flutterwave.
- `/start/pay` — Flutterwave checkout for a configured project.
- `/dashboard` — collaborator commission dashboard (no client PII exposed).

The founder-only admin control center (projects, payments, collaborators, weekly payout
review, audit log) is a separate app — see `apps/admin/README.md` — deployed on its own
domain with no link to it anywhere in this app.

## Stack

- Next.js 16 (App Router, Turbopack, Server Actions)
- Supabase (Postgres + Auth). Project: `zebraish` (`rxyqoaucuwdgpbzgfjqp`), region `eu-west-1`.
- Tailwind CSS v4 for the app surfaces; the homepage keeps its own original CSS
  (`public/site.css` / `public/site.js`) so its design stays pixel-for-pixel unchanged.
- Flutterwave for payment collection.
- Resend for transactional email (optional — inactive until configured).

## How commission logic is enforced

All commission-affecting writes go through Postgres RPC functions (`record_payment`,
`record_gateway_payment`, `exclude_payment`, `record_partial_refund`, `mark_payout_paid`) —
never raw table writes. Each one checks, internally, that the caller is either an admin's
own logged-in session or the Supabase service-role key (`is_privileged_caller()`) — so an
admin's own session covers everything done from the Admin Dashboard, and only the
Flutterwave payment callback/webhook (which has no admin session behind it) needs the
service-role key. Every RPC call also writes an append-only `audit_log` row; the log table
has a trigger that rejects `UPDATE`/`DELETE` outright — corrections always insert a new row
referencing the original (`corrects_entry_id` / `adjustment_for`).

The Collaborator Dashboard reads through two Postgres views
(`collaborator_ledger`, `collaborator_payouts`) that expose only Project ID / amounts /
status — never client name, email, phone, or address — and are row-scoped to the
logged-in collaborator via `current_collaborator_id()`.

Public project intake/configuration (`/start`) is token-gated, not auth-gated: submitting
returns an unguessable `access_token` embedded in the URL, which is how a client can
bookmark, resume, edit, or pay for their project later without an account.

## The pricing catalogue

`lib/catalogue/` holds the whole configurator as data, not code:

- `catalogue.ts` — the 12 project types and their branching question flows.
- `shared.ts` — reusable priced categories (design, payments, AI, automation, hosting…).
- `engine.ts` — `calculateProject()`, a pure function that prices whatever's currently
  selected (verified against the source pricing doc's own worked example: One-page
  Website + 4 pages + CMS + payment integration + custom UI, Advanced complexity, Rush
  delivery → exactly €546).

Adding a service, changing a price, or adjusting which questions appear for a project
type is a data edit in these files — no UI or engine changes needed.

## Environment variables

See `.env.example`. Required to run at all:

```
NEXT_PUBLIC_SUPABASE_URL=https://rxyqoaucuwdgpbzgfjqp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Project Settings → API → anon/publishable key>
```

Required only for payment collection to actually work (get these when you're ready —
never paste secrets into chat, set them straight into Vercel/`.env.local`):

```
SUPABASE_SERVICE_ROLE_KEY=<Project Settings → API → service_role key>
FLUTTERWAVE_SECRET_KEY=<Flutterwave Dashboard → Settings → API keys>
FLUTTERWAVE_SECRET_HASH=<Flutterwave Dashboard → Settings → Webhooks → Secret Hash>
```

Optional — enables the automatic confirmation/notification emails:

```
RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_NOTIFICATION_EMAIL=
```

Resend needs a domain you actually own to verify sending — a `*.vercel.app` address can't
be verified, so email stays inactive (fails silently, never blocks a payment) until a real
domain is attached.

In Flutterwave's dashboard, point the webhook URL at `https://<your-domain>/api/flutterwave/webhook`.

## Local development

```
npm install
npm run dev
```

## Accounts seeded for this build (fixtures, not real collaborator data)

- **Admin** (Joshua): `apeacad3my@gmail.com` — temporary password shared in chat. Signs in
  at the separate admin control center (`apps/admin`), not here.
  **Change it immediately** via Supabase Dashboard → Authentication → Users → that user
  → Reset password.
- **Fixture collaborator** (placeholder — NOT Christian Prieto's real data):
  `fixture.collaborator@zebraish.test` / temp password shared in chat. Signs in here, at
  `/login`. Replace with his real term/rate/bank details via the admin app's Collaborators
  page once you're ready to go live, or delete this fixture collaborator and add him fresh.

New collaborators, added from the admin app, get a Supabase Auth account created via
self-signup — they'll receive a confirmation email, or you can confirm manually in
Supabase Dashboard → Authentication → Users.

## Known limitations

- WhatsApp handoff is one-tap pre-filled (`wa.me` link, auto-opened), not the fully
  automatic WhatsApp Business API — that requires a Meta Business/WhatsApp Business
  Platform account and approval process we deliberately deferred.
- No automatic WhatsApp notification to the admin on payment (same reason — only the
  client-initiated one-tap flow is wired up). Email notification covers this instead.
- No automated bank transfer to collaborators — payout is "review queue → mark paid"
  after you send the transfer manually.
- Multi-currency conversion at payout time is a manual exchange-rate field, not fetched
  automatically.
- No client-facing project status page or exportable statements yet.
