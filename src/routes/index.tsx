import { createFileRoute, Link } from "@tanstack/react-router";
import { LESSONS, getLessonsByTrack } from "@/data/lessons";
import { useProgress } from "@/store/progress";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Sparkles,
  RotateCcw,
  Search,
  FlaskConical,
  LayoutDashboard,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type TrackFilter = "全部" | "基础" | "进阶" | "全栈准备" | "全栈实训" | "工程化" | "进阶模式" | "官网对齐";

function HomePage() {
  const completed = useProgress((s) => s.completed);
  const quizScores = useProgress((s) => s.quizScores);
  const streak = useProgress((s) => s.streak);
  const bookmarks = useProgress((s) => s.bookmarks);
  const reset = useProgress((s) => s.reset);
  const [q, setQ] = useState("");
  const [track, setTrack] = useState<TrackFilter>("全部");

  const progress = Math.round((completed.length / LESSONS.length) * 100);
  const firstIncomplete =
    LESSONS.find((l) => !completed.includes(l.slug)) ?? LESSONS[0];
  const fullstackCount = LESSONS.filter((l) => l.track === "全栈准备").length;

  const filtered = useMemo(() => {
    let list =
      track === "全部" ? LESSONS : getLessonsByTrack(track);
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(s) ||
          l.summary.toLowerCase().includes(s) ||
          l.slug.includes(s),
      );
    }
    return list;
  }, [q, track]);

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <section className="relative overflow-hidden rounded-xl border border-border bg-surface px-5 py-8 sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px 200px at 10% -10%, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 70%)",
          }}
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg/60 px-2.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              v8 · 官网对齐
            </p>
            {streak > 0 ? (
              <span className="rounded-full bg-surface-3 px-2.5 py-1 font-mono text-xs text-muted">
                连续学习 {streak} 天
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance text-fg sm:text-4xl">
            带你系统学 Vue 3
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
            v7：Teleport / KeepAlive / 自定义指令 / 性能 / 面试串讲，并新增速查表。
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/studio" className="no-underline">
              <Button size="lg">
                打开全栈工坊
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              to="/lesson/$slug"
              params={{ slug: "teleport" }}
              className="no-underline"
            >
              <Button size="lg" variant="secondary">
                官网对齐
              </Button>
            </Link>
            <Link to="/cheatsheet" className="no-underline">
              <Button size="lg" variant="secondary">
                速查表
              </Button>
            </Link>
            <Link to="/playground" className="no-underline">
              <Button size="lg" variant="secondary">
                <Code2 className="h-4 w-4" />
                SFC 编辑器
              </Button>
            </Link>
            <Link
              to="/lesson/$slug"
              params={{ slug: firstIncomplete.slug }}
              className="no-underline"
            >
              <Button size="lg" variant="ghost">
                {completed.length > 0 ? "继续学习" : "从第一节"}
              </Button>
            </Link>
            <Link to="/lab" className="no-underline">
              <Button size="lg" variant="ghost">
                <FlaskConical className="h-4 w-4" />
                练习场
              </Button>
            </Link>
            <Link to="/hub" className="no-underline">
              <Button size="lg" variant="ghost">
                <LayoutDashboard className="h-4 w-4" />
                学习中心
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="h-2 min-w-[8rem] flex-1 overflow-hidden rounded-full bg-surface-3 sm:max-w-xs">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-xs tabular-nums text-muted">
              已完成 {completed.length}/{LESSONS.length}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <BookOpen className="h-3.5 w-3.5" />
              约 {LESSONS.reduce((a, l) => a + l.minutes, 0)} 分钟
            </span>
            {completed.length > 0 ? (
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center gap-1 text-xs text-subtle hover:text-muted"
              >
                <RotateCcw className="h-3 w-3" />
                重置进度
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {bookmarks.length > 0 ? (
        <section className="mt-6 rounded-xl border border-border bg-surface-2 px-4 py-3">
          <p className="text-xs font-medium text-muted">我的收藏</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {bookmarks.map((slug) => {
              const l = LESSONS.find((x) => x.slug === slug);
              if (!l) return null;
              return (
                <Link
                  key={slug}
                  to="/lesson/$slug"
                  params={{ slug }}
                  className="rounded-full border border-border bg-bg px-3 py-1 text-xs text-fg no-underline hover:border-primary/40"
                >
                  {l.title}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-fg">
              课程大纲
            </h2>
            <p className="mt-1 text-sm text-muted">搜索与路径筛选</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["全部", "基础", "进阶", "官网对齐", "全栈准备", "全栈实训", "工程化", "进阶模式"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrack(t)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  track === t
                    ? "bg-primary text-primary-fg"
                    : "bg-surface-3 text-muted hover:text-fg",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索课程标题或摘要…"
            className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm text-fg placeholder:text-subtle"
          />
        </div>

        <ol className="mt-4 flex flex-col gap-2">
          {filtered.map((lesson) => {
            const i = LESSONS.findIndex((l) => l.slug === lesson.slug);
            const done = completed.includes(lesson.slug);
            const score = quizScores[lesson.slug];
            return (
              <li key={lesson.slug}>
                <Link
                  to="/lesson/$slug"
                  params={{ slug: lesson.slug }}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 no-underline transition-colors duration-150 hover:border-border-strong hover:bg-surface-2 sm:items-center"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-mono text-sm font-medium",
                      done
                        ? "bg-primary text-primary-fg"
                        : "bg-surface-3 text-muted",
                    )}
                  >
                    {done ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      String(i + 1).padStart(2, "0")
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-fg group-hover:text-primary">
                        {lesson.title}
                      </h3>
                      <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                        {lesson.level}
                      </span>
                      {lesson.track === "进阶" ? (
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium text-primary">
                          进阶线
                        </span>
                      ) : null}
                      {lesson.track === "全栈准备" ? (
                        <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-medium text-fg">
                          全栈准备
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{lesson.summary}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-subtle">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.minutes} 分
                    </span>
                    {score !== undefined ? (
                      <span className="font-mono text-primary">
                        测验 {score}%
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              没有匹配的课程，试试其他关键词
            </li>
          ) : null}
        </ol>
      </section>
    </div>
  );
}
