import type { Answers } from "@zebraish/lib/catalogue/types";
import { getVisibleSteps } from "./engine";

/** Every answered step, in words ("How big is it? Multi-page website"). */
export function describeSelections(projectType: string, answers: Answers): string[] {
  const out: string[] = [];
  for (const s of getVisibleSteps(projectType, answers)) {
    const v = answers[s.id];
    if (v === undefined || v === "" || (Array.isArray(v) && !v.length)) continue;
    if (s.type === "number") { if (Number(v) > 0) out.push(`${s.question} ${v}`); continue; }
    if (s.type === "text") { out.push(`Notes: ${String(v).trim()}`); continue; }
    const ids = Array.isArray(v) ? v : [String(v)];
    const labels = ids.map((id) => s.options?.find((o) => o.id === id)?.label ?? id);
    out.push(`${s.question} ${labels.join(", ")}`);
  }
  return out;
}
