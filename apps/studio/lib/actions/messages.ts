"use server";

import { createClient } from "@zebraish/lib/supabase/server";

export type TrackerMessage = {
  id: string;
  sender_type: "admin" | "client" | "system";
  sender_label: string;
  body: string;
  created_at: string;
};

export async function getProjectMessages(token: string): Promise<TrackerMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_project_messages", { p_access_token: token });
  if (error || !data) return [];
  return data as TrackerMessage[];
}
