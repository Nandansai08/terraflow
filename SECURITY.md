# Security Policy

TerraFlow stores geolocated memories, media uploads, and social-graph data (follows, messages, notifications) for real users across public, friends-only, and private visibility tiers. Please help us protect that data by disclosing vulnerabilities responsibly.

## Supported Versions

Only the latest code on the `main` branch is actively maintained and receives security fixes.

| Version             | Supported |
| ------------------- | --------- |
| `main`              | ✅ Yes    |
| Older tags/releases | ❌ No     |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Email **security@terraflow.app** with:

1. A description of the issue and its potential impact.
2. Step-by-step reproduction instructions.
3. The affected app/package and file (e.g. `apps/api/src/**`, `apps/web/**`, `packages/database/prisma/schema.prisma`).
4. Your name/handle if you'd like credit once the fix ships.

We will acknowledge receipt within **48 hours** and aim to provide an initial assessment within **5 business days**. Please allow a reasonable window to fix the issue before any public disclosure.

## What Qualifies as a Security Issue

Examples of in-scope reports for TerraFlow:

- **Visibility bypass** — viewing a `Post` marked `FRIENDS_ONLY` or `PRIVATE` without the required relationship/ownership, including via the spatial explore API or H3-clustered discovery endpoints.
- **Auth/session flaws** — JWT forgery or replay, Passport/OAuth (Google) misconfiguration, session fixation, or privilege escalation between a guest (pre-login) and an authenticated user.
- **Geolocation/PII exposure** — leaking a user's precise coordinates, travel history, or `TravelStats` beyond what their chosen visibility setting permits.
- **Media upload abuse** — path traversal or unauthorized access in the local-filesystem upload fallback, or misconfigured Google Cloud Storage bucket permissions/signed URLs.
- **Messaging/notification leaks** — reading another user's `Message` or `Notification` records, or triggering notifications to unintended recipients.
- **NestJS API injection** — unsanitized input reaching Prisma queries, Socket.IO event handlers, or BullMQ job payloads that could manipulate queries or trigger unintended jobs.
- **Report/moderation bypass** — circumventing the `Report` model's intended moderation flow to hide abuse or unpublish another user's content without authorization.

Out of scope: missing rate limiting on public, unauthenticated discovery endpoints; lack of CSRF protection on read-only GET routes.

## Responsible Disclosure Guidelines

If you follow these guidelines we will not pursue legal action and will credit you (if desired) once the fix is released:

- Give us a reasonable amount of time to resolve the issue before making it public.
- Do not access, modify, or delete data belonging to other users beyond what's needed to demonstrate the vulnerability.
- Avoid privacy violations, service disruption (no load/DDoS testing against shared infrastructure), spam, or social engineering of maintainers/users.

## Security Best Practices for Contributors

- Never commit `.env` files, database URLs, JWT secrets, Google OAuth client secrets, or GCS service-account keys — use `.env.example` as the template.
- Any Prisma query filtered by `visibility`, ownership, or the social graph (follows/friends) must enforce that filter at the query level, not just in the UI.
- New Socket.IO events and BullMQ job handlers must validate their payload shape and the caller's authorization before acting on it.
- Run `npm audit` periodically across workspaces and address high/critical findings.
