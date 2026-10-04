import "server-only";
import { createHighlighter, type Highlighter, type ShikiTransformer } from "shiki";

/**
 * Build-time syntax highlighting. Runs on the server only, so no
 * highlighting code or grammars are shipped to the browser.
 */

const LANGS = [
  "cpp",
  "c",
  "csharp",
  "hlsl",
  "glsl",
  "wgsl",
  "shaderlab",
  "gdscript",
  "python",
  "typescript",
  "tsx",
  "javascript",
  "json",
  "yaml",
  "bash",
  "powershell",
  "ini",
  "cmake",
  "markdown",
] as const;

export const THEME = "vesper";

/** File extensions and common names → Shiki language ids. */
const ALIASES: Record<string, string> = {
  "c++": "cpp",
  cc: "cpp",
  h: "cpp",
  hpp: "cpp",
  cs: "csharp",
  "c#": "csharp",
  usf: "hlsl",
  ush: "hlsl",
  fx: "hlsl",
  shader: "shaderlab",
  cginc: "hlsl",
  frag: "glsl",
  vert: "glsl",
  comp: "glsl",
  gd: "gdscript",
  py: "python",
  ts: "typescript",
  js: "javascript",
  sh: "bash",
  shell: "bash",
  ps1: "powershell",
  yml: "yaml",
  md: "markdown",
};

/** Human label shown in the code block header. */
const LABELS: Record<string, string> = {
  cpp: "C++",
  c: "C",
  csharp: "C#",
  hlsl: "HLSL",
  glsl: "GLSL",
  wgsl: "WGSL",
  shaderlab: "ShaderLab",
  gdscript: "GDScript",
  python: "Python",
  typescript: "TypeScript",
  tsx: "TSX",
  javascript: "JavaScript",
  json: "JSON",
  yaml: "YAML",
  bash: "Shell",
  powershell: "PowerShell",
  ini: "INI",
  cmake: "CMake",
  markdown: "Markdown",
  text: "Text",
};

let highlighter: Promise<Highlighter> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighter({ themes: [THEME], langs: [...LANGS] });
  return highlighter;
}

export function resolveLanguage(lang: string | undefined): string {
  const key = (lang ?? "").toLowerCase().trim();
  const resolved = ALIASES[key] ?? key;
  return (LANGS as readonly string[]).includes(resolved) ? resolved : "text";
}

export function languageLabel(lang: string): string {
  return LABELS[lang] ?? lang.toUpperCase();
}

/** Parses "1,4-6,10" into a set of line numbers. */
export function parseLineRanges(spec: string | undefined): Set<number> {
  const lines = new Set<number>();
  for (const part of (spec ?? "").split(",")) {
    const [a, b] = part.split("-").map((n) => parseInt(n.trim(), 10));
    if (Number.isNaN(a)) continue;
    for (let i = a; i <= (Number.isNaN(b) ? a : b); i++) lines.add(i);
  }
  return lines;
}

export async function highlight(
  code: string,
  lang: string,
  { highlightLines = new Set<number>(), startLine = 1 }: { highlightLines?: Set<number>; startLine?: number } = {},
): Promise<string> {
  const shiki = await getHighlighter();
  const marker: ShikiTransformer = {
    line(node, line) {
      // `line` is 1-based within the snippet; highlight ranges use real file line numbers.
      if (highlightLines.has(line + startLine - 1)) this.addClassToHast(node, "hl");
    },
  };
  return shiki.codeToHtml(code, { lang, theme: THEME, transformers: [marker] });
}
