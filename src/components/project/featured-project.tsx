import Link from "next/link";
import { ProjectMedia } from "@/components/media/project-media";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import type { Project } from "@/lib/content/projects";
import { githubRepoUrl } from "@/lib/refs";
import { cn, pad2 } from "@/lib/utils";
import { categoryLabels, STATUS_LABEL, teamLabel, techLabels } from "./format";

/**
 * A full-width "film strip" row for featured work. Media takes two thirds of
 * the row and alternates sides on desktop; on mobile it stacks media-first.
 */
export function FeaturedProject({ project, index }: { project: Project; index: number }) {
  const flip = index % 2 === 1;
  const facts = [
    project.role && { term: "Role", detail: project.role },
    teamLabel(project.teamSize) && { term: "Team", detail: teamLabel(project.teamSize)! },
    project.context && { term: "Context", detail: project.context },
  ].filter(Boolean) as { term: string; detail: string }[];

  const external = [
    project.github && { label: "Source", href: githubRepoUrl(project.github) },
    project.links.steam && { label: "Steam", href: project.links.steam },
    project.links.itch && { label: "Play", href: project.links.itch },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <article className="reveal group grid gap-x-10 gap-y-6 border-t border-line pt-5 md:grid-cols-12" data-preview-root>
      <header className="label flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 md:col-span-12">
        <span className="text-accent">{pad2(index + 1)}</span>
        <span>
          {categoryLabels(project.categories).slice(0, 2).join(" / ")} · {project.period} ·{" "}
          {STATUS_LABEL[project.status]}
        </span>
      </header>

      <Link
        href={project.url}
        className={cn("block md:col-span-8", flip && "md:order-last")}
        tabIndex={-1}
        aria-hidden
      >
        <ProjectMedia
          slug={project.slug}
          cover={project.cover}
          preview={project.preview}
          label={techLabels(project.tech, 3).join(" · ")}
          sizes="(min-width: 768px) 66vw, 100vw"
          priority={index === 0}
          playback="inview"
        />
      </Link>

      <div className="flex flex-col md:col-span-4">
        <h3 className="text-heading font-semibold tracking-tight semi-wide">
          <Link href={project.url} className="transition-colors hover:text-accent">
            {project.title}
          </Link>
        </h3>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-fg-muted">{project.summary}</p>

        {facts.length > 0 && (
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5">
            {facts.map((f) => (
              <div key={f.term}>
                <dt className="label">{f.term}</dt>
                <dd className="mt-1 text-sm text-fg">{f.detail}</dd>
              </div>
            ))}
          </dl>
        )}

        {project.tech.length > 0 && (
          <p className="label mt-6 leading-relaxed">{techLabels(project.tech, 6).join(" · ")}</p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 md:mt-auto md:pt-8">
          <Link
            href={project.url}
            className="inline-flex min-h-11 items-center gap-3 font-mono text-[0.75rem] tracking-[0.12em] text-fg uppercase hover:text-accent"
          >
            Case study <ArrowRight className="size-3.5" />
          </Link>
          {external.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-11 items-center gap-2 font-mono text-[0.75rem] tracking-[0.12em] text-fg-muted uppercase hover:text-fg"
            >
              {link.label} <ArrowUpRight className="size-2.5" />
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
