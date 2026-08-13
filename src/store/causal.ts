import { create } from "zustand";
import { persist } from "zustand/middleware";
import { labTotals, masteryPercent, type MasteryScores } from "@/causal/engine";
import { CAUSAL_LABS, getCausalLab } from "@/causal/labs";

export type Answer = { choiceId: string; correct: boolean };

export type LabProgress = {
  /** `${sceneId}:predict|why` */
  answers: Record<string, Answer>;
  tried: string[];
  maxScene: number;
  completed: boolean;
  lastAt: number;
};

type CausalState = {
  labs: Record<string, LabProgress>;
  recordAnswer: (labId: string, key: string, choiceId: string, correct: boolean) => void;
  recordTried: (labId: string, id: string) => void;
  markScene: (labId: string, sceneIndex: number, last: boolean) => void;
  resetLab: (labId: string) => void;
};

function empty(): LabProgress {
  return { answers: {}, tried: [], maxScene: 0, completed: false, lastAt: 0 };
}

function ensure(labs: Record<string, LabProgress>, id: string): LabProgress {
  return labs[id] ?? empty();
}

export const useCausal = create<CausalState>()(
  persist(
    (set) => ({
      labs: {},
      recordAnswer: (labId, key, choiceId, correct) =>
        set((s) => {
          const cur = ensure(s.labs, labId);
          if (key in cur.answers) return s;
          return {
            labs: {
              ...s.labs,
              [labId]: {
                ...cur,
                answers: { ...cur.answers, [key]: { choiceId, correct } },
                lastAt: Date.now(),
              },
            },
          };
        }),
      recordTried: (labId, id) =>
        set((s) => {
          const cur = ensure(s.labs, labId);
          if (cur.tried.includes(id)) return s;
          return {
            labs: {
              ...s.labs,
              [labId]: { ...cur, tried: [...cur.tried, id], lastAt: Date.now() },
            },
          };
        }),
      markScene: (labId, sceneIndex, last) =>
        set((s) => {
          const cur = ensure(s.labs, labId);
          return {
            labs: {
              ...s.labs,
              [labId]: {
                ...cur,
                maxScene: Math.max(cur.maxScene, sceneIndex),
                completed: cur.completed || last,
                lastAt: Date.now(),
              },
            },
          };
        }),
      resetLab: (labId) =>
        set((s) => {
          const next = { ...s.labs };
          delete next[labId];
          return { labs: next };
        }),
    }),
    { name: "vue-causal-lab-v1", version: 2 },
  ),
);

export function scoresFor(labId: string, progress?: LabProgress): MasteryScores {
  const lab = getCausalLab(labId);
  const totals = lab
    ? labTotals(lab)
    : { predict: { total: 0 }, causal: { total: 0 }, transfer: { total: 0 }, counterfactual: { total: 0 } };
  const answers = progress?.answers ?? {};
  let predictC = 0;
  let predictN = 0;
  let causalC = 0;
  let causalN = 0;
  let transferC = 0;
  let transferN = 0;
  if (lab) {
    for (const scene of lab.scenes) {
      if (scene.prediction) {
        const k = `${scene.id}:predict`;
        if (k in answers) {
          if (scene.layer === "transfer") {
            transferN += 1;
            if (answers[k]?.correct) transferC += 1;
          } else {
            predictN += 1;
            if (answers[k]?.correct) predictC += 1;
          }
        }
      }
      if (scene.why) {
        const k = `${scene.id}:why`;
        if (k in answers) {
          causalN += 1;
          if (answers[k]?.correct) causalC += 1;
        }
      }
    }
  }
  return {
    predict: { correct: predictC, total: Math.max(predictN, totals.predict.total) },
    causal: { correct: causalC, total: Math.max(causalN, totals.causal.total) },
    counterfactual: {
      tried: progress?.tried.length ?? 0,
      total: totals.counterfactual.total,
    },
    transfer: { correct: transferC, total: Math.max(transferN, totals.transfer.total) },
  };
}

export function labMastery(labId: string, labs: Record<string, LabProgress>): number {
  return masteryPercent(scoresFor(labId, labs[labId]));
}

export function worldMastery(labs: Record<string, LabProgress>): number {
  if (!CAUSAL_LABS.length) return 0;
  const n = CAUSAL_LABS.reduce((a, l) => a + labMastery(l.id, labs), 0);
  return Math.round(n / CAUSAL_LABS.length);
}
