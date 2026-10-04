import Link from "next/link";
import type { ProjectSummary } from "@/lib/content/projects";
import { ArrowRight } from "@/components/ui/icons";

/** One line pointing to older work, so it stays reachable without competing. */
export function ArchiveTeaser({ projects }: { projects: ProjectSummary[] }) {
  const years = projects.map((p) => p.year);
  const range = `${Math.min(...years)} — ${Math.max(...years)}`;

  return (
    <Link
      href="/work#archive"
      className="group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-y border-line py-6"
    >
      <span className="flex items-baseline gap-4">
        <span className="label">Archive</span>
        <span className="text-fg-muted transition-colors group-hover:text-fg">
          {projects.length} earlier games, prototypes and studies
        </span>
      </span>
      <span className="label flex items-center gap-4">
        {range}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
