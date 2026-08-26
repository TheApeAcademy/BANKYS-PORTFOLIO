const FLW_BASE = "https://api.flutterwave.com/v3";

/** tx_ref encodes the project's access token so the callback/webhook can find it again. */
export function buildTxRef(accessToken: string): string {
  return `zbpay_${accessToken}_${Date.now()}`;
}

export function extractAccessToken(txRef: string): string | null {
  const match = /^zbpay_([a-f0-9]+)_\d+$/.exec(txRef);
  return match ? match[1] : null;
}

function secretKey(): string {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("FLUTTERWAVE_SECRET_KEY is not set.");
  return key;
}

export async function initiateFlutterwavePayment(params: {
  txRef: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  customerEmail: string;
  customerName: string;
  projectCode: string;
  /** Restricts which methods Flutterwave's hosted checkout shows — e.g. "card"
   * for a card-only button. Omit to let Flutterwave show its full default set
   * for the currency. https://developer.flutterwave.com/v3.0/docs/payment-methods */
  paymentOptions?: string;
}): Promise<string> {
  const res = await fetch(`${FLW_BASE}/payments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      tx_ref: params.txRef,
      amount: params.amount,
      currency: params.currency,
      redirect_url: params.redirectUrl,
      payment_options: params.paymentOptions || undefined,
      customer: { email: params.customerEmail || undefined, name: params.customerName },
      customizations: { title: "Zebraish", description: `Project ${params.projectCode}` },
    }),
  });
  const data = await res.json();
  if (!res.ok || data.status !== "success" || !data.data?.link) {
    throw new Error(data.message || "Could not start payment with Flutterwave.");
  }
  return data.data.link as string;
}

/**
 * "Pay With Bank" (UK & EU) — a different Flutterwave product from Standard
 * Checkout: the client authorizes payment directly from their own bank
 * (redirect to their bank, not a Flutterwave-hosted card page), covering
 * Spain/EU/UK in EUR or GBP. Uses the Charge API (POST /charges?type=...)
 * rather than /payments, and requires both an email and a phone number.
 * Sourced from Flutterwave's own Node SDK docs, not their (network-blocked
 * from this environment) developer site — worth a real test transaction
 * once live.
 */
export async function initiateBankAccountCharge(params: {
  txRef: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
}): Promise<string> {
  const res = await fetch(`${FLW_BASE}/charges?type=account-ach-uk`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      tx_ref: params.txRef,
      amount: params.amount,
      currency: params.currency,
      email: params.customerEmail,
      phone_number: params.customerPhone,
      fullname: params.customerName,
      redirect_url: params.redirectUrl,
      is_token_io: 1,
    }),
  });
  const data = await res.json();
  const redirect: string | undefined = data?.data?.meta?.authorization?.redirect ?? data?.meta?.authorization?.redirect;
  if (!res.ok || data.status !== "success" || !redirect) {
    throw new Error(data.message || "Could not start bank payment with Flutterwave.");
  }
  return redirect;
}

export type FlutterwaveTransaction = {
  status: string;
  data?: {
    id: number;
    tx_ref: string;
    amount: number;
    currency: string;
    status: string; // "successful" | "failed" | ...
  };
};

export async function verifyFlutterwaveTransaction(transactionId: string | number): Promise<FlutterwaveTransaction> {
  const res = await fetch(`${FLW_BASE}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
  });
  return res.json();
}

/** Compares the webhook's verif-hash header against your configured Flutterwave secret hash. */
export function isValidFlutterwaveWebhookSignature(headerHash: string | null): boolean {
  const expected = process.env.FLUTTERWAVE_SECRET_HASH;
  if (!expected || !headerHash) return false;
  return headerHash === expected;
}
