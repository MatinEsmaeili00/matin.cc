import Image from "next/image";
import { PreviewVideo } from "@/components/media/preview-video";
import type { GalleryItem } from "@/lib/content/projects";

/** Media gallery: two columns on desktop, natural aspect ratios, captions below. */
export function Gallery({ items }: { items: GalleryItem[] }) {
  if (!items.length) return null;
  return (
    <ul className="grid gap-x-6 gap-y-10 md:grid-cols-2">
      {items.map((item) => (
        <li key={item.kind === "image" ? item.src : item.mp4}>
          <figure>
            {item.kind === "image" ? (
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="h-auto w-full bg-ink-2"
              />
            ) : (
              <div className="relative aspect-video overflow-hidden bg-ink-2" role="img" aria-label={item.alt}>
                {item.poster && (
                  <Image src={item.poster} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                )}
                <PreviewVideo video={item} mode="inview" />
              </div>
            )}
            {item.caption && <figcaption className="label mt-3 normal-case tracking-[0.02em]">{item.caption}</figcaption>}
          </figure>
        </li>
      ))}
    </ul>
  );
}
