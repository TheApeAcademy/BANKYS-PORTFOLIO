import { headers } from "next/headers";
import { createClient } from "./supabase/server";

/** Best-effort client IP from the headers Vercel/proxies set. Never trust this for
 * anything beyond rate-limit bucketing — it's attacker-influenceable off-platform. */
export async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  const forwardedFor = hdrs.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return hdrs.get("x-real-ip") ?? "unknown";
}

/** Returns true if the caller is still within the allowed rate, false if blocked.
 * `action` should be a short fixed label (e.g. "admin-login") — never raw user input,
 * since it becomes part of the DB key. */
export async function checkRateLimit(
  action: string,
  maxAttempts: number,
  windowSeconds: number,
): Promise<boolean> {
  const ip = await getClientIp();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: `${action}:${ip}`,
    p_max_attempts: maxAttempts,
    p_window_seconds: windowSeconds,
  });
  // Fail open: if the rate-limit check itself errors (network blip, etc.), don't
  // lock legitimate users out of login/checkout over an infra hiccup.
  if (error) return true;
  return data === true;
}
