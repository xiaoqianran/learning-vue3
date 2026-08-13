import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Files } from "@/causal/types";
import { AlertTriangle, Loader2 } from "lucide-react";
import { PaneHeader } from "./PaneHeader";

const PREVIEW_HEAD = `<style>
  html,body{margin:0;padding:0;background:#11111b;color:#cdd6f4;font-family:ui-sans-serif,system-ui,sans-serif;}
  #app{padding:16px;min-height:100%;box-sizing:border-box;animation:causal-vue-in 280ms ease both;}
  @keyframes causal-vue-in{from{opacity:0}to{opacity:1}}
  @media (prefers-reduced-motion:reduce){#app{animation:none}}
  button{margin:6px 8px 6px 0;padding:8px 14px;border-radius:10px;border:1px solid #45475a;background:#1e1e2e;color:#cdd6f4;cursor:pointer;font-size:14px;}
  button:hover{border-color:#a6e3a1;color:#a6e3a1;}
  input,textarea{margin:6px 0;padding:8px 10px;border-radius:10px;border:1px solid #45475a;background:#181825;color:#cdd6f4;width:min(100%,16rem);}
  input[type=checkbox]{width:auto;margin-right:8px;}
  p,li,label{line-height:1.55;}
  label{display:flex;align-items:center;gap:8px;}
  .total{font-size:1.15rem;font-weight:650;color:#a6e3a1;}
  ul{padding-left:1.1rem;}
  .done{opacity:.55;text-decoration:line-through;}
  form{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0;}
  .panel{border:1px solid #313244;border-radius:12px;padding:12px 14px;margin:8px 0;background:#181825;}
  .panel h3{margin:0 0 8px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#a6e3a1;}
  .hint{color:#7f849c;font-size:12px;}
  nav.links{display:flex;gap:12px;flex-wrap:wrap;margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid #313244;}
  nav.links a{color:#89b4fa;text-decoration:none;font-size:13px;}
  nav.links a.router-link-active,nav.links a.active{color:#a6e3a1;}
  .stats{color:#a6e3a1;font-size:13px;margin:8px 0;}
  .page{min-height:8rem;}
  .loading{color:#89b4fa;font-size:13px;margin:8px 0;}
  .error{color:#f38ba8;font-size:13px;margin:8px 0;}
  .empty{color:#7f849c;font-size:13px;margin:8px 0;}
  .card{border:1px solid #313244;border-radius:12px;padding:14px;margin:8px 0;background:#181825;}
  .card h3{margin:0 0 6px;font-size:1.05rem;color:#cdd6f4;}
  .who{font-size:13px;color:#a6e3a1;margin:8px 0;}
  button:disabled{opacity:.45;cursor:not-allowed;}
  button.on{border-color:#a6e3a1;color:#a6e3a1;}
  .on{outline:2px solid #a6e3a1;outline-offset:2px;}
  input:focus,textarea:focus{border-color:#a6e3a1;}
  .probe{font-family:ui-monospace,ui-sans-serif,monospace;font-size:12px;color:#f9e2af;margin:8px 0;}
  .specs{list-style:none;padding-left:0;margin:12px 0 0;}
  .specs li{font-size:13px;margin:4px 0;}
  .pass{color:#a6e3a1;}
  .fail{color:#f38ba8;}
  .stamp{background:#45475a33;border:1px dashed #f9e2af;padding:6px 8px;border-radius:8px;margin:8px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;color:#f9e2af;}
  .row{display:flex;gap:12px;flex-wrap:wrap;}
  .row .panel{flex:1;min-width:11rem;}
  .match{color:#a6e3a1;font-weight:700;}
  .mismatch{color:#f38ba8;font-weight:700;}
</style>`;

const EMPTY_APP = `<script setup>\n</script>\n<template><p>—</p></template>`;

const EXTRA_IMPORTS: Record<string, string> = {
  pinia: "https://cdn.jsdelivr.net/npm/pinia@2.3.1/dist/pinia.esm-browser.js",
  "vue-router": "https://cdn.jsdelivr.net/npm/vue-router@4.5.1/dist/vue-router.esm-browser.js",
};

