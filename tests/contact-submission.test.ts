import { describe, expect, it } from "vitest";
import { validateContactSubmission } from "@/lib/validation/contact-submission";

function validForm() {
  const form = new FormData();
  form.append("firstName", "  Élodie  ");
  form.append("lastName", "  Durand ");
  form.append("email", "  ELODIE@EXAMPLE.TEST ");
  form.append("roles", "Researcher");
  form.append("countryRegion", "CA");
  form.append("conferenceUpdatesConsent", "no");
  form.append("website", "");
  return form;
}

describe("validateContactSubmission", () => {
  it("normalizes whitespace and email while preserving Unicode names", () => {
    const result = validateContactSubmission(validForm());
    expect(result).toMatchObject({ success: true, data: { first_name: "Élodie", last_name: "Durand", email: "elodie@example.test", preferred_name: null } });
  });

  it("requires an Other role description", () => {
    const form = validForm(); form.delete("roles"); form.append("roles", "Other");
    expect(validateContactSubmission(form)).toMatchObject({ success: false, errors: { otherRole: "Please specify your role." } });
  });

  it("requires explicit consent", () => {
    const form = validForm(); form.delete("conferenceUpdatesConsent");
    expect(validateContactSubmission(form)).toMatchObject({ success: false, errors: { conferenceUpdatesConsent: "Select Yes or No." } });
  });

  it("rejects unknown roles and fields", () => {
    const roleForm = validForm(); roleForm.delete("roles"); roleForm.append("roles", "Administrator");
    expect(validateContactSubmission(roleForm)).toMatchObject({ success: false, errors: { roles: "Select only the listed roles." } });
    const fieldForm = validForm(); fieldForm.append("status", "confirmed");
    expect(validateContactSubmission(fieldForm)).toMatchObject({ success: false, errors: { form: "Unable to submit this form." } });
  });

  it("rejects honeypot submissions", () => {
    const form = validForm(); form.set("website", "https://spam.example");
    expect(validateContactSubmission(form)).toMatchObject({ success: false, errors: { form: "Unable to submit this form." } });
  });
});
