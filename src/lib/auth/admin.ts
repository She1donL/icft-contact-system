import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireApprovedAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("is_approved")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_approved) redirect("/admin/not-authorized");
  return user;
}
