/**
 * Permanent redirects for old URLs that don't belong to a single project.
 *
 * Project-specific old URLs live in each project's `aliases` field instead,
 * so they move with the project. Both lists are merged in next.config.mjs
 * (plain JavaScript, so this file is too).
 *
 * @type {{ source: string; destination: string }[]}
 */
export const staticRedirects = [
  // Old WordPress pages
  { source: "/contact", destination: "/about#contact" },
  { source: "/blog", destination: "/" },
  { source: "/matin-main", destination: "/" },
  { source: "/developed-games-_1", destination: "/work" },
  { source: "/rocket-ss", destination: "/work" },

  // Placeholder posts from the WordPress install (see docs/MIGRATION.md)
  { source: "/creating-a-dynamic-portfolio-website-for-a-game-programmer-and-technical-artist", destination: "/" },
  { source: "/creating-a-dynamic-portfolio-website-for-a-game-programmer-and-technical-artist-2", destination: "/" },
  { source: "/creating-a-dynamic-portfolio-website-for-a-game-programmer", destination: "/" },
  { source: "/building-a-portfolio-website-for-a-game-programmer-and-technical-artist", destination: "/" },
  { source: "/creating-a-portfolio-website-for-a-game-programmer-and-technical-artist", destination: "/" },
  { source: "/creating-a-portfolio-website-for-a-game-programmer-and-technical-artist-2", destination: "/" },

  // WordPress system paths that crawlers still request
  { source: "/feed", destination: "/" },
  { source: "/category/:path*", destination: "/work" },
];
