export const prospectPriorities = ["P1", "P2", "P3"] as const;
export const prospectReviewStatuses = ["pending", "verified", "needs_review", "rejected"] as const;
export const sourceTypes = ["official_profile", "research_group", "institution_page", "professional_association", "conference_page", "publication", "government_page", "other"] as const;
export const sourceSupports = ["identity", "affiliation", "position", "email", "relevance", "research_interest", "group_membership"] as const;
export const prospectFlagOptions = ["email_missing", "role_conflict", "affiliation_conflict", "low_individual_relevance", "possible_duplicate", "stale_source", "group_only_evidence"] as const;
export type ProspectPriority = (typeof prospectPriorities)[number];
export type ProspectReviewStatus = (typeof prospectReviewStatuses)[number];
