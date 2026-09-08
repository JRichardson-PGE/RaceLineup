import { NextResponse } from "next/server";
import { getEventBySlugPublic } from "@/lib/lineup";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const event = await getEventBySlugPublic(slug);

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    activeSchedule: event.activeSchedule,
    currentRaceId: event.currentRaceId,
    races: event.races,
    currentPracticeId: event.currentPracticeId,
    practiceSessions: event.practiceSessions,
  });
}
