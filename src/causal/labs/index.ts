import type { CausalLab } from "../types";
import { PROGRAM_WORLDS } from "../worlds";
import { COMPONENT_LAB } from "./component";
import { COMPOSABLE_LAB } from "./composable";
import { COMPUTED_LAB } from "./computed";
import { FORM_LAB } from "./form";
import { LIST_LAB } from "./list";
import { PINIA_LAB } from "./pinia";
import { REF_LAB } from "./ref";
import { ROUTER_LAB } from "./router";
import { SLOTS_LAB } from "./slots";
import { WATCH_LAB } from "./watch";

export const CAUSAL_LABS: CausalLab[] = [
  REF_LAB,
  COMPUTED_LAB,
  WATCH_LAB,
  LIST_LAB,
  FORM_LAB,
  COMPONENT_LAB,
  SLOTS_LAB,
  COMPOSABLE_LAB,
  PINIA_LAB,
  ROUTER_LAB,
];

export function getCausalLab(id: string): CausalLab | undefined {
  return CAUSAL_LABS.find((l) => l.id === id);
}

export function labsForWorld(n: number): CausalLab[] {
  return CAUSAL_LABS.filter((l) => l.world === n);
}

export function nextLab(id: string): CausalLab | undefined {
  const i = CAUSAL_LABS.findIndex((l) => l.id === id);
  if (i < 0) return undefined;
  return CAUSAL_LABS[i + 1];
}

export function prevLab(id: string): CausalLab | undefined {
  const i = CAUSAL_LABS.findIndex((l) => l.id === id);
  if (i <= 0) return undefined;
  return CAUSAL_LABS[i - 1];
}

export function worldOfLab(id: string) {
  const lab = getCausalLab(id);
  if (!lab) return undefined;
  return PROGRAM_WORLDS.find((w) => w.n === lab.world);
}
