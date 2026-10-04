import { ViewTransition, type ReactNode } from "react";

/**
 * Shared-element morphs between pages (React <ViewTransition>, View
 * Transitions API). When a navigation unmounts one <Morph name="x"> and mounts
 * another with the same name — a card's media and the project page's hero —
 * the browser animates one into the other. Browsers without the API just
 * navigate. The CSS lives in globals.css ("Page transitions").
 *
 * Names must be unique on a page: a duplicate cancels the whole transition.
 * Use the morphName helpers so both sides always agree.
 */
export function Morph({
  name,
  kind = "media",
  only,
  children,
}: {
  name: string;
  kind?: "media" | "text";
  /** Only morph during navigations of this transition type (e.g. the "Next project" link's own). */
  only?: string;
  children: ReactNode;
}) {
  const share = only ? { [only]: `morph-${kind}`, default: "none" } : `morph-${kind}`;
  return (
    <ViewTransition name={name} share={share} default="none">
      {children}
    </ViewTransition>
  );
}

export const morphName = {
  media: (slug: string) => `media-${slug}`,
  title: (slug: string) => `title-${slug}`,
  piece: (slug: string, id: string) => `piece-${slug}-${id}`,
};

/**
 * Spread onto links that open a project (cards, rows, "Now building"): the
 * "open-project" transition type makes the project page rise in, and
 * data-scroll-first lets the morph start from anywhere on the page
 * (components/layout/scroll-first.tsx).
 */
export const openProject = { transitionTypes: ["open-project"], "data-scroll-first": "" };

/** Links whose destination should be scrolled into place before morphing (e.g. tech tags → /work). */
export const scrollFirst = { "data-scroll-first": "" };
