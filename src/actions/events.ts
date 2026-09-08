"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEventAccess, requireRole } from "@/lib/auth";
import { eventDetailsSchema, slugify } from "@/lib/validation";

export type EventFormState = { error?: string };

function readEventDetails(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const rawSlug = String(formData.get("slug") ?? "").trim();
  return {
    name,
    location: formData.get("location"),
    eventDate: formData.get("eventDate"),
    slug: rawSlug.length > 0 ? rawSlug : slugify(name),
  };
}

export async function createEventAction(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const user = await requireRole("PROMOTER");

  const parsed = eventDetailsSchema.safeParse(readEventDetails(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.event.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return { error: "That URL slug is already taken. Choose another." };
  }

  const event = await prisma.event.create({
    data: {
      name: parsed.data.name,
      location: parsed.data.location,
      eventDate: new Date(parsed.data.eventDate),
      slug: parsed.data.slug,
      promoterId: user.sub,
      activeSchedule: "PRACTICE",
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/events/${event.id}`);
}

export async function updateEventAction(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const user = await requireRole("PROMOTER");
  const eventId = String(formData.get("eventId") ?? "");
  const event = await requireEventAccess(eventId, user);

  const parsed = eventDetailsSchema.safeParse(readEventDetails(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (parsed.data.slug !== event.slug) {
    const existing = await prisma.event.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (existing) {
      return { error: "That URL slug is already taken. Choose another." };
    }
  }

  await prisma.event.update({
    where: { id: event.id },
    data: {
      name: parsed.data.name,
      location: parsed.data.location,
      eventDate: new Date(parsed.data.eventDate),
      slug: parsed.data.slug,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${parsed.data.slug}`);
  redirect(`/dashboard/events/${event.id}`);
}

export async function togglePublishAction(formData: FormData) {
  const user = await requireRole("PROMOTER");
  const eventId = String(formData.get("eventId") ?? "");
  const event = await requireEventAccess(eventId, user);

  await prisma.event.update({
    where: { id: event.id },
    data: { published: !event.published },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/events");
}

export async function deleteEventAction(formData: FormData) {
  const user = await requireRole("PROMOTER");
  const eventId = String(formData.get("eventId") ?? "");
  const event = await requireEventAccess(eventId, user);

  await prisma.$transaction([
    prisma.event.update({
      where: { id: event.id },
      data: { currentRaceId: null, currentPracticeId: null },
    }),
    prisma.event.delete({ where: { id: event.id } }),
  ]);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
