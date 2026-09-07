"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function EventQrCode({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || dataUrl) return;
    const url = `${window.location.origin}${path}`;
    let cancelled = false;
    QRCode.toDataURL(url, { width: 220, margin: 1 })
      .then((result) => {
        if (!cancelled) setDataUrl(result);
      })
      .catch(() => {
        // QR generation failed — leave the "Generating…" placeholder off.
      });
    return () => {
      cancelled = true;
    };
  }, [open, dataUrl, path]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        {open ? "Hide QR code" : "Show QR code"}
      </button>
      {open && (
        <div className="mt-2 flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- client-generated data URL, not a static/remote image
            <img
              src={dataUrl}
              alt="QR code linking to the public event page"
              width={220}
              height={220}
            />
          ) : (
            <p className="text-sm text-gray-500">Generating…</p>
          )}
        </div>
      )}
    </div>
  );
}
