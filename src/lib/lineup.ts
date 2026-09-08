import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { lineupSchema } from "@/lib/validation";

const eventScheduleInclude = {
  races: {
    orderBy: { position: "asc" as const },
    include: {
      gateDrops: {
        orderBy: { position: "asc" as const },
        include: {
          classEntries: true,
        },
      },
    },
  },
  practiceSessions: {
    orderBy: { position: "asc" as const },
  },
};

export type EventWithLineup = NonNullable<
  Awaited<ReturnType<typeof getEventById>>
>;

// Events more than this many days past their date auto-complete themselves
// (dropping out of public view) even if a promoter never clicks "Mark
// complete" — see autoCompletePastEvents.
const AUTO_COMPLETE_AFTER_DAYS = 3;

function autoCompleteCutoff(): Date {
  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  return new Date(todayUtc - AUTO_COMPLETE_AFTER_DAYS * 24 * 60 * 60 * 1000);
}

// Called at the top of every function that lists or fetches events, so an
// event's completed state is always up to date by the time it's read —
// there's no background job, so this lazily "catches up" on each request.
export async function autoCompletePastEvents(): Promise<void> {
  await prisma.event.updateMany({
    where: { completed: false, eventDate: { lt: autoCompleteCutoff() } },
    data: { completed: true },
  });
}

// True once an event is far enough past its date that autoCompletePastEvents
// would (re-)complete it on the next read — used to block "uncomplete",
// since un-completing one of these would just revert on the very next
// page load.
export function isPastAutoCompleteWindow(eventDate: Date): boolean {
  return eventDate.getTime() < autoCompleteCutoff().getTime();
}

export async function getEventById(id: string) {
  await autoCompletePastEvents();
  return prisma.event.findUnique({
    where: { id },
    include: eventScheduleInclude,
  });
}

export async function getEventBySlugPublic(slug: string) {
  await autoCompletePastEvents();
  return prisma.event.findFirst({
    where: { slug, published: true, completed: false },
    include: eventScheduleInclude,
  });
}

export async function getEventBySlugSummary(slug: string) {
  await autoCompletePastEvents();
  return prisma.event.findUnique({
    where: { slug },
    select: {
      name: true,
      location: true,
      eventDate: true,
      published: true,
      completed: true,
    },
  });
}

export async function listEventsForPromoter(promoterId: string) {
  await autoCompletePastEvents();
  return prisma.event.findMany({
    where: { promoterId },
    orderBy: { eventDate: "desc" },
  });
}

export async function listAllEvents(promoterNameFilter?: string) {
  await autoCompletePastEvents();
  return prisma.event.findMany({
    where: promoterNameFilter
      ? {
          promoter: {
            name: { contains: promoterNameFilter, mode: "insensitive" },
          },
        }
      : undefined,
    orderBy: { eventDate: "desc" },
    include: { promoter: { select: { name: true, email: true, username: true } } },
  });
}

export async function listEventsPublic(search?: string) {
  await autoCompletePastEvents();
  return prisma.event.findMany({
    where: {
      completed: false,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              {
                promoter: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: { eventDate: "desc" },
    include: { promoter: { select: { name: true } } },
  });
}

export function isPastEventDate(eventDate: Date): boolean {
  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  return eventDate.getTime() < todayUtc;
}

export function partitionEventsByDate<T extends { eventDate: Date }>(
  events: T[]
): { upcoming: T[]; past: T[] } {
  const upcoming: T[] = [];
  const past: T[] = [];

  for (const event of events) {
    (isPastEventDate(event.eventDate) ? past : upcoming).push(event);
  }

  upcoming.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  past.sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());

  return { upcoming, past };
}

type LineupInput = z.infer<typeof lineupSchema>;

export async function replaceLineup(eventId: string, lineup: LineupInput) {
  await prisma.$transaction(async (tx) => {
    await tx.event.update({
      where: { id: eventId },
      data: { currentRaceId: null },
    });
    await tx.race.deleteMany({ where: { eventId } });

    for (let raceIndex = 0; raceIndex < lineup.races.length; raceIndex++) {
      const race = lineup.races[raceIndex];
      const createdRace = await tx.race.create({
        data: {
          eventId,
          raceNumber: race.raceNumber,
          laps: race.laps,
          position: raceIndex,
        },
      });

      for (let gateIndex = 0; gateIndex < race.gateDrops.length; gateIndex++) {
        const gate = race.gateDrops[gateIndex];
        const createdGate = await tx.gateDrop.create({
          data: {
            raceId: createdRace.id,
            gateNumber: gate.gateNumber,
            position: gateIndex,
          },
        });

        await tx.classEntry.createMany({
          data: gate.classEntries.map((entry) => ({
            gateDropId: createdGate.id,
            className: entry.className,
            numRacers: entry.numRacers,
          })),
        });
      }
    }
  });
}

export async function advanceRace(eventId: string) {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: { races: { orderBy: { position: "asc" }, select: { id: true } } },
  });

  const currentIndex = event.races.findIndex((r) => r.id === event.currentRaceId);
  const nextIndex = currentIndex + 1;

  if (nextIndex >= event.races.length) return;

  await prisma.event.update({
    where: { id: eventId },
    data: { currentRaceId: event.races[nextIndex].id },
  });
}

export async function moveBackRace(eventId: string) {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: { races: { orderBy: { position: "asc" }, select: { id: true } } },
  });

  const currentIndex = event.races.findIndex((r) => r.id === event.currentRaceId);
  if (currentIndex <= 0) {
    await prisma.event.update({
      where: { id: eventId },
      data: { currentRaceId: null },
    });
    return;
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { currentRaceId: event.races[currentIndex - 1].id },
  });
}

export async function restartLineup(eventId: string) {
  await prisma.event.update({
    where: { id: eventId },
    data: { currentRaceId: null },
  });
}
