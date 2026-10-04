"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePreviewActivation } from "./use-preview-activation";

/**
 * Fallback hover preview for media that only exists on YouTube: a muted,
 * chrome-less embed that mounts on hover (or when on screen on touch) and
 * unmounts when you leave. Only one runs at a time. Prefer a local loop
 * (`npm run media -- <slug> <youtube-url> --name preview`) — it's far lighter.
 */
export function YouTubeHoverPreview({ id, className }: { id: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { active, generation } = usePreviewActivation(ref, { exclusive: true });
  const [readyGeneration, setReadyGeneration] = useState(-1);
  const ready = active && readyGeneration === generation;

  const src =
    `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}` +
    "&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0";

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {active && (
        <iframe
          key={generation}
          src={src}
          title=""
          tabIndex={-1}
          allow="autoplay; encrypted-media"
          // YouTube shows a black frame and its title bar briefly; fade in after that.
          onLoad={() => setTimeout(() => setReadyGeneration(generation), 900)}
          className={cn(
            "absolute inset-0 size-full scale-[1.2] border-0 transition-opacity duration-500",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}
