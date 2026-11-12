import { describe, expect, it } from "vitest";
import { canDispute, disputeUrl } from "./dispute";

describe("disputeUrl", () => {
  it("pre-fills the template, title and rule with the check id only", () => {
    const url = new URL(disputeUrl("catchup"));
    expect(url.origin + url.pathname).toBe("https://github.com/dagwick/dagwick/issues/new");
    expect(url.searchParams.get("template")).toBe("dispute.yml");
    expect(url.searchParams.get("title")).toBe("[Dispute] Rule: catchup");
    expect(url.searchParams.get("rule")).toBe("catchup");
    const keys: string[] = [];
    url.searchParams.forEach((_, key) => keys.push(key));
    expect(keys.sort()).toEqual(["rule", "template", "title"]);
  });
});

describe("canDispute", () => {
  it("offers a dispute only for failing or warning built-in checks", () => {
    expect(canDispute({ pack: "dagwick", status: "fail" })).toBe(true);
    expect(canDispute({ pack: "dagwick", status: "warn" })).toBe(true);
    expect(canDispute({ pack: "dagwick", status: "pass" })).toBe(false);
    expect(canDispute({ pack: "dagwick", status: "ack" })).toBe(false);
    expect(canDispute({ pack: "acme-checks", status: "fail" })).toBe(false);
  });
});
