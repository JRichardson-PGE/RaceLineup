import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listAllEvents, listEventsForPromoter } from "@/lib/lineup";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const user = await requireUser();

  const events =
    user.role === "ADMIN"
      ? (await listAllEvents()).map((event) => ({
          ...event,
          promoterName: event.promoter.name,
        }))
      : (await listEventsForPromoter(user.sub)).map((event) => ({
          ...event,
          promoterName: null as string | null,
        }));

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

      {events.length === 0 ? (
        <p className="text-sm text-gray-500">
          No events yet. Create your first event to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/dashboard/events/${event.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-400"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-lg font-semibold text-gray-900">
                    {event.name}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                      event.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {event.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {event.location} &middot; {formatDate(event.eventDate)}
                  {event.promoterName ? ` · ${event.promoterName}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
