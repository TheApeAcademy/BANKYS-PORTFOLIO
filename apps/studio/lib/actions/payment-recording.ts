import { createServiceClient } from "@zebraish/lib/supabase/service";
import { verifyFlutterwaveTransaction, extractAccessToken } from "@/lib/flutterwave";
import { sendClientPaymentConfirmation, sendAdminPaymentNotification } from "@/lib/email";

/**
 * Verifies a Flutterwave transaction directly with Flutterwave (never trusts the
 * redirect/webhook payload alone) and records it against the project, idempotently.
 * Safe to call from both the redirect callback and the async webhook for the same
 * transaction — the DB-level unique constraint on gateway_ref prevents double-recording,
 * and `was_new` ensures notification emails only ever fire once.
 */
export async function verifyAndRecordFlutterwavePayment(transactionId: string | number, expectedTxRef: string) {
  const verification = await verifyFlutterwaveTransaction(transactionId);
  const txn = verification.data;
  const supabase = createServiceClient();

  if (verification.status !== "success" || !txn || txn.status !== "successful" || txn.tx_ref !== expectedTxRef) {
    await supabase.rpc("log_system_event", {
      p_severity: "warning",
      p_source: "flutterwave-webhook",
      p_message: "Transaction not verified as successful",
      p_context: { transactionId, expectedTxRef, verificationStatus: verification.status, txnStatus: txn?.status },
    });
    return { ok: false as const, reason: "Transaction not verified as successful." };
  }

  const accessToken = extractAccessToken(expectedTxRef);
  if (!accessToken) {
    await supabase.rpc("log_system_event", {
      p_severity: "error",
      p_source: "flutterwave-webhook",
      p_message: "Malformed transaction reference",
      p_context: { transactionId, expectedTxRef },
    });
    return { ok: false as const, reason: "Malformed transaction reference." };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, client_name, client_contact, quoted_price, quoted_currency")
    .eq("access_token", accessToken)
    .maybeSingle();

  if (projectError || !project) {
    await supabase.rpc("log_system_event", {
      p_severity: "error",
      p_source: "flutterwave-webhook",
      p_message: "No matching project for a verified payment",
      p_context: { transactionId, expectedTxRef },
    });
    return { ok: false as const, reason: "Could not find the matching project for this payment." };
  }

  if (txn.amount < Number(project.quoted_price) || txn.currency !== project.quoted_currency) {
    // Worth flagging above "warning": either a pricing-desync bug or a
    // deliberate underpayment attempt against a real project.
    await supabase.rpc("log_system_event", {
      p_severity: "critical",
      p_source: "flutterwave-webhook",
      p_message: "Paid amount/currency does not match the quoted project price",
      p_context: {
        projectId: project.id,
        paid: { amount: txn.amount, currency: txn.currency },
        quoted: { amount: project.quoted_price, currency: project.quoted_currency },
      },
    });
    return { ok: false as const, reason: "Paid amount/currency does not match the quoted project price." };
  }

  const { data, error } = await supabase
    .rpc("record_gateway_payment", {
      p_project_id: project.id,
      p_amount: txn.amount,
      p_currency: txn.currency,
      p_gateway: "flutterwave",
      p_gateway_ref: String(txn.id),
      p_actor: "flutterwave-webhook",
    })
    .single();

  if (error || !data) {
    await supabase.rpc("log_system_event", {
      p_severity: "error",
      p_source: "flutterwave-webhook",
      p_message: "record_gateway_payment RPC failed",
      p_context: { projectId: project.id, error: error?.message ?? null },
    });
    return { ok: false as const, reason: error?.message ?? "Could not record payment." };
  }

  const { payment, was_new: wasNew } = data as { payment: { id: string }; was_new: boolean };

  if (wasNew) {
    const notifyParams = {
      projectCode: (await supabase.from("projects").select("project_code").eq("id", project.id).single()).data
        ?.project_code as string,
      clientName: project.client_name,
      amount: txn.amount,
      currency: txn.currency,
    };
    await Promise.all([
      sendClientPaymentConfirmation({ to: project.client_contact ?? "", ...notifyParams }),
      sendAdminPaymentNotification(notifyParams),
    ]);
  }

  return { ok: true as const, payment };
}
