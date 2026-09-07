#!/bin/sh
set -e

echo "Applying database migrations..."

attempt=0
max_attempts=30
until npx prisma migrate deploy; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Database did not become ready in time. Giving up."
    exit 1
  fi
  echo "Migration attempt $attempt failed, retrying in 2s..."
  sleep 2
done

echo "Migrations applied. Starting app..."
exec "$@"
