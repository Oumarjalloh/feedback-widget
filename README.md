# Feedback Widget

A multi-tenant SaaS for collecting feedback from your website visitors. Embed a single `<script>` tag on any site and start receiving feedback, isolated by project, persisted in PostgreSQL.

🔗 **Live demo:** https://feedback-widget-mu-gray.vercel.app

![Demo](./docs/demo.gif)

## Tech stack

- **Next.js 16** (App Router, Server Components, Server Actions, edge proxy)
- **TypeScript** end-to-end
- **Prisma 7** with `@prisma/adapter-pg` driver adapter
- **PostgreSQL** on Supabase (Transaction Pooler for runtime, Direct connection for migrations)
- **Auth.js v5** with GitHub OAuth provider, JWT session strategy
- **Tailwind CSS**, **Zod** for runtime validation
- Deployed on **Vercel**

## Features

- 🔐 GitHub OAuth authentication with edge-compatible middleware
- 🏢 Multi-tenant: each user creates projects, with strict data isolation enforced at the query layer
- 🔑 Auto-generated opaque API keys per project to identify incoming feedbacks
- 📦 Embeddable vanilla JS widget — no framework, no build, drops onto any site via a single `<script>` tag
- 🌐 Public API endpoint with CORS, Zod validation, and RESTful HTTP semantics
- 📬 Dashboard with feedback list, mark as read/unread, delete
- 🔒 IDOR-safe: every mutation re-checks ownership before executing
- ⚡ Server Components fetch data without API round-trips; Server Actions handle mutations

## Architecture

\`\`\`
[Browser on third-party site]
       │ <script src="/widget.js" data-key="...">
       ▼
[Widget injected into DOM]
       │ POST /api/feedback/[projectKey]  (cross-origin, Zod-validated)
       ▼
[Next.js API route on Vercel]
       │
       ▼
[Prisma 7 + adapter-pg]
       │
       ▼
[PostgreSQL on Supabase]
       ▲
       │ Server Components on /dashboard
       │
[Authenticated user via Auth.js + GitHub OAuth]
\`\`\`

## Key technical decisions

### Prisma 7 with driver adapter

Prisma 7 moved the connection URL out of `schema.prisma` into `prisma.config.ts`. At runtime, the client uses the `@prisma/adapter-pg` driver adapter with the Supabase pooled URL (`pgbouncer=true`); the CLI uses the direct connection for migrations. This is the modern, supported configuration — older `directUrl` patterns are being phased out.

### JWT sessions over database sessions

Auth.js supports both. Database sessions hit Postgres on every request to read the Session row; JWT sessions are stateless and stored in a signed cookie. For a serverless deployment on Vercel, avoiding a DB round-trip per request is a clear win. Trade-off: revoking a session before its TTL is harder, acceptable for this scope.

### Split Auth.js config (`auth.config.ts` vs `auth.ts`)

Next.js proxy/middleware runs on the Edge runtime, which doesn't support Prisma. The split lets the proxy import only the edge-safe parts (providers, callbacks) without pulling the Prisma adapter, while the main app still has full DB persistence.

### Multi-tenancy: defense in depth

Every Prisma query in user-facing code is filtered by `userId: session.user.id`. Every mutation re-fetches the target row to verify ownership before destructive operations. This protects against IDOR vulnerabilities even if request bodies are crafted maliciously.

### Embeddable widget without iframe

The widget is plain JS injected into the host page with all CSS rules marked `!important` and z-index in the high six digits to resist the host site's styles. Trade-off chosen vs iframe: simpler distribution (no postMessage bridge) at the cost of imperfect style isolation. Sufficient for the use case.

## Getting started

### Prerequisites

- Node.js 20+
- A Supabase project (free tier works)
- A GitHub OAuth App (callback: `http://localhost:3000/api/auth/callback/github`)

### Setup

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/feedback-widget.git
cd feedback-widget
npm install
cp .env.example .env
# Fill in your values, then:
npx prisma migrate dev
npm run dev
\`\`\`

Open http://localhost:3000.

### Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase pooled connection string (with `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase direct connection (port 5432), used by Prisma CLI |
| `AUTH_SECRET` | Generated via `npx auth secret` |
| `AUTH_GITHUB_ID` | GitHub OAuth App Client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App Client Secret |
| `NEXT_PUBLIC_APP_URL` | Canonical URL of the deployment (used in the install snippet) |

## Roadmap / what I'd build next

Deliberate omissions, in priority order:

- **Rate limiting** on `/api/feedback/[projectKey]` (Upstash Redis sliding window per IP and per project key)
- **Domain allowlist per project** — replace `Access-Control-Allow-Origin: *` with a per-project list set by the owner
- **Webhook delivery** — forward incoming feedbacks to Slack, Discord, or an arbitrary URL
- **Email digests** of unread feedbacks (Resend + Vercel cron)
- **E2E tests** with Playwright for the auth and submission flows
- **Type augmentation** for `Session.user.id` (currently the `session.user.id` field is added via a callback at runtime)
- **Separate Supabase project for production** — currently shares the dev DB; a real SaaS would isolate

## License

MIT