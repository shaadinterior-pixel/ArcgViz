// ─── Shared site constants ────────────────────────────────────────────────────
// Single source of truth for values that appear across pages, seeds and emails.
// Change it here rather than hardcoding the value in individual files.

/** Public contact / support address for Design Walla. */
export const SUPPORT_EMAIL = 'info.designwalla.ss@gmail.com';

/**
 * Accounts allowed into /admin. These are login credentials, not contact
 * addresses — removing one revokes that person's access to the panel.
 */
export const ADMIN_EMAILS = [
  'shaadinterior@gmail.com',
  SUPPORT_EMAIL,
] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase() as typeof ADMIN_EMAILS[number]);
}
