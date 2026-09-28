import type { Answers, QuoteResult } from "@zebraish/lib/catalogue/types";

// Complexity grade shown to the client and sent to us with every brief, so both
// sides read the same scale before the final price is confirmed by hand.
export type Grade = {
  level: 1 | 2 | 3 | 4 | 5;
  code: string;
  name: string;
  blurb: string;
  color: string;
};

const GRADES: Omit<Grade, "level">[] = [
  { code: "Z1", name: "Spark", blurb: "Small, focused build. Fast turnaround.", color: "#17c98d" },
  { code: "Z2", name: "Build", blurb: "A complete product with a few moving parts.", color: "#3d7ef0" },
  { code: "Z3", name: "Engine", blurb: "Custom logic, integrations or a bigger surface.", color: "#8b5cf6" },
  { code: "Z4", name: "System", blurb: "Multiple systems working together. Planned in phases.", color: "#e8a93c" },
  { code: "Z5", name: "Flagship", blurb: "Large, high-stakes build. Scoped with you on a call.", color: "#e0295f" },
];

const PRICE_BANDS = [150, 400, 900, 2000];

export function gradeProject(quote: QuoteResult, answers: Answers): Grade {
  let level = 1 + PRICE_BANDS.filter((band) => quote.total > band).length;

  // Picking "Advanced"/"Complex" or leaving custom notes signals scope the
  // catalogue can't fully price, so it nudges the grade up a step.
  const complexity = answers.complexity;
  if (complexity === "complex") level += 1;
  if (quote.requiresCustomQuote) level += 1;

  const clamped = Math.max(1, Math.min(5, level)) as Grade["level"];
  return { level: clamped, ...GRADES[clamped - 1] };
}
