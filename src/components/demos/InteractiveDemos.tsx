import { useEffect, useId, useState } from "react";
import type { DemoKind } from "@/data/lessons";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/CodeBlock";
import { getDemoSource } from "@/data/demo-sources";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Check, RotateCcw, Code2, ChevronDown, ChevronUp } from "lucide-react";

export function InteractiveDemo({
  kind,
  title,
  hint,
}: {
  kind: DemoKind;
  title: string;
  hint?: string;
}) {
  const [showSource, setShowSource] = useState(true);
  const source = getDemoSource(kind);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            交互 Demo · 代码即组件
          </p>
          <h3 className="mt-0.5 font-display text-base font-semibold text-fg">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSource((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-muted transition-colors hover:text-fg"
          >
            <Code2 className="h-3.5 w-3.5" />
            对应源码
            {showSource ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          <span className="rounded-full bg-primary-soft px-2.5 py-1 font-mono text-[10px] text-primary">
            live
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        {hint ? <p className="mb-4 text-sm text-muted">{hint}</p> : null}
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-sm bg-primary-soft px-1.5 py-0.5 font-mono text-[10px] text-primary">
            A · 运行结果
          </span>
          <span className="text-xs text-muted">下方源码编译/等价实现后的可交互界面</span>
        </div>
        <DemoBody kind={kind} />
        {showSource ? (
          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-sm bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-muted">
                B · 对应源码
              </span>
              <span className="text-xs text-muted">与上方 Demo 同一套逻辑 — 读 B，操作 A</span>
            </div>
            <CodeBlock code={source.code} title={source.title} lang={source.lang} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DemoBody({ kind }: { kind: DemoKind }) {
  switch (kind) {
    case "counter":
      return <CounterDemo />;
    case "template":
      return <TemplateDemo />;
    case "ref-vs-reactive":
      return <RefReactiveDemo />;
    case "computed":
      return <ComputedDemo />;
    case "list":
      return <ListDemo />;
    case "events":
      return <EventsDemo />;
    case "form":
      return <FormDemo />;
    case "component":
      return <ComponentDemo />;
    case "lifecycle":
      return <LifecycleDemo />;
    case "todo":
      return <TodoDemo />;
    case "router":
      return <RouterDemo />;
    case "pinia":
      return <PiniaDemo />;
    case "challenge":
      return <ChallengeDemo />;
    case "slots":
      return <SlotsDemo />;
    case "provide":
      return <ProvideDemo />;
    case "async":
      return <AsyncDemo />;
    case "guard":
      return <GuardDemo />;
    case "validate":
      return <ValidateDemo />;
    case "teleport":
      return <TeleportDemo />;
    case "keepalive":
      return <KeepAliveDemo />;
    case "directive":
      return <DirectiveDemo />;
    case "class-style":
      return <ClassStyleDemo />;
    case "watchers":
      return <WatchersDemo />;
    case "template-ref":
      return <TemplateRefDemo />;
    case "component-vmodel":
      return <ComponentVModelDemo />;
    case "fallthrough":
      return <FallthroughDemo />;
    case "async-comp":
      return <AsyncCompDemo />;
    case "transition":
      return <TransitionDemo />;
    case "suspense":
      return <SuspenseDemo />;
    case "plugins":
      return <PluginsDemo />;
    default:
      return null;
  }
}

function Panel({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface-2 p-3 sm:p-4", className)}>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-subtle">{label}</p>
      {children}
    </div>
  );
}

function CounterDemo() {
  const [count, setCount] = useState(0);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="template">
        <p className="font-mono text-sm text-code-fg">
          点了 <span className="text-primary">{count}</span> 次
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => setCount((c) => c + 1)}>count++</Button>
          <Button variant="secondary" onClick={() => setCount(0)}>
            重置
          </Button>
        </div>
      </Panel>
      <Panel label="script (ref)">
        <pre className="font-mono text-xs leading-relaxed text-code-fg">
          {`const count = ref(${count})\n// count.value === ${count}`}
        </pre>
      </Panel>
    </div>
  );
}

function TemplateDemo() {
  const [msg, setMsg] = useState("你好，Vue");
  const [active, setActive] = useState(true);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="控制数据">
        <label className="block text-xs text-muted">msg</label>
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="mt-1 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg"
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-fg">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          isActive
        </label>
      </Panel>
      <Panel label="渲染结果">
        <p className="text-sm">
          {"{{ msg }} → "}
          <span className="text-primary">{msg}</span>
        </p>
        <p
          className={cn(
            "mt-2 rounded-md px-2 py-1 text-sm",
            active ? "bg-primary-soft text-primary" : "bg-surface-3 text-muted",
          )}
        >
          :class 绑定 → {active ? "active" : "inactive"}
        </p>
      </Panel>
    </div>
  );
}

function RefReactiveDemo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Vue");
  const [n, setN] = useState(1);
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Panel label="ref(count)">
        <p className="font-mono text-2xl font-semibold tabular-nums text-primary">{count}</p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => setCount((c) => c + 1)}>
            count.value++
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setCount(0)}>
            归零
          </Button>
        </div>
      </Panel>
      <Panel label="reactive({ name, n })">
        <p className="text-sm">
          name: <span className="text-primary">{name}</span>
        </p>
        <p className="mt-1 text-sm">
          n: <span className="font-mono text-primary">{n}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 min-w-0 flex-1 rounded-md border border-border bg-bg px-3 text-sm"
          />
          <Button size="sm" onClick={() => setN((x) => x + 1)}>
            state.n++
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function ComputedDemo() {
  const [first, setFirst] = useState("Ada");
  const [last, setLast] = useState("Lovelace");
  const full = `${first} ${last}`;
  const [logs, setLogs] = useState<string[]>([`初始: ${full}`]);

  useEffect(() => {
    setLogs((prev) => {
      const line = `watch → "${full}"`;
      if (prev[prev.length - 1] === line) return prev;
      return [...prev.slice(-4), line];
    });
  }, [full]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="输入">
        <label className="text-xs text-muted">first</label>
        <input
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          className="mt-1 mb-3 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
        />
        <label className="text-xs text-muted">last</label>
        <input
          value={last}
          onChange={(e) => setLast(e.target.value)}
          className="mt-1 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
        />
      </Panel>
      <div className="grid gap-3">
        <Panel label="computed full">
          <p className="font-display text-xl font-semibold text-primary">{full}</p>
        </Panel>
        <Panel label="watch 日志">
          <ul className="space-y-1 font-mono text-xs text-muted">
            {logs.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function ListDemo() {
  const [show, setShow] = useState(true);
  const [items, setItems] = useState([
    { id: 1, text: "学 ref" },
    { id: 2, text: "学 v-for" },
  ]);
  const [nextId, setNextId] = useState(3);
  const [draft, setDraft] = useState("");

  function add() {
    const t = draft.trim();
    if (!t) return;
    setItems((xs) => [...xs, { id: nextId, text: t }]);
    setNextId((n) => n + 1);
    setDraft("");
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="控制">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={show}
            onChange={(e) => setShow(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          v-if = {String(show)}
        </label>
        <div className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="新项目"
            className="h-10 min-w-0 flex-1 rounded-md border border-border bg-bg px-3 text-sm"
          />
          <Button onClick={add} size="icon" aria-label="添加">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Panel>
      <Panel label="template 输出">
        {show ? (
          <p className="mb-2 text-sm text-primary">v-if：列表可见</p>
        ) : (
          <p className="mb-2 text-sm text-muted">v-else：已隐藏</p>
        )}
        {show ? (
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-md bg-bg px-2.5 py-2 text-sm"
              >
                <span>
                  <span className="mr-2 font-mono text-xs text-subtle">#{item.id}</span>
                  {item.text}
                </span>
                <button
                  type="button"
                  className="text-muted hover:text-danger"
                  onClick={() => setItems((xs) => xs.filter((x) => x.id !== item.id))}
                  aria-label="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>
    </div>
  );
}

function EventsDemo() {
  const [n, setN] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="事件">
        <p className="font-mono text-3xl font-semibold tabular-nums text-primary">{n}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => setN((x) => x + 1)}>@click +1</Button>
          <Button variant="secondary" onClick={() => setN((x) => x + 5)}>
            @click="add(5)"
          </Button>
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              setLog((xs) =>
                [`submit.prevent @ ${new Date().toLocaleTimeString()}`, ...xs].slice(0, 4),
              );
            }}
          >
            @submit.prevent
          </Button>
        </div>
      </Panel>
      <Panel label="事件日志">
        {log.length === 0 ? (
          <p className="text-sm text-muted">点击按钮产生日志</p>
        ) : (
          <ul className="space-y-1 font-mono text-xs text-muted">
            {log.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function FormDemo() {
  const [name, setName] = useState("");
  const [age, setAge] = useState(18);
  const [agree, setAgree] = useState(false);
  const [color, setColor] = useState("green");
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="v-model 表单">
        <label className="text-xs text-muted">name (.trim)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setName((n) => n.trim())}
          className="mt-1 mb-3 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
          placeholder="你的名字"
        />
        <label className="text-xs text-muted">age (.number)</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          className="mt-1 mb-3 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
        />
        <label className="mb-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          同意条款
        </label>
        <label className="text-xs text-muted">color</label>
        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="mt-1 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
        >
          <option value="green">绿</option>
          <option value="blue">蓝</option>
        </select>
      </Panel>
      <Panel label="实时预览">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">name</dt>
            <dd className="font-medium text-fg">{name || "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">age</dt>
            <dd className="font-mono text-primary">{age}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">agree</dt>
            <dd>{agree ? "true" : "false"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">color</dt>
            <dd className="capitalize">{color}</dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}

function ChildCounter({ label }: { label: string }) {
  const [n, setN] = useState(0);
  return (
    <div className="rounded-md border border-border bg-bg p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-mono text-xl text-primary">{n}</p>
      <Button size="sm" className="mt-2" onClick={() => setN((x) => x + 1)}>
        子组件 +1
      </Button>
    </div>
  );
}

function ComponentDemo() {
  return (
    <div>
      <p className="mb-3 text-sm text-muted">父组件渲染两个独立的子组件实例：</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <ChildCounter label="<CounterCard /> #1" />
        <ChildCounter label="<CounterCard /> #2" />
      </div>
    </div>
  );
}

function LifecycleDemo() {
  const [mounted, setMounted] = useState(true);
  const [ticks, setTicks] = useState(0);
  const [log, setLog] = useState<string[]>(["准备挂载…"]);

  useEffect(() => {
    if (!mounted) return;
    setLog((xs) => [...xs, "onMounted → 启动计时器"].slice(-6));
    setTicks(0);
    const id = window.setInterval(() => setTicks((t) => t + 1), 1000);
    return () => {
      clearInterval(id);
      setLog((xs) => [...xs, "onUnmounted → clearInterval"].slice(-6));
    };
  }, [mounted]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="组件实例">
        {mounted ? (
          <div>
            <p className="font-mono text-3xl tabular-nums text-primary">{ticks}s</p>
            <p className="mt-1 text-xs text-muted">已挂载，计时中</p>
            <Button className="mt-3" variant="secondary" onClick={() => setMounted(false)}>
              卸载组件
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted">组件已卸载</p>
            <Button className="mt-3" onClick={() => setMounted(true)}>
              重新挂载
            </Button>
          </div>
        )}
      </Panel>
      <Panel label="生命周期日志">
        <ul className="space-y-1 font-mono text-xs text-muted">
          {log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

type Todo = { id: number; text: string; done: boolean };

function TodoDemo() {
  const [items, setItems] = useState<Todo[]>([
    { id: 1, text: "读完 Props 一节", done: false },
    { id: 2, text: "完成小测验", done: true },
  ]);
  const [draft, setDraft] = useState("");
  const [nextId, setNextId] = useState(3);
  const formId = useId();

  function add() {
    const t = draft.trim();
    if (!t) return;
    setItems((xs) => [...xs, { id: nextId, text: t, done: false }]);
    setNextId((n) => n + 1);
    setDraft("");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="flex gap-2">
        <input
          id={formId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="新任务…"
          className="h-10 min-w-0 flex-1 rounded-md border border-border bg-bg px-3 text-sm"
        />
        <Button onClick={add}>添加</Button>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2"
          >
            <button
              type="button"
              onClick={() =>
                setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, done: !x.done } : x)))
              }
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border",
                item.done
                  ? "border-primary bg-primary text-primary-fg"
                  : "border-border text-transparent",
              )}
              aria-label={item.done ? "标为未完成" : "标为完成"}
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <span className={cn("min-w-0 flex-1 text-sm", item.done && "text-muted line-through")}>
              {item.text}
            </span>
            <button
              type="button"
              className="text-muted hover:text-danger"
              onClick={() => setItems((xs) => xs.filter((x) => x.id !== item.id))}
              aria-label="删除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2"
        onClick={() =>
          setItems([
            { id: 1, text: "读完 Props 一节", done: false },
            { id: 2, text: "完成小测验", done: true },
          ])
        }
      >
        <RotateCcw className="h-3.5 w-3.5" />
        重置示例
      </Button>
    </div>
  );
}

function RouterDemo() {
  const pages = [
    { path: "/", title: "Home", body: "欢迎页 · RouterView 渲染 Home" },
    {
      path: "/lesson/intro",
      title: "Lesson",
      body: "动态路由 /lesson/:slug → intro",
    },
    { path: "/about", title: "About", body: "关于页" },
  ] as const;
  const [path, setPath] = useState<(typeof pages)[number]["path"]>("/");
  const current = pages.find((p) => p.path === path) ?? pages[0];

  return (
    <div className="grid gap-3 sm:grid-cols-[11rem_1fr]">
      <Panel label="RouterLink">
        <nav className="flex flex-col gap-1">
          {pages.map((p) => (
            <button
              key={p.path}
              type="button"
              onClick={() => setPath(p.path)}
              className={cn(
                "rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                path === p.path
                  ? "bg-primary-soft text-primary"
                  : "text-muted hover:bg-surface-3 hover:text-fg",
              )}
            >
              {p.path === "/" ? "/" : p.path}
            </button>
          ))}
        </nav>
      </Panel>
      <Panel label="RouterView">
        <p className="font-mono text-xs text-subtle">route.path = {path}</p>
        <h4 className="mt-2 font-display text-lg font-semibold text-fg">{current.title}</h4>
        <p className="mt-1 text-sm text-muted">{current.body}</p>
      </Panel>
    </div>
  );
}

function PiniaDemo() {
  const [items, setItems] = useState<string[]>(["学 Pinia"]);
  const [draft, setDraft] = useState("");
  const count = items.length;

  function add() {
    const t = draft.trim();
    if (!t) return;
    setItems((xs) => [...xs, t]);
    setDraft("");
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="组件 A · useCartStore()">
        <p className="text-sm text-muted">
          count: <span className="font-mono text-primary tabular-nums">{count}</span>
        </p>
        <div className="mt-2 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            className="h-9 min-w-0 flex-1 rounded-md border border-border bg-bg px-2 text-sm"
            placeholder="商品名"
          />
          <Button size="sm" onClick={add}>
            add()
          </Button>
        </div>
      </Panel>
      <Panel label="组件 B · 同一 store">
        <ul className="space-y-1 text-sm">
          {items.map((it, i) => (
            <li key={i} className="rounded-md bg-bg px-2 py-1.5">
              {it}
            </li>
          ))}
        </ul>
        <Button size="sm" variant="secondary" className="mt-2" onClick={() => setItems([])}>
          clear()
        </Button>
      </Panel>
    </div>
  );
}

function ChallengeDemo() {
  const [code, setCode] = useState(`let count = 0\nfunction inc() { count++ }\n// 视图不更新？`);
  const [status, setStatus] = useState<"idle" | "pass" | "fail">("idle");

  function check() {
    const ok = /ref\s*\(/.test(code) && /\.value/.test(code) && !/let count = 0/.test(code);
    setStatus(ok ? "pass" : "fail");
  }

  return (
    <div className="grid gap-3">
      <Panel label="有问题的脚本">
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setStatus("idle");
          }}
          rows={5}
          className="w-full rounded-md border border-border bg-bg p-3 font-mono text-xs text-code-fg"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={check}>
            运行检查
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setCode(
                `import { ref } from 'vue'\nconst count = ref(0)\nfunction inc() { count.value++ }`,
              );
              setStatus("idle");
            }}
          >
            查看参考答案
          </Button>
        </div>
        {status === "pass" ? (
          <p className="mt-2 text-sm text-primary">通过：响应式写法正确</p>
        ) : null}
        {status === "fail" ? (
          <p className="mt-2 text-sm text-warn">未通过：需要 ref(...) 且使用 .value 更新</p>
        ) : null}
      </Panel>
    </div>
  );
}

/* ——— v4 demos ——— */

function SlotsDemo() {
  const [customHeader, setCustomHeader] = useState(true);
  const [customFooter, setCustomFooter] = useState(true);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="父模板控制插槽">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={customHeader}
            onChange={(e) => setCustomHeader(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          使用 #header
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={customFooter}
            onChange={(e) => setCustomFooter(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          使用 #footer=&#123; year &#125;
        </label>
      </Panel>
      <Panel label="Card 渲染结果">
        <div className="rounded-lg border border-border bg-bg p-3">
          <header className="border-b border-border pb-2 text-sm font-medium text-primary">
            {customHeader ? "自定义头 · 来自父级" : "默认 title prop"}
          </header>
          <div className="py-3 text-sm text-fg">默认插槽：卡片主体内容</div>
          <footer className="border-t border-border pt-2 text-xs text-muted">
            {customFooter ? "© 2026 · 作用域插槽 year" : "默认页脚"}
          </footer>
        </div>
      </Panel>
    </div>
  );
}

function ProvideDemo() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  return (
    <div className="grid gap-3">
      <Panel label="祖先 provide(themeKey, theme)">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={theme === "dark" ? "default" : "secondary"}
            onClick={() => setTheme("dark")}
          >
            dark
          </Button>
          <Button
            size="sm"
            variant={theme === "light" ? "default" : "secondary"}
            onClick={() => setTheme("light")}
          >
            light
          </Button>
        </div>
      </Panel>
      <div
        className={cn(
          "rounded-lg border p-4 transition-colors",
          theme === "dark" ? "border-border bg-bg text-fg" : "border-border-strong bg-fg text-bg",
        )}
      >
        <p className="text-xs opacity-70">深层子组件 inject(themeKey)</p>
        <p className="mt-1 text-sm font-medium">当前主题：{theme}（无需 props 逐层传递）</p>
      </div>
    </div>
  );
}

function AsyncDemo() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [items, setItems] = useState<{ id: number; title: string }[]>([]);

  function load(mode: "ok" | "error") {
    setStatus("loading");
    setItems([]);
    window.setTimeout(() => {
      if (mode === "error") {
        setStatus("error");
        return;
      }
      setItems([
        { id: 1, title: "学 async composable" },
        { id: 2, title: "处理 loading / error" },
        { id: 3, title: "准备接真实 API" },
      ]);
      setStatus("ok");
    }, 700);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="触发请求">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => load("ok")} disabled={status === "loading"}>
            模拟成功
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => load("error")}
            disabled={status === "loading"}
          >
            模拟失败
          </Button>
        </div>
        <p className="mt-3 font-mono text-xs text-muted">status = {status}</p>
      </Panel>
      <Panel label="UI 三态">
        {status === "idle" ? <p className="text-sm text-muted">尚未请求</p> : null}
        {status === "loading" ? <p className="text-sm text-primary">loading…</p> : null}
        {status === "error" ? (
          <p className="text-sm text-danger">error: HTTP 500（可点重试）</p>
        ) : null}
        {status === "ok" ? (
          <ul className="space-y-1 text-sm">
            {items.map((it) => (
              <li key={it.id} className="rounded-md bg-bg px-2 py-1.5">
                {it.title}
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>
    </div>
  );
}

function GuardDemo() {
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState<"home" | "dash" | "login">("home");
  const [msg, setMsg] = useState("在首页");

  function go(target: "home" | "dash" | "login") {
    if (target === "dash" && !token) {
      setPage("login");
      setMsg("beforeEach：requiresAuth 且未登录 → /login?redirect=/dashboard");
      return;
    }
    if (target === "login" && token) {
      setPage("home");
      setMsg("已登录访问 /login → 重定向 /");
      return;
    }
    setPage(target);
    setMsg(
      target === "dash" ? "进入 /dashboard（受保护）" : target === "login" ? "登录页" : "首页",
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="导航">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => go("home")}>
            /
          </Button>
          <Button size="sm" variant="secondary" onClick={() => go("dash")}>
            /dashboard
          </Button>
          <Button size="sm" variant="secondary" onClick={() => go("login")}>
            /login
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              setToken("demo-token");
              setMsg("localStorage token 已写入（模拟）");
            }}
          >
            登录
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setToken(null);
              setPage("home");
              setMsg("已退出");
            }}
          >
            退出
          </Button>
        </div>
        <p className="mt-2 font-mono text-xs text-muted">token: {token ? "present" : "null"}</p>
      </Panel>
      <Panel label="当前视图">
        <p className="font-mono text-xs text-subtle">page = {page}</p>
        <p className="mt-2 text-sm font-medium text-fg">
          {page === "dash"
            ? "Dashboard · 私有内容"
            : page === "login"
              ? "Login · 请先登录"
              : "Home · 公开"}
        </p>
        <p className="mt-2 text-xs text-muted">{msg}</p>
      </Panel>
    </div>
  );
}

function ValidateDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [ok, setOk] = useState(false);

  function submit() {
    const e: { email?: string; password?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "邮箱格式不正确";
    if (password.length < 8) e.password = "密码至少 8 位";
    setErrors(e);
    setOk(Object.keys(e).length === 0);
  }

  return (
    <div className="mx-auto max-w-sm space-y-3">
      <div>
        <label className="text-xs text-muted">email</label>
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setOk(false);
          }}
          className={cn(
            "mt-1 h-10 w-full rounded-md border bg-bg px-3 text-sm",
            errors.email ? "border-danger" : "border-border",
          )}
          placeholder="you@example.com"
        />
        {errors.email ? <p className="mt-1 text-xs text-danger">{errors.email}</p> : null}
      </div>
      <div>
        <label className="text-xs text-muted">password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setOk(false);
          }}
          className={cn(
            "mt-1 h-10 w-full rounded-md border bg-bg px-3 text-sm",
            errors.password ? "border-danger" : "border-border",
          )}
          placeholder="至少 8 位"
        />
        {errors.password ? <p className="mt-1 text-xs text-danger">{errors.password}</p> : null}
      </div>
      <Button onClick={submit}>提交</Button>
      {ok ? <p className="text-sm text-primary">校验通过，可以请求 /api/login</p> : null}
    </div>
  );
}

function TeleportDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>打开弹层</Button>
      <p className="mt-2 text-xs text-muted">
        模拟 Teleport to body：遮罩盖住整页，不受父级 overflow 限制。
      </p>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/70 p-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-display text-base font-semibold text-fg">对话框</h4>
            <p className="mt-2 text-sm text-muted">内容仍由当前组件状态控制，DOM 挂在高层。</p>
            <Button className="mt-4" size="sm" onClick={() => setOpen(false)}>
              关闭
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function KeepAliveDemo() {
  const [tab, setTab] = useState<"a" | "b">("a");
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  return (
    <div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={tab === "a" ? "default" : "secondary"}
          onClick={() => setTab("a")}
        >
          Tab A
        </Button>
        <Button
          size="sm"
          variant={tab === "b" ? "default" : "secondary"}
          onClick={() => setTab("b")}
        >
          Tab B
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">模拟 KeepAlive：切换 tab 保留输入。</p>
      <div className="mt-3 rounded-lg border border-border bg-surface-2 p-3">
        {tab === "a" ? (
          <label className="block text-sm">
            <span className="text-xs text-muted">A 的草稿</span>
            <input
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
              placeholder="在 A 输入…"
            />
          </label>
        ) : (
          <label className="block text-sm">
            <span className="text-xs text-muted">B 的草稿</span>
            <input
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
              placeholder="在 B 输入…"
            />
          </label>
        )}
      </div>
    </div>
  );
}

function DirectiveDemo() {
  const [show, setShow] = useState(true);
  const [key, setKey] = useState(0);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => {
            setShow(true);
            setKey((k) => k + 1);
          }}
        >
          挂载并聚焦
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setShow(false)}>
          卸载
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">模拟 v-focus：mounted 时 el.focus()</p>
      {show ? (
        <input
          key={key}
          autoFocus
          className="mt-3 h-10 w-full max-w-xs rounded-md border border-border bg-bg px-3 text-sm"
          placeholder="应自动获得焦点"
        />
      ) : (
        <p className="mt-3 text-sm text-muted">输入框已卸载</p>
      )}
    </div>
  );
}

