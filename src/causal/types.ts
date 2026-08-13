/** Causal Vue — deterministic Scene curriculum */

export type Files = Record<string, string>;

export type Layer = "see" | "predict" | "explain" | "break" | "transfer";

export type PredictionChoice = {
  id: string;
  label: string;
  correct: boolean;
  why: string;
};

export type Prediction = {
  question: string;
  choices: PredictionChoice[];
};

export type SemanticBlock = {
  id: string;
  label: string;
};

export type Mutation = {
  /** Full files AFTER this causal change. Source of truth for the runtime. */
  files: Files;
  blocks: SemanticBlock[];
  narration: string;
};

export type Probe = {
  id: string;
  label: string;
  value: string;
  /** Maps this probe to a source token (e.g. "count") */
  symbol?: string;
};

export type Observe = {
  state: Probe[];
  dom: Probe[];
  events: Probe[];
};

export type NodeKind =
  | "event"
  | "ref"
  | "computed"
  | "watch"
  | "render"
  | "dom"
  | "script"
  | "effect"
  | "component"
  | "composable"
  | "store"
  | "route";

export type CausalNode = {
  id: string;
  kind: NodeKind;
  label: string;
  detail?: string;
  symbol?: string;
};

export type CausalEdge = {
  from: string;
  to: string;
  label?: string;
};

export type ReplayStep = {
  caption: string;
  highlight: string[];
  state?: { id: string; from: string; to: string };
  event?: string;
};

export type Replay = {
  label: string;
  steps: ReplayStep[];
};

export type Ablation = {
  id: string;
  prompt: string;
  files: Files;
  expected: {
    kind: "error" | "stale" | "crash";
    message: string;
  };
  lesson: string;
};

export type CounterfactualWorld = {
  id: string;
  name: string;
  tagline: string;
  files: Files;
  nodes: CausalNode[];
  edges: CausalEdge[];
  note: string;
};

export type Counterfactual = {
  id: string;
  title: string;
  setup: string;
  worlds: [CounterfactualWorld, CounterfactualWorld];
  punchline: string;
  /** Extra beat after both worlds look the same */
  twist?: {
    title: string;
    body: string;
    worlds: [CounterfactualWorld, CounterfactualWorld];
  };
};

export type Mapping = {
  code: string;
  runtime: string;
  ui: string;
};

export type Faq = {
  q: string;
  a: string;
};

export type Scene = {
  id: string;
  /** Short timeline label: S0 / ref / click */
  tick: string;
  title: string;
  goal: string;
  layer: Layer;
  fading: 1 | 2 | 3 | 4 | 5;
  prediction?: Prediction;
  /** Optional second check: "why did that happen?" */
  why?: Prediction;
  mutation: Mutation;
  replay?: Replay;
  observe: Observe;
  nodes: CausalNode[];
  edges: CausalEdge[];
  ablations?: Ablation[];
  counterfactual?: Counterfactual;
  explanation: {
    headline: string;
    body: string;
  };
  /** What to actually do in the live preview this beat. */
  tryThis?: string;
  faqs?: Faq[];
  mapping?: Mapping[];
};

export type CausalLab = {
  id: string;
  world: number;
  concept: string;
  title: string;
  subtitle: string;
  promise: string;
  minutes: number;
  official?: string;
  scenes: Scene[];
};

export type WorldStatus = "ready" | "soon";

export type ProgramWorld = {
  id: string;
  n: number;
  title: string;
  blurb: string;
  status: WorldStatus;
  labIds: string[];
  topics: string[];
};
