import { NextResponse, type NextRequest } from "next/server";
import { COLLAB_COOKIE_NAME } from "@/lib/collaborator-cookie";
import { LANG_COOKIE } from "@/lib/i18n/dictionary";

export function proxy(request: NextRequest) {
  // ?lang=en / ?lang=es on any page (links in pitch emails) sets the site
  // language and reloads the same page without the parameter, so the choice
  // sticks like the header toggle.
  const lang = request.nextUrl.searchParams.get("lang");
  if (lang === "en" || lang === "es") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    const res = NextResponse.redirect(url);
    res.cookies.set(LANG_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return res;
  }

  // Collaborators authenticate with a private access code (a cookie), not a
  // Supabase Auth session — no accounts, no email confirmation. This only
  // checks cookie presence; the layout validates the code itself (correct,
  // active) against the database on every request.
  if (request.nextUrl.pathname.startsWith("/dashboard") && !request.cookies.get(COLLAB_COOKIE_NAME)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Every page, but not Next's own files, API routes or static assets.
  matcher: ["/((?!_next/|api/|.*\\.(?:png|jpe?g|gif|svg|webp|ico|glb|mp3|mp4|js|css|txt|xml|json|woff2?)$).*)"],
};