function ClassStyleDemo() {
  const [active, setActive] = useState(true);
  const [error, setError] = useState(false);
  const [size, setSize] = useState(16);
  const [color, setColor] = useState("#42b883");
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="控制">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="accent-[var(--color-primary)]"
          />
          isActive
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={error}
            onChange={(e) => setError(e.target.checked)}
            className="accent-[var(--color-primary)]"
          />
          hasError
        </label>
        <label className="mt-3 block text-xs text-muted">fontSize</label>
        <input
          type="range"
          min={12}
          max={28}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-full"
        />
        <label className="mt-2 block text-xs text-muted">color</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      </Panel>
      <Panel label="渲染结果">
        <div
          className={cn(
            "rounded-md border px-3 py-2 text-sm",
            active && "border-primary bg-primary-soft",
            error && "border-danger text-danger",
            !active && !error && "border-border bg-bg text-muted",
          )}
          style={{ fontSize: size, color: error ? undefined : color }}
        >
          :class 对象 + :style 对象
        </div>
        <pre className="mt-2 font-mono text-[11px] text-muted">
          {`{ active: ${active}, 'text-danger': ${error} }
{ fontSize: '${size}px', color: '${color}' }`}
        </pre>
      </Panel>
    </div>
  );
}

function WatchersDemo() {
  const [id, setId] = useState(1);
  const [log, setLog] = useState<string[]>([]);
  useEffect(() => {
    setLog((xs) => [...xs, `watch id → ${id}`].slice(-6));
  }, [id]);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="源 id">
        <p className="font-mono text-3xl text-primary tabular-nums">{id}</p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={() => setId((x) => x + 1)}>
            id++
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setId(1)}>
            重置
          </Button>
        </div>
      </Panel>
      <Panel label="watch 日志">
        <ul className="space-y-1 font-mono text-xs text-muted">
          {log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function TemplateRefDemo() {
  const [val, setVal] = useState("");
  const [focused, setFocused] = useState(false);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="模板 ref 模拟">
        <input
          id="tpl-ref-demo"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
          placeholder="input ref=..."
        />
        <Button
          className="mt-2"
          size="sm"
          onClick={() => {
            const el = document.getElementById("tpl-ref-demo") as HTMLInputElement | null;
            el?.focus();
            el?.select();
          }}
        >
          inputRef.value.focus()
        </Button>
      </Panel>
      <Panel label="状态">
        <p className="text-sm">
          value: <span className="text-primary">{val || "—"}</span>
        </p>
        <p className="mt-1 text-sm">focused: {String(focused)}</p>
        <p className="mt-2 text-xs text-muted">挂载前 ref 为 null；事件/onMounted 后再用。</p>
      </Panel>
    </div>
  );
}

