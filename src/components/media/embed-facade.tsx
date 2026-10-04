"use client";

import { useState } from "react";
import { Play } from "@/components/ui/icons";

/**
 * Click-to-load iframe for heavy third-party viewers (Gaussian-splat
 * viewers, Sketchfab, Shadertoy…). Nothing loads until the visitor asks.
 */
export function EmbedFacade({
  src,
  title,
  aspect = "16 / 9",
  caption,
}: {
  src: string;
  title: string;
  aspect?: string;
  caption?: string;
}) {
  const [active, setActive] = useState(false);
  const host = safeHost(src);

  return (
    <figure className="not-prose my-10">
      <div className="relative w-full overflow-hidden border border-line bg-ink-2" style={{ aspectRatio: aspect }}>
        {active ? (
          <iframe
            src={src}
            title={title}
            allow="fullscreen; xr-spatial-tracking; accelerometer; gyroscope"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="group absolute inset-0 flex size-full flex-col items-center justify-center gap-4 text-center"
          >
            <span className="flex size-14 items-center justify-center bg-fg text-ink transition-colors group-hover:bg-accent">
              <Play className="size-5 translate-x-px" />
            </span>
            <span className="font-mono text-[0.75rem] tracking-[0.06em] text-fg uppercase">Load interactive viewer</span>
            <span className="label">{title}{host && ` · ${host}`}</span>
          </button>
        )}
      </div>
      {caption && <figcaption className="label mt-3 normal-case tracking-[0.02em]">{caption}</figcaption>}
    </figure>
  );
}

function safeHost(src: string): string | null {
  try {
    return new URL(src).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
