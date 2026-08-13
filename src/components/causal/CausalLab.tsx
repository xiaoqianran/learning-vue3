import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { filesAfter, filesBefore, mutatedSource } from "@/causal/engine";
import type { Ablation, CausalLab as Lab, Files, ReplayStep } from "@/causal/types";
import { labMastery, scoresFor, useCausal } from "@/store/causal";
import { CodeEvolution } from "./CodeEvolution";
import { CounterfactualView } from "./CounterfactualView";
import { NarrativePanel } from "./NarrativePanel";
import { RuntimeXRay } from "./RuntimeXRay";
import { TimeMachine } from "./TimeMachine";
import { CausalWorkspace } from "./CausalWorkspace";
import { VueCausalPreview } from "./VueCausalPreview";
import { useCodeWrite } from "./useCodeWrite";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { nextLab } from "@/causal/labs";
import { cn } from "@/lib/utils";

type Props = { lab: Lab };

export function CausalLab({ lab }: Props) {
  const progress = useCausal((s) => s.labs[lab.id]);
  const recordAnswer = useCausal((s) => s.recordAnswer);
  const recordTried = useCausal((s) => s.recordTried);
  const markScene = useCausal((s) => s.markScene);
  const resetLab = useCausal((s) => s.resetLab);

  const [index, setIndex] = useState(0);
  const [ablation, setAblation] = useState<Ablation | null>(null);
  const [cfOpen, setCfOpen] = useState(false);
  const [cfTwist, setCfTwist] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [replay, setReplay] = useState<ReplayStep | null>(null);
  const [replaying, setReplaying] = useState(false);
  const [done, setDone] = useState(false);

  const scene = lab.scenes[index]!;
  const predictKey = `${scene.id}:predict`;
  const whyKey = `${scene.id}:why`;
  const predictAnswer = progress?.answers[predictKey];
  const whyAnswer = progress?.answers[whyKey];
  const waiting = Boolean(scene.prediction) && !predictAnswer;

  const beforeFiles = filesBefore(lab, index);
  const afterFiles = filesAfter(lab, index);
  const mutated = useMemo(
    () => mutatedSource(beforeFiles, afterFiles),
    [beforeFiles, afterFiles],
  );
  const labels = useMemo(() => scene.mutation.blocks.map((b) => b.label), [scene]);
  const write = useCodeWrite({
    sceneId: scene.id,
    waiting,
    before: mutated.before,
    after: mutated.after,
    labels,
  });
  const liveFiles: Files =
    ablation?.files ?? (waiting || !write.previewLive ? beforeFiles : afterFiles);

  const clickable = useMemo(() => {
    const s = new Set<string>([
      "ref",
      "computed",
      "watch",
      "immediate",
      "v-for",
      "v-model",
      "defineProps",
      "defineEmits",
      "useTodos",
      "defineStore",
      "createPinia",
      "RouterView",
      "RouterLink",
      "onMounted",
      "loading",
      "AbortController",
      "provide",
      "inject",
      "addTodo",
      "token",
      "KeepAlive",
      "Teleport",
      "Transition",
      "nextTick",
      "onErrorCaptured",
      "addItem",
      "PAYLOAD",
      "createSession",
      "createCart",
      "SERVER",
      "Date",
      "window",
      "withDefaults",
      "InjectionKey",
      "Symbol",
      "defineModel",
      "modelValue",
      "modelModifiers",
      "shallowRef",
      "triggerRef",
      "shallowReactive",
      "markRaw",
      "toRaw",
      "customRef",
      "$attrs",
      "inheritAttrs",
      "defineExpose",
      "defineOptions",
    ]);
    for (const n of scene.nodes) if (n.symbol) s.add(n.symbol);
    for (const p of [...scene.observe.state, ...scene.observe.dom, ...scene.observe.events]) {
      if (p.symbol) s.add(p.symbol);
    }
    return [...s];
  }, [scene]);

  const maxReached = Math.max(progress?.maxScene ?? 0, index);

  useEffect(() => {
    setAblation(null);
    setCfOpen(false);
    setCfTwist(false);
    setReplay(null);
    setSelected(null);
    markScene(lab.id, index, false);
  }, [lab.id, index, scene.id, markScene]);

  const runReplay = useCallback(() => {
    const steps = scene.replay?.steps;
    if (!steps?.length) return;
    setReplaying(true);
    let i = 0;
    setReplay(steps[0]!);
    const id = window.setInterval(() => {
      i += 1;
      if (i >= steps.length) {
        window.clearInterval(id);
        setReplaying(false);
        return;
      }
      setReplay(steps[i]!);
    }, 850);
  }, [scene]);

  function pickPredict(choiceId: string) {
    const choice = scene.prediction?.choices.find((c) => c.id === choiceId);
    if (!choice) return;
    recordAnswer(lab.id, predictKey, choice.id, choice.correct);
  }

  function pickWhy(choiceId: string) {
    const choice = scene.why?.choices.find((c) => c.id === choiceId);
    if (!choice) return;
    recordAnswer(lab.id, whyKey, choice.id, choice.correct);
  }

  function go(i: number) {
    if (i < 0 || i >= lab.scenes.length) return;
    if (i > maxReached && waiting) return;
    if (i > index && waiting) return;
    if (i > index && write.writing) return;
    setIndex(i);
  }

  function cont() {
    if (waiting || write.writing) return;
    if (index >= lab.scenes.length - 1) {
      markScene(lab.id, index, true);
      setDone(true);
      return;
    }
    setIndex(index + 1);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "ArrowRight" && !waiting && !write.writing) go(index + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, waiting, maxReached, write.writing]);

  const labsMap = useCausal((s) => s.labs);
  const scores = scoresFor(lab.id, progress);
  const mastery = labMastery(lab.id, labsMap);
  const nxt = nextLab(lab.id);

  if (done) {
    return (
      <FinishCard
        lab={lab}
        mastery={mastery}
        scores={scores}
        nextId={nxt?.id}
        onReplay={() => {
          setDone(false);
          setIndex(0);
        }}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {cfOpen && scene.counterfactual && !waiting ? (
          <CounterfactualView
            spec={scene.counterfactual}
            showTwist={cfTwist}
            onTwist={() => {
              setCfTwist(true);
              recordTried(lab.id, `${scene.counterfactual!.id}:twist`);
            }}
            onClose={() => setCfOpen(false)}
            selected={selected}
            onSelect={setSelected}
          />
        ) : (
          <CausalWorkspace
            code={
              <CodeEvolution
                before={mutated.before}
                after={mutated.after}
                filePath={mutated.path}
                blocks={scene.mutation.blocks}
                write={{ ...write, phase: waiting ? "before" : write.phase }}
                selected={selected}
                onSelect={setSelected}
                clickable={clickable}
                waiting={waiting}
              />
            }
            live={
              <VueCausalPreview
                key={lab.id}
                files={liveFiles}
                label={ablation ? `消融 · ${ablation.prompt}` : "实时应用"}
              />
            }
            xray={
              <div key={scene.id} className="causal-pane-in flex h-full min-h-0 flex-col">
                <RuntimeXRay
                  nodes={scene.nodes}
                  edges={scene.edges}
                  observe={scene.observe}
                  selected={selected}
                  onSelect={setSelected}
                  replay={replay}
                  flash={replay?.state ?? null}
                />
              </div>
            }
            narrative={
              <div key={scene.id} className="causal-pane-in flex h-full min-h-0 flex-col">
                <NarrativePanel
                  scene={scene}
                  waiting={waiting}
                  onPredict={pickPredict}
                  lastChoice={
                    predictAnswer
                      ? { id: predictAnswer.choiceId, correct: predictAnswer.correct }
                      : null
                  }
                  whyChoice={
                    whyAnswer ? { id: whyAnswer.choiceId, correct: whyAnswer.correct } : null
                  }
                  onWhy={pickWhy}
                  ablationId={ablation?.id ?? null}
                  onAblate={(a) => {
                    setAblation(a);
                    setCfOpen(false);
                    if (a) recordTried(lab.id, a.id);
                  }}
                  onOpenCounterfactual={() => {
                    const next = !cfOpen;
                    setCfOpen(next);
                    setAblation(null);
                    if (next && scene.counterfactual) recordTried(lab.id, scene.counterfactual.id);
                  }}
                  cfOpen={cfOpen}
                  onContinue={cont}
                  canContinue={!waiting && !write.writing}
                  isLast={index === lab.scenes.length - 1}
                  replayLabel={scene.replay?.label}
                  onReplay={scene.replay ? runReplay : undefined}
                  replaying={replaying}
                />
              </div>
            }
          />
        )}
      </div>

      <div className="shrink-0">
        <TimeMachine
          scenes={lab.scenes}
          index={index}
          maxReached={maxReached}
          onGo={go}
          onReset={() => {
            resetLab(lab.id);
            setIndex(0);
            setDone(false);
          }}
        />
      </div>
    </div>
  );
}

