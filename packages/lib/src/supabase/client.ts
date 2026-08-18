import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side client bound to the same session cookies as the server client.
 * Needed for auth.mfa's enroll/challenge/verify flow, which must run against
 * the actual browser session (verifying a factor promotes *that* session to
 * aal2 and signs out every other session) — a server action can't do this.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
