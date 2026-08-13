import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { changedBlocks, diffLines, type DiffLine } from "@/causal/diff";
import type { SemanticBlock } from "@/causal/types";

const TOKEN =
  /(\b(?:import|from|const|let|function|return|export|type|interface|if|else|new|true|false)\b|<\/?[A-Za-z][\w.-]*|@[\w.-]+|:[\w.-]+|v-[\w.-]+|'[^']*'|"[^"]*"|`[^`]*`|\b[A-Za-z_]\w*\b)/g;

type Props = {
  before: string;
  after: string;
  blocks: SemanticBlock[];
  activeBlockLabel?: string;
  selected?: string | null;
  onSelect: (symbol: string) => void;
  clickable: string[];
  waiting?: boolean;
};

export function CodeEvolution({
  before,
  after,
  blocks,
  activeBlockLabel,
  selected,
  onSelect,
  clickable,
  waiting,
}: Props) {
  const lines = useMemo(() => diffLines(before, after), [before, after]);
  const changed = useMemo(() => changedBlocks(lines), [lines]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
          Code Evolution
        </p>
        <span className="truncate font-mono text-[10px] text-subtle">App.vue</span>
      </div>
      {blocks.length > 0 && !waiting ? (
        <ol className="flex flex-wrap gap-1.5 border-b border-border px-3 py-2">
          {blocks.map((b, i) => (
            <li
              key={b.id}
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px] transition-colors",
                activeBlockLabel === b.label
                  ? "bg-primary text-primary-fg"
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
      ) : null}
      <pre className="scrollbar-thin min-h-0 flex-1 overflow-auto p-3 text-[12px] leading-[1.65]">
        <code className="font-mono">
          {(waiting ? lines.filter((l) => l.kind !== "add") : lines).map((line, i) => (
            <DiffRow
              key={`${line.kind}-${i}-${line.text}`}
              line={line}
              selected={selected}
              onSelect={onSelect}
              clickable={clickable}
              emphasize={!waiting && line.kind !== "same" && changed.includes(line.block)}
            />
          ))}
        </code>
      </pre>
      <p className="border-t border-border px-3 py-1.5 text-[10px] text-subtle">
        {waiting
          ? "预测完成前，代码停在上一镜。一次只发生一个因果变更。"
          : "点击标识符：代码 ↔ 运行时 ↔ 界面。语义块高亮，而不是逐字符打字。"}
      </p>
    </div>
  );
}

function DiffRow({
  line,
  selected,
  onSelect,
  clickable,
  emphasize,
}: {
  line: DiffLine;
  selected: string | null | undefined;
  onSelect: (s: string) => void;
  clickable: string[];
  emphasize: boolean;
}) {
  return (
    <span
      className={cn(
        "block rounded-sm px-1",
        line.kind === "add" && "bg-green/15 text-green",
        line.kind === "remove" && "bg-red/10 text-red/90 line-through opacity-80",
        emphasize && line.kind === "add" && "causal-hunk-in",
      )}
    >
      <span className="mr-2 inline-block w-3 select-none text-subtle">
        {line.kind === "add" ? "+" : line.kind === "remove" ? "−" : " "}
      </span>
      {tokenize(line.text, clickable, selected, onSelect)}
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
            "rounded-sm px-0.5 font-medium underline decoration-dotted underline-offset-2",
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
