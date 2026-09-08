"use client";

import { useEffect, useRef, useState } from "react";
import { LineupTable, type RaceData } from "@/components/LineupTable";
import {
  PracticeTable,
  type PracticeSessionData,
} from "@/components/PracticeTable";

const POLL_INTERVAL_MS = 60_000;

type ScheduleType = "PRACTICE" | "RACE";

export function PublicSchedule({
  slug,
  initialActiveSchedule,
  initialRaces,
  initialCurrentRaceId,
  initialPracticeSessions,
  initialCurrentPracticeId,
}: {
  slug: string;
  initialActiveSchedule: ScheduleType;
  initialRaces: RaceData[];
  initialCurrentRaceId: string | null;
  initialPracticeSessions: PracticeSessionData[];
  initialCurrentPracticeId: string | null;
}) {
  const [activeSchedule, setActiveSchedule] = useState(initialActiveSchedule);
  const [races, setRaces] = useState(initialRaces);
  const [currentRaceId, setCurrentRaceId] = useState(initialCurrentRaceId);
  const [practiceSessions, setPracticeSessions] = useState(
    initialPracticeSessions
  );
  const [currentPracticeId, setCurrentPracticeId] = useState(
    initialCurrentPracticeId
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetId =
      initialActiveSchedule === "PRACTICE"
        ? initialCurrentPracticeId
        : initialCurrentRaceId;
    if (!targetId) return;
    const el = containerRef.current?.querySelector(
      `[data-race-id="${targetId}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [initialActiveSchedule, initialCurrentPracticeId, initialCurrentRaceId]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/lineup/${slug}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          activeSchedule: ScheduleType;
          races: RaceData[];
          currentRaceId: string | null;
          practiceSessions: PracticeSessionData[];
          currentPracticeId: string | null;
        };
        if (cancelled) return;
        setActiveSchedule(data.activeSchedule);
        setRaces(data.races);
        setCurrentRaceId(data.currentRaceId);
        setPracticeSessions(data.practiceSessions);
        setCurrentPracticeId(data.currentPracticeId);
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
      {activeSchedule === "PRACTICE" ? (
        <>
          <p className="text-center text-xs font-bold uppercase tracking-wide text-amber-600">
            Practice
          </p>
          <PracticeTable
            sessions={practiceSessions}
            currentPracticeId={currentPracticeId}
          />
        </>
      ) : (
        <LineupTable races={races} currentRaceId={currentRaceId} />
      )}
      {lastUpdated && (
        <p className="text-center text-xs text-gray-400">
          Updated {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
