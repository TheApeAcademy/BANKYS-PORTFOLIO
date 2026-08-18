"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient, createAnonClient } from "@zebraish/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@zebraish/lib/auth";

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

  const { error: linkError } = await supabase.rpc("link_collaborator_login", {
    p_collaborator_id: collaborator.id,
    p_profile_id: signUpData.user.id,
    p_full_name: name,
    p_email: email,
    p_actor: actor,
  });

  if (linkError) {
    return {
      error: `Collaborator saved and login account created, but linking the role failed: ${linkError.message}. Contact support.`,
      success: null,
    };
  }

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
