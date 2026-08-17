import type { Answers, CatalogueStep, PricedLine, QuoteResult } from "./types";
import { PROJECT_TYPES, FLOWS, FLAT_BASE_PRICES } from "./catalogue";

export function getProjectType(projectTypeId: string) {
  return PROJECT_TYPES.find((p) => p.id === projectTypeId) ?? null;
}

export function getFlow(projectTypeId: string) {
  const type = getProjectType(projectTypeId);
  if (!type) return null;
  return FLOWS[type.flow] ?? null;
}

/** Steps relevant right now, given prior answers — this is the "decision tree" behavior. */
export function getVisibleSteps(projectTypeId: string, answers: Answers): CatalogueStep[] {
  const flow = getFlow(projectTypeId);
  if (!flow) return [];
  return flow.steps.filter((step) => !step.showIf || step.showIf(answers));
}

function priceLinesForStep(step: CatalogueStep, answers: Answers): PricedLine[] {
  const role = step.role ?? "addon";
  if (role === "multiplier" || role === "note") return [];

  const value = answers[step.id];
  if (value === undefined || value === null) return [];

  if (step.type === "number") {
    const qty = Number(value) || 0;
    if (qty <= 0 || !step.pricePerUnit) return [];
    return [
      {
        stepId: step.id,
        optionId: step.id,
        label: `${step.question} (${qty})`,
        price: qty * step.pricePerUnit,
        quantity: qty,
      },
    ];
  }

  const selectedIds = Array.isArray(value) ? value : [value as string];
  const lines: PricedLine[] = [];
  for (const optionId of selectedIds) {
    const option = step.options?.find((o) => o.id === optionId);
    if (!option || option.included) continue;
    if (option.price) {
      lines.push({ stepId: step.id, optionId: option.id, label: option.label, price: option.price });
    }
  }
  return lines;
}

function multiplierForStep(step: CatalogueStep, answers: Answers): number {
  if ((step.role ?? "addon") !== "multiplier") return 1;
  const value = answers[step.id];
  const option = step.options?.find((o) => o.id === value);
  return option?.multiplier ?? 1;
}

export function calculateProject(projectTypeId: string, answers: Answers): QuoteResult {
  const projectType = getProjectType(projectTypeId);
  const visibleSteps = getVisibleSteps(projectTypeId, answers);

  const lines: PricedLine[] = [];

  if (projectType && FLAT_BASE_PRICES[projectType.id] !== undefined) {
    lines.push({
      stepId: "base",
      optionId: projectType.id,
      label: `Base: ${projectType.label}`,
      price: FLAT_BASE_PRICES[projectType.id],
    });
  }

  let complexityMultiplier = 1;
  let deliveryMultiplier = 1;
  let requiresCustomQuote = false;

  for (const step of visibleSteps) {
    lines.push(...priceLinesForStep(step, answers));
    if (step.id === "complexity") complexityMultiplier = multiplierForStep(step, answers);
    if (step.id === "delivery") deliveryMultiplier = multiplierForStep(step, answers);
    if (step.role === "note" && typeof answers[step.id] === "string" && (answers[step.id] as string).trim()) {
      requiresCustomQuote = true;
    }
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price, 0);
  const total = Math.round(subtotal * complexityMultiplier * deliveryMultiplier * 100) / 100;

  return { lines, subtotal, complexityMultiplier, deliveryMultiplier, total, requiresCustomQuote };
}

/** How far through the flow the client is, for a progress bar. */
export function stepIndex(projectTypeId: string, answers: Answers, currentStepId: string): { index: number; total: number } {
  const steps = getVisibleSteps(projectTypeId, answers);
  const index = steps.findIndex((s) => s.id === currentStepId);
  return { index: index === -1 ? 0 : index, total: steps.length };
}
