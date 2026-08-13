import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2 } from "lucide-react";

const PREVIEW_HEAD = `<style>
  html,body{margin:0;padding:0;background:#11111b;color:#cdd6f4;font-family:ui-sans-serif,system-ui,sans-serif;}
  #app{padding:16px;min-height:100%;box-sizing:border-box;}
  button{margin:6px 8px 6px 0;padding:8px 14px;border-radius:10px;border:1px solid #45475a;background:#1e1e2e;color:#cdd6f4;cursor:pointer;font-size:14px;}
  button:hover{border-color:#a6e3a1;color:#a6e3a1;}
  input,textarea{margin:6px 0;padding:8px 10px;border-radius:10px;border:1px solid #45475a;background:#181825;color:#cdd6f4;width:min(100%,16rem);}
  p,li,label{line-height:1.55;}
  .total{font-size:1.15rem;font-weight:650;color:#a6e3a1;}
  ul{padding-left:1.1rem;}
</style>`;

type StoreApi = {
  setFiles: (files: Record<string, string>, main?: string) => Promise<void>;
  unmount: () => void;
};

type Props = {
  code: string;
  className?: string;
  label?: string;
};

/**
 * Preview-only @vue/repl host. Editor is hidden; files update in place for time travel.
 */
export function VueCausalPreview({ code, className, label }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<StoreApi | null>(null);
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
        const vue = await import("vue");
        const repl = await import("@vue/repl");
        const CodeMirror = (await import("@vue/repl/codemirror-editor")).default;
        await import("@vue/repl/style.css");
        if (cancelled || !el) return;

        const { createApp, h, ref } = vue;
        const { Repl, useStore, useVueImportMap } = repl;
        /* Vue composition APIs (not React hooks) */
        /* eslint-disable react-hooks/rules-of-hooks */
        const { importMap: builtinImportMap, vueVersion } = useVueImportMap();
        const store = useStore({
          builtinImportMap,
          vueVersion,
          showOutput: ref(true),
          outputMode: ref("preview"),
        });
        /* eslint-enable react-hooks/rules-of-hooks */

        const sfc = code.trim() || `<script setup>\n</script>\n<template><p>—</p></template>`;
        await store.setFiles({ "src/App.vue": sfc }, "src/App.vue");
        if (cancelled) return;

        const app = createApp({
          setup() {
            return () =>
              h(Repl, {
                editor: CodeMirror,
                store,
                theme: "dark",
                layout: "horizontal",
                showCompileOutput: false,
                showImportMap: false,
                showTsConfig: false,
                clearConsole: true,
                previewOptions: {
                  headHTML: PREVIEW_HEAD,
                  placeholderHTML: `<div style="padding:1rem;color:#7f849c">编译 Vue 中…</div>`,
                  showRuntimeError: true,
                  showRuntimeWarning: true,
                },
                editorOptions: { autoSaveText: false, showErrorText: "编译错误" },
              });
          },
        });
        app.mount(el);
        apiRef.current = {
          setFiles: (files, main) => store.setFiles(files, main),
          unmount: () => {
            app.unmount();
            el.innerHTML = "";
          },
        };
        unmount = () => apiRef.current?.unmount();
        if (!cancelled) setStatus("ready");
      } catch (e) {
        console.error("[VueCausalPreview]", e);
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
      apiRef.current = null;
    };
    // boot once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || status !== "ready") return;
    const sfc = code.trim() || `<script setup>\n</script>\n<template><p>—</p></template>`;
    void api.setFiles({ "src/App.vue": sfc }, "src/App.vue");
  }, [code, status]);

  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden bg-[#11111b]", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-1.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
          {label ?? "Live Application"}
        </p>
        <span className="font-mono text-[10px] text-subtle">@vue/repl</span>
      </div>
      {status === "loading" ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          加载 Vue 运行时…
        </div>
      ) : null}
      {status === "error" ? (
        <div className="flex flex-1 items-start gap-2 p-4 text-sm text-warn">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error ?? "加载失败"}</span>
        </div>
      ) : null}
      <div
        ref={hostRef}
        className={cn(
          "vue-sfc-repl-host vue-causal-preview min-h-0 flex-1",
          status !== "ready" && "sr-only",
        )}
      />
    </div>
  );
}
