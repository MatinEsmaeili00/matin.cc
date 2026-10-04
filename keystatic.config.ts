/**
 * The content editor (CMS) — open http://localhost:3000/keystatic while
 * `npm run dev` is running. It edits the same files the site is built from:
 *
 *   Projects       → content/projects/<slug>.mdx
 *   About page     → content/about.mdx
 *   Site settings  → content/settings/site.json
 *   Categories     → content/settings/categories.json
 *   Homepage       → content/settings/home.json (section titles + order)
 *
 * Every field here mirrors src/lib/content/schema.ts — keep them in sync when
 * adding a field. Uploaded media lands in public/media/<slug>/.
 *
 * Storage: "local" (writes files on your computer) in development. For editing
 * on the live site, set up Keystatic's GitHub mode (see CLAUDE.md → CMS); it
 * activates when NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG is set in production.
 */
import { collection, config, fields, singleton } from "@keystatic/core";
import { block, wrapper } from "@keystatic/core/content-components";
import categoryData from "./content/settings/categories.json";
import homeData from "./content/settings/home.json";
import { TECH } from "./src/config/taxonomy";
import { STATUSES, TIERS } from "./src/lib/content/schema";

const REPO = { owner: "MatinEsmaeili00", name: "matin.cc" } as const;

const useGitHub =
  process.env.NODE_ENV !== "development" && Boolean(process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG);

