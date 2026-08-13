import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { DiffLine } from "@/causal/diff";
import { fileLabel } from "@/causal/engine";
import type { SemanticBlock } from "@/causal/types";
import type { CodeWrite } from "./useCodeWrite";
import { PaneHeader } from "./PaneHeader";

const TOKEN =
  /(\b(?:import|from|const|let|function|return|export|type|interface|if|else|new|true|false)\b|<\/?[A-Za-z][\w.-]*|@[\w.-]+|:[\w.-]+|v-[\w.-]+|'[^']*'|"[^"]*"|`[^`]*`|\b[A-Za-z_]\w*\b)/g;

type Props = {
  before: string;
  after: string;
  blocks: SemanticBlock[];
  write: CodeWrite;
  selected?: string | null;
  onSelect: (symbol: string) => void;
  clickable: string[];
  waiting?: boolean;
  filePath?: string;
};

export function CodeEvolution({
  blocks,
  write,
  selected,
  onSelect,
  clickable,
  waiting,
  filePath = "src/App.vue",
}: Props) {
  const scrollerRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (write.writingIndex == null) return;
    const el = scrollerRef.current?.querySelector(`[data-write-line="${write.writingIndex}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, [write.writingIndex]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PaneHeader
        kicker="代码演化"
        meta={write.writing ? "写入中…" : fileLabel(filePath)}
      />
      {blocks.length > 0 ? (
        <ol className="flex min-h-[2.35rem] shrink-0 flex-wrap items-center gap-1.5 border-b border-border px-3 py-2">
          {blocks.map((b, i) => (
            <li
              key={b.id}
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px] transition-[background-color,color,transform] duration-200",
                waiting
                  ? "bg-surface-3 text-subtle"
                  : write.label === b.label
                    ? "scale-[1.03] bg-primary text-primary-fg"
                    : "bg-surface-3 text-muted",
              )}
            >
              {b.label}
              {i < blocks.length - 1 ? (
                <span className="ml-1 text-subtle">↓</span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <div className="min-h-0 shrink-0" />
      )}
      <pre ref={scrollerRef} className="scrollbar-thin min-h-0 flex-1 overflow-auto p-3 text-[12px] leading-[1.65]">
        <code className="font-mono">
          {write.lines.map((line, i) => {
            const open =
              line.kind === "same"
                ? true
                : line.kind === "add"
                  ? write.phase === "before"
                    ? false
                    : write.phase === "after"
                      ? true
                      : write.revealed.has(i)
                  : write.phase === "before"
                    ? true
                    : write.phase === "after"
                      ? false
                      : !write.collapsed.has(i);
            return (
              <DiffRow
                key={`${line.kind}-${i}-${line.text}`}
                line={line}
                index={i}
                selected={selected}
                onSelect={onSelect}
                clickable={clickable}
                open={open}
                writing={write.phase === "write" && write.writingIndex === i}
                chrome={write.phase === "write"}
                fresh={write.phase === "after" && line.kind === "add" && line.text.trim().length > 0}
              />
            );
          })}
        </code>
      </pre>
      <p className="shrink-0 border-t border-border px-3 py-1.5 text-[10px] text-subtle">
        {waiting
          ? "预测完成前，代码停在上一镜。一次只发生一个因果变更。"
          : write.writing
            ? "这一镜正在写入：旧行收起，新行按语义块出现。"
            : "点击标识符：代码 ↔ 运行时 ↔ 界面。语义块写入，而不是瞬间替换。"}
      </p>
    </div>
  );
}

function DiffRow({
  line,
  index,
  selected,
  onSelect,
  clickable,
  open,
  writing,
  chrome,
  fresh,
}: {
  line: DiffLine;
  index: number;
  selected: string | null | undefined;
  onSelect: (s: string) => void;
  clickable: string[];
  open: boolean;
  writing: boolean;
  chrome: boolean;
  fresh?: boolean;
}) {
  const mark = chrome ? (line.kind === "add" ? "+" : line.kind === "remove" ? "−" : " ") : " ";
  return (
    <span data-write-line={index} className={cn("causal-line-slot", !open && "is-collapsed")}>
      <span
        className={cn(
          "causal-line-inner block rounded-sm px-1",
          chrome && line.kind === "add" && open && "bg-green/15 text-green",
          chrome && line.kind === "remove" && "bg-red/10 text-red/90 line-through opacity-80",
          writing && "causal-write-line",
          fresh && "causal-line-fresh",
        )}
      >
        <span className="mr-2 inline-block w-3 select-none text-subtle">{mark}</span>
        {tokenize(line.text, clickable, selected, onSelect)}
        {writing ? <span className="causal-caret" aria-hidden /> : null}
      </span>
    </span>
  );
}

function tokenize(
  text: string,
  clickable: string[],
  selected: string | null | undefined,
  onSelect: (s: string) => void,
) {
  const set = new Set(clickable);
  const parts = text.split(TOKEN);
  return parts.map((p, i) => {
    if (!p) return null;
    if (set.has(p)) {
      const on = selected === p;
      return (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(p)}
          className={cn(
            "rounded-sm px-0.5 font-medium underline decoration-dotted underline-offset-2 transition-colors duration-150",
            on ? "bg-primary/25 text-primary" : "text-sapphire hover:bg-surface-3",
          )}
        >
          {p}
        </button>
      );
    }
    if (/^(import|from|const|let|function|return|export|type|interface|if|else|new)$/.test(p)) {
      return (
        <span key={i} className="text-mauve">
          {p}
        </span>
      );
    }
    if (/^<\/?[A-Za-z]/.test(p) || p.startsWith("v-") || p.startsWith("@") || p.startsWith(":")) {
      return (
        <span key={i} className="text-blue">
          {p}
        </span>
      );
    }
    if (/^['"`]/.test(p)) {
      return (
        <span key={i} className="text-yellow">
          {p}
        </span>
      );
    }
    return <span key={i}>{p}</span>;
  });
}
