"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "@/components/ui/icons";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        } catch {
          /* clipboard unavailable (insecure context) — nothing to do */
        }
      }}
      className="flex size-11 items-center justify-center border-l border-line text-fg-muted transition-colors hover:text-fg"
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
