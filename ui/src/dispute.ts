import type { CheckResult } from "./types";

export const ISSUES_URL = "https://github.com/ardalan-jalal/dagwick/issues/new";

/**
 * Link to open a dispute about a built-in check on GitHub.
 *
 * Only the check id goes into the link: never the DAG id, file or code, which
 * may be private to the user's company.
 */
export function disputeUrl(checkId: string): string {
  const params = new URLSearchParams({ template: "dispute.yml", title: `[Dispute] Rule: ${checkId}`, rule: checkId });
  return `${ISSUES_URL}?${params}`;
}

/** Dagwick's own checks can be disputed with Dagwick; a check pack's cannot. */
export function canDispute(check: Pick<CheckResult, "pack" | "status">): boolean {
  return (!check.pack || check.pack === "dagwick") && (check.status === "fail" || check.status === "warn");
}
