import { ArrowUpRight, GitHubMark } from "@/components/ui/icons";
import type { Project } from "@/lib/content/projects";
import { githubRepoUrl, youtubeWatchUrl } from "@/lib/refs";

/** External destinations for a project, primary first. Renders nothing if there are none. */
export function ProjectLinks({ project }: { project: Project }) {
  const links = [
    project.links.steam && { label: "Play on Steam", href: project.links.steam },
    project.links.itch && { label: "Play on itch.io", href: project.links.itch },
    project.links.demo && { label: "Live demo", href: project.links.demo },
    project.github && { label: "Source on GitHub", href: githubRepoUrl(project.github), github: true },
    project.links.docs && { label: "Documentation", href: project.links.docs },
    project.links.website && { label: "Website", href: project.links.website },
    project.youtube && { label: "Watch on YouTube", href: youtubeWatchUrl(project.youtube) },
  ].filter(Boolean) as { label: string; href: string; github?: boolean }[];

  if (!links.length) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((link, i) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener"
            className={
              i === 0
                ? "inline-flex min-h-11 items-center gap-2.5 rounded-md bg-fg px-4 font-mono text-[0.75rem] tracking-[0.08em] text-ink uppercase transition-colors hover:bg-accent"
                : "inline-flex min-h-11 items-center gap-2.5 rounded-md border border-line-strong px-4 font-mono text-[0.75rem] tracking-[0.08em] text-fg uppercase transition-colors hover:border-fg"
            }
          >
            {link.github && <GitHubMark className="size-3.5" />}
            {link.label}
            <ArrowUpRight className="size-2.5" />
          </a>
        </li>
      ))}
    </ul>
  );
}
