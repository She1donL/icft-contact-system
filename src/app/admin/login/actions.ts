"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

const loginError = "/admin/login?error=invalid";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));
  if (!email || !password) redirect(loginError);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) {
    await supabase.auth.signOut();
    redirect(loginError);
  }
  redirect(next);
}
