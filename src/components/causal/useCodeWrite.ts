import { useEffect, useMemo, useState } from "react";
import { diffLines, writePlan, type DiffLine } from "@/causal/diff";

export type WritePhase = "before" | "write" | "after";

export type CodeWrite = {
  lines: DiffLine[];
  phase: WritePhase;
  revealed: ReadonlySet<number>;
  collapsed: ReadonlySet<number>;
  writingIndex: number | null;
  label?: string;
  previewLive: boolean;
  writing: boolean;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useCodeWrite(opts: {
  sceneId: string;
  waiting: boolean;
  before: string;
  after: string;
  labels: string[];
}): CodeWrite {
  const lines = useMemo(() => diffLines(opts.before, opts.after), [opts.before, opts.after]);
  const plan = useMemo(() => writePlan(lines), [lines]);
  const [phase, setPhase] = useState<WritePhase>(opts.waiting ? "before" : "after");
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set());
  const [writingIndex, setWritingIndex] = useState<number | null>(null);
  const [label, setLabel] = useState<string | undefined>();
  const [previewLive, setPreviewLive] = useState(() => !opts.waiting);

  const labelsKey = opts.labels.join("\0");

  useEffect(() => {
    const labels = labelsKey ? labelsKey.split("\0") : [];
    if (opts.waiting) {
      setPhase("before");
      setRevealed(new Set());
      setCollapsed(new Set());
      setWritingIndex(null);
      setPreviewLive(false);
      setLabel(undefined);
      return;
    }

    const reduced = prefersReducedMotion();
    if (reduced || opts.before === opts.after || plan.length === 0) {
      setPhase("after");
      setRevealed(new Set(lines.map((l, i) => (l.kind === "add" ? i : -1)).filter((i) => i >= 0)));
      setCollapsed(new Set(lines.map((l, i) => (l.kind === "remove" ? i : -1)).filter((i) => i >= 0)));
      setWritingIndex(null);
      setPreviewLive(true);
      setLabel(labels[labels.length - 1]);
      return;
    }

    let cancelled = false;
    const addCount = plan.filter((s) => s.kind === "add").length;
    const addDelay = Math.max(52, Math.min(88, 1000 / Math.max(1, addCount)));
    const timers: number[] = [];

    setPhase("write");
    setRevealed(new Set());
    setCollapsed(new Set());
    setPreviewLive(false);
    setWritingIndex(null);
    setLabel(labels[0]);

    let step = 0;
    let addSeen = 0;

    const run = () => {
      if (cancelled) return;
      if (step >= plan.length) {
        setWritingIndex(null);
        setPhase("after");
        timers.push(
          window.setTimeout(() => {
            if (!cancelled) setPreviewLive(true);
          }, 180),
        );
        return;
      }
      const s = plan[step]!;
      if (s.kind === "remove") {
        setCollapsed((prev) => {
          const next = new Set(prev);
          for (const i of s.indices) next.add(i);
          return next;
        });
        step += 1;
        timers.push(window.setTimeout(run, 240));
        return;
      }
      addSeen += 1;
      const li = Math.min(
        Math.floor(((addSeen - 1) / Math.max(1, addCount)) * Math.max(1, labels.length)),
        Math.max(0, labels.length - 1),
      );
      setLabel(labels[li]);
      setWritingIndex(s.index);
      setRevealed((prev) => new Set(prev).add(s.index));
      step += 1;
      timers.push(window.setTimeout(run, addDelay));
    };

    timers.push(window.setTimeout(run, 90));
    return () => {
      cancelled = true;
      for (const id of timers) window.clearTimeout(id);
    };
  }, [opts.sceneId, opts.waiting, opts.before, opts.after, labelsKey, plan, lines]);

  return {
    lines,
    phase,
    revealed,
    collapsed,
    writingIndex,
    label,
    previewLive,
    writing: phase === "write",
  };
}
