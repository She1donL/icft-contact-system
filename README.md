# ICFT Contact Information System

This repository contains the foundation for ICFT's future contact information collection system. The current milestone provides only the public landing-page placeholder and project structure.

## Local setup

1. Install Node.js 20.9 or later and pnpm 11.9.0.
2. Install dependencies with `pnpm install`.
3. Copy `.env.example` to `.env.local`. For Milestone 3, set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_APP_URL`; do not commit `.env.local` or use a service-role key.
4. Run `pnpm run dev` and open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
pnpm run lint
pnpm run build
```

## Public-form anti-abuse configuration

Before releasing the public QR code, configure Cloudflare Turnstile and Upstash Redis in the deployment environment. Use Cloudflare's official Turnstile test keys for localhost and automated testing; never use production Turnstile credentials locally. The Secret Key, Turnstile secret, and Upstash credentials are server-only and must never use a `NEXT_PUBLIC_` prefix.

## Project structure

- `src/app` — App Router routes and global styles
- `src/components` — shared UI components
- `src/lib/contacts` — future contact-domain logic
- `src/lib/supabase` — future Supabase integration boundary
- `src/lib/validation` — future input validation
- `src/messages` — centralized copy for localization

## Research Prospects

Research Prospects are externally researched professional candidates, maintained separately from `contacts`. Contacts are self-submitted or known contacts from the public QR-code form; Research Prospects are never created by that form and are not eligible for communications merely because a public professional email was found.

The Research Prospects module uses `research_prospects`, `research_prospect_sources`, `research_tags`, `research_prospect_tag_assignments`, and `research_prospect_flags`. Only approved administrators can access these tables. Sources preserve the evidence behind identity, affiliation, relevance, and public-email verification; verification flags identify issues that need review.

Priorities describe research-management relevance, not personal quality: `P1` direct ICFT/forest-health relevance, `P2` strong adjacent nature-and-health relevance, and `P3` broader professional or network relevance. Review statuses are `pending`, `verified`, `needs_review`, and `rejected`.

Approved administrators can add prospects at `/admin/prospects`, attach sources/tags/flags, and import a core-data CSV (up to 500 rows/1 MB). The import expects the headers displayed on `/admin/prospects/import`; it validates every row before issuing one database insert, and does not import tags or sources. Those are added afterward on the detail page. A future Research Pipeline may assist discovery, but this milestone intentionally contains no web research, scraping, enrichment, or automatic conversion into Contacts.
