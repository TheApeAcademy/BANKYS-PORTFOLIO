"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@/lib/auth";

export type IntakeState = { error: string | null };

export async function submitIntake(_prev: IntakeState, formData: FormData): Promise<IntakeState> {
  const clientName = String(formData.get("client_name") ?? "").trim();
  const clientContact = String(formData.get("client_contact") ?? "").trim();

  if (!clientName) {
    return { error: "Please tell us your name." };
  }
  if (!clientContact) {
    return { error: "Please leave an email or phone number so we can reach you." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_project_intake", {
    p_client_name: clientName,
    p_client_contact: clientContact,
    p_introduced_by: null,
  });

  if (error) {
    return { error: "Something went wrong submitting your project. Please try again." };
  }

  redirect(`/portal/thank-you?code=${encodeURIComponent(data as string)}`);
}

export async function createProjectByAdmin(formData: FormData) {
  await requireAdmin();
  const clientName = String(formData.get("client_name") ?? "").trim();
  const clientContact = String(formData.get("client_contact") ?? "").trim();
  if (!clientName) return;

  const supabase = await createClient();
  const actor = await getActorLabel();

  const { data: project, error } = await supabase
    .from("projects")
    .insert({ client_name: clientName, client_contact: clientContact || null })
    .select()
    .single();

  if (!error && project) {
    await supabase.from("audit_log").insert({
      actor,
      action: "PROJECT_CREATED",
      entity_type: "project",
      entity_id: project.id,
      details: { project_code: project.project_code, source: "admin" },
    });
  }

  revalidatePath("/admin/projects");
}

export async function updateProjectStatus(projectId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const actor = await getActorLabel();
  const status = String(formData.get("status") ?? "");
  if (!status) return;

  await supabase.from("projects").update({ status }).eq("id", projectId);
  await supabase.from("audit_log").insert({
    actor,
    action: "PROJECT_STATUS_CHANGED",
    entity_type: "project",
    entity_id: projectId,
    details: { status },
  });

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${projectId}`);
}
