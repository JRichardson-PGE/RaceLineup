# RaceLineup

A mobile-friendly web app for race promoters to publish and run a live race
lineup. Public visitors pick an event and see the schedule with the current
race ("On Track") and next-up race ("On The Line") highlighted, refreshing
automatically. Promoters build the lineup (races, gate drops, classes) — by
hand, or by uploading an Excel/CSV schedule — and drive it live during the
event (advance / move back / restart). Admins do everything a promoter can,
plus create promoter accounts and see every event in the system.

Each race has a single lap count shared by every gate drop in it; a race can
have multiple gate drops, and each gate drop can list multiple classes.
Visiting an unpublished event's link shows "the race lineup is not yet
posted" rather than a 404, so promoters can safely share a link early.

Since admins don't own events themselves, creating or editing an event as
an admin adds a required **Promoter** dropdown (existing promoter accounts
only, not other admins) to assign or reassign ownership; a promoter editing
their own event doesn't see this field. Once a *published* event is over, a
promoter can click **Mark event complete** (with a confirmation) — its
public page then shows "This event has concluded" instead of the lineup,
and it drops off the public events list entirely (it still shows on the
dashboard, with a "Completed" badge); the button is hidden on unpublished
events, since there's nothing public to conclude yet. Events also complete
themselves automatically: anything more than 3 days past its date that
hasn't been marked complete gets flipped the next time anyone loads a page
that lists or fetches events (`autoCompletePastEvents` in `lib/lineup.ts`)
— there's no background job, so this is a lazy catch-up check rather than
a scheduled one. A completed event can be un-completed from the same
button, but only within that same 3-day window — `isPastAutoCompleteWindow`
gates the button (disabled, with a tooltip explaining why) and the server
action itself, since uncompleting an event past that window would just
have it auto-complete again on the very next page load. Every event's
control panel also has a "Danger zone" with a confirmed **Delete event**
button that permanently removes the event and its full lineup.

Promoter/admin accounts sign in with either an email or a standalone
username (an admin can create a promoter with no email at all — useful for
accounts that shouldn't have self-service password reset). Admins can also
delete accounts (which deletes that promoter's events too), reset any
account's password, and filter the all-events view by promoter name. Every
logged-in user has a profile page (linked from their name in the header) to
change their own password or attach/update a recovery email. Logged-in
users also see a **How to Use** link in the header pointing to `/guide` —
a self-contained, step-by-step promoter playbook covering the whole
workflow (create event, build schedule, run it live, share, wrap up),
served from the app itself rather than an external doc. It's public (no
login required to view it directly), just not linked from the header
until you're signed in. Its styling is entirely scoped under one `.guide`
wrapper class in `src/app/guide/guide.css` — deliberately not Tailwind,
so it can have its own distinct look (condensed display face, serif body,
warm parchment/gate-light palette with dark-mode support) without
touching or being touched by the rest of the app's styles.

Both the public and dashboard event lists split into "Upcoming" and "Past"
sections by date automatically, and both show the event's promoter name. On
a promoter's own dashboard, "Past Events" only shows the last 30 days by
default (a promoter running events for years otherwise ends up scrolling
past their entire history every time) — a "Show N more" button reveals the
rest without a page reload. Admins' "All Events" view isn't limited this
way, since the promoter-name filter already covers narrowing that list
down. The public list also has a search box (event name or promoter name,
case-insensitive `contains` match) via a `?q=` query param, mirroring the
dashboard's admin-only promoter filter (`?promoter=`). Each event's control
panel — and the public event page itself — has a "Print PDF" button that
opens a print-ready,
letter-size table of the lineup (race/laps/gate/class/riders, grouped and
bordered by race, with headers repeating on each printed page); a "Back"
button on that page returns to wherever the visitor came from. The dashboard
control panel also has "Copy link" and "Show QR code" for sharing the public
page. Every print page (dashboard and public, race and practice) also ends
with a `PrintQrCode` — a QR code plus the plain-text URL underneath,
pointing at the live public event page — so a printed sheet posted at the
track still gets someone to the current, up-to-date schedule. It's a
separate component from the dashboard's `EventQrCode` (which toggles
on/off and is marked `no-print`): this one always renders, since the whole
point is for it to end up on paper. On iPhone/iPad, tapping "Print PDF"
opens Safari's AirPrint sheet rather than a save dialog — there's no way to
detect from script whether a real printer is available, so `PrintButton`
sniffs iOS via `navigator.userAgent`/`navigator.platform` and shows a
one-time tip below the button ("tap the preview thumbnail, then pinch
outward to reveal Share → Save to Files") pointing at the actual (fairly
undiscoverable) gesture iOS requires to get a PDF out of that sheet.

