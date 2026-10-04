/**
 * Content checks shared by `npm run validate` and the /admin dashboard.
 * Plain Node (no Next/React imports), like load.ts.
 *
 *   errors   — would break the build or a page: schema violations, missing
 *              media files, bad video ids, broken /work links, alias clashes
 *   warnings — renders fine but could be better (no visuals, no role…)
 */
import fs from "node:fs";
import path from "node:path";
import { parseYouTubeId } from "../refs";
import { CONTENT_DIR, loadProjects, localMediaRefs, publicFileExists, withExtension } from "./load";

export type ValidationReport = {
  projectCount: number;
  errors: string[];
  warnings: string[];
};

export function validateContent(): ValidationReport {
  const { projects, errors } = loadProjects({ includeDrafts: true });
  const warnings: string[] = [];
  const slugs = new Set(projects.map((p) => p.slug));

  for (const p of projects) {
    const problems: string[] = [];
    const notes: string[] = [];
    const { data, body } = p;

    for (const ref of localMediaRefs(data)) {
      if (!publicFileExists(ref.src)) problems.push(`${ref.field}: file not found — public${ref.src}`);
    }
    if (data.preview?.startsWith("/") && publicFileExists(data.preview)) {
      if (!publicFileExists(withExtension(data.preview, ".jpg"))) {
        notes.push(`preview has no poster (${withExtension(data.preview, ".jpg")}) — run npm run media to generate one`);
      }
    }

    const prose = stripCodeAndComments(body);
    for (const [, src] of prose.matchAll(/<(?:Clip|Figure)\b[^>]*\bsrc="([^"]+)"/g)) {
      if (src.startsWith("/") && !publicFileExists(src)) problems.push(`body: media not found — public${src}`);
    }
    for (const [, src] of prose.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)/g)) {
      if (!publicFileExists(src)) problems.push(`body: image not found — public${src}`);
    }
    for (const [, id] of prose.matchAll(/<Video\b[^>]*\bid="([^"]+)"/g)) {
      if (!parseYouTubeId(id)) problems.push(`body: <Video id="${id}"> is not a YouTube id or URL`);
    }
    for (const [tag] of prose.matchAll(/<GitHubCode\b[^>]*\/>/g)) {
      if (!/\brepo="/.test(tag) && !data.github) problems.push(`body: ${tag} needs repo="owner/name" (no github field)`);
      if (!/\bpath="/.test(tag)) problems.push(`body: ${tag} is missing path="..."`);
    }
    for (const [, slug] of prose.matchAll(/\]\(\/work\/([a-z0-9-]+)\)/g)) {
      if (!slugs.has(slug)) problems.push(`body: link to /work/${slug} — no such project`);
    }

    if (!data.cover && !data.preview && !data.youtube && data.gallery.length === 0) {
      notes.push("no cover, preview, video or gallery — a procedural cover will be used");
    }
    if (data.tier === "featured" && !data.preview && !data.youtube) {
      notes.push("featured project without a preview loop or video — motion sells featured work");
    }
    if (!data.role) notes.push("no role — say what you did");
    if (!body.trim()) notes.push("no case-study body");
    if (data.draft) notes.push("draft — hidden in production");

    if (problems.length) errors.push(`${p.file}\n${problems.map((m) => `  • ${m}`).join("\n")}`);
    if (notes.length) warnings.push(`${p.file}\n${notes.map((m) => `  · ${m}`).join("\n")}`);
  }

  if (!fs.existsSync(path.join(CONTENT_DIR, "about.mdx"))) errors.push("content/about.mdx is missing");

  return { projectCount: projects.length, errors, warnings };
}

/** Code fences and MDX comments can mention components without using them. */
function stripCodeAndComments(source: string): string {
  return source.replace(/^(```|~~~)[\s\S]*?^\1/gm, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
}
