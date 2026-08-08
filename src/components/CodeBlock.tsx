import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  title,
  lang = "vue",
}: {
  code: string;
  title?: string;
  lang?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-code-bg shadow-soft">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex gap-1" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-red/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green/80" />
          </span>
          {title ? (
            <span className="truncate text-xs font-medium text-muted">{title}</span>
          ) : null}
          <span className="shrink-0 rounded-xs bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-subtle">
            {lang}
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-8 items-center gap-1.5 rounded-sm px-2 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-primary" />
              已复制
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              复制
            </>
          )}
        </button>
      </div>
      <pre className="scrollbar-thin overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className={cn("font-mono text-code-fg whitespace-pre")}>
          {highlightLite(code)}
        </code>
      </pre>
    </div>
  );
}

function highlightLite(code: string) {
  const lines = code.split("\n");
  return lines.map((line, i) => (
    <span key={i} className="block">
      {colorLine(line)}
      {i < lines.length - 1 ? "\n" : null}
    </span>
  ));
}

function colorLine(line: string) {
  if (line.trimStart().startsWith("//") || line.trimStart().startsWith("<!--")) {
    return <span className="text-subtle">{line}</span>;
  }
  const parts = line.split(
    /(\b(?:import|from|const|let|function|return|export|type|interface|if|else|new)\b|<\/?[A-Za-z][\w.-]*|@[\w.-]+|:[\w.-]+|v-[\w.-]+|'[^']*'|"[^"]*"|`[^`]*`)/g,
  );
  return parts.map((p, i) => {
    if (!p) return null;
    if (/^(import|from|const|let|function|return|export|type|interface|if|else|new)$/.test(p)) {
      return (
        <span key={i} className="text-primary">
          {p}
        </span>
      );
    }
    if (/^<\/?[A-Za-z]/.test(p) || p.startsWith("v-") || p.startsWith("@") || p.startsWith(":")) {
      return (
        <span key={i} className="text-[#7eb8ff]">
          {p}
        </span>
      );
    }
    if (/^['"`]/.test(p)) {
      return (
        <span key={i} className="text-warn">
          {p}
        </span>
      );
    }
    return <span key={i}>{p}</span>;
  });
}
