@AGENTS.md

# matin.cc — portfolio of Matin Esmaeili

Graphics / rendering engineer, technical artist, real-time simulation developer.
Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4, deployed on Vercel at https://matin.cc.

The site is **data-driven**: every project is one MDX file. Pages, cards, filters, sitemap, OG images,
redirects and structured data are all generated from those files. Never hand-build a page for a project.

## Sources of truth

| Thing | Canonical source | How the site uses it |
|---|---|---|
| Role, contribution, technical explanation, case-study writing | `content/projects/<slug>.mdx` | Rendered as the case study |
| Source code, repo description, stars, languages, activity | GitHub | Fetched at build time → Repository panel, `<GitHubCode>` excerpts |
| Demo / long-form video | YouTube | Click-to-load players, thumbnails, titles via oEmbed |
| Name, roles, links, email, résumé, showreel | `src/config/site.ts` | Header, footer, hero, About, JSON-LD |
| Disciplines + technology vocabulary | `src/config/taxonomy.ts` | Validation, filters, labels |

Connect sources, don't duplicate them: link a repo with `github:` rather than pasting its README; pull
code with `<GitHubCode>` rather than copying it when the repo is public.

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
3. Pick `tech` ids only from `src/config/taxonomy.ts`. If a technology is genuinely missing, add one line
   to `TECH` there (choose a `group`; set `primary: true` only for top-level filter chips).
4. Media: `npm run media -- <slug> <file> --name preview` for the card/hero loop (5–12 s),
   `--name cover` for a still, plain file args for gallery items. It writes to `public/media/<slug>/` and
   prints the frontmatter to paste.
5. `npm run validate` — fix every error. Then `npm run build` if you changed components.
6. Tier: `featured` only for Matin's strongest current work (homepage film-strip rows — keep it to ~6),
   `project` for solid work (homepage grid shows the top 9 by `priority`), `archive` for older work.

## Project file format

`content/projects/<slug>.mdx` — filename is the URL (`/work/<slug>`), kebab-case. Files starting with
`_` are ignored (`_template.mdx` is the annotated template). The schema is
`src/lib/content/schema.ts` (strict — unknown fields fail validation).

Required: `title`, `summary` (one line, ≤200 chars, used on cards + meta description), `year`, `categories`.
Common: `yearEnd` (`present` for ongoing), `status` (shipped | active | prototype | archived),
`tier`, `priority` (higher first), `tech`, `role`, `teamSize`, `context`, `github`, `youtube`,
`videos`, `links` (steam, itch, demo, website, docs), `cover`, `preview`, `gallery`, `highlights`,
`metrics`, `aliases` (old URLs → 301), `draft`.

Media fallback chain for cards/OG: `cover` → `preview` poster (`.jpg` sibling) → YouTube thumbnail →
first gallery image → procedural ridgeline cover (generated from the slug).

### Case-study body

Use `##` headings — each becomes a numbered section and a table-of-contents entry. Suggested order,
omit what doesn't apply: Overview · The problem · What I built / Architecture · Technical breakdown ·
Challenges · Results. Prefer specific headings ("Slumping at the angle of repose") over generic ones.

MDX components (all defined in `src/components/mdx/mdx-components.tsx`):

```mdx
<Video id="dQw4w9WgXcQ" caption="…" />                       YouTube, click-to-play facade
<Clip src="/media/slug/clip.mp4" caption="…" />               muted loop, plays when visible
<Figure src="/media/slug/a.jpg" alt="…" caption="…" />
<GitHubCode path="Shaders/X.usf" lines="48-106" highlight="77-94" />   live excerpt; repo defaults to `github:`
<GitHubCode repo="owner/other" path="…" lines="…" />          excerpt from another repo
<Callout title="Status">…</Callout>
<Columns>…two children side by side on desktop…</Columns>
<Metrics items={[{ value: "0.4 s", label: "latency" }]} />
<Embed src="https://…" title="…" />                           click-to-load iframe (splat viewers, etc.)
```

