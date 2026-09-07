"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEventAccess, requireRole } from "@/lib/auth";
import {
  advanceRace,
  moveBackRace,
  replaceLineup,
  restartLineup,
} from "@/lib/lineup";
import { lineupSchema } from "@/lib/validation";

export type LineupFormState = { error?: string };

export async function saveLineupAction(
  _prevState: LineupFormState,
  formData: FormData
): Promise<LineupFormState> {
  const user = await requireRole("PROMOTER");
  const eventId = String(formData.get("eventId") ?? "");
  const event = await requireEventAccess(eventId, user);

  const raw = String(formData.get("lineup") ?? "");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { error: "Something went wrong reading the lineup. Please try again." };
  }

  const parsed = lineupSchema.safeParse(json);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid lineup." };
  }

  await replaceLineup(event.id, parsed.data);

  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${event.slug}`);
  redirect(`/dashboard/events/${event.id}`);
}

async function withEventAccess(formData: FormData) {
  const user = await requireRole("PROMOTER");
  const eventId = String(formData.get("eventId") ?? "");
  return requireEventAccess(eventId, user);
}

export async function advanceRaceAction(formData: FormData) {
  const event = await withEventAccess(formData);
  await advanceRace(event.id);
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${event.slug}`);
}

export async function moveBackRaceAction(formData: FormData) {
  const event = await withEventAccess(formData);
  await moveBackRace(event.id);
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${event.slug}`);
}

export async function restartLineupAction(formData: FormData) {
  const event = await withEventAccess(formData);
  await restartLineup(event.id);
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${event.slug}`);
}
