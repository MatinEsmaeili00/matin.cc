"use server";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { validateContent } from "@/lib/content/validate";

const run = promisify(execFile);

export type ActionResult = { ok: boolean; message: string; detail?: string } | null;

/** Content-only paths the Publish button may commit. Code changes go through git as usual. */
const CONTENT_PATHS = ["content", "public"];

function assertLocal() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Admin actions only run on your computer (npm run dev).");
  }
}

async function git(...args: string[]) {
  const { stdout, stderr } = await run("git", args, { cwd: process.cwd(), timeout: 60_000 });
  return `${stdout}${stderr}`.trim();
}

/** Validate, commit content/ + public/, push. Your host rebuilds from the push. */
export async function publishChanges(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  assertLocal();

  const changed = await git("status", "--porcelain", "--", ...CONTENT_PATHS);
  if (!changed) return { ok: true, message: "Nothing to publish — everything is already on GitHub." };

  const report = validateContent();
  if (report.errors.length) {
    return { ok: false, message: "Fix these content errors first:", detail: report.errors.join("\n\n") };
  }

  const message = String(form.get("message") ?? "").trim() || "Update content";
  try {
    await git("add", "--", ...CONTENT_PATHS);
    await git("commit", "-m", message, "--", ...CONTENT_PATHS);
    const pushed = await git("push");
    return { ok: true, message: "Published to GitHub.", detail: pushed };
  } catch (error) {
    const e = error as { stderr?: string; message: string };
    return { ok: false, message: "Publishing failed:", detail: e.stderr || e.message };
  }
}

/**
 * Asks the host to rebuild the live site now (e.g. to refresh GitHub stats)
 * via its deploy hook URL. Works with Vercel, Netlify, Cloudflare Pages,
 * Render, Coolify… — anything that offers a "build hook".
 */
export async function rebuildLive(): Promise<ActionResult> {
  assertLocal();
  const hook = process.env.DEPLOY_HOOK_URL;
  if (!hook) return { ok: false, message: "DEPLOY_HOOK_URL isn't set in .env.local." };
  try {
    const res = await fetch(hook, { method: "POST", signal: AbortSignal.timeout(15_000) });
    return res.ok
      ? { ok: true, message: "Rebuild started — the live site updates in a few minutes." }
      : { ok: false, message: `The host answered ${res.status}.`, detail: await res.text() };
  } catch (error) {
    return { ok: false, message: "Couldn't reach the deploy hook.", detail: (error as Error).message };
  }
}
