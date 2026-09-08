"use client";

import { useState, type ReactNode } from "react";

export function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          {open ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" />
          )}
        </svg>
      </button>
      {open && (
        // Closes on any link/button click inside — the header persists
        // across client-side navigations, so without this the panel would
        // still be open on the page the user just tapped through to.
        <div
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a, button")) {
              setOpen(false);
            }
          }}
          className="absolute inset-x-0 top-full z-30 border-b border-gray-200 bg-white p-4 shadow-md"
        >
          {children}
        </div>
      )}
    </div>
  );
}