On the dashboard, the lineup is its own scrollable panel below the fixed
control buttons, auto-scrolling to the current race whenever it changes (and
back to the top on restart). That auto-scroll deliberately doesn't use
`el.scrollIntoView()` — on a page taller than the viewport (any phone),
that call scrolls the whole page too, not just the panel, dragging the
fixed controls above it off-screen. `LineupFrame`/`PracticeFrame` instead
compute the target offset via `getBoundingClientRect()` and call
`container.scrollTo()` directly on the panel, so only the panel itself
ever moves — and it aligns the current item to the panel's top edge
(matching its own `p-4` padding) rather than centering it, so the item
lands in a consistent spot and doesn't hide upcoming ones below the fold.
On the public page, both the site's top nav bar
and the event's own header (name/location/date) are pinned in place
(`position: sticky`, stacked one below the other — see
`HeaderHeightObserver`, which keeps a `--site-header-height` CSS variable in
sync so the event header sits exactly below the nav bar regardless of its
height) while the lineup scrolls beneath them, and auto-scrolls to the
current race once when the page first loads. Below the `sm` breakpoint the
top nav itself collapses to just the logo and a hamburger button
(`MobileMenu`) — nav links and the account/sign-in area move into a dropdown
panel instead of wrapping across two or three lines, so a sticky header
doesn't eat a large chunk of a phone's vertical space. Because
`HeaderHeightObserver` measures the header's own box (not the dropdown,
which is `position: absolute` and doesn't affect it), `--site-header-height`
stays small on mobile and everything sticky below it still stacks correctly
whether the menu is open or not. The dropdown has no client-side router
listener to detect navigation; instead it closes itself by listening for
any click on a link or button inside the panel, which covers both `Link`
navigation and the sign-out submit button.

Promoters can also set up a **practice schedule** — separate from the race
lineup — as a flat list of sessions (practice number, description, and a
duration of either laps or minutes), by hand or by uploading an Excel/CSV
file (same pattern as the race lineup upload, with its own template under
`public/templates/practice-schedule-template.*`). It has its own
advance/back/restart controls, run independently of the race lineup's
position. A toggle on the event control panel controls which one the public
page shows ("Public page is currently showing: ..."); the intended flow is
practice first, then "Switch to race lineup" once practice wraps up — new
events are created with practice as the active schedule for exactly this
reason. The public page picks up a schedule switch on its next 60s poll
without a reload.

On the promoter's control panel, the Practice and Race sections are each a
native `<details>` element that starts open for whichever schedule is
currently active and collapsed (with a "(not showing publicly)" note) for
the other, and the active schedule's section is always rendered first (the
inactive one moves to the bottom) — so a busy promoter isn't scrolling past
controls for the schedule that isn't running, but can still expand it to
check something. The advance/back/restart buttons for the inactive schedule
are disabled, both in the UI and (redundantly, for safety) in the Server
Actions themselves, which no-op if the schedule they target isn't the
active one. `LineupTable`/`PracticeTable` (and their scrolling `Frame`
wrappers) take a `highlight` prop — the inactive schedule's current/next
race or session keeps its real position under the hood (so nothing is lost
when a promoter switches back), but its "On Track"/"On The Line" badges are
suppressed while it isn't the one actually running.

Each section also has its own "Print PDF" button — `PracticePrintTable` is
a flat practice-number/description/duration table, separate from the
race lineup's grouped `LineupPrintTable` — with matching print routes under
`print/practice`. Public visitors only ever see one Print PDF link (on the
event page itself), which points at whichever schedule is currently active.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · PostgreSQL
via Prisma 7 (driver adapter) · Custom email/password auth (JWT session
cookie, bcrypt) · Docker Compose (app + Postgres + nginx) for deployment.

## Local development

Requirements: Node.js 22+, Docker Desktop (for a local Postgres container).

```bash
npm install
docker compose -f docker-compose.dev.yml up -d   # starts local Postgres
npx prisma migrate dev                            # create/update tables
npx prisma db seed                                # creates an initial admin login
npm run dev
```

Visit `http://localhost:3000`. The seed command prints the admin username
and password it created (also configurable via `SEED_ADMIN_USERNAME` /
`SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` env vars — defaults are
`admin` / `changeme123`) — sign in with it, then create your own account
under **Promoters** and consider removing the seed account.

