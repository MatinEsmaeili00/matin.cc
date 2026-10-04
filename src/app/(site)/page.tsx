import Image from "next/image";
import { ArchiveTeaser } from "@/components/home/archive-teaser";
import { AtAGlance } from "@/components/home/at-a-glance";
import { CategoryTabs, type TabItem } from "@/components/home/category-tabs";
import { Hero } from "@/components/home/hero";
import { FeaturedProject } from "@/components/project/featured-project";
import { ProjectCard } from "@/components/project/project-card";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight, Download, Mail } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/config/site";
import { CATEGORIES } from "@/config/taxonomy";
import { compareProjects, getAllProjects, toSummary } from "@/lib/content/projects";
import { personJsonLd, JsonLd } from "@/lib/seo";
import { resumeHref } from "@/lib/site-links";

/** The "In the Lab" category gets an accent dot wherever categories are listed. */
const LAB = "lab";

export default async function HomePage() {
  const projects = await getAllProjects();
  const featured = projects.filter((p) => p.tier === "featured");
  const archive = projects.filter((p) => p.tier === "archive");
  const active = projects.filter((p) => p.status === "active").slice(0, 4);
  const resume = resumeHref();

  // Category tabs: every project as a card, featured work first within each tab.
  const tabItems: TabItem[] = [...projects].sort(compareProjects).map((p) => ({
    slug: p.slug,
    categories: p.categories,
    highlight: p.tier === "project",
    card: <ProjectCard project={toSummary(p)} />,
  }));
  const tabCategories = CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    count: projects.filter((p) => p.categories.includes(c.id)).length,
    dot: c.id === LAB,
  })).filter((c) => c.count > 0);

  return (
    <>
      <JsonLd data={personJsonLd()} />

      <Hero active={active.map(toSummary)} />

      <AtAGlance projects={projects} />

      {featured.length > 0 && (
        <section aria-labelledby="featured" className="page gutter mt-24 scroll-mt-20 md:mt-36">
          <SectionHeading id="featured" index="A" title="Featured work" />
          <div className="space-y-20 md:space-y-32">
            {featured.map((project, i) => (
              <FeaturedProject key={project.slug} project={project} index={i} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="browse" className="page gutter mt-32 md:mt-48">
        <SectionHeading id="browse" index="B" title="Browse by category" />
        <CategoryTabs items={tabItems} categories={tabCategories} />
      </section>

      {archive.length > 0 && (
        <section aria-label="Archive" className="page gutter mt-24">
          <ArchiveTeaser projects={archive.map(toSummary)} />
        </section>
      )}

      <section aria-labelledby="about" className="page gutter mt-32 md:mt-48">
        <SectionHeading id="about" index="C" title="About" />
        <div className="grid gap-10 md:grid-cols-12">
          {site.photo && (
            <Image
              src={site.photo}
              alt={`Portrait of ${site.name}`}
              width={480}
              height={480}
              className="aspect-square w-40 rounded-lg object-cover md:col-span-3 md:w-full"
            />
          )}
          <div className={site.photo ? "md:col-span-8 md:col-start-5" : "md:col-span-9"}>
            <p className="text-lead text-fg">{site.bio}</p>
            {site.openTo && <p className="mt-5 text-fg-muted">{site.openTo}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/about" icon={<ArrowRight className="size-3.5" />}>
                More about me
              </ButtonLink>
              {resume && (
                <ButtonLink href={resume} variant="secondary" icon={<Download className="size-4" />} download>
                  Résumé
                </ButtonLink>
              )}
              <ButtonLink href={`mailto:${site.email}`} variant="secondary" icon={<Mail className="size-4" />}>
                Email me
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
