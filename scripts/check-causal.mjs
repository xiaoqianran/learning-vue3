/**
 * Curriculum integrity for Vue Causal Lab.
 * Loaded by check-content.mjs. Fail the build if worlds, vite prerender
 * paths, and lab files drift, or if a scene's graph / files are broken.
 */
import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sfc = require("@vue/compiler-sfc");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const labDir = path.join(root, "src/causal/labs");

function transpile(file) {
  let src = fs.readFileSync(file, "utf8");
  src = src.replace(/^import type .* from .*;\n/gm, "");
  return ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

async function loadTs(file) {
  const url = "data:text/javascript;charset=utf-8," + encodeURIComponent(transpile(file));
  return import(url);
}

function extractViteLabIds(viteSrc) {
  const start = viteSrc.indexOf("const causalLabs = [");
  const end = viteSrc.indexOf("];", start);
  if (start < 0 || end < 0) throw new Error("vite.config.ts: causalLabs array not found");
  return [...viteSrc.slice(start, end + 2).matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
}

function hasFile(files, spec) {
  const base = spec.replace(/^\.\//, "");
  const candidates = [
    spec,
    base,
    `src/${base}`,
    `${base}.ts`,
    `${base}.js`,
    `${base}.vue`,
    `src/${base}.ts`,
    `src/${base}.js`,
    `src/${base}.vue`,
  ];
  return candidates.some((c) => files[c]);
}

function checkVue(label, src) {
  if (typeof src !== "string" || !src.includes("<") || !label.endsWith(".vue")) return null;
  try {
    const d = sfc.parse(src, { filename: label });
    if (d.errors?.length) return String(d.errors[0].message || d.errors[0]);
    if (d.descriptor.script || d.descriptor.scriptSetup) {
      sfc.compileScript(d.descriptor, { id: "x" });
    }
    if (d.descriptor.template) {
      sfc.compileTemplate({
        source: d.descriptor.template.content,
        filename: label,
        id: "x",
      });
    }
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
  return null;
}

function intendsCompileError(scene) {
  const bits = [
    scene.prediction?.choices?.find((c) => c.correct)?.label,
    scene.prediction?.choices?.find((c) => c.correct)?.why,
    ...(scene.ablations ?? []).map((a) => a.expected?.message),
  ]
    .filter(Boolean)
    .join(" ");
  return /编译失败|duplicate model name/.test(bits);
}

function collectImports(src) {
  return [...String(src).matchAll(/from\s+['"]\.\/([^'"]+)['"]/g)].map((m) => m[1]);
}

export async function checkCausal() {
  const issues = [];
  const fail = (msg) => issues.push(msg);

  const worldsMod = await loadTs(path.join(root, "src/causal/worlds.ts"));
  const PROGRAM_WORLDS = worldsMod.PROGRAM_WORLDS;
  const labFiles = fs.readdirSync(labDir).filter((f) => f.endsWith(".ts") && f !== "index.ts");
  const loaded = [];
  for (const f of labFiles) {
    const mod = await loadTs(path.join(labDir, f));
    const keys = Object.keys(mod).filter((k) => k.endsWith("_LAB"));
    if (keys.length !== 1) fail(`${f} exports ${keys.join(",") || "(none)"}`);
    for (const k of keys) loaded.push({ file: f, name: k, lab: mod[k] });
  }

  const viteLabIds = extractViteLabIds(fs.readFileSync(path.join(root, "vite.config.ts"), "utf8"));
  const indexSrc = fs.readFileSync(path.join(labDir, "index.ts"), "utf8");
  const exportOrder = [...indexSrc.matchAll(/^\s+([A-Z0-9_]+)_LAB,/gm)].map((m) => m[1]);
  const exportToId = new Map(loaded.map((x) => [x.name.replace(/_LAB$/, ""), x.lab.id]));
  const causalOrder = exportOrder.map((n) => exportToId.get(n)).filter(Boolean);
  const worldIds = PROGRAM_WORLDS.flatMap((w) => w.labIds);
  const byId = new Map(loaded.map((x) => [x.lab.id, x]));

  for (const id of worldIds) if (!byId.has(id)) fail(`worlds.ts lists missing lab ${id}`);
  for (const id of viteLabIds) if (!byId.has(id)) fail(`vite causalLabs lists missing lab ${id}`);
  for (const id of byId.keys()) {
    if (!worldIds.includes(id)) fail(`lab ${id} not in PROGRAM_WORLDS.labIds`);
    if (!viteLabIds.includes(id)) fail(`lab ${id} not in vite.config causalLabs`);
  }
  if (causalOrder.join() !== worldIds.join()) {
    fail("CAUSAL_LABS order does not match PROGRAM_WORLDS.labIds");
  }

  const worldByN = new Map(PROGRAM_WORLDS.map((w) => [w.n, w]));
  const sceneIds = new Set();
  let sceneTotal = 0;

  for (const { file, lab } of loaded) {
    if (!lab?.id || !lab.scenes?.length) {
      fail(`${file} is not a CausalLab`);
      continue;
    }
    const world = worldByN.get(lab.world);
    if (!world) fail(`lab ${lab.id} world ${lab.world} missing`);
    else if (!world.labIds.includes(lab.id)) fail(`lab ${lab.id} not in world ${lab.world} labIds`);
    if (lab.official && !lab.official.startsWith("/")) fail(`lab ${lab.id} official is not a path`);

    lab.scenes.forEach((s, i) => {
      sceneTotal += 1;
      if (!s?.id) return fail(`${lab.id} scene ${i} has no id`);
      if (sceneIds.has(s.id)) fail(`duplicate scene id ${s.id}`);
      sceneIds.add(s.id);
      if (!new RegExp(`^${lab.id}-s\\d+$`).test(s.id)) fail(`scene id ${s.id} must be ${lab.id}-sN`);
      const files = s.mutation?.files ?? {};
      if (!files["src/App.vue"] && !files["src/main.js"]) fail(`${s.id} missing App.vue and main.js`);
      if (files["src/main.js"] && !/\.mount\s*\(/.test(files["src/main.js"])) {
        fail(`${s.id} main.js has no mount()`);
      }
      if (Object.values(files).some((src) => /createWebHistory/.test(String(src)))) {
        fail(`${s.id} mutation uses createWebHistory (hash only in the iframe)`);
      }
      const nodeIds = new Set((s.nodes ?? []).map((n) => n.id));
      for (const e of s.edges ?? []) {
        if (!nodeIds.has(e.from)) fail(`${s.id} edge.from ${e.from} not in nodes`);
        if (!nodeIds.has(e.to)) fail(`${s.id} edge.to ${e.to} not in nodes`);
      }
      if (s.prediction) {
        const n = (s.prediction.choices ?? []).filter((c) => c.correct).length;
        if (n !== 1) fail(`${s.id} prediction has ${n} correct choices`);
      } else if (s.layer === "predict" || s.layer === "break" || s.layer === "transfer") {
        fail(`${s.id} layer ${s.layer} needs a prediction`);
      }
      if (s.why) {
        const n = (s.why.choices ?? []).filter((c) => c.correct).length;
        if (n !== 1) fail(`${s.id} why has ${n} correct choices`);
      }
      if (!s.explanation?.headline) fail(`${s.id} missing explanation`);
      if (!s.observe) fail(`${s.id} missing observe`);

      const bags = [{ label: "mutation", files }];
      for (const a of s.ablations ?? []) {
        if (!a.files || !Object.keys(a.files).length) fail(`${s.id} ablation ${a.id} has no files`);
        if (!a.expected?.kind) fail(`${s.id} ablation ${a.id} has no expected`);
        bags.push({ label: `ablation:${a.id}`, files: a.files });
      }
      if (s.counterfactual) {
        const worlds = s.counterfactual.worlds ?? [];
        if (worlds.length !== 2) fail(`${s.id} counterfactual needs two worlds`);
        for (const w of worlds) {
          if (!w?.files || !Object.keys(w.files).length) fail(`${s.id} cf ${w?.id} has no files`);
          bags.push({ label: `cf:${w.id}`, files: w.files });
        }
      }

      const skipCompile = intendsCompileError(s);
      for (const bag of bags) {
        for (const [p, src] of Object.entries(bag.files)) {
          for (const spec of collectImports(src)) {
            if (!hasFile(bag.files, spec) && !hasFile(files, spec)) {
              fail(`${s.id} ${bag.label} imports ./${spec} but the file is missing`);
            }
          }
          if (skipCompile) continue;
          const err = checkVue(`${s.id}/${bag.label}/${p}`, src);
          if (err) fail(`${s.id} ${p}: ${err.split("\n")[0]}`);
        }
      }
    });
  }

  if (sceneTotal < 400) fail(`expected a full curriculum, got ${sceneTotal} scenes`);

  if (issues.length) {
    for (const msg of issues) console.error("check-causal:", msg);
    console.error(`check-causal: ${issues.length} issue(s)`);
    process.exit(1);
  }
  console.log(
    `check-causal: ${PROGRAM_WORLDS.length} worlds, ${loaded.length} labs, ${sceneTotal} scenes OK`,
  );
}
