"use server";

import { createClient } from "@zebraish/lib/supabase/server";
import { checkRateLimit } from "@zebraish/lib/rate-limit";
import { getProjectTracker, type ProjectTracker } from "./tracker";
import { getProjectMessages, type TrackerMessage } from "./messages";

export type ProjectOverview = {
  project_code: string;
  first_name: string;
  project_type: string | null;
  status: string;
  price: number | null;
  currency: string;
  price_confirmed: boolean;
  price_confirmed_at: string | null;
  payable: boolean;
  configuration: Record<string, unknown>;
  created_at: string;
};

export type TrackerView =
  | { ok: true; overview: ProjectOverview; tracker: ProjectTracker | null; messages: TrackerMessage[] }
  | { ok: false; error: string };

/** Everything the tracker pop-up shows, looked up by the client's private token. */
export async function loadTrackerView(token: string): Promise<TrackerView> {
  if (!token) return { ok: false, error: "Missing project link." };
  if (!(await checkRateLimit("track-token", 30, 300))) {
    return { ok: false, error: "Too many attempts. Wait a few minutes and try again." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_project_overview", { p_access_token: token });
  if (error || !data) return { ok: false, error: "We couldn't find that project. Check the link, or look it up with your code." };
  const [tracker, messages] = await Promise.all([getProjectTracker(token), getProjectMessages(token)]);
  return { ok: true, overview: data as ProjectOverview, tracker, messages };
}

/** "Lost my link": project code + the phone, email or handle the client gave us. */
export async function findProjectAccess(code: string, contact: string): Promise<{ token: string } | { error: string }> {
  if (!code.trim() || !contact.trim()) return { error: "Enter your project code and the contact you used." };
  if (!(await checkRateLimit("track-lookup", 8, 900))) {
    return { error: "Too many attempts. Wait 15 minutes and try again." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("find_project_access", { p_code: code, p_contact: contact });
  if (error || !data) return { error: "No match. Use the code from your confirmation and the same number, email or handle you gave us." };
  return { token: String(data) };
}

export async function sendTrackerMessage(token: string, body: string): Promise<{ error: string | null; messages?: TrackerMessage[] }> {
  const text = body.trim();
  if (!token || !text) return { error: "Write a message first." };
  if (text.length > 4000) return { error: "That message is too long." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("send_client_message", { p_access_token: token, p_body: text });
  if (error) return { error: "Couldn't send. Try again." };
  return { error: null, messages: await getProjectMessages(token) };
}
