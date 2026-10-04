"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoAsset } from "@/lib/content/projects";
import { cn } from "@/lib/utils";
import { usePreviewActivation } from "./use-preview-activation";

/**
 * Muted looping preview layered over a poster image. Plays on hover (mouse)
 * or when on screen (touch) — see usePreviewActivation.
 *
 * - Never downloads until it's about to play (preload="none").
 * - Fades in only once frames are actually playing, so there's no flash.
 * - Decorative: hidden from assistive tech; the surrounding card carries the meaning.
 */
export function PreviewVideo({ video, className }: { video: VideoAsset; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const { active } = usePreviewActivation(ref);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      el.play().catch(() => {
        /* autoplay refused (e.g. low-power mode) — the poster stays */
      });
    } else {
      el.pause();
    }
  }, [active]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      className={cn(
        "pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-500",
        playing ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {video.webm && <source src={video.webm} type="video/webm" />}
      <source src={video.mp4} type="video/mp4" />
    </video>
  );
}
