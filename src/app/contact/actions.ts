"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { processPublicContactSubmission } from "@/lib/contacts/public-submission";
import { getTrustedClientIdentifier } from "@/lib/security/client-identifier";
import { isContactSubmissionAllowed } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContactSubmissionState } from "./action-state";

export async function submitContact(_previousState: ContactSubmissionState, formData: FormData): Promise<ContactSubmissionState> {
  const requestHeaders = await headers();
  const clientIdentifier = getTrustedClientIdentifier(requestHeaders);
  const result = await processPublicContactSubmission(formData, {
    clientIdentifier,
    isRateLimitedSubmissionAllowed: isContactSubmissionAllowed,
    verifyTurnstile: (token, identifier) => verifyTurnstileToken({ token, remoteIp: identifier }),
    async insertContact(data) {
      try {
        const { error } = await createAdminClient().from("contacts").insert(data);
        return !error;
      } catch {
        return false;
      }
    },
  });

  if (!result.success) return { errors: result.errors };

  redirect("/contact/success");
}
