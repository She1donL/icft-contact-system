import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ requireApprovedAdmin: vi.fn() }));
const prospectData = vi.hoisted(() => ({ getProspects: vi.fn() }));

vi.mock("@/lib/auth/admin", () => auth);
vi.mock("@/lib/prospects/admin-data", () => prospectData);

import ProspectsPage from "@/app/admin/prospects/page";

const emptyResult = {
  prospects: [],
  total: 0,
  error: null,
  filters: {
    query: "",
    priority: "",
    status: "",
    country: "",
    emailVerified: "",
    discoveryBatch: "",
    page: 1,
  },
};

async function renderPage(searchParams: Record<string, string> = {}) {
  const page = await ProspectsPage({ searchParams: Promise.resolve(searchParams) });
  return renderToStaticMarkup(page);
}

describe("Research Prospect list feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.requireApprovedAdmin.mockResolvedValue({ id: "admin-id" });
    prospectData.getProspects.mockResolvedValue(emptyResult);
  });

  it("announces a completed deletion on the destination page", async () => {
    const markup = await renderPage({ deleted: "1" });

    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain("Research Prospect deleted successfully.");
  });

  it("announces the number of prospects imported", async () => {
    const markup = await renderPage({ imported: "12" });

    expect(markup).toContain("12 Research Prospects imported successfully.");
  });

  it("does not show a success notice without a completed action", async () => {
    const markup = await renderPage();

    expect(markup).not.toContain('role="status"');
    expect(markup).not.toContain("successfully");
  });

  it("offers a clear action only when filters are active", async () => {
    prospectData.getProspects.mockResolvedValueOnce({
      ...emptyResult,
      filters: { ...emptyResult.filters, query: "forest" },
    });

    const filteredMarkup = await renderPage({ q: "forest" });
    const unfilteredMarkup = await renderPage();

    expect(filteredMarkup).toContain('href="/admin/prospects"');
    expect(filteredMarkup).toContain("Clear filters");
    expect(unfilteredMarkup).not.toContain("Clear filters");
  });
});
