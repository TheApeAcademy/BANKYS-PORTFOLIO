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
