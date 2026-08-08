import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ApiError,
  apiCreateNote,
  apiDeleteNote,
  apiListNotes,
  apiLogin,
  apiLogout,
  apiMe,
  apiUpdateNote,
  clearLogs,
  getDemoCredentials,
  getLogs,
  resetMockApi,
  type ApiLog,
  type ApiNote,
  type ApiUser,
} from "@/lib/mock-api";
import {
  loadQuestDone,
  saveQuestDone,
  resetQuests,
  QUEST_DEFS,
  type QuestId,
} from "@/lib/studio-quests";
import {
  Server,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  RefreshCw,
  Terminal,
  Check,
  Flag,
  Download,
} from "lucide-react";

const TOKEN_KEY = "vue3-learn-studio-token";

export const Route = createFileRoute("/studio")({
  component: StudioPage,
});

function StudioPage() {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  );
  const [user, setUser] = useState<ApiUser | null>(null);
  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [booting, setBooting] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demo = getDemoCredentials();
  const [email, setEmail] = useState(demo.email);
  const [password, setPassword] = useState(demo.password);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [questDone, setQuestDone] = useState<QuestId[]>(() =>
    typeof window !== "undefined" ? loadQuestDone() : [],
  );

  const markQuest = useCallback((id: QuestId) => {
    setQuestDone((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveQuestDone(next);
      return next;
    });
  }, []);

  const questProgress = useMemo(() => {
    const done = questDone.length;
    const total = QUEST_DEFS.length;
    return { done, total, pct: Math.round((done / total) * 100) };
  }, [questDone]);

  const allQuestsDone = questProgress.done === questProgress.total;

  const refreshLogs = useCallback(() => setLogs(getLogs()), []);

  const loadNotes = useCallback(
    async (t: string | null) => {
      const list = await apiListNotes(t);
      setNotes(list);
      refreshLogs();
    },
    [refreshLogs],
  );

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setBooting(true);
      setError(null);
      try {
        await (await import("@/mocks/browser")).startMockApi();
        if (!token) {
          setUser(null);
          setNotes([]);
          return;
        }
        const me = await apiMe(token);
        if (cancelled) return;
        setUser(me);
        await loadNotes(token);
      } catch (e) {
        if (cancelled) return;
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setNotes([]);
        setError(e instanceof Error ? e.message : "会话失效");
      } finally {
        if (!cancelled) {
          refreshLogs();
          setBooting(false);
        }
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [token, loadNotes, refreshLogs]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await (await import("@/mocks/browser")).startMockApi();
      const res = await apiLogin(email, password);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
      markQuest("login");
      await loadNotes(res.token);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        markQuest("fail401");
      }
      setError(err instanceof Error ? err.message : "登录失败");
      refreshLogs();
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    try {
      await apiLogout(token);
      markQuest("logout");
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setNotes([]);
      setBusy(false);
      refreshLogs();
    }
  }

  async function handleSaveNote(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (editingId) {
        await apiUpdateNote(token, editingId, { title, body });
        markQuest("edit");
      } else {
        await apiCreateNote(token, { title, body });
        markQuest("create");
      }
      setTitle("");
      setBody("");
      setEditingId(null);
      await loadNotes(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
      if (err instanceof ApiError && err.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }
      refreshLogs();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setBusy(true);
    setError(null);
    try {
      await apiDeleteNote(token, id);
      markQuest("delete");
      if (editingId === id) {
        setEditingId(null);
        setTitle("");
        setBody("");
      }
      await loadNotes(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
      refreshLogs();
    } finally {
      setBusy(false);
    }
  }

  function startEdit(n: ApiNote) {
    setEditingId(n.id);
    setTitle(n.title);
    setBody(n.body);
  }

  function exportNotes() {
    const payload = {
      exportedAt: new Date().toISOString(),
      user,
      notes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-${user?.email ?? "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <header className="mb-6">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
          <Server className="h-3.5 w-3.5" />
          v6 · 全栈工坊 + 闯关
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          模拟后端工作室
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          完成右侧 6 项闯关：登录、401、创建、编辑、删除、退出。账号{" "}
          <code className="rounded-sm bg-surface-3 px-1 font-mono text-xs">
            demo@vue.dev
          </code>{" "}
          /{" "}
          <code className="rounded-sm bg-surface-3 px-1 font-mono text-xs">
            password123
          </code>
        </p>
        <p className="mt-2 text-xs text-subtle">
          课程：
          <Link
            to="/lesson/$slug"
            params={{ slug: "rest-api" }}
            className="mx-1 text-primary no-underline hover:underline"
          >
            REST
          </Link>
          ·
          <Link
            to="/lesson/$slug"
            params={{ slug: "vue-ts" }}
            className="mx-1 text-primary no-underline hover:underline"
          >
            Vue+TS
          </Link>
          ·
          <Link
            to="/lesson/$slug"
            params={{ slug: "api-client" }}
            className="mx-1 text-primary no-underline hover:underline"
          >
            API 客户端
          </Link>
        </p>
      </header>

      {allQuestsDone ? (
        <div className="mb-4 rounded-xl border border-primary/35 bg-primary-soft px-4 py-3 text-sm text-primary">
          闯关全部完成。下一步：把同一套流程搬到真实 Vite/Nuxt 项目（见「毕业作品」与「部署」课）。
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-4">
          {booting ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
              恢复会话…
            </div>
          ) : !user ? (
            <section className="rounded-xl border border-border bg-surface p-5 shadow-soft sm:p-6">
              <h2 className="font-display text-lg font-semibold text-fg">
                登录
              </h2>
              <p className="mt-1 text-sm text-muted">
          真实 <code className="font-mono text-xs">fetch</code> + MSW Service Worker。
          打开浏览器 DevTools → Network 可看到 POST /api/auth/login、Authorization。
        </p>
        <p className="mt-1 hidden text-sm text-muted">
                模拟{" "}
                <span className="font-mono text-xs">POST /api/auth/login</span>
              </p>
              <form onSubmit={handleLogin} className="mt-4 max-w-sm space-y-3">
                <label className="block">
                  <span className="text-xs text-muted">email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
                    autoComplete="username"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-muted">password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
                    autoComplete="current-password"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={busy}>
                    {busy ? "请求中…" : "登录"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => {
                      setEmail(demo.email);
                      setPassword("wrong-password");
                    }}
                  >
                    填错密码（练 401）
                  </Button>
                </div>
              </form>
            </section>
          ) : (
            <>
              <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-fg">{user.name}</p>
                  <p className="font-mono text-xs text-muted">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void loadNotes(token)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    刷新
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={notes.length === 0}
                    onClick={exportNotes}
                  >
                    <Download className="h-3.5 w-3.5" />
                    导出 JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => void handleLogout()}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    退出
                  </Button>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                <h2 className="font-display text-base font-semibold text-fg">
                  {editingId ? "编辑笔记 · PUT" : "新建笔记 · POST"}
                </h2>
                <form onSubmit={handleSaveNote} className="mt-3 space-y-3">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="标题"
                    className="h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
                  />
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="正文"
                    rows={3}
                    className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={busy}>
                      <Plus className="h-3.5 w-3.5" />
                      {editingId ? "保存修改" : "创建"}
                    </Button>
                    {editingId ? (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setEditingId(null);
                          setTitle("");
                          setBody("");
                        }}
                      >
                        取消编辑
                      </Button>
                    ) : null}
                  </div>
                </form>
              </section>

              <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-base font-semibold text-fg">
                    GET /api/notes
                  </h2>
                  <span className="font-mono text-xs text-muted">
                    {notes.length} 条
                  </span>
                </div>
                {notes.length === 0 ? (
                  <p className="text-sm text-muted">暂无笔记，创建一条吧</p>
                ) : (
                  <ul className="space-y-2">
                    {notes.map((n) => (
                      <li
                        key={n.id}
                        className="rounded-lg border border-border bg-surface-2 px-3 py-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-fg">{n.title}</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                              {n.body || "（无正文）"}
                            </p>
                            <p className="mt-2 font-mono text-[10px] text-subtle">
                              {n.id} ·{" "}
                              {new Date(n.updatedAt).toLocaleString("zh-CN")}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              className="rounded-md p-2 text-muted hover:bg-bg hover:text-fg"
                              onClick={() => startEdit(n)}
                              aria-label="编辑"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-md p-2 text-muted hover:bg-danger/15 hover:text-danger"
                              onClick={() => void handleDelete(n.id)}
                              aria-label="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>

        <aside className="space-y-3">
          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-fg">
                <Flag className="h-3.5 w-3.5 text-primary" />
                闯关任务
              </p>
              <span className="font-mono text-[10px] tabular-nums text-muted">
                {questProgress.done}/{questProgress.total}
              </span>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${questProgress.pct}%` }}
              />
            </div>
            <ul className="space-y-1.5">
              {QUEST_DEFS.map((q) => {
                const done = questDone.includes(q.id);
                return (
                  <li
                    key={q.id}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-xs",
                      done ? "bg-primary-soft text-primary" : "bg-bg text-muted",
                    )}
                  >
                    <span className="flex items-start gap-1.5">
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          done ? "bg-primary text-primary-fg" : "bg-surface-3",
                        )}
                      >
                        {done ? <Check className="h-2.5 w-2.5" /> : null}
                      </span>
                      <span>
                        <span className="block font-medium">{q.title}</span>
                        <span className="text-[10px] opacity-80">{q.hint}</span>
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              className="mt-2 text-[11px] text-subtle hover:text-muted"
              onClick={() => {
                resetQuests();
                setQuestDone([]);
              }}
            >
              重置闯关进度
            </button>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-fg">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                请求日志
              </p>
              <button
                type="button"
                className="text-[11px] text-muted hover:text-fg"
                onClick={() => {
                  clearLogs();
                  refreshLogs();
                }}
              >
                清空
              </button>
            </div>
            {logs.length === 0 ? (
              <p className="text-xs text-muted">操作后显示 method / path / status</p>
            ) : (
              <ul className="max-h-[18rem] space-y-1.5 overflow-y-auto scrollbar-thin">
                {logs.map((l) => (
                  <li
                    key={l.id}
                    className="rounded-md bg-bg px-2 py-1.5 font-mono text-[10px] leading-relaxed"
                  >
                    <span
                      className={cn(
                        "mr-1.5 font-semibold",
                        l.status >= 400 ? "text-danger" : "text-primary",
                      )}
                    >
                      {l.status}
                    </span>
                    <span className="text-muted">{l.method}</span>{" "}
                    <span className="text-fg">{l.path}</span>
                    {l.detail ? (
                      <span className="mt-0.5 block text-subtle">{l.detail}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-3 text-xs text-muted">
            <p className="font-medium text-fg">教学提示</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>先点「填错密码」完成 401 任务</li>
              <li>再正确登录做 CRUD</li>
              <li>最后退出完成最后一关</li>
            </ul>
            <Button
              size="sm"
              variant="ghost"
              className="mt-3"
              onClick={() => {
                resetMockApi();
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
                setUser(null);
                setNotes([]);
                setError(null);
                refreshLogs();
              }}
            >
              重置模拟数据库
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
