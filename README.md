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

Promoter/admin accounts sign in with either an email or a standalone
username (an admin can create a promoter with no email at all — useful for
accounts that shouldn't have self-service password reset). Admins can also
delete accounts (which deletes that promoter's events too), reset any
account's password, and filter the all-events view by promoter name. Every
logged-in user has a profile page (linked from their name in the header) to
change their own password or attach/update a recovery email.

Both the public and dashboard event lists split into "Upcoming" and "Past"
sections by date automatically. Each event's control panel — and the public
event page itself — has a "Print PDF" button that opens a print-ready,
letter-size table of the lineup (race/laps/gate/class/riders, grouped and
bordered by race, with headers repeating on each printed page); a "Back"
button on that page returns to wherever the visitor came from. The dashboard
control panel also has "Copy link" and "Show QR code" for sharing the public
page.

On the dashboard, the lineup is its own scrollable panel below the fixed
control buttons, auto-scrolling to the current race whenever it changes (and
back to the top on restart). On the public page, both the site's top nav bar
and the event's own header (name/location/date) are pinned in place
(`position: sticky`, stacked one below the other — see
`HeaderHeightObserver`, which keeps a `--site-header-height` CSS variable in
sync so the event header sits exactly below the nav bar regardless of its
height) while the lineup scrolls beneath them, and auto-scrolls to the
current race once when the page first loads.

Promoters can also set up a **practice schedule** — separate from the race
lineup — as a flat list of sessions (practice number, description, and a
duration of either laps or minutes), by hand or by uploading an Excel/CSV
file (same pattern as the race lineup upload, with its own template under
`public/templates/practice-schedule-template.*`). It has its own
advance/back/restart controls, run independently of the race lineup's
position. A toggle on the event control panel controls which one the public
page shows ("Public page is currently showing: ..."); the intended flow is
practice first, then "Switch to race lineup" once practice wraps up. The
public page picks up a schedule switch on its next 60s poll without a
reload.

On the promoter's control panel, the Practice and Race sections are each a
native `<details>` element that starts open for whichever schedule is
currently active and collapsed (with a "(not showing publicly)" note) for
the other — so a busy promoter isn't scrolling past controls for the
schedule that isn't running, but can still expand it to check something.
The advance/back/restart buttons for the inactive schedule are disabled,
both in the UI and (redundantly, for safety) in the Server Actions
themselves, which no-op if the schedule they target isn't the active one.

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

Visit `http://localhost:3000`. The seed command prints the admin email and
password it created (also configurable via `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` env vars) — sign in with it, then
create your own account under **Promoters** and consider removing the seed
account.

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
  directly).
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
- `src/lib/practice.ts` / `src/actions/practice.ts` mirror `lineup.ts` /
  `actions/lineup.ts` for the practice schedule (advance/back/restart,
  replacing the schedule, switching `activeSchedule`).
  `src/components/PublicSchedule.tsx` is the single public-facing component
  that renders whichever schedule is active and swaps on the next poll if a
  promoter switches it mid-visit.

## Deploying to an EC2 instance (Docker Compose)

This ships as three containers behind nginx: `nginx` (TLS + reverse proxy) →
`app` (Next.js) → `db` (Postgres), all defined in `docker-compose.yml`.

### 1. Launch and prepare the instance

- Launch an EC2 instance (Amazon Linux 2023 or Ubuntu 22.04+; a `t3.small` is
  plenty to start). Open inbound ports **22** (SSH), **80**, and **443** in
  its security group.
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
  sudo curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
    -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  ```

  (On Ubuntu, follow [Docker's Ubuntu install guide](https://docs.docker.com/engine/install/ubuntu/) instead of `dnf`.)

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

### 3. First launch (HTTP only)

```bash
docker compose up -d --build
docker compose logs -f app   # confirm migrations applied and it's Ready
```

The app container's entrypoint runs `prisma migrate deploy` automatically
before starting, so the database schema is created on first boot. Visit
`http://<your-domain-or-ip>/` to confirm it's up.

Create the first admin account:

```bash
docker compose exec app npx prisma db seed
```

Sign in with the printed credentials, then create your real account(s) under
**Promoters** and change/remove the seed admin.

### 4. Add HTTPS

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

### Redeploying after code changes

```bash
git pull
docker compose up -d --build
```

This rebuilds the `app` image and applies any new Prisma migrations
automatically on startup; `db` and `nginx` are left running.

## Known accepted risk

`npm audit` flags high-severity issues in `deepmerge-ts` and `mysql2`, both
transitive dependencies of the Prisma CLI's config loader (not used by the
running app, which only talks to Postgres via `pg`/`@prisma/adapter-pg`).
Fixing them requires downgrading to Prisma 6. Left as-is; revisit when Prisma
ships a patched 7.x.
