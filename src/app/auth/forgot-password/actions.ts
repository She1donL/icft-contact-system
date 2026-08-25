"use server";
import { redirect } from "next/navigation";
import { passwordRecoveryCallbackUrl } from "@/lib/auth/password-recovery";
import { createClient } from "@/lib/supabase/server";
export async function requestPasswordReset(formData: FormData) { const email = String(formData.get("email") ?? "").trim(); if (email) { const supabase = await createClient(); await supabase.auth.resetPasswordForEmail(email, { redirectTo: passwordRecoveryCallbackUrl() }); } redirect("/auth/forgot-password?sent=1"); }
