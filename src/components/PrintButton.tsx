"use client";

import { useState } from "react";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS reports itself as "MacIntel" — multi-touch is what gives it away.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function PrintButton() {
  const [showIosTip, setShowIosTip] = useState(false);

  return (
    <div className="no-print inline-flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={() => {
          window.print();
          if (isIOS()) setShowIosTip(true);
        }}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
      >
        Print / Save as PDF
      </button>
      {showIosTip && (
        <p className="max-w-xs text-xs text-gray-500">
          On iPhone/iPad: tap the preview thumbnail at the top of the sheet,
          then pinch outward on it to reveal Share &rarr; Save to Files (PDF).
        </p>
      )}
    </div>
  );
}
