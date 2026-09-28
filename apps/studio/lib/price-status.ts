import type { ResumedProject } from "@/lib/actions/configurator";

/** Builder briefs are saved with an initial estimate; they can't be paid until the final price is confirmed. */
export function awaitingPriceConfirmation(project: Pick<ResumedProject, "configuration" | "price_confirmed_at">): boolean {
  return project.configuration?.price_status === "initial_estimate" && !project.price_confirmed_at;
}
