import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type {
  Ablation,
  Faq,
  Mapping,
  Prediction,
  Scene,
} from "@/causal/types";
import { ChevronRight, FlaskConical, GitCompare, HelpCircle } from "lucide-react";

type Props = {
  scene: Scene;
  waiting: boolean;
  onPredict: (choiceId: string) => void;
  lastChoice?: { id: string; correct: boolean } | null;
  whyChoice?: { id: string; correct: boolean } | null;
  onWhy: (choiceId: string) => void;
  ablationId: string | null;
  onAblate: (a: Ablation | null) => void;
  onOpenCounterfactual: () => void;
  cfOpen: boolean;
  onContinue: () => void;
  canContinue: boolean;
  isLast: boolean;
  replayLabel?: string;
  onReplay?: () => void;
  replaying?: boolean;
};

export function NarrativePanel({
  scene,
  waiting,
  onPredict,
  lastChoice,
  whyChoice,
  onWhy,
  ablationId,
  onAblate,
  onOpenCounterfactual,
  cfOpen,
  onContinue,
  canContinue,
  isLast,
  replayLabel: _replayLabel,
  onReplay,
  replaying,
}: Props) {
  const [faq, setFaq] = useState<string | null>(null);
  const layerLabel =
    scene.layer === "see"
      ? "SEE 看变化"
      : scene.layer === "predict"
        ? "PREDICT 先预测"
        : scene.layer === "explain"
          ? "EXPLAIN 解释为什么"
          : scene.layer === "break"
            ? "BREAK 拆开它"
            : "TRANSFER 换场景";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
          AI Narrative
        </p>
        <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] text-muted">
          {layerLabel}
        </span>
      </div>
      <div className="scrollbar-thin min-h-0 flex-1 space-y-3 overflow-auto p-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-subtle">这一镜的需求</p>
          <p className="mt-1 text-sm leading-relaxed text-fg">{scene.goal}</p>
        </div>

        {waiting && scene.prediction ? (
          <ChoiceCard
            title="先预测，再改代码"
            spec={scene.prediction}
            picked={lastChoice?.id ?? null}
            onPick={onPredict}
          />
        ) : (
          <>
            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <p className="font-display text-sm font-semibold text-fg">
                {scene.explanation.headline}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                {scene.mutation.narration}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-fg/90">
                {scene.explanation.body}
              </p>
            </div>

            {lastChoice && scene.prediction ? (
              <p
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs",
                  lastChoice.correct
                    ? "bg-green/10 text-green"
                    : "bg-peach/10 text-peach",
                )}
              >
                {lastChoice.correct ? "预测正确。" : "预测和运行结果不一致——这正是要校准的心智模型。"}{" "}
                {scene.prediction.choices.find((c) => c.id === lastChoice.id)?.why}
              </p>
            ) : null}

            {scene.mapping?.length ? <MappingList items={scene.mapping} /> : null}

            {scene.why && (
              <ChoiceCard
                title="为什么？"
                spec={scene.why}
                picked={whyChoice?.id ?? null}
                onPick={onWhy}
              />
            )}

            {scene.replay && onReplay ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={onReplay}
                disabled={replaying}
              >
                {replaying ? "重放中…" : scene.replay.label}
              </Button>
            ) : null}

            {scene.ablations?.length ? (
              <div>
                <p className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-subtle">
                  <FlaskConical className="h-3 w-3" />
                  Code Ablation
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {scene.ablations.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onAblate(ablationId === a.id ? null : a)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs",
                        ablationId === a.id
                          ? "border-peach/50 bg-peach/15 text-peach"
                          : "border-border bg-surface-3 text-muted hover:text-fg",
                      )}
                    >
                      {a.prompt}
                    </button>
                  ))}
                  {ablationId ? (
                    <button
                      type="button"
                      onClick={() => onAblate(null)}
                      className="rounded-full px-2.5 py-1 text-xs text-primary hover:underline"
                    >
                      恢复
                    </button>
                  ) : null}
                </div>
                {ablationId
                  ? (() => {
                      const a = scene.ablations!.find((x) => x.id === ablationId);
                      if (!a) return null;
                      return (
                        <div className="mt-2 rounded-md border border-peach/30 bg-peach/10 p-2.5 text-xs leading-relaxed text-fg">
                          <p className="font-mono text-peach">{a.expected.message}</p>
                          <p className="mt-1 text-muted">{a.lesson}</p>
                        </div>
                      );
                    })()
                  : null}
              </div>
            ) : null}

            {scene.counterfactual ? (
              <button
                type="button"
                onClick={onOpenCounterfactual}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm",
                  cfOpen
                    ? "border-primary/40 bg-primary-soft text-primary"
                    : "border-border bg-surface-2 text-fg hover:border-border-strong",
                )}
              >
                <GitCompare className="h-4 w-4 shrink-0" />
                <span>
                  <span className="block font-medium">{scene.counterfactual.title}</span>
                  <span className="block text-[11px] text-muted">
                    {cfOpen ? "正在并排两个世界" : "打开反事实分支"}
                  </span>
                </span>
              </button>
            ) : null}

            {scene.faqs?.length ? (
              <FaqList faqs={scene.faqs} open={faq} onOpen={setFaq} />
            ) : null}
          </>
        )}
      </div>
      <div className="border-t border-border p-3">
        <Button className="w-full" onClick={onContinue} disabled={!canContinue}>
          {waiting ? "先做出预测" : !canContinue ? "代码写入中…" : isLast ? "完成本实验" : "继续下一镜"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ChoiceCard({
  title,
  spec,
  picked,
  onPick,
}: {
  title: string;
  spec: Prediction;
  picked: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-primary/25 bg-primary-soft/40 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-primary">{title}</p>
      <p className="mt-1 text-sm font-medium text-fg">{spec.question}</p>
      <ul className="mt-2 space-y-1.5">
        {spec.choices.map((c) => {
          const on = picked === c.id;
          const shown = picked !== null;
          return (
            <li key={c.id}>
              <button
                type="button"
                disabled={picked !== null}
                onClick={() => onPick(c.id)}
                className={cn(
                  "w-full rounded-md border px-2.5 py-2 text-left text-[13px] leading-snug",
                  on && c.correct && "border-green/40 bg-green/10 text-green",
                  on && !c.correct && "border-peach/40 bg-peach/10 text-peach",
                  !on && shown && c.correct && "border-green/30 text-green",
                  !on && !shown && "border-border bg-surface text-fg hover:border-border-strong",
                  !on && shown && !c.correct && "border-border text-muted",
                )}
              >
                {c.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MappingList({ items }: { items: Mapping[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="grid grid-cols-3 border-b border-border bg-surface-3 px-2 py-1 text-[9px] uppercase tracking-wider text-subtle">
        <span>Code</span>
        <span>Runtime</span>
        <span>UI</span>
      </div>
      {items.map((m) => (
        <div
          key={m.code}
          className="grid grid-cols-3 gap-1 border-b border-border px-2 py-1.5 font-mono text-[10px] last:border-0"
        >
          <span className="text-sapphire">{m.code}</span>
          <span className="text-muted">{m.runtime}</span>
          <span>{m.ui}</span>
        </div>
      ))}
    </div>
  );
}

function FaqList({
  faqs,
  open,
  onOpen,
}: {
  faqs: Faq[];
  open: string | null;
  onOpen: (q: string | null) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-subtle">
        <HelpCircle className="h-3 w-3" />
        问这一镜
      </p>
      <ul className="space-y-1">
        {faqs.map((f) => {
          const on = open === f.q;
          return (
            <li key={f.q}>
              <button
                type="button"
                onClick={() => onOpen(on ? null : f.q)}
                className="w-full rounded-md px-2 py-1.5 text-left text-xs text-primary hover:bg-surface-2"
              >
                {f.q}
              </button>
              {on ? <p className="px-2 pb-2 text-xs leading-relaxed text-muted">{f.a}</p> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
