import { cn } from "@/lib/utils";
import type { Counterfactual, CounterfactualWorld } from "@/causal/types";
import { VueCausalPreview } from "./VueCausalPreview";
import { RuntimeXRay } from "./RuntimeXRay";

type Props = {
  spec: Counterfactual;
  showTwist: boolean;
  onTwist: () => void;
  selected?: string | null;
  onSelect: (s: string) => void;
};

export function CounterfactualView({ spec, showTwist, onTwist, selected, onSelect }: Props) {
  const worlds = showTwist && spec.twist ? spec.twist.worlds : spec.worlds;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-3 py-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
          Counterfactual Branch
        </p>
        <p className="mt-0.5 text-sm text-fg">{spec.title}</p>
        <p className="text-xs text-muted">{showTwist && spec.twist ? spec.twist.body : spec.setup}</p>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        {worlds.map((w) => (
          <WorldPane key={w.id + w.name} world={w} selected={selected} onSelect={onSelect} />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
        <p className="text-xs leading-relaxed text-muted">{spec.punchline}</p>
        {spec.twist && !showTwist ? (
          <button
            type="button"
            onClick={onTwist}
            className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-fg"
          >
            {spec.twist.title}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function WorldPane({
  world,
  selected,
  onSelect,
}: {
  world: CounterfactualWorld;
  selected?: string | null;
  onSelect: (s: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
        <span className="font-display text-sm font-semibold text-fg">{world.name}</span>
        <span className="text-[11px] text-muted">{world.tagline}</span>
      </div>
      <div className="grid min-h-0 flex-1 grid-rows-2">
        <VueCausalPreview code={world.files["src/App.vue"] ?? ""} label={world.name} />
        <div className={cn("min-h-0 border-t border-border")}>
          <RuntimeXRay
            nodes={world.nodes}
            edges={world.edges}
            observe={{ state: [], dom: [], events: [] }}
            selected={selected}
            onSelect={onSelect}
          />
        </div>
      </div>
      <p className="border-t border-border px-3 py-1.5 text-[11px] leading-relaxed text-muted">
        {world.note}
      </p>
    </div>
  );
}
