/**
 * npm run media -- <slug> <file...> [options]
 *
 * Turns raw captures into web-ready project media in public/media/<slug>/:
 *
 *   video / GIF  →  <name>.mp4 + <name>.webm + <name>.jpg (poster)
 *   image        →  <name>.jpg (max 2000px wide)
 *
 * Then prints the frontmatter to paste into content/projects/<slug>.mdx.
 *
 * Options
 *   --name <name>      output name (single input only), e.g. --name preview
 *   --start <sec>      trim start (videos)
 *   --duration <sec>   trim length (videos) — previews work best at 5–12 s
 *   --width <px>       max width (default 1280 for video, 2000 for images)
 *   --crf <n>          H.264 quality, lower = better (default 26; try 30 for GIF sources)
 *   --fps <n>          frame-rate cap (default 30)
 *   --no-webm          skip the VP9 variant
 *
 * Examples
 *   npm run media -- snow-deformation ~/Captures/snow.mp4 --name preview --start 3 --duration 8
 *   npm run media -- snow-deformation shot1.png shot2.png
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileSizeKB, IMAGE_INPUT, transcodeImage, transcodeVideo, VIDEO_INPUT } from "./lib/ffmpeg";

const HELP = `Usage: npm run media -- <slug> <file...> [--name preview] [--start s] [--duration s] [--width px] [--no-webm]

  video / GIF  →  public/media/<slug>/<name>.mp4 + .webm + .jpg poster
  image        →  public/media/<slug>/<name>.jpg

Use --name preview for the card/hero loop and --name cover for the cover image.`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    name: { type: "string" },
    start: { type: "string" },
    duration: { type: "string" },
    width: { type: "string" },
    crf: { type: "string" },
    fps: { type: "string" },
    "no-webm": { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

const [slug, ...inputs] = positionals;

if (values.help || !slug || inputs.length === 0) {
  console.log(HELP);
  process.exit(values.help ? 0 : 1);
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error(`"${slug}" isn't a valid slug — use the project's filename, e.g. snow-deformation`);
  process.exit(1);
}
if (values.name && inputs.length > 1) {
  console.error("--name only works with a single input file");
  process.exit(1);
}

const outDir = path.join(process.cwd(), "public", "media", slug);
const publicPath = (file: string) => `/media/${slug}/${path.basename(file)}`;
const snippets: string[] = [];

for (const input of inputs) {
  if (!fs.existsSync(input)) {
    console.error(`✗ ${input}: file not found`);
    continue;
  }
  const name = values.name ?? sanitize(path.parse(input).name);
  const base = path.join(outDir, name);

  if (VIDEO_INPUT.test(input)) {
    process.stdout.write(`▸ ${path.basename(input)} → ${name}.{mp4,webm,jpg} … `);
    transcodeVideo(input, base, {
      width: values.width ? Number(values.width) : undefined,
      start: values.start ? Number(values.start) : undefined,
      duration: values.duration ? Number(values.duration) : undefined,
      crf: values.crf ? Number(values.crf) : undefined,
      fps: values.fps ? Number(values.fps) : undefined,
      noWebm: values["no-webm"],
    });
    const webm = fs.existsSync(`${base}.webm`) ? `, webm ${fileSizeKB(`${base}.webm`)} KB` : "";
    console.log(`mp4 ${fileSizeKB(`${base}.mp4`)} KB${webm}`);
    snippets.push(
      name === "preview"
        ? `preview: ${publicPath(`${base}.mp4`)}`
        : `  - src: ${publicPath(`${base}.mp4`)}\n    alt: TODO describe this clip`,
    );
  } else if (IMAGE_INPUT.test(input)) {
    const out = `${base}.jpg`;
    process.stdout.write(`▸ ${path.basename(input)} → ${name}.jpg … `);
    transcodeImage(input, out, values.width ? Number(values.width) : undefined);
    console.log(`${fileSizeKB(out)} KB`);
    snippets.push(
      name === "cover"
        ? `cover: ${publicPath(out)}`
        : `  - src: ${publicPath(out)}\n    alt: TODO describe this image`,
    );
  } else {
    console.error(`✗ ${input}: unsupported file type`);
  }
}

if (snippets.length) {
  console.log(`\nAdd to content/projects/${slug}.mdx:\n`);
  const top = snippets.filter((s) => !s.startsWith("  -"));
  const gallery = snippets.filter((s) => s.startsWith("  -"));
  console.log([...top, ...(gallery.length ? ["gallery:", ...gallery] : [])].join("\n"));
}

function sanitize(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/\.mp4$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "media"
  );
}
