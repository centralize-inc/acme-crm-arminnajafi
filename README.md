# ACME CRM

Fictional B2B SaaS used as a code-review interview snapshot. Next.js + Prisma + BullMQ + React.

## What this is

A small CRM-style codebase with a few existing patterns (Contacts CRUD, an email queue) that you'll see in `main`. The open PR (`feat/csv-import`) adds bulk CSV import for Contacts: upload → background processing → progress UI → errors table with retry.

## Your task

Review the open PR as you would in real life. Use the GitHub PR UI, or clone locally — your choice.

## Running locally (optional)

You don't need to run the code to review it. Type info works after `pnpm install`. If you _want_ to run it, you'll need Postgres + Redis; see `.env.example`. We don't promise it boots cleanly on every machine — this is a review exercise, not a setup exercise.

```bash
pnpm install
pnpm typecheck
```

## Existing patterns to be aware of

- **Auth + session** — every API route calls `getSession(req)` and bails 401 if no session. The session carries `userId` and `organizationId`.
- **Org scoping** — every DB query touching tenant data filters by `organizationId`. This is non-negotiable in this codebase.
- **Logger** — `~/lib/logger`. Format: `logger.info('domain.operation.outcome', { organizationId, ...ids })`. Never `console.log`.
- **Services** — business logic lives in `src/server/services/*`. API routes are thin: validate, call service, return.
- **Transactions** — multi-write operations use `prisma.$transaction`.
- **Queues** — see `src/lib/queue.ts` for the existing pattern (concurrency, per-org keys).
