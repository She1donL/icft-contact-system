"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function requestPasswordReset(formData: FormData) { const email = String(formData.get("email") ?? "").trim(); if (email) { const supabase = await createClient(); await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback?next=/auth/update-password` }); } redirect("/auth/forgot-password?sent=1"); }
