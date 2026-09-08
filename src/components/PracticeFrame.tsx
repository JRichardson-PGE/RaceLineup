"use client";

import { useEffect, useRef } from "react";
import {
  PracticeTable,
  type PracticeSessionData,
} from "@/components/PracticeTable";

export function PracticeFrame({
  sessions,
  currentPracticeId,
}: {
  sessions: PracticeSessionData[];
  currentPracticeId: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!currentPracticeId) {
      container.scrollTop = 0;
      return;
    }

    const el = container.querySelector(
      `[data-race-id="${currentPracticeId}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentPracticeId]);

  return (
    <div
      ref={containerRef}
      className="max-h-[65vh] overflow-y-auto rounded-lg border border-gray-200 bg-white p-4"
    >
      <PracticeTable sessions={sessions} currentPracticeId={currentPracticeId} />
    </div>
  );
}
