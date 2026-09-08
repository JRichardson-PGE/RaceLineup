import { notFound } from "next/navigation";
import { requireEventAccess, requireUser } from "@/lib/auth";
import { getEventById } from "@/lib/lineup";
import { prisma } from "@/lib/prisma";
import { EditEventForm } from "@/components/EditEventForm";
import { deleteEventAction } from "@/actions/events";

export default async function EditEventPage({
  params,
}: PageProps<"/dashboard/events/[id]/edit">) {
  const { id } = await params;
  const user = await requireUser();
  await requireEventAccess(id, user);
  const event = await getEventById(id);

  if (!event) notFound();

  const promoters =
    user.role === "ADMIN"
      ? await prisma.user.findMany({
          where: { role: "PROMOTER" },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
      : null;

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Edit event</h1>
      <EditEventForm event={event} promoters={promoters} />

      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
        <h2 className="text-sm font-semibold text-red-800">Danger zone</h2>
        <p className="mt-1 text-sm text-red-700">
          Deleting an event permanently removes its full lineup. This cannot
          be undone.
        </p>
        <form action={deleteEventAction} className="mt-2">
          <input type="hidden" name="eventId" value={event.id} />
          <button
            type="submit"
            className="rounded-md border border-red-400 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            Delete event
          </button>
        </form>
      </div>
    </>
  );
}
