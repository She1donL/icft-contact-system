import { describe, expect, it, vi } from "vitest";
import { prospectsToCsv, filterProspectExportRows } from "@/lib/prospects/export";

const auth = vi.hoisted(() => ({ getCurrentAdminAccess: vi.fn() }));
const data = vi.hoisted(() => ({ getProspectsForExport: vi.fn() }));
vi.mock("@/lib/auth/admin", () => auth);
vi.mock("@/lib/prospects/admin-data", () => data);

describe("Research Prospect CSV export", () => {
  it("exports all requested fields including tags, flags, and sources", () => {
    const csv = prospectsToCsv([{
      first_name: "Ada", last_name: "Lovelace", preferred_name: "Ada", organization: "Analytical Engines", position_title: "Mathematician", country_region: "GB", public_email: "ada@example.com", priority: "P1", review_status: "reviewed", identity_verified: true, affiliation_verified: true, relevance_verified: true, email_verified: true, discovery_batch: "pilot", last_verified_at: "2026-08-20T00:00:00.000Z", created_at: "2026-08-01T00:00:00.000Z", updated_at: "2026-08-21T00:00:00.000Z", tags: ["forest health", "speaker"], flags: ["needs_review"], sources: [{ source_url: "https://example.com/profile", source_type: "profile", source_title: "Public profile" }],
    }]);

    expect(csv).toContain("First Name,Last Name,Preferred Name");
    expect(csv).toContain("forest health; speaker");
    expect(csv).toContain("needs_review");
    expect(csv).toContain("profile: Public profile (https://example.com/profile)");
  });

  it("uses a BOM, preserves Unicode, escapes CSV delimiters, and neutralizes formulas", () => {
    const csv = prospectsToCsv([{
      first_name: '=SUM(1,1)', last_name: '王, "博士"\n研究者', preferred_name: null, organization: null, position_title: null, country_region: "CN", public_email: "name@example.com", priority: "P2", review_status: "new", identity_verified: false, affiliation_verified: false, relevance_verified: false, email_verified: false, discovery_batch: null, last_verified_at: null, created_at: "2026-08-01T00:00:00.000Z", updated_at: "2026-08-01T00:00:00.000Z", tags: [], flags: [], sources: [],
    }]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("\"'=SUM(1,1)\"");
    expect(csv).toContain('"王, ""博士"" 研究者"');
    expect(csv).toContain("name@example.com");
  });

  it("neutralizes every formula prefix after spreadsheet whitespace without altering URLs or emails", () => {
    const csv = prospectsToCsv([{
      first_name: " \t=HYPERLINK(\"https://evil.test\")", last_name: "+cmd", preferred_name: "-cmd", organization: "@cmd", position_title: null, country_region: null, public_email: "name@example.com", priority: "P1", review_status: "pending", identity_verified: false, affiliation_verified: false, relevance_verified: false, email_verified: false, discovery_batch: null, last_verified_at: null, created_at: "2026-08-01T00:00:00.000Z", updated_at: "2026-08-01T00:00:00.000Z", tags: [], flags: [], sources: [{ source_url: "https://example.com/profile", source_type: null, source_title: null }],
    }]);

    expect(csv).toContain('"\' \t=HYPERLINK(""https://evil.test"")"');
    expect(csv).toContain('"\'+cmd"');
    expect(csv).toContain('"\'-cmd"');
    expect(csv).toContain('"\'@cmd"');
    expect(csv).toContain('"name@example.com"');
    expect(csv).toContain("(https://example.com/profile)");
  });

  it("keeps active priority, review status, country, batch, and search filters while ignoring pagination", () => {
    expect(filterProspectExportRows({ q: "forest", priority: "P1", status: "verified", country: "CA", discoveryBatch: "batch-7", page: "3" })).toEqual({ query: "forest", priority: "P1", status: "verified", country: "CA", emailVerified: "", discoveryBatch: "batch-7", page: 1 });
  });

  it("accepts the search query parameter as an alias for q", () => {
    expect(filterProspectExportRows({ search: "森林" }).query).toBe("森林");
  });

  it("blocks an export request from an unapproved user", async () => {
    auth.getCurrentAdminAccess.mockResolvedValue({ user: { id: "user" }, isApproved: false });
    const { GET } = await import("@/app/admin/prospects/export/route");
    const response = await GET(new Request("https://example.test/admin/prospects/export"));

    expect(response.status).toBe(403);
    expect(data.getProspectsForExport).not.toHaveBeenCalled();
  });

  it("returns every filtered prospect for an approved administrator", async () => {
    auth.getCurrentAdminAccess.mockResolvedValue({ user: { id: "admin" }, isApproved: true });
    data.getProspectsForExport.mockResolvedValue({ rows: [{ first_name: "One", last_name: "Prospect", preferred_name: null, organization: null, position_title: null, country_region: "CA", public_email: null, priority: "P1", review_status: "reviewed", identity_verified: false, affiliation_verified: false, relevance_verified: false, email_verified: false, discovery_batch: "batch-7", last_verified_at: null, created_at: "2026-08-01T00:00:00.000Z", updated_at: "2026-08-01T00:00:00.000Z", tags: [], flags: [], sources: [] }, { first_name: "Two", last_name: "Prospect", preferred_name: null, organization: null, position_title: null, country_region: "CA", public_email: null, priority: "P1", review_status: "reviewed", identity_verified: false, affiliation_verified: false, relevance_verified: false, email_verified: false, discovery_batch: "batch-7", last_verified_at: null, created_at: "2026-08-01T00:00:00.000Z", updated_at: "2026-08-01T00:00:00.000Z", tags: [], flags: [], sources: [] }], error: false });
    const { GET } = await import("@/app/admin/prospects/export/route");
    const response = await GET(new Request("https://example.test/admin/prospects/export?priority=P1&status=reviewed&country=CA&discoveryBatch=batch-7&page=2"));

    expect(response.status).toBe(200);
    expect(data.getProspectsForExport).toHaveBeenCalledWith({ priority: "P1", status: "reviewed", country: "CA", discoveryBatch: "batch-7", page: "2" });
    expect((await response.text()).match(/Prospect/g)).toHaveLength(2);
  });
});
