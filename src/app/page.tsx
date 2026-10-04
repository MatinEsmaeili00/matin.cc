import Link from "next/link";
import { ArchiveTeaser } from "@/components/home/archive-teaser";
import { DisciplineIndex } from "@/components/home/discipline-index";
import { Hero } from "@/components/home/hero";
import { FeaturedProject } from "@/components/project/featured-project";
import { ProjectCard } from "@/components/project/project-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { ArrowRight } from "@/components/ui/icons";
import { site } from "@/config/site";
import { getAllProjects, toSummary } from "@/lib/content/projects";
import { personJsonLd, JsonLd } from "@/lib/seo";

const SELECTED_LIMIT = 9;

export default async function HomePage() {
  const projects = await getAllProjects();
  const featured = projects.filter((p) => p.tier === "featured");
  const selected = projects.filter((p) => p.tier === "project");
  const archive = projects.filter((p) => p.tier === "archive");
  const active = projects.filter((p) => p.status === "active").slice(0, 4);

  return (
    <>
      <JsonLd data={personJsonLd()} />

      <Hero active={active.map(toSummary)} />

      {featured.length > 0 && (
        <section aria-labelledby="featured" className="page gutter">
          <SectionHeading id="featured" index="A" title="Featured work" />
          <div className="space-y-20 md:space-y-32">
            {featured.map((project, i) => (
              <FeaturedProject key={project.slug} project={project} index={i} />
            ))}
          </div>
        </section>
      )}

      {selected.length > 0 && (
        <section aria-labelledby="selected" className="page gutter mt-32 md:mt-48">
          <SectionHeading
            id="selected"
            index="B"
            title="Selected work"
            aside={
              <Link
                href="/work"
                className="inline-flex min-h-11 items-center gap-3 font-mono text-[0.75rem] tracking-[0.12em] uppercase hover:text-accent"
              >
                All {projects.length} projects <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
            {selected.slice(0, SELECTED_LIMIT).map((p) => (
              <ProjectCard key={p.slug} project={toSummary(p)} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="disciplines" className="page gutter mt-32 md:mt-48">
        <SectionHeading id="disciplines" index="C" title="By discipline" />
        <DisciplineIndex projects={projects.map(toSummary)} />
      </section>

      {archive.length > 0 && (
        <section aria-label="Archive" className="page gutter mt-24">
          <ArchiveTeaser projects={archive.map(toSummary)} />
        </section>
      )}

      <section aria-labelledby="about" className="page gutter mt-32 md:mt-48">
        <SectionHeading id="about" index="D" title="About" />
        <div className="grid gap-8 md:grid-cols-12">
          <p className="text-lead text-fg md:col-span-8">{site.bio}</p>
          <div className="md:col-span-3 md:col-start-10">
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center gap-3 font-mono text-[0.75rem] tracking-[0.12em] uppercase hover:text-accent"
            >
              More about me <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
