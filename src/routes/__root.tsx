import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
  useRouterState,
} from "@tanstack/react-router";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Menu,
  MoreHorizontal,
  Search,
  X,
  Play,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";
import { LESSONS, getLessonsByTrack } from "@/data/lessons";
import appCss from "@/styles.css?url";
import { CatppuccinSwitcher } from "@/components/CatppuccinSwitcher";
import { applyCtpAccent, applyCtpFlavor, readCtpAccent, readCtpFlavor } from "@/lib/catppuccin";
import {
  getContinueHref,
  getContinueLesson,
  isAllComplete,
  NAV_PRIMARY,
  NAV_TOOLS,
  orderedTracks,
  trackLabel,
} from "@/lib/nav";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Vue 3 实战学习 v8 · 系统路径",
      },
      {
        name: "description",
        content:
          "Vue 3 中文交互教程：清晰学习路径、文档地图、讲解+源码+Demo、Catppuccin 主题与全栈工坊。",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <AppShell>
        <Outlet />
      </AppShell>
    </RootDocument>
  );
}

const CTP_BOOT =
  "(function(){try{var f=localStorage.getItem('vue3-learn-ctp-flavor');var a=localStorage.getItem('vue3-learn-ctp-accent');var okF=['mocha','macchiato','frappe','latte'];var okA=['green','mauve','blue','lavender','sapphire','teal','peach','pink'];if(okF.indexOf(f)<0)f='mocha';if(okA.indexOf(a)<0)a='green';document.documentElement.setAttribute('data-ctp-flavor',f);document.documentElement.setAttribute('data-ctp-accent',a);}catch(e){document.documentElement.setAttribute('data-ctp-flavor','mocha');document.documentElement.setAttribute('data-ctp-accent','green');}})();";

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" data-ctp-flavor="mocha" data-ctp-accent="green">
      <head>
        <script dangerouslySetInnerHTML={{ __html: CTP_BOOT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarQ, setSidebarQ] = useState("");
  const completed = useProgress((s) => s.completed);
  const streak = useProgress((s) => s.streak);
  const checkInToday = useProgress((s) => s.checkInToday);
  const progress = Math.round((completed.length / LESSONS.length) * 100);
  const cont = getContinueLesson(completed);
  const continueTo = getContinueHref(completed);
  const allDone = isAllComplete(completed);
  const moreRef = useRef<HTMLDivElement>(null);
  const activeLessonSlug = useRouterState({
    select: (s) => {
      const m = s.location.pathname.match(/\/lesson\/([^/]+)/);
      return m?.[1] ? decodeURIComponent(m[1]) : null;
    },
  });

  const contTrack = cont.track;
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const tr of orderedTracks()) init[tr] = tr === contTrack || tr === "基础";
    return init;
  });

  useEffect(() => {
    if (!activeLessonSlug) return;
    const lesson = LESSONS.find((l) => l.slug === activeLessonSlug);
    if (!lesson) return;
    setExpanded((prev) => ({ ...prev, [lesson.track]: true }));
  }, [activeLessonSlug]);

  useEffect(() => {
    if (!activeLessonSlug) return;
    const id = window.setTimeout(() => {
      const sel = `[data-lesson-slug="${activeLessonSlug.replace(/"/g, "")}"]`;
      document.querySelector(sel)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 50);
    return () => window.clearTimeout(id);
  }, [activeLessonSlug, expanded, open]);

  useEffect(() => {
    checkInToday();
  }, [checkInToday]);

  useEffect(() => {
    applyCtpFlavor(readCtpFlavor());
    applyCtpAccent(readCtpAccent());
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    function onPointer(e: MouseEvent) {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [moreOpen]);

  const q = sidebarQ.trim().toLowerCase();
  const tracks = orderedTracks();

  const filteredByTrack = useMemo(() => {
    return tracks
      .map((track) => {
        let list = getLessonsByTrack(track);
        if (q) {
          list = list.filter(
            (l) =>
              l.title.toLowerCase().includes(q) ||
              l.summary.toLowerCase().includes(q) ||
              l.slug.includes(q),
          );
        }
        return { track, list };
      })
      .filter((g) => g.list.length > 0);
  }, [q, tracks]);

  function closeNav() {
    setOpen(false);
  }

  function toggleTrack(track: string) {
    setExpanded((prev) => ({ ...prev, [track]: !prev[track] }));
  }

  return (
    <div className="min-h-dvh text-fg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-fg lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "关闭目录" : "打开目录"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5 no-underline"
            onClick={closeNav}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="truncate font-display text-sm font-semibold tracking-tight text-fg">
              Vue 3 实战学习
            </span>
            <span className="hidden rounded-full bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-primary sm:inline">
              v8
            </span>
          </Link>

          <nav className="ml-2 hidden items-center gap-0.5 md:flex">
            {NAV_PRIMARY.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-2.5 py-1.5 text-xs text-muted no-underline transition-colors hover:bg-surface-2 hover:text-fg [&.active]:bg-primary-soft [&.active]:text-primary"
                activeProps={{ className: "active" }}
              >
                {item.label}
              </Link>
            ))}
            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-fg",
                  moreOpen && "bg-surface-2 text-fg",
                )}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
                更多
                <ChevronDown
                  className={cn("h-3 w-3 transition-transform", moreOpen && "rotate-180")}
                />
              </button>
              {moreOpen ? (
                <div
                  role="menu"
                  className="absolute left-0 z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-border bg-surface shadow-soft"
                >
                  <p className="border-b border-border px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-subtle">
                    查 · 练 · 工具
                  </p>
                  <ul className="p-1">
                    {NAV_TOOLS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            role="menuitem"
                            onClick={() => setMoreOpen(false)}
                            className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 no-underline transition-colors hover:bg-surface-2 [&.active]:bg-primary-soft"
                            activeProps={{ className: "active" }}
                          >
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>
                              <span className="block text-sm text-fg">{item.label}</span>
                              {item.hint ? (
                                <span className="block text-[11px] text-muted">{item.hint}</span>
                              ) : null}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {continueTo.kind === "certificate" ? (
              <Link
                to="/certificate"
                className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-fg no-underline hover:opacity-90 sm:gap-1.5 sm:px-3"
              >
                结业
              </Link>
            ) : (
              <Link
                to="/lesson/$slug"
                params={{ slug: continueTo.slug! }}
                className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-fg no-underline hover:opacity-90 sm:gap-1.5 sm:px-3"
              >
                <Play className="h-3 w-3" />
                {allDone ? "复习" : completed.length > 0 ? "继续" : "开始"}
              </Link>
            )}
            <div className="hidden sm:block">
              <CatppuccinSwitcher mode="popover" />
            </div>
            {streak > 0 ? (
              <span className="hidden font-mono text-xs tabular-nums text-muted xl:inline">
                {streak} 天
              </span>
            ) : null}
            <Link
              to="/hub"
              className="hidden items-center gap-2 no-underline sm:flex"
              title="学习中心 · 进度详情"
            >
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-3 sm:w-20">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-mono text-xs tabular-nums text-muted">{progress}%</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-[min(18.5rem,90vw)] border-r border-border bg-surface pt-14 transition-transform duration-200 ease-out lg:static lg:z-0 lg:w-72 lg:shrink-0 lg:translate-x-0 lg:border-r lg:bg-transparent lg:pt-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <nav className="scrollbar-thin flex h-[calc(100dvh-3.5rem)] flex-col overflow-y-auto p-3 lg:sticky lg:top-14 lg:h-[calc(100dvh-3.5rem)] lg:py-5">
            {/* 继续学习 */}
            {continueTo.kind === "certificate" ? (
              <Link
                to="/certificate"
                onClick={closeNav}
                className="mb-3 flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary-soft px-3 py-2.5 no-underline transition-opacity hover:opacity-90"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-fg">
                  <Play className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-primary">
                    路径已完成
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-semibold text-fg">
                    领取结业证明
                  </span>
                  <span className="block text-[11px] text-muted">
                    全部 {LESSONS.length} 课已完成
                  </span>
                </span>
              </Link>
            ) : (
              <Link
                to="/lesson/$slug"
                params={{ slug: continueTo.slug! }}
                onClick={closeNav}
                className="mb-3 flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary-soft px-3 py-2.5 no-underline transition-opacity hover:opacity-90"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-fg">
                  <Play className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-primary">
                    {completed.length > 0 ? "继续学习" : "开始学习"}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-semibold text-fg">
                    {cont.title}
                  </span>
                  <span className="block text-[11px] text-muted">{trackLabel(cont.track)}</span>
                </span>
              </Link>
            )}

            {/* 搜索 */}
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
              <input
                value={sidebarQ}
                onChange={(e) => setSidebarQ(e.target.value)}
                placeholder="搜索课程…"
                className="h-9 w-full rounded-lg border border-border bg-bg pl-8 pr-2 text-xs text-fg placeholder:text-subtle"
              />
            </div>

            {/* 精简入口 */}
            <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-wider text-subtle">
              查 · 练 · 我
            </p>
            <ul className="mb-3 flex flex-col gap-0.5">
              {NAV_PRIMARY.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={closeNav}
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-fg no-underline transition-colors hover:bg-surface-2 [&.active]:bg-primary-soft [&.active]:text-primary"
                      activeProps={{ className: "active" }}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-70" />
                      <span className="min-w-0">
                        <span className="block">{item.label}</span>
                        {item.hint ? (
                          <span className="block text-[10px] text-subtle">{item.hint}</span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <details className="mb-3 rounded-lg border border-border bg-surface-2/60">
              <summary className="cursor-pointer list-none px-2.5 py-2 text-xs font-medium text-muted marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-1">
                  更多工具
                  <ChevronDown className="h-3 w-3" />
                </span>
              </summary>
              <ul className="border-t border-border px-1 py-1">
                {NAV_TOOLS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={closeNav}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-fg no-underline hover:bg-surface-3 [&.active]:text-primary"
                        activeProps={{ className: "active" }}
                      >
                        <Icon className="h-3.5 w-3.5 opacity-70" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>

            {/* 按路径分组的课表 */}
            <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-wider text-subtle">
              学习路径
            </p>
            <div className="flex flex-col gap-1">
              {filteredByTrack.map(({ track, list }) => {
                const done = list.filter((l) => completed.includes(l.slug)).length;
                const isOpen = q ? true : !!expanded[track];
                return (
                  <div key={track} className="rounded-lg">
                    <button
                      type="button"
                      onClick={() => toggleTrack(track)}
                      className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs font-medium text-fg hover:bg-surface-2"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-subtle" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-subtle" />
                      )}
                      <span className="min-w-0 flex-1 truncate">{trackLabel(track)}</span>
                      <span className="font-mono text-[10px] tabular-nums text-subtle">
                        {done}/{list.length}
                      </span>
                    </button>
                    {isOpen ? (
                      <ul className="mb-1 ml-1 flex flex-col gap-0.5 border-l border-border pl-2">
                        {list.map((lesson) => {
                          const globalIdx = LESSONS.findIndex((l) => l.slug === lesson.slug);
                          const isDone = completed.includes(lesson.slug);
                          return (
                            <li key={lesson.slug}>
                              <Link
                                to="/lesson/$slug"
                                params={{ slug: lesson.slug }}
                                onClick={closeNav}
                                data-lesson-slug={lesson.slug}
                                className={cn(
                                  "flex items-start gap-2 rounded-md px-2 py-1.5 text-sm text-fg no-underline transition-colors hover:bg-surface-2 [&.active]:bg-primary-soft [&.active]:text-primary",
                                  activeLessonSlug === lesson.slug &&
                                    "bg-primary-soft text-primary",
                                )}
                                activeProps={{ className: "active" }}
                              >
                                <span
                                  className={cn(
                                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-medium",
                                    isDone
                                      ? "bg-primary text-primary-fg"
                                      : "bg-surface-3 text-muted",
                                  )}
                                >
                                  {isDone ? <Check className="h-2.5 w-2.5" /> : globalIdx + 1}
                                </span>
                                <span className="min-w-0 leading-snug">{lesson.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
              {filteredByTrack.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-muted">无匹配课程</p>
              ) : null}
            </div>

            {/* 主题：角落，不抢主路径 */}
            <div className="mt-auto border-t border-border pt-3">
              <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-subtle">
                外观
              </p>
              <div className="px-0.5 sm:hidden">
                <CatppuccinSwitcher mode="popover" />
              </div>
              <div className="hidden sm:block">
                <CatppuccinSwitcher mode="popover" className="w-full" />
              </div>
              <p className="mt-2 px-1 text-[10px] leading-relaxed text-subtle">
                学路径 · 查文档 · 练工坊 · 看进度
              </p>
            </div>
          </nav>
        </aside>

        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-bg/60 lg:hidden"
            aria-label="关闭遮罩"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
