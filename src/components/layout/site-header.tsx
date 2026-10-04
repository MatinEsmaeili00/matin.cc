import Link from "next/link";
import { site } from "@/config/site";
import { navItems } from "@/lib/site-links";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const items = navItems();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/75 backdrop-blur-md supports-[backdrop-filter]:bg-ink/55">
      <div className="page gutter flex h-14 items-center justify-between">
        <Link
          href="/"
          className="font-mono text-[0.75rem] tracking-[0.12em] text-fg uppercase transition-colors hover:text-accent"
        >
          {site.name}
        </Link>

        <div className="flex items-center gap-2 sm:gap-6">
          <nav aria-label="Primary" className="hidden sm:block">
            <ul className="flex items-center gap-8">
              {items.map((item) => (
                <li key={item.href}>
                  <NavLink {...item} />
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
          <MobileNav items={items} />
        </div>
      </div>
    </header>
  );
}

function NavLink({ label, href }: { label: string; href: string }) {
  const className =
    "font-mono text-[0.75rem] tracking-[0.12em] text-fg-muted uppercase transition-colors hover:text-fg";
  // Résumé (PDF) and mailto aren't routes — use a plain anchor.
  if (href.startsWith("/") && !href.endsWith(".pdf")) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}
