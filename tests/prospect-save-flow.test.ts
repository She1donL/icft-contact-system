import { describe, expect, it } from "vitest";
import { prospectSaveFailurePath, prospectSaveSuccessPath, prospectSubmitState, safeProspectReturnTo } from "@/lib/prospects/save-flow";

describe("Research Prospect save flow", () => {
  it("keeps the filtered list destination for a successful create", () => {
    expect(prospectSaveSuccessPath("new-prospect-id", "/admin/prospects?country=CA&priority=P2")).toBe("/admin/prospects/new-prospect-id?saved=prospect&returnTo=%2Fadmin%2Fprospects%3Fcountry%3DCA%26priority%3DP2");
  });

  it("keeps the list destination for a successful update", () => {
    expect(prospectSaveSuccessPath("existing-prospect-id", "/admin/prospects?q=forest")).toBe("/admin/prospects/existing-prospect-id?saved=prospect&returnTo=%2Fadmin%2Fprospects%3Fq%3Dforest");
  });

  it("falls back to the Prospect list when returnTo is missing or invalid", () => {
    expect(safeProspectReturnTo(null)).toBe("/admin/prospects");
    expect(safeProspectReturnTo("/contact")).toBe("/admin/prospects");
    expect(prospectSaveFailurePath("new", "https://example.com")).toBe("/admin/prospects/new?error=save&returnTo=%2Fadmin%2Fprospects");
  });

  it("rejects external and protocol-relative return destinations", () => {
    expect(safeProspectReturnTo("https://evil.example/admin/prospects")).toBe("/admin/prospects");
    expect(safeProspectReturnTo("//evil.example")).toBe("/admin/prospects");
    expect(safeProspectReturnTo("/adminish/prospects")).toBe("/admin/prospects");
  });

  it("keeps a failed update on its current form without a success state", () => {
    expect(prospectSaveFailurePath("existing-prospect-id", "/admin/prospects?q=forest")).toBe("/admin/prospects/existing-prospect-id?error=save&returnTo=%2Fadmin%2Fprospects%3Fq%3Dforest");
  });

  it("disables the submit control while a save is pending", () => {
    expect(prospectSubmitState("Save prospect", false)).toEqual({ disabled: false, label: "Save prospect" });
    expect(prospectSubmitState("Save prospect", true)).toEqual({ disabled: true, label: "Saving…" });
  });

  it("uses action-specific progress text for other prospect operations", () => {
    expect(prospectSubmitState("Apply filters", true, "Applying…")).toEqual({
      disabled: true,
      label: "Applying…",
    });
  });
});
