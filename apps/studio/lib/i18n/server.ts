import { cookies } from "next/headers";
import { DEFAULT_LANG, LANG_COOKIE, translate, type DictKey, type Lang } from "./dictionary";

export async function getServerLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LANG_COOKIE)?.value;
  return value === "en" || value === "es" ? value : DEFAULT_LANG;
}

export async function getServerT(): Promise<(key: DictKey, vars?: Record<string, string | number>) => string> {
  const lang = await getServerLang();
  return (key, vars) => translate(lang, key, vars);
}