`.env` (already present locally, gitignored) holds `DATABASE_URL` and
`AUTH_SECRET` for local dev.

## How it's organized

- `src/app/events` — public pages (no login): pick an event, view its lineup.
- `src/app/api/lineup/[slug]` — JSON endpoint the public page polls every 60s.
- `src/app/login`, `src/proxy.ts` — auth; `proxy.ts` (Next 16's renamed
  middleware) guards everything under `/dashboard`.
- `src/app/dashboard` — promoter/admin area: manage events, edit the lineup
  (by hand or by uploading a schedule file), and the live control panel
  (advance/back/restart, copy link, QR code). `dashboard/admin` is
  admin-only (promoter account creation/deletion/password reset, all-events
  view). `dashboard/profile` is any logged-in user's own settings (password,
  recovery email).
- `src/lib/lineup.ts`'s `partitionEventsByDate` splits a list of events into
  upcoming (soonest first) and past (most recent first) using UTC date
  comparison — used by both the public and dashboard event lists.
- `src/lib/schedule-import.ts` — parses an uploaded `.xlsx`/`.csv` schedule
  (via `exceljs`/`papaparse`) into the lineup shape, matching column headers
  flexibly and validating that every gate drop within a race shares one lap
  count; also exports the shared `readRawRows` CSV/XLSX row reader used by
  `src/lib/practice-schedule-import.ts` (same idea, flat rows, requires
  exactly one of a "Minutes"/"Laps" column per row). `public/templates/`
  holds the downloadable templates promoters fill out; regenerate the
  `.xlsx` ones with `npm run generate:template` / `generate:practice-template`
  after changing their columns (the `.csv` ones are plain text, edit
  directly). `src/lib/schedule-export.ts` is the inverse — it builds the
  same column layout back out of the event's current races/practice
  sessions, so a downloaded file round-trips through the uploader
  unchanged. The "Edit lineup"/"Edit practice" pages expose it via
  `dashboard/events/[id]/lineup/export` and `.../practice/export` (auth-
  gated the same way as the page itself, `?format=xlsx` or `?format=csv`).
- `src/actions` — Server Actions (mutations); `src/lib` — data access,
  session/auth, validation.
- `prisma/schema.prisma` — data model (`User`, `Event`, `Race`, `GateDrop`,
  `ClassEntry`, `PracticeSession`). `laps` lives on `Race` since all of a
  race's gate drops run the same distance. `User.email` and `User.username`
  are both optional but at least one must be set (enforced in
  `createPromoterSchema`, not the DB). `Event.eventDate` is a date only
  (`@db.Date`), no time of day. `Event.activeSchedule` (`PRACTICE` | `RACE`,
  default `RACE`) picks which schedule the public page shows;
  `PracticeSession.laps`/`minutes` are both nullable and exactly one is set
  per session (enforced in `practiceSessionSchema`, not the DB).
  `Event.completed` gates public visibility (see above) independently of
  `published` — an event can be unpublished and completed at the same time.
- `src/lib/practice.ts` / `src/actions/practice.ts` mirror `lineup.ts` /
  `actions/lineup.ts` for the practice schedule (advance/back/restart,
  replacing the schedule, switching `activeSchedule`).
  `src/components/PublicSchedule.tsx` is the single public-facing component
  that renders whichever schedule is active and swaps on the next poll if a
  promoter switches it mid-visit.

## Deploying to an EC2 instance (Docker Compose)

This ships as three containers behind nginx: `nginx` (TLS + reverse proxy) →
`app` (Next.js) → `db` (Postgres), all defined in `docker-compose.yml`. The
`app` service's `image:` and `build:` keys both point at the same image name,
so `docker compose pull` (pre-built, see below) and `docker compose up
--build` (local build) both work without editing the file — whichever one
you run wins. The `Dockerfile`'s `runtime-deps` stage does a
`npm ci --omit=dev` install specifically for the shipped image, separate
from the full install `builder` uses for `next build` — that's what keeps
eslint/Tailwind/`@types/*` (build-only weight) out of the running container.

### 1. Launch and prepare the instance

- Launch an EC2 instance on a **Graviton (arm64)** type — `t4g.small` (2 GB)
  is the recommended minimum and costs about 20% less than the equivalent
  `t3.small` for the same specs. Use an arm64 AMI (Amazon Linux 2023 or
  Ubuntu 22.04+ both publish one). Open inbound ports **22** (SSH), **80**,
  and **443** in its security group.
