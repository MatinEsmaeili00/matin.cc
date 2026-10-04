import Link from "next/link";
import { ProjectMedia } from "@/components/media/project-media";
import type { ProjectSummary } from "@/lib/content/projects";
import { categoryLabels, techLabels } from "./format";

/** Grid card: the visual leads, text stays to one glance. */
export function ProjectCard({
  project,
  sizes = "(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  project: ProjectSummary;
  sizes?: string;
}) {
  const tech = techLabels(project.tech, 3);

  return (
    <article className="group" data-preview-root>
      <Link href={project.url} className="block focus-visible:outline-offset-4">
        <ProjectMedia
          slug={project.slug}
          cover={project.cover}
          preview={project.preview}
          label={categoryLabels(project.categories)[0]}
          sizes={sizes}
        />
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="text-xl leading-tight font-semibold tracking-tight transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          <span className="label shrink-0">{project.year}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-relaxed text-fg-muted">{project.summary}</p>
        {tech.length > 0 && <p className="label mt-3">{tech.join(" · ")}</p>}
      </Link>
    </article>
  );
}
