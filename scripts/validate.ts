/**
 * npm run validate
 *
 * Checks every project file before it can break a build (schema, media files,
 * video ids, /work links, aliases). Warnings flag things that render but could
 * be better. The checks live in src/lib/content/validate.ts so the /admin
 * dashboard shows the same results.
 *
 * Runs automatically before `npm run build`. Exit code 1 on errors.
 */
import { validateContent } from "../src/lib/content/validate";

const { projectCount, errors, warnings } = validateContent();

if (warnings.length && !process.argv.includes("--quiet")) {
  console.log(`\nWarnings (${warnings.length} files):\n\n${warnings.join("\n\n")}\n`);
}
if (errors.length) {
  console.error(`\n✗ ${errors.length} file(s) with errors:\n\n${errors.join("\n\n")}\n`);
  process.exit(1);
}
console.log(`✓ ${projectCount} projects valid`);
