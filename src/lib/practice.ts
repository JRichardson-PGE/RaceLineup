import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { practiceScheduleSchema } from "@/lib/validation";

type PracticeScheduleInput = z.infer<typeof practiceScheduleSchema>;

export async function replacePracticeSchedule(
  eventId: string,
  schedule: PracticeScheduleInput
) {
  await prisma.$transaction(async (tx) => {
    await tx.event.update({
      where: { id: eventId },
      data: { currentPracticeId: null },
    });
    await tx.practiceSession.deleteMany({ where: { eventId } });

    for (let i = 0; i < schedule.sessions.length; i++) {
      const session = schedule.sessions[i];
      await tx.practiceSession.create({
        data: {
          eventId,
          practiceNumber: session.practiceNumber,
          description: session.description,
          laps: session.durationType === "laps" ? session.laps : null,
          minutes: session.durationType === "minutes" ? session.minutes : null,
          position: i,
        },
      });
    }
  });
}

export async function advancePractice(eventId: string) {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: {
      practiceSessions: { orderBy: { position: "asc" }, select: { id: true } },
    },
  });

  const currentIndex = event.practiceSessions.findIndex(
    (p) => p.id === event.currentPracticeId
  );
  const nextIndex = currentIndex + 1;

  if (nextIndex >= event.practiceSessions.length) return;

  await prisma.event.update({
    where: { id: eventId },
    data: { currentPracticeId: event.practiceSessions[nextIndex].id },
  });
}

export async function moveBackPractice(eventId: string) {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: {
      practiceSessions: { orderBy: { position: "asc" }, select: { id: true } },
    },
  });

  const currentIndex = event.practiceSessions.findIndex(
    (p) => p.id === event.currentPracticeId
  );
  if (currentIndex <= 0) {
    await prisma.event.update({
      where: { id: eventId },
      data: { currentPracticeId: null },
    });
    return;
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { currentPracticeId: event.practiceSessions[currentIndex - 1].id },
  });
}

export async function restartPracticeSchedule(eventId: string) {
  await prisma.event.update({
    where: { id: eventId },
    data: { currentPracticeId: null },
  });
}

export async function setActiveSchedule(
  eventId: string,
  schedule: "PRACTICE" | "RACE"
) {
  await prisma.event.update({
    where: { id: eventId },
    data: { activeSchedule: schedule },
  });
}
