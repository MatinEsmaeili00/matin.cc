import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@/components/ui/icons";
import { site } from "@/config/site";
import { cmsMode } from "@/lib/cms";
import { validateContent } from "@/lib/content/validate";
import { PublishForm, RebuildForm } from "./admin-forms";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const run = promisify(execFile);

/**
 * Local admin dashboard (npm run dev → /admin): edit content, check it,
 * publish it, and trigger a rebuild of the live site. 404 everywhere else.
 */
export default async function AdminPage() {
  if (cmsMode() !== "local") notFound();

  const report = validateContent();
  const changes = await pendingChanges();
  const hookConfigured = Boolean(process.env.DEPLOY_HOOK_URL);

  return (
    <div className="page gutter max-w-5xl py-12 md:py-16">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="label">matin.cc</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight semi-wide">Site admin</h1>
        </div>
        <nav className="flex flex-wrap gap-3">
          <Link
            href="/keystatic"
            className="inline-flex min-h-11 items-center rounded-md bg-fg px-5 font-medium text-ink transition-colors hover:bg-accent hover:text-white"
          >
            Edit content
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center rounded-md border border-line-strong px-5 font-medium hover:border-fg">
            View site
          </Link>
          <a
            href={`https://github.com/${site.github.username}/matin.cc`}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line-strong px-5 font-medium hover:border-fg"
          >
            GitHub <ArrowUpRight className="size-2.5" />
          </a>
        </nav>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Panel title="1 · Edit">
          <p className="text-fg-muted">
            Add or change projects, the About page, your site info and categories in the{" "}
            <Link href="/keystatic" className="text-fg underline underline-offset-4">
              content editor
            </Link>
            . Changes are saved to files on this computer and show up here instantly.
          </p>
        </Panel>

        <Panel title="2 · Check">
          {report.errors.length === 0 ? (
            <p className="text-fg">
              ✓ All {report.projectCount} projects are valid
              {report.warnings.length > 0 && <span className="text-fg-muted"> · {report.warnings.length} with suggestions</span>}
            </p>
          ) : (
            <p className="text-accent">{report.errors.length} file(s) need fixing before you can publish.</p>
          )}
          {report.errors.length > 0 && <Pre>{report.errors.join("\n\n")}</Pre>}
          {report.warnings.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-fg-muted">Suggestions</summary>
              <Pre>{report.warnings.join("\n\n")}</Pre>
            </details>
          )}
        </Panel>

        <Panel title="3 · Publish">
          <p className="mb-4 text-fg-muted">
            {changes.length
              ? `${changes.length} changed file(s) not yet on GitHub:`
              : "No unpublished changes."}
          </p>
          {changes.length > 0 && <Pre>{changes.join("\n")}</Pre>}
          <div className="mt-4">
            <PublishForm disabled={changes.length === 0} />
          </div>
          <p className="mt-4 text-sm text-fg-faint">
            Commits the <code>content/</code> and <code>public/</code> folders and pushes them to GitHub.
            If your host deploys from GitHub, the live site rebuilds by itself.
          </p>
        </Panel>

        <Panel title="4 · Rebuild live site">
          <p className="mb-4 text-fg-muted">
            Rebuild without publishing anything — for example to refresh GitHub stars and video titles.
          </p>
          <RebuildForm configured={hookConfigured} />
          {!hookConfigured && (
            <p className="mt-4 text-sm text-fg-faint">
              To enable this button, copy your host&rsquo;s deploy/build hook URL into <code>.env.local</code> as{" "}
              <code>DEPLOY_HOOK_URL=…</code> and restart <code>npm run dev</code>.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

async function pendingChanges(): Promise<string[]> {
  try {
    const { stdout } = await run("git", ["status", "--porcelain", "--", "content", "public"], { cwd: process.cwd() });
    return stdout.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-ink-2 p-6">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-ink-3 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-fg-muted">
      {children}
    </pre>
  );
}
