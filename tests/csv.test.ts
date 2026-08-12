import { describe, expect, it } from "vitest";
import { contactsToCsv } from "@/lib/contacts/csv";
import { isAllowedDuplicateReviewAction, parseAdminListParams } from "@/lib/contacts/admin";

describe("contact CSV export", () => {
  it("escapes quotes, commas, and line breaks", () => { const csv = contactsToCsv([{ record_id: "ICFT-C-000001", first_name: "Ada, \"A\"\nLovelace", status: "new" }]); expect(csv).toContain('"Ada, ""A"" Lovelace"'); });
  it("prevents spreadsheet formula interpretation", () => { const csv = contactsToCsv([{ record_id: "=SUM(1,1)", first_name: "+formula", status: "new" }]); expect(csv).toContain('"\'=SUM(1,1)"'); expect(csv).toContain('"\'+formula"'); });
  it("preserves duplicate filter state and allows only review actions", () => { expect(parseAdminListParams({ duplicate: "possible_duplicate" }).duplicate).toBe("possible_duplicate"); expect(isAllowedDuplicateReviewAction("reviewed")).toBe(true); expect(isAllowedDuplicateReviewAction("keep_separate")).toBe(true); expect(isAllowedDuplicateReviewAction("merged")).toBe(false); });
});
