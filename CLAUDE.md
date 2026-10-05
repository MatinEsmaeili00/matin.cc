@AGENTS.md

# matin.cc — portfolio of Matin Esmaeili

Graphics / rendering engineer, technical artist, real-time simulation developer.
Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Keystatic (CMS).
Repo: github.com/MatinEsmaeili00/matin.cc (public). Domain: https://matin.cc (host not chosen yet — see Deployment).

The site is **data-driven**: every project is one MDX file. Pages, cards, filters, sitemap, OG images,
redirects and structured data are all generated from those files. Never hand-build a page for a project.
Matin edits content himself through the CMS; keep everything the CMS touches editable there.

## Status & continuing on another computer (read this first)

**Where things stand (last updated Oct 2026):** the site is complete and lives only on GitHub — it is
**not deployed yet** (Matin has his own host and will deploy later; the old WordPress site is still live
at matin.cc). 30 projects are migrated. Recent work: light HR-friendly theme with dark toggle, Keystatic
CMS + /admin, homepage organised into the old site's sections plus "In the Lab", hover/scroll video
previews everywhere, Mermaid-style architecture diagrams.

**Set up a new machine:**

```bash
git clone https://github.com/MatinEsmaeili00/matin.cc.git && cd matin.cc
npm install                 # also patches Keystatic (postinstall) and fetches ffmpeg
gh auth login               # GitHub CLI — scripts use its token; add `--scopes workflow` to push Actions
npm run dev                 # http://localhost:3000 · CMS /keystatic · dashboard /admin
```

Optional `.env.local` (see `.env.example`): `GITHUB_TOKEN`, `YOUTUBE_API_KEY`, `DEPLOY_HOOK_URL`.
yt-dlp downloads itself into `.cache/` the first time `npm run media` gets a YouTube link.

**Open items / next steps:**

1. GitHub Actions are parked in `docs/github-workflows/` (pushing `.github/` needs the `workflow`
   token scope) — see the README there to activate them.
2. Deployment: when Matin names his host, check it runs Node.js (needed for next/image, redirects and
   Keystatic GitHub mode); otherwise set up a static export (see Deployment below).
3. Content Matin still owes (details in `docs/MIGRATION.md` §5): videos for Snow/Sand/GPULab/Building
   Visualization/Robot Voice Control, résumé PDF + photo (CMS → Site settings), About page details,
   unconfirmed roles (Robots & Humans, Sud Enforcer, Jewel Seeker), team-size conflicts.
4. Matin's preferences: light, recruiter-friendly design (dark only via the toggle); **no scheduled
   automation** — rebuilds/publishing happen only when he presses a button; he edits content himself.

## Sources of truth

| Thing | Canonical source | Edited in |
|---|---|---|
| Case studies: role, contribution, technical writing | `content/projects/<slug>.mdx` | CMS → Projects, or by hand |
| About page prose | `content/about.mdx` | CMS → About page |
| Name, roles, intro, links, email, résumé, photo, showreel | `content/settings/site.json` (typed by `src/config/site.ts`) | CMS → Site settings |
| Categories (disciplines, used by /work filters) | `content/settings/categories.json` (read by `src/config/taxonomy.ts`) | CMS → Categories |
| Homepage sections (title, order, blurb) | `content/settings/home.json` (read by `src/config/home.ts`) | CMS → Homepage |
| Technology vocabulary (`tech` ids + tag colours) | `TECH` in `src/config/taxonomy.ts` | code only |
| Source code, repo description, stars, activity | GitHub | — fetched at build time |
| Demo / long-form video | YouTube | — click-to-load players, titles via oEmbed |

Connect sources, don't duplicate them: link a repo with `github:` rather than pasting its README; pull
code with `<GitHubCode>` rather than copying it when the repo is public.

## CMS (Keystatic) and admin

- `npm run dev`, then **http://localhost:3000/admin** — dashboard: Edit content (→ `/keystatic`),
  content check, **Publish** (validates, commits `content/` + `public/`, pushes), **Rebuild live site**
  (POSTs `DEPLOY_HOOK_URL`). Server actions in `src/app/admin/actions.ts`.
- `keystatic.config.ts` defines the editor. **Its fields must mirror `src/lib/content/schema.ts`** —
  when you add/rename a frontmatter field, change both. Category/tech dropdowns are generated from
  `categories.json` and `TECH`.
