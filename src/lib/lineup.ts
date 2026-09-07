import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { lineupSchema } from "@/lib/validation";

const lineupInclude = {
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
};

export type EventWithLineup = NonNullable<
  Awaited<ReturnType<typeof getEventById>>
>;

export function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: lineupInclude,
  });
}

export function getEventBySlugPublic(slug: string) {
  return prisma.event.findFirst({
    where: { slug, published: true },
    include: lineupInclude,
  });
}

export function getEventBySlugSummary(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    select: {
      name: true,
      location: true,
      eventDate: true,
      published: true,
    },
  });
}

export function listEventsForPromoter(promoterId: string) {
  return prisma.event.findMany({
    where: { promoterId },
    orderBy: { eventDate: "desc" },
  });
}

export function listAllEvents(promoterNameFilter?: string) {
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

export function listPublishedEvents() {
  return prisma.event.findMany({
    where: { published: true },
    orderBy: { eventDate: "desc" },
  });
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
