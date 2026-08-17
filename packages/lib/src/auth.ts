import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type Profile = {
  id: string;
  role: "admin" | "collaborator";
  collaborator_id: string | null;
  full_name: string | null;
};

export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, collaborator_id, full_name")
    .eq("id", user.id)
    .single();

  return (profile as Profile) ?? null;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "admin") redirect("/login");
  return profile;
}

export async function requireCollaborator(): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "collaborator") redirect("/login");
  return profile;
}

export async function getActorLabel(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? "unknown";
}
