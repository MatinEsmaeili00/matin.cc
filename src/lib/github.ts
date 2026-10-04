import "server-only";
import { cache } from "react";

/**
 * GitHub integration.
 *
 * GitHub is the source of truth for code and repository activity; the
 * portfolio only *reads* it to supplement a case study. Nothing here is
 * required for a page to render — every function returns null on failure.
 *
 * Requests run once per build (pages are statically generated), so visitors
 * never trigger GitHub API calls. A scheduled daily rebuild keeps stars and
 * activity fresh (.github/workflows/scheduled-rebuild.yml).
 * GITHUB_TOKEN is optional: without it the 60 req/hour anonymous limit is
 * plenty for a build; with it the limit is 5000.
 */

const API = "https://api.github.com";

export type Language = { name: string; bytes: number; share: number };

export type Repository = {
  fullName: string;
  url: string;
  description: string | null;
  homepage: string | null;
  stars: number;
  forks: number;
  license: string | null;
  topics: string[];
  defaultBranch: string;
  pushedAt: string;
  languages: Language[];
  readmeUrl: string;
  latestRelease: { name: string; tag: string; url: string; publishedAt: string } | null;
};

type RepoResponse = {
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  license: { spdx_id: string | null; name: string } | null;
  topics?: string[];
  default_branch: string;
  pushed_at: string;
};

type ReleaseResponse = { name: string | null; tag_name: string; html_url: string; published_at: string };

export const getRepository = cache(async (repo: string): Promise<Repository | null> => {
  const [info, languages, release] = await Promise.all([
    githubJson<RepoResponse>(`/repos/${repo}`),
    githubJson<Record<string, number>>(`/repos/${repo}/languages`),
    githubJson<ReleaseResponse>(`/repos/${repo}/releases/latest`),
  ]);
  if (!info) return null;

  const total = Object.values(languages ?? {}).reduce((a, b) => a + b, 0);
  const langs = Object.entries(languages ?? {})
    .map(([name, bytes]) => ({ name, bytes, share: total ? bytes / total : 0 }))
    .sort((a, b) => b.bytes - a.bytes);

  return {
    fullName: info.full_name,
    url: info.html_url,
    description: info.description,
    homepage: info.homepage || null,
    stars: info.stargazers_count,
    forks: info.forks_count,
    license: info.license?.spdx_id && info.license.spdx_id !== "NOASSERTION" ? info.license.spdx_id : null,
    topics: info.topics ?? [],
    defaultBranch: info.default_branch,
    pushedAt: info.pushed_at,
    languages: langs,
    readmeUrl: `${info.html_url}#readme`,
    latestRelease: release
      ? {
          name: release.name || release.tag_name,
          tag: release.tag_name,
          url: release.html_url,
          publishedAt: release.published_at,
        }
      : null,
  };
});

/**
 * Raw file contents from a repository (for <GitHubCode/> in MDX).
 * Uses raw.githubusercontent.com, which doesn't count against the API limit.
 */
export const getRepositoryFile = cache(
  async (repo: string, filePath: string, ref = "HEAD"): Promise<string | null> => {
    const clean = filePath.replace(/^\/+/, "");
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${repo}/${ref}/${clean}`, {
        signal: AbortSignal.timeout(8000),
      });
      return res.ok ? await res.text() : null;
    } catch {
      return null;
    }
  },
);

async function githubJson<T>(endpoint: string): Promise<T | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "matin.cc-portfolio",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API}${endpoint}`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        console.warn(`[github] rate limited on ${endpoint} — set GITHUB_TOKEN to raise the limit`);
      }
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
