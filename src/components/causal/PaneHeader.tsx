import type { DragEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PaneMoveBar, usePaneChrome } from "./CausalWorkspace";

export function PaneHeader({
  kicker,
  meta,
  live,
}: {
  kicker: string;
  meta?: ReactNode;
  live?: boolean;
}) {
  const chrome = usePaneChrome();

  function onDragStart(e: DragEvent) {
    if (!chrome) return;
    chrome.onDragStart(e);
  }

  return (
    <div
      className={cn(
        "flex h-8 shrink-0 items-center gap-2 border-b border-border/80 bg-surface px-3",
        chrome && "cursor-grab active:cursor-grabbing",
      )}
      draggable={Boolean(chrome)}
      onDragStart={chrome ? onDragStart : undefined}
      title={chrome ? "拖到另一格上对调位置" : undefined}
    >
      <p className="flex shrink-0 items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
        {live ? <span className="causal-live-dot" aria-hidden /> : null}
        {kicker}
      </p>
      {meta ? <div className="min-w-0 truncate font-mono text-[10px] text-subtle">{meta}</div> : null}
      <PaneMoveBar />
    </div>
  );
}

export function PaneBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden bg-surface", className)}>
      {children}
    </div>
  );
}
