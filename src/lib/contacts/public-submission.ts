import { isHoneypotTriggered, type ContactInsert, type ContactSubmissionErrors, validateContactSubmission } from "@/lib/validation/contact-submission";

type PublicSubmissionDependencies = {
  clientIdentifier: string;
  isRateLimitedSubmissionAllowed(identifier: string): Promise<boolean>;
  verifyTurnstile(token: string | null, identifier: string): Promise<boolean>;
  insertContact(data: ContactInsert): Promise<boolean>;
};

export type PublicSubmissionResult = { success: true } | { success: false; errors: ContactSubmissionErrors };

const genericFailure = { success: false, errors: { form: "We could not submit your information. Please try again." } } as const;

export async function processPublicContactSubmission(formData: FormData, dependencies: PublicSubmissionDependencies): Promise<PublicSubmissionResult> {
  if (isHoneypotTriggered(formData)) return genericFailure;

  const validation = validateContactSubmission(formData);
  if (!validation.success) return { success: false, errors: validation.errors };

  try {
    if (!await dependencies.isRateLimitedSubmissionAllowed(dependencies.clientIdentifier)) return genericFailure;
  } catch {
    return genericFailure;
  }

  const token = formData.get("turnstileToken");
  try {
    if (!await dependencies.verifyTurnstile(typeof token === "string" ? token : null, dependencies.clientIdentifier)) return genericFailure;
  } catch {
    return genericFailure;
  }

  try {
    if (!await dependencies.insertContact(validation.data)) return genericFailure;
  } catch {
    return genericFailure;
  }

  return { success: true };
}
