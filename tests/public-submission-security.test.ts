import { describe, expect, it, vi } from "vitest";
import { processPublicContactSubmission } from "@/lib/contacts/public-submission";
import { isContactSubmissionAllowed } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

function validForm() {
  const form = new FormData();
  form.append("firstName", "Ada"); form.append("lastName", "Lovelace"); form.append("email", "ada@example.test");
  form.append("roles", "Researcher"); form.append("countryRegion", "CA"); form.append("conferenceUpdatesConsent", "yes"); form.append("website", ""); form.append("turnstileToken", "valid-token");
  return form;
}

describe("Turnstile verification", () => {
  it("accepts a valid matching token response", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, action: "contact_submission", hostname: "localhost" }), { status: 200 }));
    await expect(verifyTurnstileToken({ token: "valid", secretKey: "test", expectedHostname: "localhost", fetcher })).resolves.toBe(true);
  });
  it("rejects missing, invalid, and provider-failure tokens", async () => {
    const invalid = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false }), { status: 200 }));
    await expect(verifyTurnstileToken({ token: null, secretKey: "test", fetcher: invalid })).resolves.toBe(false);
    await expect(verifyTurnstileToken({ token: "invalid", secretKey: "test", fetcher: invalid })).resolves.toBe(false);
    await expect(verifyTurnstileToken({ token: "valid", secretKey: "test", fetcher: vi.fn().mockRejectedValue(new Error("provider unavailable")) })).resolves.toBe(false);
  });
});

describe("durable rate-limit adapter", () => {
  it("returns allowed and exceeded results from its durable client", async () => {
    await expect(isContactSubmissionAllowed("ip:allowed", { limit: vi.fn().mockResolvedValue({ success: true }) })).resolves.toBe(true);
    await expect(isContactSubmissionAllowed("ip:blocked", { limit: vi.fn().mockResolvedValue({ success: false }) })).resolves.toBe(false);
    await expect(isContactSubmissionAllowed("ip:provider-error", { limit: vi.fn().mockRejectedValue(new Error("unavailable")) })).resolves.toBe(false);
  });
});

describe("public submission security boundary", () => {
  it("inserts only after the rate limit and Turnstile checks pass", async () => {
    const events: string[] = [];
    const result = await processPublicContactSubmission(validForm(), {
      clientIdentifier: "ip:test",
      isRateLimitedSubmissionAllowed: async () => { events.push("rate"); return true; },
      verifyTurnstile: async () => { events.push("turnstile"); return true; },
      insertContact: async () => { events.push("insert"); return true; },
    });
    expect(result).toEqual({ success: true });
    expect(events).toEqual(["rate", "turnstile", "insert"]);
  });

  it("returns a generic result for rate-limit, honeypot, and insert failures", async () => {
    const blocked = await processPublicContactSubmission(validForm(), { clientIdentifier: "ip:test", isRateLimitedSubmissionAllowed: async () => false, verifyTurnstile: async () => true, insertContact: async () => true });
    const honeypotForm = validForm(); honeypotForm.set("website", "bot");
    const honeypot = await processPublicContactSubmission(honeypotForm, { clientIdentifier: "ip:test", isRateLimitedSubmissionAllowed: async () => true, verifyTurnstile: async () => true, insertContact: async () => true });
    const insertFailure = await processPublicContactSubmission(validForm(), { clientIdentifier: "ip:test", isRateLimitedSubmissionAllowed: async () => true, verifyTurnstile: async () => true, insertContact: async () => false });
    for (const result of [blocked, honeypot, insertFailure]) expect(result).toMatchObject({ success: false, errors: { form: "We could not submit your information. Please try again." } });
  });

  it("gives a duplicate insert the same public success behavior", async () => {
    const result = await processPublicContactSubmission(validForm(), { clientIdentifier: "ip:test", isRateLimitedSubmissionAllowed: async () => true, verifyTurnstile: async () => true, insertContact: async () => true });
    expect(result).toEqual({ success: true });
  });
});
