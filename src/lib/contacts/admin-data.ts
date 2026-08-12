import "server-only";
import { createClient } from "@/lib/supabase/server";
import { parseAdminListParams } from "./admin";

const listColumns = "id,record_id,first_name,last_name,preferred_name,email,organization,country_region,roles,status,created_at,archived_at,duplicate_status";
const detailColumns = "id,record_id,first_name,last_name,preferred_name,email,roles,other_role,organization,professional_title,country_region,general_field,specific_research_area,conference_updates_consent,consent_timestamp,status,duplicate_status,submission_source,admin_notes,created_at,updated_at,archived_at";

function escapeFilter(value: string) { return value.replace(/[,%()]/g, ""); }

export async function getAdminContacts(searchParams: Record<string, string | string[] | undefined>) {
  const filters = parseAdminListParams(searchParams); const from = (filters.page - 1) * 25; const to = from + 24;
  const supabase = await createClient(); let query = supabase.from("contacts").select(listColumns, { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
  if (filters.archived === "active") query = query.is("archived_at", null); else if (filters.archived === "archived") query = query.not("archived_at", "is", null);
  if (filters.status) query = query.eq("status", filters.status); if (filters.country) query = query.eq("country_region", filters.country); if (filters.role) query = query.contains("roles", [filters.role]);
  if (filters.query) { const q = escapeFilter(filters.query); query = query.or(`record_id.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%,preferred_name.ilike.%${q}%,email.ilike.%${q}%,organization.ilike.%${q}%,professional_title.ilike.%${q}%`); }
  const { data, count, error } = await query; return { contacts: data ?? [], total: count ?? 0, filters, error: Boolean(error) };
}

export async function getAdminContact(id: string) { const supabase = await createClient(); const { data, error } = await supabase.from("contacts").select(detailColumns).eq("id", id).maybeSingle(); return { contact: data, error: Boolean(error) }; }
