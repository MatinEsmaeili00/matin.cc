"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Makes page-to-page morphs work from anywhere on a page.
 *
 * React only morphs shared elements it measures on screen, and it measures the
 * new page before Next resets the scroll — so a card opened from far down the
 * homepage would find the project's hero "off screen" and skip the morph.
 * After a click on a link marked `data-scroll-first`, this puts the new page
 * at its final scroll position (top, or the #piece being opened) in a layout
 * effect: the new page is in the DOM by then, and React measures right after.
 * The jump is instant (the site otherwise scrolls smoothly). Other
 * navigations, back/forward and first load are left to Next and the browser.
 */
export function ScrollFirst() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const clickedAt = useRef(-Infinity);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest("a[data-scroll-first]")) clickedAt.current = performance.now();
    };
    // Capture phase: runs before Next's <Link> handles (and prevents) the click.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useLayoutEffect(() => {
    if (performance.now() - clickedAt.current > 5000) return;
    clickedAt.current = -Infinity;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (target) target.scrollIntoView({ behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, search]);

  return null;
}
