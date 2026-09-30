"use server";

import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin } from "@zebraish/lib/auth";

export type KpiSummary = {
  revenue_this_month: Record<string, number>;
  active_projects: number;
  pending_commission_total: Record<string, number>;
  open_disputes: number;
  overdue_projects: number;
};

export async function getKpiSummary(): Promise<KpiSummary | null> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("kpi_summary").maybeSingle();
  if (error || !data) return null;
  return data as KpiSummary;
}

export type RevenuePoint = { period_start: string; currency: string; revenue: number };

export async function getRevenueTrend(granularity: "day" | "week" | "month", periods: number): Promise<RevenuePoint[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("kpi_revenue_by_period", {
    p_granularity: granularity,
    p_periods: periods,
  });
  if (error || !data) return [];
  return data as RevenuePoint[];
}

export type ActivityFeedEntry = {
  id: string;
  occurred_at: string;
  label: string;
  detail: string | null;
  href: string | null;
};

/** Unions Phase 3's audit_log (admin/commission-affecting actions) and
 * activity_events (configurator/checkout/login funnel milestones) into one
 * feed — no new RPC, just two reads the admin session can already make. */
export async function getActivityFeed(): Promise<ActivityFeedEntry[]> {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: auditRows }, { data: activityRows }] = await Promise.all([
    supabase
      .from("audit_log")
      .select("id, occurred_at, actor, action, entity_type, entity_id, reason")
      .order("occurred_at", { ascending: false })
      .limit(15),
    supabase
      .from("activity_events")
      .select("id, occurred_at, event_type, project_id, customer_id, metadata, path")
      .order("occurred_at", { ascending: false })
      .limit(25),
  ]);

  const fromAudit: ActivityFeedEntry[] = (auditRows ?? []).map((r) => ({
    id: `audit-${r.id}`,
    occurred_at: r.occurred_at,
    label: `${r.action} · ${r.entity_type}`,
    detail: r.reason ? `${r.actor} — ${r.reason}` : r.actor,
    href: r.entity_type === "project" && r.entity_id ? `/projects/${r.entity_id}` : null,
  }));

  const fromActivity: ActivityFeedEntry[] = (activityRows ?? []).map((r) => ({
    id: `activity-${r.id}`,
    occurred_at: r.occurred_at,
    label: describeActivity(r.event_type, r.metadata as Record<string, unknown> | null),
    detail: (r as { path?: string | null }).path ?? null,
    href: r.project_id ? `/projects/${r.project_id}` : r.customer_id ? `/customers/${r.customer_id}` : null,
  }));

  return [...fromAudit, ...fromActivity]
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
    .slice(0, 25);
}

/** Studio activity in plain words for the live feed. */
const ACTIVITY_WORDS: Record<string, string> = {
  page_view: "Someone opened a page",
  intro_started: "Someone powered on the intro",
  intro_completed: "Someone watched the intro to the end",
  intro_skipped: "Someone skipped the intro",
  builder_opened: "Someone opened the project builder",
  configurator_started: "A brief was started",
  configurator_step: "A brief moved forward a step",
  configurator_details_reached: "A brief reached the contact step",
  configurator_submitted: "A new brief came in",
  checkout_initiated: "Someone started paying",
  tracker_opened: "Someone opened the project tracker",
  tracker_lookup_found: "A client looked up their project",
  tracker_lookup_failed: "A tracker lookup didn't match",
  tracker_message_sent: "A client sent you a message",
  contact_whatsapp: "Someone tapped WhatsApp",
  contact_email: "Someone tapped Email",
  contact_call: "Someone tapped Call",
  contact_instagram: "Someone opened your Instagram",
  contact_tiktok: "Someone opened your TikTok",
  collab_apply_opened: "Someone opened the collaborator application",
  collab_code_opened: "A collaborator opened the code sign-in",
  language_switched: "Someone switched language",
  outbound_click: "Someone opened a linked site",
  login: "A collaborator signed in",
};

function describeActivity(type: string, meta: Record<string, unknown> | null): string {
  const base = ACTIVITY_WORDS[type] ?? type.replaceAll("_", " ");
  if (type === "language_switched" && meta?.to) return `${base} to ${meta.to === "es" ? "Spanish" : "English"}`;
  if (type === "outbound_click" && meta?.host) return `${base} (${meta.host})`;
  if (type === "login" && meta?.app === "admin") return "You signed in to the Bureau";
  if (type === "page_view" && meta?.device) return `${base} on ${meta.device}${meta.lang ? `, ${meta.lang === "es" ? "Spanish" : "English"}` : ""}`;
  return base;
}

export type StudioActivity = {
  days: number;
  visits: number;
  visits_prev: number;
  visits_today: number;
  page_views: number;
  events: Record<string, number>;
  top_pages: { path: string; views: number }[];
  devices: Record<string, number>;
  langs: Record<string, number>;
  referrers: { host: string; visits: number }[];
  applications: number;
  daily: { day: string; visits: number }[];
};

/** Everything visitors did on the studio in the last `days` days (024 migration). */
export async function getStudioActivity(days = 7): Promise<StudioActivity | null> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("studio_activity_summary", { p_days: days });
  if (error || !data) return null;
  return data as StudioActivity;
}

export type SearchResult = { entity_type: string; id: string; title: string; subtitle: string | null; href: string };

/** Global search across the entities the spec calls out: customers, projects
 * (incl. client name/email/order code), payments (via project), collaborators.
 * ILIKE + the existing btree indexes are enough at this scale — no new RPC,
 * no new index, just parallel reads the admin session can already make. */
export async function globalSearch(query: string): Promise<SearchResult[]> {
  await requireAdmin();
  const q = query.trim();
  if (q.length < 2) return [];
  const supabase = await createClient();
  const like = `%${q}%`;

  const [{ data: customers }, { data: projects }, { data: collaborators }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, full_name, email, phone, company")
      .or(`full_name.ilike.${like},email.ilike.${like},phone.ilike.${like},company.ilike.${like}`)
      .limit(8),
    supabase
      .from("projects")
      .select("id, project_code, client_name, client_contact")
      .or(`project_code.ilike.${like},client_name.ilike.${like},client_contact.ilike.${like}`)
      .limit(8),
    supabase.from("collaborators").select("id, name, email").or(`name.ilike.${like},email.ilike.${like}`).limit(8),
  ]);

  const results: SearchResult[] = [
    ...(customers ?? []).map((c) => ({
      entity_type: "customer",
      id: c.id,
      title: c.full_name,
      subtitle: c.email ?? c.company ?? null,
      href: `/customers/${c.id}`,
    })),
    ...(projects ?? []).map((p) => ({
      entity_type: "project",
      id: p.id,
      title: p.project_code,
      subtitle: p.client_name,
      href: `/projects/${p.id}`,
    })),
    ...(collaborators ?? []).map((c) => ({
      entity_type: "collaborator",
      id: c.id,
      title: c.name,
      subtitle: c.email,
      href: `/collaborators/${c.id}`,
    })),
  ];

  return results;
}
