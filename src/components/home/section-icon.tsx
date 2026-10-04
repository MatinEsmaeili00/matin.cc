import type { ComponentType } from "react";
import { LiveDot } from "@/components/ui/live-dot";

/**
 * A tiny animated mark per homepage section, keyed by the section ids in
 * content/settings/home.json. Drawn in currentColor; the motion is in
 * globals.css ("Micro-animations") and stops under reduced motion.
 * A section without an entry here simply has no icon.
 */
const ICONS: Record<string, ComponentType> = {
  "games-tools": Gear,
  "virtual-production": Rec,
  lab: () => <LiveDot />,
  math: Wave,
  shaders: MaterialBall,
};

export function hasSectionIcon(id: string): boolean {
  return id in ICONS;
}

export function SectionIcon({ id }: { id: string }) {
  const Icon = ICONS[id];
  return Icon ? <Icon /> : null;
}

/** Games & tools: a slowly turning cog. */
function Gear() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="icon-spin size-3.5 shrink-0" fill="none" stroke="currentColor">
      <circle cx="8" cy="8" r="6" strokeWidth="2.6" strokeDasharray="2.356 2.356" />
      <circle cx="8" cy="8" r="3.9" strokeWidth="2.2" />
    </svg>
  );
}

/** Virtual production: a camera viewfinder with a blinking record light. */
function Rec() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1.75 5V1.75H5M11 1.75h3.25V5M14.25 11v3.25H11M5 14.25H1.75V11" />
      <circle className="icon-rec" cx="8" cy="8" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Math: a sine wave travelling through the frame (two periods; it slides by one). */
function Wave() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="size-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path className="icon-wave" d="M-16 8c2.67-5.33 5.33-5.33 8 0s5.33 5.33 8 0 5.33-5.33 8 0 5.33 5.33 8 0" />
    </svg>
  );
}

/** Shaders: a material-preview ball with the light orbiting it. */
function MaterialBall() {
  return <span aria-hidden className="icon-material icon-orbit size-3 shrink-0 rounded-full" />;
}
