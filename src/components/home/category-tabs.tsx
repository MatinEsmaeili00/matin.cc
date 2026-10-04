"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Chip } from "@/components/ui/chip";
import { ArrowRight } from "@/components/ui/icons";

export type TabItem = {
  slug: string;
  categories: string[];
  /** Shown on the default "Highlights" tab. */
  highlight: boolean;
  /** Server-rendered card. */
  card: ReactNode;
};

export type TabCategory = { id: string; label: string; count: number; dot?: boolean };

/**
 * Homepage "browse by category" tabs, like the old site's sections.
 * Cards are server-rendered and passed in; this only decides which to show.
 */
export function CategoryTabs({
  items,
  categories,
  limit = 9,
}: {
  items: TabItem[];
  categories: TabCategory[];
  limit?: number;
}) {
  const [active, setActive] = useState<string | null>(null);

  const select = (id: string | null) => {
    const apply = () => setActive(id);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && "startViewTransition" in document) document.startViewTransition(() => flushSync(apply));
    else apply();
  };

  const matching = items.filter((i) => (active ? i.categories.includes(active) : i.highlight));
  const shown = matching.slice(0, limit);
  const current = categories.find((c) => c.id === active);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter by category"
        className="no-scrollbar -mx-[clamp(1rem,4vw,3.5rem)] mb-10 flex gap-2 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] md:mx-0 md:flex-wrap md:px-0"
      >
        <Chip pressed={active === null} onClick={() => select(null)}>
          Highlights
        </Chip>
        {categories.map((c) => (
          <Chip key={c.id} pressed={active === c.id} count={c.count} dot={c.dot} onClick={() => select(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>

      <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
        {shown.map((item) => (
          <li key={item.slug} style={{ viewTransitionName: `tab-${item.slug}` }}>
            {item.card}
          </li>
        ))}
      </ul>

      <div className="mt-12">
        <Link
          href={current ? `/work?category=${current.id}` : "/work"}
          className="inline-flex min-h-11 items-center gap-3 font-mono text-[0.75rem] tracking-[0.12em] uppercase hover:text-accent"
        >
          {current
            ? `See all ${matching.length} in ${current.label}`
            : `Browse all ${items.length} projects`}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
