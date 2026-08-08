import { useState } from "react";
import type { DemoKind } from "@/data/lessons";
import { getDemoSource } from "@/data/demo-sources";
import { VueLiveDemo } from "@/components/VueLiveDemo";
import { Code2, ChevronDown, ChevronUp } from "lucide-react";

/**
 * 交互 Demo：唯一源码来自 demo-sources（与讲解对应），
 * 直接交给 @vue/repl 运行 — 不再维护 React 等价实现。
 */
export function InteractiveDemo({
  kind,
  title,
  hint,
}: {
  kind: DemoKind;
  title: string;
  hint?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const source = getDemoSource(kind);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            交互 Demo · 代码即运行
          </p>
          <h3 className="mt-0.5 font-display text-base font-semibold text-fg">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-muted transition-colors hover:text-fg"
        >
          <Code2 className="h-3.5 w-3.5" />
          {collapsed ? "展开运行器" : "收起运行器"}
          {collapsed ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <div className="p-4 sm:p-5">
        {hint ? <p className="mb-4 text-sm text-muted">{hint}</p> : null}
        {!collapsed ? (
          <VueLiveDemo code={source.code} title={source.title} height={380} />
        ) : (
          <p className="text-sm text-muted">运行器已收起 — 源码仍在下方（可展开再改再跑）。</p>
        )}
        <p className="mt-3 text-xs text-subtle">
          单一源码（{source.title}）既用于阅读也用于执行。改代码即可验证讲解。
        </p>
      </div>
    </section>
  );
}
