import Link from "next/link";
import { ProjectMedia } from "@/components/media/project-media";
import { Morph, morphName, openByMedia, openByTitle, videoHref, VT } from "@/components/ui/morph";
import type { ProjectSummary } from "@/lib/content/projects";
import { categoryLabels } from "./format";
import { TechTags } from "./tech-tags";

/**
 * Grid card: the visual leads, text stays to one glance. Two ways in: the
 * media zooms into the project's video, the name glides into its title.
 * The tech tags are their own links.
 */
export function ProjectCard({
  project,
  sizes = "(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  project: ProjectSummary;
  sizes?: string;
}) {
  return (
    <article className="group" data-preview-root>
      {/* Pointer shortcut; keyboard and screen-reader users get the name link below. */}
      <Link href={videoHref(project.url)} {...openByMedia} tabIndex={-1} aria-hidden className="block">
        <Morph name={morphName.media(project.slug)} on={[VT.media, VT.browse]}>
          <ProjectMedia
            slug={project.slug}
            cover={project.cover}
            preview={project.preview}
            youtube={project.youtube}
            label={categoryLabels(project.categories)[0]}
            sizes={sizes}
          />
        </Morph>
      </Link>
      <Link href={project.url} {...openByTitle} className="mt-4 block focus-visible:outline-offset-4">
        <div className="flex items-baseline justify-between gap-4">
          <Morph name={morphName.title(project.slug)} kind="text" on={[VT.title, VT.browse]}>
            <h3 className="text-xl leading-tight font-semibold tracking-tight transition-colors group-hover:text-accent">
              {project.title}
            </h3>
          </Morph>
          <span className="label shrink-0">{project.year}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-relaxed text-fg-muted">{project.summary}</p>
      </Link>
      <TechTags tech={project.tech} limit={3} className="mt-3" />
    </article>
  );
}
