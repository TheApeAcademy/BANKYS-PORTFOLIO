"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@zebraish/lib/auth";

export type ActionState = { error: string | null };
const ok: ActionState = { error: null };

export async function setProjectType(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const projectId = String(formData.get("project_id") ?? "");
  const projectType = String(formData.get("project_type") ?? "");
  if (!projectId || !projectType) return { error: "Choose a project type." };

  const { error } = await supabase.rpc("set_project_type", {
    p_project_id: projectId,
    p_project_type: projectType,
    p_actor: actor,
  });

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return ok;
}

export async function advanceProjectStage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const projectId = String(formData.get("project_id") ?? "");
  const stageKey = String(formData.get("stage_key") ?? "");
  if (!projectId || !stageKey) return { error: "Missing stage." };

  const { error } = await supabase.rpc("advance_project_stage", {
    p_project_id: projectId,
    p_stage_key: stageKey,
    p_actor: actor,
  });

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return ok;
}

export async function revertProjectStage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const projectId = String(formData.get("project_id") ?? "");
  const stageKey = String(formData.get("stage_key") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!projectId || !stageKey || !reason) {
    return { error: "A reason is required to revert a stage." };
  }

  const { error } = await supabase.rpc("revert_project_stage", {
    p_project_id: projectId,
    p_stage_key: stageKey,
    p_actor: actor,
    p_reason: reason,
  });

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return ok;
}

export async function setProjectHold(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const projectId = String(formData.get("project_id") ?? "");
  const holdStateRaw = String(formData.get("hold_state") ?? "");
  const holdState = holdStateRaw === "" ? null : holdStateRaw;
  const reason = String(formData.get("reason") ?? "").trim();
  if (!projectId) return { error: "Missing project." };
  if (holdState && !reason) return { error: "A reason is required to place a project on hold." };

  const { error } = await supabase.rpc("set_project_hold", {
    p_project_id: projectId,
    p_hold_state: holdState,
    p_reason: holdState ? reason : null,
    p_actor: actor,
  });

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return ok;
}
