import type { ReactNode } from "react";

/** Hairline-ruled section header: index marker, title, optional right-side action. */
export function SectionHeading({
  id,
  index,
  title,
  aside,
}: {
  id: string;
  index?: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 md:mb-14">
      <h2 id={id} className="flex items-baseline gap-4 text-2xl font-semibold tracking-tight semi-wide md:text-3xl">
        {index && <span className="label text-accent">{index}</span>}
        {title}
      </h2>
      {aside}
    </div>
  );
}
