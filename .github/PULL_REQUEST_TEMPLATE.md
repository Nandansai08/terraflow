## Summary

Briefly describe the change and why it's needed.

## Related Issue

Closes #

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactor / chore (no behavior change)
- [ ] Performance improvement
- [ ] Breaking change

## Verification Checklist

- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] `npm run test:e2e` passes (or N/A — explain why below)
- [ ] `npm run build` passes
- [ ] `npm run format:check` passes
- [ ] Self-review completed (read your own diff before requesting review)
- [ ] Documentation updated (README, CONTRIBUTING, `docs/`) if setup, behavior, or env vars changed

<!-- If no UI changes, skip the items below -->

## Screenshots (UI changes only)

- [ ] Desktop screenshot attached
- [ ] Mobile screenshot attached
- [ ] Confirmed no layout overlap or unreadable text

## Database / Deployment Notes

- [ ] No Prisma schema changes
- [ ] Prisma schema changed — migration included and `npm run db:generate` / `npm run db:push` verified locally
- [ ] No new environment variables
- [ ] New environment variables — added to `.env.example` and documented in README
- [ ] No `docker-compose.yml` changes
- [ ] `docker-compose.yml` changed — explain impact below

## Product Checklist

- [ ] The globe remains central.
- [ ] Exploration before login is preserved.
- [ ] The change avoids dashboard-style complexity.
- [ ] Error states are clear and recoverable.

## Notes for Reviewers

Call out risky areas, follow-up work, anything intentionally left out, or specific files that need closer attention (e.g. auth/visibility logic, migrations, Cesium performance).
