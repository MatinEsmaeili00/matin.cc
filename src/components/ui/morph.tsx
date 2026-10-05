import { ViewTransition, type ReactNode } from "react";

/**
 * Shared-element morphs between pages (React <ViewTransition>, View
 * Transitions API). When a navigation unmounts one <Morph name="x"> and mounts
 * another with the same name, the browser animates one into the other.
 * Browsers without the API just navigate. The CSS lives in globals.css
 * ("Page transitions").
 *
 * What morphs depends on what was clicked — each link carries transition
 * types (see the link helpers below) and each Morph lists the types it takes
 * part in (`on`):
 *   - a project's name   → the name glides into the page's <h1>
 *   - a project's media  → the page opens at its video (#video) and the media zooms into it
 *   - a tech tag         → cards fly to their places in the filtered Work list
 *
 * Names must be unique on a page: a duplicate cancels the whole transition.
 * Use the morphName helpers so both sides always agree.
 */
export function Morph({
  name,
  kind = "media",
  on,
  children,
}: {
  name: string;
  kind?: "media" | "text";
  /** Transition types this element morphs for (values of VT). */
  on: readonly string[];
  children: ReactNode;
}) {
  const share = Object.fromEntries([...on.map((type) => [type, `morph-${kind}`]), ["default", "none"]]);
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

/** Transition types. Which link was clicked decides what morphs. */
export const VT = {
  /** A project's name → its page, the name gliding into the <h1>. */
  title: "open-title",
  /** A project's media → its page opened at #video, the media zooming into the hero. */
  media: "open-media",
  /** The same two, from the "Next project" block (kept apart so cards never pair with it). */
  nextTitle: "next-title",
  nextMedia: "next-media",
  /** Tech tags → /work?tech=…: cards fly to their places in the filtered list. */
  browse: "browse",
} as const;

/** Where a project's hero video sits on its page; media links open the page there. */
export const VIDEO_ANCHOR = "video";
export const videoHref = (url: string) => `${url}#${VIDEO_ANCHOR}`;

/**
 * Link props. "open-project" makes the project page rise in; data-scroll-first
 * lets a morph start from anywhere on a page (components/layout/scroll-first.tsx).
 */
const opens = (type: string) => ({ transitionTypes: ["open-project", type], "data-scroll-first": "" });
export const openByTitle = opens(VT.title);
export const openByMedia = opens(VT.media);
export const openNextByTitle = opens(VT.nextTitle);
export const openNextByMedia = opens(VT.nextMedia);
export const browse = { transitionTypes: [VT.browse], "data-scroll-first": "" };
