import Image from "next/image";
import path from "node:path";
import type { MDXComponents } from "mdx/types";
import { isValidElement, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from "react";
import { imageSizeFromFile } from "image-size/fromFile";
import { CodeBlock } from "@/components/code/code-block";
import { GitHubCode } from "@/components/code/github-code";
import { EmbedFacade } from "@/components/media/embed-facade";
import { PreviewVideo } from "@/components/media/preview-video";
import { YouTubePlayer } from "@/components/media/youtube-player";
import { Metrics } from "@/components/project/metrics";
import { publicFileExists, PUBLIC_DIR, withExtension } from "@/lib/content/load";
import type { Project } from "@/lib/content/projects";
import { parseYouTubeId } from "@/lib/refs";
import { cn, isExternal } from "@/lib/utils";
import { getYouTubeVideo } from "@/lib/youtube";

/**
 * Everything available inside a project's MDX body.
 *
 * Markdown elements are restyled; these custom components can be used directly:
 *
 *   <Video id="dQw4w9WgXcQ" caption="..." />            YouTube, click-to-play
 *   <Clip src="/media/slug/clip.mp4" caption="..." />    muted local loop
 *   <Figure src="/media/slug/a.jpg" alt="..." caption="..." />
 *   <GitHubCode path="Shaders/X.usf" lines="10-40" />   live excerpt from the project repo
 *   <Callout title="Why not X?">...</Callout>
 *   <Columns>...</Columns>                               two columns on desktop
 *   <Metrics items={[{ value: "64/64", label: "tests" }]} />
 *   <Embed src="https://..." title="..." />             click-to-load iframe
 */
export function getMDXComponents(project?: Project): MDXComponents {
  return {
    pre: Pre,
    a: Anchor,
    img: MarkdownImage,
    table: (props: ComponentPropsWithoutRef<"table">) => (
      <div className="not-prose -mx-1 overflow-x-auto px-1">
        <table {...props} />
      </div>
    ),

    Video,
    Clip,
    Figure,
    Callout,
    Columns,
    Metrics,
    Embed: EmbedFacade,
    GitHubCode: (props: Omit<ComponentPropsWithoutRef<typeof GitHubCode>, "repo"> & { repo?: string }) => {
      const repo = props.repo ?? project?.github;
      if (!repo) throw new Error(`<GitHubCode path="${props.path}">: pass repo="owner/name" (the project has no github field)`);
      return <GitHubCode {...props} repo={repo} />;
    },
  };
}

/* ------------------------------------------------------------------------ */

type CodeElementProps = { className?: string; metastring?: string; children?: ReactNode };

function Pre({ children }: ComponentPropsWithoutRef<"pre">) {
  if (!isValidElement(children)) return <pre>{children}</pre>;
  const code = children as ReactElement<CodeElementProps>;
  const lang = code.props.className?.match(/language-([\w#+-]+)/)?.[1];
  const meta = parseMeta(code.props.metastring);
  return (
    <CodeBlock
      code={String(code.props.children ?? "")}
      lang={lang}
      title={meta.title}
      highlight={meta.highlight}
      startLine={meta.start}
      lineNumbers={meta.lineNumbers}
      sourceUrl={meta.source}
    />
  );
}

/** title="X.usf" source="https://..." start=48 {3,5-7} nolines */
function parseMeta(meta = "") {
  const attr = (name: string) => meta.match(new RegExp(`${name}=(?:"([^"]*)"|(\\S+))`))?.slice(1).find(Boolean);
  const start = attr("start");
  return {
    title: attr("title"),
    source: attr("source"),
    start: start ? parseInt(start, 10) : undefined,
    highlight: meta.match(/\{([\d,\s-]+)\}/)?.[1],
    lineNumbers: /\bnolines\b/.test(meta) ? false : /\blines\b/.test(meta) ? true : undefined,
  };
}

function Anchor({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  return isExternal(href) ? <a href={href} target="_blank" rel="noopener" {...props} /> : <a href={href} {...props} />;
}

async function Video({ id, caption }: { id: string; caption?: string }) {
  const videoId = parseYouTubeId(id);
  if (!videoId) throw new Error(`<Video id="${id}">: not a YouTube id or URL`);
  const video = await getYouTubeVideo(videoId);
  return (
    <figure className="not-prose my-10">
      <YouTubePlayer id={videoId} title={video.title} poster={video.thumbnail} sizes="(min-width: 1024px) 800px, 100vw" />
      <Caption>{caption ?? video.title}</Caption>
    </figure>
  );
}

function Clip({ src, caption, alt }: { src: string; caption?: string; alt?: string }) {
  const webm = withExtension(src, ".webm");
  const poster = withExtension(src, ".jpg");
  const video = {
    mp4: src,
    webm: publicFileExists(webm) ? webm : null,
    poster: publicFileExists(poster) ? poster : null,
  };
  return (
    <figure className="not-prose my-10">
      <div className="relative aspect-video overflow-hidden bg-ink-2" role="img" aria-label={alt ?? caption ?? ""}>
        {video.poster && <Image src={video.poster} alt="" fill sizes="(min-width: 1024px) 800px, 100vw" className="object-cover" />}
        <PreviewVideo video={video} mode="inview" />
      </div>
      {caption && <Caption>{caption}</Caption>}
    </figure>
  );
}

async function Figure({ src, alt, caption, className }: { src: string; alt: string; caption?: string; className?: string }) {
  const size = await localImageSize(src);
  return (
    <figure className={cn("not-prose my-10", className)}>
      <Image
        src={src}
        alt={alt}
        width={size.width}
        height={size.height}
        sizes="(min-width: 1024px) 800px, 100vw"
        className="h-auto w-full bg-ink-2"
      />
      {caption && <Caption>{caption}</Caption>}
    </figure>
  );
}

function MarkdownImage({ src, alt = "", title }: ComponentPropsWithoutRef<"img">) {
  if (typeof src !== "string") return null;
  return <Figure src={src} alt={alt} caption={title ?? undefined} />;
}

function Callout({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="my-10 border-l border-accent bg-ink-2 px-5 py-4 sm:px-6 sm:py-5">
      {title && <p className="label mb-2 text-accent">{title}</p>}
      <div className="space-y-3 text-fg-muted [&_strong]:text-fg">{children}</div>
    </aside>
  );
}

function Columns({ children }: { children: ReactNode }) {
  return <div className="my-10 grid gap-8 md:grid-cols-2 [&>*]:!mt-0">{children}</div>;
}

function Caption({ children }: { children: ReactNode }) {
  return <figcaption className="label mt-3 normal-case tracking-[0.02em]">{children}</figcaption>;
}

async function localImageSize(src: string) {
  if (src.startsWith("/") && publicFileExists(src)) {
    try {
      const { width, height } = await imageSizeFromFile(path.join(PUBLIC_DIR, decodeURI(src)));
      return { width, height };
    } catch {
      /* fall through */
    }
  }
  return { width: 1600, height: 900 };
}
