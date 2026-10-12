# Migration from WordPress (matin.cc) — October 2026

This records what the old site contained, where every piece went, what was merged or left out
(and why), inconsistencies found along the way, and what still needs Matin's input.
Nothing was silently deleted: every old URL either has a new home or redirects somewhere sensible.

## 1. What the old site was

- WordPress block theme on Hostinger. Each project page was a hand-built custom template (page
  content itself was empty), so updating anything meant editing templates by hand.
- **43 pages**, of which ~25 had real content. The rest were duplicates or empty stubs.
- **6 blog posts** — near-identical auto-generated "Creating a Portfolio Website for a Game
  Programmer…" placeholders, all dated 31 Jan 2024.
- The homepage autoplayed **12 YouTube iframes** at once and used a large animated GIF (up to
  50 MB each) for almost every card — the main reason the old site was slow.
- **59 code snippets** were embedded as syntax-highlighted HTML inside `srcdoc` iframes. Their
  source text was recovered and the relevant ones now live in case studies as real code blocks.
- 56 YouTube videos referenced (all public, channel `@MatinEsmaeili_00`).
- Navigation: Developed Games & Tools · Virtual Production · Math · Shaders · Contact.
- About and Contact pages existed but were empty.

## 2. Where everything went

### Featured (homepage film-strip rows)

