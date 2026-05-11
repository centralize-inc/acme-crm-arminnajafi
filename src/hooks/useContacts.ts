import { useEffect, useState } from 'react';

export type Contact = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  createdAt: string;
};

type State = { contacts: Contact[]; isLoading: boolean; error: Error | null };

/**
 * Fetch the current org's contacts. Aborts in-flight requests on unmount and
 * when the cursor changes — see the AbortController + cleanup pattern.
 */
export function useContacts(cursor?: string): State {
  const [state, setState] = useState<State>({ contacts: [], isLoading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, isLoading: true }));
      try {
        const url = cursor ? `/api/contacts?cursor=${encodeURIComponent(cursor)}` : '/api/contacts';
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load contacts (${res.status})`);
        const body = (await res.json()) as { contacts: Contact[] };
        if (!cancelled) setState({ contacts: body.contacts, isLoading: false, error: null });
      } catch (err) {
        if (controller.signal.aborted) return;
        if (!cancelled) setState({ contacts: [], isLoading: false, error: err as Error });
      }
    }

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [cursor]);

  return state;
}
