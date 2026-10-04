/**
 * The project frontmatter contract.
 *
 * This is the single definition of what a project file may contain. The site,
 * `npm run validate` and `npm run new-project` all use it, so a file that
 * passes validation is guaranteed to render.
 *
 * Narrative (overview, problem, breakdown, challenges, results) lives in the
 * MDX body, not here. Frontmatter holds facts that drive layout, filtering,
 * integrations and SEO.
 */
import { z } from "zod";
import { CATEGORY_IDS, TECH, TECH_IDS, isTechId, type TechId } from "@/config/taxonomy";
import { parseGitHubRepo, parseYouTubeId } from "@/lib/refs";

/** A file in /public ("/media/slug/file.jpg") or an absolute https URL. */
const mediaSrc = z
  .string()
  .regex(/^(\/(?!\/)|https:\/\/)/, 'must start with "/" (a file in /public) or "https://"');

const url = z.url({ protocol: /^https?$/, error: "must be a full http(s) URL" });

const youtubeRef = z.string().transform((value, ctx) => {
  const id = parseYouTubeId(value);
  if (!id) {
    ctx.addIssue({ code: "custom", message: `"${value}" is not a YouTube video id or URL` });
    return z.NEVER;
  }
  return id;
});

const githubRef = z.string().transform((value, ctx) => {
  const repo = parseGitHubRepo(value);
  if (!repo) {
    ctx.addIssue({ code: "custom", message: `"${value}" is not "owner/repo" or a github.com URL` });
    return z.NEVER;
  }
  return repo;
});

const techRef = z.string().transform((value, ctx) => {
  if (isTechId(value)) return value as TechId;
  ctx.addIssue({ code: "custom", message: unknownTechMessage(value) });
  return z.NEVER;
});

export const STATUSES = ["shipped", "active", "prototype", "archived"] as const;
export const TIERS = ["featured", "project", "archive"] as const;

export const projectFrontmatterSchema = z
  .object({
    /** Display title. */
    title: z.string().min(1),

    /** One line, ~80–160 chars. Used on cards and as the meta description. */
    summary: z.string().min(10).max(200),

    /** Start year — drives sorting. */
    year: z.number().int().min(2000).max(2100),
    /** End year, or "present" for ongoing work. Omit for single-year projects. (The CMS stores it as text.) */
    yearEnd: z
      .union([z.number().int(), z.literal("present"), z.string().regex(/^\d{4}$/, 'a 4-digit year or "present"')])
      .transform((v) => (v === "present" ? v : Number(v)))
      .pipe(z.union([z.literal("present"), z.number().int().min(2000).max(2100)]))
      .optional(),

    /** shipped = finished/released · active = in progress · prototype · archived */
    status: z.enum(STATUSES).default("shipped"),

    /**
     * Visual weight.
     * featured = large cinematic rows on the homepage
     * project  = cards in the "Selected work" grid
     * archive  = compact list; still has its own page
     */
    tier: z.enum(TIERS).default("project"),
    /** Higher numbers sort first within a tier. Ties sort by year (newest first). */
    priority: z.number().default(0),

    categories: z.array(z.enum(CATEGORY_IDS)).min(1, "list at least one category"),
    tech: z.array(techRef).default([]),

    /** Your role in your own words, e.g. "Solo developer" or "Rendering engineer". */
    role: z.string().optional(),
    /** 1 = solo. */
    teamSize: z.number().int().positive().optional(),
    /** Where it happened: "LSU XR Studio", "Chillennium 2024 game jam", "Graduate course". */
    context: z.string().optional(),

    /** "owner/repo" or a GitHub URL. Enables live repository data on the page. */
    github: githubRef.optional(),
    /** Main demo video — id or URL. Becomes the hero player. */
    youtube: youtubeRef.optional(),
    /** Additional videos shown in the Videos section. */
    videos: z
      .array(z.object({ id: youtubeRef, title: z.string().optional() }).strict())
      .default([]),

    links: z
      .object({
        steam: url.optional(),
        itch: url.optional(),
        demo: url.optional(),
        website: url.optional(),
        docs: url.optional(),
      })
      .strict()
      .default({}),

    /** Card + social image. Falls back to the preview poster, then the YouTube thumbnail. */
    cover: mediaSrc.optional(),
    /**
     * Short muted loop (.mp4). A sibling .webm and .jpg poster with the same
     * name are picked up automatically — `npm run media` generates all three.
     */
    preview: mediaSrc.optional(),
    gallery: z
      .array(
        z
          .object({
            src: mediaSrc,
            alt: z.string().min(1, "describe the image for screen readers"),
            caption: z.string().optional(),
          })
          .strict(),
      )
      .default([]),

    /** 2–5 short "what I built" bullets, shown near the top of the case study. */
    highlights: z.array(z.string()).default([]),
    /** Results as numbers: [{ value: "0.4 s", label: "voice → robot latency" }]. */
    metrics: z
      .array(z.object({ value: z.string(), label: z.string() }).strict())
      .default([]),

    /** Old URLs (e.g. from the WordPress site) that should 301 to this project. */
    aliases: z.array(z.string().regex(/^\/[^\s]*$/, 'must be a path starting with "/"')).default([]),

    /** Drafts are skipped in production builds. */
    draft: z.boolean().default(false),
  })
  .strict();

export type ProjectFrontmatter = z.output<typeof projectFrontmatterSchema>;
export type ProjectStatus = (typeof STATUSES)[number];
export type ProjectTier = (typeof TIERS)[number];

/** Turns zod issues into one readable line per problem. */
export function formatIssues(file: string, error: z.ZodError): string {
  const lines = error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "(root)";
    let message = issue.message;
    if (issue.code === "unrecognized_keys") {
      message = `unknown field(s): ${issue.keys.join(", ")} — check spelling against src/lib/content/schema.ts`;
    }
    return `  • ${path}: ${message}`;
  });
  return `${file}\n${lines.join("\n")}`;
}

function unknownTechMessage(value: string): string {
  const needle = value.toLowerCase();
  const byLabel = TECH_IDS.find((id) => TECH[id].label.toLowerCase() === needle);
  if (byLabel) return `unknown tech "${value}" — use the id "${byLabel}"`;

  const ranked = TECH_IDS.map((id) => ({ id, d: distance(needle, id) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map((r) => `"${r.id}"`);
  return `unknown tech "${value}" — did you mean ${ranked.join(", ")}? (add new ones to src/config/taxonomy.ts)`;
}

/** Levenshtein distance, for suggestions only. */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = temp;
    }
  }
  return row[b.length];
}
