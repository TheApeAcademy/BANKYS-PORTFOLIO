"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@zebraish/lib/auth";
import { sendPriceConfirmedEmail } from "@/lib/email";

export async function createProjectByAdmin(formData: FormData) {
  await requireAdmin();
  const clientName = String(formData.get("client_name") ?? "").trim();
  const clientContact = String(formData.get("client_contact") ?? "").trim();
  if (!clientName) return;

  const supabase = await createClient();
  const actor = await getActorLabel();

  const { data: customerId } = await supabase.rpc("find_or_create_customer", {
    p_email: clientContact.includes("@") ? clientContact : null,
    p_name: clientName,
    p_contact: clientContact.includes("@") ? null : clientContact || null,
  });

  await supabase.rpc("create_project_by_admin", {
    p_client_name: clientName,
    p_client_contact: clientContact || null,
    p_customer_id: customerId ?? null,
    p_actor: actor,
  });

  revalidatePath("/projects");
}

export async function updateProjectStatus(projectId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const actor = await getActorLabel();
  const status = String(formData.get("status") ?? "");
  if (!status) return;

  await supabase.rpc("update_project_status", {
    p_project_id: projectId,
    p_status: status,
    p_actor: actor,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

/** Locks in the hand-reviewed final price. Builder briefs only become payable after this. */
export async function confirmProjectPrice(projectId: string, formData: FormData) {
  await requireAdmin();
  const price = Number(String(formData.get("price") ?? "").replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(price) || price <= 0) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_project_price", { p_project_id: projectId, p_price: price });
  if (!error) {
    const { data: project } = await supabase
      .from("projects")
      .select("project_code, client_name, client_contact, quoted_price, quoted_currency, access_token, configuration")
      .eq("id", projectId)
      .single();
    if (project?.access_token) await sendPriceConfirmedEmail(project);
  }
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}
