/**
 * Architecture diagrams from Mermaid flowchart syntax — the same syntax
 * GitHub renders in READMEs, so a diagram can be copied straight from a repo.
 *
 *   ```mermaid
 *   flowchart LR
 *     subgraph PC["Unreal PC"]
 *       MIC["Mic"] --> AIC["AICommandComponent"]
 *     end
 *     AIC -- "HTTP: text or WAV" --> SRV["server.py"]
 *   ```
 *
 * Parsed here, laid out with dagre at build time, and rendered as themed SVG
 * by components/diagram/diagram.tsx — no Mermaid runtime in the browser.
 * Supported: flowchart/graph with TB/TD/BT/LR/RL, node shapes [] () ([]) [()]
 * {} (()) [[]], edges --> --- -.-> -.- ==> === with labels (-- text --> or
 * -->|text|), chains (A --> B --> C), nested subgraphs. Styling lines
 * (classDef, style, click, linkStyle) are ignored.
 */
import dagre from "@dagrejs/dagre";

export type Direction = "TB" | "BT" | "LR" | "RL";
export type Shape = "rect" | "round" | "stadium" | "cylinder" | "diamond" | "circle" | "subroutine";
export type EdgeStyle = "solid" | "dotted" | "thick";

export type DiagramNode = { id: string; label: string; shape: Shape; parent: string | null };
export type DiagramCluster = { id: string; label: string; parent: string | null };
export type DiagramEdge = { from: string; to: string; label: string | null; style: EdgeStyle; arrow: boolean };
export type ParsedDiagram = { direction: Direction; nodes: DiagramNode[]; clusters: DiagramCluster[]; edges: DiagramEdge[] };

/* ------------------------------------------------------------------------ */
/* Parsing                                                                   */
/* ------------------------------------------------------------------------ */

const SHAPES: { open: string; close: string; shape: Shape }[] = [
  { open: "([", close: "])", shape: "stadium" },
  { open: "[(", close: ")]", shape: "cylinder" },
  { open: "((", close: "))", shape: "circle" },
  { open: "[[", close: "]]", shape: "subroutine" },
  { open: "[", close: "]", shape: "rect" },
  { open: "(", close: ")", shape: "round" },
  { open: "{", close: "}", shape: "diamond" },
  { open: ">", close: "]", shape: "rect" },
];

// Edge with inline label: -- text -->, -- "text" -->, -. text .->, == text ==>
const INLINE_LABEL_EDGE = /^(--|-\.|==)\s+(?:"([^"]*)"|(.+?))\s+(-->|---|\.->|\.-|==>|===)/;
// Plain edge, optionally followed by |label|
const PLAIN_EDGE = /^(-{2,}>|-{3,}|-\.+->|-\.+-|={2,}>|={3,}|--[ox])(?:\s*\|([^|]*)\|)?/;
const ID = /^[A-Za-z0-9_]+/;
const IGNORED = /^(classDef|class|style|linkStyle|click|direction)\b/;

export function parseMermaid(source: string): ParsedDiagram {
  const lines = source
    .split("\n")
    .map((l) => l.replace(/%%.*$/, "").trim())
    .filter(Boolean);

  const header = lines.shift()?.match(/^(?:flowchart|graph)\s*(TB|TD|BT|LR|RL)?\s*;?$/i);
  if (!header) throw new Error('Diagram must start with "flowchart LR" (or TB/RL/BT)');
  const dir = (header[1] ?? "TB").toUpperCase();
  const direction = (dir === "TD" ? "TB" : dir) as Direction;

  const nodes = new Map<string, DiagramNode>();
  const clusters: DiagramCluster[] = [];
  const edges: DiagramEdge[] = [];
  const stack: string[] = [];

  const touch = (id: string, label?: string, shape?: Shape) => {
    const existing = nodes.get(id);
    if (existing) {
      if (label !== undefined) {
        existing.label = label;
        existing.shape = shape ?? existing.shape;
      }
      return;
    }
    nodes.set(id, { id, label: label ?? id, shape: shape ?? "rect", parent: stack.at(-1) ?? null });
  };

  for (const line of lines) {
    if (IGNORED.test(line)) continue;

    const sub = line.match(/^subgraph\s+(.+)$/);
    if (sub) {
      const spec = sub[1].trim();
      const withLabel = spec.match(/^([A-Za-z0-9_]+)\s*\[\s*"?([^"\]]*)"?\s*\]$/);
      const id = withLabel ? withLabel[1] : `cluster_${clusters.length}`;
      const label = withLabel ? withLabel[2] : spec.replace(/^"|"$/g, "");
      clusters.push({ id, label: clean(label), parent: stack.at(-1) ?? null });
      stack.push(id);
      continue;
    }
    if (/^end$/.test(line)) {
      stack.pop();
      continue;
    }

    parseStatement(line.replace(/;$/, ""), touch, edges);
  }

  if (!nodes.size) throw new Error("Diagram has no nodes");
  return { direction, nodes: [...nodes.values()], clusters, edges };
}

