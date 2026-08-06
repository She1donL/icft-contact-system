# ICFT Contact Information System

This repository contains the foundation for ICFT's future contact information collection system. The current milestone provides only the public landing-page placeholder and project structure.

## Local setup

1. Install Node.js 20.9 or later and pnpm 11.9.0.
2. Install dependencies with `pnpm install`.
3. Copy `.env.example` to `.env.local` and fill in values only when the corresponding integrations are introduced. Do not commit `.env.local`.
4. Run `pnpm run dev` and open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
pnpm run lint
pnpm run build
```

## Project structure

- `src/app` — App Router routes and global styles
- `src/components` — shared UI components
- `src/lib/contacts` — future contact-domain logic
- `src/lib/supabase` — future Supabase integration boundary
- `src/lib/validation` — future input validation
- `src/messages` — centralized copy for localization
