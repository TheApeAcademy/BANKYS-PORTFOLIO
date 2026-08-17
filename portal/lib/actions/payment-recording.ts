import { createServiceClient } from "@/lib/supabase/service";
import { verifyFlutterwaveTransaction, extractAccessToken } from "@/lib/flutterwave";

/**
 * Verifies a Flutterwave transaction directly with Flutterwave (never trusts the
 * redirect/webhook payload alone) and records it against the project, idempotently.
 * Safe to call from both the redirect callback and the async webhook for the same
 * transaction — the DB-level unique constraint on gateway_ref prevents double-recording.
 */
export async function verifyAndRecordFlutterwavePayment(transactionId: string | number, expectedTxRef: string) {
  const verification = await verifyFlutterwaveTransaction(transactionId);
  const txn = verification.data;

  if (verification.status !== "success" || !txn || txn.status !== "successful" || txn.tx_ref !== expectedTxRef) {
    return { ok: false as const, reason: "Transaction not verified as successful." };
  }

  const accessToken = extractAccessToken(expectedTxRef);
  if (!accessToken) {
    return { ok: false as const, reason: "Malformed transaction reference." };
  }

  const supabase = createServiceClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, quoted_price, quoted_currency")
    .eq("access_token", accessToken)
    .maybeSingle();

  if (projectError || !project) {
    return { ok: false as const, reason: "Could not find the matching project for this payment." };
  }

  if (txn.amount < Number(project.quoted_price) || txn.currency !== project.quoted_currency) {
    return { ok: false as const, reason: "Paid amount/currency does not match the quoted project price." };
  }

  const { data: payment, error } = await supabase
    .rpc("record_gateway_payment", {
      p_project_id: project.id,
      p_amount: txn.amount,
      p_currency: txn.currency,
      p_gateway: "flutterwave",
      p_gateway_ref: String(txn.id),
      p_actor: "flutterwave-webhook",
    })
    .single();

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  return { ok: true as const, payment };
}
