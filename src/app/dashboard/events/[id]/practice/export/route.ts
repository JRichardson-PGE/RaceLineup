import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { requireEventAccess, requireUser } from "@/lib/auth";
import { getEventById } from "@/lib/lineup";
import {
  exportPracticeSchedule,
  type ExportFormat,
} from "@/lib/schedule-export";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireUser();
  await requireEventAccess(id, user);
  const event = await getEventById(id);
  if (!event) notFound();

  const format: ExportFormat =
    new URL(request.url).searchParams.get("format") === "csv"
      ? "csv"
      : "xlsx";

  const { body, contentType } = await exportPracticeSchedule(
    event.practiceSessions,
    format
  );
  const extension = format === "csv" ? "csv" : "xlsx";

  return new NextResponse(body as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${event.slug}-practice-schedule.${extension}"`,
    },
  });
}
