---
trigger: always_on
---

# Project Guidelines

This document consolidates the development guidelines, architecture overview, and coding standards for the PostNotel application. It is designed to guide both human developers and AI agents.

## Quick Start & Commands

- **Start development server**: `npm run dev` (available at http://localhost:5173) - React Router dev server with HMR.
- **Preview build**: `npm run preview` - Preview the production build locally.
- **Local Worker dev**: `npm run start` - Cloudflare Wrangler local dev (simulates Worker).
- **Build**: `npm run build` - Production build (SSR output for Worker).
- **Typecheck**: `npm run typecheck` - Generate Worker types, route types, and run TypeScript project checks.
- **Deploy**: `npm run deploy` - Build and deploy via Wrangler. Pushes to `main` also trigger deployment.

## Architecture Overview

This is a **React Router v7** application deployed on **Cloudflare Workers**.

### Tech Stack
- **Framework**: React Router v7 with SSR (`app/entry.server.tsx`)
- **Runtime**: Cloudflare Workers (`workers/app.ts`)
- **Styling**: TailwindCSS v4 (`@tailwindcss/vite`), app styles in `app/app.css` and `app/editor.css`
- **Rich Text Editor**: BlockNote (`@blocknote/*`)
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling; generated shadcn components in `app/components/ui/`

### Key Features
- **Notes Management**: Create, read, update, delete notes with rich text editing
- **Authentication**: Google OAuth integration
- **Image Upload**: Image handling with compression
- **Wine Recognition**: Wine-related functionality
- **Dark Theme**: Default dark mode styling

## Project Structure

- **`app/`**: Main source code
  - **`routes/`**: File-based routing; route config in `app/routes.ts`
  - **`features/`**: Feature-based organization (auth, notes, image, wines, etc.)
  - **`components/`**: Reusable UI components
    - **`ui/`**: Generated shadcn components (DO NOT HAND-EDIT)
    - **`common/`**: Shared application components
  - **`lib/`**: Utility functions and shared logic
  - **`hooks/`**: Custom React hooks
  - **`layout/`**: Layout components
  - **`constants/`**: Application constants and enums
  - **`types/`**: TypeScript type definitions
- **`workers/`**: Cloudflare Worker entry point (`workers/app.ts`)
- **`public/`**: Static assets
- **`context/`**: Specifications and implementation notes
- **`issue/`**: Issue tracking and notes

## Coding Guidelines

### Formatting and Linting
- **Tool**: Biome
- **Indentation**: Tabs (not spaces)
- **Line width**: 100 characters
- **Quote style**: Double quotes for JavaScript/TypeScript
- **Auto-organize imports**: Enabled
- **Command**: `npx biome check app --write` or `npx @biomejs/biome`

### TypeScript Rules
- **Strictness**: Align with `tsconfig.json` settings.
- **Types**: Avoid `any` or `unknown` whenever possible; model domain types explicitly.
- **Classes**: Do not use `class` unless absolutely necessary; prefer functions and plain objects.
- **Explicit Typing**: Explicitly specify types for variables, function parameters, and return values.

### React Guidelines
- **State Management**: Minimize `useState` and `useEffect`. Leverage loaders, actions, derived state, and controlled components.
- **Component Structure**: Keep components small and focused. Lift state only when needed.
- **Data Loading**: Prefer server-side data loading with React Router loaders; pass data through route context.

### Styling
- **Tailwind CSS**: Use utility-first styling. Keep class names readable and consistent.
- **Imports**: Prefer aliased imports (e.g., `~/lib/utils`, `~/hooks/...`).

## Routing & Data Fetching

- **Configuration**: Routes are defined in `app/routes.ts`.
- **Layouts**:
  - Base layout: `app/layout/base.tsx`
  - WithPost layout: `app/layout/withPost.tsx`
  - Wines layout: `app/layout/wines.tsx`
- **Feature Prefixes**: `notes/`, `auth/`, `image/`, `wines/`
- **Data Fetching**: Use custom `fetcher` utility (`app/lib/fetcher.ts`) and React Router loaders/actions.
- **Auth State**: Managed globally via root loader (`app/root.tsx`); passed via `Outlet` context.

## Deployment & Security

- **Platform**: Cloudflare Workers (configured in `wrangler.toml`).
- **Secrets**:
  - Local: `.dev.vars` (e.g., `API_BASE_URL`, `R2_BASE_URL`). Never commit secrets.
  - Production: Cloudflare/GitHub Secrets.
- **Deployment**: `npm run deploy` for manual deployment. CI deploys `main`.

## Workflow Guidelines

### Commit & Pull Requests
- **Commits**: Short, imperative (often Japanese), concise; add scope when useful.
- **Pull Requests**:
  - Target `main`.
  - Include summary (what/why), linked issues, screenshots/GIFs for UI, and validation steps.
  - Call out breaking changes and environment variables touched.
  - Open draft PRs early for collaboration.

### Testing
- **Status**: No dedicated test runner is currently configured.
- **Minimum Requirement**: Run `npm run typecheck` and validate loaders/actions in `npm run dev`.
- **Future**: If adding tests, use Vitest + React Testing Library under `app/**/__tests__/*.test.tsx`.

## Prohibited Actions

- **Do not modify** any components under `app/components/ui/` as they are automatically generated by shadcn.

## Tooling: Serena Command

- **Usage**: For code analysis and read-heavy tasks in Claude Code, use the `/serena` command.
- **Reference**: `.claude/commands/serena.md`

## Context & Specifications

Before making changes, consult:
- **REST API Context**: `context/PostNotel_API_Documentation.md`
- **Frontend Specification**: `context/PostNotel_Frontend_Specification.md`
