import type { Metadata } from "next";
import { ArchiveRow } from "@/components/project/archive-list";
import { categoryLabels, techLabels } from "@/components/project/format";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectExplorer, type ExplorerItem } from "@/components/project/project-explorer";
import { CATEGORIES, TECH, TECH_IDS } from "@/config/taxonomy";
import { byRecency, getAllProjects, toSummary } from "@/lib/content/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Every project — rendering and GPU compute, technical art, XR digital twins, robotics, games, tools and virtual production. Filter by discipline or technology.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const projects = [...(await getAllProjects())].sort(byRecency);
  const years = projects.map((p) => p.year);

  const items: ExplorerItem[] = projects.map((p) => {
    const summary = toSummary(p);
    const archive = p.tier === "archive";
    return {
      slug: p.slug,
      archive,
      categories: p.categories,
      tech: p.tech,
      haystack: [p.title, p.summary, p.role ?? "", p.context ?? "", ...categoryLabels(p.categories), ...techLabels(p.tech)]
        .join(" ")
        .toLowerCase(),
      node: archive ? <ArchiveRow project={summary} /> : <ProjectCard project={summary} />,
    };
  });

  // Only offer filters that match at least one project.
  const usedCategories = CATEGORIES.filter((c) => projects.some((p) => p.categories.includes(c.id)));
  const techCount = (id: string) => projects.filter((p) => (p.tech as string[]).includes(id)).length;
  const usedTech = TECH_IDS.filter((id) => techCount(id) > 0);
  const option = (id: (typeof TECH_IDS)[number]) => ({ id, label: TECH[id].label });

  return (
    <>
      <header className="page gutter pt-12 pb-10 md:pt-20 md:pb-14">
        <p className="label">Index · {Math.min(...years)} — {Math.max(...years)}</p>
        <h1 className="mt-4 text-title font-semibold tracking-[-0.035em] uppercase semi-wide">Work</h1>
        <p className="mt-6 max-w-2xl text-lead text-fg-muted">
          {projects.length} projects across rendering, technical art, XR, robotics, games and virtual production.
          Filter by discipline or by the engines and languages behind them.
        </p>
      </header>

      <ProjectExplorer
        items={items}
        categories={usedCategories.map((c) => ({ id: c.id, label: c.label }))}
        primaryTech={usedTech.filter((id) => "primary" in TECH[id]).map(option)}
        moreTech={usedTech
          .filter((id) => !("primary" in TECH[id]))
          .sort((a, b) => techCount(b) - techCount(a))
          .map(option)}
      />
    </>
  );
}
