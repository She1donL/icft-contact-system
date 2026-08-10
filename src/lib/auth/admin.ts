import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { user: null, isApproved: false };

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("is_approved")
    .eq("id", user.id)
    .maybeSingle();

  return { user, isApproved: !profileError && profile?.is_approved === true };
}

export async function requireApprovedAdmin() {
  const { user, isApproved } = await getCurrentAdminAccess();

  if (!user) redirect("/admin/login");
  if (!isApproved) redirect("/admin/not-authorized");
  return user;
}