| New page | From | Notes |
|---|---|---|
| `snow-deformation` | GitHub only | New — wasn't on the old site |
| `sand-deformation` | GitHub only | New |
| `digital-twin-platform` | `/digital-twin-platform` (+ duplicates `/digital-twin`, `/syngenta-digital-twin`) | Client name kept out (you'd renamed it) |
| `verocity` | `/verocity` | Code + spline-ranking excerpts pulled live from the plugin repo |
| `solar-farm` | `/solar-farm` (+ `/sf`) | |
| `tem-lab-digital-twin` | `/tem-lab-digital-twinning` (+ `/demo3`, `/tem`) | |

### Projects (homepage grid + Work index)

| New page | From |
|---|---|
| `rosorin-voice-control` | GitHub only (new) |
| `robots-and-humans` | `/robots-and-humans` |
| `gpulab` | GitHub only (new) |
| `building-visualization` | GitHub only (new, honest WIP status) |
| `sam3-quest-segmentation` | GitHub `sam3-unity` (new) |
| `particle-morphing-system` | `/particle-morphing-system` (+ `/pu`) |
| `ultrasound-procedure` | `/ultrasound-procedure` (+ `/usp`) |
| `unity-shader-collection` | Homepage "Shaders" section (5 cards) + GitHub `Unity5-ShaderShowcase` — one case study, 5 **pieces** shown as cards |
| `virtual-production-lsu` | Homepage "Virtual Production" section (9 cards) — one case study whose 9 **pieces** are again individual cards on the homepage |
| `muchi` | `/muchi` |
| `no-surprises` | `/no-surprises` |
| `sud-enforcer` | `/sud-enforcer` (+ typo duplicate `/sub-enforcer`) |

### Archive (compact list on /work, still full pages)

`zombie-killer` (+ `/zombie-killer-ss`, `/math-prototype` — the older write-up of the same game),
`scarecrow-dont-look-away` (+ `/scarecrow-dont-look-away-ss`, `-mobile-ss`), `environment-generator`,
`house-simulation-1` (+ `/demo1`, `/house-simulation-ss`), `house-simulation-2` (+ `/demo2`, `/hs2`),
`try-not-to-lose` (+ `-ss`), `flag-collector`, `bit-masking`, `chess`,
`vector-math-experiments` (homepage "Math" section, 3 cards — **merged**),
`monte-carlo-pi` (GitHub), `jewel-seeker` (GitHub).

### Not migrated as pages (redirected instead)

| Old URL | Why | Redirects to |
|---|---|---|
| 6 blog posts + `/blog` | Auto-generated placeholder text, not your writing | `/` |
| `/about`, `/contact` | Empty | `/about`, `/about#contact` |
| `/matin-main`, `/developed-games-_1` | Empty stubs (`developed-games-_1` contained "jjjj") | `/`, `/work` |
| `/rocket-ss` | Empty "Rocket" stub — no content or media found anywhere | `/work` |

All redirects are permanent (308). Project-specific ones live in each file's `aliases`; the rest
in `src/config/redirects.ts`.

## 3. Assets

- Downloaded the covers, demo GIFs, original MP4s and screenshots for every project
  (≈1.6 GB of source media) and converted them with `scripts/lib/ffmpeg.ts`: GIFs → denoised
  H.264 MP4 loops + JPEG posters, screenshots → JPEG ≤2000 px. Result: **34 MB** in `public/media/`,
  every clip ≤ ~1.6 MB.
- WordPress "-1024x575" thumbnails were swapped for the full-size originals where they existed.
- **Not migrated:** the GTA V and The Sims reference screenshots on House Simulation 1 (third-party
  images; the page mentions the inspiration in one sentence), and third-party tutorial videos
  (Freya Holmér, renderBucket, Sebastian Lague, The Coding Train, Catlike Coding) — credited as
  links instead.
- One image named like a photo (`1734163511126.jpg`) turned out to be your hand-drawn beam maths
  for the TEM project; it's now `beam-math.jpg` and used as a figure. The Robots & Humans
  "docs.google.com" screenshot is an architecture diagram (Isaac ↔ ROS 2 ↔ Unreal) and is used as one.

## 4. Inconsistencies found (not silently "fixed" — please confirm)

| Where | Old site said | New site uses |
|---|---|---|
| Verocity team size | Homepage: "Group of 8" · project page: "A group of 10 people" | **10** |
| TEM team size | Homepage: "group of 5" · project page: "A group of 6 people" | **6** |
| Zombie Killer play link | Homepage → `zombie-killer-v01` · project page "click here" → `kill-to-win-v01` | `zombie-killer-v01` |
| Scarecrow code tabs | "Game State" / "Game State Controller" tabs showed **Zombie Killer** code | Not used |
| Scarecrow "Collecting Item" GIF | Actually shows the tutorial intro | Captioned for what it shows |
| "Cross product coordinate system" card | Description was copied from the snow shader | Described from title + clip only |
| DMX lighting card | Reused the "Interaction – Demo" GIF (a live music performance) | Clip moved to the Interaction section |
| LinkedIn link | Text said `linkedin.com/MatinEsmaeili00`, href was `linkedin.com/in/matinesmaeili` | The href |
| Typos on the old pages | "Donwload", "ithc.io", "Interseciton", "Sub Enforcer" | Fixed |
| Typos on YouTube | Title "No Suprises - Camera System"; "Ulterasound" burned into the portfolio reel | **Need fixing on YouTube** (the site shows YouTube's titles) |
| Footer | "© 2024" | Current year, automatic |

## 5. Needs your input

**Highest impact first:**

1. **Footage for the new rendering work.** Snow Deformation, Sand Deformation, GPULab, Building
   Visualization and Robot Voice Control have no video yet, so they use the procedural ridgeline
   cover. A 6–10 s capture each (`npm run media -- <slug> <capture> --name preview`) plus a
   YouTube demo would make the homepage far stronger — Snow and Sand are the top two featured rows.
2. **Résumé PDF** — upload it in the CMS (Site settings → Résumé) or drop it in as `public/resume.pdf`;
   the "Download résumé" buttons appear automatically. A portrait photo (Site settings → Photo) also
   helps recruiters.
3. **About page** (CMS → About page) — written only from what the old site and GitHub support.
   Please add education/degree, current position, and anything else you want stated. The "graduate"
   and "PhD AI coursework" context comes from the Verocity plugin README and the Monte Carlo repo.
4. **Roles I couldn't confirm** (fields left blank or phrased cautiously):
   - Robots & Humans — your role (left blank)
   - Sud Enforcer — your role (left blank)
   - Virtual Production — role title and start year (set to 2024)
   - Jewel Seeker — what you built (role "Developer", team size left out)
   - Muchi — "Gameplay & tools programmer" (from "one of the main features I created")
   - No Surprises — "Gameplay programmer (camera system)" (the page only listed the camera system)
5. **Unity Shader Collection year** — set to 2024 (GIFs were uploaded Jan 2025; the repo is from 2025).
6. **Social links** — the site lists GitHub, LinkedIn, YouTube and itch.io. Instagram, Twitter/X and
   Facebook from the old header were left out as non-professional; add them in
   `src/config/site.ts` if you want them.
7. **GitHub-only work not on the site** — `sam2-unity` (earlier version of the SAM 3 project?),
   `sam3-claude`, `active-contour-snakes-claude` (+ `2`), `temporal-tracking-claude`
   (computer-vision coursework). Listed in `content/audit-ignore.txt`; remove a line and run
   `npm run new-project -- --github MatinEsmaeili00/<repo>` to add one.
8. **Old URL `/syngenta-digital-twin`** — not redirected, to keep the client name out of the
   codebase. Add it to the Digital Twin Platform `aliases` if you'd rather keep that link working.
9. Fix the YouTube title typo listed above (the site picks up titles from YouTube), and consider
   re-exporting the reel without the "Ulterasound" typo.

## 6. Cutover checklist

1. ✅ GitHub repository created: `MatinEsmaeili00/matin.cc` (private).
2. On your host: create a **Node.js app** (Node 20.9+) from the GitHub repo, with build command
   `npm run build` and start command `npm start`. Add `GITHUB_TOKEN` (and optionally
   `YOUTUBE_API_KEY`) as environment variables. If the host can only serve static files, the
   site needs a static-export variant — ask Claude to set it up (see CLAUDE.md → Deployment).
3. Check the host's preview URL: every page, the old-URL redirects, OG images.
4. Point `matin.cc` (and `www`) at the new host in DNS, following the host's instructions.
5. Keep a full WordPress backup (Hostinger → Backups, or export + uploads folder) before
   switching DNS or cancelling hosting.
6. Google Search Console: verify the domain, submit `https://matin.cc/sitemap.xml`.
7. Optional — rebuild button: if your host offers a deploy/build hook URL, put it in `.env.local`
   as `DEPLOY_HOOK_URL` (for the /admin button) and as the `DEPLOY_HOOK_URL` GitHub secret (for
   GitHub → Actions → "Rebuild site"). Rebuilds only happen when you ask — there's no schedule.
