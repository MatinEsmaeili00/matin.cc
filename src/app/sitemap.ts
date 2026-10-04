import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getAllProjects } from "@/lib/content/projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getAllProjects();
  const url = (path: string) => new URL(path, site.url).toString();

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/work"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.7 },
    ...projects.map((p) => ({
      url: url(p.url),
      changeFrequency: (p.status === "active" ? "weekly" : "yearly") as "weekly" | "yearly",
      priority: p.tier === "featured" ? 0.9 : p.tier === "project" ? 0.7 : 0.4,
      images: p.cover && p.cover.src.startsWith("/") ? [url(p.cover.src)] : undefined,
    })),
  ];
}
