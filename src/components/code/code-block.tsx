import { highlight, languageLabel, parseLineRanges, resolveLanguage } from "@/lib/highlight";
import { ArrowUpRight } from "@/components/ui/icons";
import { CopyButton } from "./copy-button";

export type CodeBlockProps = {
  code: string;
  lang?: string;
  /** Filename or caption shown in the header. */
  title?: string;
  /** Show line numbers. Defaults to on for snippets longer than 4 lines. */
  lineNumbers?: boolean;
  /** First line number (for excerpts from larger files). */
  startLine?: number;
  /** Lines to emphasise, in file line numbers: "3,7-9". */
  highlight?: string;
  /** Link to the full source, e.g. on GitHub. */
  sourceUrl?: string;
};

/**
 * Server-rendered code panel: header with filename + language, highlighted
 * body that scrolls horizontally on small screens, and a copy button (the
 * only client JS involved).
 */
export async function CodeBlock({
  code,
  lang,
  title,
  lineNumbers,
  startLine = 1,
  highlight: highlightSpec,
  sourceUrl,
}: CodeBlockProps) {
  const language = resolveLanguage(lang);
  const source = code.replace(/\n+$/, "");
  const showLines = lineNumbers ?? source.split("\n").length > 4;
  const html = await highlight(source, language, {
    highlightLines: parseLineRanges(highlightSpec),
    startLine,
  });

  return (
    <figure className="not-prose scope-dark my-8 overflow-hidden rounded-lg border border-line bg-ink-2 text-fg">
      <figcaption className="flex min-h-11 items-center justify-between gap-4 border-b border-line pl-4">
        <span className="flex min-w-0 items-baseline gap-3">
          <span className="label shrink-0 text-accent">{languageLabel(language)}</span>
          {title && <span className="truncate font-mono text-[0.75rem] text-fg-muted">{title}</span>}
        </span>
        <span className="flex shrink-0 items-center">
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener"
              className="label flex h-11 items-center gap-1.5 px-3 transition-colors hover:text-fg"
            >
              Source <ArrowUpRight className="size-2.5" />
            </a>
          )}
          <CopyButton text={source} />
        </span>
      </figcaption>
      <div
        className="code-body"
        data-lines={showLines}
        style={{ ["--start" as string]: startLine - 1 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
