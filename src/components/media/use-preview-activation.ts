"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * When should a preview play?
 *   - Mouse/trackpad devices: while the card (closest [data-preview-root]) is hovered or focused.
 *   - Touch devices: while the element is ~60% on screen.
 *   - Never with prefers-reduced-motion or Save-Data.
 *
 * `exclusive` previews (YouTube iframes) stop any other exclusive preview when
 * they start, so a phone never runs more than one embedded player at a time.
 * `generation` increments on every activation so callers can reset per-play state.
 */
let stopCurrentExclusive: (() => void) | null = null;

export function usePreviewActivation(
  ref: RefObject<HTMLElement | null>,
  { exclusive = false }: { exclusive?: boolean } = {},
) {
  const [state, setState] = useState({ active: false, generation: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduceMotion || saveData) return;

    const stop = () => setState((s) => (s.active ? { ...s, active: false } : s));
    const start = () => {
      if (exclusive) {
        if (stopCurrentExclusive && stopCurrentExclusive !== stop) stopCurrentExclusive();
        stopCurrentExclusive = stop;
      }
      setState((s) => (s.active ? s : { active: true, generation: s.generation + 1 }));
    };

    const hoverDevice = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (hoverDevice) {
      const root = el.closest<HTMLElement>("[data-preview-root]") ?? el.parentElement ?? el;
      root.addEventListener("pointerenter", start);
      root.addEventListener("pointerleave", stop);
      root.addEventListener("focusin", start);
      root.addEventListener("focusout", stop);
      return () => {
        root.removeEventListener("pointerenter", start);
        root.removeEventListener("pointerleave", stop);
        root.removeEventListener("focusin", start);
        root.removeEventListener("focusout", stop);
        if (stopCurrentExclusive === stop) stopCurrentExclusive = null;
      };
    }

    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      threshold: 0.6,
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (stopCurrentExclusive === stop) stopCurrentExclusive = null;
    };
  }, [ref, exclusive]);

  return state;
}
