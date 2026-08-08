import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2, AlertTriangle } from "lucide-react";

type Props = {
  /** Full SFC source (the only source of truth) */
  code: string;
  title?: string;
  className?: string;
  /** min height of the repl host */
  height?: number;
};

/**
 * 展示的代码 = 正在运行的代码。
 * 使用 @vue/repl 编译并预览 SFC，不再用 React 手写等价 Demo。
 */
export function VueLiveDemo({ code, title, className, height = 360 }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const el = hostRef.current;
    if (!el) return;
    let unmount: (() => void) | undefined;

    async function boot() {
      try {
        setStatus("loading");
        setError(null);
        const vue = await import("vue");
        const repl = await import("@vue/repl");
        const CodeMirror = (await import("@vue/repl/codemirror-editor")).default;
        await import("@vue/repl/style.css");
        if (cancelled || !el) return;

        const { createApp, h, ref } = vue;
        const { Repl, useStore, useVueImportMap } = repl;
        const { importMap: builtinImportMap, vueVersion } = useVueImportMap();
        const store = useStore({
          builtinImportMap,
          vueVersion,
          showOutput: ref(true),
          outputMode: ref("preview"),
        });

        const sfc = code.trim() || `<script setup>\n</script>\n<template><p>empty</p></template>`;
        await store.setFiles(
          {
            "src/App.vue": sfc,
          },
          "src/App.vue",
        );
        if (cancelled) return;

        const isNarrow =
          typeof window !== "undefined" && window.innerWidth < 720;

        const app = createApp({
          setup() {
            return () =>
              h(Repl, {
                editor: CodeMirror,
                store,
                theme: "dark",
                layout: isNarrow ? "vertical" : "horizontal",
                layoutReverse: false,
                showCompileOutput: false,
                showImportMap: false,
                showTsConfig: false,
                clearConsole: true,
                previewOptions: {
                  headHTML: `<style>
                    html,body{margin:0;padding:0;background:#0b0d0c;color:#e8ebe9;font-family:system-ui,sans-serif;}
                    #app{padding:12px;min-height:100%;box-sizing:border-box;}
                    button{margin:4px 6px 4px 0;padding:6px 12px;border-radius:8px;border:1px solid #3d4a42;background:#1a2220;color:#e8ebe9;cursor:pointer;}
                    button:hover{border-color:#42b883;}
                    input,textarea,select{margin:4px 0;padding:6px 8px;border-radius:8px;border:1px solid #3d4a42;background:#121816;color:#e8ebe9;}
                    p,li,label{line-height:1.5;}
                    .active{color:#42b883;font-weight:600;}
                  </style>`,
                  placeholderHTML: `<div style="padding:1rem;color:#8b958e">编译 Vue 中…</div>`,
                  showRuntimeError: true,
                  showRuntimeWarning: true,
                },
                editorOptions: {
                  autoSaveText: false,
                  showErrorText: "编译错误 — 改代码后自动重编译",
                },
                splitPaneOptions: {
                  codeTogglerText: "源码",
                  outputTogglerText: "运行",
                },
              });
          },
        });

        app.mount(el);
        unmount = () => {
          app.unmount();
          el.innerHTML = "";
        };
        if (!cancelled) setStatus("ready");
      } catch (e) {
        console.error("[VueLiveDemo]", e);
        if (!cancelled) {
          setStatus("error");
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    }

    void boot();
    return () => {
      cancelled = true;
      unmount?.();
    };
  }, [code]);

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-[#0b0d0c]", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border/80 px-3 py-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
            Vue 真运行 · 源码即 Demo
          </p>
          {title ? (
            <p className="truncate font-mono text-xs text-muted">{title}</p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 font-mono text-[10px] text-primary">
          @vue/repl
        </span>
      </div>
      {status === "loading" ? (
        <div
          className="flex items-center justify-center gap-2 text-sm text-muted"
          style={{ minHeight: height }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          加载 Vue 运行时…
        </div>
      ) : null}
      {status === "error" ? (
        <div
          className="flex items-start gap-2 p-4 text-sm text-warn"
          style={{ minHeight: height }}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error ?? "加载失败"}</span>
        </div>
      ) : null}
      <div
        ref={hostRef}
        className={cn(status !== "ready" && "sr-only")}
        style={{ height }}
      />
      <p className="border-t border-border/60 px-3 py-1.5 text-[10px] text-subtle">
        左侧/上方可改代码，右侧/下方即时预览 — 没有第二套 React 模拟逻辑
      </p>
    </div>
  );
}
