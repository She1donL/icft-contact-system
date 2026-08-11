import "server-only";

import { isHoneypotTriggered, type ContactInsert, type ContactSubmissionErrors, validateContactSubmission } from "@/lib/validation/contact-submission";

type ContactInsertResult =
  | { success: true }
  | { success: false; stage: "supabase_client_initialization" | "supabase_insert" };

type PublicSubmissionDependencies = {
  clientIdentifier: string;
  isRateLimitedSubmissionAllowed(identifier: string): Promise<boolean>;
  verifyTurnstile(token: string | null, identifier: string): Promise<boolean>;
  insertContact(data: ContactInsert): Promise<ContactInsertResult>;
};

export type PublicSubmissionResult = { success: true } | { success: false; errors: ContactSubmissionErrors };

const genericFailure = { success: false, errors: { form: "We could not submit your information. Please try again." } } as const;

function logContactSubmissionFailure(stage: "rate_limit" | "turnstile" | "supabase_client_initialization" | "supabase_insert") {
  console.warn(`contact submission failed at ${stage}`);
}

export async function processPublicContactSubmission(formData: FormData, dependencies: PublicSubmissionDependencies): Promise<PublicSubmissionResult> {
  if (isHoneypotTriggered(formData)) return genericFailure;

  const validation = validateContactSubmission(formData);
  if (!validation.success) return { success: false, errors: validation.errors };

  try {
    if (!await dependencies.isRateLimitedSubmissionAllowed(dependencies.clientIdentifier)) {
      logContactSubmissionFailure("rate_limit");
      return genericFailure;
    }
  } catch {
    logContactSubmissionFailure("rate_limit");
    return genericFailure;
  }

  const token = formData.get("turnstileToken");
  try {
    if (!await dependencies.verifyTurnstile(typeof token === "string" ? token : null, dependencies.clientIdentifier)) {
      logContactSubmissionFailure("turnstile");
      return genericFailure;
    }
  } catch {
    logContactSubmissionFailure("turnstile");
    return genericFailure;
  }

  try {
    const insertResult = await dependencies.insertContact(validation.data);
    if (!insertResult.success) {
      logContactSubmissionFailure(insertResult.stage);
      return genericFailure;
    }
  } catch {
    logContactSubmissionFailure("supabase_insert");
    return genericFailure;
  }

  return { success: true };
}
