import type { CausalLab } from "../types";
import { COMPUTED_LAB } from "./computed";
import { REF_LAB } from "./ref";
import { WATCH_LAB } from "./watch";

export const CAUSAL_LABS: CausalLab[] = [REF_LAB, COMPUTED_LAB, WATCH_LAB];

export function getCausalLab(id: string): CausalLab | undefined {
  return CAUSAL_LABS.find((l) => l.id === id);
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
