import { cn } from "@/lib/utils";
import type { Scene } from "@/causal/types";

type Props = {
  scenes: Scene[];
  index: number;
  maxReached: number;
  onGo: (i: number) => void;
};

const LAYER: Record<Scene["layer"], string> = {
  see: "看",
  predict: "预测",
  explain: "解释",
  break: "拆开",
  transfer: "迁移",
};

export function TimeMachine({ scenes, index, maxReached, onGo }: Props) {
  return (
    <div className="border-t border-border bg-surface-2/80 px-3 py-2.5 sm:px-5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-subtle">
          Program Time Machine
        </p>
        <p className="font-mono text-[10px] text-muted">
          {scenes[index]?.tick} · {LAYER[scenes[index]?.layer ?? "see"]}
        </p>
      </div>
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {scenes.map((s, i) => {
          const locked = i > maxReached;
          const active = i === index;
          return (
            <div key={s.id} className="flex min-w-0 flex-1 items-center">
              {i > 0 ? (
                <div
                  className={cn(
                    "h-px min-w-4 flex-1",
                    i <= maxReached ? "bg-primary/70" : "bg-border",
                  )}
                />
              ) : null}
              <button
                type="button"
                disabled={locked}
                onClick={() => onGo(i)}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-0.5 rounded-md px-1.5 py-0.5",
                  locked && "cursor-not-allowed opacity-40",
                )}
                title={locked ? "先完成当前镜的预测" : s.title}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-medium",
                    active
                      ? "bg-primary text-primary-fg ring-2 ring-primary/40"
                      : i <= maxReached
                        ? "bg-primary-soft text-primary"
                        : "bg-surface-3 text-subtle",
                  )}
                >
                  {i}
                </span>
                <span className="max-w-[4.5rem] truncate text-[10px] text-muted">{s.tick}</span>
                <span className="hidden max-w-[5.5rem] truncate text-[9px] text-subtle sm:block">
                  {s.title}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
