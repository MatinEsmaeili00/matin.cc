/**
 * npm run new-project
 *
 * Creates content/projects/<slug>.mdx, pre-filled from GitHub and YouTube
 * where possible. Interactive when run in a terminal; fully scriptable with
 * flags (which is how Claude Code should call it):
 *
 *   npm run new-project -- --title "Snow Deformation" \
 *     --github MatinEsmaeili00/SnowDeformation --youtube https://youtu.be/XXXXXXXXXXX \
 *     --categories rendering,tools --tech unreal,cpp,hlsl --year 2026 --yes
 *
 * Flags: --title --slug --summary --github --youtube --year --status --tier
 *        --categories --tech --role --team --context --steam --itch
 *        --yes (accept defaults, never prompt)  --force (overwrite)
 */
import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { CATEGORIES, CATEGORY_IDS, TECH, isTechId } from "../src/config/taxonomy";
import { PROJECTS_DIR } from "../src/lib/content/load";
import { parseGitHubRepo, parseYouTubeId } from "../src/lib/refs";
import { githubToken } from "./lib/github-token";
import { STATUSES, TIERS } from "../src/lib/content/schema";

const { values: flags } = parseArgs({
  options: {
    title: { type: "string" },
    slug: { type: "string" },
    summary: { type: "string" },
    github: { type: "string" },
    youtube: { type: "string" },
    year: { type: "string" },
    status: { type: "string" },
    tier: { type: "string" },
    categories: { type: "string" },
    tech: { type: "string" },
    role: { type: "string" },
    team: { type: "string" },
    context: { type: "string" },
    steam: { type: "string" },
    itch: { type: "string" },
    yes: { type: "boolean", default: false },
    force: { type: "boolean", default: false },
  },
});

/** GitHub linguist names and common topics → tech ids. */
const LANGUAGE_TO_TECH: Record<string, string> = {
  "C++": "cpp",
  "C#": "csharp",
  HLSL: "hlsl",
  GLSL: "glsl",
  ShaderLab: "shaderlab",
  GDScript: "gdscript",
  Python: "python",
};
const TOPIC_TO_TECH: Record<string, string> = {
  "unreal-engine": "unreal",
  unreal: "unreal",
  ue5: "unreal",
  unity: "unity",
  unity3d: "unity",
  godot: "godot",
  ros2: "ros2",
  "compute-shader": "compute-shaders",
  "compute-shaders": "compute-shaders",
  vr: "vr",
  "virtual-reality": "vr",
  "augmented-reality": "ar",
  "meta-quest": "meta-quest",
  niagara: "niagara",
  docker: "docker",
  "dgx-spark": "dgx-spark",
  ollama: "llm",
  llm: "llm",
  whisper: "speech-recognition",
};

type GitHubInfo = { description: string | null; created: string; homepage: string | null; tech: string[]; name: string };

