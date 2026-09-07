import Link from "next/link";
import { requireEventAccess, requireUser } from "@/lib/auth";
import { getEventById } from "@/lib/lineup";
import { togglePublishAction } from "@/actions/events";
import {
  advanceRaceAction,
  moveBackRaceAction,
  restartLineupAction,
} from "@/actions/lineup";
import { LineupTable } from "@/components/LineupTable";

function formatDate(date: Date) {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function EventControlPage({
  params,
}: PageProps<"/dashboard/events/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  await requireEventAccess(id, user);
  const event = await getEventById(id);

  if (!event) return null;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
          <p className="text-sm text-gray-500">
            {event.location} &middot; {formatDate(event.eventDate)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
              event.published
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {event.published ? "Published" : "Draft"}
          </span>
          <Link
            href={`/dashboard/events/${event.id}/edit`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Edit details
          </Link>
          <Link
            href={`/dashboard/events/${event.id}/lineup`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Edit lineup
          </Link>
          <form action={togglePublishAction}>
            <input type="hidden" name="eventId" value={event.id} />
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white"
            >
              {event.published ? "Unpublish" : "Publish"}
            </button>
          </form>
        </div>
      </div>

      {event.published && (
        <Link
          href={`/events/${event.slug}`}
          target="_blank"
          className="text-sm text-blue-600 hover:underline"
        >
          View public page &rarr;
        </Link>
      )}

      <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-4">
        <form action={moveBackRaceAction}>
          <input type="hidden" name="eventId" value={event.id} />
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            &larr; Move back
          </button>
        </form>
        <form action={advanceRaceAction}>
          <input type="hidden" name="eventId" value={event.id} />
          <button
            type="submit"
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Advance &rarr;
          </button>
        </form>
        <form action={restartLineupAction}>
          <input type="hidden" name="eventId" value={event.id} />
          <button
            type="submit"
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Restart lineup
          </button>
        </form>
      </div>

      <LineupTable races={event.races} currentRaceId={event.currentRaceId} />
    </>
  );
}
