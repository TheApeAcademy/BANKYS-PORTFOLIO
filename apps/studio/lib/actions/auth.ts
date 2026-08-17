"use server";

import { redirect } from "next/navigation";
import { createClient } from "@zebraish/lib/supabase/server";

export type SignInState = { error: string | null };

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Invalid email or password." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "This account isn't set up yet. Contact the Zebraish admin." };
  }

  // This app now serves collaborators only — the admin control center is a
  // separate app/deployment. An admin-role account hitting this form gets
  // the same generic error as any other non-collaborator credential, not a
  // hint that it's an admin account.
  if (profile.role !== "collaborator") {
    await supabase.auth.signOut();
    return { error: "Invalid email or password." };
  }

  if (next && next.startsWith("/")) {
    redirect(next);
  }
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
