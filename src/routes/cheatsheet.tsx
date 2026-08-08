import { createFileRoute, Link } from "@tanstack/react-router";
import { BookMarked } from "lucide-react";

export const Route = createFileRoute("/cheatsheet")({
  component: CheatsheetPage,
});

const SECTIONS: { title: string; items: { k: string; v: string }[] }[] = [
  {
    title: "响应式 · 核心",
    items: [
      { k: "ref(x)", v: "任意值；脚本 .value；模板自动解包" },
      { k: "reactive(obj)", v: "对象 Proxy；勿直接解构" },
      { k: "toRefs / toRef", v: "解构时保持响应式" },
      { k: "computed", v: "派生缓存；副作用别放这里" },
      { k: "watch / watchEffect", v: "副作用；onCleanup 防竞态" },
      { k: "shallowRef", v: "只追踪 .value 替换；大对象友好" },
      { k: "readonly / markRaw", v: "只读包装 / 永不代理" },
    ],
  },
  {
    title: "模板与指令",
    items: [
      { k: "{{ }}", v: "文本插值（自动转义）" },
      { k: ":attr / v-bind", v: '动态属性；对象可 v-bind="obj"' },
      { k: "@event / v-on", v: ".prevent .stop .once .capture" },
      { k: "v-if / v-else-if / v-else", v: "真实挂载/卸载" },
      { k: "v-show", v: "CSS display 切换" },
      { k: "v-for + :key", v: "稳定业务 id；勿与 v-if 同元" },
      { k: "v-model", v: ".lazy .number .trim；组件见下" },
      { k: ":class / :style", v: "对象/数组语法，与静态合并" },
      { k: "v-html", v: "原始 HTML → XSS 风险，慎用" },
    ],
  },
  {
    title: "组件",
    items: [
      { k: "props ↓ / emits ↑", v: "单向数据流" },
      { k: "v-model 在组件", v: "modelValue + update:modelValue / defineModel" },
      { k: "slots", v: "默认 / 具名 #x / 作用域" },
      { k: "provide / inject", v: "树内；全局状态用 Pinia" },
      { k: "$attrs / inheritAttrs", v: "透传；可落到内部 input" },
      { k: "defineAsyncComponent", v: "分包 + loading/error" },
      { k: "Teleport", v: "挂 body 做弹层" },
      { k: "KeepAlive", v: "缓存实例；activated 钩子" },
      { k: "Transition(Group)", v: "进入/离开/列表动画" },
      { k: "Suspense", v: "experimental；fallback 等待异步" },
    ],
  },
  {
    title: "SFC 与复用",
    items: [
      { k: "<script setup>", v: "推荐；编译期语法糖" },
      { k: "defineProps / Emits", v: "类型化 props/事件" },
      { k: "defineExpose", v: "暴露给父模板 ref" },
      { k: "useXxx()", v: "composable 复用逻辑" },
      { k: "自定义指令", v: "DOM 底层操作；优先组件" },
      { k: "app.use(plugin)", v: "Router/Pinia/自研插件" },
      { k: "scoped / :deep()", v: "样式封装与穿透" },
    ],
  },
  {
    title: "路由 · 状态 · 请求",
    items: [
      { k: "createRouter", v: "history + routes" },
      { k: "useRoute / useRouter", v: "读参 / 跳转" },
      { k: "beforeEach", v: "守卫；≠ 服务端安全" },
      { k: "defineStore", v: "Pinia setup 风格" },
      { k: "loading/error/data", v: "请求三态" },
      { k: "AbortController", v: "取消竞态请求" },
      { k: "Bearer token", v: "Authorization；401 清会话" },
    ],
  },
  {
    title: "工程 · 最佳实践",
    items: [
      { k: "VITE_", v: "仅此前缀暴露给客户端" },
      { k: "api client", v: "统一 baseURL / 错误 / token" },
      { k: "Vitest / VTU / E2E", v: "逻辑→组件→主路径" },
      { k: "SSR 约束", v: "无 window；每请求新 app" },
      { k: "a11y", v: "语义标签、键盘、label" },
      { k: "安全", v: "勿信用户 HTML；密钥勿进前端" },
      { k: "性能", v: "key、shallow、异步组件、虚拟列表" },
    ],
  },
  {
    title: "官网地图（llms.txt）",
    items: [
      { k: "Essentials", v: "模板·响应式·计算·列表·表单·watch·ref·组件·生命周期" },
      { k: "Components", v: "注册·props·事件·v-model·attrs·slots·provide·async" },
      { k: "Built-ins", v: "Transition·KeepAlive·Teleport·Suspense" },
      { k: "Scaling", v: "SFC·工具链·路由·状态·测试·SSR" },
      { k: "Best practices", v: "部署·性能·a11y·安全" },
      { k: "TypeScript", v: "概览 + Composition / Options" },
      { k: "Extras", v: "响应式深入·渲染机制·JSX·Web Components" },
      { k: "llms.txt", v: "https://vuejs.org/llms.txt · 全文 llms-full.txt" },
    ],
  },
];

function CheatsheetPage() {
  return (
    <div className="mx-auto max-w-3xl pb-16">
      <header className="mb-6">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
          <BookMarked className="h-3.5 w-3.5" />
          v8 · 速查 · 官网对齐
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-fg sm:text-3xl">
          Vue 3 速查表
        </h1>
        <p className="mt-2 text-sm text-muted">
          覆盖官网 essentials → best practices 高频点。详细交互见课程；权威 API 见{" "}
          <a
            href="https://cn.vuejs.org/"
            target="_blank"
            rel="noreferrer"
            className="text-primary no-underline hover:underline"
          >
            cn.vuejs.org
          </a>
          。实战见{" "}
          <Link to="/studio" className="text-primary no-underline hover:underline">
            全栈工坊
          </Link>
          。
        </p>
      </header>

      <div className="grid gap-4">
        {SECTIONS.map((sec) => (
          <section
            key={sec.title}
            className="overflow-hidden rounded-xl border border-border bg-surface"
          >
            <h2 className="border-b border-border bg-surface-2 px-4 py-2.5 font-display text-sm font-semibold text-fg">
              {sec.title}
            </h2>
            <ul className="divide-y divide-border">
              {sec.items.map((it) => (
                <li key={it.k} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-3">
                  <code className="font-mono text-xs text-primary">{it.k}</code>
                  <span className="text-sm text-muted">{it.v}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-subtle">
        建议路径：基础 → 进阶 → 官网对齐 → 全栈准备 → 工坊 → 工程化 → 进阶模式
      </p>
    </div>
  );
}
