"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@zebraish/lib/auth";

export type ActionState = { error: string | null };
const ok: ActionState = { error: null };

export async function confirmBankTransfer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const paymentId = String(formData.get("payment_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  if (!paymentId) return { error: "Missing payment." };

  const { error } = await supabase.rpc("confirm_bank_transfer", { p_payment_id: paymentId, p_actor: actor });
  if (error) return { error: error.message };

  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath("/payments");
  revalidatePath("/payouts");
  revalidatePath("/");
  return ok;
}

export async function rejectBankTransfer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const paymentId = String(formData.get("payment_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!paymentId || !reason) return { error: "A reason is required." };

  const { error } = await supabase.rpc("reject_bank_transfer", {
    p_payment_id: paymentId,
    p_reason: reason,
    p_actor: actor,
  });
  if (error) return { error: error.message };

  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath("/payments");
  return ok;
}

export async function upsertBankTransferAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const currency = String(formData.get("currency") ?? "").trim();
  const provider = String(formData.get("provider") ?? "").trim();
  const beneficiaryName = String(formData.get("beneficiary_name") ?? "").trim();
  const active = formData.get("active") === "on";

  if (!currency || !provider || !beneficiaryName) {
    return { error: "Currency, provider, and beneficiary name are required." };
  }

  // Free-form label/value pairs — matches[i] "detail_label"/"detail_value" from
  // the form. Blank rows are dropped rather than stored as empty strings.
  const labels = formData.getAll("detail_label").map((v) => String(v).trim());
  const values = formData.getAll("detail_value").map((v) => String(v).trim());
  const details: Record<string, string> = {};
  labels.forEach((label, i) => {
    const value = values[i];
    if (label && value) details[label.toLowerCase().replace(/\s+/g, "_")] = value;
  });

  const { error } = await supabase.rpc("upsert_bank_transfer_account", {
    p_currency: currency,
    p_provider: provider,
    p_beneficiary_name: beneficiaryName,
    p_details: details,
    p_active: active,
    p_actor: actor,
  });
  if (error) return { error: error.message };

  revalidatePath("/payments");
  revalidatePath("/settings/bank-transfer");
  return ok;
}
