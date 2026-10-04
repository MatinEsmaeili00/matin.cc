import Link from "next/link";
import type { ProjectSummary } from "@/lib/content/projects";
import { TechTags } from "./tech-tags";

/** Compact, text-only rows for older work: findable without competing visually. */
export function ArchiveList({ projects }: { projects: ProjectSummary[] }) {
  return (
    <ul className="border-t border-line">
      {projects.map((p) => (
        <li key={p.slug}>
          <ArchiveRow project={p} />
        </li>
      ))}
    </ul>
  );
}

export function ArchiveRow({ project }: { project: ProjectSummary }) {
  return (
    <Link
      href={project.url}
      className="group grid grid-cols-[3.5rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-line py-4 sm:grid-cols-[4.5rem_minmax(0,1.2fr)_minmax(0,1fr)] sm:gap-x-8"
    >
      <span className="label">{project.year}</span>
      <span className="min-w-0">
        <span className="font-semibold tracking-tight transition-colors group-hover:text-accent">{project.title}</span>
        <span className="mt-1 block truncate text-sm text-fg-muted">{project.summary}</span>
      </span>
      <TechTags tech={project.tech} limit={3} plain className="col-start-2 sm:col-start-auto sm:justify-end" />
    </Link>
  );
}
