import { CodeBlock } from "@/components/code/code-block";
import {
  CLUSTER_TITLE,
  EDGE_FONT,
  edgePath,
  layoutDiagram,
  LINE_HEIGHT,
  NODE_FONT,
  parseMermaid,
  type Direction,
  type DiagramLayout,
  type LaidOutNode,
} from "@/lib/diagram";

/**
 * Architecture diagram from Mermaid flowchart syntax, rendered at build time
 * as themed SVG (no client JavaScript). Used for ```mermaid code fences in MDX.
 *
 * It lays the graph out in the declared direction and transposed (LR ↔ TB),
 * then shows whichever fits: wide screens get the declared direction unless
 * it's far too wide, phones get the narrower one with horizontal scroll so
 * labels stay readable. Edges carry an animated "data flow" dash (CSS, off
 * for reduced motion).
 */
export function Diagram({ source, title }: { source: string; title?: string }) {
  let desktop: DiagramLayout;
  let mobile: DiagramLayout;
  try {
    const parsed = parseMermaid(source);
    const primary = layoutDiagram(parsed);
    const transposed = layoutDiagram(parsed, transpose(parsed.direction));
    desktop = primary.width > 1100 && transposed.width < primary.width ? transposed : primary;
    mobile = transposed.width < primary.width ? transposed : primary;
  } catch {
    // Not a diagram we can draw — show the source rather than failing the page.
    return <CodeBlock code={source} lang="text" title={title ?? "Diagram"} />;
  }

  const id = `d${hash(source)}`;
  return (
    <figure className="not-prose my-10">
      <div className="no-scrollbar overflow-x-auto rounded-lg border border-line bg-ink-2 p-3 sm:p-6">
        {desktop === mobile ? (
          <DiagramSvg layout={desktop} id={id} title={title} />
        ) : (
          <>
            <div className="hidden md:block">
              <DiagramSvg layout={desktop} id={`${id}w`} title={title} />
            </div>
            <div className="md:hidden">
              <DiagramSvg layout={mobile} id={`${id}n`} title={title} />
            </div>
          </>
        )}
      </div>
      {title && <figcaption className="label mt-3 normal-case tracking-[0.02em]">{title}</figcaption>}
    </figure>
  );
}

function DiagramSvg({ layout, id, title }: { layout: DiagramLayout; id: string; title?: string }) {
  const { width, height } = layout;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={title ?? "Architecture diagram"}
      className="mx-auto block h-auto"
      // Never upscale (crisp, consistent text); on small screens keep text ≥ ~10px and let it scroll.
      style={{ width: "100%", maxWidth: width, minWidth: Math.round(width * 0.8) }}
    >
      <defs>
        <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--color-fg-faint)" />
        </marker>
      </defs>

      {layout.clusters.map((c) => (
        <g key={c.id}>
          <rect
            x={c.x}
            y={c.y}
            width={c.width}
            height={c.height}
            rx={10}
            fill="var(--color-accent-dim)"
            fillOpacity={0.45}
            stroke="var(--color-line-strong)"
            strokeDasharray="4 4"
          />
          <text
            x={c.x + 12}
            y={c.y + CLUSTER_TITLE / 2 + 5}
            fontFamily="var(--font-mono)"
            fontSize={10}
            letterSpacing="0.08em"
            fill="var(--color-accent)"
          >
            {c.label.toUpperCase()}
          </text>
        </g>
      ))}

      {layout.edges.map((e, i) => {
        const d = edgePath(e.points);
        return (
          <g key={i}>
            <path
              d={d}
              fill="none"
              stroke="var(--color-fg-faint)"
              strokeWidth={e.style === "thick" ? 2.25 : 1.25}
              strokeDasharray={e.style === "dotted" ? "4 4" : undefined}
              markerEnd={e.arrow ? `url(#${id}-arrow)` : undefined}
            />
            <path d={d} fill="none" className="diagram-flow" />
          </g>
        );
      })}

      {layout.nodes.map((n) => (
        <g key={n.id}>
          <NodeShape node={n} />
          <text
            x={n.x}
            y={n.y - ((n.lines.length - 1) * LINE_HEIGHT) / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-mono)"
            fontSize={NODE_FONT}
            fill="var(--color-fg)"
          >
            {n.lines.map((line, i) => (
              <tspan key={i} x={n.x} dy={i === 0 ? 0 : LINE_HEIGHT}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      ))}

      {layout.edges.map((e, i) =>
        e.labelAt ? (
          <g key={`l${i}`}>
            <rect
              x={e.labelAt.x - (Math.max(...e.labelLines.map((l) => l.length)) * EDGE_FONT * 0.6 + 12) / 2}
              y={e.labelAt.y - (e.labelLines.length * 14 + 6) / 2}
              width={Math.max(...e.labelLines.map((l) => l.length)) * EDGE_FONT * 0.6 + 12}
              height={e.labelLines.length * 14 + 6}
              rx={4}
              fill="var(--color-ink-2)"
            />
            <text
              x={e.labelAt.x}
              y={e.labelAt.y - ((e.labelLines.length - 1) * 14) / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="var(--font-mono)"
              fontSize={EDGE_FONT}
              fill="var(--color-fg-muted)"
            >
              {e.labelLines.map((line, j) => (
                <tspan key={j} x={e.labelAt!.x} dy={j === 0 ? 0 : 14}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        ) : null,
      )}
    </svg>
  );
}

function NodeShape({ node: n }: { node: LaidOutNode }) {
  const x = n.x - n.width / 2;
  const y = n.y - n.height / 2;
  const style = { fill: "var(--color-ink)", stroke: "var(--color-line-strong)", strokeWidth: 1.25 };
  switch (n.shape) {
    case "diamond":
      return <polygon points={`${n.x},${y} ${x + n.width},${n.y} ${n.x},${y + n.height} ${x},${n.y}`} {...style} />;
    case "circle":
      return <circle cx={n.x} cy={n.y} r={n.width / 2} {...style} />;
    case "cylinder": {
      const ry = 6;
      return (
        <path
          d={`M${x},${y + ry} a${n.width / 2},${ry} 0 0 0 ${n.width},0 a${n.width / 2},${ry} 0 0 0 ${-n.width},0 v${n.height - 2 * ry} a${n.width / 2},${ry} 0 0 0 ${n.width},0 v${-(n.height - 2 * ry)}`}
          {...style}
        />
      );
    }
    case "subroutine":
      return (
        <g>
          <rect x={x} y={y} width={n.width} height={n.height} rx={4} {...style} />
          <path d={`M${x + 7},${y} v${n.height} M${x + n.width - 7},${y} v${n.height}`} stroke="var(--color-line-strong)" />
        </g>
      );
    default: {
      const rx = n.shape === "stadium" ? n.height / 2 : n.shape === "round" ? 12 : 6;
      return <rect x={x} y={y} width={n.width} height={n.height} rx={rx} {...style} />;
    }
  }
}

function transpose(direction: Direction): Direction {
  return direction === "LR" || direction === "RL" ? "TB" : "LR";
}

function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
