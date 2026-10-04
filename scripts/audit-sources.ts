/**
 * npm run audit:sources
 *
 * "What have I made that isn't on the portfolio yet?"
 * Lists public GitHub repositories and recent YouTube uploads that no
 * project file references. Things you've deliberately left off go in
 * content/audit-ignore.txt (one repo name or video id per line).
 *
 * YouTube: uses the channel RSS feed (latest ~15 uploads, no key needed),
 * or the Data API with YOUTUBE_API_KEY for the full upload list.
 */
import fs from "node:fs";
import path from "node:path";
import { site } from "../src/config/site";
import { CONTENT_DIR, loadProjects } from "../src/lib/content/load";
import { parseYouTubeId } from "../src/lib/refs";
import { githubToken } from "./lib/github-token";

async function main() {
  const { projects } = loadProjects({ includeDrafts: true });
  const ignore = readIgnore();

  const repos = new Set<string>();
  const videos = new Set<string>();
  if (site.showreel) videos.add(site.showreel.youtube);
  for (const p of projects) {
    if (p.data.github) repos.add(p.data.github.toLowerCase());
    if (p.data.youtube) videos.add(p.data.youtube);
    p.data.videos.forEach((v) => videos.add(v.id));
    for (const [, repo] of p.body.matchAll(/repo="([^"]+)"/g)) repos.add(repo.toLowerCase());
    for (const [, id] of p.body.matchAll(/<Video\b[^>]*\bid="([^"]+)"/g)) {
      const parsed = parseYouTubeId(id);
      if (parsed) videos.add(parsed);
    }
  }

  // GitHub
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "matin.cc-audit" };
  const token = githubToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com/users/${site.github.username}/repos?per_page=100&sort=pushed`, { headers });
  if (res.ok) {
    const all = (await res.json()) as { full_name: string; name: string; fork: boolean; archived: boolean; description: string | null; pushed_at: string }[];
    const missing = all.filter(
      (r) => !r.fork && !r.archived && !repos.has(r.full_name.toLowerCase()) && !ignore.has(r.name.toLowerCase()),
    );
    console.log(`\nGitHub — ${all.length} public repos, ${missing.length} not on the portfolio:`);
    for (const r of missing) console.log(`  • ${r.name.padEnd(36)} ${r.pushed_at.slice(0, 10)}  ${r.description ?? ""}`);
    if (missing.length) {
      console.log(`\n  Add one with: npm run new-project -- --github ${site.github.username}/<repo>`);
    }
  } else {
    console.warn(`\nGitHub — request failed (${res.status}). Set GITHUB_TOKEN if you're rate-limited.`);
  }

  // YouTube
  const uploads = await youtubeUploads();
  if (uploads) {
    const missing = uploads.filter((v) => !videos.has(v.id) && !ignore.has(v.id.toLowerCase()));
    console.log(`\nYouTube — ${uploads.length} recent uploads checked, ${missing.length} not referenced:`);
    for (const v of missing) console.log(`  • ${v.id}  ${v.published}  ${v.title}`);
  } else {
    console.log("\nYouTube — couldn't read the channel feed (set YOUTUBE_API_KEY for a reliable full list).");
  }
  console.log("");
}

async function youtubeUploads(): Promise<{ id: string; title: string; published: string }[] | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (key) {
    // The uploads playlist id is the channel id with "UC" → "UU".
    const playlist = site.youtube.channelId.replace(/^UC/, "UU");
    const out: { id: string; title: string; published: string }[] = [];
    let page = "";
    do {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlist}&key=${key}${page ? `&pageToken=${page}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = (await res.json()) as {
        nextPageToken?: string;
        items: { snippet: { title: string; publishedAt: string; resourceId: { videoId: string } } }[];
      };
      for (const item of data.items) {
        out.push({ id: item.snippet.resourceId.videoId, title: item.snippet.title, published: item.snippet.publishedAt.slice(0, 10) });
      }
      page = data.nextPageToken ?? "";
    } while (page);
    return out;
  }

  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${site.youtube.channelId}`);
    if (!res.ok) return null;
    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1);
    if (!entries.length) return null;
    return entries.map((e) => ({
      id: e.match(/<yt:videoId>([^<]+)/)?.[1] ?? "",
      title: e.match(/<title>([^<]+)/)?.[1] ?? "",
      published: e.match(/<published>([^<]+)/)?.[1]?.slice(0, 10) ?? "",
    }));
  } catch {
    return null;
  }
}

function readIgnore(): Set<string> {
  const file = path.join(CONTENT_DIR, "audit-ignore.txt");
  if (!fs.existsSync(file)) return new Set();
  return new Set(
    fs
      .readFileSync(file, "utf8")
      .split("\n")
      .map((l) => l.replace(/#.*/, "").trim().toLowerCase())
      .filter(Boolean),
  );
}

main();
