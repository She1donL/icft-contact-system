import type { ContactSubmissionErrors } from "@/lib/validation/contact-submission";

export type ContactSubmissionState = { errors: ContactSubmissionErrors };

export const initialContactSubmissionState: ContactSubmissionState = { errors: {} };
