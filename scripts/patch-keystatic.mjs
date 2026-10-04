/**
 * postinstall: fixes a Keystatic bug that drops code-fence metadata on save.
 *
 * Keystatic stores a fence's info string as `lang + " " + meta`, then splits
 * it back with `lang.split(' ', 2)` — which keeps only the first two tokens,
 * so ```cpp title="A.cpp" {3-5}``` would lose `{3-5}` and a title containing
 * a space would be cut. This rewrites it to split at the first space only.
 *
 * Idempotent. If a future Keystatic release changes the code, this prints a
 * warning instead of failing the install — check whether upstream fixed it.
 */
import fs from "node:fs";
import path from "node:path";

const dist = path.join(process.cwd(), "node_modules", "@keystatic", "core", "dist");
const BUGGY = "[lang, meta] = lang.split(' ', 2);";
const FIXED = "[lang, meta] = [lang.slice(0, lang.indexOf(' ')), lang.slice(lang.indexOf(' ') + 1)];";

if (!fs.existsSync(dist)) process.exit(0);

let patched = 0;
let alreadyFixed = 0;
for (const file of fs.readdirSync(dist).filter((f) => f.endsWith(".js"))) {
  const full = path.join(dist, file);
  const source = fs.readFileSync(full, "utf8");
  if (source.includes(FIXED)) alreadyFixed++;
  if (!source.includes(BUGGY)) continue;
  fs.writeFileSync(full, source.split(BUGGY).join(FIXED));
  patched++;
}

if (patched) console.log(`[patch-keystatic] fixed code-fence metadata handling in ${patched} file(s)`);
else if (!alreadyFixed) {
  console.warn("[patch-keystatic] pattern not found — Keystatic changed; check that code-fence titles/highlights survive a save");
}
