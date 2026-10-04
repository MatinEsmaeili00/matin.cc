import "server-only";
import path from "node:path";
import { cache } from "react";
import GithubSlugger from "github-slugger";
import { imageSizeFromFile } from "image-size/fromFile";
import type { CategoryId, TechId } from "@/config/taxonomy";
import { getYouTubeThumbnail } from "@/lib/youtube";
import { loadProjects, publicFileExists, PUBLIC_DIR, withExtension, type RawProject } from "./load";
import type { ProjectFrontmatter, ProjectStatus, ProjectTier } from "./schema";

export type ImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type VideoAsset = {
  mp4: string;
  webm: string | null;
  poster: string | null;
};

export type GalleryItem =
  | ({ kind: "image"; caption?: string } & ImageAsset)
  | ({ kind: "video"; alt: string; caption?: string } & VideoAsset);

/** A piece inside a collection project (shown as its own card on the homepage). */
export type ProjectItem = {
  /** Anchor on the project page: /work/<slug>#<id> */
  id: string;
  title: string;
  summary: string | null;
  youtube: string | null;
  tech: TechId[];
  /** Local loop, if any. */
  video: VideoAsset | null;
  /** Still: local image, loop poster, or YouTube thumbnail. */
  image: ImageAsset | null;
};

export type Project = Omit<ProjectFrontmatter, "cover" | "preview" | "gallery" | "items"> & {
  slug: string;
  url: string;
  body: string;
  /** "2024 — present", "2023 — 2025", "2021" */
  period: string;
  /** Best image for cards and social previews; null → procedural cover. */
  cover: ImageAsset | null;
  preview: VideoAsset | null;
  gallery: GalleryItem[];
  items: ProjectItem[];
};

/** The subset sent to client components (the Work explorer). */
export type ProjectSummary = {
  slug: string;
  url: string;
  title: string;
  summary: string;
  year: number;
  period: string;
  status: ProjectStatus;
  tier: ProjectTier;
  categories: CategoryId[];
  tech: TechId[];
  cover: ImageAsset | null;
  preview: VideoAsset | null;
  /** Main YouTube video — fallback hover preview when there's no local loop. */
  youtube: string | null;
};

const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

export const getAllProjects = cache(async (): Promise<Project[]> => {
  const { projects, errors } = loadProjects({ includeDrafts: process.env.NODE_ENV === "development" });
  if (errors.length) {
    // Fail the build loudly instead of shipping a page with missing content.
    throw new Error(`Invalid project content:\n\n${errors.join("\n\n")}\n\nRun "npm run validate" for details.`);
  }
  const resolved = await Promise.all(projects.map(resolveProject));
  return resolved.sort(compareProjects);
});

