"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@zebraish/lib/auth";

export type RevenueGoal = { id: string; period: string; target_amount: number; currency: string };

export async function getCurrentRevenueGoals(): Promise<RevenueGoal[]> {
  await requireAdmin();
  const supabase = await createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  const period = monthStart.toISOString().slice(0, 10);
  const { data } = await supabase
    .from("revenue_goals")
    .select("id, period, target_amount, currency")
    .eq("period", period)
    .order("currency");
  return (data ?? []) as RevenueGoal[];
}

export type GoalActionState = { error: string | null };
const ok: GoalActionState = { error: null };

export async function setRevenueGoal(_prev: GoalActionState, formData: FormData): Promise<GoalActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const targetAmount = Number(formData.get("target_amount"));
  const currency = String(formData.get("currency") ?? "EUR");
  if (!targetAmount || targetAmount <= 0) return { error: "Enter a target amount greater than zero." };

  const monthStart = new Date();
  monthStart.setDate(1);
  const period = monthStart.toISOString().slice(0, 10);

  const { error } = await supabase
    .from("revenue_goals")
    .upsert(
      { period, currency, target_amount: targetAmount, created_by: actor },
      { onConflict: "period,currency" },
    );

  if (error) return { error: error.message };
  revalidatePath("/analytics");
  return ok;
}

export type ServiceBreakdown = {
  project_type: string;
  label: string;
  requested_count: number;
  revenue: Record<string, number>;
  aov: Record<string, number>;
  growth_pct: number;
};

export async function getTopServices(): Promise<ServiceBreakdown[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("top_services_breakdown");
  if (error || !data) return [];
  return data as ServiceBreakdown[];
}

export type HeatmapCell = { day_of_week: number; hour_of_day: number; event_count: number };

export async function getActivityHeatmap(): Promise<HeatmapCell[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("activity_heatmap");
  if (error || !data) return [];
  return data as HeatmapCell[];
}

export type FunnelStage = {
  stage_order: number;
  stage_label: string;
  event_count: number;
  pct_of_previous_stage: number | null;
};

export async function getFunnelSummary(): Promise<FunnelStage[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("funnel_summary");
  if (error || !data) return [];
  return data as FunnelStage[];
}
