import Link from "next/link";
import { site } from "@/config/site";
import { resumeHref } from "@/lib/site-links";
import { ArrowUpRight } from "@/components/ui/icons";

export function SiteFooter() {
  const resume = resumeHref();
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="mt-32 border-t border-line">
      <div className="page gutter grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7">
          <p className="label mb-6">Contact</p>
          <a
            href={`mailto:${site.email}`}
            className="block text-[clamp(1.5rem,1rem+3vw,3.75rem)] leading-none font-semibold tracking-tight break-all semi-wide transition-colors hover:text-accent sm:break-normal"
          >
            {site.email}
          </a>
          {site.openTo && <p className="mt-6 max-w-md text-fg-muted">{site.openTo}</p>}
        </div>

        <nav aria-label="Elsewhere" className="md:col-span-4 md:col-start-9">
          <p className="label mb-6">Elsewhere</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-1">
            {site.social.map((link) => (
              <li key={link.href}>
                <a href={link.href} rel="me noopener" target="_blank" className="group inline-flex items-center gap-2 py-1 text-fg-muted transition-colors hover:text-fg">
                  {link.label}
                  <ArrowUpRight className="size-2.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
            ))}
            {resume && (
              <li>
                <a href={resume} className="group inline-flex items-center gap-2 py-1 text-fg-muted transition-colors hover:text-fg">
                  Résumé (PDF)
                  <ArrowUpRight className="size-2.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>

      <div className="page gutter flex flex-wrap items-center justify-between gap-4 border-t border-line py-6">
        <p className="label">
          © {year} {site.name}
        </p>
        <p className="label">
          <Link href="/work" className="hover:text-fg">
            All work
          </Link>
          <span className="mx-3">/</span>
          <a href={site.github.url} className="hover:text-fg">
            Built with Next.js
          </a>
        </p>
      </div>
    </footer>
  );
}
