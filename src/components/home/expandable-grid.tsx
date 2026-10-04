"use client";

import { useState, type ReactNode } from "react";

/** A card grid that shows the first `initial` cards and reveals the rest on request. */
export function ExpandableGrid({ cards, initial = 9 }: { cards: { key: string; node: ReactNode }[]; initial?: number }) {
  const [open, setOpen] = useState(false);
  const shown = open ? cards : cards.slice(0, initial);
  const hidden = cards.length - initial;

  return (
    <>
      <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((c) => (
          <li key={c.key}>{c.node}</li>
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="mt-12 inline-flex min-h-11 items-center rounded-md border border-line-strong px-5 font-mono text-[0.75rem] tracking-[0.1em] uppercase transition-colors hover:border-fg"
        >
          {open ? "Show fewer" : `Show ${hidden} more`}
        </button>
      )}
    </>
  );
}
