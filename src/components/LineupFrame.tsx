"use client";

import { useEffect, useRef } from "react";
import { LineupTable, type RaceData } from "@/components/LineupTable";

export function LineupFrame({
  races,
  currentRaceId,
}: {
  races: RaceData[];
  currentRaceId: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentRaceId) return;
    const el = containerRef.current?.querySelector(
      `[data-race-id="${currentRaceId}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentRaceId]);

  return (
    <div
      ref={containerRef}
      className="max-h-[65vh] overflow-y-auto rounded-lg border border-gray-200 bg-white p-4"
    >
      <LineupTable races={races} currentRaceId={currentRaceId} />
    </div>
  );
}
