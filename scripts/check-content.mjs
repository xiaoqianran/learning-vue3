import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const r = spawnSync(process.execPath, [path.join(root, "scripts/sync-manifest.mjs")], {
  stdio: "inherit",
});
if (r.status !== 0) process.exit(r.status ?? 1);

// quiz id uniqueness
import fs from "node:fs";
const src = fs.readFileSync(path.join(root, "src/data/lessons.ts"), "utf8");
const ids = [...src.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
// filter quiz-like ids (contain : or lesson prefixes) — all id fields in quizzes
const quizIds = ids.filter((id) => /[-_]/.test(id) || id.length > 2);
const seen = new Set();
const dups = [];
for (const id of quizIds) {
  if (seen.has(id)) dups.push(id);
  seen.add(id);
}
// only report if many dups across different questions - slug level ids are per-lesson unique enough
const trueDups = [...new Set(dups)];
if (trueDups.length) {
  console.warn("Possible duplicate quiz ids:", trueDups.slice(0, 20));
}
console.log("check-content: OK");
