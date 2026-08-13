import { createFileRoute, Link } from "@tanstack/react-router";
import { CAUSAL_LABS } from "@/causal/labs";
import { labMastery, useCausal } from "@/store/causal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const labs = useCausal((s) => s.labs);

  return (
    <div className="pb-16">
      <p className="text-xs font-medium uppercase tracking-wider text-primary">
        See Vue Think
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-fg sm:text-4xl">
        Vue — 从一个按钮生长成完整应用
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        不是 69 节课。不是敲代码。一次只改一个因果，然后立刻看见程序为什么变了。
      </p>

      <div className="mt-6">
        <Link to="/causal/$labId" params={{ labId: "ref" }} className="no-underline">
          <Button size="lg">
            从 S0 开始 · ref
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <ol className="mt-10 space-y-2">
        {CAUSAL_LABS.map((lab, i) => (
          <li key={lab.id}>
            <Link
              to="/causal/$labId"
              params={{ labId: lab.id }}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 no-underline hover:border-border-strong hover:bg-surface-2"
            >
              <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-fg">{lab.title}</span>
                <span className="block text-xs text-muted">{lab.subtitle}</span>
              </span>
              <span className="font-mono text-xs text-subtle">{lab.concept}</span>
              <span className="font-mono text-xs text-primary">{labMastery(lab.id, labs)}%</span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-xs leading-relaxed text-subtle">
        第一版只做 ref → computed → watch。World 2 以后（组件、路由、Pinia）还没长出来。
      </p>
    </div>
  );
}
