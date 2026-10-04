"use client";

import { useActionState } from "react";
import { publishChanges, rebuildLive, type ActionResult } from "./actions";

export function PublishForm({ disabled }: { disabled: boolean }) {
  const [result, action, pending] = useActionState(publishChanges, null);
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm text-fg-muted">What changed? (optional)</span>
        <input
          name="message"
          placeholder="e.g. Add Snow Deformation video"
          className="h-11 w-full rounded-md border border-line-strong bg-ink-2 px-3 text-fg placeholder:text-fg-faint focus:border-fg focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={pending || disabled}
        className="inline-flex min-h-11 items-center rounded-md bg-fg px-5 font-medium text-ink transition-colors hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Publishing…" : "Publish changes"}
      </button>
      <Result result={result} />
    </form>
  );
}

export function RebuildForm({ configured }: { configured: boolean }) {
  const [result, action, pending] = useActionState(async () => rebuildLive(), null);
  return (
    <form action={action} className="space-y-3">
      <button
        type="submit"
        disabled={pending || !configured}
        className="inline-flex min-h-11 items-center rounded-md border border-line-strong px-5 font-medium text-fg transition-colors hover:border-fg disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Starting…" : "Rebuild live site"}
      </button>
      <Result result={result} />
    </form>
  );
}

function Result({ result }: { result: ActionResult }) {
  if (!result) return null;
  return (
    <div role="status" className={result.ok ? "text-sm text-fg" : "text-sm text-accent"}>
      <p>{result.message}</p>
      {result.detail && (
        <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-ink-3 p-3 font-mono text-xs whitespace-pre-wrap text-fg-muted">
          {result.detail}
        </pre>
      )}
    </div>
  );
}
