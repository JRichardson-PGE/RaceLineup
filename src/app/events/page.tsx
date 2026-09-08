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
  promoter: { name: string };
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
          {event.location} &middot; {formatDate(event.eventDate)} &middot;{" "}
          {event.promoter.name}
        </p>
      </Link>
    </li>
  );
}

export default async function EventsPage({
  searchParams,
}: PageProps<"/events">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";

  const events = await listEventsPublic(query || undefined);
  const { upcoming, past } = partitionEventsByDate(events);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upcoming Events</h1>
        <p className="text-sm text-gray-500">
          Pick an event to see its live race lineup.
        </p>
      </div>

      <form method="get" className="flex items-center gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by event or promoter name"
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900"
        />
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Search
        </button>
        {query && (
          <Link
            href="/events"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            Clear
          </Link>
        )}
      </form>

      {events.length === 0 ? (
        <p className="text-sm text-gray-500">
          {query
            ? `No events found matching "${query}".`
            : "No upcoming events yet. Check back soon."}
        </p>
      ) : (
        <>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming events.</p>
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
        </>
      )}
    </main>
  );
}