function ComponentVModelDemo() {
  const [text, setText] = useState("Hello");
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="父 state">
        <p className="font-mono text-sm">
          text = <span className="text-primary">{text}</span>
        </p>
        <Button size="sm" className="mt-2" variant="secondary" onClick={() => setText("重置")}>
          父直接 setText
        </Button>
      </Panel>
      <Panel label="子 · v-model">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
        />
        <p className="mt-2 font-mono text-[11px] text-muted">
          emit('update:modelValue', e.target.value)
        </p>
      </Panel>
    </div>
  );
}

function FallthroughDemo() {
  const [ph, setPh] = useState("Ada");
  const [cls, setCls] = useState(true);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="父传入的 attrs">
        <input
          value={ph}
          onChange={(e) => setPh(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
        />
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={cls} onChange={(e) => setCls(e.target.checked)} />
          class="ring"
        </label>
      </Panel>
      <Panel label="子内部 input 接收 $attrs">
        <label className="text-xs text-muted">label prop</label>
        <input
          placeholder={ph}
          className={cn(
            "mt-1 h-10 w-full rounded-md border bg-bg px-3 text-sm",
            cls ? "border-primary ring-2 ring-primary/30" : "border-border",
          )}
        />
        <p className="mt-2 text-xs text-muted">inheritAttrs: false → v-bind="$attrs" 到 input</p>
      </Panel>
    </div>
  );
}

function AsyncCompDemo() {
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "error">("idle");
  function load(ok: boolean) {
    setPhase("loading");
    window.setTimeout(() => setPhase(ok ? "ready" : "error"), 900);
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="loader">
        <div className="flex gap-2">
          <Button size="sm" onClick={() => load(true)} disabled={phase === "loading"}>
            import()
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => load(false)}
            disabled={phase === "loading"}
          >
            失败
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setPhase("idle")}>
            重置
          </Button>
        </div>
      </Panel>
      <Panel label="UI">
        {phase === "idle" && <p className="text-sm text-muted">尚未加载</p>}
        {phase === "loading" && <p className="text-sm text-primary">loadingComponent…</p>}
        {phase === "error" && <p className="text-sm text-danger">errorComponent</p>}
        {phase === "ready" && (
          <div className="rounded-md border border-primary/30 bg-primary-soft p-3 text-sm text-primary">
            HeavyChart 已加载（模拟）
          </div>
        )}
      </Panel>
    </div>
  );
}

