"use server";

import { createClient } from "@zebraish/lib/supabase/server";
import type { Answers, QuoteResult } from "@zebraish/lib/catalogue/types";
import { sendAdminIntakeNotification } from "@/lib/email";

export type SaveConfigurationInput = {
  accessToken: string | null;
  clientName: string;
  clientContact: string;
  projectType: string;
  answers: Answers;
  quotedPrice: number;
  currency: string;
  quote: QuoteResult;
};

/**
 * Records an immutable price-at-purchase snapshot after a project save has
 * already succeeded. Deliberately isolated from saveProjectConfiguration's
 * own try/catch: a bug here must never surface as a failure of the save
 * itself, since that RPC call already has a documented intermittent
 * production issue and doesn't need a new, unexercised failure mode added
 * to its blast radius.
 */
async function recordPriceSnapshot(projectId: string, quote: QuoteResult, currency: string) {
  try {
    const supabase = await createClient();
    await supabase.rpc("record_price_snapshot", {
      p_project_id: projectId,
      p_catalogue_source: "configurator-v1",
      p_lines: quote.lines,
      p_subtotal: quote.subtotal,
      p_complexity_multiplier: quote.complexityMultiplier,
      p_delivery_multiplier: quote.deliveryMultiplier,
      p_total: quote.total,
      p_currency: currency,
    });
  } catch {
    // Best-effort — never block or fail the save over this.
  }
}

export type SaveConfigurationResult =
  | { ok: true; projectId: string; projectCode: string; accessToken: string }
  | { ok: false; error: string };

/**
 * If the network path to Supabase hangs (rather than erroring outright), the request
 * would otherwise sit until the Vercel function itself is killed by the platform —
 * which surfaces to the client as a bare, unlabeled "fetch failed" with no diagnostic
 * detail, because our own code never got control back to report anything. Aborting
 * on our own clock first guarantees we always get to return a clear, specific error.
 */
const SUPABASE_TIMEOUT_MS = 8000;

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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);

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
      .abortSignal(controller.signal)
      .single();
    data = result.data;
    error = result.error;
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    if (isAbort) {
      return {
        ok: false,
        error: `Timed out after ${SUPABASE_TIMEOUT_MS / 1000}s reaching Supabase at ${url}. This means the server can start a connection but never gets a response — check Supabase project status and Vercel's outbound network settings.`,
      };
    }
    const cause = err instanceof Error && "cause" in err ? String((err as Error & { cause?: unknown }).cause) : null;
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: `Network error reaching Supabase at ${url}: ${message}${cause ? ` (cause: ${cause})` : ""}`,
    };
  } finally {
    clearTimeout(timer);
  }

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not save your project." };
  }

  const row = data as { project_id: string; project_code: string; access_token: string };

  await recordPriceSnapshot(row.project_id, input.quote, input.currency);

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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
  try {
    const { data, error } = await supabase
      .rpc("get_project_by_token", { p_access_token: token })
      .abortSignal(controller.signal)
      .single();
    if (error || !data) return null;
    return data as ResumedProject;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
