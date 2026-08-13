import { createFileRoute, Link } from "@tanstack/react-router";
import { CAUSAL_LABS } from "@/causal/labs";
import { labMastery, useCausal } from "@/store/causal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/causal")({
  component: CausalWorldPage,
});

function CausalWorldPage() {
  const labs = useCausal((s) => s.labs);

  return (
    <div className="pb-16">
      <p className="text-xs font-medium uppercase tracking-wider text-primary">World 1</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg">
        一个按钮活起来
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        拖动时间轴。一次只发生一个因果变更。
      </p>

      <ol className="mt-8 space-y-3">
        {CAUSAL_LABS.map((lab, i) => (
          <li key={lab.id}>
            <Link
              to="/causal/$labId"
              params={{ labId: lab.id }}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 no-underline hover:border-border-strong hover:bg-surface-2"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-soft font-mono text-sm text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-display text-base font-semibold text-fg">{lab.title}</span>
                <span className="mt-0.5 block text-sm text-muted">{lab.subtitle}</span>
              </span>
              <span className="font-mono text-xs text-primary">{labMastery(lab.id, labs)}%</span>
            </Link>
          </li>
        ))}
      </ol>

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
