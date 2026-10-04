import Image from "next/image";
import { ProceduralCover } from "@/components/media/procedural-cover";
import { PreviewVideo } from "@/components/media/preview-video";
import { YouTubePlayer } from "@/components/media/youtube-player";
import type { Project } from "@/lib/content/projects";
import { getYouTubeVideo } from "@/lib/youtube";
import { techLabels } from "./format";

const SIZES = "(min-width: 1680px) 1580px, 100vw";

/**
 * The big visual at the top of a case study, in order of preference:
 *   YouTube video (local preview loop + cover as the facade)
 *   → local preview loop → cover image → procedural stand-in.
 */
export async function ProjectHeroMedia({ project }: { project: Project }) {
  if (project.youtube) {
    const video = await getYouTubeVideo(project.youtube);
    // A local cover is usually sharper than YouTube's thumbnail.
    const poster = project.cover && !project.cover.src.includes("ytimg.com") ? project.cover : video.thumbnail;
    return (
      <YouTubePlayer
        id={project.youtube}
        title={video.title}
        poster={poster}
        preview={project.preview}
        priority
        sizes={SIZES}
      />
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-ink-2">
      {project.cover ? (
        <Image src={project.cover.src} alt={project.cover.alt} fill priority sizes={SIZES} className="object-cover" />
      ) : (
        <ProceduralCover seed={project.slug} label={techLabels(project.tech, 4).join(" · ")} />
      )}
      {project.preview && <PreviewVideo video={project.preview} mode="inview" />}
    </div>
  );
}
