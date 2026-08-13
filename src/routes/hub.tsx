import { createFileRoute, Link } from "@tanstack/react-router";
import { CAUSAL_LABS } from "@/causal/labs";
import { labMastery, scoresFor, useCausal, worldMastery } from "@/store/causal";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/hub")({
  component: HubPage,
});

function HubPage() {
  const labs = useCausal((s) => s.labs);
  const resetLab = useCausal((s) => s.resetLab);
  const pct = worldMastery(labs);

  return (
    <div className="pb-16">
      <p className="text-xs font-medium uppercase tracking-wider text-primary">Mastery</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-fg">World 1</h1>
      <p className="mt-1 text-sm text-muted">预测 · 因果解释 · 反事实 · 迁移</p>
      <p className="mt-4 font-display text-5xl font-semibold tabular-nums text-primary">{pct}%</p>

      <ul className="mt-8 space-y-4">
        {CAUSAL_LABS.map((lab) => {
          const sc = scoresFor(lab.id, labs[lab.id]);
          return (
            <li key={lab.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <Link
                  to="/causal/$labId"
                  params={{ labId: lab.id }}
                  className="font-display text-base font-semibold text-fg no-underline hover:text-primary"
                >
                  {lab.title}
                </Link>
                <span className="font-mono text-sm text-primary">{labMastery(lab.id, labs)}%</span>
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted sm:grid-cols-4">
                <li>预测 {sc.predict.correct}/{sc.predict.total}</li>
                <li>因果 {sc.causal.correct}/{sc.causal.total}</li>
                <li>
                  消融 {sc.counterfactual.tried}/{sc.counterfactual.total}
                </li>
                <li>迁移 {sc.transfer.correct}/{sc.transfer.total}</li>
              </ul>
              <button
                type="button"
                className="mt-3 text-[11px] text-subtle hover:text-muted"
                onClick={() => resetLab(lab.id)}
              >
                重置
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8">
        <Link to="/causal/$labId" params={{ labId: "ref" }} className="no-underline">
          <Button>继续实验</Button>
        </Link>
      </div>
    </div>
  );
}
