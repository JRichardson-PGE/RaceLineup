"use client";

import { useEffect } from "react";

/**
 * Keeps a CSS variable in sync with the sticky site header's actual
 * rendered height, so other sticky elements (e.g. a page's own title bar)
 * can stack directly beneath it instead of guessing a fixed offset — the
 * header's height varies by auth state and can wrap on narrow screens.
 */
export function HeaderHeightObserver() {
  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;

    const setHeight = () => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${header.getBoundingClientRect().height}px`
      );
    };

    setHeight();
    const observer = new ResizeObserver(setHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return null;
}
