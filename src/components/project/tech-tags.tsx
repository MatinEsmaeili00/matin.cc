import type { CSSProperties } from "react";
import { techColor, techLabel, type TechId } from "@/config/taxonomy";
import { cn } from "@/lib/utils";

export function techStyle(id: TechId): CSSProperties {
  const { color, dark } = techColor(id);
  return { "--tech": color, ...(dark && { "--tech-dark": dark }) } as CSSProperties;
}

/** A technology's colour on its own — for inline lists where a full tag is too much. */
export function TechDot({ id, className }: { id: TechId; className?: string }) {
  return <span aria-hidden className={cn("tech-dot", className)} style={techStyle(id)} />;
}

/**
 * Colour-coded tech tags. Each technology keeps its colour everywhere it
 * appears (TECH in config/taxonomy.ts). `plain` drops the tint for dense rows.
 */
export function TechTags({
  tech,
  limit,
  plain,
  className,
}: {
  tech: TechId[];
  limit?: number;
  plain?: boolean;
  className?: string;
}) {
  const shown = limit ? tech.slice(0, limit) : tech;
  if (shown.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap", plain ? "gap-x-3 gap-y-1" : "gap-1.5", className)}>
      {shown.map((id) => (
        <li key={id} className="tech-tag" data-plain={plain || undefined} style={techStyle(id)}>
          <span aria-hidden className="tech-dot" />
          {techLabel(id)}
        </li>
      ))}
    </ul>
  );
}
