# Research Prospect Pipeline

This document is the permanent source of truth for Codex-assisted Research Prospect discovery and import work in the ICFT Contact Information System.

Research Prospects are externally researched professional candidates. They are separate from `contacts`: research work must never create or update a Contact, infer consent, create newsletter state, or make a person eligible for communications.

## Starting a research run

Treat a request in this shape as an instruction to run this pipeline:

```text
Run Prospect Research
Region: <region>
Topics: <comma-separated topics>
Target: <number>
```

Optional parameters are:

- `Priority: P1`, `P2`, `P3`, or `all`
- `Countries: <countries>`
- `Institution types: <types>`
- `Direct database insert: yes/no`

When an optional parameter is omitted, quality takes priority over the numerical target; search P1 and P2 first, include P3 selectively, and use the safe default of preparing findings for review rather than writing to the hosted database. Direct insertion is permitted only when it is explicitly requested and all [direct database safeguards](#direct-database-safeguards) are met.

Each run must use one unique `discovery_batch` value in the format:

```text
YYYY-MM-<region>-<topic-slug>
```

For example: `2026-08-japan-forest-therapy`.

## Priority: ICFT relevance only

Priority measures ICFT relevance. It does not measure identity, affiliation, email, or source-verification confidence.

| Priority | Definition | Typical examples |
| --- | --- | --- |
| P1 | Direct ICFT relevance | Forest Therapy, Forest Bathing, Shinrin-yoku, Forest Medicine, Forest Health, Health Forest, Nature-based Therapy, and direct forest-health intervention research |
| P2 | Strong adjacent relevance | Nature & Health, Environmental Psychology, Nature-based Rehabilitation, Therapeutic Landscapes, Green Care, Health Design, Nature-based Intervention, and nature exposure and human wellbeing |
| P3 | Broader network relevance | Urban Forestry, Outdoor Recreation, Nature-based Tourism, Forest Planning, and other clearly useful forestry-health network connections |

Do not assign P1 merely from group membership. An individual must have direct evidence of work relevant to the P1 subjects.

## Independent verification fields

Every researched Prospect is assessed independently on these four fields:

- `identity_verified`
- `affiliation_verified`
- `relevance_verified`
- `email_verified`

Each field requires supporting evidence. Do not infer one field from another. In particular, a verified identity or affiliation does not verify relevance or email, and an email found in a publication does not establish a current affiliation.

## Review-status rules

### `verified`

A newly researched Prospect may be set to `verified` automatically only when all of the following are true:

- all four verification fields are `true`;
- current, reliable public evidence exists;
- there is no affiliation or role conflict;
- there is no duplicate warning;
- there is no stale-source warning;
- there are no unresolved verification flags; and
- the public professional email is explicitly displayed by a reliable source, not inferred.

If all four fields are true but an unresolved conflict or flag exists, use `needs_review`, never `verified`.

### `pending`

Use `pending` when the person appears suitable for the Research Prospects database but does not meet the strict automatic-verified rule. Examples include strong identity, affiliation, and relevance evidence without a public email; incomplete current-source coverage; or otherwise usable information that needs optional enrichment.

Missing email alone does not lower research relevance and does not require rejection.

### `needs_review`

`needs_review` is a persisted Research Prospect state, not an exclusion decision. A candidate with established identity and ICFT relevance plus auditable evidence should normally be stored in `research_prospects` even when current role, affiliation, email, or source recency remains unresolved. Record the uncertainty in verification fields, notes, and verification flags.

Use `needs_review` for a role or affiliation conflict, possible duplicate, stale or conflicting source, inadequately confirmed current affiliation, group-membership-only evidence, uncertain individual relevance, or an email found only in a scholarly publication while the current institution is uncertain.

### `rejected`

Use `rejected` (or do not insert) only when identity, ICFT relevance, or auditable evidence is insufficient, or when research establishes that the person is outside ICFT scope. Do not retain weak records merely to meet a target count.

In short: `verified` means fully verified with no unresolved flags; `pending` means a good, clean Prospect with incomplete enrichment such as a missing public email; `needs_review` means a relevant Prospect with a material uncertainty or conflict requiring human review; and `rejected`/not inserted means insufficient identity, relevance, or evidence, or out-of-scope work.

## Evidence and email rules

Use sources in this order whenever reasonably available:

1. Current official university profile
2. Current official research institute profile
3. Official research group or laboratory
4. Government institution
5. IUFRO or recognized professional association
6. Official conference page
7. Recent peer-reviewed publication

LinkedIn, ResearchGate, search snippets, personal pages, and third-party directories are secondary clues only. They cannot be the sole basis for automatic verification when a stronger source should reasonably exist.

Never guess an email, infer an institutional email pattern, or use enrichment, leaked, or private datasets. Set `email_verified = true` only when a public professional email is explicitly displayed by an acceptable source. Otherwise leave `public_email` blank and set `email_verified = false`.

Every inserted Prospect needs auditable source records. Record the current official evidence wherever available, preserve source URLs and relevant dates, and create verification flags for unresolved issues.

## Required workflow

For every future research task:

1. Identify high-quality research groups, networks, and institutions.
2. Discover relevant people.
3. Locate current official evidence for each individual.
4. Verify identity.
5. Verify current affiliation and position.
6. Evaluate individual ICFT relevance.
7. Search for an explicitly public professional email.
8. Collect auditable sources.
9. Assign research tags.
10. Assign P1, P2, or P3.
11. Apply the four independent verification fields.
12. Apply the review-status rules in this document.
13. Check duplicates against existing `research_prospects`.
14. Create or update Research Prospects only as permitted by the requested workflow.

Duplicate checks must include normalized public-email exact matches and name plus organization for records without email. Do not merge uncertain duplicates automatically; flag or report them for review.

## Direct database safeguards

Research tasks may write directly to these existing tables without an intermediate CSV:

- `research_prospects`
- `research_prospect_sources`
- `research_tags`
- `research_prospect_tag_assignments`
- `research_prospect_flags`

Direct insertion requires all of the following:

- the research task explicitly requests database insertion;
- the hosted schema is unchanged and healthy;
- duplicate checks complete before insertion;
- each inserted Prospect has auditable sources;
- Contacts are not modified; and
- consent, newsletter, and subscription state are not inferred or created.

Do not write research-discovered people to `contacts`. Do not automatically merge uncertain duplicates.

## Required research-run report

Every completed research run must report:

- candidates found and inserted;
- `verified`, `pending`, `needs_review`, and `rejected` counts;
- P1, P2, and P3 counts;
- verified and missing public-email counts;
- countries represented;
- duplicates skipped or flagged;
- sources and tags added;
- the `discovery_batch`; and
- notable uncertainties and any records requiring follow-up.
