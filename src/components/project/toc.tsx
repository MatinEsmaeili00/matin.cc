import type { TocEntry } from "@/lib/content/mdx";
import { pad2 } from "@/lib/utils";

/** Sticky section index for long case studies (desktop only). */
export function Toc({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 2) return null;
  return (
    <nav aria-label="Sections" className="sticky top-24">
      <p className="label mb-4">Contents</p>
      <ol className="space-y-1 border-l border-line">
        {entries.map((entry, i) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="-ml-px flex gap-3 border-l border-transparent py-1.5 pl-4 text-sm text-fg-muted transition-colors hover:border-accent hover:text-fg"
            >
              <span className="font-mono text-[0.6875rem] text-fg-faint">{pad2(i + 1)}</span>
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
