"use client";

import { useEffect, useRef, useState } from "react";
import { LineupTable, type RaceData } from "@/components/LineupTable";

const POLL_INTERVAL_MS = 60_000;

export function PublicLineup({
  slug,
  initialRaces,
  initialCurrentRaceId,
}: {
  slug: string;
  initialRaces: RaceData[];
  initialCurrentRaceId: string | null;
}) {
  const [races, setRaces] = useState(initialRaces);
  const [currentRaceId, setCurrentRaceId] = useState(initialCurrentRaceId);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialCurrentRaceId) return;
    const el = containerRef.current?.querySelector(
      `[data-race-id="${initialCurrentRaceId}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [initialCurrentRaceId]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/lineup/${slug}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          races: RaceData[];
          currentRaceId: string | null;
        };
        if (cancelled) return;
        setRaces(data.races);
        setCurrentRaceId(data.currentRaceId);
        setLastUpdated(new Date());
      } catch {
        // Transient network error — the next scheduled poll will retry.
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [slug]);

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      <LineupTable races={races} currentRaceId={currentRaceId} />
      {lastUpdated && (
        <p className="text-center text-xs text-gray-400">
          Updated {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
