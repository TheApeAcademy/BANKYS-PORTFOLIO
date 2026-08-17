"use server";

import { getProjectByToken } from "./configurator";
import { buildTxRef, initiateFlutterwavePayment } from "@/lib/flutterwave";
import { headers } from "next/headers";

export type InitiatePaymentResult = { ok: true; link: string } | { ok: false; error: string };

export async function initiatePayment(accessToken: string): Promise<InitiatePaymentResult> {
  const project = await getProjectByToken(accessToken);
  if (!project) return { ok: false, error: "Project not found." };
  if (!project.quoted_price) return { ok: false, error: "This project doesn't have a price yet." };
  if (!["draft", "awaiting_payment"].includes(project.status)) {
    return { ok: false, error: "This project has already been paid or is no longer awaiting payment." };
  }

  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  try {
    const link = await initiateFlutterwavePayment({
      txRef: buildTxRef(accessToken),
      amount: Number(project.quoted_price),
      currency: project.quoted_currency ?? "EUR",
      redirectUrl: `${origin}/start/pay/callback`,
      customerEmail: project.client_contact?.includes("@") ? project.client_contact : "",
      customerName: project.client_name,
      projectCode: project.project_code,
    });
    return { ok: true, link };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not start payment." };
  }
}
