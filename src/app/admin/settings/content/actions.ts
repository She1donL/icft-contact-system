"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireApprovedAdmin } from "@/lib/auth/admin";
import { validateSiteContent } from "@/lib/site-content";
import { siteContentDefaults } from "@/messages/en";
import { createClient } from "@/lib/supabase/server";

function refreshPublicContent() {
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/contact/success");
  revalidatePath("/admin/settings/content");
}

export async function saveSiteContent(formData: FormData) {
  await requireApprovedAdmin();
  const validation = validateSiteContent(formData);
  if (!validation.success) redirect("/admin/settings/content?error=invalid");

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").update(validation.data).eq("id", true);
  if (error) redirect("/admin/settings/content?error=save");

  refreshPublicContent();
  redirect("/admin/settings/content?saved=1");
}

export async function resetSiteContentToDefaults() {
  await requireApprovedAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").update(siteContentDefaults).eq("id", true);
  if (error) redirect("/admin/settings/content?error=reset");

  refreshPublicContent();
  redirect("/admin/settings/content?reset=1");
}
