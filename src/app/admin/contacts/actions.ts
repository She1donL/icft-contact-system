"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireApprovedAdmin } from "@/lib/auth/admin";
import { validateAdminContactUpdate } from "@/lib/contacts/admin";
import { createClient } from "@/lib/supabase/server";

type SupabaseErrorMetadata = { code?: unknown };
type UpdateCategory = "permission" | "constraint_violation" | "type_mismatch" | "trigger_failure" | "unknown";

function updateDiagnostic(error: unknown): { code?: string; category: UpdateCategory } {
  const rawCode = typeof error === "object" && error !== null ? (error as SupabaseErrorMetadata).code : undefined;
  const code = typeof rawCode === "string" && /^[A-Z0-9]{5}$/.test(rawCode) ? rawCode : undefined;
  if (code === "42501") return { code, category: "permission" };
  if (code === "22P02" || code === "42804") return { code, category: "type_mismatch" };
  if (code === "P0001") return { code, category: "trigger_failure" };
  if (code?.startsWith("23")) return { code, category: "constraint_violation" };
  return { code, category: "unknown" };
}

export async function updateContact(id: string, formData: FormData) {
  await requireApprovedAdmin(); const validation = validateAdminContactUpdate(formData);
  if (!validation.success) { console.warn("admin contact update failed at validation"); redirect(`/admin/contacts/${id}?error=invalid`); }
  const supabase = await createClient(); const { error } = await supabase.from("contacts").update(validation.data).eq("id", id);
  if (error) { const { code, category } = updateDiagnostic(error); console.warn(`admin contact update failed at supabase_update${code ? ` code=${code}` : ""} category=${category}`); redirect(`/admin/contacts/${id}?error=save`); }
  try { revalidatePath("/admin"); revalidatePath(`/admin/contacts/${id}`); } catch { console.warn("admin contact update failed at post_update"); }
  redirect(`/admin/contacts/${id}?saved=1`);
}

export async function setContactArchived(id: string, archived: boolean) {
  await requireApprovedAdmin(); const supabase = await createClient();
  const { error } = await supabase.from("contacts").update({ archived_at: archived ? new Date().toISOString() : null }).eq("id", id);
  if (error) redirect(`/admin/contacts/${id}?error=archive`);
  revalidatePath("/admin"); revalidatePath(`/admin/contacts/${id}`); redirect(`/admin/contacts/${id}`);
}
