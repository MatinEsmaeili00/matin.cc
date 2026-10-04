import { YouTubePlayer } from "@/components/media/youtube-player";
import { getYouTubeVideo } from "@/lib/youtube";

/** Secondary demo videos. All are click-to-load facades — no iframes until played. */
export async function VideoList({ videos }: { videos: { id: string; title?: string }[] }) {
  if (!videos.length) return null;
  const resolved = await Promise.all(
    videos.map(async (v) => {
      const data = await getYouTubeVideo(v.id);
      return { ...data, title: v.title ?? data.title };
    }),
  );

  return (
    <ul className="grid gap-x-6 gap-y-10 md:grid-cols-2">
      {resolved.map((video) => (
        <li key={video.id}>
          <YouTubePlayer
            id={video.id}
            title={video.title}
            poster={video.thumbnail}
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <p className="mt-3 text-[0.9375rem] text-fg">{video.title}</p>
        </li>
      ))}
    </ul>
  );
}
