import type { Answers } from "@zebraish/lib/catalogue/types";
import { getVisibleSteps } from "./engine";

/** Every answered step, in words ("How big is it? Multi-page website"). Spanish
 * is for on-screen and client-sent text only; stored briefs stay English. */
export function describeSelections(projectType: string, answers: Answers, lang: "en" | "es" = "en"): string[] {
  const es = lang === "es";
  const out: string[] = [];
  for (const s of getVisibleSteps(projectType, answers)) {
    const v = answers[s.id];
    if (v === undefined || v === "" || (Array.isArray(v) && !v.length)) continue;
    if (s.type === "number") { if (Number(v) > 0) out.push(`${(es && s.questionEs) || s.question} ${v}`); continue; }
    if (s.type === "text") { out.push(`${es ? "Notas" : "Notes"}: ${String(v).trim()}`); continue; }
    const ids = Array.isArray(v) ? v : [String(v)];
    const labels = ids.map((id) => {
      const o = s.options?.find((x) => x.id === id);
      return (es && o?.labelEs) || o?.label || id;
    });
    out.push(`${(es && s.questionEs) || s.question} ${labels.join(", ")}`);
  }
  return out;
}
