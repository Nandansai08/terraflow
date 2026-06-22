#!/usr/bin/env node
/**
 * Bulk-creates the TerraFlow starter issue set via the GitHub REST API.
 * Safe to re-run: skips any issue whose title already exists (open or closed).
 *
 * Usage:
 *   GITHUB_TOKEN=xxx REPO_OWNER=Nandansai08 REPO_NAME=terraflow node scripts/create-issues.mjs
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const DELAY_MS = 500;

if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
  console.error('Missing required env vars. Need GITHUB_TOKEN, REPO_OWNER, REPO_NAME.');
  process.exit(1);
}

const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

const HEADERS = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
};

const issues = [
  // ---------- Good First Issues ----------
  {
    title: 'Add a loading skeleton for the globe while Cesium initializes',
    body: `## Description
On a slow connection, the Cesium WebGL globe in \`apps/web\` shows a blank screen for a noticeable moment while the Cesium engine and base imagery load, with no loading indicator.

## Where to look
The globe-mounting component in \`apps/web\` (search for where \`@cesium/engine\` is initialized).

## Proposed Change
Show a lightweight loading state (e.g. a centered spinner or a subtle pulse over a placeholder Earth silhouette) until the Cesium viewer fires its ready/tiles-loaded event, then fade it out.

## Acceptance Criteria
- [ ] Loading state appears immediately on mount, before Cesium is ready
- [ ] Disappears once the globe is interactive
- [ ] No layout shift when the globe replaces the loading state
- [ ] Doesn't block guest exploration once ready (per the "explore before login" product principle)`,
    labels: ['good-first-issue', 'enhancement'],
    assignees: [],
  },
  {
    title: 'Show a relative timestamp ("2 days ago") on memory posts instead of a raw date',
    body: `## Description
Memory posts (the \`Post\` model) currently appear to show their \`createdAt\` as a raw/formatted date rather than a friendlier relative time, which is the convention most social/travel apps use for recent posts.

## Where to look
The post card / memory detail component in \`apps/web\` that renders \`Post.createdAt\`.

## Proposed Change
Render relative time for posts less than 7 days old (e.g. "3 hours ago", "2 days ago") and fall back to an absolute date for older posts. No new dependency should be required — this can be done with simple date-math.

## Acceptance Criteria
- [ ] Relative time shown for posts under 7 days old
- [ ] Absolute date (e.g. "Jun 14, 2026") shown for older posts
- [ ] Updates correctly across timezones (compute from UTC \`createdAt\`)`,
    labels: ['good-first-issue', 'enhancement'],
    assignees: [],
  },
  {
    title: 'Add a "copy link" action to shareable public memory posts',
    body: `## Description
Public (\`Visibility.PUBLIC\`) memory posts are meant to be discoverable and shareable, but there's no quick "copy link" action on a post — users have to copy the browser URL manually.

## Where to look
The post detail view in \`apps/web\` for public posts.

## Proposed Change
Add a share/copy-link button that copies the canonical post URL to the clipboard and shows a brief "Copied!" confirmation. Only show this action for posts with \`visibility: PUBLIC\`.

## Acceptance Criteria
- [ ] Button only appears on public posts
- [ ] Copies the correct canonical URL
- [ ] Shows a brief success confirmation, then reverts
- [ ] Gracefully handles \`navigator.clipboard\` being unavailable`,
    labels: ['good-first-issue', 'enhancement'],
    assignees: [],
  },
  {
    title: 'Add empty-state messaging for a user profile with zero published memories',
    body: `## Description
Visiting a profile page for a user who hasn't published any \`Post\` yet currently renders an empty content area with no explanation, which is confusing for both the profile owner and visitors.

## Where to look
The profile page component in \`apps/web\`.

## Proposed Change
Show a friendly empty state — different copy depending on whether the viewer is the profile owner ("Share your first memory") vs a visitor ("No public memories yet").

## Acceptance Criteria
- [ ] Distinct copy for owner vs visitor empty states
- [ ] Owner's empty state includes a CTA to publish
- [ ] No empty state flashes during the initial data-loading state (only after data confirms zero posts)`,
    labels: ['good-first-issue', 'enhancement'],
    assignees: [],
  },

  // ---------- Bug Reports ----------
  {
    title: 'H3 clustering can merge posts at adjacent zoom-boundary cells into the wrong cluster',
    body: `## Description
The spatial explore API uses H3 indexing (per \`packages/database/prisma/schema.prisma\`'s \`h3Index\` field and its compound index with \`visibility\`/\`createdAt\`) to cluster posts for globe-scale discovery. Posts that sit very close to an H3 cell boundary at a given resolution can be assigned to neighboring cells, causing visually adjacent memories on the globe to render as separate, sparse clusters instead of one combined cluster — or vice versa, a single cluster can appear to "jump" between resolutions as the user zooms.

## Steps to Reproduce
1. Publish two public posts with coordinates ~50 meters apart, straddling a likely H3 cell boundary at a mid-range resolution.
2. Load the globe explore view and zoom to a level where these posts should cluster together.
3. Observe cluster counts/positions as you zoom in and out across the resolution transition.

## Expected Behavior
Clustering should feel stable and not visibly "pop" or split nearby memories inconsistently as the user zooms.

## Actual Behavior
Clusters near cell boundaries can split or merge inconsistently depending on exact zoom level.

## Environment
- Component: \`apps/api\` spatial explore endpoint, \`h3Index\` usage
- Affects: globe explore view in \`apps/web\`

## Additional Context
Consider using a small set of adjacent H3 cells (k-ring) when aggregating near boundaries, or hysteresis when switching resolution bands.`,
    labels: ['bug', 'needs-triage'],
    assignees: [],
  },
  {
    title: 'FRIENDS visibility posts may be visible to non-mutual followers',
    body: `## Description
\`Visibility.FRIENDS\` posts should only be visible to users with a qualifying relationship (the \`Follow\` model) to the author, but it's unclear whether the API enforces mutual-follow ("friends") rather than one-directional follow when filtering \`FRIENDS\`-visibility posts in the explore/profile endpoints.

## Steps to Reproduce
1. User A follows User B, but User B does not follow User A back (one-directional).
2. User B publishes a post with \`visibility: FRIENDS\`.
3. User A views User B's profile or the explore feed.

## Expected Behavior
If "friends" means mutual follow, User A should NOT see the \`FRIENDS\`-visibility post. If "friends" is intentionally defined as one-directional follow, this should be explicitly documented.

## Actual Behavior
(To confirm during triage) The post may be visible to a one-directional follower, or the definition of "friends" may not match user expectations.

## Environment
- Component: \`apps/api\` post-visibility query logic, \`packages/database/prisma/schema.prisma\` \`Follow\`/\`Post\` models

## Additional Context
This is a privacy-sensitive bug — please prioritize triage given the visibility model is core to TerraFlow's trust model.`,
    labels: ['bug', 'needs-triage'],
    assignees: [],
  },
  {
    title: 'MemoryCapsule UNLOCKED status check does not account for server/client clock skew',
    body: `## Description
The \`MemoryCapsule\` model has a \`CapsuleStatus\` enum (\`LOCKED\`/\`UNLOCKED\`), implying capsules unlock at a scheduled future date. If the unlock check happens client-side against the browser's local clock, a user with a fast/slow system clock could see a capsule unlock early or stay locked past its intended time.

## Steps to Reproduce
1. Create a memory capsule scheduled to unlock at a specific future timestamp.
2. Set the local system clock forward past that timestamp.
3. Reload the capsule view without the server having independently confirmed the unlock time.

## Expected Behavior
Unlock status should be authoritative from the server (or signed/verified time source), not trusted from the client's local clock.

## Actual Behavior
(To confirm during triage) Capsule may report as unlocked purely based on client-side time comparison.

## Environment
- Component: \`apps/api\` capsule status endpoint, \`apps/web\` capsule view

## Additional Context
If the check is already server-side, please close as not-a-bug and add a regression test asserting client clock manipulation has no effect.`,
    labels: ['bug', 'needs-triage'],
    assignees: [],
  },

  // ---------- Feature Requests ----------
  {
    title: 'Add a "Saved" collections view backed by the existing SavedPost model',
    body: `## Problem Statement
\`packages/database/prisma/schema.prisma\` already defines a \`SavedPost\` model, implying save/bookmark functionality is planned, but there doesn't appear to be a dedicated UI surface (a "Saved" tab/page) where a user can browse everything they've saved.

## Proposed Solution
Add a "Saved" page under the user's profile area in \`apps/web\` that lists all posts referenced by the current user's \`SavedPost\` rows, reusing the existing post-card component used elsewhere on the globe/profile views.

## Alternatives Considered
- Surfacing saved posts only as a filter on the explore globe — less discoverable than a dedicated page for revisiting saved memories later.

## Additional Context
Backend likely just needs a paginated \`GET /users/me/saved\` endpoint if one doesn't already exist; the schema/data model is already in place.

## Priority
- [x] priority:medium`,
    labels: ['enhancement', 'feature-request'],
    assignees: [],
  },
  {
    title: 'Build a direct messaging UI on top of the existing Message model',
    body: `## Problem Statement
The \`Message\` model and Socket.IO/Gateway infrastructure exist in \`apps/api\`, suggesting messaging is intended, but per the README this is listed as a data model "ready for expansion" rather than a shipped feature with a UI.

## Proposed Solution
Build a minimal direct-messaging surface in \`apps/web\`: a conversation list, a thread view, and real-time delivery via the existing Socket.IO gateway, backed by the existing \`Message\` Prisma model.

## Alternatives Considered
- Comment-only interaction (already exists via \`Comment\` model) — insufficient for private trip-planning conversations between travelers, which is a natural use case for this product.

## Additional Context
Should respect blocking/visibility rules consistent with the \`Follow\`/\`Report\` models (e.g. don't allow messaging from a blocked or reported user).

## Priority
- [x] priority:medium`,
    labels: ['enhancement', 'feature-request'],
    assignees: [],
  },
  {
    title: 'Add a "Travel Stats" dashboard surface backed by the existing TravelStats model',
    body: `## Problem Statement
\`TravelStats\` already exists in the Prisma schema, but there's no visible product surface showing a user their own aggregated travel stats (countries visited, distance traveled, memories published over time) — a natural fit for a "Memory Layer of Earth" product.

## Proposed Solution
Add a stats summary card to the user's profile (visible to the owner, and optionally to others if the underlying posts are public) rendering data from \`TravelStats\`, with simple visualizations (e.g. a small bar/line chart of memories per year, count of distinct countries).

## Alternatives Considered
- A separate full dashboard page — bigger lift; starting with a profile summary card is a good incremental step that doesn't compromise the "globe stays primary" product principle from CONTRIBUTING.md.

## Additional Context
Should be computed/cached server-side in \`apps/api\` (likely via a BullMQ job) rather than recomputed on every profile view.

## Priority
- [x] priority:low`,
    labels: ['enhancement', 'feature-request'],
    assignees: [],
  },
  {
    title: 'Add in-app notification center backed by the existing Notification model',
    body: `## Problem Statement
The \`Notification\` model exists in the schema, but per the README it's described as "ready for expansion" rather than a shipped feature — there's no notification bell/center in \`apps/web\` today for likes, comments, follows, or capsule unlocks.

## Proposed Solution
Add a notification bell in the web app's header that shows unread count and a dropdown/list of recent \`Notification\` rows, with real-time updates pushed via the existing Socket.IO gateway when new notifications are created (e.g. on \`Like\`, \`Comment\`, \`Follow\`, or \`MemoryCapsule\` unlock events).

## Alternatives Considered
- Email-only notifications — lower effort but misses the real-time, in-session engagement this product's social features (likes/comments/follows) are built for.

## Additional Context
Should integrate with the BullMQ worker (\`apps/api\`) for any notification types that require scheduled delivery (e.g. capsule unlock reminders).

## Priority
- [x] priority:low`,
    labels: ['enhancement', 'feature-request'],
    assignees: [],
  },

  // ---------- Documentation Issues ----------
  {
    title: 'Document the difference between local filesystem and Google Cloud Storage upload modes',
    body: `## Which doc is missing or unclear?
The README mentions "Geolocated media uploads with local filesystem fallback and optional Google Cloud Storage" but doesn't document which environment variables switch between the two modes, what GCS IAM permissions/bucket setup are required, or how uploaded media URLs differ between the two modes.

## What should it cover?
- The exact env var(s) that select local-filesystem vs GCS mode in \`apps/api\`
- Required GCS bucket/service-account setup steps for contributors who want to test the GCS path
- How \`Media\` URLs differ between modes, and any implications for the web app's image rendering

## Who would benefit?
Contributors working on media upload, profile photos, or post attachments who currently have to read \`apps/api\` source to understand the storage abstraction.`,
    labels: ['documentation'],
    assignees: [],
  },
  {
    title:
      'Document the Visibility enum semantics (PUBLIC / FRIENDS / PRIVATE) and how "friends" is defined',
    body: `## Which doc is missing or unclear?
\`docs/architecture.md\` (per the README) maps UI actions to API routes, but there's no clear product/contributor-facing doc explaining the exact semantics of each \`Visibility\` enum value — in particular, whether \`FRIENDS\` requires mutual follow or one-directional follow (directly related to the bug filed above about possible FRIENDS visibility leakage).

## What should it cover?
- Precise definition of each visibility tier and who can see a post under each
- How visibility interacts with the explore/discovery API (e.g. are PRIVATE posts ever included in H3 clustering responses, even anonymized?)
- Expected behavior when a user's relationship to the author changes after a post was published (e.g. unfollow)

## Who would benefit?
Contributors implementing or reviewing any visibility-sensitive feature (messaging, notifications, saved posts, explore API) who need a single source of truth instead of inferring behavior from code.`,
    labels: ['documentation'],
    assignees: [],
  },

  // ---------- Refactor / Tech Debt ----------
  {
    title: 'Extract H3 clustering logic in the explore API into a dedicated, testable module',
    body: `## Description
The spatial explore API's H3-based clustering logic (using the \`h3Index\`/\`visibility\`/\`createdAt\` compound index per \`packages/database/prisma/schema.prisma\`) appears to live inline within the NestJS controller/service handling explore requests in \`apps/api\`, making it hard to unit test clustering behavior independent of HTTP and database concerns.

## Motivation
The boundary-clustering bug filed above is exactly the kind of issue that's hard to verify as fixed without isolated unit tests against known coordinate sets.

## Proposed Change
- Extract clustering logic into a pure, injectable service (e.g. \`H3ClusterService\`) under \`apps/api\` that takes a list of \`{lat, lng, ...}\` points and a target resolution, and returns cluster groupings.
- Add unit tests covering boundary cases (points straddling adjacent H3 cells at multiple resolutions).
- Keep the controller/service thin — fetch posts, delegate to \`H3ClusterService\`, shape the response.

## Acceptance Criteria
- [ ] No behavior change for the common case
- [ ] Clustering logic has unit tests independent of the database/HTTP layer
- [ ] Existing explore API integration tests (if any) still pass`,
    labels: ['chore'],
    assignees: [],
  },
  {
    title: 'Add Playwright e2e coverage for the public, friends-only, and private visibility paths',
    body: `## Description
The repo already has Playwright configured (\`playwright.config.ts\`, \`e2e/\`, and a \`test:e2e\` script), but it's unclear whether there is e2e coverage specifically asserting that \`Visibility.PRIVATE\` and \`Visibility.FRIENDS\` posts are correctly hidden from unauthorized viewers — this is the single most security-sensitive behavior in the product.

## Motivation
Given the visibility bug filed above, regression coverage here protects against silently reintroducing a privacy leak in future refactors of the explore/profile/post APIs.

## Proposed Change
- Add e2e tests (or expand existing ones in \`e2e/\`) that, for each \`Visibility\` tier, assert: the owner can see their own post, an authorized viewer (mutual friend, for \`FRIENDS\`) can see it, and an unauthorized viewer (stranger, or one-directional follower if that's confirmed not to qualify) cannot see it via profile, explore, or direct post-URL access.
- Wire these into CI (\`.github/workflows/ci.yml\`) so they run on every PR touching \`apps/api\` post/visibility code.

## Acceptance Criteria
- [ ] New e2e tests cover all three visibility tiers from both an authorized and unauthorized viewer's perspective
- [ ] Tests fail clearly if a visibility regression is introduced
- [ ] CI runs these tests on relevant PRs`,
    labels: ['chore'],
    assignees: [],
  },
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchExistingTitles() {
  const titles = new Set();
  let page = 1;

  while (true) {
    const res = await fetch(`${API_BASE}/issues?state=all&per_page=100&page=${page}`, {
      headers: HEADERS,
    });

    if (!res.ok) {
      throw new Error(`Failed to list existing issues: ${res.status} ${await res.text()}`);
    }

    const batch = await res.json();
    if (batch.length === 0) break;

    for (const issue of batch) {
      titles.add(issue.title);
    }

    if (batch.length < 100) break;
    page += 1;
  }

  return titles;
}

async function createIssue(issue) {
  const res = await fetch(`${API_BASE}/issues`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      title: issue.title,
      body: issue.body,
      labels: issue.labels,
      assignees: issue.assignees,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}

async function main() {
  console.log(`Fetching existing issues for ${REPO_OWNER}/${REPO_NAME}...`);
  const existingTitles = await fetchExistingTitles();
  console.log(`Found ${existingTitles.size} existing issue(s).`);

  for (const issue of issues) {
    if (existingTitles.has(issue.title)) {
      console.log(`SKIP (duplicate): "${issue.title}"`);
      continue;
    }

    try {
      const created = await createIssue(issue);
      console.log(`CREATED #${created.number}: ${created.html_url}`);
    } catch (err) {
      console.error(`FAILED: "${issue.title}" — ${err.message}`);
    }

    await sleep(DELAY_MS);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
