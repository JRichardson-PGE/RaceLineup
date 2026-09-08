import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlugPublic, getEventBySlugSummary } from "@/lib/lineup";
import { PublicSchedule } from "@/components/PublicSchedule";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function PublicEventPage({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlugPublic(slug);

  if (event) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
        <div className="sticky top-[var(--site-header-height)] z-10 -mx-4 bg-[var(--background)] px-4 pb-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {event.name}
              </h1>
              <p className="text-sm text-gray-500">
                {event.location} &middot; {formatDate(event.eventDate)}
              </p>
            </div>
            <Link
              href={
                event.activeSchedule === "PRACTICE"
                  ? `/events/${slug}/print/practice`
                  : `/events/${slug}/print`
              }
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Print PDF
            </Link>
          </div>
        </div>
        <PublicSchedule
          slug={slug}
          initialActiveSchedule={event.activeSchedule}
          initialRaces={event.races}
          initialCurrentRaceId={event.currentRaceId}
          initialPracticeSessions={event.practiceSessions}
          initialCurrentPracticeId={event.currentPracticeId}
        />
      </main>
    );
  }

  const summary = await getEventBySlugSummary(slug);
  if (!summary) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{summary.name}</h1>
        <p className="text-sm text-gray-500">
          {summary.location} &middot; {formatDate(summary.eventDate)}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        {summary.completed ? (
          <p className="text-base font-medium text-gray-700">
            This event has concluded.
          </p>
        ) : (
          <>
            <p className="text-base font-medium text-gray-700">
              The race lineup is not yet posted.
            </p>
            <p className="mt-1 text-sm text-gray-500">Check back soon.</p>
          </>
        )}
      </div>
    </main>
  );
}
