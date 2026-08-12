import { describe, expect, it } from "vitest";
import { parseAdminListParams, validateAdminContactUpdate } from "@/lib/contacts/admin";

function form() { const data = new FormData(); data.set("firstName", " Élodie "); data.set("lastName", " Durand "); data.set("email", "ELODIE@EXAMPLE.TEST"); data.append("roles", "Researcher"); data.set("countryRegion", "CA"); data.set("status", "new"); data.set("conferenceUpdatesConsent", "yes"); return data; }
describe("admin contact validation", () => {
  it("normalizes a valid admin update without system fields", () => expect(validateAdminContactUpdate(form())).toMatchObject({ success: true, data: { first_name: "Élodie", email: "elodie@example.test", status: "new" } }));
  it("rejects invalid roles and statuses", () => { const invalidRole = form(); invalidRole.set("roles", "Administrator"); expect(validateAdminContactUpdate(invalidRole)).toMatchObject({ success: false, errors: { roles: expect.any(String) } }); const invalidStatus = form(); invalidStatus.set("status", "archived"); expect(validateAdminContactUpdate(invalidStatus)).toMatchObject({ success: false, errors: { status: expect.any(String) } }); });
  it("keeps active/default filters and paginates safely", () => { expect(parseAdminListParams({ q: "Ada", page: "2", status: "new", role: "Researcher" })).toMatchObject({ query: "Ada", page: 2, archived: "active", status: "new", role: "Researcher" }); expect(parseAdminListParams({ archived: "bad", page: "-1" })).toMatchObject({ page: 1, archived: "active" }); });
});
