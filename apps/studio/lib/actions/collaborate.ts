"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@zebraish/lib/supabase/server";
import { createServiceClient } from "@zebraish/lib/supabase/service";
import { checkRateLimit } from "@zebraish/lib/rate-limit";
import { getServerT } from "@/lib/i18n/server";

export type ApplyState = { error: string | null; success: boolean };

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10MB

type Attachment = { storage_path: string; file_name: string; file_size: number };

export async function submitCollaboratorApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const t = await getServerT();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const pitch = String(formData.get("pitch") ?? "").trim();
  const experience = String(formData.get("experience") ?? "").trim();
  const portfolioUrl = String(formData.get("portfolio_url") ?? "").trim();
  const files = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);

  if (!name || !pitch || !experience) {
    return { error: t("collab.error.required"), success: false };
  }

  if (files.length > MAX_ATTACHMENTS) {
    return { error: t("collab.error.tooManyFiles", { max: MAX_ATTACHMENTS }), success: false };
  }
  const oversized = files.find((f) => f.size > MAX_ATTACHMENT_BYTES);
  if (oversized) {
    return { error: t("collab.error.fileTooLarge", { name: oversized.name }), success: false };
  }

  const withinLimit = await checkRateLimit("studio-collab-apply", 5, 600);
  if (!withinLimit) {
    return { error: t("collab.error.rateLimited"), success: false };
  }

  // Applicants are anonymous (pre-auth), so uploads go through the service-role
  // client rather than opening up anon write access to the bucket — same
  // reasoning as every other public-form write in this app.
  const attachments: Attachment[] = [];
  if (files.length > 0) {
    const service = createServiceClient();
    for (const file of files) {
      const storagePath = `applications/${randomUUID()}-${file.name}`;
      const { error: uploadError } = await service.storage
        .from("collaborator-applications")
        .upload(storagePath, file, { contentType: file.type || undefined });
      if (uploadError) {
        return { error: t("collab.error.uploadFailed", { name: file.name }), success: false };
      }
      attachments.push({ storage_path: storagePath, file_name: file.name, file_size: file.size });
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_collaborator_application", {
    p_name: name,
    p_email: email || null,
    p_phone: phone || null,
    p_pitch: pitch,
    p_experience: experience,
    p_portfolio_url: portfolioUrl || null,
    p_attachments: attachments,
  });

  if (error) {
    return { error: t("collab.error.generic"), success: false };
  }

  return { error: null, success: true };
}
