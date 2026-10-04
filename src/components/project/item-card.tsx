import Image from "next/image";
import Link from "next/link";
import { PreviewVideo } from "@/components/media/preview-video";
import { ProceduralCover } from "@/components/media/procedural-cover";
import { YouTubeHoverPreview } from "@/components/media/youtube-hover-preview";
import { YouTubePlayer } from "@/components/media/youtube-player";
import type { Project, ProjectItem } from "@/lib/content/projects";
import { cn } from "@/lib/utils";
import { techLabels } from "./format";

/**
 * The visual for one piece: local loop over its poster, an image, a YouTube
 * hover preview, or the procedural stand-in. Plays on hover / when on screen.
 */
export function ItemMedia({ item, sizes, className }: { item: ProjectItem; sizes: string; className?: string }) {
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-lg bg-ink-2", className)}>
      {item.image ? (
        <Image
          src={item.image.src}
          alt={item.title}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]"
        />
      ) : (
        <ProceduralCover seed={item.id} />
      )}
      {item.video ? <PreviewVideo video={item.video} /> : item.youtube ? <YouTubeHoverPreview id={item.youtube} /> : null}
    </div>
  );
}

/** Homepage card for a piece inside a collection — links to its spot on the project page. */
export function ItemCard({
  project,
  item,
  sizes = "(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  project: Pick<Project, "url" | "title" | "tech">;
  item: ProjectItem;
  sizes?: string;
}) {
  const tech = techLabels(item.tech.length ? item.tech : project.tech, 3);
  return (
    <article className="group" data-preview-root>
      <Link href={`${project.url}#${item.id}`} className="block focus-visible:outline-offset-4">
        <ItemMedia item={item} sizes={sizes} />
        <h3 className="mt-4 text-xl leading-tight font-semibold tracking-tight transition-colors group-hover:text-accent">
          {item.title}
        </h3>
        {item.summary && <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-relaxed text-fg-muted">{item.summary}</p>}
        <p className="label mt-3">{tech.join(" · ")}</p>
      </Link>
    </article>
  );
}

/** The "Pieces" grid on a collection's project page. */
export function PieceGrid({ items }: { items: ProjectItem[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2">
      {items.map((item) => (
        <li key={item.id} id={item.id} className="scroll-mt-24" data-preview-root>
          {item.youtube && item.image ? (
            <YouTubePlayer
              id={item.youtube}
              title={item.title}
              poster={item.image}
              preview={item.video}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          ) : (
            <ItemMedia item={item} sizes="(min-width: 768px) 50vw, 100vw" />
          )}
          <h3 className="mt-4 text-lg font-semibold tracking-tight">{item.title}</h3>
          {item.summary && <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">{item.summary}</p>}
          {item.tech.length > 0 && <p className="label mt-2">{techLabels(item.tech).join(" · ")}</p>}
        </li>
      ))}
    </ul>
  );
}
