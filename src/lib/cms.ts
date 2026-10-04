import "server-only";

/**
 * Whether the content editor (/keystatic) and admin tools (/admin) may run.
 *
 *   "local"  — `npm run dev` on your computer: edits write files directly.
 *   "github" — production with Keystatic's GitHub app configured: edits
 *              become commits on GitHub (login required).
 *   null     — everywhere else: both routes 404. Keystatic's local mode has
 *              no auth of its own, so it must never be reachable in production.
 */
export function cmsMode(): "local" | "github" | null {
  if (process.env.NODE_ENV === "development") return "local";
  const github =
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG &&
    process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
    process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
    process.env.KEYSTATIC_SECRET;
  return github ? "github" : null;
}
