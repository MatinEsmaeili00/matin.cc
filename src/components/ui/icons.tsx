import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { "data-nudge"?: "right" | "left" | "down" | "up-right" };

/*
 * Arrows and Download carry data-nudge: they lean toward where their link goes
 * while it's hovered (globals.css). Override it, e.g. data-nudge="down" on a
 * rotated arrow.
 */
const base = {
  "aria-hidden": true,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
} as const;

export function ArrowUpRight(props: IconProps) {
  return (
    <svg viewBox="0 0 12 12" {...base} data-nudge="up-right" {...props}>
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <svg viewBox="0 0 14 12" {...base} data-nudge="right" {...props}>
      <path d="M1 6h12M8 1l5 5-5 5" />
    </svg>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <svg viewBox="0 0 14 12" {...base} data-nudge="left" {...props}>
      <path d="M13 6H1M6 1 1 6l5 5" />
    </svg>
  );
}

export function Play(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden fill="currentColor" {...props}>
      <path d="M4 2.5v11l9-5.5z" />
    </svg>
  );
}

export function Copy(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...base} {...props}>
      <rect x="5.5" y="5.5" width="8" height="8" />
      <path d="M10.5 5.5v-3h-8v8h3" />
    </svg>
  );
}

export function Check(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...base} strokeWidth={1.5} {...props}>
      <path d="m3 8.5 3 3 7-7" />
    </svg>
  );
}

export function Star(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...base} {...props}>
      <path d="m8 1.8 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z" />
    </svg>
  );
}

export function Sun(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...base} strokeWidth={1.4} {...props}>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" />
    </svg>
  );
}

export function Moon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...base} strokeWidth={1.4} {...props}>
      <path d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1Z" />
    </svg>
  );
}

export function Download(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...base} strokeWidth={1.4} data-nudge="down" {...props}>
      <path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 13.5h11" />
    </svg>
  );
}

export function Mail(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...base} strokeWidth={1.4} {...props}>
      <rect x="2" y="3.5" width="12" height="9" rx="1" />
      <path d="m2.5 4.5 5.5 4 5.5-4" />
    </svg>
  );
}

export function GitHubMark(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden fill="currentColor" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
