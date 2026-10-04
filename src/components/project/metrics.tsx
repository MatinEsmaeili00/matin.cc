/** Results as big numbers — used from frontmatter `metrics` and inside MDX. */
export function Metrics({ items }: { items: { value: string; label: string }[] }) {
  if (!items.length) return null;
  return (
    <dl className="not-prose my-10 grid grid-cols-2 border-t border-l border-line lg:grid-cols-4">
      {items.map((m) => (
        <div key={m.label} className="flex flex-col justify-between gap-6 border-r border-b border-line p-4 sm:p-5">
          <dt className="label order-last normal-case tracking-[0.02em]">{m.label}</dt>
          <dd className="text-2xl font-semibold tracking-tight semi-wide sm:text-3xl">{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}
