@AGENTS.md

# matin.cc — portfolio of Matin Esmaeili

Graphics / rendering engineer, technical artist, real-time simulation developer.
Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Keystatic (CMS).
Repo: github.com/MatinEsmaeili00/matin.cc (private). Domain: https://matin.cc (host not chosen yet — see Deployment).

The site is **data-driven**: every project is one MDX file. Pages, cards, filters, sitemap, OG images,
redirects and structured data are all generated from those files. Never hand-build a page for a project.
Matin edits content himself through the CMS; keep everything the CMS touches editable there.

## Sources of truth

| Thing | Canonical source | Edited in |
|---|---|---|
| Case studies: role, contribution, technical writing | `content/projects/<slug>.mdx` | CMS → Projects, or by hand |
| About page prose | `content/about.mdx` | CMS → About page |
| Name, roles, intro, links, email, résumé, photo, showreel | `content/settings/site.json` (typed by `src/config/site.ts`) | CMS → Site settings |
| Categories (disciplines), incl. "In the Lab" | `content/settings/categories.json` (read by `src/config/taxonomy.ts`) | CMS → Categories |
| Technology vocabulary (`tech` ids) | `TECH` in `src/config/taxonomy.ts` | code only |
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
- Verified behaviour: saving only rewrites files the entry references, so other media in
  `public/media/<slug>/` (webm/poster siblings, clips) is never deleted.

## Adding a project ("Add my X project — here's the repo and video")

1. Scaffold it (non-interactive form — always use `--yes` so it never prompts):
   ```bash
   npm run new-project -- --title "Snow Deformation" --github MatinEsmaeili00/SnowDeformation \
     --youtube https://youtu.be/VIDEOID --categories rendering,tools --year 2026 --tier project --yes
   ```
   It pre-fills summary/year/tech from GitHub and the title from YouTube. Read the generated file.
2. Read the repo README (`gh api repos/OWNER/REPO/readme -H "Accept: application/vnd.github.raw"`) and the
   key source files, then write the case study in the MDX body (structure below). Write in Matin's voice,
   first person, concrete, no hype. **Never invent facts, numbers or contributions** — if something
   (role, team size, year) isn't known, leave the field out and tell Matin.
3. Pick `tech` ids only from `src/config/taxonomy.ts`; categories only from `categories.json`
   (`lab` = "In the Lab" — experiments and work in progress).
4. Media: `npm run media -- <slug> <file> --name preview` for the card/hero loop (5–12 s),
   `--name cover` for a still, plain file args for gallery items. Writes to `public/media/<slug>/`.
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
content/settings/*.json     site settings + categories (CMS-editable)
content/templates/          annotated project template
content/audit-ignore.txt    repos/videos deliberately not on the site
keystatic.config.ts         CMS definition
src/app/(site)/             public pages: / · /work · /work/[slug] · /about (header/footer layout)
src/app/keystatic/, api/    CMS UI + API (gated by lib/cms.ts)
src/app/admin/              local dashboard: check / publish / rebuild
src/config/                 site.ts · taxonomy.ts · redirects.ts
src/lib/content/            schema · load (plain Node, shared with scripts) · validate · projects (server) · mdx
src/lib/github.ts, youtube.ts, highlight.ts, seo.tsx, og.tsx, cms.ts
src/components/             layout/ · home/ · project/ · media/ · code/ · mdx/ · ui/
scripts/                    validate · new-project · media · audit-sources · patch-keystatic
public/media/<slug>/        optimized media per project
```

- **Public pages are statically generated.** GitHub and YouTube are fetched once per build. No API
  calls on page load, no secrets reach the client.
- **Rebuilds are manual** (Matin's choice — no schedule): Publish in /admin (if the host deploys from
  GitHub), "Rebuild live site" in /admin, or GitHub → Actions → "Rebuild site" (`.github/workflows/rebuild.yml`,
  needs the `DEPLOY_HOOK_URL` repo secret).
- Integrations never fail the build: GitHub/YouTube helpers return null and components fall back.
  Content errors *do* fail the build — `prebuild` runs `validate`.
- `src/lib/content/load.ts` and `validate.ts` must stay free of Next/React imports (the CLI scripts use them).
- MCP (e.g. GitHub MCP) is fine for *maintaining* the repo, but the production site must only use
  the plain HTTP integrations above.

## Component conventions

- **Server components by default.** Client components only where interaction needs it:
  `youtube-player`, `preview-video`, `embed-facade`, `copy-button`, `mobile-nav`, `theme-toggle`,
  `project-explorer`, `category-tabs`, `showreel`, `admin-forms`. Pass server-rendered nodes into
  client components as props (explorer/tabs filter server-rendered cards).
- Never load a YouTube iframe without a click. Grid/card motion = local muted MP4 previews only.
- No new UI dependencies without a reason; animation is CSS (scroll-driven `.reveal`, transform-only
  `animate-rise` above the fold) and the native View Transitions API. Respect `prefers-reduced-motion`.
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
npm run media -- <slug> <files> [--name preview|cover] [--start s --duration s]
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
CI (`.github/workflows/ci.yml`) runs validate, typecheck, lint and build on push/PR.

## Migration notes

The site replaced a WordPress install. `docs/MIGRATION.md` records what moved where, what was merged,
and open questions for Matin. Old URLs redirect via project `aliases` and `src/config/redirects.ts`.
