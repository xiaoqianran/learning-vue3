import { createFileRoute, Link } from "@tanstack/react-router";
import { CAUSAL_LABS } from "@/causal/labs";
import { labMastery, useCausal } from "@/store/causal";
import { Button } from "@/components/ui/button";
import { LabCard } from "@/components/causal/LabCard";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/causal/")({
  component: CausalWorldPage,
  head: () => ({
    meta: [{ title: "World 1 · Vue Causal Lab" }],
  }),
});

function CausalWorldPage() {
  const labs = useCausal((s) => s.labs);

  return (
    <div className="causal-pane-in pb-16">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">World 1</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg">
        一个按钮活起来
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        拖动时间轴。一次只发生一个因果变更。格子之间的分隔线可以拉。
      </p>

      <ol className="mt-8 space-y-2.5">
        {CAUSAL_LABS.map((lab, i) => (
          <li key={lab.id}>
            <LabCard lab={lab} index={i} mastery={labMastery(lab.id, labs)} />
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
