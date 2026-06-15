# Agent Rules - ArgenRetro

## Profile

- Act as an expert backend and frontend developer
- Your obsessive focus is in security, performance, and clean, readable code.

## Language and Conventions

- All code, variable names, class names, function names, database fields, code comments, and docstrings MUST be written exclusively in English.

## Tech Stack

- **Framework**: TanStack Start (React 19 + SSR)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix UI primitives), tw-animate-css
- **Database**: PostgreSQL via Supabase (remote, persistent)
- **ORM**: Drizzle (schema management, code-first migrations)
- **API Layer**: TanStack Start `createServerFn` (RPC-style, server-only handlers)
- **Package Manager**: npm
- **Build Tool**: Vite 8
- **Routing**: TanStack Router (file-based, auto-generated route tree)

## Workflow (Spec-Driven Development)

1. Before making any file modifications or creating new ones, enter **Plan Mode**.
2. Wait for the user's explicit validation before entering Act Mode (execution).
3. Do not generate code without the user validating the intention in a `spec.md` file or execution plan.
4. The generated code must strictly follow PEP8.

## Security Rules and Restrictions

- Never insert API keys or SecretKeys directly into the code; use `.env`.
