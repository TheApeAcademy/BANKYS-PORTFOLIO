import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS entirely. Server-only, never import this from
 * a Client Component. Used exclusively for the Flutterwave webhook/callback, which has
 * no logged-in admin session to authorize it the normal way.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it in Vercel/​.env.local (Supabase Dashboard → Project Settings → API → service_role key) — required for the Flutterwave payment callback/webhook.",
    );
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