- Security: `src/lib/cms.ts → cmsMode()` gates `/keystatic`, `/api/keystatic` and `/admin`.
  Keystatic's local mode has no auth, so these routes 404 outside development unless Keystatic's
  GitHub mode is fully configured (`NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, `KEYSTATIC_GITHUB_CLIENT_ID`,
  `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`). GitHub mode needs a Node.js host.
- `scripts/patch-keystatic.mjs` (postinstall) fixes a Keystatic bug that truncates code-fence meta
  (`title="…" {3-5}`) on save. If it warns after a Keystatic upgrade, re-test a save of a project with
  titled/highlighted code blocks before shipping.
- The CMS rewrites frontmatter in its own YAML style (block lists, empty defaults like `videos: []`) —
  that's expected; `load.ts → clean()` treats `""`/`null` as unset.
- Don't use MDX comments (`{/* */}`) in content files — the CMS editor can't parse them.
- Verified behaviour: saving only rewrites files the entry's own file fields reference, so other media
  in `public/media/<slug>/` (webm/poster siblings, clips, piece media) is left alone.
- **File-field naming rule:** Keystatic names uploads after the field and *renames* anything else on
  save (deleting the original — this once broke a piece that shared the file). So `preview` must be
  `…/preview.mp4` and `cover` must be `…/cover.<ext>`; `npm run validate` enforces it. Pieces and
  gallery use plain path fields, so any name is fine there — never point `preview` at a piece's file.

## Homepage, pieces, video previews, diagrams

- **Homepage sections** mirror the old site: Developed Games & Tools · Virtual Production · In the Lab
  ("Currently cooking" — work in progress, placed mid-page) · Math · Shaders. Each project picks ONE
  with `homeSection:` (omit = only on /work). Inside a section, `tier: featured` projects get
  full-width rows; everything else is a card; sections fold after 9 cards ("Show more"). A sticky
  section bar (`components/home/section-nav.tsx`) highlights the section in view. Each section has a
  tiny animated icon in the bar and its header (`components/home/section-icon.tsx`, keyed by section
  id: cog · viewfinder with blinking REC · pulsing live dot · travelling sine · material ball) — a new
  section id gets no icon until it's added there.
- **Opening a project morphs into it** (React `<ViewTransition>` + the View Transitions API; browsers
  without it just navigate). What moves depends on what was clicked — each link carries transition
  types, each `<Morph on={[…]}>` lists the ones it takes part in (`components/ui/morph.tsx`):
  - **the name** (`{...openByTitle}`, card text / featured title / archive row / "Case study") → the
    page opens at the top and the name glides into the `<h1>`;
  - **the media** (`{...openByMedia}`, href `videoHref(url)`) → the page opens at its video section
    (`#video`) and the card's media zooms into the hero; a preview loop there starts playing on
    arrival (`use-preview-activation.ts`), so the clip keeps moving through the zoom;
  - **a tech tag** (`{...browse}`) → cards fly to their places in the filtered Work list;
  - "Next project" uses its own types (`openNextByTitle` / `openNextByMedia`) so a card for the same
    project on the previous page never pairs with it.
  Cards therefore have two links: the media (pointer-only, `tabIndex={-1} aria-hidden`) and the name.
  **A morph name must be unique on a page** — a duplicate cancels the whole transition (that's why
  "Now building" titles aren't named). React skips morphs it measures off-screen, so
  `components/layout/scroll-first.tsx` scrolls the new page into place first (top or `#hash`) for
  links marked `data-scroll-first`. The header is its own layer that holds still on top. Timing and
  easing: "Page transitions" in globals.css (media 0.8 s, name 0.7 s). Test morphs on a production
  build (`next start`) — dev doesn't prefetch.
- **Live dot** (`components/ui/live-dot.tsx`) = work in progress: the In the Lab section,
  "Now building" in the hero, and every `status: active` project ("In development", via
  `components/project/status.tsx`).
- **Pieces** (`items:` in frontmatter) model collections — the studio productions, the shader set,
  the vector-math demos. Each piece becomes its own homepage card linking to
  `/work/<slug>#<piece-id>`, and the project page shows a "Pieces" grid (YouTube pieces open the full
  player on click). Fields: `title`, `summary`, `youtube`, `media` (loop .mp4 or image), `tech`.
- **Video previews play on hover (mouse) or when ~60% on screen (touch)** — never with reduced
  motion or Save-Data. One hook decides: `components/media/use-preview-activation.ts`. Local muted
  loops (`preview:` / piece `media`) are preferred; media that only exists on YouTube falls back to a
  muted chrome-less embed (`youtube-hover-preview.tsx`), one at a time. Make a light loop from Matin's
  own YouTube upload with:
  `npm run media -- <slug> https://youtu.be/<id> --name preview --start 6 --duration 10 --crf 28 --no-webm`
  (use the "Short" cut of a video when one exists — it's the best material; check the poster after).
- **Architecture diagrams:** write a ```` ```mermaid title="…" ```` fence with Mermaid flowchart syntax
  (copy straight from a README). `src/lib/diagram.ts` parses it and lays it out with dagre at build
  time; `components/diagram/diagram.tsx` renders themed SVG with animated "data flow" edges, picking
  LR or TB per screen size. Supported: flowchart/graph TB/TD/BT/LR/RL, shapes `[] () ([]) [()] {}
  (()) [[]]`, edges `--> --- -.-> ==>` with `-- label -->` / `-->|label|`, chains, `&`, nested
  subgraphs, `<br/>` in labels. Unparseable input falls back to a code block.

## Adding a project ("Add my X project — here's the repo and video")

1. Scaffold it (non-interactive form — always use `--yes` so it never prompts):
   ```bash
   npm run new-project -- --title "Snow Deformation" --github MatinEsmaeili00/SnowDeformation \
     --youtube https://youtu.be/VIDEOID --categories rendering,tools --section lab --year 2026 --tier project --yes
   ```
   It pre-fills summary/year/tech from GitHub and the title from YouTube. Read the generated file.
2. Read the repo README (`gh api repos/OWNER/REPO/readme -H "Accept: application/vnd.github.raw"`) and the
   key source files, then write the case study in the MDX body (structure below). Write in Matin's voice,
   first person, concrete, no hype. **Never invent facts, numbers or contributions** — if something
   (role, team size, year) isn't known, leave the field out and tell Matin.
3. Pick `tech` ids only from `src/config/taxonomy.ts`; categories only from `categories.json`
   (`lab` = "In the Lab" — experiments and work in progress). A new technology needs a line in
   `TECH` with a `color` (its brand colour if it has one; otherwise a hue distinct from the tags it
   usually sits next to) — check it reads in both themes.
4. Media: `npm run media -- <slug> <file-or-youtube-url> --name preview` for the card/hero loop
   (5–12 s), `--name cover` for a still, plain file args for gallery items. Writes to
   `public/media/<slug>/`. Every project with a video should get a local `preview` loop.
   Pick `homeSection` (work in progress → `lab`).
5. `npm run validate` — fix every error. Then `npm run build` if you changed components.
6. Tier: `featured` only for Matin's strongest current work (homepage film-strip rows — keep it to ~6),
   `project` for solid work (homepage "Highlights" tab), `archive` for older work.

## Project file format

`content/projects/<slug>.mdx` — filename is the URL (`/work/<slug>`), kebab-case. The annotated
template is `content/templates/project.mdx`. Schema: `src/lib/content/schema.ts` (strict).

Required: `title`, `summary` (one line, ≤200 chars), `year`, `categories`.
Common: `yearEnd` (a year or `present`), `status` (shipped | active | prototype | archived),
`tier`, `priority` (higher first), `tech`, `role`, `teamSize`, `context`, `github`, `youtube`,
`videos`, `links` (steam, itch, demo, website, docs), `cover`, `preview`, `gallery`, `highlights`,
`metrics`, `aliases` (old URLs → 308), `draft`.

Media fallback chain for cards/OG: `cover` → `preview` poster (`.jpg` sibling) → YouTube thumbnail →
first gallery image → procedural ridgeline cover (generated from the slug).

### Case-study body

Use `##` headings — each becomes a numbered section and a table-of-contents entry. Suggested order,
omit what doesn't apply: Overview · The problem · What I built / Architecture · Technical breakdown ·
Challenges · Results. Prefer specific headings ("Slumping at the angle of repose") over generic ones.

MDX components (defined in `src/components/mdx/mdx-components.tsx`, mirrored in `keystatic.config.ts`):

```mdx
<Video id="dQw4w9WgXcQ" caption="…" />                       YouTube, click-to-play facade
<Clip src="/media/slug/clip.mp4" caption="…" />               muted loop, plays when visible
<Figure src="/media/slug/a.jpg" alt="…" caption="…" />
<GitHubCode path="Shaders/X.usf" lines="48-106" highlight="77-94" />   live excerpt; repo defaults to `github:`
<GitHubCode repo="owner/other" path="…" lines="…" />          excerpt from another repo
<Callout title="Status">…</Callout>
<Columns>…two children side by side on desktop…</Columns>
<Metrics items={[{ "value": "0.4 s", "label": "latency" }]} />
<Embed src="https://…" title="…" />                           click-to-load iframe (splat viewers, etc.)
```

Fenced code: ```` ```hlsl title="File.usf" {3,5-7} start=48 ```` (also `nolines`, `lines`,
`source="url"`). Languages: cpp, csharp, hlsl (also usf/ush), glsl, shaderlab, gdscript, python, text….
Keep excerpts short and explain them; never dump whole files.

## Architecture

```
content/projects/*.mdx      project files (the source of truth)
content/about.mdx           About page prose
content/settings/*.json     site settings · homepage sections · categories (CMS-editable)
content/templates/          annotated project template
content/audit-ignore.txt    repos/videos deliberately not on the site
keystatic.config.ts         CMS definition
src/app/(site)/             public pages: / · /work · /work/[slug] · /about (header/footer layout)
src/app/keystatic/, api/    CMS UI + API (gated by lib/cms.ts)
src/app/admin/              local dashboard: check / publish / rebuild
src/config/                 site.ts · taxonomy.ts · redirects.ts
src/lib/content/            schema · load (plain Node, shared with scripts) · validate · projects (server) · mdx
src/lib/github.ts, youtube.ts, highlight.ts, seo.tsx, og.tsx, cms.ts, diagram.ts
src/components/             layout/ · home/ · project/ · media/ · code/ · diagram/ · mdx/ · ui/
scripts/                    validate · new-project · media (+ lib/ffmpeg, lib/yt-dlp) · audit-sources · patch-keystatic
public/media/<slug>/        optimized media per project
```

- **Public pages are statically generated.** GitHub and YouTube are fetched once per build. No API
  calls on page load, no secrets reach the client.
- **Rebuilds are manual** (Matin's choice — no schedule): Publish in /admin (if the host deploys from
  GitHub), "Rebuild live site" in /admin, or GitHub → Actions → "Rebuild site" (`.github/workflows/rebuild.yml`,
  needs the `DEPLOY_HOOK_URL` repo secret; currently parked in `docs/github-workflows/`).
- Integrations never fail the build: GitHub/YouTube helpers return null and components fall back.
  Content errors *do* fail the build — `prebuild` runs `validate`.
- `src/lib/content/load.ts` and `validate.ts` must stay free of Next/React imports (the CLI scripts use them).
- MCP (e.g. GitHub MCP) is fine for *maintaining* the repo, but the production site must only use
  the plain HTTP integrations above.

## Component conventions

- **Server components by default.** Client components only where interaction needs it:
  `youtube-player`, `preview-video`, `youtube-hover-preview`, `embed-facade`, `copy-button`,
  `mobile-nav`, `theme-toggle`, `project-explorer`, `section-nav`, `expandable-grid`, `showreel`,
  `scroll-first`, `admin-forms`. Pass server-rendered nodes into
  client components as props (explorer/tabs filter server-rendered cards).
- `/work` reads its filters from the URL with `useSearchParams` inside `<Suspense>` (fallback = the
  unfiltered explorer, so the static HTML keeps the full list). Navigating to a new query
  (`/work?tech=unreal`) remounts it already filtered; filter chips change state in place and animate
  with `document.startViewTransition` (cards get names only during that, via `.vt-filter`).
- Card/grid motion = local muted MP4 loops; a muted YouTube embed only as a hover/on-screen fallback
  (one at a time). Full YouTube players (with sound) load only on click.
- No new UI dependencies without a reason; animation is CSS (scroll-driven `.reveal`, transform-only
  `animate-rise` above the fold) and the native View Transitions API. Respect `prefers-reduced-motion`.
  Small looping marks (section icons, theme-icon pop) live in the "Micro-animations" block of
  `globals.css`; arrow/download icons carry `data-nudge` and lean toward where their link goes on
  hover (override with e.g. `data-nudge="down"` on a rotated arrow).
- Read copy from `site` (`src/config/site.ts`); never hardcode name, email or URLs in components.
- `cn()` from `src/lib/utils.ts`; CTAs via `ButtonLink` (`src/components/ui/button.tsx`).

## Design rules

- **Light by default** (warm paper `#f6f4ef`) — the site is read by recruiters first. Dark theme via
  the header toggle (`<html data-theme="dark">`, stored in localStorage, applied before paint).
- Colours are tokens in `src/app/globals.css` (`ink` = page background, `fg` = text — valid in both
  themes). Use `.scope-dark` for areas that must stay dark (code blocks, overlays on video).
  Keep every text/background pair at WCAG AA.
- The work is the visual — media first, text secondary. Plain-language intro and clear CTAs
  (View work, Résumé, Get in touch) up top; technical depth inside case studies.
- Small radius on media and controls only (`rounded-lg` media, `rounded-md` buttons/chips), hairline
  borders, one accent used sparingly, no decorative gradients, no cards-inside-cards.
- **Tech tags are colour-coded** (Matin's request — recognisable at a glance): each technology has one
  colour everywhere (`TECH[id].color`; `dark` overrides it in the dark theme, e.g. Unreal turns
  white). Render tech with `TechTags` / `TechDot` (`components/project/tech-tags.tsx`), never as
  plain text or hand-picked colours. The `.tech-tag` CSS keeps text at AA in both themes.
- **Every tech tag is a link** to `/work?tech=<id>` (all projects using it). Links can't nest, so
  cards keep their tags *outside* the main card link, and archive rows use a stretched title link
  (`after:absolute after:inset-0`) with the tags above it (`relative z-10`).
- Type: Archivo (variable width — `semi-wide`/`wide` for display) + JetBrains Mono for metadata
  (`label` utility). Fluid sizes: `text-display`, `text-title`, `text-heading`, `text-lead`.
- Layout: `page gutter` on every section wrapper. Case-study prose: `.prose-case` in globals.css.

## Responsive rules

- Mobile-first; check 375px, 768px, 1280px and 1680px+.
- Grids: 1 column → `sm:grid-cols-2` → `xl:grid-cols-3`. Featured rows stack media-first on mobile.
- Tap targets ≥ 44px (`min-h-11`). No hover-only information — hover may only enhance.
- Horizontal scroll only inside code blocks, tables and chip rows — never the page.
- Images via `next/image` with a correct `sizes`; media frames have fixed aspect ratios (no CLS).

## Commands

```bash
npm run dev               # local site + CMS (/keystatic) + admin (/admin)
npm run validate          # check all content (also runs before every build)
npm run new-project -- …  # scaffold a project file (see above)
npm run media -- <slug> <files|youtube-urls> [--name preview|cover] [--start s --duration s]
npm run audit:sources     # GitHub repos / YouTube uploads not yet on the site
npm run check             # validate + typecheck + lint
npm run build             # production build (locally: GITHUB_TOKEN=$(gh auth token) npm run build)
```

## Deployment

Host not chosen yet (Matin will deploy to his own host). Requirements: Node.js 20.9+ to run
`next start` (needed for image optimization, redirects and — optionally — the CMS in GitHub mode).
A purely static host would need `output: "export"`, `images.unoptimized`, and redirects moved to the
host's config, and the CMS would stay local-only. Set `GITHUB_TOKEN` (and optionally `YOUTUBE_API_KEY`,
`DEPLOY_HOOK_URL`) in the host's environment — see `.env.example`. Never commit tokens.
CI (`ci.yml`: validate, typecheck, lint, build on push/PR) and the manual `rebuild.yml` are parked in
`docs/github-workflows/` until a token with the `workflow` scope moves them into `.github/workflows/`.

## Migration notes

The site replaced a WordPress install. `docs/MIGRATION.md` records what moved where, what was merged,
and open questions for Matin. Old URLs redirect via project `aliases` and `src/config/redirects.ts`.
