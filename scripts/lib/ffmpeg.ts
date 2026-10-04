/**
 * Thin wrappers around the bundled ffmpeg binary (ffmpeg-static), so media
 * processing works on any machine after `npm install` — no system ffmpeg.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

export const VIDEO_INPUT = /\.(mp4|mov|m4v|webm|mkv|avi|gif)$/i;
export const IMAGE_INPUT = /\.(png|jpe?g|webp|bmp|tiff?)$/i;

export type VideoOptions = {
  /** Max output width in px (height follows aspect ratio). */
  width?: number;
  /** Trim: start offset in seconds. */
  start?: number;
  /** Trim: clip length in seconds. */
  duration?: number;
  /** Skip the .webm variant (faster; mp4 alone plays everywhere). */
  noWebm?: boolean;
  /** H.264 quality (lower = better/larger). VP9 uses this + 12. Default 26. */
  crf?: number;
  /** Frame-rate cap. Default 30. */
  fps?: number;
};

function run(args: string[]) {
  if (!ffmpegPath) throw new Error("ffmpeg-static has no binary for this platform");
  const result = spawnSync(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed (${args.join(" ")}):\n${result.stderr}`);
  }
}

/** Even dimensions are required by yuv420p; never upscale. */
const scale = (width: number) => `scale='min(${width},iw)':-2:flags=lanczos`;

/**
 * Video or GIF → muted, looping-friendly preview set:
 *   <out>.mp4  H.264, faststart (plays everywhere, streams immediately)
 *   <out>.webm VP9 (smaller, preferred by Chrome/Firefox)
 *   <out>.jpg  poster frame
 */
export function transcodeVideo(input: string, outBase: string, opts: VideoOptions = {}) {
  const width = opts.width ?? 1280;
  const trim = [
    ...(opts.start ? ["-ss", String(opts.start)] : []),
    ...(opts.duration ? ["-t", String(opts.duration)] : []),
  ];
  const crf = opts.crf ?? 26;
  const fps = opts.fps ?? 30;
  // GIFs are dithered; a temporal denoise removes the noise that otherwise eats bitrate.
  const denoise = /\.gif$/i.test(input) ? "hqdn3d=3:3:6:6," : "";
  const filters = `${denoise}fps=fps='min(${fps},source_fps)',${scale(width)},format=yuv420p`;
  fs.mkdirSync(path.dirname(outBase), { recursive: true });

  run([
    ...trim, "-i", input,
    "-an", "-vf", filters,
    "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-profile:v", "high",
    "-movflags", "+faststart",
    `${outBase}.mp4`,
  ]);

  if (!opts.noWebm) {
    run([
      ...trim, "-i", input,
      "-an", "-vf", filters,
      "-c:v", "libvpx-vp9", "-crf", String(crf + 12), "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
      `${outBase}.webm`,
    ]);
  }

  // A representative frame (the thumbnail filter skips black/blank frames).
  run([
    ...trim, "-i", input,
    "-vf", `thumbnail=60,${scale(width)}`,
    "-frames:v", "1", "-q:v", "3",
    `${outBase}.jpg`,
  ]);
}

/** Image → JPEG, resized to at most `width` px wide. */
export function transcodeImage(input: string, outFile: string, width = 2000) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  run(["-i", input, "-vf", scale(width), "-frames:v", "1", "-q:v", "3", outFile]);
}

export function fileSizeKB(file: string): number {
  return Math.round(fs.statSync(file).size / 1024);
}
