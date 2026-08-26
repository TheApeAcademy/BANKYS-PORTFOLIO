"use server";

import { createClient } from "@zebraish/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";

export type TrackerMessage = {
  id: string;
  sender_type: "admin" | "client" | "system";
  sender_label: string;
  body: string;
  created_at: string;
};

export async function getProjectMessages(token: string): Promise<TrackerMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_project_messages", { p_access_token: token });
  if (error || !data) return [];
  return data as TrackerMessage[];
}

export type ActionState = { error: string | null };
const ok: ActionState = { error: null };

export async function sendClientMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getServerT();
  const supabase = await createClient();
  const token = String(formData.get("token") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!token || !body) return { error: t("messages.error.empty") };

  const { error } = await supabase.rpc("send_client_message", { p_access_token: token, p_body: body });
  if (error) return { error: t("messages.error.sendFailed") };

  return ok;
}
