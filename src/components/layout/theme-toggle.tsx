"use client";

import { Moon, Sun } from "@/components/ui/icons";

/**
 * Light by default; remembers the visitor's choice. The <html data-theme>
 * attribute is the only state (set before paint by the script in app/layout.tsx),
 * and CSS picks the icon, so it's correct before hydration too.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const dark = root.getAttribute("data-theme") !== "dark";
    if (dark) root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      /* private mode — the choice just won't persist */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark theme"
      title="Toggle dark theme"
      className={`flex size-10 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-ink-3 hover:text-fg ${className ?? ""}`}
    >
      <Moon className="size-4 [[data-theme=dark]_&]:hidden" />
      <Sun className="hidden size-4 [[data-theme=dark]_&]:block" />
    </button>
  );
}
