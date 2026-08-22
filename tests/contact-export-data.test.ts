import { beforeEach, describe, expect, it, vi } from "vitest";

type DatabaseRow = Record<string, unknown>;
type QueryResult = { data: DatabaseRow[]; count: number; error: null };
const database = vi.hoisted(() => ({ rows: [] as DatabaseRow[], ranges: [] as [number, number][], orders: [] as [string, boolean][], selectedTables: [] as string[] }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => {
      database.selectedTables.push(table);
      const equals: [string, string | boolean][] = [];
      const contains: [string, string[]][] = [];
      let archived: "active" | "archived" | "all" = "all";
      let search = "";
      let from = 0;
      let to = 999;
      const orderClauses: [string, boolean][] = [];
      const query: {
        select: () => typeof query;
        order: (column: string, options: { ascending: boolean }) => typeof query;
        range: (start: number, end: number) => typeof query;
        eq: (column: string, value: string | boolean) => typeof query;
        is: (column: string, value: null) => typeof query;
        not: (column: string, operator: string, value: null) => typeof query;
        contains: (column: string, values: string[]) => typeof query;
        or: (filters: string) => typeof query;
        then<TResult1 = QueryResult, TResult2 = never>(onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): PromiseLike<TResult1 | TResult2>;
      } = {
        select: () => query,
        order: (column, options) => { database.orders.push([column, options.ascending]); orderClauses.push([column, options.ascending]); return query; },
        range: (start, end) => { from = start; to = end; database.ranges.push([start, end]); return query; },
        eq: (column, value) => { equals.push([column, value]); return query; },
        is: () => { archived = "active"; return query; },
        not: () => { archived = "archived"; return query; },
        contains: (column, values) => { contains.push([column, values]); return query; },
        or: (filters) => { search = filters.match(/ilike\.%([^%]+)%/u)?.[1] ?? ""; return query; },
        then: (onfulfilled, onrejected) => {
          const filtered = database.rows.filter(row => archived === "all" || (archived === "active" ? row.archived_at === null : row.archived_at !== null)).filter(row => equals.every(([column, value]) => row[column] === value)).filter(row => contains.every(([column, values]) => values.every(value => Array.isArray(row[column]) && row[column].includes(value)))).filter(row => !search || ["record_id", "first_name", "last_name", "preferred_name", "email", "organization", "professional_title"].some(column => String(row[column] ?? "").toLowerCase().includes(search.toLowerCase())));
          const ordered = [...filtered].sort((left, right) => { for (const [column, ascending] of orderClauses) { const comparison = String(left[column] ?? "").localeCompare(String(right[column] ?? "")); if (comparison) return ascending ? comparison : -comparison; } return 0; });
          return Promise.resolve({ data: ordered.slice(from, to + 1), count: ordered.length, error: null }).then(onfulfilled, onrejected);
        },
      };
      return query;
    },
  })),
}));

import { getAdminContacts, getAdminContactsForExport } from "@/lib/contacts/admin-data";

function contact(index: number, overrides: DatabaseRow = {}): DatabaseRow {
  return { id: `00000000-0000-0000-0000-${String(index).padStart(12, "0")}`, record_id: `ICFT-C-${String(index).padStart(6, "0")}`, first_name: "Forest", last_name: `Contact ${index}`, preferred_name: null, email: `forest${index}@example.com`, roles: ["Researcher", "Other"], other_role: "Community liaison", organization: "ICFT", professional_title: "Researcher", country_region: "CA", general_field: "Forestry", specific_research_area: "Forest health", conference_updates_consent: false, consent_timestamp: "2026-08-01T00:00:00.000Z", status: "new", duplicate_status: "no_duplicate_detected", submission_source: "qr_code", admin_notes: null, created_at: "2026-08-01T00:00:00.000Z", updated_at: "2026-08-01T00:00:00.000Z", archived_at: null, ...overrides };
}

describe("Contacts export data retrieval", () => {
  beforeEach(() => { database.rows = []; database.ranges = []; database.orders = []; database.selectedTables = []; });

  it("shares every active Contact filter between the list and export", async () => {
    database.rows = [contact(1), contact(2, { status: "reviewed" }), contact(3, { duplicate_status: "possible_duplicate" }), contact(4, { country_region: "US" }), contact(5, { roles: ["Speaker"] }), contact(6, { archived_at: "2026-08-02T00:00:00.000Z" }), contact(7, { first_name: "Ocean", email: "ocean@example.com" })];
    const params = { q: "forest", status: "new", duplicate: "no_duplicate_detected", country: "CA", role: "Researcher", archived: "active" };

    const list = await getAdminContacts(params);
    const exported = await getAdminContactsForExport({ ...params, page: "8" });

    expect(list.contacts.map(row => row.record_id)).toEqual(["ICFT-C-000001"]);
    expect(exported.rows.map(row => row.record_id)).toEqual(["ICFT-C-000001"]);
    expect(database.selectedTables).toEqual(["contacts", "contacts"]);
  });

  it("exports all matches beyond 1,000 rows with deterministic ordering and ignores UI pagination", async () => {
    database.rows = Array.from({ length: 1001 }, (_, index) => contact(index));

    const result = await getAdminContactsForExport({ archived: "all", page: "9" });

    expect(result.error).toBe(false);
    expect(result.rows).toHaveLength(1001);
    expect(result.rows[0].record_id).toBe("ICFT-C-001000");
    expect(result.rows.at(-1)?.record_id).toBe("ICFT-C-000000");
    expect(database.ranges).toEqual([[0, 999], [1000, 1999]]);
    expect(database.orders).toEqual([["created_at", false], ["id", false], ["created_at", false], ["id", false]]);
    expect(database.selectedTables).toEqual(["contacts", "contacts"]);
  });
});
