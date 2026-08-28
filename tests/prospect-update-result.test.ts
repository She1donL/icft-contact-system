import { describe, expect, it } from "vitest";
import { isConfirmedProspectUpdate } from "@/lib/prospects/update-result";

describe("Research Prospect update confirmation", () => {
  const id = "11111111-1111-4111-8111-111111111111";

  it("confirms only a matching returned prospect ID", () => {
    expect(isConfirmedProspectUpdate(id, { data: { id }, error: null })).toBe(true);
  });

  it("rejects a zero-row update even without a database error", () => {
    expect(isConfirmedProspectUpdate(id, { data: null, error: null })).toBe(false);
  });

  it("rejects an update error", () => {
    expect(isConfirmedProspectUpdate(id, { data: null, error: { message: "update failed" } })).toBe(false);
  });

  it("rejects an unexpected returned prospect ID", () => {
    expect(isConfirmedProspectUpdate(id, { data: { id: "22222222-2222-4222-8222-222222222222" }, error: null })).toBe(false);
  });
});
