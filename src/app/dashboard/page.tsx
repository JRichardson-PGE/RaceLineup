import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  listAllEvents,
  listEventsForPromoter,
  partitionEventsByDate,
} from "@/lib/lineup";
import { ExpandableEventList } from "@/components/ExpandableEventList";

const RECENT_PAST_DAYS = 30;

function isWithinPastDays(eventDate: Date, days: number): boolean {
  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  return eventDate.getTime() >= todayUtc - days * 24 * 60 * 60 * 1000;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

type DashboardEvent = {
  id: string;
  name: string;
  location: string;
  eventDate: Date;
  published: boolean;
  completed: boolean;
  promoterName: string | null;
};

function EventCard({ event }: { event: DashboardEvent }) {
  return (
    <li>
      <Link
        href={`/dashboard/events/${event.id}`}
        className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-400"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-lg font-semibold text-gray-900">{event.name}</p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
              event.published
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {event.published ? "Published" : "Draft"}
          </span>
          {event.completed && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-blue-700">
              Completed
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {event.location} &middot; {formatDate(event.eventDate)}
          {event.promoterName ? ` · ${event.promoterName}` : ""}
        </p>
      </Link>
    </li>
  );
}

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const user = await requireUser();
  const { promoter: promoterFilter } = await searchParams;
  const promoterFilterValue =
    typeof promoterFilter === "string" ? promoterFilter : "";

  const events: DashboardEvent[] =
    user.role === "ADMIN"
      ? (await listAllEvents(promoterFilterValue || undefined)).map(
          (event) => ({
            ...event,
            promoterName: event.promoter.name,
          })
        )
      : (await listEventsForPromoter(user.sub)).map((event) => ({
          ...event,
          promoterName: null,
        }));

  const { upcoming, past } = partitionEventsByDate(events);

  // Admins already have the promoter-name filter to narrow things down;
  // this recent-past default is specifically for a promoter's own list,
  // which otherwise accumulates every event they've ever run.
  const recentPast =
    user.role === "ADMIN"
      ? past
      : past.filter((event) => isWithinPastDays(event.eventDate, RECENT_PAST_DAYS));

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.role === "ADMIN" ? "All Events" : "Your Events"}
        </h1>
        <Link
          href="/dashboard/events/new"
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white"
        >
          New event
        </Link>
      </div>

      {user.role === "ADMIN" && (
        <form method="get" className="flex items-center gap-2">
          <input
            type="text"
            name="promoter"
            defaultValue={promoterFilterValue}
            placeholder="Filter by promoter name"
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900"
          />
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Filter
          </button>
          {promoterFilterValue && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Clear
            </Link>
          )}
        </form>
      )}

      {events.length === 0 ? (
        <p className="text-sm text-gray-500">
          {promoterFilterValue
            ? `No events found for promoters matching "${promoterFilterValue}".`
            : "No events yet. Create your first event to get started."}
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
              <h2 className="text-lg font-bold text-gray-900">
                Past Events
              </h2>
              <ExpandableEventList
                hiddenCount={past.length - recentPast.length}
                visible={
                  recentPast.length > 0 ? (
                    <ul className="flex flex-col gap-3">
                      {recentPast.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No events in the last {RECENT_PAST_DAYS} days.
                    </p>
                  )
                }
                hidden={
                  <ul className="flex flex-col gap-3">
                    {past.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </ul>
                }
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
