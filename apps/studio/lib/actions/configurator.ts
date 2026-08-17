"use server";

import { createClient } from "@zebraish/lib/supabase/server";
import type { Answers } from "@zebraish/lib/catalogue/types";
import { sendAdminIntakeNotification } from "@/lib/email";

export type SaveConfigurationInput = {
  accessToken: string | null;
  clientName: string;
  clientContact: string;
  projectType: string;
  answers: Answers;
  quotedPrice: number;
  currency: string;
};

export type SaveConfigurationResult =
  | { ok: true; projectId: string; projectCode: string; accessToken: string }
  | { ok: false; error: string };

export async function saveProjectConfiguration(
  input: SaveConfigurationInput,
): Promise<SaveConfigurationResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return {
      ok: false,
      error: `Server is missing Supabase config (NEXT_PUBLIC_SUPABASE_URL ${url ? "set" : "MISSING"}, NEXT_PUBLIC_SUPABASE_ANON_KEY ${key ? "set" : "MISSING"}) — check Vercel env vars.`,
    };
  }

  const supabase = await createClient();

  let data: unknown;
  let error: { message: string } | null;
  try {
    const result = await supabase
      .rpc("save_project_configuration", {
        p_access_token: input.accessToken,
        p_client_name: input.clientName,
        p_client_contact: input.clientContact,
        p_project_type: input.projectType,
        p_configuration: input.answers,
        p_quoted_price: input.quotedPrice,
        p_currency: input.currency,
      })
      .single();
    data = result.data;
    error = result.error;
  } catch (err) {
    const cause = err instanceof Error && "cause" in err ? String((err as Error & { cause?: unknown }).cause) : null;
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: `Network error reaching Supabase at ${url}: ${message}${cause ? ` (cause: ${cause})` : ""}`,
    };
  }

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not save your project." };
  }

  const row = data as { project_id: string; project_code: string; access_token: string };

  if (!input.accessToken) {
    // Only notify on first creation, not on every edit/resave of an existing draft.
    await sendAdminIntakeNotification({ projectCode: row.project_code, clientName: input.clientName });
  }

  return { ok: true, projectId: row.project_id, projectCode: row.project_code, accessToken: row.access_token };
}

export type ResumedProject = {
  id: string; // present on the underlying `projects` row the RPC returns
  project_code: string;
  client_name: string;
  client_contact: string | null;
  project_type: string | null;
  configuration: Answers | null;
  quoted_price: number | null;
  quoted_currency: string | null;
  status: string;
};

export async function getProjectByToken(token: string): Promise<ResumedProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_project_by_token", { p_access_token: token }).single();
  if (error || !data) return null;
  return data as ResumedProject;
}
