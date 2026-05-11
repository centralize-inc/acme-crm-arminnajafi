import { ContactsTable } from '~/components/contacts/ContactsTable';
import { useContacts } from '~/hooks/useContacts';

export default function ContactsPage() {
  const { contacts, isLoading, error } = useContacts();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Contacts</h1>
      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error.message}</p>}
      {!isLoading && !error && <ContactsTable contacts={contacts} />}
    </main>
  );
}
