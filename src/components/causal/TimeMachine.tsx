import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Scene } from "@/causal/types";

type Props = {
  scenes: Scene[];
  index: number;
  maxReached: number;
  onGo: (i: number) => void;
  onReset?: () => void;
};

const LAYER: Record<Scene["layer"], string> = {
  see: "看",
  predict: "预测",
  explain: "解释",
  break: "拆开",
  transfer: "迁移",
};

export function TimeMachine({ scenes, index, maxReached, onGo, onReset }: Props) {
  const current = scenes[index];
  return (
    <div className="border-t border-border bg-surface-2 px-3 py-2 sm:px-4">
      <div className="mb-1.5 flex items-center gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">时间轴</p>
        <p className="min-w-0 truncate font-mono text-[10px] text-muted">
          {current?.tick} · {LAYER[current?.layer ?? "see"]} · {current?.title}
        </p>
        <span className="ml-auto hidden font-mono text-[10px] text-subtle sm:inline">← →</span>
        {onReset ? (
          <button
            type="button"
            className="rounded-md p-1 text-subtle transition-colors duration-200 hover:bg-surface-3 hover:text-fg"
            title="重置本实验进度"
            onClick={onReset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      <div className="flex items-center gap-0 overflow-x-auto">
        {scenes.map((s, i) => {
          const locked = i > maxReached;
          const active = i === index;
          const reached = i <= maxReached;
          return (
            <div key={s.id} className="flex min-w-0 flex-1 items-center">
              {i > 0 ? (
                <div
                  className={cn(
                    "h-px min-w-3 flex-1 transition-colors duration-200",
                    reached ? "bg-primary/60" : "bg-border",
                  )}
                />
              ) : null}
              <button
                type="button"
                disabled={locked}
                onClick={() => onGo(i)}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-0.5 rounded-md px-1 py-0.5 transition-transform duration-200 ease-out",
                  locked && "cursor-not-allowed opacity-40",
                  !locked && "hover:-translate-y-px",
                )}
                title={locked ? "先完成当前镜的预测" : s.title}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-medium transition-[background-color,box-shadow,color,transform] duration-200 ease-out",
                    active
                      ? "scale-110 bg-primary text-primary-fg shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-primary)_28%,transparent)]"
                      : reached
                        ? "bg-primary-soft text-primary"
                        : "bg-surface-3 text-subtle",
                  )}
                >
                  {i}
                </span>
                <span className="max-w-[4.5rem] truncate text-[10px] text-muted">{s.tick}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
