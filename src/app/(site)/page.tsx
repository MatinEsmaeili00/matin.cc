import Image from "next/image";
import { AtAGlance } from "@/components/home/at-a-glance";
import { Hero } from "@/components/home/hero";
import { HomeSection } from "@/components/home/home-section";
import { SectionNav } from "@/components/home/section-nav";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight, Download, Mail } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { HOME_SECTIONS } from "@/config/home";
import { site } from "@/config/site";
import { getAllProjects, toSummary } from "@/lib/content/projects";
import { personJsonLd, JsonLd } from "@/lib/seo";
import { resumeHref } from "@/lib/site-links";

export default async function HomePage() {
  const projects = await getAllProjects();
  const active = projects.filter((p) => p.status === "active").slice(0, 4);
  const resume = resumeHref();

  // Sections from content/settings/home.json, each with the projects that chose it.
  const sections = HOME_SECTIONS.map((section) => {
    const members = projects.filter((p) => p.homeSection === section.id);
    const count = members.reduce((n, p) => n + Math.max(p.items.length, 1), 0);
    return { section, members, count };
  }).filter((s) => s.members.length > 0);

  return (
    <>
      <JsonLd data={personJsonLd()} />

      <Hero active={active.map(toSummary)} />

      <AtAGlance projects={projects} />

      <div id="work" className="mt-24 scroll-mt-14 md:mt-32">
        <SectionNav
          sections={sections.map(({ section, count }) => ({ id: section.id, title: section.title, count }))}
        />
        {sections.map(({ section, members }) => (
          <HomeSection key={section.id} section={section} projects={members} />
        ))}
      </div>

      <section aria-labelledby="about" className="page gutter mt-32 md:mt-48">
        <SectionHeading id="about" index="—" title="About" />
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
