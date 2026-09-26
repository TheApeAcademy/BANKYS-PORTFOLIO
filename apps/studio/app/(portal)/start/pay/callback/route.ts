import { NextRequest, NextResponse } from "next/server";
import { verifyAndRecordFlutterwavePayment } from "@/lib/actions/payment-recording";
import { extractAccessToken } from "@/lib/flutterwave";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const status = searchParams.get("status");
  const txRef = searchParams.get("tx_ref");
  const transactionId = searchParams.get("transaction_id");

  const accessToken = txRef ? extractAccessToken(txRef) : null;

  if (status !== "successful" || !txRef || !transactionId || !accessToken) {
    const url = new URL("/start/pay", origin);
    if (accessToken) url.searchParams.set("token", accessToken);
    url.searchParams.set("payment", "failed");
    return NextResponse.redirect(url);
  }

  const result = await verifyAndRecordFlutterwavePayment(transactionId, txRef);

  const url = new URL(`/start`, origin);
  url.searchParams.set("token", accessToken);
  url.searchParams.set("payment", result.ok ? "success" : "failed");
  return NextResponse.redirect(url);
}
