"use client";

import Image from "next/image";
import { useState } from "react";
import type { VideoAsset } from "@/lib/content/projects";
import { Play } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { PreviewVideo } from "./preview-video";

type Poster = { src: string; width: number; height: number };

/**
 * Click-to-load YouTube player ("facade").
 *
 * Until the visitor presses play this is just an optimized image (plus an
 * optional muted local preview loop) — no YouTube JavaScript, cookies or
 * iframes. That keeps project grids and case studies fast no matter how many
 * videos a page lists.
 */
export function YouTubePlayer({
  id,
  title,
  poster,
  preview,
  priority = false,
  sizes = "(min-width: 1280px) 1200px, 100vw",
  autoPlay = false,
  className,
}: {
  id: string;
  title: string;
  poster: Poster;
  preview?: VideoAsset | null;
  priority?: boolean;
  sizes?: string;
  /** Start in the playing state (only after an explicit user action elsewhere). */
  autoPlay?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState(autoPlay);
  const [warmed, setWarmed] = useState(false);

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-ink-2", className)}>
      {/* Warm up connections on intent so the player starts faster. */}
      {warmed && (
        <>
          <link rel="preconnect" href="https://www.youtube-nocookie.com" />
          <link rel="preconnect" href="https://www.google.com" />
          <link rel="preconnect" href="https://i.ytimg.com" />
        </>
      )}

      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          onPointerEnter={() => setWarmed(true)}
          onFocus={() => setWarmed(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 size-full cursor-pointer text-left"
          data-preview-root
        >
          <Image
            src={poster.src}
            alt=""
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.015]"
          />
          {preview && <PreviewVideo video={preview} mode="inview" />}
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute bottom-0 left-0 flex items-center gap-3 p-4 sm:p-6">
            <span className="flex size-12 items-center justify-center bg-fg text-ink transition-colors group-hover:bg-accent sm:size-14">
              <Play className="size-4 translate-x-px sm:size-5" />
            </span>
            <span className="hidden max-w-[40ch] font-mono text-[0.75rem] leading-snug tracking-[0.06em] text-fg uppercase sm:block">
              {title}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
