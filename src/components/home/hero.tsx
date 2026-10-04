import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight, Download, Mail } from "@/components/ui/icons";
import { site } from "@/config/site";
import type { ProjectSummary } from "@/lib/content/projects";
import { resumeHref } from "@/lib/site-links";
import { pad2 } from "@/lib/utils";
import { getYouTubeThumbnail } from "@/lib/youtube";
import { Showreel } from "./showreel";

/**
 * Who, what, and how to reach me — in one screen, in plain language, then
 * straight into the work. "Now building" is derived from projects with status: active.
 */
export async function Hero({ active }: { active: ProjectSummary[] }) {
  const [first, ...rest] = site.name.split(" ");
  const reel = site.showreel;
  const reelPoster = reel ? await getYouTubeThumbnail(reel.youtube) : null;
  const resume = resumeHref();

  return (
    <section className="page gutter pt-[clamp(3.5rem,11vh,8rem)] pb-16 md:pb-24">
      <div className="flex flex-col-reverse gap-8 md:flex-row md:items-end md:justify-between">
        <h1 className="animate-rise text-display font-semibold tracking-[-0.045em] uppercase semi-wide md:wide">
          {first}
          <br />
          {rest.join(" ")}
        </h1>
        {site.photo && (
          <Image
            src={site.photo}
            alt={`Portrait of ${site.name}`}
            width={320}
            height={320}
            priority
            className="size-24 rounded-full object-cover ring-1 ring-line md:size-40"
          />
        )}
      </div>

      <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12">
        <ul className="animate-rise space-y-2 [animation-delay:120ms] md:col-span-5">
          {site.roles.map((role, i) => (
            <li key={role} className="flex gap-4 font-mono text-[0.8125rem] tracking-[0.06em] uppercase">
              <span className="text-accent">{pad2(i + 1)}</span>
              <span>{role}</span>
            </li>
          ))}
          {site.location && (
            <li className="flex gap-4 pt-2 font-mono text-[0.8125rem] tracking-[0.06em] text-fg-muted uppercase">
              <span aria-hidden className="w-[2ch]" />
              <span>{site.location}</span>
            </li>
          )}
        </ul>

        <div className="animate-rise [animation-delay:220ms] md:col-span-7">
          <p className="text-lead text-fg-muted">{site.tagline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#featured" icon={<ArrowRight className="size-3.5 rotate-90" />}>
              View my work
            </ButtonLink>
            {resume && (
              <ButtonLink href={resume} variant="secondary" icon={<Download className="size-4" />} download>
                Download résumé
              </ButtonLink>
            )}
            <ButtonLink href={`mailto:${site.email}`} variant="secondary" icon={<Mail className="size-4" />}>
              Get in touch
            </ButtonLink>
          </div>

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
                      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
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
