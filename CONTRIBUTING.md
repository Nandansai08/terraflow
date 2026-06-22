# Contributing to TerraFlow

Thanks for helping build TerraFlow, the Memory Layer of Earth. This project values small, clear, evidence-backed contributions that keep the globe central and make exploration feel effortless.

## Product Principles

- The globe is the homepage and the primary product surface.
- Exploration comes before login.
- Uploading should feel lightweight and fast.
- Avoid dashboard-style or SaaS-style UI unless it is truly necessary.
- Prefer stable root-cause fixes over cosmetic patches.
- Verify behavior before claiming a feature works.

## Development Setup

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run dev:api
npm run dev:web
```

On Windows PowerShell, use `npm.cmd` if standard `npm` commands are blocked by execution policy (for example, `npm.cmd install` or `npm.cmd run build`). This workaround avoids changing PowerShell execution policies globally:

```bash
npm.cmd install
npm.cmd run build
```

## Monorepo Workspace Structure

TerraFlow is an npm workspaces monorepo. Know which workspace you're touching before you start:

```text
apps/
  web/              Next.js app, Cesium globe, upload and profile UI
  api/              NestJS API, auth, posts, social graph, gateway, worker
packages/
  database/         Prisma schema and generated database client entrypoint
  shared/           Shared TypeScript types and constants
docs/               Product and contributor documentation
e2e/                Playwright end-to-end specs
```

Most root scripts accept a `--workspace=<path>` target (see `package.json`), for example `npm run build --workspace=apps/web`. If your change spans `packages/shared` or `packages/database`, rebuild those packages (`npm run build:shared`, `npm run db:generate`) before testing `apps/web` or `apps/api` against them.

## Branch Naming

Use short, descriptive branch names with a type prefix:

- `feat/search-empty-state`
- `fix/upload-error-message`
- `docs/setup-guide`
- `chore/dependency-bump`
- `test/posts-visibility`

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages, for example:

- `feat(web): add empty state to search results`
- `fix(api): verify optional JWT context before decoding`
- `docs: clarify GCS vs local storage fallback`
- `chore: bump prisma to 7.8.0`

This keeps history scannable and makes it easy to generate changelog entries.

## Choosing an Issue

Good first issues should be small and self-contained. Read the issue, comment that you would like to work on it, and wait for maintainer confirmation if someone else is already assigned.

Recommended first contributions:

- Documentation cleanup
- Small accessibility improvements
- Empty states and loading states
- Focused tests around existing services
- Minor UI polish with screenshots

## Issue Triage and Claiming Work

Use labels to find work that matches your experience and the area you want to
improve:

- `good first issue` and `beginner` for small, self-contained starter tasks
- `help wanted` when maintainers are actively inviting outside help
- `documentation`, `frontend`, `backend`, `testing`, `ui/ux`, `performance`,
  and `security` to filter by project area
- `blocked` and `needs reproduction` to spot issues that may need maintainer
  follow-up before code changes are useful

Before you start coding, leave a comment on the issue so maintainers and other
contributors know you plan to work on it. If the issue is already assigned or a
recent contributor comment shows someone is actively working on it, wait for a
maintainer response before opening a pull request.

Keep first pull requests tightly scoped. One issue, one focused change, and one
clear verification path are easier to review and merge.

## Pull Request Checklist

- [ ] The PR has a clear title and short summary.
- [ ] `npm run test` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run format:check` passes.
- [ ] `npm run build` passes.
- [ ] `npm run test:e2e` passes for changes affecting user-facing flows covered by `e2e/`.
- [ ] For visual or interaction changes on the globe homepage, verify behaviors against the [Globe Homepage QA Checklist](docs/qa/globe-homepage.md).
- [ ] UI changes include before/after screenshots or a short screen recording.
- [ ] API behavior changes include tests or a clear manual verification note.
- [ ] Documentation is updated when setup, behavior, or environment variables change.
- [ ] No secrets, credentials, generated local uploads, or unrelated files are committed.

## Code Style

- Use TypeScript for application code.
- Follow the existing Next.js and NestJS patterns.
- Keep components focused and avoid large unrelated refactors.
- Prefer clear names over comments. Add comments only when they explain non-obvious behavior.
- Keep user-facing copy concise and aligned with exploration and memory.

## Testing and Verification

Before opening a pull request, run:

```bash
npm run test
npm run lint
npm run format:check
npm run build
```

For changes that touch the guest exploration journey, upload flow, or other user-facing flows covered by `e2e/`, also run:

```bash
npm run test:e2e
```

Playwright will automatically start the web app (`npm run dev:web`) per `playwright.config.ts`; make sure the API and database are running first if the journey under test depends on them.

Verify that your changes conform to the [Performance Budgets & Cesium Loading Guide](docs/performance.md).

Run `npm run format` to automatically format files using Prettier before committing.

## Local Upload Files

When running the API locally, uploaded files may be created under `apps/api/public/uploads/`.

These files are development artifacts and should not be committed to Git. The repository's `.gitignore` is configured to ignore newly generated upload files.

If you want to remove local upload artifacts, you can safely preview and delete untracked files in the uploads directory:

```bash
# Preview what will be deleted first
git clean -ndX apps/api/public/uploads

# Then delete
git clean -fdX apps/api/public/uploads
```

Do not remove or modify any tracked files in this directory unless requested by a maintainer.

## Reporting Security Issues

Do not open public issues for vulnerabilities. Email or privately contact the maintainers with:

- Affected area
- Reproduction steps
- Impact
- Suggested fix, if known

## Code Review Process and Turnaround

- Maintainers aim to leave a first review on open pull requests within 72 hours.
- Expect at least one round of feedback on non-trivial PRs; small docs/copy fixes may be merged directly.
- CI (`.github/workflows/ci.yml`) must pass before merge: build, Prisma client generation, format check, lint, and tests.
- Reviewers focus on correctness, the product principles above, security (especially auth and visibility rules), and test coverage before style nitpicks.
- If a PR goes quiet for more than a week awaiting contributor changes, maintainers may close it with a note that it can be reopened when ready.

## Reporting Bugs vs. Requesting Features

- **Bugs**: something existing is broken or behaves incorrectly. Open an issue using the "Bug Report" template (`.github/ISSUE_TEMPLATE/bug_report.md`) with reproduction steps, expected vs. actual behavior, and environment details.
- **Features**: a new capability or enhancement that doesn't exist yet. Open an issue using the "Feature Request" template (`.github/ISSUE_TEMPLATE/feature_request.md`) describing the problem it solves, not just the solution.
- **Docs gaps**: missing or unclear documentation gets its own "Documentation Request" template (`.github/ISSUE_TEMPLATE/documentation_request.md`).
- When unsure which category applies, default to a bug report if current behavior is broken, otherwise use a feature request.

## Maintainer Response Expectations

Maintainers should review beginner PRs with actionable feedback, explain requested changes, and avoid expanding the scope after the PR is opened unless a correctness or safety issue requires it.

When triaging beginner-friendly issues, maintainers should confirm whether an
issue is still available, point contributors to the right labels or files when
needed, and keep review requests specific enough that a new contributor can act
on them without guessing.
