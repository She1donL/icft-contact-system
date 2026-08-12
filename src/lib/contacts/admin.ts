import { countryRegionValues, roleOptions, type ContactRole } from "@/lib/contacts/options";

export const contactStatuses = ["new", "reviewed", "contacted", "follow_up_needed", "confirmed", "do_not_contact"] as const;
export const duplicateStatuses = ["no_duplicate_detected", "possible_duplicate", "reviewed", "merged", "keep_separate"] as const;
export type ContactStatus = (typeof contactStatuses)[number];
export type AdminContactErrors = Partial<Record<"firstName" | "lastName" | "email" | "roles" | "otherRole" | "countryRegion" | "status", string>>;

export type AdminContactUpdate = {
  first_name: string; last_name: string; preferred_name: string | null; email: string; roles: ContactRole[]; other_role: string | null;
  organization: string | null; professional_title: string | null; country_region: string; general_field: string | null;
  specific_research_area: string | null; conference_updates_consent: boolean; status: ContactStatus; admin_notes: string | null;
};

const allowedRoles = new Set<string>(roleOptions);
const allowedStatuses = new Set<string>(contactStatuses);
const allowedDuplicateStatuses = new Set<string>(duplicateStatuses);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

function text(formData: FormData, name: string, max: number, required = false, errors?: AdminContactErrors) {
  const value = formData.get(name);
  const normalized = typeof value === "string" ? value.trim() : "";
  if (required && !normalized) { if (errors) errors[name as keyof AdminContactErrors] = "This field is required."; return null; }
  if (normalized.length > max) { if (errors) errors[name as keyof AdminContactErrors] = `Please use ${max} characters or fewer.`; return null; }
  return normalized || null;
}

export function validateAdminContactUpdate(formData: FormData): { success: true; data: AdminContactUpdate } | { success: false; errors: AdminContactErrors } {
  const errors: AdminContactErrors = {};
  const firstName = text(formData, "firstName", 100, true, errors);
  const lastName = text(formData, "lastName", 100, true, errors);
  const rawEmail = text(formData, "email", 254, true, errors);
  const email = rawEmail?.toLowerCase() ?? null;
  if (email && !emailPattern.test(email)) errors.email = "Enter a valid email address.";
  const roles = [...new Set(formData.getAll("roles").filter((role): role is string => typeof role === "string"))];
  if (!roles.length || roles.some((role) => !allowedRoles.has(role))) errors.roles = "Select one or more listed roles.";
  const otherRole = text(formData, "otherRole", 150, false, errors);
  if (roles.includes("Other") && !otherRole) errors.otherRole = "Please specify the Other role.";
  const countryRegion = text(formData, "countryRegion", 2, true, errors);
  if (countryRegion && !countryRegionValues.has(countryRegion)) errors.countryRegion = "Select a valid country or region.";
  const status = text(formData, "status", 40, true, errors);
  if (status && !allowedStatuses.has(status)) errors.status = "Select a valid status.";
  const preferredName = text(formData, "preferredName", 100, false, errors);
  const organization = text(formData, "organization", 200, false, errors);
  const professionalTitle = text(formData, "professionalTitle", 200, false, errors);
  const generalField = text(formData, "generalField", 200, false, errors);
  const specificResearchArea = text(formData, "specificResearchArea", 2000, false, errors);
  const adminNotes = text(formData, "adminNotes", 5000, false, errors);
  const consent = formData.get("conferenceUpdatesConsent");
  if (consent !== "yes" && consent !== "no") errors.status = errors.status ?? "Choose a consent value.";
  if (Object.keys(errors).length) return { success: false, errors };
  return { success: true, data: { first_name: firstName!, last_name: lastName!, preferred_name: preferredName, email: email!, roles: roles as ContactRole[], other_role: roles.includes("Other") ? otherRole : null, organization, professional_title: professionalTitle, country_region: countryRegion!, general_field: generalField, specific_research_area: specificResearchArea, conference_updates_consent: consent === "yes", status: status as ContactStatus, admin_notes: adminNotes } };
}

export function parseAdminListParams(params: Record<string, string | string[] | undefined>) {
  const value = (name: string) => typeof params[name] === "string" ? params[name] : "";
  const pageValue = Number.parseInt(value("page"), 10);
  return { query: value("q").trim().slice(0, 100), status: allowedStatuses.has(value("status")) ? value("status") : "", duplicate: allowedDuplicateStatuses.has(value("duplicate")) ? value("duplicate") : "", country: countryRegionValues.has(value("country")) ? value("country") : "", role: allowedRoles.has(value("role")) ? value("role") : "", archived: value("archived") === "all" || value("archived") === "archived" ? value("archived") : "active", page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1 };
}

export function isAllowedDuplicateReviewAction(value: string): value is "reviewed" | "keep_separate" { return value === "reviewed" || value === "keep_separate"; }
