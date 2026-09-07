# RaceLineup

A mobile-friendly web app for race promoters to publish and run a live race
lineup. Public visitors pick an event and see the schedule with the current
and next-up race highlighted, refreshing automatically. Promoters build the
lineup (races, gate drops, classes) and drive it live during the event
(advance / move back / restart). Admins do everything a promoter can, plus
create promoter accounts and see every event in the system.

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
- `src/app/dashboard` — promoter/admin area: manage events, edit the lineup,
  and the live control panel (advance/back/restart). `dashboard/admin` is
  admin-only (promoter account creation, all-events view).
- `src/actions` — Server Actions (mutations); `src/lib` — data access,
  session/auth, validation.
- `prisma/schema.prisma` — data model (`User`, `Event`, `Race`, `GateDrop`,
  `ClassEntry`).

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
