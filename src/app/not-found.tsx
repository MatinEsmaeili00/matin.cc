import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <section className="page gutter pt-24 pb-16 md:pt-40">
      <p className="label">Error 404</p>
      <h1 className="mt-4 text-title font-semibold tracking-[-0.035em] uppercase semi-wide">Nothing rendered here</h1>
      <p className="mt-6 max-w-xl text-lead text-fg-muted">
        This page doesn&rsquo;t exist — possibly a link from the old site. Everything moved to the work index.
      </p>
      <Link
        href="/work"
        className="mt-10 inline-flex min-h-11 items-center gap-3 font-mono text-[0.75rem] tracking-[0.12em] uppercase hover:text-accent"
      >
        Browse all work <ArrowRight className="size-3.5" />
      </Link>
    </section>
  );
}
