import { ArrowUpRight, GitHubMark, Star } from "@/components/ui/icons";
import { getRepository } from "@/lib/github";
import { githubRepoUrl } from "@/lib/refs";
import { formatMonthYear } from "@/lib/utils";

/** GitHub-linguist colours for the languages that appear in this portfolio. */
const LANGUAGE_COLORS: Record<string, string> = {
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  HLSL: "#aace60",
  GLSL: "#5686a5",
  ShaderLab: "#7f8c97",
  GDScript: "#355570",
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  CMake: "#DA3434",
};

/**
 * Live repository facts from GitHub (cached; refreshed every few hours).
 * The description shown is GitHub's — the case study above stays the
 * portfolio's own words. Falls back to a plain link if GitHub is unavailable.
 */
export async function RepositoryPanel({ repo }: { repo: string }) {
  const data = await getRepository(repo);
  const url = data?.url ?? githubRepoUrl(repo);

  return (
    <div className="border border-line bg-ink-2">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
        <a href={url} target="_blank" rel="noopener" className="flex min-w-0 items-center gap-3 hover:text-accent">
          <GitHubMark className="size-4 shrink-0" />
          <span className="truncate font-mono text-sm">{data?.fullName ?? repo}</span>
        </a>
        {data && (
          <span className="label flex items-center gap-4">
            <span className="flex items-center gap-1.5" title="Stars">
              <Star className="size-3" /> {data.stars}
            </span>
            {data.license && <span>{data.license}</span>}
          </span>
        )}
      </div>

      <div className="space-y-5 px-5 py-5">
        {data?.description && <p className="text-fg-muted">{data.description}</p>}

        {data && data.languages.length > 0 && (
          <div>
            <div className="flex h-1.5 w-full overflow-hidden bg-ink-3" aria-hidden>
              {data.languages.map((l) => (
                <span
                  key={l.name}
                  style={{ width: `${l.share * 100}%`, background: LANGUAGE_COLORS[l.name] ?? "#6b6963" }}
                />
              ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
              {data.languages
                .filter((l) => l.share >= 0.005)
                .map((l) => (
                  <li key={l.name} className="label flex items-center gap-2 normal-case tracking-[0.02em]">
                    <span className="size-2" style={{ background: LANGUAGE_COLORS[l.name] ?? "#6b6963" }} />
                    <span className="text-fg-muted">{l.name}</span>
                    {(l.share * 100).toFixed(1)}%
                  </li>
                ))}
            </ul>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {data && (
            <div>
              <dt className="label">Last push</dt>
              <dd className="mt-1 text-sm">{formatMonthYear(data.pushedAt)}</dd>
            </div>
          )}
          {data?.latestRelease && (
            <div>
              <dt className="label">Latest release</dt>
              <dd className="mt-1 text-sm">
                <a href={data.latestRelease.url} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-accent">
                  {data.latestRelease.name}
                </a>
              </dd>
            </div>
          )}
        </dl>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a
            href={url}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 items-center gap-2 font-mono text-[0.75rem] tracking-[0.08em] uppercase hover:text-accent"
          >
            View repository <ArrowUpRight className="size-2.5" />
          </a>
          <a
            href={`${url}#readme`}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 items-center gap-2 font-mono text-[0.75rem] tracking-[0.08em] text-fg-muted uppercase hover:text-fg"
          >
            README <ArrowUpRight className="size-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
