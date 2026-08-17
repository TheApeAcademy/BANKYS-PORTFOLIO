"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient, createAnonClient } from "@/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@/lib/auth";

export type CreateCollaboratorState = {
  error: string | null;
  success: { email: string; tempPassword: string } | null;
};

function generateTempPassword() {
  return randomBytes(9).toString("base64url");
}

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

  const { data: collaborator, error: insertError } = await supabase
    .from("collaborators")
    .insert({
      name,
      email: email || null,
      term_start: termStart,
      term_end: termEndRaw || null,
      commission_rate: commissionRate,
      bank_details: bankDetails,
    })
    .select()
    .single();

  if (insertError || !collaborator) {
    return { error: insertError?.message ?? "Could not create collaborator.", success: null };
  }

  await supabase.from("audit_log").insert({
    actor,
    action: "COLLABORATOR_CREATED",
    entity_type: "collaborator",
    entity_id: collaborator.id,
    details: { name, term_start: termStart, term_end: termEndRaw || null, commission_rate: commissionRate },
  });

  revalidatePath("/admin/collaborators");

  if (!email) {
    return { error: null, success: null };
  }

  const tempPassword = generateTempPassword();
  const anon = createAnonClient();
  const { data: signUpData, error: signUpError } = await anon.auth.signUp({
    email,
    password: tempPassword,
  });

  if (signUpError || !signUpData.user) {
    return {
      error: `Collaborator saved, but login creation failed: ${signUpError?.message ?? "unknown error"}. You can invite them separately from the Supabase dashboard.`,
      success: null,
    };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: signUpData.user.id,
    role: "collaborator",
    collaborator_id: collaborator.id,
    full_name: name,
  });

  if (profileError) {
    return {
      error: `Collaborator saved and login account created, but linking the role failed: ${profileError.message}. Contact support.`,
      success: null,
    };
  }

  await supabase.from("audit_log").insert({
    actor,
    action: "COLLABORATOR_LOGIN_CREATED",
    entity_type: "collaborator",
    entity_id: collaborator.id,
    details: { email },
  });

  return { error: null, success: { email, tempPassword } };
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

  const update = {
    term_start: termStart,
    term_end: termEndRaw || null,
    commission_rate: commissionRateRaw ? Number(commissionRateRaw) / 100 : undefined,
    active,
  };

  await supabase.from("collaborators").update(update).eq("id", id);
  await supabase.from("audit_log").insert({
    actor,
    action: "COLLABORATOR_UPDATED",
    entity_type: "collaborator",
    entity_id: id,
    details: update,
  });

  revalidatePath("/admin/collaborators");
  revalidatePath(`/admin/collaborators/${id}`);
}
