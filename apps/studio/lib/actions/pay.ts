"use server";

import { createClient } from "@zebraish/lib/supabase/server";
import { getProjectByToken } from "./configurator";
import { logActivityEvent } from "./activity";
import { buildTxRef, initiateFlutterwavePayment, initiateBankAccountCharge } from "@/lib/flutterwave";
import { headers } from "next/headers";

async function checkoutOrigin(): Promise<string> {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export type InitiatePaymentResult =
  | { ok: true; link: string }
  | { ok: false; error: string; needsEmail?: boolean };

export async function initiatePayment(accessToken: string, email?: string): Promise<InitiatePaymentResult> {
  const project = await getProjectByToken(accessToken);
  if (!project) return { ok: false, error: "Project not found." };
  if (!project.quoted_price) return { ok: false, error: "This project doesn't have a price yet." };
  if (!["draft", "awaiting_payment"].includes(project.status)) {
    return { ok: false, error: "This project has already been paid or is no longer awaiting payment." };
  }

  // Flutterwave's card checkout requires a customer email — no exceptions —
  // but the configurator lets a client give a phone number instead. Fall
  // back to whatever email the payment screen collected for this case.
  const customerEmail = project.client_contact?.includes("@") ? project.client_contact : email?.trim();
  if (!customerEmail || !customerEmail.includes("@")) {
    return { ok: false, error: "An email is required to pay by card.", needsEmail: true };
  }

  const origin = await checkoutOrigin();

  try {
    const link = await initiateFlutterwavePayment({
      txRef: buildTxRef(accessToken),
      amount: Number(project.quoted_price),
      currency: project.quoted_currency ?? "EUR",
      redirectUrl: `${origin}/start/pay/callback`,
      customerEmail,
      customerName: project.client_name,
      projectCode: project.project_code,
      // Card-only — "Bank Transfer" on this site is the separate Payoneer
      // manual rail below, not Flutterwave's own bank-transfer methods.
      paymentOptions: "card",
    });
    await logActivityEvent("checkout_initiated", {
      projectId: project.id,
      metadata: { quoted_price: project.quoted_price, currency: project.quoted_currency, method: "card" },
    });
    return { ok: true, link };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not start payment." };
  }
}

export type InitiateBankPaymentResult =
  | { ok: true; link: string }
  | { ok: false; error: string; needsEmail?: boolean; needsPhone?: boolean };

/**
 * "Pay with Bank" (Flutterwave's automated EU/UK bank-authorization method,
 * distinct from the manual Bank Transfer rail below). Requires both an
 * email and a phone number regardless of which one the configurator
 * already collected as the client's contact.
 */
export async function initiateBankPayment(
  accessToken: string,
  overrides?: { email?: string; phone?: string },
): Promise<InitiateBankPaymentResult> {
  const project = await getProjectByToken(accessToken);
  if (!project) return { ok: false, error: "Project not found." };
  if (!project.quoted_price) return { ok: false, error: "This project doesn't have a price yet." };
  if (!["draft", "awaiting_payment"].includes(project.status)) {
    return { ok: false, error: "This project has already been paid or is no longer awaiting payment." };
  }

  const contactIsEmail = Boolean(project.client_contact?.includes("@"));
  const customerEmail = (contactIsEmail ? project.client_contact : overrides?.email?.trim()) || "";
  const customerPhone = (!contactIsEmail ? project.client_contact : overrides?.phone?.trim()) || "";
  const needsEmail = !customerEmail.includes("@");
  const needsPhone = customerPhone.trim().length < 6;

  if (needsEmail || needsPhone) {
    return { ok: false, error: "An email and phone number are required to pay by bank.", needsEmail, needsPhone };
  }

  const origin = await checkoutOrigin();

  try {
    const link = await initiateBankAccountCharge({
      txRef: buildTxRef(accessToken),
      amount: Number(project.quoted_price),
      currency: project.quoted_currency ?? "EUR",
      redirectUrl: `${origin}/start/pay/callback`,
      customerEmail,
      customerPhone,
      customerName: project.client_name,
    });
    await logActivityEvent("checkout_initiated", {
      projectId: project.id,
      metadata: { quoted_price: project.quoted_price, currency: project.quoted_currency, method: "bank_charge" },
    });
    return { ok: true, link };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not start bank payment." };
  }
}

export type BankTransferIntent = {
  paymentId: string;
  projectCode: string;
  amount: number;
  currency: string;
};

export type InitiateBankTransferResult = { ok: true; intent: BankTransferIntent } | { ok: false; error: string };

export async function initiateBankTransfer(accessToken: string): Promise<InitiateBankTransferResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("create_bank_transfer_intent", { p_access_token: accessToken })
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not start a bank transfer for this project." };
  }

  const row = data as { payment_id: string; project_code: string; amount: number; currency: string };
  await logActivityEvent("checkout_initiated", {
    metadata: { project_code: row.project_code, amount: row.amount, currency: row.currency, method: "bank_transfer" },
  });

  return {
    ok: true,
    intent: { paymentId: row.payment_id, projectCode: row.project_code, amount: row.amount, currency: row.currency },
  };
}

export type BankTransferAccount = {
  beneficiaryName: string;
  details: Record<string, string>;
  provider: string;
};

export async function getBankTransferInstructions(currency: string): Promise<BankTransferAccount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_bank_transfer_instructions", { p_currency: currency });

  if (error || !data) return [];
  const rows = data as { beneficiary_name: string; details: Record<string, string>; provider: string }[];
  return rows.map((row) => ({ beneficiaryName: row.beneficiary_name, details: row.details ?? {}, provider: row.provider }));
}
