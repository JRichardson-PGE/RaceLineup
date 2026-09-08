import { notFound } from "next/navigation";
import { requireEventAccess, requireUser } from "@/lib/auth";
import { getEventById } from "@/lib/lineup";
import { PrintButton } from "@/components/PrintButton";
import { BackButton } from "@/components/BackButton";
import { LineupPrintTable } from "@/components/LineupPrintTable";
import { PrintQrCode } from "@/components/PrintQrCode";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function PrintLineupPage({
  params,
}: PageProps<"/dashboard/events/[id]/print">) {
  const { id } = await params;
  const user = await requireUser();
  await requireEventAccess(id, user);
  const event = await getEventById(id);

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

      <PrintQrCode path={`/events/${event.slug}`} />
    </div>
  );
}
