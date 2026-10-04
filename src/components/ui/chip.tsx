import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LiveDot } from "./live-dot";

/** Toggle chip used by the Work explorer and homepage category tabs. Disabled when it would show nothing. */
export function Chip({
  pressed,
  count,
  small,
  onClick,
  children,
  dot,
  color,
  darkColor,
}: {
  pressed: boolean;
  /** Pulsing live dot before the label (e.g. "In the Lab"). */
  dot?: boolean;
  /** A technology's colour (TECH[id].color), shown as a dot before the label. */
  color?: string;
  darkColor?: string;
  count?: number;
  small?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const disabled = !pressed && count === 0;
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-md border px-3 font-mono tracking-[0.06em] whitespace-nowrap uppercase transition-colors",
        small ? "h-9 text-[0.6875rem]" : "h-10 text-[0.75rem]",
        pressed
          ? "border-fg bg-fg text-ink"
          : "border-line-strong text-fg-muted hover:border-fg hover:text-fg disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line-strong disabled:hover:text-fg-muted",
      )}
    >
      {dot && <LiveDot className={pressed ? undefined : "text-accent"} />}
      {color && (
        <span
          aria-hidden
          className="tech-dot"
          style={{ "--tech": color, ...(darkColor && { "--tech-dark": darkColor }) } as CSSProperties}
        />
      )}
      {children}
      {count !== undefined && <span className={pressed ? "text-ink/60" : "text-fg-faint"}>{count}</span>}
    </button>
  );
}
