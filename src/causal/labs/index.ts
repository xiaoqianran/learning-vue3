import type { CausalLab } from "../types";
import { PROGRAM_WORLDS } from "../worlds";
import { AUTH_LAB } from "./auth";
import { COMPONENT_LAB } from "./component";
import { COMPOSABLE_LAB } from "./composable";
import { COMPUTED_LAB } from "./computed";
import { CRUD_LAB } from "./crud";
import { ERROR_LAB } from "./error";
import { FETCH_LAB } from "./fetch";
import { FORM_LAB } from "./form";
import { KEEPALIVE_LAB } from "./keepalive";
import { LIST_LAB } from "./list";
import { PINIA_LAB } from "./pinia";
import { PROVIDE_LAB } from "./provide";
import { RACE_LAB } from "./race";
import { REF_LAB } from "./ref";
import { ROUTER_LAB } from "./router";
import { SLOTS_LAB } from "./slots";
import { TELEPORT_LAB } from "./teleport";
import { TRANSITION_LAB } from "./transition";
import { NEXTTICK_LAB } from "./nexttick";
import { CAPTURE_LAB } from "./capture";
import { TEST_LAB } from "./test";
import { HYDRATE_LAB } from "./hydrate";
import { ISOLATE_LAB } from "./isolate";
import { PAYLOAD_LAB } from "./payload";
import { TYPEDPROPS_LAB } from "./typedprops";
import { TYPEDEMIT_LAB } from "./typedemit";
import { INJECTKEY_LAB } from "./injectkey";
import { DEFINEMODEL_LAB } from "./definemodel";
import { MODELMOD_LAB } from "./modelmod";
import { MULTIMODEL_LAB } from "./multimodel";
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
  FETCH_LAB,
  ERROR_LAB,
  RACE_LAB,
  CRUD_LAB,
  AUTH_LAB,
  PROVIDE_LAB,
  KEEPALIVE_LAB,
  TELEPORT_LAB,
  TRANSITION_LAB,
  NEXTTICK_LAB,
  CAPTURE_LAB,
  TEST_LAB,
  HYDRATE_LAB,
  ISOLATE_LAB,
  PAYLOAD_LAB,
  TYPEDPROPS_LAB,
  TYPEDEMIT_LAB,
  INJECTKEY_LAB,
  DEFINEMODEL_LAB,
  MODELMOD_LAB,
  MULTIMODEL_LAB,
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
