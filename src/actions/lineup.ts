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
import { parseScheduleFile } from "@/lib/schedule-import";

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

export type UploadScheduleState = { error?: string };

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function uploadScheduleAction(
  _prevState: UploadScheduleState,
  formData: FormData
): Promise<UploadScheduleState> {
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
  const result = await parseScheduleFile(buffer, filename);
  if (!result.success) {
    return { error: result.error };
  }

  await replaceLineup(event.id, result.lineup);

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
