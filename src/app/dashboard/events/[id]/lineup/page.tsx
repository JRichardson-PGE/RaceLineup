import { notFound } from "next/navigation";
import { requireEventAccess, requireUser } from "@/lib/auth";
import { getEventById } from "@/lib/lineup";
import { LineupEditor } from "@/components/LineupEditor";
import { ScheduleUploadForm } from "@/components/ScheduleUploadForm";

export default async function EventLineupPage({
  params,
}: PageProps<"/dashboard/events/[id]/lineup">) {
  const { id } = await params;
  const user = await requireUser();
  await requireEventAccess(id, user);
  const event = await getEventById(id);

  if (!event) notFound();

  const initialRaces = event.races.map((race) => ({
    raceNumber: race.raceNumber,
    laps: race.laps,
    gateDrops: race.gateDrops.map((gate) => ({
      gateNumber: gate.gateNumber,
      classEntries: gate.classEntries.map((entry) => ({
        className: entry.className,
        numRacers: entry.numRacers,
      })),
    })),
  }));

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit lineup</h1>
        <p className="text-sm text-gray-500">{event.name}</p>
      </div>

      <ScheduleUploadForm eventId={event.id} />

      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        Or build it manually
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <LineupEditor eventId={event.id} initialRaces={initialRaces} />
    </>
  );
}
