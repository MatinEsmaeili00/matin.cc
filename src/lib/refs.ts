/**
 * Parsers for external references written in content files.
 * Shared by the site, the content schema and the CLI scripts, so keep this
 * file dependency-free.
 */

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Accepts a bare video id or any common YouTube URL form and returns the
 * 11-character id, or null if it can't find one.
 *
 *   dQw4w9WgXcQ
 *   https://youtu.be/dQw4w9WgXcQ?t=10
 *   https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=...
 *   https://www.youtube.com/shorts/dQw4w9WgXcQ
 *   https://www.youtube.com/embed/dQw4w9WgXcQ
 */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (YOUTUBE_ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return YOUTUBE_ID.test(id) ? id : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v && YOUTUBE_ID.test(v)) return v;
    const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
    if (match) return match[1];
  }
  return null;
}

/**
 * Accepts "owner/repo" or a github.com URL and returns "owner/repo",
 * or null when the value isn't a repository reference.
 */
export function parseGitHubRepo(input: string): string | null {
  const value = input.trim().replace(/\.git$/, "").replace(/\/+$/, "");
  const short = value.match(/^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)$/);
  if (short) return `${short[1]}/${short[2]}`;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.hostname !== "github.com" && url.hostname !== "www.github.com") return null;
  const [owner, repo] = url.pathname.split("/").filter(Boolean);
  return owner && repo ? `${owner}/${repo}` : null;
}

export function githubRepoUrl(repo: string): string {
  return `https://github.com/${repo}`;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