function FinishCard({
  lab,
  mastery,
  scores,
  nextId,
  onReplay,
}: {
  lab: Lab;
  mastery: number;
  scores: ReturnType<typeof scoresFor>;
  nextId?: string;
  onReplay: () => void;
}) {
  return (
    <div className="causal-pane-in mx-auto flex max-w-lg flex-1 flex-col justify-center px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wider text-primary">Mastery</p>
      <h2 className="mt-1 font-display text-2xl font-semibold text-fg">{lab.title}</h2>
      <p className="mt-2 text-sm text-muted">{lab.promise}</p>
      <p className="mt-6 font-display text-5xl font-semibold tabular-nums text-primary">{mastery}%</p>
      <ul className="mt-6 space-y-2 text-sm">
        <Row label="预测能力" s={scores.predict} />
        <Row label="因果解释" s={scores.causal} />
        <Row label="反事实 / 消融" s={{ correct: scores.counterfactual.tried, total: scores.counterfactual.total }} />
        <Row label="新场景迁移" s={scores.transfer} />
      </ul>
      <div className="mt-8 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onReplay}>
          再走一遍时间轴
        </Button>
        {nextId ? (
          <Link to="/causal/$labId" params={{ labId: nextId }} className="no-underline">
            <Button>
              下一实验
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link to="/causal" className="no-underline">
            <Button>回到 World 1</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function Row({ label, s }: { label: string; s: { correct: number; total: number } }) {
  const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
  return (
    <li>
      <div className="flex justify-between text-muted">
        <span>{label}</span>
        <span className="font-mono text-fg">
          {s.correct} / {s.total}
        </span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-3">
        <div className={cn("h-full bg-primary")} style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}
