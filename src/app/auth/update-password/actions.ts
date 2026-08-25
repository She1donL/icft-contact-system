"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function updatePassword(formData: FormData) { const password = String(formData.get("password") ?? ""); if (password.length < 8) redirect("/auth/update-password?error=invalid"); const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/auth/update-password?error=recovery"); const { error } = await supabase.auth.updateUser({ password }); redirect(error ? "/auth/update-password?error=invalid" : "/admin/login?reset=1"); }
