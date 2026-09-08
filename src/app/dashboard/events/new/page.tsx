import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewEventForm } from "@/components/NewEventForm";

export default async function NewEventPage() {
  const user = await requireRole("PROMOTER");

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
      <h1 className="text-2xl font-bold text-gray-900">New event</h1>
      <NewEventForm promoters={promoters} />
    </>
  );
}
