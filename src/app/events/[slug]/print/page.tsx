import { notFound } from "next/navigation";
import { getEventBySlugPublic } from "@/lib/lineup";
import { PrintButton } from "@/components/PrintButton";
import { BackButton } from "@/components/BackButton";
import { LineupPrintTable } from "@/components/LineupPrintTable";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function PublicPrintLineupPage({
  params,
}: PageProps<"/events/[slug]/print">) {
  const { slug } = await params;
  const event = await getEventBySlugPublic(slug);

  if (!event) notFound();

  return (
    <div className="mx-auto max-w-3xl p-4 print:max-w-none print:p-0">
      <div className="no-print mb-4 flex gap-2">
        <BackButton />
        <PrintButton />
      </div>

      <h1 className="mb-1 text-xl font-bold text-gray-900">{event.name}</h1>
      <p className="mb-4 text-sm text-gray-600">
        {event.location} &middot; {formatDate(event.eventDate)}
      </p>

      <LineupPrintTable races={event.races} />
    </div>
  );
}
