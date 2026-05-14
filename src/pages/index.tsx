import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6 flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">ACME CRM</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fictional B2B SaaS used as a code-review interview snapshot.
        </p>
      </header>

      <section>
        <h2 className="text-lg font-medium mb-2">Navigate</h2>
        <ul className="flex flex-col gap-1 text-blue-600 underline">
          <li>
            <Link href="/contacts">Contacts list</Link>
          </li>
          <li>
            <Link href="/imports">Import contacts (this PR&apos;s new feature)</Link>
          </li>
        </ul>
      </section>

      <section className="text-xs text-gray-500 border-t pt-4">
        Dev mode: auto-authenticated as <code>dev-user</code> in org{' '}
        <code>dev-org</code>. Queues no-op without Redis (uploads land in the DB
        but the worker doesn&apos;t process them). Re-seed with{' '}
        <code>pnpm dev:setup</code>.
      </section>
    </main>
  );
}
