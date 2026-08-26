import { cookies } from "next/headers";
import { DEFAULT_THEME, THEME_COOKIE, type Theme } from "./theme";

export async function getServerTheme(): Promise<Theme> {
  const cookieStore = await cookies();
  const value = cookieStore.get(THEME_COOKIE)?.value;
  return value === "light" || value === "dark" ? value : DEFAULT_THEME;
}
