import Link from "next/link";
import { Morph, morphName, openByTitle, VT } from "@/components/ui/morph";
import type { ProjectSummary } from "@/lib/content/projects";
import { TechTags } from "./tech-tags";

/**
 * Compact, text-only rows for older work: findable without competing visually.
 * The title's link stretches over the whole row; the tech tags sit above it as their own links.
 */
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
    <div className="group relative grid grid-cols-[3.5rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-line py-4 sm:grid-cols-[4.5rem_minmax(0,1.2fr)_minmax(0,1fr)] sm:gap-x-8">
      <span className="label">{project.year}</span>
      <span className="min-w-0">
        <Link
          href={project.url}
          {...openByTitle}
          className="font-semibold tracking-tight transition-colors group-hover:text-accent after:absolute after:inset-0"
        >
          <Morph name={morphName.title(project.slug)} kind="text" on={[VT.title, VT.browse]}>
            <span className="inline-block">{project.title}</span>
          </Morph>
        </Link>
        <span className="mt-1 block truncate text-sm text-fg-muted">{project.summary}</span>
      </span>
      <TechTags tech={project.tech} limit={3} plain className="relative z-10 col-start-2 sm:col-start-auto sm:justify-end" />
    </div>
  );
}
