"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { processPublicContactSubmission } from "@/lib/contacts/public-submission";
import { getTrustedClientIdentifier } from "@/lib/security/client-identifier";
import { isContactSubmissionAllowed } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContactSubmissionState } from "./action-state";

type SupabaseErrorMetadata = { code?: unknown };
type SupabaseInsertDiagnostic = {
  code?: string;
  category: "authentication" | "permission" | "column_missing" | "constraint_violation" | "type_mismatch" | "trigger_failure" | "unknown";
};

function safeSupabaseInsertDiagnostic(error: unknown): SupabaseInsertDiagnostic {
  const rawCode = typeof error === "object" && error !== null
    ? (error as SupabaseErrorMetadata).code
    : undefined;
  const code = typeof rawCode === "string" && /^[A-Z0-9]{5}$/.test(rawCode)
    ? rawCode
    : undefined;

  if (code === "42501") return { code, category: "permission" as const };
  if (code === "42703") return { code, category: "column_missing" as const };
  if (code === "22P02" || code === "42804") return { code, category: "type_mismatch" as const };
  if (code === "P0001") return { code, category: "trigger_failure" as const };
  if (code?.startsWith("23")) return { code, category: "constraint_violation" as const };
  if (code === "28000" || code === "28P01") return { code, category: "authentication" as const };

  return { code, category: "unknown" as const };
}

export async function submitContact(_previousState: ContactSubmissionState, formData: FormData): Promise<ContactSubmissionState> {
  const requestHeaders = await headers();
  const clientIdentifier = getTrustedClientIdentifier(requestHeaders);
  const result = await processPublicContactSubmission(formData, {
    clientIdentifier,
    isRateLimitedSubmissionAllowed: isContactSubmissionAllowed,
    verifyTurnstile: (token, identifier) => verifyTurnstileToken({ token, remoteIp: identifier }),
    async insertContact(data) {
      let supabase;
      try {
        supabase = createAdminClient();
      } catch {
        return { success: false, stage: "supabase_client_initialization" };
      }

      try {
        const { error } = await supabase.from("contacts").insert(data);
        return error
          ? { success: false, stage: "supabase_insert", diagnostic: safeSupabaseInsertDiagnostic(error) }
          : { success: true };
      } catch {
        return { success: false, stage: "supabase_insert" };
      }
    },
  });

  if (!result.success) return { errors: result.errors };

  redirect("/contact/success");
}
