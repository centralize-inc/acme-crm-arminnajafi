import type { NextApiRequest } from 'next';

export type Session = {
  userId: string;
  organizationId: string;
};

/**
 * Stable dev identity used when the app boots without an auth stack. Matches
 * the user + org created by `pnpm dev:setup` so DB writes don't trip foreign
 * keys.
 */
export const DEV_FALLBACK_SESSION: Session = {
  userId: 'dev-user',
  organizationId: 'dev-org',
};

/**
 * Resolve the caller's session from the request.
 *
 * In the real app this validates a signed cookie. For the snapshot it reads
 * `x-user-id` / `x-org-id` headers so reviewers can reason about auth flow
 * without standing up a full auth stack.
 *
 * In development, missing headers fall back to a stable dev user — this lets
 * `pnpm dev` boot a working app without anyone setting headers manually.
 *
 * Returns null when the request is unauthenticated; callers should 401.
 */
export function getSession(req: NextApiRequest): Session | null {
  const userId = req.headers['x-user-id'];
  const organizationId = req.headers['x-org-id'];
  if (typeof userId !== 'string' || typeof organizationId !== 'string') {
    if (process.env.NODE_ENV === 'development') {
      return DEV_FALLBACK_SESSION;
    }
    return null;
  }
  if (!userId || !organizationId) return null;
  return { userId, organizationId };
}
