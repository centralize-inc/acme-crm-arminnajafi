import type { Contact } from '~/hooks/useContacts';

export function ContactsTable({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return <p className="text-sm text-gray-500">No contacts yet.</p>;
  }
  return (
    <table className="min-w-full text-sm">
      <thead className="text-left text-gray-500">
        <tr>
          <th className="py-2">Email</th>
          <th className="py-2">Name</th>
          <th className="py-2">Company</th>
          <th className="py-2">Created</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map((c) => (
          <tr key={c.id} className="border-t">
            <td className="py-2">{c.email}</td>
            <td className="py-2">
              {[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}
            </td>
            <td className="py-2">{c.company ?? '—'}</td>
            <td className="py-2 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
