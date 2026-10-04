import { site } from "@/config/site";
import { getCategory, techLabel } from "@/config/taxonomy";
import type { Project } from "@/lib/content/projects";
import { githubRepoUrl, youtubeWatchUrl } from "@/lib/refs";
import type { YouTubeVideo } from "@/lib/youtube";

type Json = Record<string, unknown>;

/** Renders structured data. `<` is escaped so content can't break out of the script tag. */
export function JsonLd({ data }: { data: Json | Json[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const personRef = { "@type": "Person", name: site.name, url: site.url };

export function personJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: site.roles[0],
    description: site.description,
    sameAs: site.social.map((s) => s.href),
    knowsAbout: [
      "Graphics programming",
      "Rendering engineering",
      "Technical art",
      "Compute shaders",
      "Unreal Engine",
      "Unity",
      "Virtual reality",
      "Digital twins",
    ],
  };
}

export function projectJsonLd(project: Project, video: YouTubeVideo | null): Json[] {
  const url = new URL(project.url, site.url).toString();
  const image = project.cover ? new URL(project.cover.src, site.url).toString() : undefined;

  const work: Json = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.summary,
    url,
    image,
    dateCreated: String(project.year),
    author: personRef,
    creator: personRef,
    genre: project.categories.map((c) => getCategory(c).label),
    keywords: project.tech.map(techLabel).join(", "),
    ...(project.github && {
      isBasedOn: {
        "@type": "SoftwareSourceCode",
        codeRepository: githubRepoUrl(project.github),
        author: personRef,
      },
    }),
  };

  const breadcrumbs: Json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Work", item: new URL("/work", site.url).toString() },
      { "@type": "ListItem", position: 2, name: project.title, item: url },
    ],
  };

  const out = [work, breadcrumbs];

  // Google requires uploadDate for VideoObject; it's only known with YOUTUBE_API_KEY.
  if (video?.publishedAt) {
    out.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: video.title,
      description: video.description || project.summary,
      thumbnailUrl: video.thumbnail.src,
      uploadDate: video.publishedAt,
      duration: video.duration,
      contentUrl: youtubeWatchUrl(video.id),
      embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}`,
    });
  }

  return out;
}
