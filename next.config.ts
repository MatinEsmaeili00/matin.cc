import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import matter from "gray-matter";
import { staticRedirects } from "./src/config/redirects";

/**
 * Old URLs listed in each project's `aliases` frontmatter 301 to the
 * project page. Read directly here (not via the full content loader) so
 * config loading stays fast; `npm run validate` checks aliases for conflicts.
 */
function projectAliasRedirects() {
  const dir = path.join(process.cwd(), "content", "projects");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .flatMap((file) => {
      const { data } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      const slug = file.replace(/\.mdx$/, "");
      const aliases: string[] = Array.isArray(data.aliases) ? data.aliases : [];
      return aliases.map((source) => ({ source, destination: `/work/${slug}` }));
    });
}

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },

  async redirects() {
    return [...staticRedirects, ...projectAliasRedirects()].map((r) => ({ ...r, permanent: true }));
  },

  async headers() {
    return [
      {
        // Project media rarely changes; let browsers and the CDN keep it.
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
