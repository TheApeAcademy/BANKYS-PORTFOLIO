"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@zebraish/lib/auth";

export type ActionState = { error: string | null };
const ok: ActionState = { error: null };

export async function recordPayment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const projectId = String(formData.get("project_id") ?? "");
  const amount = Number(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "EUR");
  const method = String(formData.get("method") ?? "").trim() || null;
  const receivedAt = String(formData.get("received_at") ?? "");
  const type = String(formData.get("type") ?? "full");

  if (!projectId || !amount || amount <= 0 || !receivedAt) {
    return { error: "Amount and date received are required." };
  }

  const { error } = await supabase.rpc("record_payment", {
    p_project_id: projectId,
    p_amount: amount,
    p_currency: currency,
    p_method: method,
    p_received_at: new Date(receivedAt).toISOString(),
    p_type: type,
    p_actor: actor,
  });

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/payments");
  revalidatePath("/");
  return ok;
}

export async function excludePayment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const paymentId = String(formData.get("payment_id") ?? "");
  const newStatus = String(formData.get("new_status") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const projectId = String(formData.get("project_id") ?? "");

  if (!paymentId || !newStatus || !reason) {
    return { error: "Choose a reason category and describe why." };
  }

  const { error } = await supabase.rpc("exclude_payment", {
    p_payment_id: paymentId,
    p_new_status: newStatus,
    p_reason: reason,
    p_actor: actor,
  });

  if (error) return { error: error.message };

  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath("/payments");
  revalidatePath("/payouts");
  return ok;
}

export async function recordPartialRefund(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const paymentId = String(formData.get("payment_id") ?? "");
  const refundAmount = Number(formData.get("refund_amount"));
  const reason = String(formData.get("reason") ?? "").trim() || "partial refund";
  const projectId = String(formData.get("project_id") ?? "");

  if (!paymentId || !refundAmount || refundAmount <= 0) {
    return { error: "Enter a valid refund amount." };
  }

  const { error } = await supabase.rpc("record_partial_refund", {
    p_payment_id: paymentId,
    p_refund_amount: refundAmount,
    p_actor: actor,
    p_reason: reason,
  });

  if (error) return { error: error.message };

  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath("/payments");
  revalidatePath("/payouts");
  return ok;
}

export async function openDispute(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const paymentId = String(formData.get("payment_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const gatewayDisputeId = String(formData.get("gateway_dispute_id") ?? "").trim() || null;
  const projectId = String(formData.get("project_id") ?? "");

  if (!paymentId || !reason) {
    return { error: "A reason is required to open a dispute." };
  }

  const { error } = await supabase.rpc("open_dispute", {
    p_payment_id: paymentId,
    p_reason: reason,
    p_gateway_dispute_id: gatewayDisputeId,
    p_actor: actor,
  });

  if (error) return { error: error.message };

  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath("/payments");
  revalidatePath("/payouts");
  return ok;
}

export async function resolveDispute(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const disputeId = String(formData.get("dispute_id") ?? "");
  const outcome = String(formData.get("outcome") ?? "");
  const resolution = String(formData.get("resolution") ?? "").trim() || null;

  if (!disputeId || (outcome !== "won" && outcome !== "lost")) {
    return { error: "Choose an outcome." };
  }

  const { error } = await supabase.rpc("resolve_dispute", {
    p_dispute_id: disputeId,
    p_outcome: outcome,
    p_resolution: resolution,
    p_actor: actor,
  });

  if (error) return { error: error.message };

  revalidatePath("/payments");
  revalidatePath("/payouts");
  return ok;
}

export async function setPaymentFees(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const paymentId = String(formData.get("payment_id") ?? "");
  const grossRaw = String(formData.get("gross_amount") ?? "").trim();
  const feeRaw = String(formData.get("gateway_fee") ?? "").trim();
  const netRaw = String(formData.get("net_amount") ?? "").trim();
  const projectId = String(formData.get("project_id") ?? "");

  if (!paymentId) return { error: "Missing payment." };

  const { error } = await supabase.rpc("set_payment_fees", {
    p_payment_id: paymentId,
    p_gross_amount: grossRaw === "" ? null : Number(grossRaw),
    p_gateway_fee: feeRaw === "" ? null : Number(feeRaw),
    p_net_amount: netRaw === "" ? null : Number(netRaw),
    p_actor: actor,
  });

  if (error) return { error: error.message };

  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath("/payments");
  return ok;
}
