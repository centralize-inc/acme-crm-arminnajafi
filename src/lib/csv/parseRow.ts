export type ParsedContact = {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
};

export type ParseResult =
  | { ok: true; contact: ParsedContact }
  | { ok: false; error: string };

const EMAIL_RE = /^.+@.+\..+$/;

/**
 * Parse a single CSV row into a contact. Expects columns in this order:
 *   email, firstName, lastName, company
 */
export function parseRow(_headerRow: string[], row: string[]): ParseResult {
  const [email, firstName, lastName, company] = row;

  if (!email) {
    return { ok: false, error: 'Missing email' };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: `Invalid email: ${email}` };
  }

  return {
    ok: true,
    contact: {
      email,
      firstName: firstName?.trim() || undefined,
      lastName: lastName?.trim() || undefined,
      company: company?.trim() || undefined,
    },
  };
}