function TransitionDemo() {
  const [show, setShow] = useState(true);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="控制">
        <Button onClick={() => setShow((s) => !s)}>toggle show={String(show)}</Button>
      </Panel>
      <Panel label="Transition 模拟">
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            show ? "max-h-24 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <p className="rounded-md bg-primary-soft px-3 py-2 text-sm text-primary">fade 中的内容</p>
        </div>
        <p className="mt-2 font-mono text-[11px] text-muted">v-enter-from / v-leave-to …</p>
      </Panel>
    </div>
  );
}

function SuspenseDemo() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  function start() {
    setReady(false);
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setReady(true);
    }, 1000);
  }
  return (
    <div className="space-y-3">
      <Button size="sm" onClick={start}>
        触发异步依赖
      </Button>
      <div className="rounded-lg border border-border bg-surface-2 p-4">
        {loading || (!ready && !loading) ? (
          <p className="text-sm text-muted">#fallback · Loading…</p>
        ) : (
          <p className="text-sm text-primary">#default · AsyncPage 就绪</p>
        )}
      </div>
    </div>
  );
}

function PluginsDemo() {
  const [installed, setInstalled] = useState(false);
  const [msg, setMsg] = useState("hello");
  const dict: Record<string, string> = { hello: "你好", bye: "再见" };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel label="app.use">
        <Button size="sm" onClick={() => setInstalled(true)} disabled={installed}>
          {installed ? "已 install" : "安装 i18n 插件"}
        </Button>
        <div className="mt-2 flex gap-2">
          {(["hello", "bye"] as const).map((k) => (
            <Button key={k} size="sm" variant="secondary" onClick={() => setMsg(k)}>
              key={k}
            </Button>
          ))}
        </div>
      </Panel>
      <Panel label="$translate">
        <p className="text-sm">
          {installed ? (
            <>
              $translate('{msg}') → <span className="text-primary">{dict[msg]}</span>
            </>
          ) : (
            <span className="text-muted">插件未安装</span>
          )}
        </p>
      </Panel>
    </div>
  );
}
