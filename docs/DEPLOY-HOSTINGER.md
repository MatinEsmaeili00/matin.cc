# Deploying matin.cc to Hostinger

Host: **Hostinger Business Web Hosting → Node.js Web App**, deployed from GitHub.
Every push to `main` makes Hostinger install, validate, build and restart the site. GitHub and
YouTube data is fetched during that build, so the live site never calls an API on page load.

## How it works ("curated automation")

| You decide (CMS → Projects, or the `.mdx` file) | Fetched automatically at every build |
|---|---|
| Which projects appear — `draft: true` hides one | GitHub: repo description, stars, languages, last push, releases |
| Order — `priority` (higher first), `tier`, `homeSection` | GitHub: code excerpts (`<GitHubCode>`) straight from the repo |
| Descriptions — `summary` + the case-study text | YouTube: video titles (+ date and length with `YOUTUBE_API_KEY`) |
| Which video is featured — `youtube`, `preview` loop, showreel (Site settings) | |

```
You → /admin → Publish ──push──▶ GitHub (main) ──auto-deploy──▶ Hostinger builds the site
                                     ▲                               │
                    GitHub API ──────┴── fetched during the build ───┤
                    YouTube    ──────────────────────────────────────┘
```

A failed build never takes the site down — the previous version stays live.

## 0 · Before you start (once)

1. **GitHub token** — <https://github.com/settings/personal-access-tokens/new>: fine-grained token,
   *Repository access → Public repositories*, no extra permissions. Copy the `github_pat_…` value.
   Without it the build still works but may hit GitHub's 60-requests/hour limit.
2. **YouTube API key** (optional) — <https://console.cloud.google.com/apis/credentials>, restricted to
   *YouTube Data API v3*.
3. Make sure everything is pushed: `git status` is clean and `git push` says "Everything up-to-date".

## 1 · Deploy on a temporary address (WordPress stays live meanwhile)

1. hPanel → **Websites** → **Add website** → **Node.js Web App** → **Import Git Repository**.
2. **Authorize GitHub.** When GitHub asks which repositories, choose *Only select repositories* →
   `matin.cc`.
3. Pick `MatinEsmaeili00/matin.cc`, branch `main`. For the domain, choose the **temporary domain**
   (not matin.cc yet — it's still taken by WordPress).
4. Build settings (Hostinger auto-detects most of these — check them):

   | Field | Value |
   |---|---|
   | Framework | Next.js |
   | Node.js version | 24 (22 also works) |
   | Package manager | npm |
   | Build command | `npm run build` (script name `build`) |
   | Output directory | `.next` |
   | Entry file | leave empty (ignored for Next.js) |
   | Root directory | the repository root |

5. **Environment variables:**

   | Name | Value |
   |---|---|
   | `GITHUB_TOKEN` | the `github_pat_…` token from step 0 |
   | `YOUTUBE_API_KEY` | optional |

   Don't add the `KEYSTATIC_*` variables — the CMS stays on your computer, so `/admin` and
   `/keystatic` correctly show "not found" on the live site.
6. **Deploy.** The first build takes a few minutes (it installs ~650 MB of packages). Follow it under
   **Deployments** → the build log; you should see `✓ 30 projects valid` and `Generating static pages`.

**Check the temporary address:** home page, `/work`, a project page and `/about` load; images show;
videos play on hover; `/contact` redirects to the About page; `/admin` is "not found". Links in the
sitemap and social previews already say `https://matin.cc` — that's expected.

## 2 · Back up the WordPress site

Hostinger only lets one website use matin.cc, and **removing a website permanently deletes its
files, database and email settings**. Before removing it:

1. hPanel → **Websites** → matin.cc → **Backups** → download a *files* backup and a *database*
   backup. Keep both somewhere safe.
2. **Email:** if you have an `@matin.cc` mailbox at Hostinger, ask Hostinger support how to keep it
   before removing the website. (The site's contact address is Gmail, so this only matters if you
   set one up yourself.)
3. Grab anything still on the old site that the new one lacks — see `docs/MIGRATION.md` §5
   (résumé PDF, photo, missing videos).

## 3 · Move matin.cc to the new site

1. hPanel → **Websites** → matin.cc (the WordPress one) → remove the website.
2. **Websites** → the Node.js app (temporary domain) → **Connect domain** → `matin.cc`.
   SSL is installed automatically. The domain is already on Hostinger, so this usually takes
   minutes (Hostinger says up to 24 h for DNS).
3. Check `https://matin.cc` and `https://www.matin.cc`. Old WordPress URLs redirect automatically
   (project `aliases` + `src/config/redirects.ts`).

The site is down only between removing WordPress and connecting the domain.

## Day to day

- **Update content:** `npm run dev` → <http://localhost:3000/admin> → *Edit content* → *Publish*.
  The live site updates a few minutes later.
- **Refresh GitHub stars / video titles without changing content:** hPanel → **Websites** →
  matin.cc → **Deployments** → **Redeploy** (the /admin dashboard links there).
- Saving environment variables in hPanel redeploys automatically.
- **Any** push to `main` goes live, code changes included. Use a branch for work that isn't ready.
- A build failed? The old version is still live. Open the failed build's log under **Deployments**
  (Hostinger also offers an AI analysis of it).

## Limits

- Business plan: up to 5 Node.js apps, 3 GB RAM, 2 CPU cores. The build peaks around 0.6 GB on a Mac.
- Package install and build each have a 15-minute limit (this build should need a few minutes at most).
- **Inodes (file count):** you're at 48 % of your allowance and the app's packages are ~48,000
  files. After the first deploys, check hPanel → resource usage. Removing WordPress frees some.

## Troubleshooting

| Build log says | Fix |
|---|---|
| `tsx: not found`, or can't find `typescript` / `@tailwindcss/postcss` | Hostinger skipped dev packages — ask Claude to move the build tools into `dependencies`. |
| `JavaScript heap out of memory` | Add the env var `NODE_OPTIONS` = `--max-old-space-size=2048`. |
| A content error (`✗ …mdx`) | Run `npm run validate` locally, fix, publish again. |
| Warnings about `ffmpeg-static` | Harmless — ffmpeg is only used by `npm run media` on your computer. |
| Site builds but shows no GitHub stars | `GITHUB_TOKEN` is missing or expired — renew it and update the env var. |

## Later (optional)

- **Edit from anywhere:** Keystatic's GitHub mode works on Hostinger (it runs Node.js). It needs a
  GitHub App and four `KEYSTATIC_*` env vars — see `CLAUDE.md` → CMS.
- **CI checks on every push:** `docs/github-workflows/ci.yml` (see the README there).
