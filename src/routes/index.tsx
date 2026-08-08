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
  Search,
  Library,
  BookMarked,
  Server,
  Code2,
  FlaskConical,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  completedCount,
  getContinueLesson,
  isAllComplete,
  orderedTracks,
  progressPercent,
  TRACK_META,
  trackLabel,
} from "@/lib/nav";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type TrackFilter = "全部" | (typeof LESSONS)[number]["track"];

function HomePage() {
  const completed = useProgress((s) => s.completed);
  const quizScores = useProgress((s) => s.quizScores);
  const streak = useProgress((s) => s.streak);
  const [q, setQ] = useState("");
  const [track, setTrack] = useState<TrackFilter>("全部");

  const progress = progressPercent(completed);
  const doneCount = completedCount(completed);
  const cont = getContinueLesson(completed);
  const contIdx = LESSONS.findIndex((l) => l.slug === cont.slug);
  const allDone = isAllComplete(completed);

  const filtered = useMemo(() => {
    let list = track === "全部" ? LESSONS : getLessonsByTrack(track);
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

  const pathCards = orderedTracks().map((t) => {
    const list = getLessonsByTrack(t);
    const done = list.filter((l) => completed.includes(l.slug)).length;
    return {
      track: t,
      ...TRACK_META[t],
      done,
      total: list.length,
      pct: list.length ? Math.round((done / list.length) * 100) : 0,
    };
  });

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* Hero：一条主路 */}
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
              v9 · 源码即运行
            </p>
            {streak > 0 ? (
              <span className="rounded-full bg-surface-3 px-2.5 py-1 font-mono text-xs text-muted">
                连续 {streak} 天
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance text-fg sm:text-4xl">
            带你系统学 Vue 3
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
            讲解 → 同一段 Vue 源码真运行 → 测验（≥80% 掌握）。对照官网{" "}
            <Link to="/docs" className="text-primary no-underline hover:underline">
              文档地图
            </Link>
            ，需要时再查速查表与工坊。
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {allDone ? (
              <Link to="/certificate" className="no-underline">
                <Button size="lg" className="w-full sm:w-auto">
                  领取结业证明
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/lesson/$slug" params={{ slug: cont.slug }} className="no-underline">
                <Button size="lg" className="w-full sm:w-auto">
                  {doneCount > 0 ? "继续学习" : "从第一节开始"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link to="/hub" className="no-underline">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <LayoutDashboard className="h-4 w-4" />
                学习中心
              </Button>
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-bg/50 p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-subtle">
              {allDone ? "全部完成" : `下一课 · ${trackLabel(cont.track)}`}
            </p>
            <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-fg">
                  {allDone ? "可以生成结业证明" : cont.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                  {allDone ? "想复习可从下方路径点回任意一课。" : cont.summary}
                </p>
              </div>
              {!allDone ? (
                <span className="shrink-0 font-mono text-xs text-subtle">
                  #{String(contIdx + 1).padStart(2, "0")} · {cont.minutes} 分
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="h-2 min-w-[8rem] flex-1 overflow-hidden rounded-full bg-surface-3 sm:max-w-xs">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-xs tabular-nums text-muted">
              {doneCount}/{LESSONS.length}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <BookOpen className="h-3.5 w-3.5" />约 {LESSONS.reduce((a, l) => a + l.minutes, 0)}{" "}
              分钟
            </span>
            <Link to="/hub" className="text-xs text-primary no-underline hover:underline">
              详细进度 →
            </Link>
          </div>
        </div>
      </section>

      {/* 怎么用：学 / 查 / 练 / 我 */}
      <section className="mt-6 grid gap-2 sm:grid-cols-2">
        {[
          {
            to: "/docs" as const,
            icon: Library,
            title: "查 · 文档地图",
            desc: "官网章节 ↔ 本站课",
          },
          {
            to: "/cheatsheet" as const,
            icon: BookMarked,
            title: "查 · 速查表",
            desc: "写码时扫一眼 API",
          },
          {
            to: "/studio" as const,
            icon: Server,
            title: "练 · 全栈工坊",
            desc: "模拟 REST / 鉴权",
          },
          {
            to: "/playground" as const,
            icon: Code2,
            title: "练 · SFC 编辑器",
            desc: "真实 Vue 单文件",
          },
          {
            to: "/lab" as const,
            icon: FlaskConical,
            title: "练 · 练习场",
            desc: "刷测验题",
          },
          {
            to: "/hub" as const,
            icon: LayoutDashboard,
            title: "我 · 学习中心",
            desc: "进度 · 打卡 · 错题",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to + item.title}
              to={item.to}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 no-underline transition-colors hover:border-border-strong hover:bg-surface-2"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-medium text-fg">{item.title}</span>
                <span className="block text-xs text-muted">{item.desc}</span>
              </span>
            </Link>
          );
        })}
      </section>

      {/* 路径总览 */}
      <section className="mt-8">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-fg">七条学习路径</h2>
            <p className="mt-1 text-sm text-muted">建议按 ①→⑥ 主路径学完，⑦ 官网补全为可选加深</p>
          </div>
        </div>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {pathCards.map((p) => (
            <li key={p.track}>
              <button
                type="button"
                onClick={() => {
                  setTrack(p.track);
                  document
                    .getElementById("course-outline")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                  track === p.track
                    ? "border-primary/40 bg-primary-soft"
                    : "border-border bg-surface hover:border-border-strong hover:bg-surface-2",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-fg">{p.label}</span>
                  <span className="font-mono text-[11px] text-muted">
                    {p.done}/{p.total}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{p.blurb}</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p.pct}%` }} />
                </div>
              </button>
            </li>
          ))}
        </ol>
      </section>

      {/* 大纲：筛选 + 列表 */}
      <section id="course-outline" className="mt-10 scroll-mt-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-fg">课程大纲</h2>
            <p className="mt-1 text-sm text-muted">
              {track === "全部"
                ? `全部 ${LESSONS.length} 课`
                : `${trackLabel(track as (typeof LESSONS)[number]["track"])} · ${filtered.length} 课`}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setTrack("全部")}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                track === "全部"
                  ? "bg-primary text-primary-fg"
                  : "bg-surface-3 text-muted hover:text-fg",
              )}
            >
              全部
            </button>
            {orderedTracks().map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrack(t)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                  track === t
                    ? "bg-primary text-primary-fg"
                    : "bg-surface-3 text-muted hover:text-fg",
                )}
              >
                {TRACK_META[t].label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索标题、摘要或 slug…"
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
                      done ? "bg-primary text-primary-fg" : "bg-surface-3 text-muted",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-fg group-hover:text-primary">
                        {lesson.title}
                      </h3>
                      <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-muted">
                        {trackLabel(lesson.track)}
                      </span>
                      <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] text-subtle">
                        {lesson.level}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{lesson.summary}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-subtle">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.minutes} 分
                    </span>
                    {score !== undefined ? (
                      <span className="font-mono text-primary">测验 {score}%</span>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              没有匹配的课程
            </li>
          ) : null}
        </ol>
      </section>
    </div>
  );
}
