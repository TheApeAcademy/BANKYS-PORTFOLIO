"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@zebraish/lib/auth";

export type ActionState = { error: string | null };
const ok: ActionState = { error: null };

export async function sendAdminMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const projectId = String(formData.get("project_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!projectId || !body) return { error: "Write a message first." };

  const { error } = await supabase.rpc("send_admin_message", {
    p_project_id: projectId,
    p_body: body,
    p_actor: actor,
  });

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  return ok;
}

export async function markMessagesRead(projectId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.rpc("mark_messages_read", { p_project_id: projectId });
  revalidatePath(`/projects/${projectId}`);
}
