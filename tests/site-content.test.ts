import { describe, expect, it } from "vitest";
import { siteContentDefaults } from "@/messages/en";
import { mergeSiteContent, siteContentLimits, validateSiteContent } from "@/lib/site-content";

function form(overrides: Record<string, string> = {}) {
  const values = { ...siteContentDefaults, ...overrides };
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("site content validation", () => {
  it("trims accepted plain-text values", () => {
    const result = validateSiteContent(form({ home_title: "  Welcome to ICFT  " }));
    expect(result).toEqual(expect.objectContaining({ success: true }));
    if (result.success) expect(result.data.home_title).toBe("Welcome to ICFT");
  });

  it("rejects missing and oversized required fields", () => {
    expect(validateSiteContent(form({ home_title: " " })).success).toBe(false);
    expect(validateSiteContent(form({ home_title: "x".repeat(siteContentLimits.home_title + 1) })).success).toBe(false);
  });

  it("rejects HTML and script-like content", () => {
    expect(validateSiteContent(form({ contact_intro: "<strong>Do not render HTML</strong>" })).success).toBe(false);
    expect(validateSiteContent(form({ contact_intro: "<script>alert(1)</script>" })).success).toBe(false);
  });

  it("uses hard-coded defaults when settings are missing or incomplete", () => {
    expect(mergeSiteContent(null)).toEqual(siteContentDefaults);
    expect(mergeSiteContent({ home_title: "Updated title", contact_intro: "" })).toEqual({ ...siteContentDefaults, home_title: "Updated title" });
  });
});
