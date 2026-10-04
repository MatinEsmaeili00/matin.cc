import { categoryLabels } from "@/components/project/format";
import { getAllProjects, getProject } from "@/lib/content/projects";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Project preview";

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return renderOgImage({ eyebrow: "Work", title: "Project not found" });

  return renderOgImage({
    eyebrow: `${categoryLabels(project.categories)[0]} · ${project.period}`,
    title: project.title,
    subtitle: project.summary,
    image: project.cover?.src,
  });
}
