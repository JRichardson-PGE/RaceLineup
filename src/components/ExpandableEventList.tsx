"use client";

import { useState } from "react";

export function ExpandableEventList({
  visible,
  hidden,
  hiddenCount,
}: {
  visible: React.ReactNode;
  hidden: React.ReactNode;
  hiddenCount: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {expanded ? hidden : visible}
      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="self-start text-sm font-medium text-blue-600 hover:underline"
        >
          Show {hiddenCount} more
        </button>
      )}
    </>
  );
}