async function main() {
  const interactive = process.stdin.isTTY && !flags.yes;
  const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;
  const ask = async (question: string, fallback = ""): Promise<string> => {
    if (!rl) return fallback;
    const answer = (await rl.question(`${question}${fallback ? ` (${fallback})` : ""}: `)).trim();
    return answer || fallback;
  };

  // ── Sources first: they pre-fill everything else ────────────────────────
  const githubInput = flags.github ?? (await ask("GitHub repository (owner/repo or URL, blank for none)"));
  const github = githubInput ? parseGitHubRepo(githubInput) : null;
  if (githubInput && !github) fail(`"${githubInput}" isn't a GitHub repository reference`);

  const youtubeInput = flags.youtube ?? (await ask("YouTube video (URL or id, blank for none)"));
  const youtube = youtubeInput ? parseYouTubeId(youtubeInput) : null;
  if (youtubeInput && !youtube) fail(`"${youtubeInput}" isn't a YouTube URL or id`);

  const [gh, ytTitle] = await Promise.all([github ? fetchGitHub(github) : null, youtube ? fetchYouTubeTitle(youtube) : null]);
  if (gh) console.log(`  ↳ GitHub: ${gh.description ?? "(no description)"} — ${gh.tech.join(", ") || "no mapped languages"}`);
  if (ytTitle) console.log(`  ↳ YouTube: "${ytTitle}"`);

  // ── Facts ────────────────────────────────────────────────────────────────
  const title = flags.title ?? (await ask("Project name", gh ? humanize(gh.name) : ytTitle ?? ""));
  if (!title) fail("a title is required (--title)");

  const slug = flags.slug ?? (await ask("Slug (URL)", slugify(title)));
  const file = path.join(PROJECTS_DIR, `${slug}.mdx`);
  if (fs.existsSync(file) && !flags.force) fail(`content/projects/${slug}.mdx already exists (use --force to overwrite)`);

  const summary = flags.summary ?? (await ask("One-line summary", gh?.description ?? ""));
  const year = Number(flags.year ?? (await ask("Year", gh ? gh.created.slice(0, 4) : String(new Date().getFullYear()))));

  if (rl) console.log(`\nCategories: ${CATEGORIES.map((c) => c.id).join(", ")}`);
  const categories = list(flags.categories ?? (await ask("Categories (comma-separated)", "rendering")));
  const badCategory = categories.find((c) => !(CATEGORY_IDS as string[]).includes(c));
  if (badCategory) fail(`unknown category "${badCategory}" — one of: ${CATEGORY_IDS.join(", ")}`);

  const suggestedTech = gh?.tech.join(",") ?? "";
  if (rl) console.log(`\nTech ids: ${Object.keys(TECH).join(", ")}`);
  const tech = list(flags.tech ?? (await ask("Technologies (comma-separated ids)", suggestedTech)));
  const badTech = tech.filter((t) => !isTechId(t));
  if (badTech.length) fail(`unknown tech: ${badTech.join(", ")} — see src/config/taxonomy.ts`);

  const tier = flags.tier ?? (await ask(`Tier (${TIERS.join(" | ")})`, "project"));
  const status = flags.status ?? (await ask(`Status (${STATUSES.join(" | ")})`, "active"));
  const role = flags.role ?? (await ask("Your role", "Solo developer"));
  const team = flags.team ?? (await ask("Team size (1 = solo)", "1"));
  const context = flags.context ?? (await ask("Context (course, studio, jam… blank for none)"));
  rl?.close();

  // ── Write ────────────────────────────────────────────────────────────────
  const hasSummary = summary.trim().length >= 10;
  const fm: string[] = [
    "---",
    `title: ${yaml(title)}`,
    `summary: ${yaml(hasSummary ? summary : "TODO — one line, 80–160 characters, shown on cards and in search results")}`,
    `year: ${year}`,
    `status: ${status}`,
    `tier: ${tier}`,
    `categories: [${categories.join(", ")}]`,
    `tech: [${tech.join(", ")}]`,
    role && `role: ${yaml(role)}`,
    team && `teamSize: ${Number(team)}`,
    context && `context: ${yaml(context)}`,
    github && `github: ${github}`,
    youtube && `youtube: ${youtube}`,
    (flags.steam || flags.itch || gh?.homepage) && "links:",
    flags.steam && `  steam: ${flags.steam}`,
    flags.itch && `  itch: ${flags.itch}`,
    gh?.homepage && `  website: ${gh.homepage}`,
    `# preview: /media/${slug}/preview.mp4   ← npm run media -- ${slug} <capture> --name preview`,
    `# highlights:                            ← 2–5 one-line "what I built" bullets`,
    `#   - ...`,
    !hasSummary && "draft: true",
    "---",
  ].filter(Boolean) as string[];

  const body = [
    "",
    "## Overview",
    "",
    hasSummary ? summary : "TODO — what it is and why it exists.",
    "",
    "{/* Suggested sections: The problem · What I built · Technical breakdown · Challenges · Results.",
    ...(github ? [`    Show code straight from the repo: <GitHubCode path="Source/File.cpp" lines="10-40" highlight="20-25" />`] : []),
    `    Inline media: <Video id="..." />, <Clip src="/media/${slug}/clip.mp4" />, <Figure src="..." alt="..." /> */}`,
  ];

  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
  fs.writeFileSync(file, `${fm.join("\n")}\n${body.join("\n")}\n`);

  console.log(`\n✓ Created content/projects/${slug}.mdx${hasSummary ? "" : " (draft — add a summary, then remove draft: true)"}`);
  console.log(`  Next: fill in the TODOs, add media (npm run media -- ${slug} <files>), then npm run validate.`);
}

async function fetchGitHub(repo: string): Promise<GitHubInfo | null> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "matin.cc-new-project" };
  const token = githubToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const [info, languages] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}`, { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch(`https://api.github.com/repos/${repo}/languages`, { headers }).then((r) => (r.ok ? r.json() : {})),
    ]);
    if (!info) {
      console.warn(`  ! couldn't read ${repo} from GitHub (private, renamed, or rate-limited) — continuing without it`);
      return null;
    }
    const tech = new Set<string>();
    // Ignore minor languages (e.g. an Unreal plugin's Build.cs files are C#).
    const total = Object.values(languages as Record<string, number>).reduce((a, b) => a + b, 0);
    for (const [lang, bytes] of Object.entries(languages as Record<string, number>)) {
      if (LANGUAGE_TO_TECH[lang] && bytes / total >= 0.1) tech.add(LANGUAGE_TO_TECH[lang]);
    }
    for (const topic of info.topics ?? []) if (TOPIC_TO_TECH[topic]) tech.add(TOPIC_TO_TECH[topic]);
    if (/unreal|ue5|\bue\b/i.test(`${info.name} ${info.description}`)) tech.add("unreal");
    if (/\bunity\b/i.test(`${info.name} ${info.description}`)) tech.add("unity");
    // GitHub doesn't classify Unreal .usf files as HLSL, so infer shader work from the description.
    if (/shader|hlsl|\brdg\b/i.test(info.description ?? "")) tech.add("hlsl");
    if (/compute/i.test(info.description ?? "")) tech.add("compute-shaders");
    return { description: info.description, created: info.created_at, homepage: info.homepage || null, tech: [...tech], name: info.name };
  } catch {
    return null;
  }
}

async function fetchYouTubeTitle(id: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    return res.ok ? ((await res.json()) as { title: string }).title : null;
  } catch {
    return null;
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function humanize(repoName: string): string {
  return repoName
    .replace(/^(UE5?|Unity\d?)-/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
}

function list(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Quote YAML scalars only when needed. */
function yaml(value: string): string {
  return /^[\w][\w .,'()&/–—-]*$/.test(value) && !/:\s/.test(value) ? value : JSON.stringify(value);
}

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

main();
