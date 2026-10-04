import type { ReactNode } from "react";
import type { Project } from "@/lib/content/projects";
import { teamLabel } from "./format";
import { Status } from "./status";
import { TechTags } from "./tech-tags";

/** Role / team / context / timeline / status / stack — whatever the project defines. */
export function ProjectFacts({ project }: { project: Project }) {
  const facts: { term: string; detail: ReactNode }[] = [
    { term: "Role", detail: project.role },
    { term: "Team", detail: teamLabel(project.teamSize) },
    { term: "Context", detail: project.context },
    { term: "Timeline", detail: project.period },
    { term: "Status", detail: <Status status={project.status} /> },
  ].filter((f) => Boolean(f.detail));

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
          <dd className="mt-2.5">
            <TechTags tech={project.tech} />
          </dd>
        </div>
      )}
    </dl>
  );
}
