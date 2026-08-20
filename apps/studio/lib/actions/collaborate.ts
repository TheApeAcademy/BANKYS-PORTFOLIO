"use server";

import { createClient } from "@zebraish/lib/supabase/server";
import { checkRateLimit } from "@zebraish/lib/rate-limit";

export type ApplyState = { error: string | null; success: boolean };

export async function submitCollaboratorApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const pitch = String(formData.get("pitch") ?? "").trim();
  const experience = String(formData.get("experience") ?? "").trim();

  if (!name || !pitch || !experience) {
    return { error: "Name, and both questions below, are required.", success: false };
  }

  const withinLimit = await checkRateLimit("studio-collab-apply", 5, 600);
  if (!withinLimit) {
    return { error: "Too many attempts. Wait a few minutes and try again.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_collaborator_application", {
    p_name: name,
    p_email: email || null,
    p_phone: phone || null,
    p_pitch: pitch,
    p_experience: experience,
  });

  if (error) {
    return { error: "Something went wrong submitting your application — try again.", success: false };
  }

  return { error: null, success: true };
}
