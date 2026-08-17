# Zebraish Portal

Next.js (App Router) + Supabase app covering three surfaces on one shared dataset:

- `/portal` — public project intake form (sequential Project IDs, e.g. `ZB-00017`).
- `/dashboard` — collaborator commission dashboard (no client PII exposed).
- `/admin` — founder-only dashboard: projects, payments, collaborators, weekly payout
  review, and an append-only audit log.

## Stack

- Next.js 16 (App Router, Turbopack, Server Actions)
- Supabase (Postgres + Auth). Project: `zebraish` (`rxyqoaucuwdgpbzgfjqp`), region `eu-west-1`.
- Tailwind CSS v4, Zebraish brand theme (black/near-black + `#1D68C0` accent, Apple system font stack).

## How commission logic is enforced

All commission-affecting writes go through Postgres RPC functions (`record_payment`,
`exclude_payment`, `record_partial_refund`, `mark_payout_paid`, `submit_project_intake`) —
not raw table writes. Each mutating RPC checks `is_admin()` internally (via the caller's
own Supabase Auth session), so **no service-role secret is required** for the app to run.
Every RPC call also writes an append-only `audit_log` row; the log table has a trigger
that rejects `UPDATE`/`DELETE` outright — corrections always insert a new row referencing
the original (`corrects_entry_id` / `adjustment_for`).

The Collaborator Dashboard reads through two Postgres views
(`collaborator_ledger`, `collaborator_payouts`) that expose only Project ID / amounts /
status — never client name, email, phone, or address — and are row-scoped to the
logged-in collaborator via `current_collaborator_id()`.

## Environment variables

Copy `.env.example` to `.env.local` (already done for local dev in this session) and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://rxyqoaucuwdgpbzgfjqp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Project Settings → API → anon/publishable key>
```

That's it — no service-role key needed. Set the same two variables in Vercel's project
settings when deploying.

## Local development

```
npm install
npm run dev
```

## Accounts seeded for this MVP (fixtures, not real collaborator data)

- **Admin** (Joshua): `apeacad3my@gmail.com` — temporary password shared in chat.
  **Change it immediately** via Supabase Dashboard → Authentication → Users → that user
  → Reset password (or build a "change password" page before wider use).
- **Fixture collaborator** (placeholder — NOT Christian Prieto's real data):
  `fixture.collaborator@zebraish.test` / temp password shared in chat. Replace with his
  real term/rate/bank details via Admin → Collaborators once you're ready to go live, or
  delete this fixture collaborator and add him fresh.

New collaborators added via Admin → Collaborators get a Supabase Auth account created
via self-signup (no service-role key needed) — they'll receive a confirmation email, or
you can confirm manually in Supabase Dashboard → Authentication → Users.

## Known MVP limitations (by design — see "Later" in the product brief)

- No payment-processor / embedded checkout integration — payments are entered manually.
- No automated bank transfer — payout is "review queue → mark paid" after a manual transfer.
- Multi-currency support is a single manual exchange rate entered at the moment a payout
  is marked paid (rate is not fetched automatically).
- No client-facing project status page or exportable statements yet.
