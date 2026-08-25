import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/redirect";
import { passwordRecoveryDestination } from "@/lib/auth/password-recovery";
import { createClient } from "@/lib/supabase/server";
export async function GET(request: Request) { const url = new URL(request.url); const code = url.searchParams.get("code"); const next = safeNextPath(url.searchParams.get("next"), "/admin"); const recovery = next === "/auth/update-password"; if (!code) return NextResponse.redirect(new URL(recovery ? passwordRecoveryDestination(false) : "/admin/login?error=invalid", url)); const supabase = await createClient(); const { error } = await supabase.auth.exchangeCodeForSession(code); return NextResponse.redirect(new URL(error ? (recovery ? passwordRecoveryDestination(false) : "/admin/login?error=invalid") : next, url)); }
