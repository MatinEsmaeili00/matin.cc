# matin.cc

Portfolio of **Matin Esmaeili** — graphics / rendering engineer, technical artist and real-time
simulation developer.

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · MDX · deployed on Vercel.

Every project is a single file in `content/projects/`. The site generates the case-study page,
cards, filters, sitemap, social images and redirects from it, and pulls live repository data from
GitHub and video from YouTube — so the portfolio, GitHub and YouTube never have to be kept in sync
by hand.

## Quick start

```bash
npm install
npm run dev            # http://localhost:3000
```

Optional: copy `.env.example` to `.env.local` and add a `GITHUB_TOKEN` (or just have the `gh` CLI
logged in for the scripts).

## Adding work

```bash
# 1. scaffold from the repo + video (interactive if you leave flags out)
npm run new-project -- --github MatinEsmaeili00/MyRepo --youtube https://youtu.be/VIDEOID

# 2. turn a screen capture into a card/hero loop (+ webm + poster)
npm run media -- my-repo ~/Captures/demo.mp4 --name preview --start 2 --duration 8

# 3. write the case study in content/projects/my-repo.mdx, then
npm run validate
git push               # Vercel builds and deploys
```

`npm run audit:sources` lists GitHub repos and YouTube uploads that aren't on the site yet.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js (build runs `validate` first) |
| `npm run validate` | Schema, media files, links and component checks for all content |
| `npm run new-project` | Scaffold a project file, pre-filled from GitHub/YouTube |
| `npm run media` | ffmpeg pipeline: video/GIF → mp4 + webm + poster, images → jpg |
| `npm run audit:sources` | What's on GitHub/YouTube but not on the portfolio |
| `npm run check` | validate + typecheck + lint |

## Docs

- **[CLAUDE.md](CLAUDE.md)** — architecture, content format, MDX components, conventions,
  deployment. Written for Claude Code and humans alike.
- **[docs/MIGRATION.md](docs/MIGRATION.md)** — what moved over from the old WordPress site, and
  open questions.
