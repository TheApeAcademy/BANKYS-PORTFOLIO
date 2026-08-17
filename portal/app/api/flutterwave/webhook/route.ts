import { NextRequest, NextResponse } from "next/server";
import { isValidFlutterwaveWebhookSignature } from "@/lib/flutterwave";
import { verifyAndRecordFlutterwavePayment } from "@/lib/actions/payment-recording";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("verif-hash");
  if (!isValidFlutterwaveWebhookSignature(signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const body = await request.json();
  if (body.event !== "charge.completed" || body.data?.status !== "successful") {
    return NextResponse.json({ received: true });
  }

  const result = await verifyAndRecordFlutterwavePayment(body.data.id, body.data.tx_ref);
  if (!result.ok) {
    return NextResponse.json({ received: true, recorded: false, reason: result.reason });
  }

  return NextResponse.json({ received: true, recorded: true });
}
