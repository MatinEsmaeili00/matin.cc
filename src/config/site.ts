/**
 * Identity, contact links and homepage copy.
 *
 * The values live in content/settings/site.json — edit them in the CMS
 * (/keystatic → Site settings) or by hand. This file only gives them a typed
 * shape and derives URLs, so components never hardcode a name, URL or email.
 */
import raw from "../../content/settings/site.json";

/** Shape of site.json. Blank fields may be missing or null when saved from the CMS. */
type SiteSettings = {
  name: string;
  shortName?: string | null;
  url: string;
  roles?: string[];
  tagline?: string | null;
  bio?: string | null;
  description?: string | null;
  openTo?: string | null;
  location?: string | null;
  email: string;
  resume?: string | null;
  photo?: string | null;
  showreelYoutube?: string | null;
  showreelTitle?: string | null;
  githubUsername: string;
  youtubeHandle?: string | null;
  youtubeChannelId?: string | null;
  social?: { label: string; href: string }[];
};

const data = raw as SiteSettings;

const optional = (value: string | undefined | null) => (value && value.trim() ? value.trim() : null);

function build(settings: SiteSettings) {
  return {
    name: settings.name,
    shortName: settings.shortName || settings.name.split(" ")[0],
    url: settings.url.replace(/\/+$/, ""),
    locale: "en_US",

    /** Shown under the name on the homepage, in order. */
    roles: settings.roles ?? [],
    /** One or two plain-language sentences for the homepage hero. */
    tagline: settings.tagline ?? "",
    /** Homepage "About" strip. The full story lives in content/about.mdx. */
    bio: settings.bio ?? "",
    /** Default meta description. */
    description: settings.description ?? settings.tagline ?? "",
    /** "Open to …" line near contact links. */
    openTo: optional(settings.openTo),
    location: optional(settings.location),
    email: settings.email,

    /** Résumé PDF in /public (uploaded in the CMS, or dropped in as public/resume.pdf). Links hide if the file is missing. */
    resume: optional(settings.resume) ?? "/resume.pdf",
    /** Optional portrait in /public, shown in the hero and on About. */
    photo: optional(settings.photo),

    showreel: optional(settings.showreelYoutube)
      ? { youtube: settings.showreelYoutube!.trim(), title: settings.showreelTitle || "Portfolio reel" }
      : null,

    github: {
      username: settings.githubUsername,
      url: `https://github.com/${settings.githubUsername}`,
    },
    youtube: {
      handle: settings.youtubeHandle ?? "",
      url: settings.youtubeHandle ? `https://www.youtube.com/${settings.youtubeHandle}` : "",
      channelId: settings.youtubeChannelId ?? "",
    },

    /** Professional links, in display order. */
    social: (settings.social ?? []).filter((s) => s.label && s.href),
  };
}

export const site = build(data);
export type Site = ReturnType<typeof build>;
