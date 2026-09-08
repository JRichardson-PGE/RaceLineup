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
    promoterId: formData.get("promoterId") ?? undefined,
  };
}

async function resolvePromoterId(
  requestedPromoterId: string | undefined
): Promise<{ promoterId: string } | { error: string }> {
  if (!requestedPromoterId) {
    return { error: "Select a promoter to own this event." };
  }
  const promoter = await prisma.user.findUnique({
    where: { id: requestedPromoterId },
  });
  if (!promoter || promoter.role !== "PROMOTER") {
    return { error: "Select a valid promoter." };
  }
  return { promoterId: promoter.id };
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

  let promoterId = user.sub;
  if (user.role === "ADMIN") {
    const resolved = await resolvePromoterId(parsed.data.promoterId);
    if ("error" in resolved) return resolved;
    promoterId = resolved.promoterId;
  }

  const event = await prisma.event.create({
    data: {
      name: parsed.data.name,
      location: parsed.data.location,
      eventDate: new Date(parsed.data.eventDate),
      slug: parsed.data.slug,
      promoterId,
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

  let promoterId = event.promoterId;
  if (user.role === "ADMIN") {
    const resolved = await resolvePromoterId(parsed.data.promoterId);
    if ("error" in resolved) return resolved;
    promoterId = resolved.promoterId;
  }

  await prisma.event.update({
    where: { id: event.id },
    data: {
      name: parsed.data.name,
      location: parsed.data.location,
      eventDate: new Date(parsed.data.eventDate),
      slug: parsed.data.slug,
      promoterId,
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

export async function completeEventAction(formData: FormData) {
  const user = await requireRole("PROMOTER");
  const eventId = String(formData.get("eventId") ?? "");
  const event = await requireEventAccess(eventId, user);

  await prisma.event.update({
    where: { id: event.id },
    data: { completed: true },
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
