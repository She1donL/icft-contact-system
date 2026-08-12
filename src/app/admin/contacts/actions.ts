"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireApprovedAdmin } from "@/lib/auth/admin";
import { validateAdminContactUpdate } from "@/lib/contacts/admin";
import { createClient } from "@/lib/supabase/server";

export async function updateContact(id: string, formData: FormData) {
  await requireApprovedAdmin(); const validation = validateAdminContactUpdate(formData);
  if (!validation.success) redirect(`/admin/contacts/${id}?error=invalid`);
  const supabase = await createClient(); const { error } = await supabase.from("contacts").update(validation.data).eq("id", id);
  if (error) redirect(`/admin/contacts/${id}?error=save`);
  revalidatePath("/admin"); revalidatePath(`/admin/contacts/${id}`); redirect(`/admin/contacts/${id}?saved=1`);
}

export async function setContactArchived(id: string, archived: boolean) {
  await requireApprovedAdmin(); const supabase = await createClient();
  const { error } = await supabase.from("contacts").update({ archived_at: archived ? new Date().toISOString() : null }).eq("id", id);
  if (error) redirect(`/admin/contacts/${id}?error=archive`);
  revalidatePath("/admin"); revalidatePath(`/admin/contacts/${id}`); redirect(`/admin/contacts/${id}`);
}
