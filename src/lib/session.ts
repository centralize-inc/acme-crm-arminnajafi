import type { NextApiRequest } from 'next';

export type Session = {
  userId: string;
  organizationId: string;
};

/**
 * Resolve the caller's session from the request.
 *
 * In the real app this validates a signed cookie. For the snapshot it reads
 * `x-user-id` / `x-org-id` headers so reviewers can reason about auth flow
 * without standing up a full auth stack.
 *
 * Returns null when the request is unauthenticated; callers should 401.
 */
export function getSession(req: NextApiRequest): Session | null {
  const userId = req.headers['x-user-id'];
  const organizationId = req.headers['x-org-id'];
  if (typeof userId !== 'string' || typeof organizationId !== 'string') {
    return null;
  }
  if (!userId || !organizationId) return null;
  return { userId, organizationId };
}
