"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEventAccess, requireRole } from "@/lib/auth";
import {
  advancePractice,
  moveBackPractice,
  replacePracticeSchedule,
  restartPracticeSchedule,
  setActiveSchedule,
} from "@/lib/practice";
import { practiceScheduleSchema } from "@/lib/validation";

export type PracticeFormState = { error?: string };

export async function savePracticeScheduleAction(
  _prevState: PracticeFormState,
  formData: FormData
): Promise<PracticeFormState> {
  const user = await requireRole("PROMOTER");
  const eventId = String(formData.get("eventId") ?? "");
  const event = await requireEventAccess(eventId, user);

  const raw = String(formData.get("schedule") ?? "");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return {
      error: "Something went wrong reading the schedule. Please try again.",
    };
  }

  const parsed = practiceScheduleSchema.safeParse(json);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid schedule." };
  }

  await replacePracticeSchedule(event.id, parsed.data);

  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${event.slug}`);
  redirect(`/dashboard/events/${event.id}`);
}

async function withEventAccess(formData: FormData) {
  const user = await requireRole("PROMOTER");
  const eventId = String(formData.get("eventId") ?? "");
  return requireEventAccess(eventId, user);
}

export async function advancePracticeAction(formData: FormData) {
  const event = await withEventAccess(formData);
  await advancePractice(event.id);
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${event.slug}`);
}

export async function moveBackPracticeAction(formData: FormData) {
  const event = await withEventAccess(formData);
  await moveBackPractice(event.id);
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${event.slug}`);
}

export async function restartPracticeAction(formData: FormData) {
  const event = await withEventAccess(formData);
  await restartPracticeSchedule(event.id);
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${event.slug}`);
}

export async function switchToRaceAction(formData: FormData) {
  const event = await withEventAccess(formData);
  await setActiveSchedule(event.id, "RACE");
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${event.slug}`);
}

export async function switchToPracticeAction(formData: FormData) {
  const event = await withEventAccess(formData);
  await setActiveSchedule(event.id, "PRACTICE");
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${event.slug}`);
}
