"use server";

import { redirect } from "next/navigation";
import { createClient } from "@zebraish/lib/supabase/server";
import { checkRateLimit } from "@zebraish/lib/rate-limit";

export type SignInState = { error: string | null };

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  // This app is the single admin's full-access control center — a brute-force
  // attempt here is worth stopping before it even reaches Supabase Auth.
  const withinLimit = await checkRateLimit("admin-login", 8, 300);
  if (!withinLimit) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    // "critical" not "warning": this is the single-admin control center —
    // a failed login here is either the founder mistyping a password or
    // someone probing the one account that has full write access to every
    // table in the schema. Worth standing out from studio's collaborator
    // login failures.
    await supabase.rpc("log_system_event", {
      p_severity: "critical",
      p_source: "auth",
      p_message: "Failed login attempt on admin control center",
      p_context: { email },
    });
    return { error: "Invalid email or password." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // This app is admin-only — a collaborator's valid credentials get the
  // same generic error as any other non-admin login, not a hint that
  // their account exists or what it's for.
  if (!profile || profile.role !== "admin") {
    await supabase.rpc("log_system_event", {
      p_severity: "critical",
      p_source: "auth",
      p_message: "Non-admin account attempted admin control center login",
      p_context: { email, role: profile?.role ?? null },
    });
    await supabase.auth.signOut();
    return { error: "Invalid email or password." };
  }

  await supabase.rpc("log_activity_event", {
    p_event_type: "login",
    p_session_id: null,
    p_metadata: { app: "admin" },
  });

  // If MFA is enrolled but this session hasn't verified a second factor yet,
  // send the password-only session to the challenge screen before granting
  // access — proxy.ts enforces this too, but redirecting straight there
  // avoids a bounce through "/" first.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
    redirect("/login/mfa");
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
