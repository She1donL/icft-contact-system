import { beforeEach, describe, expect, it, vi } from "vitest";

type DatabaseRow = Record<string, unknown>;
type QueryResult = { data: DatabaseRow[]; error: null };

const database = vi.hoisted(() => ({ rows: [] as DatabaseRow[], ranges: [] as [number, number][], orders: [] as [string, boolean][] }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: () => {
      const equals: [string, string | boolean][] = [];
      let search = "";
      let from = 0;
      let to = 999;
      const query: {
        select: () => typeof query;
        order: (column: string, options: { ascending: boolean }) => typeof query;
        range: (start: number, end: number) => typeof query;
        eq: (column: string, value: string | boolean) => typeof query;
        or: (filters: string) => typeof query;
        then<TResult1 = QueryResult, TResult2 = never>(onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): PromiseLike<TResult1 | TResult2>;
      } = {
        select: () => query,
        order: (column, options) => { database.orders.push([column, options.ascending]); return query; },
        range: (start, end) => { from = start; to = end; database.ranges.push([start, end]); return query; },
        eq: (column, value) => { equals.push([column, value]); return query; },
        or: (filters) => { search = filters.match(/ilike\.%([^%]+)%/u)?.[1] ?? ""; return query; },
        then: (onfulfilled, onrejected) => {
          const filtered = database.rows.filter(row => equals.every(([column, value]) => row[column] === value)).filter(row => !search || ["first_name", "last_name", "preferred_name", "organization", "public_email"].some(column => String(row[column] ?? "").toLowerCase().includes(search.toLowerCase())));
          return Promise.resolve({ data: filtered.slice(from, to + 1), error: null }).then(onfulfilled, onrejected);
        },
      };
      return query;
    },
  })),
}));

import { getProspectsForExport } from "@/lib/prospects/admin-data";

function prospect(index: number, overrides: DatabaseRow = {}): DatabaseRow {
  return {
    first_name: "Forest", last_name: `Prospect ${index}`, preferred_name: null, organization: "ICFT", position_title: "Researcher", country_region: "CA", public_email: null, priority: "P1", review_status: "verified", identity_verified: true, affiliation_verified: true, relevance_verified: true, email_verified: false, discovery_batch: "batch-7", last_verified_at: null, created_at: "2026-08-01T00:00:00.000Z", updated_at: "2026-08-01T00:00:00.000Z", research_prospect_tag_assignments: [{ research_tags: [{ name: "forest health" }] }], research_prospect_flags: [{ flag: "email_missing" }], research_prospect_sources: [{ source_url: `https://example.com/${index}`, source_type: "official_profile", source_title: "Profile" }], ...overrides,
  };
}

describe("Research Prospect export data retrieval", () => {
  beforeEach(() => { database.rows = []; database.ranges = []; database.orders = []; });

  it("applies every active filter and exports all matches beyond the first database page", async () => {
    database.rows = [...Array.from({ length: 1001 }, (_, index) => prospect(index)), prospect(1002, { first_name: "Ocean", priority: "P2", review_status: "pending", country_region: "US", discovery_batch: "other" })];

    const result = await getProspectsForExport({ q: "forest", priority: "P1", status: "verified", country: "CA", emailVerified: "no", discoveryBatch: "batch-7", page: "9" });

    expect(result.error).toBe(false);
    expect(result.rows).toHaveLength(1001);
    expect(result.rows.at(-1)?.last_name).toBe("Prospect 1000");
    expect(result.rows[0].tags).toEqual(["forest health"]);
    expect(result.rows[0].flags).toEqual(["email_missing"]);
    expect(result.rows[0].sources[0].source_url).toBe("https://example.com/0");
    expect(database.ranges).toEqual([[0, 999], [1000, 1999]]);
    expect(database.orders).toEqual([["created_at", false], ["id", false], ["created_at", false], ["id", false]]);
  });
});
