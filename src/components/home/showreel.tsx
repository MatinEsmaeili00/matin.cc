"use client";

import { useState } from "react";
import { YouTubePlayer } from "@/components/media/youtube-player";
import { Play } from "@/components/ui/icons";

/**
 * "Play reel" in the hero. Nothing from YouTube loads until it's pressed;
 * then the player opens full-width below the hero text and starts playing.
 */
export function Showreel({ id, title, poster }: { id: string; title: string; poster: { src: string; width: number; height: number } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-10">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group inline-flex min-h-11 items-center gap-3 font-mono text-[0.75rem] tracking-[0.12em] text-fg uppercase"
        >
          <span className="flex size-9 items-center justify-center bg-fg text-ink transition-colors group-hover:bg-accent">
            <Play className="size-3.5 translate-x-px" />
          </span>
          Play reel
        </button>
      )}
      {open && (
        <div>
          <YouTubePlayer id={id} title={title} poster={poster} autoPlay />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="label mt-3 min-h-10 hover:text-fg"
          >
            Close reel
          </button>
        </div>
      )}
    </div>
  );
}
