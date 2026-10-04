import { getRepositoryFile } from "@/lib/github";
import { githubRepoUrl } from "@/lib/refs";
import { CodeBlock } from "./code-block";

/**
 * A code excerpt pulled from a GitHub repository at build time, so the case
 * study never drifts from the real source.
 *
 *   <GitHubCode path="Shaders/Private/SnowDeformation.usf" lines="48-106" highlight="77-94" />
 *
 * `repo` defaults to the project's `github` field. If the file can't be
 * fetched, an inline fallback (children as a fenced block) or a plain link
 * is shown — the build never fails because GitHub was unreachable.
 */
export async function GitHubCode({
  repo,
  path,
  lines,
  highlight,
  lang,
  title,
  gitRef = "HEAD",
  fallback,
}: {
  repo: string;
  path: string;
  /** "48-106" — a 1-based inclusive range. Omit for the whole file. */
  lines?: string;
  highlight?: string;
  lang?: string;
  title?: string;
  gitRef?: string;
  fallback?: React.ReactNode;
}) {
  const file = await getRepositoryFile(repo, path, gitRef);
  const blobUrl = `${githubRepoUrl(repo)}/blob/${gitRef}/${path}`;

  if (file === null) {
    return (
      fallback ?? (
        <p className="border border-line px-4 py-3 font-mono text-sm">
          <a href={blobUrl}>{path}</a> on GitHub
        </p>
      )
    );
  }

  const all = file.replace(/\r\n/g, "\n").split("\n");
  const [start, end] = parseRange(lines, all.length);
  const excerpt = dedent(all.slice(start - 1, end));
  const ext = path.split(".").pop();

  return (
    <CodeBlock
      code={excerpt}
      lang={lang ?? ext}
      title={title ?? path.split("/").pop()}
      startLine={start}
      highlight={highlight}
      lineNumbers
      sourceUrl={lines ? `${blobUrl}#L${start}-L${end}` : blobUrl}
    />
  );
}

function parseRange(spec: string | undefined, total: number): [number, number] {
  if (!spec) return [1, total];
  const [a, b] = spec.split("-").map((n) => parseInt(n, 10));
  const start = Math.max(1, Number.isNaN(a) ? 1 : a);
  const end = Math.min(total, Number.isNaN(b) ? start : b);
  return [start, Math.max(start, end)];
}

/** Remove common leading indentation so excerpts from nested code read cleanly. */
function dedent(lines: string[]): string {
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^[\t ]*/)![0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join("\n");
}
