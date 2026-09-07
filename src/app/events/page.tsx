import Link from "next/link";
import { listEventsPublic, partitionEventsByDate } from "@/lib/lineup";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

type PublicEvent = {
  id: string;
  slug: string;
  name: string;
  location: string;
  eventDate: Date;
  published: boolean;
};

function EventCard({ event }: { event: PublicEvent }) {
  return (
    <li>
      <Link
        href={`/events/${event.slug}`}
        className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-400"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-lg font-semibold text-gray-900">{event.name}</p>
          {!event.published && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-gray-500">
              Lineup not posted
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {event.location} &middot; {formatDate(event.eventDate)}
        </p>
      </Link>
    </li>
  );
}

export default async function EventsPage() {
  const events = await listEventsPublic();
  const { upcoming, past } = partitionEventsByDate(events);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upcoming Events</h1>
        <p className="text-sm text-gray-500">
          Pick an event to see its live race lineup.
        </p>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-sm text-gray-500">No upcoming events yet. Check back soon.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ul>
      )}

      {past.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          <h2 className="text-lg font-bold text-gray-900">Past Events</h2>
          <ul className="flex flex-col gap-3">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
