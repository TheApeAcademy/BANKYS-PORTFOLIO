"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@zebraish/lib/supabase/server";
import { checkRateLimit } from "@zebraish/lib/rate-limit";
import { COLLAB_COOKIE_NAME } from "@/lib/collaborator-cookie";

export type SignInState = { error: string | null };

type CollaboratorRecord = {
  id: string;
  name: string;
  commission_rate: number;
  term_start: string;
  term_end: string | null;
  active: boolean;
};

export async function verifyAccessCode(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Enter your access code." };

  const withinLimit = await checkRateLimit("studio-collab-code", 8, 300);
  if (!withinLimit) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_collaborator_by_code", { p_code: code });
  const collaborator = (Array.isArray(data) ? data[0] : data) as CollaboratorRecord | null;

  if (!collaborator || !collaborator.active) {
    await supabase.rpc("log_system_event", {
      p_severity: "warning",
      p_source: "auth",
      p_message: "Failed collaborator access code attempt",
      p_context: {},
    });
    return { error: "Invalid access code." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COLLAB_COOKIE_NAME, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  redirect("/dashboard");
}

export async function collaboratorSignOut() {
  const cookieStore = await cookies();
  cookieStore.delete(COLLAB_COOKIE_NAME);
  redirect("/login");
}

export async function getAccessCode(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COLLAB_COOKIE_NAME)?.value ?? null;
}

export async function requireCollaborator(): Promise<CollaboratorRecord> {
  const code = await getAccessCode();
  if (!code) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_collaborator_by_code", { p_code: code });
  const collaborator = (Array.isArray(data) ? data[0] : data) as CollaboratorRecord | null;

  if (!collaborator || !collaborator.active) redirect("/login");

  return collaborator;
}
