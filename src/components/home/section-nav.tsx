"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Sticky jump-bar for the homepage sections (like the old site's tabs).
 * Highlights the section currently in view.
 */
export function SectionNav({ sections }: { sections: { id: string; title: string; count: number; live?: boolean }[] }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Sections" className="sticky top-14 z-30 border-y border-line bg-ink/90 backdrop-blur-md">
      <ul className="page gutter no-scrollbar flex gap-2 overflow-x-auto py-3">
        {sections.map((s) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              aria-current={current === s.id ? "true" : undefined}
              className={cn(
                "flex h-10 items-center gap-2 rounded-md border px-3 font-mono text-[0.75rem] tracking-[0.06em] whitespace-nowrap uppercase transition-colors",
                current === s.id
                  ? "border-fg bg-fg text-ink"
                  : "border-line-strong text-fg-muted hover:border-fg hover:text-fg",
              )}
            >
              {s.live && (
                <span aria-hidden className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" />
                </span>
              )}
              {s.title}
              <span className={current === s.id ? "text-ink/60" : "text-fg-faint"}>{s.count}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
