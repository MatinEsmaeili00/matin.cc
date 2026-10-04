import { site } from "@/config/site";
import { getAllProjects } from "@/lib/content/projects";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = `${site.name} — ${site.roles[0]}`;

export default async function Image() {
  const featured = (await getAllProjects()).find((p) => p.tier === "featured" && p.cover);
  return renderOgImage({
    eyebrow: site.roles.join(" · "),
    title: site.name,
    subtitle: site.tagline,
    image: featured?.cover?.src,
  });
}