/** A statement is groups of nodes (`A & B`) joined by edges; every node connects to every node of the next group. */
function parseStatement(
  line: string,
  touch: (id: string, label?: string, shape?: Shape) => void,
  edges: DiagramEdge[],
) {
  let rest = line;
  let previous: string[] = [];
  let pending: Omit<DiagramEdge, "from" | "to"> | null = null;

  while (rest.length) {
    const group: string[] = [];
    for (;;) {
      rest = rest.trimStart();
      const node = readNode(rest);
      if (!node) throw new Error(`Couldn't read a node in: ${line}`);
      touch(node.id, node.label, node.shape);
      group.push(node.id);
      rest = rest.slice(node.length).trimStart();
      if (!rest.startsWith("&")) break;
      rest = rest.slice(1);
    }
    if (pending) for (const from of previous) for (const to of group) edges.push({ from, to, ...pending });
    previous = group;
    if (!rest.length) break;

    const edge = readEdge(rest);
    if (!edge) throw new Error(`Couldn't read an edge in: ${line}`);
    pending = { label: edge.label, style: edge.style, arrow: edge.arrow };
    rest = rest.slice(edge.length);
  }
}

function readNode(text: string): { id: string; label?: string; shape?: Shape; length: number } | null {
  const id = text.match(ID)?.[0];
  if (!id) return null;
  let i = id.length;
  const after = text.slice(i);
  for (const s of SHAPES) {
    if (!after.startsWith(s.open)) continue;
    let j = i + s.open.length;
    let label: string;
    if (text[j] === '"') {
      const end = text.indexOf('"', j + 1);
      if (end === -1) return null;
      label = text.slice(j + 1, end);
      j = end + 1;
      if (!text.startsWith(s.close, j)) return null;
    } else {
      const end = text.indexOf(s.close, j);
      if (end === -1) return null;
      label = text.slice(j, end);
      j = end;
    }
    i = j + s.close.length;
    return { id, label: clean(label), shape: s.shape, length: i };
  }
  return { id, length: i };
}

function readEdge(text: string): { label: string | null; style: EdgeStyle; arrow: boolean; length: number } | null {
  const inline = text.match(INLINE_LABEL_EDGE);
  if (inline) {
    const arrow = inline[4];
    return {
      label: clean(inline[2] ?? inline[3] ?? ""),
      style: inline[1] === "-." ? "dotted" : inline[1] === "==" ? "thick" : "solid",
      arrow: arrow.endsWith(">"),
      length: inline[0].length,
    };
  }
  const plain = text.match(PLAIN_EDGE);
  if (plain) {
    const token = plain[1];
    return {
      label: plain[2] !== undefined ? clean(plain[2]) : null,
      style: token.includes(".") ? "dotted" : token.startsWith("=") ? "thick" : "solid",
      arrow: token.endsWith(">"),
      length: plain[0].length,
    };
  }
  return null;
}

function clean(label: string): string {
  return label
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/#quot;/g, '"')
    .replace(/&amp;/g, "&")
    .trim();
}

/* ------------------------------------------------------------------------ */
/* Layout                                                                    */
/* ------------------------------------------------------------------------ */

/** Labels use JetBrains Mono, whose glyphs are exactly 0.6em wide — so sizes are exact. */
export const NODE_FONT = 12;
export const EDGE_FONT = 11;
export const LINE_HEIGHT = 16;
const CHAR = 0.6;
const PAD_X = 14;
const PAD_Y = 10;
/** Room reserved above each cluster for its title. */
export const CLUSTER_TITLE = 22;

export type Point = { x: number; y: number };
export type LaidOutNode = DiagramNode & { x: number; y: number; width: number; height: number; lines: string[] };
export type LaidOutCluster = DiagramCluster & { x: number; y: number; width: number; height: number };
export type LaidOutEdge = DiagramEdge & { points: Point[]; labelAt: Point | null; labelLines: string[] };
export type DiagramLayout = {
  width: number;
  height: number;
  nodes: LaidOutNode[];
  clusters: LaidOutCluster[];
  edges: LaidOutEdge[];
};

