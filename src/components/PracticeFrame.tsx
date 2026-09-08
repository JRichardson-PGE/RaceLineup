"use client";

import { useEffect, useRef } from "react";
import {
  PracticeTable,
  type PracticeSessionData,
} from "@/components/PracticeTable";

export function PracticeFrame({
  sessions,
  currentPracticeId,
  highlight = true,
}: {
  sessions: PracticeSessionData[];
  currentPracticeId: string | null;
  highlight?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!currentPracticeId) {
      container.scrollTop = 0;
      return;
    }

    const el = container.querySelector<HTMLElement>(
      `[data-race-id="${currentPracticeId}"]`
    );
    if (!el) return;

    // Scroll only this frame, not the page — el.scrollIntoView() also drags
    // the whole page along with it on mobile, shoving the control buttons
    // (which sit above this frame) off-screen. Using getBoundingClientRect
    // (viewport-relative) rather than offsetTop, since neither el nor
    // container establish a CSS positioning context for offsetTop to be
    // reliably measured against.
    const TOP_OFFSET = 16; // matches the frame's own p-4 padding
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const delta = elRect.top - containerRect.top - TOP_OFFSET;
    container.scrollTo({
      top: container.scrollTop + delta,
      behavior: "smooth",
    });
  }, [currentPracticeId]);

  return (
    <div
      ref={containerRef}
      className="max-h-[65vh] overflow-y-auto rounded-lg border border-gray-200 bg-white p-4"
    >
      <PracticeTable
        sessions={sessions}
        currentPracticeId={currentPracticeId}
        highlight={highlight}
      />
    </div>
  );
}
