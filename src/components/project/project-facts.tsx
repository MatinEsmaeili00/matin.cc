import type { Project } from "@/lib/content/projects";
import { STATUS_LABEL, teamLabel, techLabels } from "./format";

/** Role / team / context / timeline / status / stack — whatever the project defines. */
export function ProjectFacts({ project }: { project: Project }) {
  const facts = [
    { term: "Role", detail: project.role },
    { term: "Team", detail: teamLabel(project.teamSize) },
    { term: "Context", detail: project.context },
    { term: "Timeline", detail: project.period },
    { term: "Status", detail: STATUS_LABEL[project.status] },
  ].filter((f): f is { term: string; detail: string } => Boolean(f.detail));

  return (
    <dl className="grid grid-cols-2 border-t border-line sm:grid-cols-3 lg:grid-cols-6">
      {facts.map((f) => (
        <div key={f.term} className="border-b border-line py-4 pr-4">
          <dt className="label">{f.term}</dt>
          <dd className="mt-1.5 text-[0.9375rem] leading-snug text-fg">{f.detail}</dd>
        </div>
      ))}
      {project.tech.length > 0 && (
        <div className="col-span-full border-b border-line py-4">
          <dt className="label">Stack</dt>
          <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg">{techLabels(project.tech).join(" · ")}</dd>
        </div>
      )}
    </dl>
  );
}
