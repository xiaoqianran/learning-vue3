import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PaneHeader({
  kicker,
  meta,
  live,
}: {
  kicker: string;
  meta?: ReactNode;
  live?: boolean;
}) {
  return (
    <div className="flex h-8 shrink-0 items-center justify-between gap-2 border-b border-border/80 bg-surface px-3">
      <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
        {live ? <span className="causal-live-dot" aria-hidden /> : null}
        {kicker}
      </p>
      {meta ? <div className="min-w-0 truncate font-mono text-[10px] text-subtle">{meta}</div> : null}
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
