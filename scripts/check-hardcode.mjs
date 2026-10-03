import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const allowCopy = [path.join(root, "content"), path.join(root, "config")];
const skipDirs = new Set(["node_modules", ".next", "public", ".git"]);
const sourceExt = new Set([".ts", ".tsx", ".js", ".mjs", ".css"]);

const forbiddenPhone = /010[-.\s]?7923[-.\s]?8501/;
const korean = /[\uac00-\ud7a3]/;
const inlineStyle = /style=\{\{|style="/;
const arbitrary = /(?:^|[\s"'`])[a-z0-9:/_-]*-\[[^\]]*(?:px|rem|em|#)[^\]]*\]/i;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const failures = [];
const files = walk(root);

for (const file of files) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, "utf8");
  if (forbiddenPhone.test(text)) failures.push(`${rel}: unpublished phone number`);
  if (!sourceExt.has(path.extname(file))) continue;
  if (rel === "next-env.d.ts" || rel.endsWith(".d.ts")) continue;
  const inCopy = allowCopy.some((dir) => file.startsWith(dir + path.sep)) || rel === "styles/tokens.css";
  const inUi = rel.startsWith(`components${path.sep}ui${path.sep}`);
  if (!inCopy && korean.test(text)) failures.push(`${rel}: Korean copy outside content/config`);
  if (!inCopy && /https?:\/\//.test(text) && !rel.endsWith("fonts.ts") && !rel.startsWith("scripts/")) {
    failures.push(`${rel}: URL literal outside content/config`);
  }
  if (rel.endsWith(".tsx") && inlineStyle.test(text) && !rel.endsWith(`components${path.sep}seo${path.sep}JsonLd.tsx`)) {
    failures.push(`${rel}: inline style`);
  }
  if ((rel.startsWith("app/") || rel.startsWith("components/")) && !inUi && arbitrary.test(text)) {
    failures.push(`${rel}: arbitrary Tailwind value`);
  }
  if (rel.endsWith(".tsx") && /<script(?![^>]*type="application\/ld\+json")/.test(text)) {
    failures.push(`${rel}: inline script`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("check-hardcode: ok");
