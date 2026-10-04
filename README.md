# matin.cc

Portfolio of **Matin Esmaeili** — graphics / rendering engineer, technical artist and real-time
simulation developer.

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · MDX · Keystatic CMS.

Every project is a single file in `content/projects/`. The site builds the case-study page, the
homepage sections (Developed Games & Tools · Virtual Production · In the Lab · Math · Shaders),
filters, sitemap, social images and redirects from it, and pulls live data from
GitHub and video from YouTube — so the portfolio, GitHub and YouTube never have to be kept in sync
by hand.

## Continuing on another computer

Clone, `npm install`, `gh auth login`, `npm run dev` — the full checklist and current status are at
the top of [CLAUDE.md](CLAUDE.md). Open Claude Code in the folder and it picks up from there.

## Editing the site (no code needed)

```bash
npm install        # once
npm run dev
```

Then open **http://localhost:3000/admin**:

1. **Edit content** — opens the editor (`/keystatic`): add or change projects, upload images,
   edit the About page, your intro and links (Site settings), and categories such as *In the Lab*.
   Changes appear on http://localhost:3000 straight away.
2. **Check** — the dashboard shows anything that needs fixing before publishing.
3. **Publish changes** — saves your edits to GitHub in one click.
4. **Rebuild live site** — whenever you want (e.g. to refresh GitHub stars). Needs your host's
   deploy-hook URL in `.env.local` as `DEPLOY_HOOK_URL`. Nothing rebuilds on a schedule.

The editor and dashboard only exist on your computer — on the live site those pages are hidden.

## Adding work from the command line

```bash
# scaffold from the repo + video (interactive if you leave flags out)
npm run new-project -- --github MatinEsmaeili00/MyRepo --youtube https://youtu.be/VIDEOID

# turn a screen capture — or your own YouTube video — into a hover-preview loop
npm run media -- my-repo ~/Captures/demo.mp4 --name preview --start 2 --duration 8
npm run media -- my-repo https://youtu.be/VIDEOID --name preview --start 6 --duration 10
```

`npm run audit:sources` lists GitHub repos and YouTube uploads that aren't on the site yet.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Site + editor (`/keystatic`) + dashboard (`/admin`) on your computer |
| `npm run build` / `start` | Production build (runs `validate` first) and server |
| `npm run validate` | Schema, media files, links and component checks for all content |
| `npm run new-project` | Scaffold a project file, pre-filled from GitHub/YouTube |
| `npm run media` | ffmpeg pipeline: video/GIF → mp4 + webm + poster, images → jpg |
| `npm run audit:sources` | What's on GitHub/YouTube but not on the portfolio |
| `npm run check` | validate + typecheck + lint |

## Docs

- **[CLAUDE.md](CLAUDE.md)** — architecture, content format, CMS, conventions, deployment.
  Written for Claude Code and humans alike.
- **[docs/MIGRATION.md](docs/MIGRATION.md)** — what moved over from the old WordPress site, and
  open questions.
