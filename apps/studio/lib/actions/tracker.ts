"use server";

import { createClient } from "@zebraish/lib/supabase/server";

export type TrackerStage = {
  stage_order: number;
  stage_label: string;
  status: "not_started" | "in_progress" | "complete";
};

export type ProjectTracker = {
  project_code: string;
  status: string;
  hold_state: string | null;
  project_type: string | null;
  total_stages: number | null;
  completed_stages: number | null;
  percent_complete: number | null;
  current_stage_key: string | null;
  current_stage_label: string | null;
  derived_status: string | null;
  stages: TrackerStage[];
  created_at: string;
};

export async function getProjectTracker(token: string): Promise<ProjectTracker | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_project_tracker", { p_access_token: token }).maybeSingle();
  if (error || !data) return null;
  return data as ProjectTracker;
}
