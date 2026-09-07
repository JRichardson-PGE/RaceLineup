import { notFound } from "next/navigation";
import { getEventBySlugPublic } from "@/lib/lineup";
import { PublicLineup } from "@/components/PublicLineup";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PublicEventPage({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlugPublic(slug);

  if (!event) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <div>
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
