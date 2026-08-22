import "server-only";
import { createClient } from "@/lib/supabase/server";
import { parseAdminListParams } from "./admin";

const listColumns = "id,record_id,first_name,last_name,preferred_name,email,organization,country_region,roles,status,created_at,archived_at,duplicate_status";
const detailColumns = "id,record_id,first_name,last_name,preferred_name,email,roles,other_role,organization,professional_title,country_region,general_field,specific_research_area,conference_updates_consent,consent_timestamp,status,duplicate_status,submission_source,admin_notes,created_at,updated_at,archived_at";
export const csvColumns = "record_id,first_name,last_name,preferred_name,email,roles,other_role,organization,professional_title,country_region,general_field,specific_research_area,conference_updates_consent,consent_timestamp,status,duplicate_status,submission_source,admin_notes,created_at,updated_at,archived_at";

function escapeFilter(value: string) { return value.replace(/[,%()]/g, ""); }
function applyContactFilters<T extends { is: (column: string, value: null) => T; not: (column: string, operator: string, value: null) => T; eq: (column: string, value: string) => T; contains: (column: string, values: string[]) => T; or: (filters: string) => T }>(query: T, filters: ReturnType<typeof parseAdminListParams>) {
  if (filters.archived === "active") query = query.is("archived_at", null); else if (filters.archived === "archived") query = query.not("archived_at", "is", null);
  if (filters.status) query = query.eq("status", filters.status); if (filters.duplicate) query = query.eq("duplicate_status", filters.duplicate); if (filters.country) query = query.eq("country_region", filters.country); if (filters.role) query = query.contains("roles", [filters.role]);
  if (filters.query) { const q = escapeFilter(filters.query); query = query.or(`record_id.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%,preferred_name.ilike.%${q}%,email.ilike.%${q}%,organization.ilike.%${q}%,professional_title.ilike.%${q}%`); }
  return query;
}

export async function getAdminContacts(searchParams: Record<string, string | string[] | undefined>) {
  const filters = parseAdminListParams(searchParams); const from = (filters.page - 1) * 25; const to = from + 24;
  const supabase = await createClient(); const query = applyContactFilters(supabase.from("contacts").select(listColumns, { count: "exact" }).order("created_at", { ascending: false }).order("id", { ascending: false }).range(from, to), filters);
  const { data, count, error } = await query; return { contacts: data ?? [], total: count ?? 0, filters, error: Boolean(error) };
}

export async function getAdminContact(id: string) { const supabase = await createClient(); const { data, error } = await supabase.from("contacts").select(detailColumns).eq("id", id).maybeSingle(); return { contact: data, error: Boolean(error) }; }

export async function getDuplicateGroup(id: string) { const { contact, error } = await getAdminContact(id); if (error || !contact) return { contact: null, matches: [] }; const supabase = await createClient(); const { data } = await supabase.from("contacts").select(detailColumns).eq("email", contact.email).order("created_at", { ascending: true }); return { contact, matches: data ?? [] }; }

export async function getAdminContactsForExport(searchParams: Record<string, string | string[] | undefined>) {
  const filters = parseAdminListParams(searchParams); const supabase = await createClient(); const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += 1000) { const query = applyContactFilters(supabase.from("contacts").select(csvColumns).order("created_at", { ascending: false }).order("id", { ascending: false }).range(from, from + 999), filters);
    const { data, error } = await query; if (error) return { rows: [], error: true }; rows.push(...(data ?? [])); if (!data || data.length < 1000) break;
  } return { rows, error: false };
}
