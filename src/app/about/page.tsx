import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { getMDXComponents } from "@/components/mdx/mdx-components";
import { ArrowUpRight } from "@/components/ui/icons";
import { site } from "@/config/site";
import { CATEGORIES, TECH, TECH_IDS, type TechId } from "@/config/taxonomy";
import { CONTENT_DIR } from "@/lib/content/load";
import { renderMDX } from "@/lib/content/mdx";
import { getAllProjects } from "@/lib/content/projects";
import { JsonLd, personJsonLd } from "@/lib/seo";
import { resumeHref } from "@/lib/site-links";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name} — ${site.roles.join(", ")}.`,
  alternates: { canonical: "/about" },
};

const GROUP_LABEL: Record<string, string> = {
  engine: "Engines",
  language: "Languages",
  graphics: "Graphics",
  platform: "Platforms",
  ai: "AI & Robotics",
  production: "Production",
};

export default async function AboutPage() {
  const source = fs.readFileSync(path.join(CONTENT_DIR, "about.mdx"), "utf8");
  const content = await renderMDX(source, getMDXComponents());
  const projects = await getAllProjects();
  const resume = resumeHref();

  // The toolset is derived from the projects themselves, so it never goes stale.
  const usage = new Map<TechId, number>();
  for (const p of projects) for (const t of p.tech) usage.set(t, (usage.get(t) ?? 0) + 1);
  const groups = Object.entries(GROUP_LABEL)
    .map(([group, label]) => ({
      label,
      tech: TECH_IDS.filter((id) => TECH[id].group === group && usage.has(id)).sort(
        (a, b) => usage.get(b)! - usage.get(a)!,
      ),
    }))
    .filter((g) => g.tech.length > 0);

  const disciplines = CATEGORIES.map((c) => ({
    ...c,
    count: projects.filter((p) => p.categories.includes(c.id)).length,
  })).filter((c) => c.count > 0);

  return (
    <>
      <JsonLd data={personJsonLd()} />

      <header className="page gutter pt-12 pb-12 md:pt-20 md:pb-20">
        <p className="label">About</p>
        <h1 className="mt-4 text-title font-semibold tracking-[-0.035em] uppercase semi-wide">{site.name}</h1>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {site.roles.map((role) => (
            <li key={role} className="font-mono text-[0.8125rem] tracking-[0.06em] text-fg-muted uppercase">
              {role}
            </li>
          ))}
        </ul>
      </header>

      <div className="page gutter grid gap-16 lg:grid-cols-12">
        <div className="prose-case min-w-0 lg:col-span-7">{content}</div>

        <aside className="space-y-12 lg:col-span-4 lg:col-start-9">
          <div>
            <p className="label mb-4">Contact</p>
            <a href={`mailto:${site.email}`} className="text-lg break-all text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent">
              {site.email}
            </a>
            <ul className="mt-5 space-y-1">
              {resume && (
                <li>
                  <a href={resume} className="group inline-flex min-h-10 items-center gap-2 text-fg hover:text-accent">
                    Résumé (PDF) <ArrowUpRight className="size-2.5" />
                  </a>
                </li>
              )}
              {site.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="me noopener" className="inline-flex min-h-10 items-center gap-2 text-fg-muted hover:text-fg">
                    {s.label} <ArrowUpRight className="size-2.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label mb-4">Disciplines</p>
            <ul className="border-t border-line">
              {disciplines.map((d) => (
                <li key={d.id}>
                  <a href={`/work?category=${d.id}`} className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-fg-muted hover:text-fg">
                    {d.label}
                    <span className="label">{String(d.count).padStart(2, "0")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label mb-4">Toolset — from {projects.length} projects</p>
            <dl className="space-y-5">
              {groups.map((g) => (
                <div key={g.label}>
                  <dt className="font-mono text-[0.75rem] tracking-[0.06em] text-fg uppercase">{g.label}</dt>
                  <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">
                    {g.tech.map((id) => TECH[id].label).join(" · ")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}
