import Link from "next/link";
import type { ReactNode } from "react";
import { cn, isExternal } from "@/lib/utils";

type Variant = "primary" | "secondary";

const styles: Record<Variant, string> = {
  primary: "bg-fg text-ink hover:bg-accent hover:text-white",
  secondary: "border border-line-strong text-fg hover:border-fg",
};

/**
 * Call-to-action link styled as a button. Internal routes use next/link;
 * external URLs, mailto: and files (PDF) use a plain anchor.
 */
export function ButtonLink({
  href,
  variant = "primary",
  icon,
  children,
  className,
  download,
}: {
  href: string;
  variant?: Variant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  download?: boolean;
}) {
  const cls = cn(
    "inline-flex min-h-11 items-center gap-2.5 rounded-md px-5 text-[0.9375rem] font-medium transition-colors",
    styles[variant],
    className,
  );
  const content = (
    <>
      {icon}
      {children}
    </>
  );
  const internalRoute = href.startsWith("/") && !/\.\w+$/.test(href) && !download;
  if (internalRoute) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={cls}
      download={download || undefined}
      {...(isExternal(href) && { target: "_blank", rel: "noopener" })}
    >
      {content}
    </a>
  );
}
