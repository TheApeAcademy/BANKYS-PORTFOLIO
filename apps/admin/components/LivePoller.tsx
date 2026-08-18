"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Polling refresh rather than Supabase Realtime, per the plan's own
 * decision — far lower complexity, "no manual refresh" is satisfied either
 * way at this scale. Renders nothing; just re-triggers the server components
 * on this page periodically. */
export function LivePoller({ intervalSeconds = 45 }: { intervalSeconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalSeconds * 1000);
    return () => clearInterval(id);
  }, [router, intervalSeconds]);

  return null;
}
