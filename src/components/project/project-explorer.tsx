"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Chip } from "@/components/ui/chip";

export type ExplorerItem = {
  slug: string;
  archive: boolean;
  categories: string[];
  tech: string[];
  /** Lower-cased title + summary + labels, for the search box. */
  haystack: string;
  /** Server-rendered card (or archive row). */
  node: ReactNode;
};

type Option = { id: string; label: string; dot?: boolean; color?: string; dark?: string };

type Filters = { category: string | null; tech: string[]; q: string };

const EMPTY: Filters = { category: null, tech: [], q: "" };

/**
 * Client-side filtering over server-rendered cards. Only filter metadata
 * crosses to the client; the cards themselves stay server components.
 * Filters live in the URL (?category=rendering&tech=hlsl,unreal&q=snow),
 * and changes animate with the native View Transitions API where available.
 */
export function ProjectExplorer({
  items,
  categories,
  primaryTech,
  moreTech,
}: {
  items: ExplorerItem[];
  categories: Option[];
  primaryTech: Option[];
  moreTech: Option[];
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [moreOpen, setMoreOpen] = useState(false);

  // Read filters from the URL after hydration (keeps the page statically rendered),
  // and follow back/forward navigation.
  useEffect(() => {
    const sync = () => setFilters(fromSearch(window.location.search));
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const update = (next: Filters) => {
    const apply = () => {
      setFilters(next);
      const search = toSearch(next);
      window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && "startViewTransition" in document) {
      document.startViewTransition(() => flushSync(apply));
    } else {
      apply();
    }
  };

  const matches = (item: ExplorerItem, f: Filters) =>
    (!f.category || item.categories.includes(f.category)) &&
    f.tech.every((t) => item.tech.includes(t)) &&
    (!f.q || f.q.toLowerCase().split(/\s+/).every((word) => item.haystack.includes(word)));

  const visible = useMemo(() => items.filter((item) => matches(item, filters)), [items, filters]);
  const grid = visible.filter((i) => !i.archive);
  const archive = visible.filter((i) => i.archive);

  // Counts reflect the other active filters, so a chip shows what clicking it would give.
  const countFor = (patch: Partial<Filters>) => items.filter((i) => matches(i, { ...filters, ...patch })).length;
  const active = filters.category !== null || filters.tech.length > 0 || filters.q !== "";

  const toggleTech = (id: string) =>
    update({
      ...filters,
      tech: filters.tech.includes(id) ? filters.tech.filter((t) => t !== id) : [...filters.tech, id],
    });

  return (
    <>
      <div className="border-y border-line bg-ink/90 backdrop-blur-md md:sticky md:top-14 md:z-30">
        <div className="page gutter space-y-3 py-4">
          <div className="no-scrollbar -mx-[clamp(1rem,4vw,3.5rem)] flex gap-2 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] md:mx-0 md:flex-wrap md:px-0">
            <Chip pressed={filters.category === null} onClick={() => update({ ...filters, category: null })}>
              All
            </Chip>
            {categories.map((c) => (
              <Chip
                key={c.id}
                pressed={filters.category === c.id}
                dot={c.dot}
                count={countFor({ category: c.id })}
                onClick={() => update({ ...filters, category: filters.category === c.id ? null : c.id })}
              >
                {c.label}
              </Chip>
            ))}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="no-scrollbar -mx-[clamp(1rem,4vw,3.5rem)] flex gap-2 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] md:mx-0 md:flex-wrap md:px-0">
              {[...primaryTech, ...(moreOpen ? moreTech : moreTech.filter((t) => filters.tech.includes(t.id)))].map((t) => (
                <Chip
                  key={t.id}
                  small
                  color={t.color}
                  darkColor={t.dark}
                  pressed={filters.tech.includes(t.id)}
                  count={filters.tech.includes(t.id) ? undefined : countFor({ tech: [...filters.tech, t.id] })}
                  onClick={() => toggleTech(t.id)}
                >
                  {t.label}
                </Chip>
              ))}
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                className="h-9 shrink-0 px-3 font-mono text-[0.6875rem] tracking-[0.08em] text-fg-muted uppercase underline decoration-line-strong underline-offset-4 hover:text-fg"
              >
                {moreOpen ? "Fewer" : `More tech (${moreTech.length})`}
              </button>
            </div>

            <label className="relative block shrink-0 md:w-64">
              <span className="sr-only">Search projects</span>
              <input
                type="search"
                value={filters.q}
                onChange={(e) => {
                  // Typing shouldn't trigger a view transition per keystroke.
                  const next = { ...filters, q: e.target.value };
                  setFilters(next);
                  const search = toSearch(next);
                  window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
                }}
                placeholder="Search — e.g. compute, VR, Niagara"
                className="h-10 w-full rounded-md border border-line-strong bg-transparent px-3 font-mono text-[0.8125rem] text-fg placeholder:text-fg-faint focus:border-fg focus:outline-none"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="page gutter mt-10">
        <p className="label mb-8 flex flex-wrap items-center gap-4" aria-live="polite">
          {visible.length} {visible.length === 1 ? "project" : "projects"}
          {active && (
            <button
              type="button"
              onClick={() => update(EMPTY)}
              className="min-h-8 text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent"
            >
              Clear filters
            </button>
          )}
        </p>

        <h2 className="sr-only">Projects</h2>
        {grid.length > 0 && (
          <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
            {grid.map((item) => (
              <li key={item.slug} style={{ viewTransitionName: `card-${item.slug}` }}>
                {item.node}
              </li>
            ))}
          </ul>
        )}

        <section id="archive" aria-labelledby="archive-heading" className="mt-24 scroll-mt-48">
          <h2 id="archive-heading" className="mb-6 flex items-baseline gap-4 text-xl font-semibold tracking-tight semi-wide">
            Archive
            <span className="label">{archive.length}</span>
          </h2>
          <p className="mb-8 max-w-2xl text-fg-muted">
            Earlier games, prototypes and studies — where a lot of the maths and engine fundamentals came from.
          </p>
          {archive.length > 0 ? (
            <ul className="border-t border-line">
              {archive.map((item) => (
                <li key={item.slug} style={{ viewTransitionName: `row-${item.slug}` }}>
                  {item.node}
                </li>
              ))}
            </ul>
          ) : (
            <p className="label">No archived work matches these filters.</p>
          )}
        </section>

        {visible.length === 0 && (
          <p className="mt-10 text-fg-muted">
            Nothing matches.{" "}
            <button type="button" onClick={() => update(EMPTY)} className="text-fg underline underline-offset-4">
              Clear filters
            </button>
          </p>
        )}
      </div>
    </>
  );
}

function fromSearch(search: string): Filters {
  const params = new URLSearchParams(search);
  return {
    category: params.get("category"),
    tech: params.get("tech")?.split(",").filter(Boolean) ?? [],
    q: params.get("q") ?? "",
  };
}

function toSearch(f: Filters): string {
  const params = new URLSearchParams();
  if (f.category) params.set("category", f.category);
  if (f.tech.length) params.set("tech", f.tech.join(","));
  if (f.q) params.set("q", f.q);
  return params.toString().replace(/%2C/g, ",");
}
