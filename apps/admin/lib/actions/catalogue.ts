"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@zebraish/lib/auth";

// Draft creation/publish go through RPCs (audited, and publish needs to
// atomically flip is_active across versions) — everything else below is a
// plain admin-only-RLS table write, guarded against editing a published
// version by the DB triggers in the Phase 7 migration. These are used as
// plain (non-useActionState) form actions — with ~1000 option rows across
// the catalogue, per-row client components for interactive pending/error
// state isn't worth the cost; errors (including the publish-lock guard)
// simply no-op the edit rather than surfacing inline.

export async function createCatalogueVersion(formData: FormData) {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { data, error } = await supabase.rpc("create_catalogue_version", { p_notes: notes, p_actor: actor });
  if (error) return;

  revalidatePath("/catalogue");
  if (data?.id) redirect(`/catalogue/${data.id}`);
}

export async function publishCatalogueVersion(versionId: string) {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  await supabase.rpc("publish_catalogue_version", { p_version_id: versionId, p_actor: actor });

  revalidatePath("/catalogue");
  revalidatePath(`/catalogue/${versionId}`);
}

export async function updateProjectType(typeRowId: string, versionId: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  const label = String(formData.get("label") ?? "").trim();
  const helper = String(formData.get("helper") ?? "").trim();
  const basePriceRaw = String(formData.get("base_price") ?? "").trim();
  if (!label || !helper) return;

  await supabase
    .from("catalogue_project_types")
    .update({ label, helper, base_price: basePriceRaw === "" ? null : Number(basePriceRaw) })
    .eq("id", typeRowId);

  revalidatePath(`/catalogue/${versionId}`);
}

export async function updateStep(stepId: string, versionId: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  const question = String(formData.get("question") ?? "").trim();
  const helper = String(formData.get("helper") ?? "").trim();
  const optional = formData.get("optional") === "on";
  if (!question) return;

  await supabase.from("catalogue_steps").update({ question, helper: helper || null, optional }).eq("id", stepId);

  revalidatePath(`/catalogue/${versionId}`);
}

export async function updateOption(optionId: string, versionId: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  const label = String(formData.get("label") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const multiplierRaw = String(formData.get("multiplier") ?? "").trim();
  if (!label) return;

  await supabase
    .from("catalogue_options")
    .update({
      label,
      price: priceRaw === "" ? null : Number(priceRaw),
      multiplier: multiplierRaw === "" ? null : Number(multiplierRaw),
    })
    .eq("id", optionId);

  revalidatePath(`/catalogue/${versionId}`);
}

export async function deleteOption(optionId: string, versionId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("catalogue_options").delete().eq("id", optionId);
  revalidatePath(`/catalogue/${versionId}`);
}

export async function addOption(stepId: string, versionId: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  const optionKey = String(formData.get("option_key") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  if (!optionKey || !label) return;

  const { count } = await supabase
    .from("catalogue_options")
    .select("id", { count: "exact", head: true })
    .eq("step_id", stepId);

  await supabase.from("catalogue_options").insert({
    step_id: stepId,
    option_key: optionKey,
    label,
    price: priceRaw === "" ? null : Number(priceRaw),
    option_order: (count ?? 0) + 1,
  });

  revalidatePath(`/catalogue/${versionId}`);
}
