import { countryRegionValues, roleOptions, type ContactRole } from "@/lib/contacts/options";

export const contactFieldNames = [
  "firstName", "lastName", "preferredName", "email", "roles", "otherRole", "organization",
  "professionalTitle", "countryRegion", "generalField", "specificResearchArea", "conferenceUpdatesConsent", "website",
] as const;

export type ContactFieldName = (typeof contactFieldNames)[number];
export type ContactSubmissionErrors = Partial<Record<ContactFieldName, string>> & { form?: string };

export type ContactInsert = {
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  email: string;
  roles: ContactRole[];
  other_role: string | null;
  organization: string | null;
  professional_title: string | null;
  country_region: string;
  general_field: string | null;
  specific_research_area: string | null;
  conference_updates_consent: boolean;
  submission_source: "qr_code";
};

export type ContactValidationResult =
  | { success: true; data: ContactInsert }
  | { success: false; errors: ContactSubmissionErrors };

const allowedFields = new Set<string>(contactFieldNames);
const allowedRoles = new Set<string>(roleOptions);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

function valueFor(formData: FormData, name: ContactFieldName): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : null;
}

function optionalValue(formData: FormData, name: ContactFieldName, maxLength: number, errors: ContactSubmissionErrors) {
  const value = valueFor(formData, name);
  if (!value) return null;
  if (value.length > maxLength) {
    errors[name] = `Please use ${maxLength} characters or fewer.`;
    return null;
  }
  return value;
}

function requiredValue(formData: FormData, name: ContactFieldName, label: string, maxLength: number, errors: ContactSubmissionErrors) {
  const value = valueFor(formData, name);
  if (!value) {
    errors[name] = `${label} is required.`;
    return null;
  }
  if (value.length > maxLength) {
    errors[name] = `Please use ${maxLength} characters or fewer.`;
    return null;
  }
  return value;
}

export function validateContactSubmission(formData: FormData): ContactValidationResult {
  const errors: ContactSubmissionErrors = {};
  const submittedFields = [...formData.keys()].filter((name) => !name.startsWith("$ACTION_"));
  if (submittedFields.some((name) => !allowedFields.has(name))) {
    return { success: false, errors: { form: "Unable to submit this form." } };
  }

  if (valueFor(formData, "website")) {
    return { success: false, errors: { form: "Unable to submit this form." } };
  }

  const firstName = requiredValue(formData, "firstName", "First name", 100, errors);
  const lastName = requiredValue(formData, "lastName", "Last name", 100, errors);
  const preferredName = optionalValue(formData, "preferredName", 100, errors);
  const rawEmail = requiredValue(formData, "email", "Email address", 254, errors);
  const email = rawEmail?.toLowerCase();
  if (email && !emailPattern.test(email)) errors.email = "Enter a valid email address.";

  const roles = formData.getAll("roles").filter((value): value is string => typeof value === "string");
  const normalizedRoles = [...new Set(roles)];
  if (!normalizedRoles.length) errors.roles = "Select at least one role.";
  if (normalizedRoles.some((role) => !allowedRoles.has(role))) errors.roles = "Select only the listed roles.";

  const otherRole = optionalValue(formData, "otherRole", 150, errors);
  if (normalizedRoles.includes("Other") && !otherRole) errors.otherRole = "Please specify your role.";

  const organization = optionalValue(formData, "organization", 200, errors);
  const professionalTitle = optionalValue(formData, "professionalTitle", 200, errors);
  const countryRegion = requiredValue(formData, "countryRegion", "Country or region", 2, errors);
  if (countryRegion && !countryRegionValues.has(countryRegion)) errors.countryRegion = "Select a valid country or region.";
  const generalField = optionalValue(formData, "generalField", 200, errors);
  const specificResearchArea = optionalValue(formData, "specificResearchArea", 2000, errors);

  const consent = valueFor(formData, "conferenceUpdatesConsent");
  if (consent !== "yes" && consent !== "no") errors.conferenceUpdatesConsent = "Select Yes or No.";

  if (Object.keys(errors).length) return { success: false, errors };

  return {
    success: true,
    data: {
      first_name: firstName!,
      last_name: lastName!,
      preferred_name: preferredName,
      email: email!,
      roles: normalizedRoles as ContactRole[],
      other_role: normalizedRoles.includes("Other") ? otherRole : null,
      organization,
      professional_title: professionalTitle,
      country_region: countryRegion!,
      general_field: generalField,
      specific_research_area: specificResearchArea,
      conference_updates_consent: consent === "yes",
      submission_source: "qr_code",
    },
  };
}
