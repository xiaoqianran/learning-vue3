import { createFileRoute, Link } from "@tanstack/react-router";
import { CAUSAL_LABS } from "@/causal/labs";
import { PROGRAM_WORLDS } from "@/causal/worlds";
import { labMastery, useCausal, worldMastery } from "@/store/causal";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock } from "lucide-react";

export const Route = createFileRoute("/causal")({
  component: CausalWorldPage,
});

function CausalWorldPage() {
  const labsState = useCausal((s) => s.labs);
  const overall = worldMastery(labsState);
  const w1 = PROGRAM_WORLDS[0]!;

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <p className="text-xs font-medium uppercase tracking-wider text-primary">
        World {w1.n} · Causal Lab
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg">
        {w1.title}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        不是一节课一篇文章。是一串可执行的程序状态。你拖动时间轴，看一个按钮如何长出状态、依赖和界面——一次只发生一个因果变更。
      </p>
      <p className="mt-3 font-mono text-xs text-subtle">World 1 掌握 {overall}%</p>

      <ol className="mt-8 space-y-3">
        {CAUSAL_LABS.map((lab, i) => {
          const m = labMastery(lab.id, labsState);
          const done = labsState[lab.id]?.completed;
          return (
            <li key={lab.id}>
              <Link
                to="/causal/$labId"
                params={{ labId: lab.id }}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 no-underline transition-colors hover:border-border-strong hover:bg-surface-2"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-soft font-mono text-sm text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-semibold text-fg">
                      {lab.title}
                    </span>
                    <span className="rounded-full bg-surface-3 px-2 py-0.5 font-mono text-[10px] text-muted">
                      {lab.concept}
                    </span>
                    {done ? (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                        已走完
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">{lab.subtitle}</span>
                  <span className="mt-1 block text-xs text-subtle">{lab.promise}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-xs tabular-nums text-primary">{m}%</span>
                  <span className="text-[10px] text-subtle">{lab.minutes} 分</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-fg">后面的世界</h2>
        <p className="mt-1 text-sm text-muted">
          第一版只把 ref → computed → watch 做到极致。其余世界仍以资料库课节对照。
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {PROGRAM_WORLDS.slice(1).map((w) => (
            <li
              key={w.id}
              className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-3"
            >
              <p className="flex items-center gap-1.5 text-sm font-medium text-muted">
                <Lock className="h-3.5 w-3.5" />
                World {w.n} · {w.title}
              </p>
              <p className="mt-0.5 text-xs text-subtle">{w.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8">
        <Link to="/causal/$labId" params={{ labId: "ref" }} className="no-underline">
          <Button size="lg">
            从 S0 开始
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
