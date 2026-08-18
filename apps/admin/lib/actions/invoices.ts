"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@zebraish/lib/auth";
import { renderInvoicePdf } from "@/lib/invoice-pdf";

export type ActionState = { error: string | null };
const ok: ActionState = { error: null };

export async function createInvoice(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const projectId = String(formData.get("project_id") ?? "");
  const paymentId = String(formData.get("payment_id") ?? "").trim() || null;
  const currency = String(formData.get("currency") ?? "EUR");
  const lineItemsRaw = String(formData.get("line_items") ?? "[]");

  let lineItems: { label: string; price: number }[];
  try {
    lineItems = JSON.parse(lineItemsRaw);
  } catch {
    return { error: "Invalid line items." };
  }
  if (!projectId || !lineItems.length) {
    return { error: "Add at least one line item." };
  }

  const total = lineItems.reduce((sum, l) => sum + Number(l.price || 0), 0);
  if (total <= 0) return { error: "Total must be greater than zero." };

  const { data: invoice, error } = await supabase.rpc("create_invoice", {
    p_project_id: projectId,
    p_payment_id: paymentId,
    p_line_items: lineItems,
    p_subtotal: total,
    p_total: total,
    p_currency: currency,
    p_actor: actor,
  });

  if (error) return { error: error.message };

  const { data: project } = await supabase
    .from("projects")
    .select("project_code, client_name")
    .eq("id", projectId)
    .single();

  try {
    const pdfBuffer = await renderInvoicePdf({
      invoiceNumber: invoice.invoice_number,
      issuedAt: invoice.issued_at,
      projectCode: project?.project_code ?? "",
      clientName: project?.client_name ?? "",
      lineItems,
      subtotal: total,
      total,
      currency,
    });

    const storagePath = `invoices/${invoice.invoice_number}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("project-files")
      .upload(storagePath, pdfBuffer, { contentType: "application/pdf" });

    if (!uploadError) {
      await supabase.rpc("set_invoice_pdf", { p_invoice_id: invoice.id, p_pdf_storage_path: storagePath });
    }
  } catch {
    // Invoice row exists and is the source of truth either way; PDF generation
    // failing here just means pdf_storage_path stays null — visible on the
    // page as "PDF not generated" rather than blocking invoice creation.
  }

  revalidatePath(`/projects/${projectId}`);
  return ok;
}

export async function getInvoicePdfUrl(storagePath: string): Promise<string | null> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase.storage.from("project-files").createSignedUrl(storagePath, 300);
  if (error || !data) return null;
  return data.signedUrl;
}
