import { notFound } from "next/navigation";
import { requireEventAccess, requireUser } from "@/lib/auth";
import { getEventById } from "@/lib/lineup";
import { PracticeEditor } from "@/components/PracticeEditor";
import { PracticeScheduleUploadForm } from "@/components/PracticeScheduleUploadForm";

export default async function EventPracticePage({
  params,
}: PageProps<"/dashboard/events/[id]/practice">) {
  const { id } = await params;
  const user = await requireUser();
  await requireEventAccess(id, user);
  const event = await getEventById(id);

  if (!event) notFound();

  const initialSessions = event.practiceSessions.map((session) => ({
    practiceNumber: session.practiceNumber,
    description: session.description,
    durationType: (session.laps !== null ? "laps" : "minutes") as
      | "laps"
      | "minutes",
    laps: session.laps ?? 1,
    minutes: session.minutes ?? 10,
  }));

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit practice schedule
        </h1>
        <p className="text-sm text-gray-500">{event.name}</p>
      </div>

      <PracticeScheduleUploadForm eventId={event.id} />

      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        Or build it manually
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <PracticeEditor eventId={event.id} initialSessions={initialSessions} />
    </>
  );
}