- If you've set up the [CI/ECR pipeline](#continuous-deployment-github-actions-to-ecr)
  below, attach an IAM instance role granting `AmazonEC2ContainerRegistryReadOnly`
  (so the instance can `docker compose pull`) — see that section for the
  full policy if you're also doing backups from this instance.
- Point your domain's DNS `A` record at the instance's public IP (needed for
  the TLS step below).
- SSH in and install Docker:

  ```bash
  # Amazon Linux 2023
  sudo dnf install -y docker git
  sudo systemctl enable --now docker
  sudo usermod -aG docker $USER
  # log out and back in for the group change to apply, then:
  DOCKER_COMPOSE_VERSION=v2.32.1
  sudo mkdir -p /usr/local/lib/docker/cli-plugins
  sudo curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
  ```

  (`$(uname -m)` picks the right binary automatically — `aarch64` on
  Graviton, `x86_64` on Intel/AMD. This installs it as a CLI plugin — the
  `docker compose` subcommand used throughout this README, not the older
  standalone `docker-compose` — so it has to go in a plugin directory
  Docker actually scans, not just anywhere on `$PATH`. On Ubuntu, follow
  [Docker's Ubuntu install guide](https://docs.docker.com/engine/install/ubuntu/)
  instead of `dnf` — it installs the `docker-compose-plugin` package
  directly, so this manual step isn't needed there.)

### 2. Get the code onto the server and configure it

```bash
git clone <your-repo-url> racelineup
cd racelineup
cp .env.example .env
```

Edit `.env` and set real values:

- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` — Postgres credentials.
- `DATABASE_URL` — `postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@db:5432/<POSTGRES_DB>`
  (host is `db`, the Postgres service name — not `localhost`).
- `AUTH_SECRET` — a long random string, e.g. `openssl rand -base64 48`.
- `APP_IMAGE` — only needed if you're using the CI/ECR pipeline (see below);
  leave unset to build the image on the instance instead.

### 3. First launch (HTTP only)

The instance never has to run `next build` itself if you've set up the
[CI/ECR pipeline](#continuous-deployment-github-actions-to-ecr) — that's the
recommended path on a small instance, since a production build is the most
memory-hungry thing this project ever does:

```bash
aws ecr get-login-password --region <your-region> | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.<your-region>.amazonaws.com
docker compose pull
docker compose up -d
docker compose logs -f app   # confirm migrations applied and it's Ready
```

Without that pipeline, build locally on the instance instead (fine for a
`t4g.small`/2 GB instance; riskier on anything smaller):

```bash
docker compose up -d --build
docker compose logs -f app   # confirm migrations applied and it's Ready
```

Either way, the app container's entrypoint runs `prisma migrate deploy`
automatically before starting, so the database schema is created on first
boot. Visit `http://<your-domain-or-ip>/` to confirm it's up — don't sign in
yet, though (see the note at the start of step 4).

Create the first admin account:

```bash
docker compose exec app npx prisma db seed
```

This only prints credentials; hold onto them; you'll sign in with them
after HTTPS is set up in step 4, not now.

### 4. Add HTTPS

Do this before signing in for the first time: the session cookie is always
marked `Secure` in production, which browsers silently refuse to store over
plain HTTP — so signing in at the `http://` URL from step 3 won't actually
keep you logged in. Get a certificate first:

```bash
sudo docker run -it --rm \
  -v racelineup_certbot_certs:/etc/letsencrypt \
  -v racelineup_certbot_www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly --standalone -d your-domain.com
```

(Stop `nginx` first with `docker compose stop nginx` so port 80 is free for
the standalone challenge, then start it again afterward.) Then edit
`nginx/conf.d/default.conf`: uncomment the commented `server { listen 443 ssl; ... }`
block, replace `your-domain.com` with your real domain, and replace the
plain `location /` block in the port-80 server with a redirect to HTTPS
(both are marked in the file). Reload nginx:

```bash
docker compose restart nginx
```

Renew certificates periodically (e.g. a monthly cron job running the same
`certbot certonly` command, then `docker compose restart nginx`).

Now visit `https://your-domain.com`, sign in with the credentials from
step 3's seed command, and create your real account(s) under **Promoters**;
change or remove the seed admin once you have one.

### Redeploying after code changes

With the CI/ECR pipeline set up, a deploy is just a pull:

```bash
docker compose pull
docker compose up -d
```

Without it, rebuild on the instance as before:

```bash
git pull
docker compose up -d --build
```

Either way, Prisma migrations are applied automatically on startup; `db` and
`nginx` are left running.

## Continuous deployment (GitHub Actions to ECR)

`.github/workflows/docker-publish.yml` builds the app image (for both
`linux/amd64` and `linux/arm64`, so it works on Graviton) on every push to
`master` and pushes it to a private Amazon ECR repository. This moves the
one truly memory-hungry step — `next build` — off the EC2 instance entirely,
which matters more for a small instance's stability than any other single
change here. One-time setup:

1. **Create the ECR repository:**

   ```bash
   aws ecr create-repository --repository-name racelineup --region <your-region>
   ```

2. **Create a GitHub OIDC identity provider** in IAM (once per AWS account,
   skip if you already have one for other repos):

   ```bash
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --client-id-list sts.amazonaws.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
   ```

3. **Create an IAM role** GitHub Actions can assume, trusting only this repo
   (replace `<ACCOUNT_ID>` and `<github-username-or-org>`):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": {
         "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
       },
       "Action": "sts:AssumeRoleWithWebIdentity",
       "Condition": {
         "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
         "StringLike": { "token.actions.githubusercontent.com:sub": "repo:<github-username-or-org>/RaceLineup:*" }
       }
     }]
   }
   ```

   Attach a permissions policy to that role scoped to just this repository
   (push access to ECR):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       { "Effect": "Allow", "Action": "ecr:GetAuthorizationToken", "Resource": "*" },
       {
         "Effect": "Allow",
         "Action": [
           "ecr:BatchCheckLayerAvailability",
           "ecr:GetDownloadUrlForLayer",
           "ecr:BatchGetImage",
           "ecr:PutImage",
           "ecr:InitiateLayerUpload",
           "ecr:UploadLayerPart",
           "ecr:CompleteLayerUpload"
         ],
         "Resource": "arn:aws:ecr:<your-region>:<ACCOUNT_ID>:repository/racelineup"
       }
     ]
   }
   ```

