import { cn } from "@/lib/utils";

/**
 * Stand-in artwork for projects that don't have footage yet: a ridgeline
 * height field (a nod to the snow/sand simulations), seeded from the slug so
 * every project gets its own stable terrain. Pure server-rendered SVG.
 */
export function ProceduralCover({
  seed,
  label,
  className,
}: {
  seed: string;
  label?: string;
  className?: string;
}) {
  const { paths, accentIndex } = ridgelines(seed);

  return (
    <div className={cn("absolute inset-0 bg-ink-2 ring-1 ring-line ring-inset", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        aria-hidden
      >
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="var(--color-ink-2)"
            stroke={i === accentIndex ? "var(--color-accent)" : "var(--color-fg)"}
            strokeOpacity={i === accentIndex ? 0.9 : 0.12 + (i / paths.length) * 0.3}
            strokeWidth={i === accentIndex ? 2 : 1.25}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {label && <span className="label absolute bottom-3 left-3 sm:bottom-4 sm:left-4">{label}</span>}
    </div>
  );
}

const W = 1600;
const H = 900;
const LINES = 20;
const SAMPLES = 44;

function ridgelines(seed: string) {
  const rand = mulberry32(hash(seed));

  const bumps = Array.from({ length: 3 + Math.floor(rand() * 3) }, () => ({
    x: 0.15 + rand() * 0.7,
    z: rand(),
    width: 0.05 + rand() * 0.12,
    depth: 0.1 + rand() * 0.25,
    height: 0.35 + rand() * 0.65,
  }));
  const phase = rand() * Math.PI * 2;
  const freq = 2 + rand() * 3;

  const top = H * 0.22;
  const spacing = (H * 0.86 - top) / LINES;
  const amplitude = H * 0.3;

  const paths: string[] = [];
  for (let i = 0; i < LINES; i++) {
    const z = i / (LINES - 1);
    const baseY = top + i * spacing;
    const points: string[] = [];

    for (let s = 0; s <= SAMPLES; s++) {
      const x = s / SAMPLES;
      let h = 0.06 * Math.sin(x * freq * Math.PI + phase + z * 3);
      for (const b of bumps) {
        const dx = (x - b.x) / b.width;
        const dz = (z - b.z) / b.depth;
        h += b.height * Math.exp(-(dx * dx + dz * dz));
      }
      // Fade relief at the edges so lines run flat into the frame.
      const edge = Math.min(1, x * 6, (1 - x) * 6);
      const y = baseY - h * amplitude * edge;
      points.push(`${Math.round(x * W)} ${Math.round(y)}`);
    }

    // Close the fill (for occlusion) outside the viewBox so its edges never stroke.
    const first = points[0].split(" ")[1];
    const last = points[points.length - 1].split(" ")[1];
    paths.push(`M-20 ${H + 20}L-20 ${first}L${points.join("L")}L${W + 20} ${last}L${W + 20} ${H + 20}Z`);
  }

  return { paths, accentIndex: Math.floor(LINES * (0.45 + rand() * 0.35)) };
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
