"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin } from "@zebraish/lib/auth";

export type AdminSession = {
  id: string;
  created_at: string;
  updated_at: string;
  refreshed_at: string | null;
  user_agent: string | null;
  ip: string | null;
  aal: string;
  is_current: boolean;
};

export async function getMySessions(): Promise<AdminSession[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_my_sessions");
  if (error || !data) return [];
  return data as AdminSession[];
}

export async function revokeSession(sessionId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.rpc("revoke_my_session", { p_session_id: sessionId });
  revalidatePath("/settings/sessions");
}

export type LoginActivityEntry = {
  id: string;
  occurred_at: string;
  outcome: "success" | "failed";
  message: string;
  metadata: Record<string, unknown> | null;
};

export async function getRecentLoginActivity(): Promise<LoginActivityEntry[]> {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: failures }, { data: successes }] = await Promise.all([
    supabase
      .from("system_events")
      .select("id, occurred_at, message, context")
      .eq("source", "auth")
      .order("occurred_at", { ascending: false })
      .limit(20),
    supabase
      .from("activity_events")
      .select("id, occurred_at, metadata")
      .eq("event_type", "login")
      .order("occurred_at", { ascending: false })
      .limit(20),
  ]);

  const merged: LoginActivityEntry[] = [
    ...(failures ?? []).map((f) => ({
      id: `sys-${f.id}`,
      occurred_at: f.occurred_at,
      outcome: "failed" as const,
      message: f.message,
      metadata: f.context,
    })),
    ...(successes ?? []).map((s) => ({
      id: `act-${s.id}`,
      occurred_at: s.occurred_at,
      outcome: "success" as const,
      message: "Signed in",
      metadata: s.metadata,
    })),
  ];

  return merged.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()).slice(0, 25);
}
