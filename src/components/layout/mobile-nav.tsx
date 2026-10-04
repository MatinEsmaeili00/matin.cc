"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { NavItem } from "@/lib/site-links";

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState<string | null>(null);
  const pathname = usePathname();
  const panelId = useId();

  // Close after navigating (adjusting state during render, not in an effect).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="-mr-3 flex h-11 items-center px-3 font-mono text-[0.75rem] tracking-[0.12em] text-fg uppercase"
      >
        {open ? "Close" : "Menu"}
      </button>

      <nav
        id={panelId}
        aria-label="Primary"
        hidden={!open}
        className="gutter fixed inset-x-0 top-14 bottom-0 overflow-y-auto border-t border-line bg-ink pt-8 pb-12"
      >
        <ul className="flex flex-col">
          {items.map((item, i) => {
            const internal = item.href.startsWith("/") && !item.href.endsWith(".pdf");
            const className =
              "flex items-baseline justify-between border-b border-line py-5 text-4xl font-semibold tracking-tight semi-wide text-fg active:text-accent";
            const content = (
              <>
                {item.label}
                <span className="label">{String(i + 1).padStart(2, "0")}</span>
              </>
            );
            return (
              <li key={item.href}>
                {internal ? (
                  <Link href={item.href} className={className}>
                    {content}
                  </Link>
                ) : (
                  <a href={item.href} className={className}>
                    {content}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
