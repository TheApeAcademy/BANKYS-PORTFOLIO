import { NextResponse, type NextRequest } from "next/server";
import { COLLAB_COOKIE_NAME } from "@/lib/collaborator-cookie";

// Collaborators authenticate with a private access code (a cookie), not a
// Supabase Auth session — no accounts, no email confirmation. This only
// checks cookie presence; the layout validates the code itself (correct,
// active) against the database on every request.
export function proxy(request: NextRequest) {
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboardRoute && !request.cookies.get(COLLAB_COOKIE_NAME)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
