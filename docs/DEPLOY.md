# Deployment — Vercel

The live site (https://matin.cc) runs on **Vercel's free Hobby plan**, built from the `main` branch of
GitHub. Every push to `main` rebuilds it in about a minute; GitHub and YouTube data is fetched during
that build, so pages never call an API when someone visits.

## How it works ("curated automation")

| You decide (CMS → Projects, or the `.mdx` file) | Fetched automatically at every build |
|---|---|
| Which projects appear — `draft: true` hides one | GitHub: repo description, stars, languages, last push, releases |
| Order — `priority` (higher first), `tier`, `homeSection` | GitHub: code excerpts (`<GitHubCode>`) straight from the repo |
| Descriptions — `summary` + the case-study text | YouTube: video titles (+ date and length with `YOUTUBE_API_KEY`) |
| Which video is featured — `youtube`, `preview` loop, showreel (Site settings) | |

```
Your computer                         GitHub                 Vercel                      Visitors
npm run dev → /admin → Publish ──push──▶ main ──auto-deploy──▶ build (fetches GitHub   ──▶ matin.cc
                                                               + YouTube data) → CDN
/admin → Rebuild live site ─────── deploy hook ──────────────▶ same build, no content change
```

A failed build never takes the site down — the previous version stays live.

## Day to day

- **Change content:** `npm run dev` → <http://localhost:3000/admin> → *Edit content* → *Publish*.
  Publish validates, commits `content/` + `public/` and pushes; matin.cc updates about a minute later.
- **Refresh GitHub stars / video titles without changing content:** *Rebuild live site* in /admin
  (needs `DEPLOY_HOOK_URL` in `.env.local`), or Vercel → Deployments → ⋯ → **Redeploy**.
- **Any push to `main` goes live**, code changes included. Push other branches to get a private
  preview URL first (Vercel builds every branch as a preview).
- **The CMS and /admin only run on your computer.** On the live site they show "not found" —
  Keystatic's local mode has no login, so it must never be online.

## How it's set up (for reference)

**Vercel project** `matin-cc` (Hobby), imported from `MatinEsmaeili00/matin.cc`, branch `main`:

- Framework preset Next.js, root `./`, build/output/install commands left on their defaults.
- Node.js 24 (`"engines": { "node": "24.x" }` in `package.json`).
- Environment variables (Production and Preview, marked sensitive):
  - `GITHUB_TOKEN` — fine-grained token, *Public repositories*, no permissions
    (<https://github.com/settings/personal-access-tokens>). Expires — renew it here and in Vercel.
  - `YOUTUBE_API_KEY` — Google Cloud project `matin-cc`, restricted to *YouTube Data API v3*,
    application restrictions *None*.
- Deploy hook (Settings → Git → Deploy Hooks, branch `main`) → `DEPLOY_HOOK_URL` in `.env.local`.

**Domains** (Vercel → Settings → Domains):

- `matin.cc` → Production. This is the main address: `site.url`, canonical links and the sitemap
  all use it, so don't switch Vercel to "redirect apex to www".
- `www.matin.cc` → 308 permanent redirect to `matin.cc`.

**DNS** stays at Hostinger (hPanel → Domains → matin.cc → DNS records): the `@` and `www` records
point to the values Vercel shows under Settings → Domains; no AAAA records for `@`/`www`. MX/TXT
records are for email — leave them alone.

## Limits (Hobby plan)

Per month: 100 GB of traffic and 5,000 image transformations; up to 100 deployments a day — far
above what a portfolio needs ([details](https://vercel.com/docs/limits)). If one is ever hit, Vercel
pauses rather than charges. Hobby is for personal, non-commercial sites — a portfolio is fine.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Deployment failed with a content error (`✗ …mdx`) | Run `npm run validate` locally, fix, publish again. |
| No GitHub stars on the live site | `GITHUB_TOKEN` expired or missing — renew it, update it in Vercel, redeploy. |
| Video dates/lengths missing | `YOUTUBE_API_KEY` missing or quota exceeded (10,000 units/day — a build uses a few dozen). |
| matin.cc shows the old site / an error after DNS changes | Vercel → Settings → Domains → *Refresh*; DNS can take up to a few hours. |

## Optional later

- **Edit content from any computer or phone:** Keystatic's GitHub mode runs on Vercel — `/keystatic`
  on matin.cc with a GitHub login, saving straight to the repo. Needs a GitHub App and four
  `KEYSTATIC_*` env vars (see `CLAUDE.md` → CMS).
- **CI checks on every push:** `docs/github-workflows/` (see the README there).

## Why not Hostinger (tried Oct 2026)

Hostinger's Node.js Web Apps run on Linux with glibc older than 2.29; Next's native compiler needs
2.30, so the default build fails there. A workaround (webpack + plain-JS `next.config.mjs`) lives on
the `hostinger` branch. Hostinger still holds the domain's DNS and the old WordPress site.
