import "server-only";
import { site } from "@/config/site";
import { publicFileExists } from "@/lib/content/load";

/** The résumé URL, or null if it's disabled or the PDF isn't in /public yet. */
export function resumeHref(): string | null {
  return site.resume && publicFileExists(site.resume) ? site.resume : null;
}

export type NavItem = { label: string; href: string };

export function navItems(): NavItem[] {
  const items: NavItem[] = [
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
  ];
  const resume = resumeHref();
  if (resume) items.push({ label: "Résumé", href: resume });
  items.push({ label: "Contact", href: `mailto:${site.email}` });
  return items;
}
