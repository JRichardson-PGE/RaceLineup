import Link from "next/link";
import { listPublishedEvents } from "@/lib/lineup";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function EventsPage() {
  const events = await listPublishedEvents();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upcoming Events</h1>
        <p className="text-sm text-gray-500">Pick an event to see its live race lineup.</p>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-gray-500">No events are published yet. Check back soon.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/events/${event.slug}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-400"
              >
                <p className="text-lg font-semibold text-gray-900">{event.name}</p>
                <p className="text-sm text-gray-500">
                  {event.location} &middot; {formatDate(event.eventDate)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
