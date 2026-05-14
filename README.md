# ACME CRM

Fictional B2B SaaS used as a code-review interview snapshot. Next.js + Prisma + BullMQ + React.

## What this is

A small CRM-style codebase with a few existing patterns (Contacts CRUD, an email queue) that you'll see in `main`. The open PR (`feat/csv-import`) adds bulk CSV import for Contacts: upload → background processing → progress UI → errors table with retry.

## Your task

Review the open PR as you would in real life. Use the GitHub PR UI, or clone locally — your choice.

## Running locally

You don't need to run the code to review it — but if you want to click through the UI, this should just work:

```bash
pnpm install
cp .env.example .env
pnpm dev:setup    # creates SQLite dev.db and seeds a dev org/user
pnpm dev          # http://localhost:3000
```

You'll be auto-authenticated as a dev user (no login screen). Postgres is used in prod but the local snapshot runs on SQLite for convenience. Queues no-op without `REDIS_URL` — jobs land in the DB but the worker doesn't process them. That's enough to explore the UI; if you want real processing, set `REDIS_URL` and run `pnpm worker` in a second terminal.

```bash
pnpm typecheck    # type info works after install regardless of dev:setup
```

## Existing patterns to be aware of

- **Auth + session** — every API route calls `getSession(req)` and bails 401 if no session. The session carries `userId` and `organizationId`.
- **Org scoping** — every DB query touching tenant data filters by `organizationId`. This is non-negotiable in this codebase.
- **Logger** — `~/lib/logger`. Format: `logger.info('domain.operation.outcome', { organizationId, ...ids })`. Never `console.log`.
- **Services** — business logic lives in `src/server/services/*`. API routes are thin: validate, call service, return.
- **Transactions** — multi-write operations use `prisma.$transaction`.
- **Queues** — see `src/lib/queue.ts` for the existing pattern (concurrency, per-org keys).
