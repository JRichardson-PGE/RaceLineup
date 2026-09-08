"use client";

import { useEffect, useRef } from "react";

const CHAPTERS = [
  { id: "sign-in", num: "00", title: "Signing in" },
  { id: "create-event", num: "01", title: "Create your event" },
  { id: "schedule", num: "02", title: "Build the schedule" },
  { id: "publish", num: "03", title: "Publish it" },
  { id: "run-live", num: "04", title: "Run it live" },
  { id: "share", num: "05", title: "Share with racers" },
  { id: "wrap-up", num: "06", title: "Wrap up" },
  { id: "events-list", num: "07", title: "Your events list" },
  { id: "quick-reference", num: "08", title: "Quick reference" },
] as const;

export function GuideChapterLinks() {
  return (
    <>
      {CHAPTERS.map((c) => (
        <a key={c.id} href={`#${c.id}`}>
          <span className="toc-num">{c.num}</span>
          {c.title}
        </a>
      ))}
    </>
  );
}

export function GuideNav() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !("IntersectionObserver" in window)) return;

    const links = Array.from(nav.querySelectorAll("a"));
    const sections = links
      .map((a) => document.querySelector(a.getAttribute("href") ?? ""))
      .filter((el): el is Element => el !== null);
    if (sections.length === 0) return;

    let current: string | null = null;
    function setActive(id: string) {
      if (id === current) return;
      current = id;
      links.forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <nav ref={navRef}>
      <GuideChapterLinks />
    </nav>
  );
}
