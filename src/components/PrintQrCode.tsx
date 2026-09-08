"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function PrintQrCode({ path }: { path: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const fullUrl = `${window.location.origin}${path}`;
    let cancelled = false;
    QRCode.toDataURL(fullUrl, { width: 160, margin: 1 })
      .then((result) => {
        if (cancelled) return;
        setDataUrl(result);
        setUrl(fullUrl);
      })
      .catch(() => {
        // QR generation failed — still show the link text so people can get there.
        if (!cancelled) setUrl(fullUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return (
    <div className="avoid-break mt-8 flex flex-col items-center gap-2 border-t border-gray-200 pt-6 text-center">
      {dataUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- client-generated data URL, not a static/remote image
        <img
          src={dataUrl}
          alt="QR code linking to the live event page"
          width={160}
          height={160}
        />
      )}
      <p className="text-sm text-gray-600">
        Scan for the live, up-to-date schedule
        {url && (
          <>
            <br />
            {url}
          </>
        )}
      </p>
    </div>
  );
}
