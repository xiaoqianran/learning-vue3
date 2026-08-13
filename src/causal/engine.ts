import type { CausalLab, Files, Scene } from "./types";

export function sceneAt(lab: CausalLab, index: number): Scene {
  const s = lab.scenes[index];
  if (!s) throw new Error(`Scene ${index} missing in lab ${lab.id}`);
  return s;
}

/** Files visible BEFORE the current scene's mutation (previous scene's after-state). */
export function filesBefore(lab: CausalLab, index: number): Files {
  if (index <= 0) return lab.scenes[0]?.mutation.files ?? { "src/App.vue": "" };
  return lab.scenes[index - 1]!.mutation.files;
}

export function filesAfter(lab: CausalLab, index: number): Files {
  return sceneAt(lab, index).mutation.files;
}

export function appVue(files: Files): string {
  return files["src/App.vue"] ?? files["App.vue"] ?? Object.values(files)[0] ?? "";
}

export type MasteryScores = {
  predict: { correct: number; total: number };
  causal: { correct: number; total: number };
  counterfactual: { tried: number; total: number };
  transfer: { correct: number; total: number };
};

export function labTotals(lab: CausalLab): Pick<MasteryScores, "predict" | "causal" | "transfer"> & {
  counterfactual: { total: number };
} {
  let predict = 0;
  let causal = 0;
  let transfer = 0;
  let counterfactual = 0;
  for (const s of lab.scenes) {
    if (s.prediction) {
      if (s.layer === "transfer") transfer += 1;
      else predict += 1;
    }
    if (s.why) causal += 1;
    counterfactual += (s.ablations?.length ?? 0) + (s.counterfactual ? 1 : 0);
  }
  return {
    predict: { correct: 0, total: predict },
    causal: { correct: 0, total: causal },
    transfer: { correct: 0, total: transfer },
    counterfactual: { total: counterfactual },
  };
}

export function masteryPercent(s: MasteryScores): number {
  const parts: number[] = [];
  if (s.predict.total) parts.push(s.predict.correct / s.predict.total);
  if (s.causal.total) parts.push(s.causal.correct / s.causal.total);
  if (s.counterfactual.total) parts.push(Math.min(1, s.counterfactual.tried / s.counterfactual.total));
  if (s.transfer.total) parts.push(s.transfer.correct / s.transfer.total);
  if (!parts.length) return 0;
  return Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100);
}
