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
import { parsePracticeScheduleFile } from "@/lib/practice-schedule-import";

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

export type UploadPracticeScheduleState = { error?: string };

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function uploadPracticeScheduleAction(
  _prevState: UploadPracticeScheduleState,
  formData: FormData
): Promise<UploadPracticeScheduleState> {
  const user = await requireRole("PROMOTER");
  const eventId = String(formData.get("eventId") ?? "");
  const event = await requireEventAccess(eventId, user);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a .xlsx or .csv file to upload." };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "That file is too large (5MB max)." };
  }

  const filename = file.name.toLowerCase();
  if (!filename.endsWith(".xlsx") && !filename.endsWith(".csv")) {
    return { error: "Only .xlsx or .csv files are supported." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await parsePracticeScheduleFile(buffer, filename);
  if (!result.success) {
    return { error: result.error };
  }

  await replacePracticeSchedule(event.id, result.schedule);

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
  if (event.activeSchedule !== "PRACTICE") return;
  await advancePractice(event.id);
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${event.slug}`);
}

export async function moveBackPracticeAction(formData: FormData) {
  const event = await withEventAccess(formData);
  if (event.activeSchedule !== "PRACTICE") return;
  await moveBackPractice(event.id);
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/events/${event.slug}`);
}

export async function restartPracticeAction(formData: FormData) {
  const event = await withEventAccess(formData);
  if (event.activeSchedule !== "PRACTICE") return;
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
