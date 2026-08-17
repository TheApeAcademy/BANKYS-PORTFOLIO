"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@zebraish/lib/auth";

export async function markPayoutPaid(formData: FormData) {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const collaboratorId = String(formData.get("collaborator_id") ?? "");
  const weekOf = String(formData.get("week_of") ?? "");
  const exchangeRateRaw = String(formData.get("exchange_rate") ?? "1");
  const currency = String(formData.get("currency") ?? "NGN");

  if (!collaboratorId || !weekOf) return;

  const { error } = await supabase.rpc("mark_payout_paid", {
    p_collaborator_id: collaboratorId,
    p_week_of: weekOf,
    p_exchange_rate: Number(exchangeRateRaw) || 1,
    p_currency: currency,
    p_actor: actor,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/payouts");
  revalidatePath("/admin/collaborators");
}
