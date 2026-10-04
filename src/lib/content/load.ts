/**
 * Reads and validates content/projects/*.mdx.
 *
 * Plain Node — no Next.js or React imports — so the CLI scripts
 * (validate, new-project, audit) share exactly the same parsing as the site.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { formatIssues, projectFrontmatterSchema, type ProjectFrontmatter } from "./schema";

export const CONTENT_DIR = path.join(process.cwd(), "content");
export const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");
export const PUBLIC_DIR = path.join(process.cwd(), "public");

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type RawProject = {
  slug: string;
  /** Path relative to the repo root, for error messages. */
  file: string;
  data: ProjectFrontmatter;
  /** MDX body (everything after the frontmatter). */
  body: string;
};

export type LoadResult = {
  projects: RawProject[];
  errors: string[];
};

/** Files starting with "_" (templates, notes) are ignored. */
export function listProjectFiles(): string[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .sort();
}

export function loadProjects({ includeDrafts = false } = {}): LoadResult {
  const projects: RawProject[] = [];
  const errors: string[] = [];

  for (const filename of listProjectFiles()) {
    const file = path.posix.join("content/projects", filename);
    const slug = filename.replace(/\.mdx$/, "");

    if (!SLUG.test(slug)) {
      errors.push(`${file}\n  • filename must be kebab-case (it becomes the URL /work/${slug})`);
      continue;
    }

    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(fs.readFileSync(path.join(PROJECTS_DIR, filename), "utf8"));
    } catch (error) {
      errors.push(`${file}\n  • frontmatter is not valid YAML: ${(error as Error).message}`);
      continue;
    }

    const result = projectFrontmatterSchema.safeParse(clean(parsed.data));
    if (!result.success) {
      errors.push(formatIssues(file, result.error));
      continue;
    }
    if (result.data.draft && !includeDrafts) continue;

    projects.push({ slug, file, data: result.data, body: parsed.content });
  }

  errors.push(...crossFileErrors(projects));
  return { projects, errors };
}

/**
 * Normalizes blank values before validation: the CMS writes empty text fields
 * as "" and cleared fields as null, which mean "not set" here.
 */
export function clean(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(clean).filter((v) => v !== undefined);
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      const c = clean(v);
      if (c !== undefined) out[key] = c;
    }
    return out;
  }
  if (value === null || (typeof value === "string" && value.trim() === "")) return undefined;
  return value;
}

/** Problems that only show up when looking at all projects together. */
function crossFileErrors(projects: RawProject[]): string[] {
  const errors: string[] = [];
  const owners = new Map<string, string>();

  for (const p of projects) {
    for (const alias of p.data.aliases) {
      const route = `/work/${p.slug}`;
      if (alias === route) {
        errors.push(`${p.file}\n  • aliases: "${alias}" is the project's own URL`);
        continue;
      }
      const owner = owners.get(alias);
      if (owner) errors.push(`${p.file}\n  • aliases: "${alias}" is already claimed by ${owner}`);
      owners.set(alias, p.file);
    }
  }
  return errors;
}

/** Every local (/public) media path a project references, with the field it came from. */
export function localMediaRefs(data: ProjectFrontmatter): { field: string; src: string }[] {
  const refs: { field: string; src: string }[] = [];
  if (data.cover?.startsWith("/")) refs.push({ field: "cover", src: data.cover });
  if (data.preview?.startsWith("/")) refs.push({ field: "preview", src: data.preview });
  data.gallery.forEach((g, i) => {
    if (g.src.startsWith("/")) refs.push({ field: `gallery.${i}.src`, src: g.src });
  });
  data.items.forEach((item, i) => {
    if (item.media?.startsWith("/")) refs.push({ field: `items.${i}.media`, src: item.media });
  });
  return refs;
}

export function publicFileExists(src: string): boolean {
  return fs.existsSync(path.join(PUBLIC_DIR, decodeURI(src)));
}

/** Swap a public path's extension: ("/a/clip.mp4", ".jpg") → "/a/clip.jpg". */
export function withExtension(src: string, ext: string): string {
  return src.replace(/\.[^./]+$/, "") + ext;
}
