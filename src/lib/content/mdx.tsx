import "server-only";
import { evaluate } from "@mdx-js/mdx";
import GithubSlugger from "github-slugger";
import type { MDXComponents } from "mdx/types";
import * as runtime from "react/jsx-runtime";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

/**
 * Compiles a project's MDX body at build time (server only).
 * Fenced code keeps its meta string (```hlsl title="X.usf" {3-5}) via
 * rehypeCodeMeta so the code block can read it.
 */
export async function renderMDX(source: string, components: MDXComponents) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeCodeMeta],
  });
  return <Content components={components} />;
}

export type TocEntry = { id: string; text: string };

/**
 * Level-2 headings for the case-study table of contents. Slugs are generated
 * exactly the way rehype-slug does (github-slugger over every heading, in
 * order) so the anchors match.
 */
export function extractToc(source: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const toc: TocEntry[] = [];
  let inFence = false;

  for (const line of source.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!match) continue;
    const text = plainText(match[2]);
    const id = slugger.slug(text);
    if (match[1].length === 2) toc.push({ id, text });
  }
  return toc;
}

function plainText(markdown: string): string {
  return markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim();
}

type HastNode = {
  type: string;
  tagName?: string;
  data?: { meta?: string };
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function rehypeCodeMeta() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === "element" && node.tagName === "pre") {
        const code = node.children?.find((c) => c.type === "element" && c.tagName === "code");
        if (code?.data?.meta) {
          code.properties = { ...code.properties, metastring: code.data.meta };
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
