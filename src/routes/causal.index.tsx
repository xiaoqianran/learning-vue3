import { createFileRoute, Link } from "@tanstack/react-router";
import { useCausal } from "@/store/causal";
import { Button } from "@/components/ui/button";
import { WorldCatalog } from "@/components/causal/LabCard";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/causal/")({
  component: CausalWorldPage,
  head: () => ({
    meta: [{ title: "Worlds · Vue Causal Lab" }],
  }),
});

function CausalWorldPage() {
  const labs = useCausal((s) => s.labs);

  return (
    <div className="causal-pane-in pb-16">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Curriculum</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg">
        从一个按钮，到样式的边界
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        每个世界只长一层机制。拖动时间轴。一次只发生一个因果变更。
      </p>

      <WorldCatalog progress={labs} />

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
