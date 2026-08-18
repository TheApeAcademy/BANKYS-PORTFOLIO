import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// This entire app is the admin surface — every route requires an
// authenticated admin session except /login itself. Session presence is
// checked here at the middleware layer; role is re-checked too, since a
// collaborator's valid session should never render an admin page even
// transiently.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // "/login" and "/login/mfa" both count as login routes — a session that's
  // only aal1 must be able to reach the MFA challenge screen itself without
  // being redirected right back to it.
  const isLoginRoute = request.nextUrl.pathname.startsWith("/login");

  if (!isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!isLoginRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Enforce MFA when enrolled: a password-only (aal1) session on an account
    // with a verified TOTP factor (nextLevel aal2) must challenge before it
    // can reach any page beyond the challenge screen itself (excluded above
    // via isLoginRoute).
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
      const url = request.nextUrl.clone();
      url.pathname = "/login/mfa";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
