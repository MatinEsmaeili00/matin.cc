import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getMDXComponents } from "@/components/mdx/mdx-components";
import { ProjectMedia } from "@/components/media/project-media";
import { categoryLabels, STATUS_LABEL } from "@/components/project/format";
import { Gallery } from "@/components/project/gallery";
import { PieceGrid } from "@/components/project/item-card";
import { Metrics } from "@/components/project/metrics";
import { ProjectFacts } from "@/components/project/project-facts";
import { ProjectHeroMedia } from "@/components/project/project-hero-media";
import { ProjectLinks } from "@/components/project/project-links";
import { RepositoryPanel } from "@/components/project/repository-panel";
import { Toc } from "@/components/project/toc";
import { VideoList } from "@/components/project/video-list";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { extractToc, renderMDX } from "@/lib/content/mdx";
import { getAllProjects, getProject } from "@/lib/content/projects";
import { JsonLd, projectJsonLd } from "@/lib/seo";
import { getYouTubeVideo } from "@/lib/youtube";

// Every project page is prebuilt at deploy time (GitHub/YouTube data included).
// Unknown slugs 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    keywords: [...categoryLabels(project.categories)],
    alternates: { canonical: project.url },
    openGraph: { type: "article", url: project.url, title: project.title, description: project.summary },
    twitter: { card: "summary_large_image", title: project.title, description: project.summary },
  };
}

export default async function ProjectPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) notFound();

  const all = await getAllProjects();
  const next = all[(all.findIndex((p) => p.slug === slug) + 1) % all.length];

  const toc = extractToc(project.body);
  const content = project.body.trim() ? await renderMDX(project.body, getMDXComponents(project)) : null;
  const heroVideo = project.youtube ? await getYouTubeVideo(project.youtube) : null;
  const extraVideos = project.videos.filter((v) => v.id !== project.youtube);

  return (
    <article>
      <JsonLd data={projectJsonLd(project, heroVideo)} />

      <header className="page gutter pt-10 md:pt-16">
        <Link href="/work" className="label inline-flex min-h-11 items-center gap-3 transition-colors hover:text-fg">
          <ArrowLeft className="size-3.5" /> All work
        </Link>

        <p className="label mt-8 md:mt-12">
          {categoryLabels(project.categories).join(" / ")} · {project.period} · {STATUS_LABEL[project.status]}
        </p>
        <h1 className="mt-4 max-w-[18ch] text-title font-semibold tracking-[-0.035em] text-balance semi-wide">
          {project.title}
        </h1>
        <p className="mt-6 max-w-3xl text-lead text-pretty text-fg-muted">{project.summary}</p>

        <div className="mt-10">
          <ProjectFacts project={project} />
        </div>
        <div className="mt-6">
          <ProjectLinks project={project} />
        </div>
      </header>

      <div className="page gutter mt-10 md:mt-14">
        <ProjectHeroMedia project={project} />
      </div>

      {(project.highlights.length > 0 || project.metrics.length > 0) && (
        <div className="page gutter mt-16 grid gap-10 md:mt-24 lg:grid-cols-12">
          {project.highlights.length > 0 && (
            <div className="lg:col-span-8 lg:col-start-5">
              <p className="label mb-5">Highlights</p>
              <ul className="space-y-3">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-4 text-lead leading-snug text-fg">
                    <span aria-hidden className="mt-[0.6em] h-px w-4 shrink-0 bg-accent" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {project.metrics.length > 0 && (
            <div className="lg:col-span-8 lg:col-start-5">
              <Metrics items={project.metrics} />
            </div>
          )}
        </div>
      )}

      {project.items.length > 0 && (
        <Section title="Pieces" count={project.items.length}>
          <PieceGrid items={project.items} />
        </Section>
      )}

      {content && (
        <div className="page gutter mt-16 grid gap-10 md:mt-24 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block">
            <Toc entries={toc} />
          </aside>
          <div className="prose-case min-w-0 lg:col-span-8 lg:col-start-5">{content}</div>
        </div>
      )}

      {extraVideos.length > 0 && (
        <Section title="Videos" count={extraVideos.length}>
          <VideoList videos={extraVideos} />
        </Section>
      )}

      {project.gallery.length > 0 && (
        <Section title="Gallery" count={project.gallery.length}>
          <Gallery items={project.gallery} />
        </Section>
      )}

      {project.github && (
        <Section title="Repository">
          <RepositoryPanel repo={project.github} />
        </Section>
      )}

      {next && next.slug !== project.slug && (
        <nav aria-label="Next project" className="page gutter mt-32">
          <Link href={next.url} className="group grid gap-6 border-t border-line pt-6 md:grid-cols-12" data-preview-root>
            <div className="md:col-span-4">
              <p className="label">Next project</p>
              <p className="mt-3 flex items-center gap-4 text-heading font-semibold tracking-tight semi-wide group-hover:text-accent">
                {next.title}
                <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </p>
              <p className="mt-3 text-fg-muted">{next.summary}</p>
            </div>
            <div className="md:col-span-5 md:col-start-8">
              <ProjectMedia slug={next.slug} cover={next.cover} preview={next.preview} youtube={next.youtube} sizes="(min-width: 768px) 40vw, 100vw" />
            </div>
          </Link>
        </nav>
      )}
    </article>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <section className="page gutter mt-24 grid gap-8 md:mt-32 lg:grid-cols-12">
      <h2 className="flex items-baseline gap-3 text-xl font-semibold tracking-tight semi-wide lg:col-span-3">
        {title}
        {count !== undefined && <span className="label">{String(count).padStart(2, "0")}</span>}
      </h2>
      <div className="min-w-0 lg:col-span-8 lg:col-start-5">{children}</div>
    </section>
  );
}
