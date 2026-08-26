export type Answers = Record<string, string | string[] | number | boolean | undefined>;

export interface CatalogueOption {
  id: string;
  label: string;
  /** Spanish label for on-screen display only — never used for stored price-line
   * labels (those stay English so admin's price breakdowns are always English). */
  labelEs?: string;
  /** Flat EUR add-on price. Omit (or 0) for included/free options. */
  price?: number;
  /** For "multiplier" steps (complexity, delivery speed) instead of a flat price. */
  multiplier?: number;
  unit?: "flat" | "per_page" | "per_item" | "per_hour" | "per_article" | "per_integration" | "per_month";
  description?: string;
  included?: boolean;
  /** Other option ids (from any step) that must be selected for this one to show. */
  requires?: string[];
}

export type StepType = "single" | "multi" | "number" | "text";
export type StepRole = "base" | "addon" | "multiplier" | "note";

export interface CatalogueStep {
  id: string;
  question: string;
  questionEs?: string;
  helper?: string;
  helperEs?: string;
  type: StepType;
  role?: StepRole; // defaults to "addon"
  options?: CatalogueOption[];
  min?: number;
  max?: number;
  pricePerUnit?: number;
  includedUnits?: number;
  optional?: boolean;
  showIf?: (answers: Answers) => boolean;
}

export interface Flow {
  id: string;
  steps: CatalogueStep[];
}

export interface ProjectTypeDef {
  id: string;
  label: string;
  labelEs?: string;
  helper: string;
  helperEs?: string;
  flow: string;
}

export interface PricedLine {
  stepId: string;
  optionId: string;
  label: string;
  price: number;
  quantity?: number;
}

export interface QuoteResult {
  lines: PricedLine[];
  subtotal: number;
  complexityMultiplier: number;
  deliveryMultiplier: number;
  total: number;
  requiresCustomQuote: boolean;
}
