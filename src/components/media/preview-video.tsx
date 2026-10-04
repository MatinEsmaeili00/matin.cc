"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoAsset } from "@/lib/content/projects";
import { cn } from "@/lib/utils";

type Mode =
  /** Play whenever it's on screen (featured rows, case-study media). */
  | "inview"
  /** Hover-capable devices: play on hover. Touch devices: play when on screen. */
  | "hover";

/**
 * Muted looping preview layered over a poster image.
 *
 * - Never downloads until it's about to play (preload="none").
 * - Never plays with prefers-reduced-motion or Save-Data; the poster stays.
 * - Fades in only once frames are actually playing, so there's no flash.
 * - Decorative: hidden from assistive tech; the surrounding card carries the meaning.
 */
export function PreviewVideo({
  video,
  mode = "inview",
  className,
}: {
  video: VideoAsset;
  mode?: Mode;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduceMotion || saveData) return;

    const play = () => {
      el.play().catch(() => {
        /* autoplay refused (e.g. low-power mode) — the poster stays */
      });
    };
    const pause = () => el.pause();

    const hoverDevice = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (mode === "hover" && hoverDevice) {
      const root = el.closest<HTMLElement>("[data-preview-root]") ?? el.parentElement!;
      root.addEventListener("pointerenter", play);
      root.addEventListener("pointerleave", pause);
      root.addEventListener("focusin", play);
      root.addEventListener("focusout", pause);
      return () => {
        root.removeEventListener("pointerenter", play);
        root.removeEventListener("pointerleave", pause);
        root.removeEventListener("focusin", play);
        root.removeEventListener("focusout", pause);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : pause()),
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mode]);

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