export async function getProject(slug: string): Promise<Project | null> {
  const all = await getAllProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

export function toSummary(p: Project): ProjectSummary {
  return {
    slug: p.slug,
    url: p.url,
    title: p.title,
    summary: p.summary,
    year: p.year,
    period: p.period,
    status: p.status,
    tier: p.tier,
    categories: p.categories,
    tech: p.tech,
    cover: p.cover,
    preview: p.preview,
    youtube: p.youtube ?? null,
  };
}

const TIER_ORDER: Record<ProjectTier, number> = { featured: 0, project: 1, archive: 2 };

/** Tier, then priority (high first), then most recent end/start year. */
export function compareProjects(a: Project, b: Project): number {
  return (
    TIER_ORDER[a.tier] - TIER_ORDER[b.tier] ||
    b.priority - a.priority ||
    recency(b) - recency(a) ||
    a.title.localeCompare(b.title)
  );
}

function recency(p: Project): number {
  if (p.yearEnd === "present") return 9999;
  return p.yearEnd ?? p.year;
}

/** Newest work first regardless of tier, then by priority — used by the explorer. */
export function byRecency(a: Project, b: Project): number {
  return b.year - a.year || b.priority - a.priority || a.title.localeCompare(b.title);
}

async function resolveProject(raw: RawProject): Promise<Project> {
  const { data } = raw;

  const preview = data.preview ? resolveVideo(raw, data.preview) : null;
  const gallery = (
    await Promise.all(
      data.gallery.map(async (item): Promise<GalleryItem | null> => {
        if (VIDEO_EXT.test(item.src)) {
          const video = resolveVideo(raw, item.src);
          return video ? { kind: "video", alt: item.alt, caption: item.caption, ...video } : null;
        }
        const image = await resolveImage(raw, item.src, item.alt);
        return image ? { kind: "image", caption: item.caption, ...image } : null;
      }),
    )
  ).filter((g): g is GalleryItem => g !== null);

  const items = await resolveItems(raw);
  const cover = (await resolveCover(raw, preview, gallery)) ?? items.find((i) => i.image)?.image ?? null;

  return {
    ...data,
    slug: raw.slug,
    url: `/work/${raw.slug}`,
    body: raw.body,
    period: formatPeriod(data.year, data.yearEnd),
    cover,
    preview,
    gallery,
    items,
  };
}

async function resolveItems(raw: RawProject): Promise<ProjectItem[]> {
  const slugger = new GithubSlugger();
  return Promise.all(
    raw.data.items.map(async (item): Promise<ProjectItem> => {
      let video: VideoAsset | null = null;
      let image: ImageAsset | null = null;
      if (item.media && VIDEO_EXT.test(item.media)) {
        video = resolveVideo(raw, item.media);
        if (video?.poster) image = await resolveImage(raw, video.poster, item.title);
      } else if (item.media) {
        image = await resolveImage(raw, item.media, item.title);
      }
      if (!image && item.youtube) image = { ...(await getYouTubeThumbnail(item.youtube)), alt: item.title };
      return {
        id: slugger.slug(item.title),
        title: item.title,
        summary: item.summary ?? null,
        youtube: item.youtube ?? null,
        tech: item.tech,
        video,
        image,
      };
    }),
  );
}

async function resolveCover(
  raw: RawProject,
  preview: VideoAsset | null,
  gallery: GalleryItem[],
): Promise<ImageAsset | null> {
  const alt = raw.data.title;
  if (raw.data.cover) {
    const image = await resolveImage(raw, raw.data.cover, alt);
    if (image) return image;
  }
  if (preview?.poster) {
    const image = await resolveImage(raw, preview.poster, alt);
    if (image) return image;
  }
  if (raw.data.youtube) {
    const thumb = await getYouTubeThumbnail(raw.data.youtube);
    return { ...thumb, alt };
  }
  const firstImage = gallery.find((g) => g.kind === "image");
  if (firstImage && firstImage.kind === "image") return { ...firstImage, alt };
  return null;
}

async function resolveImage(raw: RawProject, src: string, alt: string): Promise<ImageAsset | null> {
  if (src.startsWith("https://")) {
    // Remote images need explicit dimensions; assume 16:9 and render with object-fit.
    return { src, width: 1600, height: 900, alt };
  }
  if (!publicFileExists(src)) {
    warnMissing(raw, src);
    return null;
  }
  try {
    const size = await imageSizeFromFile(path.join(PUBLIC_DIR, decodeURI(src)));
    return { src, width: size.width, height: size.height, alt };
  } catch {
    return { src, width: 1600, height: 900, alt };
  }
}

function resolveVideo(raw: RawProject, src: string): VideoAsset | null {
  if (src.startsWith("https://")) return { mp4: src, webm: null, poster: null };
  if (!publicFileExists(src)) {
    warnMissing(raw, src);
    return null;
  }
  const webm = withExtension(src, ".webm");
  const poster = withExtension(src, ".jpg");
  return {
    mp4: src,
    webm: webm !== src && publicFileExists(webm) ? webm : null,
    poster: publicFileExists(poster) ? poster : null,
  };
}

const warned = new Set<string>();
function warnMissing(raw: RawProject, src: string) {
  const key = `${raw.file}:${src}`;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[content] ${raw.file}: missing media file public${src} — it will be skipped`);
}

export function formatPeriod(year: number, yearEnd?: number | "present"): string {
  if (yearEnd === undefined || yearEnd === year) return String(year);
  return `${year} — ${yearEnd === "present" ? "present" : yearEnd}`;
}
