import "server-only";
import { cache } from "react";

/**
 * YouTube integration.
 *
 * Works with no API key: titles come from oEmbed and thumbnails from
 * i.ytimg.com. If YOUTUBE_API_KEY is set, publish date, duration and
 * description are added (used for VideoObject structured data).
 *
 * Requests run once per build. The browser never talks to YouTube until a
 * visitor presses play (see components/media/youtube-player.tsx).
 */

export type YouTubeThumbnail = {
  src: string;
  width: number;
  height: number;
};

export type YouTubeVideo = {
  id: string;
  title: string;
  author: string | null;
  thumbnail: YouTubeThumbnail;
  /** Only with YOUTUBE_API_KEY. */
  publishedAt?: string;
  /** ISO 8601 duration, e.g. "PT1M33S". Only with YOUTUBE_API_KEY. */
  duration?: string;
  description?: string;
};

const HQ = (id: string): YouTubeThumbnail => ({
  src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  width: 480,
  height: 360,
});

const MAXRES = (id: string): YouTubeThumbnail => ({
  src: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  width: 1280,
  height: 720,
});

const thumbnailMemo = new Map<string, Promise<YouTubeThumbnail>>();

/**
 * Best available thumbnail. maxresdefault only exists for HD uploads, so
 * probe it once and fall back to hqdefault (which always exists).
 *
 * hqdefault is 4:3 with letterbox bars for 16:9 videos; rendering it with
 * object-fit: cover in a 16:9 frame crops the bars away exactly.
 */
export function getYouTubeThumbnail(id: string): Promise<YouTubeThumbnail> {
  let pending = thumbnailMemo.get(id);
  if (!pending) {
    pending = fetch(MAXRES(id).src, { method: "HEAD", signal: AbortSignal.timeout(4000) })
      .then((res) => (res.ok ? MAXRES(id) : HQ(id)))
      .catch(() => HQ(id));
    thumbnailMemo.set(id, pending);
  }
  return pending;
}

type OEmbed = { title: string; author_name?: string };

export const getYouTubeVideo = cache(async (id: string): Promise<YouTubeVideo> => {
  const [thumbnail, oembed, details] = await Promise.all([
    getYouTubeThumbnail(id),
    fetchJson<OEmbed>(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
    ),
    getApiDetails(id),
  ]);

  return {
    id,
    title: details?.title ?? oembed?.title ?? "Video",
    author: oembed?.author_name ?? null,
    thumbnail,
    publishedAt: details?.publishedAt,
    duration: details?.duration,
    description: details?.description,
  };
});

type ApiResponse = {
  items?: {
    snippet: { title: string; description: string; publishedAt: string };
    contentDetails: { duration: string };
  }[];
};

async function getApiDetails(id: string) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  const data = await fetchJson<ApiResponse>(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${id}&key=${key}`,
  );
  const item = data?.items?.[0];
  if (!item) return null;
  return {
    title: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    duration: item.contentDetails.duration,
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
