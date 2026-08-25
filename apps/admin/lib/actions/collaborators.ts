"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@zebraish/lib/auth";

export type CreateCollaboratorState = {
  error: string | null;
  success: { accessCode: string } | null;
};

export async function createCollaborator(
  _prev: CreateCollaboratorState,
  formData: FormData,
): Promise<CreateCollaboratorState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const termStart = String(formData.get("term_start") ?? "");
  const termEndRaw = String(formData.get("term_end") ?? "").trim();
  const commissionRateRaw = String(formData.get("commission_rate") ?? "10");
  const bankName = String(formData.get("bank_name") ?? "").trim();
  const accountName = String(formData.get("account_name") ?? "").trim();
  const accountNumber = String(formData.get("account_number") ?? "").trim();

  if (!name || !termStart) {
    return { error: "Name and Term start date are required.", success: null };
  }

  const commissionRate = Number(commissionRateRaw) / 100;
  const bankDetails = {
    bank_name: bankName || null,
    account_name: accountName || null,
    account_number: accountNumber || null,
  };

  const { data: collaborator, error: insertError } = await supabase.rpc("create_collaborator_record", {
    p_name: name,
    p_email: email || null,
    p_term_start: termStart,
    p_commission_rate: commissionRate,
    p_actor: actor,
    p_term_end: termEndRaw || null,
    p_bank_details: bankDetails,
  });

  if (insertError || !collaborator) {
    return { error: insertError?.message ?? "Could not create collaborator.", success: null };
  }

  revalidatePath("/collaborators");

  // Collaborators get dashboard access via a private code instead of an email/password
  // account — no signup, no email confirmation. Share this with them once; it isn't
  // shown again (though you can look it up anytime from their detail page).
  return { error: null, success: { accessCode: (collaborator as { access_code: string }).access_code } };
}

export async function approveApplication(formData: FormData) {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: application } = await supabase
    .from("collaborator_applications")
    .select("*")
    .eq("id", id)
    .eq("status", "pending")
    .single();
  if (!application) return;

  const { data: collaborator, error: insertError } = await supabase.rpc("create_collaborator_record", {
    p_name: application.name,
    p_email: application.email,
    p_term_start: new Date().toISOString().slice(0, 10),
    p_commission_rate: 0.1,
    p_actor: actor,
    p_term_end: null,
    p_bank_details: {},
  });
  if (insertError || !collaborator) return;

  await supabase
    .from("collaborator_applications")
    .update({
      status: "approved",
      reviewed_by: actor,
      reviewed_at: new Date().toISOString(),
      collaborator_id: (collaborator as { id: string }).id,
    })
    .eq("id", id);

  revalidatePath("/collaborators");
}

export async function getApplicationAttachmentUrl(storagePath: string): Promise<string | null> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase.storage.from("collaborator-applications").createSignedUrl(storagePath, 300);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function rejectApplication(formData: FormData) {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase
    .from("collaborator_applications")
    .update({ status: "rejected", reviewed_by: actor, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending");

  revalidatePath("/collaborators");
}

export async function updateCollaborator(formData: FormData) {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const termStart = String(formData.get("term_start") ?? "");
  const termEndRaw = String(formData.get("term_end") ?? "").trim();
  const commissionRateRaw = String(formData.get("commission_rate") ?? "");
  const active = formData.get("active") === "on";

  if (!id || !termStart) return;

  await supabase.rpc("update_collaborator_record", {
    p_id: id,
    p_term_start: termStart,
    p_active: active,
    p_actor: actor,
    p_term_end: termEndRaw || null,
    p_commission_rate: commissionRateRaw ? Number(commissionRateRaw) / 100 : null,
  });

  revalidatePath("/collaborators");
  revalidatePath(`/collaborators/${id}`);
}