4. **Set repository variables** in GitHub (Settings → Secrets and variables →
   Actions → Variables): `AWS_ROLE_ARN` (the role from step 3),
   `AWS_REGION`, and `ECR_REPOSITORY` (`racelineup`). No long-lived AWS keys
   are needed anywhere — OIDC issues short-lived credentials per run.

5. **On the EC2 instance**, attach an IAM instance role with the
   AWS-managed `AmazonEC2ContainerRegistryReadOnly` policy so it can pull,
   and set `APP_IMAGE=<ACCOUNT_ID>.dkr.ecr.<your-region>.amazonaws.com/racelineup:latest`
   in `.env`. ECR login tokens expire after 12 hours, so add a daily
   re-login to crontab (`crontab -e`):

   ```cron
   0 3 * * * aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<your-region>.amazonaws.com >> /home/ec2-user/ecr-login.log 2>&1
   ```

## Backups

The `db` container's data only exists on the instance's EBS volume — there's
no managed database with automated snapshots. `scripts/backup-db.sh` dumps
the database and uploads it to S3; it's cheap enough (a few cents a month
for a small event database) that there's no real reason to skip it.

1. **Create an S3 bucket** for backups and, optionally, a lifecycle rule to
   expire old backups (e.g. after 90 days) so storage cost doesn't grow
   unbounded.
2. **Add to the EC2 instance role** (the same role from step 5 above, or a
   new one) a policy scoped to that bucket:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": "s3:PutObject",
       "Resource": "arn:aws:s3:::<your-backup-bucket>/racelineup/*"
     }]
   }
   ```

3. **Make the script executable and add it to crontab** (paths relative to
   wherever you cloned the repo, e.g. `/home/ec2-user/racelineup`):

   ```bash
   chmod +x scripts/backup-db.sh
   crontab -e
   ```

   ```cron
   0 4 * * * BACKUP_S3_BUCKET=<your-backup-bucket> /home/ec2-user/racelineup/scripts/backup-db.sh >> /home/ec2-user/backup.log 2>&1
   ```

To restore a backup, download it and pipe it into `psql`:

```bash
aws s3 cp s3://<your-backup-bucket>/racelineup/<timestamp>.sql.gz - | \
  gunzip | docker compose exec -T db psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```

## Known accepted risk

`npm audit` flags high-severity issues in `deepmerge-ts` and `mysql2`, both
transitive dependencies of the Prisma CLI's config loader (not used by the
running app, which only talks to Postgres via `pg`/`@prisma/adapter-pg`).
Fixing them requires downgrading to Prisma 6. Left as-is; revisit when Prisma
ships a patched 7.x.

## License

[MIT](LICENSE)