export function layoutDiagram(diagram: ParsedDiagram, direction: Direction = diagram.direction): DiagramLayout {
  const g = new dagre.graphlib.Graph({ compound: true, multigraph: true });
  const hasClusters = diagram.clusters.length > 0;
  g.setGraph({
    rankdir: direction,
    nodesep: hasClusters ? 40 : 28,
    ranksep: hasClusters ? 64 : 52,
    edgesep: 16,
    marginx: 12,
    marginy: 12 + (hasClusters ? CLUSTER_TITLE : 0),
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const c of diagram.clusters) g.setNode(c.id, {});
  for (const c of diagram.clusters) if (c.parent) g.setParent(c.id, c.parent);

  for (const n of diagram.nodes) {
    const lines = n.label.split("\n");
    const textWidth = Math.max(...lines.map((l) => l.length)) * NODE_FONT * CHAR;
    let width = Math.ceil(textWidth + PAD_X * 2);
    let height = lines.length * LINE_HEIGHT + PAD_Y * 2;
    if (n.shape === "diamond") {
      width = Math.ceil(width * 1.4);
      height = Math.ceil(height * 1.5);
    } else if (n.shape === "circle") {
      width = height = Math.max(width, height);
    } else if (n.shape === "cylinder") {
      height += 10;
    }
    g.setNode(n.id, { width, height });
    if (n.parent) g.setParent(n.id, n.parent);
  }

  diagram.edges.forEach((e, i) => {
    const lines = e.label ? e.label.split("\n") : [];
    const width = lines.length ? Math.max(...lines.map((l) => l.length)) * EDGE_FONT * CHAR + 12 : 0;
    const height = lines.length ? lines.length * 14 + 6 : 0;
    g.setEdge(e.from, e.to, { width, height, labelpos: "c" }, `e${i}`);
  });

  dagre.layout(g);

  const nodes: LaidOutNode[] = diagram.nodes.map((n) => {
    const box = g.node(n.id);
    return { ...n, x: box.x, y: box.y, width: box.width, height: box.height, lines: n.label.split("\n") };
  });

  const clusters: LaidOutCluster[] = diagram.clusters.map((c) => {
    const box = g.node(c.id);
    // dagre gives centre + size; grow upwards to make room for the title.
    return {
      ...c,
      x: box.x - box.width / 2,
      y: box.y - box.height / 2 - CLUSTER_TITLE,
      width: box.width,
      height: box.height + CLUSTER_TITLE,
    };
  });

  const edges: LaidOutEdge[] = diagram.edges.map((e, i) => {
    const data = g.edge({ v: e.from, w: e.to, name: `e${i}` }) as { points: Point[]; x?: number; y?: number };
    return {
      ...e,
      points: data.points,
      labelAt: e.label && data.x !== undefined && data.y !== undefined ? { x: data.x, y: data.y } : null,
      labelLines: e.label ? e.label.split("\n") : [],
    };
  });

  const graph = g.graph() as { width?: number; height?: number };
  return { width: Math.ceil(graph.width ?? 0), height: Math.ceil(graph.height ?? 0), nodes, clusters, edges };
}

/** Smooth path through dagre's control points (B-spline, like Mermaid's default curve). */
export function edgePath(points: Point[]): string {
  if (points.length < 2) return "";
  if (points.length === 2) return `M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}`;
  let d = `M${points[0].x},${points[0].y}`;
  const p = points;
  d += `L${(5 * p[0].x + p[1].x) / 6},${(5 * p[0].y + p[1].y) / 6}`;
  for (let i = 1; i < p.length - 1; i++) {
    const a = p[i - 1];
    const b = p[i];
    const c = p[i + 1];
    d += `C${(2 * a.x + b.x) / 3},${(2 * a.y + b.y) / 3} ${(a.x + 2 * b.x) / 3},${(a.y + 2 * b.y) / 3} ${(a.x + 4 * b.x + c.x) / 6},${(a.y + 4 * b.y + c.y) / 6}`;
  }
  // Close like d3's curveBasis: one more segment towards the end point, then a line onto it
  // (so the arrowhead follows the final direction).
  const last = p[p.length - 1];
  const prev = p[p.length - 2];
  d += `C${(2 * prev.x + last.x) / 3},${(2 * prev.y + last.y) / 3} ${(prev.x + 2 * last.x) / 3},${(prev.y + 2 * last.y) / 3} ${(prev.x + 5 * last.x) / 6},${(prev.y + 5 * last.y) / 6}`;
  d += `L${last.x},${last.y}`;
  return d;
}
