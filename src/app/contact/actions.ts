"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { type ContactSubmissionErrors, validateContactSubmission } from "@/lib/validation/contact-submission";

export type ContactSubmissionState = { errors: ContactSubmissionErrors };
export const initialContactSubmissionState: ContactSubmissionState = { errors: {} };

export async function submitContact(_previousState: ContactSubmissionState, formData: FormData): Promise<ContactSubmissionState> {
  const validation = validateContactSubmission(formData);
  if (!validation.success) return { errors: validation.errors };

  try {
    const { error } = await createAdminClient().from("contacts").insert(validation.data);
    if (error) return { errors: { form: "We could not submit your information. Please try again." } };
  } catch {
    return { errors: { form: "We could not submit your information. Please try again." } };
  }

  redirect("/contact/success");
}
