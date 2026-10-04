import Link from "next/link";
import { CATEGORIES } from "@/config/taxonomy";
import type { ProjectSummary } from "@/lib/content/projects";
import { ArrowRight } from "@/components/ui/icons";
import { pad2 } from "@/lib/utils";

/** A typographic index of disciplines, each linking into the filtered explorer. */
export function DisciplineIndex({ projects }: { projects: ProjectSummary[] }) {
  const rows = CATEGORIES.map((c) => ({
    ...c,
    count: projects.filter((p) => p.categories.includes(c.id)).length,
  })).filter((c) => c.count > 0);

  return (
    <ul className="border-t border-line">
      {rows.map((c) => (
        <li key={c.id} className="border-b border-line">
          <Link
            href={`/work?category=${c.id}`}
            className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5 md:grid-cols-12 md:py-6"
          >
            <span className="text-xl font-semibold tracking-tight transition-colors semi-wide group-hover:text-accent md:col-span-5 md:text-2xl">
              {c.label}
            </span>
            <span className="label col-start-2 row-start-1 flex items-center gap-4 justify-self-end md:col-span-2 md:col-start-11">
              {pad2(c.count)}
              <ArrowRight className="size-3.5 text-fg-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
            </span>
            <span className="col-span-2 text-sm text-fg-muted md:col-span-5 md:col-start-6 md:row-start-1 md:text-[0.9375rem]">
              {c.blurb}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