Fenced code: ```` ```hlsl title="File.usf" {3,5-7} start=48 ```` (also `nolines`, `lines`,
`source="url"`). Languages: cpp, csharp, hlsl (also usf/ush), glsl, shaderlab, gdscript, python, text….
Keep excerpts short and explain them; never dump whole files.

## Architecture

```
content/projects/*.mdx      project files (the source of truth)
content/about.mdx           About page prose
content/audit-ignore.txt    repos/videos deliberately not on the site
src/config/                 site.ts (identity/links) · taxonomy.ts · redirects.ts
src/lib/content/            schema.ts · load.ts (plain Node, shared with scripts) · projects.ts (server: media resolution) · mdx.tsx
src/lib/github.ts           repo metadata + raw files (server-only)
src/lib/youtube.ts          oEmbed titles, thumbnails, optional Data API (server-only)
src/lib/highlight.ts        Shiki, build-time highlighting (server-only)
src/lib/seo.tsx, og.tsx     JSON-LD and Open Graph image rendering
src/components/             layout/ · home/ · project/ · media/ · code/ · mdx/ · ui/
src/app/                    / · /work · /work/[slug] · /about · sitemap · robots · OG images
scripts/                    validate · new-project · media · audit-sources (run with tsx)
public/media/<slug>/        optimized media per project
```

- **Everything is statically generated.** GitHub and YouTube are fetched once per build (plain `fetch`
  with no cache options in a static route = fetched at build, never at request time). No API calls
  happen on page load, and no secrets reach the client. Freshness: every push rebuilds, plus a daily
  scheduled rebuild (`.github/workflows/scheduled-rebuild.yml` → Vercel deploy hook).
- Integrations never fail the build: GitHub/YouTube helpers return null and components fall back.
  Content errors *do* fail the build — `prebuild` runs `validate`.
- `src/lib/content/load.ts` must stay free of Next/React imports (the CLI scripts use it).
- MCP (e.g. GitHub MCP) is fine for *maintaining* the repo, but the production site must only use
  the plain HTTP integrations above.

## Component conventions

- **Server components by default.** Client components (`"use client"`) only where interaction needs
  it: `youtube-player`, `preview-video`, `embed-facade`, `copy-button`, `mobile-nav`,
  `project-explorer`, `showreel`. Pass server-rendered nodes into client components as props
  (the Work explorer filters server-rendered cards) rather than moving rendering client-side.
- Never load a YouTube iframe without a click. Grid/card motion = local muted MP4 previews only.
- No new UI dependencies without a reason; animation is CSS (scroll-driven `.reveal`, transform-only `animate-rise` above the fold)
  and the native View Transitions API (explorer filtering). Respect `prefers-reduced-motion`.
- Read copy from `src/config/site.ts`; never hardcode name, email or URLs in components.
- `cn()` from `src/lib/utils.ts` for conditional classes.

## Design rules

- Dark, cinematic, technical. The work is the visual — media first, text secondary.
- Square corners (no `rounded-*`), hairline borders (`border-line`), one accent (`text-accent`,
  used sparingly), no decorative gradients (a legibility scrim over video is the only exception),
  no cards-inside-cards.
- Type: Archivo (variable width — `semi-wide`/`wide` utilities for display) + JetBrains Mono for
  metadata (`label` utility). Fluid sizes: `text-display`, `text-title`, `text-heading`, `text-lead`.
- Layout: `page gutter` on every section wrapper (max width + the single horizontal gutter).
- Case-study prose styles live in `.prose-case` in `src/app/globals.css`.

## Responsive rules

- Design mobile-first; check 375px, 768px, 1280px and 1680px+.
- Grids: 1 column → `sm:grid-cols-2` → `xl:grid-cols-3`. Featured rows stack media-first on mobile.
- Tap targets ≥ 44px (`min-h-11`). No hover-only information — hover may only enhance.
- Horizontal scroll is allowed only inside code blocks, tables and filter-chip rows — never the page.
- Images always via `next/image` with a correct `sizes`; media frames have fixed aspect ratios (no CLS).

## Commands

```bash
npm run dev               # local dev server
npm run validate          # check all content (also runs before every build)
npm run new-project -- …  # scaffold a project file (see above)
npm run media -- <slug> <files> [--name preview|cover] [--start s --duration s]
npm run audit:sources     # GitHub repos / YouTube uploads not yet on the site
npm run check             # validate + typecheck + lint
npm run build             # production build (locally: GITHUB_TOKEN=$(gh auth token) npm run build)
```

## Deployment

Vercel Git integration: push to `main` → production deploy to matin.cc; pull requests → preview
deploys. CI (`.github/workflows/ci.yml`) runs validate, typecheck, lint and build. Environment
variables (all optional, server-only): `GITHUB_TOKEN`, `YOUTUBE_API_KEY` — see `.env.example`.
Never commit tokens.

## Migration notes

The site replaced a WordPress install. `docs/MIGRATION.md` records what moved where, what was merged,
and open questions for Matin. Old URLs redirect via project `aliases` and `src/config/redirects.ts`.
