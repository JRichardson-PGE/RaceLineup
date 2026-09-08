import { notFound } from "next/navigation";
import { requireEventAccess, requireUser } from "@/lib/auth";
import { getEventById } from "@/lib/lineup";
import { prisma } from "@/lib/prisma";
import { EditEventForm } from "@/components/EditEventForm";

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
    </>
  );
}
