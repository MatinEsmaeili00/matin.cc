/**
 * Locates yt-dlp (on PATH, or a standalone binary cached in .cache/tools/),
 * downloading the official release binary on first use. Used by
 * `npm run media` to turn your own YouTube uploads into short preview loops.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CACHE_DIR = path.join(process.cwd(), ".cache", "tools");
const RELEASE = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/";

function binaryName(): string {
  if (process.platform === "win32") return "yt-dlp.exe";
  if (process.platform === "darwin") return "yt-dlp_macos";
  return "yt-dlp_linux";
}

function works(command: string): boolean {
  const result = spawnSync(command, ["--version"], { encoding: "utf8" });
  return result.status === 0;
}

export async function ytDlpPath(): Promise<string> {
  if (works("yt-dlp")) return "yt-dlp";

  const cached = path.join(CACHE_DIR, binaryName());
  if (fs.existsSync(cached) && works(cached)) return cached;

  console.log("  ↳ downloading yt-dlp (one time)…");
  const res = await fetch(RELEASE + binaryName());
  if (!res.ok) throw new Error(`Couldn't download yt-dlp (${res.status}). Install it manually: https://github.com/yt-dlp/yt-dlp`);
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cached, Buffer.from(await res.arrayBuffer()));
  if (process.platform !== "win32") fs.chmodSync(cached, 0o755);
  return cached;
}

/**
 * Downloads the video stream (≤1080p, no audio) of a YouTube video — only
 * your own uploads, please — into `dir`, optionally just a section, and
 * returns the file path.
 */
export async function downloadYouTube(
  id: string,
  dir: string,
  { start, duration }: { start?: number; duration?: number } = {},
): Promise<string> {
  const bin = await ytDlpPath();
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${id}.%(ext)s`);
  // Video stream only — previews are muted, and skipping audio avoids a
  // merge step that can silently produce audio-only files. Prefer H.264.
  const args = [
    "-f", "bv*[height<=1080][vcodec^=avc1]/bv*[height<=1080]/bv*",
    "--no-playlist", "--no-progress", "--quiet",
    "-o", out,
  ];
  if (start !== undefined || duration !== undefined) {
    const from = start ?? 0;
    const to = duration !== undefined ? from + duration + 1 : "inf";
    args.push("--download-sections", `*${from}-${to}`);
  }
  const ffmpeg = (await import("ffmpeg-static")).default;
  if (ffmpeg) args.push("--ffmpeg-location", ffmpeg);
  args.push(`https://www.youtube.com/watch?v=${id}`);

  const result = spawnSync(bin, args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`yt-dlp failed for ${id}:\n${result.stderr || result.stdout}`);
  const file = fs.readdirSync(dir).find((f) => f.startsWith(id + "."));
  if (!file) throw new Error(`yt-dlp finished but no file was written for ${id}`);
  return path.join(dir, file);
}