type StoreApi = {
  setFiles: (files: Record<string, string>, main?: string) => Promise<void>;
  unmount: () => void;
};

type Props = {
  files: Files;
  className?: string;
  label?: string;
};

const SPECIAL_ROOT = new Set(["import-map.json", "tsconfig.json"]);

function asReplFiles(files: Files): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [raw, source] of Object.entries(files)) {
    const base = raw.split("/").pop() ?? raw;
    if (SPECIAL_ROOT.has(raw) || SPECIAL_ROOT.has(base)) {
      out[base] = source;
      continue;
    }
    const name = raw.startsWith("src/") ? raw : `src/${raw.replace(/^\//, "")}`;
    out[name] = source;
  }
  if (!out["src/App.vue"]?.trim()) out["src/App.vue"] = EMPTY_APP;
  return out;
}

function pickMain(files: Record<string, string>): string {
  if (files["src/main.js"]?.trim()) return "src/main.js";
  if (files["src/main.ts"]?.trim()) return "src/main.ts";
  return "src/App.vue";
}

function waitForBox(el: HTMLElement | null, timeoutMs = 2000): Promise<void> {
  if (!el) return Promise.resolve();
  if (el.clientWidth > 8 && el.clientHeight > 8) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      ro.disconnect();
      window.clearTimeout(timer);
      resolve();
    };
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 8 && el.clientHeight > 8) done();
    });
    ro.observe(el);
    const timer = window.setTimeout(done, timeoutMs);
  });
}

/**
 * Preview-only @vue/repl host. Editor is hidden; files update in place for time travel.
 * The mount node must keep a real layout box — never `sr-only` / 1×1 — or the iframe
 * is created at 1px and stays blank after the pane becomes visible.
 */
export function VueCausalPreview({ files, className, label }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<StoreApi | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [veil, setVeil] = useState(false);
  const replFiles = useMemo(() => asReplFiles(files), [files]);
  const filesKey = useMemo(() => JSON.stringify(replFiles), [replFiles]);
  const extra = Object.keys(replFiles).filter((n) => n !== "src/App.vue").length;

  useEffect(() => {
    let cancelled = false;
    const el = hostRef.current;
    if (!el) return;
    let unmount: (() => void) | undefined;

    async function boot() {
      try {
        setStatus("loading");
        await waitForBox(el);
        if (cancelled) return;
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

        store.setImportMap({ imports: EXTRA_IMPORTS }, true);
        await store.setFiles(replFiles, pickMain(replFiles));
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
        el.querySelector(".split-pane")?.classList.add("show-output");
        apiRef.current = {
          setFiles: (next, main) => store.setFiles(next, main),
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
    // boot once; subsequent file updates go through the second effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || status !== "ready") return;
    setVeil(true);
    let cancelled = false;
    void api.setFiles(replFiles, pickMain(replFiles)).finally(() => {
      window.setTimeout(() => {
        if (!cancelled) setVeil(false);
      }, 220);
    });
    return () => {
      cancelled = true;
    };
  }, [filesKey, replFiles, status]);

  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden bg-[#11111b]", className)}>
      <PaneHeader
        kicker={label ?? "实时应用"}
        meta={extra > 0 ? `@vue/repl · ${extra + 1} files` : "@vue/repl"}
        live={status === "ready" && !veil}
      />
      <div className="relative min-h-0 flex-1">
        <div ref={hostRef} className="vue-sfc-repl-host vue-causal-preview absolute inset-0" />
        {status === "loading" ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-[#11111b]/80 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            加载 Vue 运行时…
          </div>
        ) : null}
        {status === "error" ? (
          <div className="absolute inset-0 z-10 flex items-start gap-2 bg-[#11111b] p-4 text-sm text-warn">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error ?? "加载失败"}</span>
          </div>
        ) : null}
        {veil && status === "ready" ? (
          <div className="causal-preview-veil pointer-events-none absolute inset-0 z-10 bg-[#11111b]" />
        ) : null}
      </div>
    </div>
  );
}
