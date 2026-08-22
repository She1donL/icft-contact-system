import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ getCurrentAdminAccess: vi.fn() }));
const data = vi.hoisted(() => ({ getAdminContactsForExport: vi.fn() }));
vi.mock("@/lib/auth/admin", () => auth);
vi.mock("@/lib/contacts/admin-data", () => data);

import { GET } from "@/app/admin/contacts/export/route";

describe("Contacts CSV export route", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("blocks unauthenticated and unapproved users before loading Contacts", async () => {
    auth.getCurrentAdminAccess.mockResolvedValue({ user: null, isApproved: false });
    const unauthenticated = await GET(new Request("https://example.test/admin/contacts/export"));
    auth.getCurrentAdminAccess.mockResolvedValue({ user: { id: "user" }, isApproved: false });
    const unapproved = await GET(new Request("https://example.test/admin/contacts/export"));

    expect(unauthenticated.status).toBe(403);
    expect(unapproved.status).toBe(403);
    expect(data.getAdminContactsForExport).not.toHaveBeenCalled();
  });

  it("returns a filtered CSV download for an approved administrator", async () => {
    auth.getCurrentAdminAccess.mockResolvedValue({ user: { id: "admin" }, isApproved: true });
    data.getAdminContactsForExport.mockResolvedValue({ rows: [{ record_id: "ICFT-C-000001", first_name: "Ada", last_name: "Lovelace", preferred_name: null, email: "ada@example.com", roles: ["Researcher"], other_role: null, organization: "ICFT", professional_title: "Researcher", country_region: "CA", general_field: "Forestry", specific_research_area: "Forest health", conference_updates_consent: false, consent_timestamp: "2026-08-01T00:00:00.000Z", status: "new", duplicate_status: "no_duplicate_detected", submission_source: "qr_code", admin_notes: null, created_at: "2026-08-01T00:00:00.000Z", updated_at: "2026-08-01T00:00:00.000Z", archived_at: null }], error: false });
    const response = await GET(new Request("https://example.test/admin/contacts/export?q=ada&status=new&country=CA&role=Researcher&archived=all&page=4"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-disposition")).toMatch(/^attachment; filename=ICFT_Contacts_\d{4}-\d{2}-\d{2}\.csv$/u);
    expect(data.getAdminContactsForExport).toHaveBeenCalledWith({ q: "ada", status: "new", country: "CA", role: "Researcher", archived: "all", page: "4" });
    expect(await response.text()).toContain('"Ada"');
  });
});