const SLUG_PATTERN = { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Lowercase letters, numbers and dashes only" };

const media = { directory: "public/media", publicPath: "/media/" } as const;

const STATUS_LABELS: Record<(typeof STATUSES)[number], string> = {
  shipped: "Shipped / finished",
  active: "In development",
  prototype: "Prototype",
  archived: "Archived",
};
const TIER_LABELS: Record<(typeof TIERS)[number], string> = {
  featured: "Featured — big row on the homepage",
  project: "Project — card on the homepage",
  archive: "Archive — compact list",
};

/** Components available inside the case-study editor (same names the site renders). */
const components = {
  Video: block({
    label: "YouTube video",
    description: "Click-to-play YouTube player.",
    schema: {
      id: fields.text({ label: "YouTube URL or video id", validation: { isRequired: true } }),
      caption: fields.text({ label: "Caption" }),
    },
  }),
  Clip: block({
    label: "Video loop",
    description: "Short muted loop from public/media (plays when visible).",
    schema: {
      src: fields.text({ label: "File path", description: "e.g. /media/my-project/clip.mp4", validation: { isRequired: true } }),
      caption: fields.text({ label: "Caption" }),
      alt: fields.text({ label: "Description for screen readers" }),
    },
  }),
  Figure: block({
    label: "Image with caption",
    schema: {
      src: fields.text({ label: "File path", description: "e.g. /media/my-project/shot.jpg", validation: { isRequired: true } }),
      alt: fields.text({ label: "Description for screen readers", validation: { isRequired: true } }),
      caption: fields.text({ label: "Caption" }),
    },
  }),
  GitHubCode: block({
    label: "Code from GitHub",
    description: "A live excerpt from the project's repository.",
    schema: {
      path: fields.text({ label: "File path in the repo", validation: { isRequired: true } }),
      lines: fields.text({ label: "Lines", description: 'e.g. "48-106" (blank = whole file)' }),
      highlight: fields.text({ label: "Highlight lines", description: 'e.g. "50,60-64"' }),
      repo: fields.text({ label: "Other repository", description: "Only if not the project's own repo: owner/name" }),
      title: fields.text({ label: "Title override" }),
      lang: fields.text({ label: "Language override", description: "e.g. hlsl, cpp, csharp" }),
    },
  }),
  Callout: wrapper({
    label: "Callout",
    schema: { title: fields.text({ label: "Title" }) },
  }),
  Columns: wrapper({
    label: "Two columns",
    schema: {},
  }),
  Metrics: block({
    label: "Numbers",
    schema: {
      items: fields.array(
        fields.object({ value: fields.text({ label: "Value" }), label: fields.text({ label: "Label" }) }),
        { label: "Items", itemLabel: (p) => `${p.fields.value.value} — ${p.fields.label.value}` },
      ),
    },
  }),
  Embed: block({
    label: "Interactive embed",
    description: "Click-to-load iframe (3D viewers etc.).",
    schema: {
      src: fields.url({ label: "URL", validation: { isRequired: true } }),
      title: fields.text({ label: "Title", validation: { isRequired: true } }),
      caption: fields.text({ label: "Caption" }),
    },
  }),
};

const body = (label: string) =>
  fields.mdx({
    label,
    components,
    options: { image: media },
  });

export default config({
  storage: useGitHub ? { kind: "github", repo: REPO } : { kind: "local" },

  ui: {
    brand: { name: "matin.cc" },
    navigation: {
      Content: ["projects", "about"],
      Settings: ["site", "home", "categories"],
    },
  },

  collections: {
    projects: collection({
      label: "Projects",
      path: "content/projects/*",
      slugField: "title",
      format: { contentField: "body" },
      entryLayout: "content",
      columns: ["title", "year", "tier"],
      schema: {
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
          slug: {
            label: "URL",
            description: "Becomes matin.cc/work/<url>. Changing it breaks old links — add the old URL to Aliases.",
            validation: { pattern: SLUG_PATTERN },
          },
        }),
        summary: fields.text({
          label: "One-line summary",
          description: "80–160 characters. Shown on cards and in Google results.",
          multiline: true,
          validation: { isRequired: true, length: { min: 10, max: 200 } },
        }),
        year: fields.integer({ label: "Year", validation: { isRequired: true, min: 2000, max: 2100 } }),
        yearEnd: fields.text({ label: "End year", description: 'A later year, or "present" if ongoing. Blank for a single year.' }),
        status: fields.select({
          label: "Status",
          options: STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] })),
          defaultValue: "shipped",
        }),
        tier: fields.select({
          label: "Prominence",
          options: TIERS.map((value) => ({ value, label: TIER_LABELS[value] })),
          defaultValue: "project",
        }),
        priority: fields.integer({ label: "Priority", description: "Higher shows first within its prominence group.", defaultValue: 0 }),
        categories: fields.multiselect({
          label: "Categories",
          description: "Edit the list under Settings → Categories.",
          options: categoryData.categories.map((c) => ({ value: c.id, label: c.label })),
        }),
        homeSection: fields.select({
          label: "Homepage section",
          description: "Where this appears on the homepage. Edit sections under Settings → Homepage.",
          options: [
            { value: "", label: "— Not on the homepage (only in Work) —" },
            ...homeData.sections.map((s) => ({ value: s.id, label: s.title })),
          ],
          defaultValue: "",
        }),
        tech: fields.multiselect({
          label: "Technologies",
          options: Object.entries(TECH).map(([value, t]) => ({ value, label: t.label })),
        }),
        role: fields.text({ label: "Your role" }),
        teamSize: fields.integer({ label: "Team size", description: "1 = solo" }),
        context: fields.text({ label: "Context", description: "e.g. LSU XR Studio, Chillennium 2024 game jam" }),
        github: fields.text({ label: "GitHub repository", description: "owner/repo or a github.com URL" }),
        youtube: fields.text({ label: "Main YouTube video", description: "URL or id — becomes the big player at the top" }),
        videos: fields.array(
          fields.object({
            id: fields.text({ label: "YouTube URL or id", validation: { isRequired: true } }),
            title: fields.text({ label: "Title override" }),
          }),
          { label: "More videos", itemLabel: (p) => p.fields.title.value || p.fields.id.value },
        ),
        links: fields.object(
          {
            steam: fields.text({ label: "Steam" }),
            itch: fields.text({ label: "itch.io" }),
            demo: fields.text({ label: "Live demo" }),
            website: fields.text({ label: "Website" }),
            docs: fields.text({ label: "Documentation" }),
          },
          { label: "Links" },
        ),
        cover: fields.image({ label: "Cover image", description: "Card + social image. Optional if there's a preview or video.", ...media }),
        preview: fields.file({ label: "Preview loop (.mp4)", description: "Short muted clip for cards — `npm run media` makes optimized ones.", ...media }),
        gallery: fields.array(
          fields.object({
            src: fields.text({ label: "File path", description: "e.g. /media/my-project/shot.jpg (image or .mp4)", validation: { isRequired: true } }),
            alt: fields.text({ label: "Description for screen readers", validation: { isRequired: true } }),
            caption: fields.text({ label: "Caption" }),
          }),
          { label: "Gallery", itemLabel: (p) => p.fields.caption.value || p.fields.src.value },
        ),
        items: fields.array(
          fields.object({
            title: fields.text({ label: "Title", validation: { isRequired: true } }),
            summary: fields.text({ label: "One line", multiline: true }),
            youtube: fields.text({ label: "YouTube URL or id", description: "Optional — plays when clicked on the project page" }),
            media: fields.text({
              label: "Loop or image path",
              description: "e.g. /media/my-project/clip.mp4 (npm run media can make one from a YouTube link)",
            }),
            tech: fields.multiselect({
              label: "Technologies",
              options: Object.entries(TECH).map(([value, t]) => ({ value, label: t.label })),
            }),
          }),
          {
            label: "Pieces",
            description: "For collections (a shader set, studio productions…): each piece gets its own card on the homepage.",
            itemLabel: (p) => p.fields.title.value,
          },
        ),
        highlights: fields.array(fields.text({ label: "Highlight" }), {
          label: "Highlights",
          description: "2–5 one-line \"what I built\" bullets.",
          itemLabel: (p) => p.value,
        }),
        metrics: fields.array(
          fields.object({ value: fields.text({ label: "Value" }), label: fields.text({ label: "What it measures" }) }),
          { label: "Results in numbers", itemLabel: (p) => `${p.fields.value.value} — ${p.fields.label.value}` },
        ),
        aliases: fields.array(fields.text({ label: "Old URL", description: "e.g. /old-page" }), {
          label: "Aliases (old URLs that redirect here)",
          itemLabel: (p) => p.value,
        }),
        draft: fields.checkbox({ label: "Draft", description: "Hidden from the live site." }),
        body: body("Case study"),
      },
    }),
  },

  singletons: {
    about: singleton({
      label: "About page",
      path: "content/about",
      format: { contentField: "body" },
      entryLayout: "content",
      schema: { body: body("About") },
    }),

    site: singleton({
      label: "Site settings",
      path: "content/settings/site",
      format: { data: "json" },
      schema: {
        name: fields.text({ label: "Name", validation: { isRequired: true } }),
        shortName: fields.text({ label: "First name" }),
        url: fields.text({ label: "Site URL", validation: { isRequired: true } }),
        roles: fields.array(fields.text({ label: "Role" }), { label: "Roles (under your name)", itemLabel: (p) => p.value }),
        tagline: fields.text({ label: "Intro sentence", description: "Plain language — recruiters read this first.", multiline: true }),
        bio: fields.text({ label: "Short bio (homepage About strip)", multiline: true }),
        description: fields.text({ label: "Search-engine description", multiline: true }),
        openTo: fields.text({ label: "Open to…", description: "e.g. Open to graphics and technical art roles." }),
        location: fields.text({ label: "Location", description: "Optional — shown under your roles." }),
        email: fields.text({ label: "Email", validation: { isRequired: true } }),
        resume: fields.file({ label: "Résumé (PDF)", directory: "public", publicPath: "/" }),
        photo: fields.image({ label: "Portrait photo", description: "Optional — square works best.", directory: "public/media", publicPath: "/media/" }),
        showreelYoutube: fields.text({ label: "Showreel YouTube URL or id", description: "Blank hides the Play reel button." }),
        showreelTitle: fields.text({ label: "Showreel title" }),
        githubUsername: fields.text({ label: "GitHub username", validation: { isRequired: true } }),
        youtubeHandle: fields.text({ label: "YouTube handle", description: "e.g. @MatinEsmaeili_00" }),
        youtubeChannelId: fields.text({ label: "YouTube channel id", description: "Starts with UC… (used by audit:sources)" }),
        social: fields.array(
          fields.object({ label: fields.text({ label: "Label" }), href: fields.text({ label: "URL" }) }),
          { label: "Links (footer, About page)", itemLabel: (p) => p.fields.label.value },
        ),
      },
    }),

    home: singleton({
      label: "Homepage",
      path: "content/settings/home",
      format: { data: "json" },
      schema: {
        sections: fields.array(
          fields.object({
            id: fields.text({
              label: "Id",
              description: "Used in links (/#id) and by each project's Homepage section. Don't rename ids projects use.",
              validation: { isRequired: true, pattern: SLUG_PATTERN },
            }),
            title: fields.text({ label: "Title", validation: { isRequired: true } }),
            eyebrow: fields.text({ label: "Small label above the title", description: "e.g. Currently cooking" }),
            blurb: fields.text({ label: "One-line description", multiline: true }),
          }),
          { label: "Sections (in display order)", itemLabel: (p) => p.fields.title.value },
        ),
      },
    }),

    categories: singleton({
      label: "Categories",
      path: "content/settings/categories",
      format: { data: "json" },
      schema: {
        categories: fields.array(
          fields.object({
            id: fields.text({
              label: "Id",
              description: "Lowercase, used in URLs (/work?category=id). Don't rename ids projects use.",
              validation: { isRequired: true, pattern: SLUG_PATTERN },
            }),
            label: fields.text({ label: "Name", validation: { isRequired: true } }),
            blurb: fields.text({ label: "One-line description" }),
          }),
          { label: "Categories (in display order)", itemLabel: (p) => p.fields.label.value },
        ),
      },
    }),
  },
});
