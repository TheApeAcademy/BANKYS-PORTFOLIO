import { NextRequest, NextResponse } from "next/server";
import { isValidFlutterwaveWebhookSignature } from "@/lib/flutterwave";
import { verifyAndRecordFlutterwavePayment } from "@/lib/actions/payment-recording";
import { createServiceClient } from "@zebraish/lib/supabase/service";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("verif-hash");
  if (!isValidFlutterwaveWebhookSignature(signature)) {
    // No session exists at this point (server-to-server webhook) — the
    // service-role client is the only way to log this, same as the rest of
    // this route's payment-recording path.
    await createServiceClient().rpc("log_system_event", {
      p_severity: "critical",
      p_source: "flutterwave-webhook",
      p_message: "Webhook signature verification failed",
      p_context: { hasSignatureHeader: Boolean(signature) },
    });
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
