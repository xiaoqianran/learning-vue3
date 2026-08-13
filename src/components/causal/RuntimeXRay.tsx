import { cn } from "@/lib/utils";
import type { CausalEdge, CausalNode, Observe, ReplayStep } from "@/causal/types";
import { PaneHeader } from "./PaneHeader";

const KIND_COLOR: Record<CausalNode["kind"], string> = {
  event: "border-peach/50 bg-peach/10 text-peach",
  ref: "border-green/50 bg-green/10 text-green",
  computed: "border-sapphire/50 bg-sapphire/10 text-sapphire",
  watch: "border-yellow/50 bg-yellow/10 text-yellow",
  render: "border-lavender/50 bg-lavender/10 text-lavender",
  dom: "border-blue/50 bg-blue/10 text-blue",
  script: "border-overlay1 bg-surface-3 text-muted",
  effect: "border-mauve/50 bg-mauve/10 text-mauve",
  component: "border-teal/50 bg-teal/10 text-teal",
  composable: "border-mauve/50 bg-mauve/10 text-mauve",
  store: "border-yellow/50 bg-yellow/10 text-yellow",
  route: "border-lavender/50 bg-lavender/10 text-lavender",
};

type Props = {
  nodes: CausalNode[];
  edges: CausalEdge[];
  observe: Observe;
  selected?: string | null;
  onSelect: (symbol: string) => void;
  replay?: ReplayStep | null;
  flash?: { id: string; from: string; to: string } | null;
};

export function RuntimeXRay({
  nodes,
  edges,
  observe,
  selected,
  onSelect,
  replay,
  flash,
}: Props) {
  const lit = new Set(replay?.highlight ?? []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PaneHeader kicker="运行时透视" meta="因果显微镜" />
      <div className="scrollbar-thin min-h-0 flex-1 overflow-auto p-3">
        {replay?.caption ? (
          <p className="mb-3 rounded-md border border-primary/30 bg-primary-soft px-2.5 py-1.5 font-mono text-xs text-primary">
            {replay.caption}
          </p>
        ) : null}

        <div className="flex flex-col items-stretch gap-0">
          {nodes.map((node, i) => {
            const incoming = edges.filter((e) => e.to === node.id);
            const on =
              lit.has(node.id) ||
              (selected && (node.symbol === selected || node.label === selected));
            return (
              <div key={node.id} className="flex flex-col items-center">
                {i > 0 ? (
                  <div className="flex flex-col items-center py-0.5">
                    {incoming[0]?.label ? (
                      <span className="text-[9px] uppercase tracking-wide text-subtle">
                        {incoming[0].label}
                      </span>
                    ) : null}
                    <span className={cn("h-4 w-px bg-border-strong", on && "bg-primary")} />
                    <span className="text-[10px] text-subtle">↓</span>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => node.symbol && onSelect(node.symbol)}
                  className={cn(
                    "w-full max-w-xs rounded-lg border px-3 py-2 text-left transition-[box-shadow,transform,border-color] duration-200 ease-out",
                    KIND_COLOR[node.kind],
                    on && "scale-[1.01] ring-2 ring-primary/70",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider opacity-70">
                      {node.kind}
                    </span>
                    {flash && flash.id === (node.symbol || node.id) ? (
                      <span className="font-mono text-[10px]">
                        {flash.from} → {flash.to}
                      </span>
                    ) : null}
                  </div>
                  <p className="font-mono text-sm font-medium">{node.label}</p>
                  {node.detail ? (
                    <p className="mt-0.5 font-mono text-[11px] opacity-80">{node.detail}</p>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <ProbeList title="STATE" items={observe.state} selected={selected} flash={flash} />
          <ProbeList title="DOM" items={observe.dom} selected={selected} flash={flash} />
          <ProbeList title="EVENT" items={observe.events} selected={selected} flash={flash} />
        </div>
      </div>
    </div>
  );
}

function ProbeList({
  title,
  items,
  selected,
  flash,
}: {
  title: string;
  items: Observe["state"];
  selected?: string | null;
  flash?: { id: string; from: string; to: string } | null;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-2/50 p-2">
      <p className="text-[9px] font-medium uppercase tracking-wider text-subtle">{title}</p>
      {items.length === 0 ? (
        <p className="mt-1 text-[11px] text-subtle">—</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {items.map((p) => {
            const on = selected && p.symbol === selected;
            const f = flash && (flash.id === p.id || flash.id === p.symbol);
            return (
              <li
                key={p.id}
                className={cn(
                  "rounded-sm px-1 py-0.5 font-mono text-[11px]",
                  on && "bg-primary/20 text-primary",
                )}
              >
                <span className="text-muted">{p.label}</span>{" "}
                <span>{f ? `${flash.from} → ${flash.to}` : p.value}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
