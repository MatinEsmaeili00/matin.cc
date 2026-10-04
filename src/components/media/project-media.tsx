import Image from "next/image";
import type { ImageAsset, VideoAsset } from "@/lib/content/projects";
import { cn } from "@/lib/utils";
import { PreviewVideo } from "./preview-video";
import { YouTubeHoverPreview } from "./youtube-hover-preview";
import { ProceduralCover } from "./procedural-cover";

/**
 * The visual for a project in a grid or featured row: cover image, an
 * optional muted preview loop on top, or the procedural stand-in when the
 * project has no media yet. Always a fixed aspect ratio, so layouts never shift.
 */
export function ProjectMedia({
  slug,
  cover,
  preview,
  label,
  sizes,
  priority = false,
  youtube,
  aspect = "aspect-video",
  className,
}: {
  slug: string;
  cover: ImageAsset | null;
  preview: VideoAsset | null;
  /** Shown on the procedural cover only. */
  label?: string;
  sizes: string;
  priority?: boolean;
  /** YouTube id: plays a muted embed on hover when there's no local preview loop. */
  youtube?: string | null;
  aspect?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg bg-ink-2", aspect, className)}>
      {cover ? (
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]"
        />
      ) : (
        <ProceduralCover seed={slug} label={label} />
      )}
      {preview ? <PreviewVideo video={preview} /> : youtube ? <YouTubeHoverPreview id={youtube} /> : null}
    </div>
  );
}
