"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin } from "@zebraish/lib/auth";

export type Notification = {
  id: string;
  type: string;
  entity_type: string | null;
  entity_id: string | null;
  title: string;
  body: string | null;
  read_at: string | null;
  archived_at: string | null;
  created_at: string;
};

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null)
    .is("archived_at", null);
  return count ?? 0;
}

export async function markNotificationRead(notificationId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.rpc("mark_notification_read", { p_notification_id: notificationId });
  revalidatePath("/notifications");
}

export async function archiveNotification(notificationId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.rpc("archive_notification", { p_notification_id: notificationId });
  revalidatePath("/notifications");
}
