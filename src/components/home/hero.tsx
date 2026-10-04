import Link from "next/link";
import { site } from "@/config/site";
import type { ProjectSummary } from "@/lib/content/projects";
import { pad2 } from "@/lib/utils";
import { getYouTubeThumbnail } from "@/lib/youtube";
import { Showreel } from "./showreel";

/**
 * Who, what, and what's happening now — in one screen, then straight into
 * the work. "Now building" is derived from projects with status: active.
 */
export async function Hero({ active }: { active: ProjectSummary[] }) {
  const [first, ...rest] = site.name.split(" ");
  const reel = site.showreel;
  const reelPoster = reel ? await getYouTubeThumbnail(reel.youtube) : null;

  return (
    <section className="page gutter pt-[clamp(4rem,14vh,10rem)] pb-20 md:pb-32">
      <h1 className="animate-rise text-display font-semibold tracking-[-0.045em] uppercase semi-wide md:wide">
        {first}
        <br />
        {rest.join(" ")}
      </h1>

      <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12">
        <ul className="animate-rise space-y-2 [animation-delay:120ms] md:col-span-5">
          {site.roles.map((role, i) => (
            <li key={role} className="flex gap-4 font-mono text-[0.8125rem] tracking-[0.06em] uppercase">
              <span className="text-accent">{pad2(i + 1)}</span>
              <span>{role}</span>
            </li>
          ))}
        </ul>

        <div className="animate-rise [animation-delay:220ms] md:col-span-6 md:col-start-7">
          <p className="text-lead text-fg-muted">{site.tagline}</p>

          {active.length > 0 && (
            <div className="mt-10 border-t border-line pt-5">
              <p className="label mb-3">Now building</p>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {active.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={p.url}
                      className="inline-flex min-h-8 items-center gap-2 text-sm text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
                    >
                      <span aria-hidden className="size-1.5 bg-accent" />
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {reel && reelPoster && <Showreel id={reel.youtube} title={reel.title} poster={reelPoster} />}
    </section>
  );
}
