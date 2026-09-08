#!/bin/sh
# Nightly Postgres backup: dumps the `db` container's database and uploads
# it to S3. Meant to run via cron on the EC2 host, from the same directory
# as docker-compose.yml (see the "Backups" section of the README for setup).
#
# Required environment (set these in the crontab entry or a sourced file,
# not in .env — .env is loaded into the app container, this script isn't):
#   BACKUP_S3_BUCKET   e.g. my-racelineup-backups
# Optional:
#   BACKUP_S3_PREFIX   defaults to "racelineup"
set -eu

cd "$(dirname "$0")/.."

if [ -z "${BACKUP_S3_BUCKET:-}" ]; then
  echo "BACKUP_S3_BUCKET is not set; aborting." >&2
  exit 1
fi

PREFIX="${BACKUP_S3_PREFIX:-racelineup}"
TIMESTAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
TMP_FILE="$(mktemp)"

# shellcheck disable=SC1091
[ -f .env ] && . ./.env

cleanup() {
  rm -f "$TMP_FILE"
}
trap cleanup EXIT

echo "Dumping database..."
docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  | gzip > "$TMP_FILE"

DEST="s3://${BACKUP_S3_BUCKET}/${PREFIX}/${TIMESTAMP}.sql.gz"
echo "Uploading to $DEST..."
aws s3 cp "$TMP_FILE" "$DEST" --only-show-errors

echo "Backup complete: $DEST"
