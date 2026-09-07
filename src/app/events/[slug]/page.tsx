import { notFound } from "next/navigation";
import { getEventBySlugPublic, getEventBySlugSummary } from "@/lib/lineup";
import { PublicLineup } from "@/components/PublicLineup";

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
        <div className="sticky top-0 z-10 -mx-4 bg-[var(--background)] px-4 pb-2">
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
          <p className="text-sm text-gray-500">
            {event.location} &middot; {formatDate(event.eventDate)}
          </p>
        </div>
        <PublicLineup
          slug={slug}
          initialRaces={event.races}
          initialCurrentRaceId={event.currentRaceId}
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
        <p className="text-base font-medium text-gray-700">
          The race lineup is not yet posted.
        </p>
        <p className="mt-1 text-sm text-gray-500">Check back soon.</p>
      </div>
    </main>
  );
}
