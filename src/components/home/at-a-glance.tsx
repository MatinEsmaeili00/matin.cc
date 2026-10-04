import type { ReactNode } from "react";
import { TechDot } from "@/components/project/tech-tags";
import { TECH, type TechId } from "@/config/taxonomy";
import type { Project } from "@/lib/content/projects";

/**
 * Four quick facts for someone skimming (recruiters first): all derived from
 * the project files, so they stay true as work is added.
 */
export function AtAGlance({ projects }: { projects: Project[] }) {
  const firstYear = Math.min(...projects.map((p) => p.year));
  const years = new Date().getFullYear() - firstYear;
  const released = projects.filter((p) => p.links.steam);
  const playable = projects.filter((p) => p.links.steam || p.links.itch || p.links.demo);
  const engines = (Object.keys(TECH) as TechId[]).filter(
    (id) => TECH[id].group === "engine" && projects.some((p) => p.tech.includes(id)),
  );

  const facts: { value: string; label: ReactNode }[] = [
    { value: String(projects.length), label: "projects, from shipped games to GPU research" },
    { value: `${years}+`, label: `years building real-time 3D (since ${firstYear})` },
    released.length > 0
      ? { value: "Steam", label: `released title: ${released.map((p) => p.title).join(", ")}` }
      : { value: String(playable.length), label: "playable builds and demos" },
    {
      value: String(engines.length),
      label: (
        <>
          engines:{" "}
          {engines.map((id) => (
            <span key={id} className="mr-2.5 inline-flex items-center gap-1.5 whitespace-nowrap">
              <TechDot id={id} />
              {TECH[id].label.replace(" Engine", "")}
            </span>
          ))}
        </>
      ),
    },
  ];

  return (
    <section aria-label="At a glance" className="page gutter">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-4">
        {facts.map((f, i) => (
          <div key={i} className="flex flex-col gap-2 bg-ink-2 p-5 sm:p-6">
            <dt className="order-last text-sm leading-snug text-fg-muted">{f.label}</dt>
            <dd className="text-3xl font-semibold tracking-tight semi-wide sm:text-4xl">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
