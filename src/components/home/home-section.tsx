import Link from "next/link";
import { FeaturedProject } from "@/components/project/featured-project";
import { ItemCard } from "@/components/project/item-card";
import { ProjectCard } from "@/components/project/project-card";
import { ArrowRight } from "@/components/ui/icons";
import type { HomeSection as Section } from "@/config/home";
import { isCategoryId } from "@/config/taxonomy";
import { compareProjects, toSummary, type Project } from "@/lib/content/projects";
import { ExpandableGrid } from "./expandable-grid";

/**
 * One homepage section (Developed Games & Tools, Virtual Production, In the
 * Lab, …). Featured projects get full-width rows; collections expand into one
 * card per piece; everything else is a card. Long sections fold after 9 cards.
 */
export function HomeSection({ section, projects, live }: { section: Section; projects: Project[]; live?: boolean }) {
  const sorted = [...projects].sort(compareProjects);
  const featured = sorted.filter((p) => p.tier === "featured" && p.items.length === 0);
  const cards = sorted
    .filter((p) => !featured.includes(p))
    .flatMap((p) =>
      p.items.length > 0
        ? p.items.map((item) => ({ key: `${p.slug}#${item.id}`, node: <ItemCard project={p} item={item} /> }))
        : [{ key: p.slug, node: <ProjectCard project={toSummary(p)} /> }],
    );
  const total = featured.length + cards.length;
  const workLink = isCategoryId(section.id) ? `/work?category=${section.id}` : "/work";

  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="page gutter scroll-mt-32 pt-16 md:pt-24">
      <header className="mb-10 grid gap-6 border-t border-line pt-6 md:mb-14 md:grid-cols-12">
        <div className="md:col-span-7">
          {section.eyebrow && (
            <p className="label mb-3 flex items-center gap-2.5 text-accent">
              {live && (
                <span aria-hidden className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" />
                </span>
              )}
              {section.eyebrow}
            </p>
          )}
          <h2 id={`${section.id}-title`} className="text-heading font-semibold tracking-tight semi-wide">
            {section.title}
            <span className="label ml-4 align-middle">{String(total).padStart(2, "0")}</span>
          </h2>
        </div>
        <div className="flex flex-col justify-end gap-4 md:col-span-5">
          {section.blurb && <p className="text-fg-muted">{section.blurb}</p>}
          <Link
            href={workLink}
            className="inline-flex min-h-11 items-center gap-3 self-start font-mono text-[0.75rem] tracking-[0.12em] uppercase hover:text-accent"
          >
            Explore in Work <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      {featured.length > 0 && (
        <div className="mb-20 space-y-20 md:mb-28 md:space-y-28">
          {featured.map((p, i) => (
            <FeaturedProject key={p.slug} project={p} index={i} />
          ))}
        </div>
      )}

      {cards.length > 0 && <ExpandableGrid cards={cards} />}
    </section>
  );
}
