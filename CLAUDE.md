@AGENTS.md

# RaceLineup

Next.js 16 (App Router) + Prisma 7 + PostgreSQL app for race promoters to
manage and broadcast live race/practice lineups. Deployed on a single AWS
EC2 instance (t4g.small, Graviton/ARM64) behind nginx + certbot in Docker
Compose, at `lineup.jakemoto.com` (Cloudflare DNS, DNS-only/grey-cloud).

**`README.md` is the primary source of truth** for features, architecture,
local dev setup, and the full deployment/backup/CI walkthroughs — it's kept
current as features land, so read it (not just the code) before assuming
how something works or is deployed. This file only covers working
conventions and non-obvious gotchas that don't belong in user-facing docs.

## Working conventions on this project

- **Before considering any change done**, run the full verification
  pipeline: `npx tsc --noEmit && npm run lint && npm run build`. This has
  caught real issues every time it's been skipped even briefly.
- **Commit and push to `master` directly** once verification passes —
  that's been the standing workflow for every change on this project so
  far (no long-lived feature branches). Still don't push destructive git
  operations (force-push, reset --hard, etc.) without asking.
- **Update `README.md` alongside the change**, in the same commit, when a
  change affects behavior it documents — it's meant to stay accurate, not
  just describe the app as it once was.
- **Never mutate the user's real/live event data during testing.** Use
  disposable, clearly-named test events (e.g. "Scroll Bug Test Event")
  created fresh for the test and explicitly deleted afterward. Viewing the
  user's real events read-only (e.g. a print page) during testing is fine.
- **The Browser pane's "hidden" state suspends `requestAnimationFrame`**,
  which silently breaks any `smooth`-behavior scroll animation mid-test —
  scrollTop just freezes. This has been mistaken for a real bug more than
  once. If a smooth-scroll test seems stuck, verify the underlying math is
  correct instead (e.g. temporarily swap in `behavior: "instant"`, or
  compute the expected final position directly via `getBoundingClientRect`)
  rather than assuming the feature is broken.

## Known gotchas

- **The session cookie is `Secure` in production** (`src/lib/auth.ts`), so
  it silently fails to persist over plain HTTP. If a user reports being
  logged out unexpectedly or unable to reach an authenticated page after a
  deploy, check whether HTTPS is actually serving correctly (valid cert,
  nginx's 443 block actually uncommented/configured — not just present in
  the repo's template) before assuming it's a role/permissions bug.
- **`next build` can OOM on the t4g.small instance** if run directly on it
  (`docker compose up -d --build`) — small instance, memory-hungry build.
  Either add swap (documented in README) or use the CI/ECR pipeline, which
  moves the build off-instance entirely.
- **`aws-actions/configure-aws-credentials` needs `sts:TagSession`** in the
  IAM role's trust policy, not just `sts:AssumeRoleWithWebIdentity` — it
  attaches GitHub context as session tags by default, and a trust policy
  missing `TagSession` fails with a misleading "Not authorized to perform
  sts:AssumeRoleWithWebIdentity" error that has nothing to do with the
  AssumeRole permission itself. Already fixed in the README's setup steps.
