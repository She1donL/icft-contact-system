import { describe, expect, it } from "vitest";
import { validateProspect } from "@/lib/prospects/admin";
import { parseProspectCsv } from "@/lib/prospects/csv";
function form() { const data = new FormData(); data.set("firstName", " Ada "); data.set("lastName", " Lovelace "); data.set("publicEmail", "ADA@EXAMPLE.TEST"); data.set("countryRegion", "CA"); data.set("priority", "P1"); data.set("reviewStatus", "pending"); return data; }
describe("Research Prospect validation", () => {
  it("normalizes a valid prospect without any consent field", () => expect(validateProspect(form())).toMatchObject({ success: true, data: { first_name: "Ada", public_email: "ada@example.test", priority: "P1", review_status: "pending", email_verified: false } }));
  it("rejects an invalid priority or email", () => { const data = form(); data.set("priority", "urgent"); expect(validateProspect(data)).toEqual({ success: false }); data.set("priority", "P2"); data.set("publicEmail", "not-email"); expect(validateProspect(data)).toEqual({ success: false }); });
  it("validates all CSV rows before preparing import data", () => { const csv = "first_name,last_name,preferred_name,organization,department,position_title,country_region,public_email,priority,relevance_reason,review_status,discovery_batch,identity_verified,affiliation_verified,relevance_verified,email_verified,last_verified_at,notes\nAda,Lovelace,,ICFT,,,CA,ADA@example.test,P1,Forest health,pending,pilot,true,true,false,true,2026-08-01,Note"; expect(parseProspectCsv(csv)).toMatchObject([{ first_name: "Ada", public_email: "ada@example.test", identity_verified: true }]); expect(() => parseProspectCsv(csv.replace("P1", "P9"))).toThrow(); });
});
