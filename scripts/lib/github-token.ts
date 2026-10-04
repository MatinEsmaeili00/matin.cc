import { execSync } from "node:child_process";

/**
 * GITHUB_TOKEN if set; otherwise the GitHub CLI's token when `gh` is
 * installed and logged in. Lets local scripts avoid the 60 req/hour
 * anonymous limit without storing a token anywhere.
 */
export function githubToken(): string | undefined {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync("gh auth token", { stdio: ["ignore", "pipe", "ignore"], timeout: 5000 }).toString().trim() || undefined;
  } catch {
    return undefined;
  }
}
