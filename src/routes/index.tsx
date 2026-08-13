import { createFileRoute, Link } from "@tanstack/react-router";
import { LESSONS, getLessonsByTrack } from "@/data/lessons";
import { useProgress } from "@/store/progress";
import { labMastery, useCausal, worldMastery } from "@/store/causal";
import { CAUSAL_LABS } from "@/causal/labs";
import { PROGRAM_WORLDS } from "@/causal/worlds";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Clock,
  Search,
  Library,
  BookMarked,
  Server,
  Code2,
  LayoutDashboard,
  Sparkles,
  Lock,
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

const LOOP = [
  "需求出现",
  "我先预测",
  "最小修改",
  "语义 Diff",
  "Vue 真运行",
  "X-Ray 点亮",
  "删掉试试",
  "理解 WHY",
];

function HomePage() {
  const completed = useProgress((s) => s.completed);
  const quizScores = useProgress((s) => s.quizScores);
  const streak = useProgress((s) => s.streak);
  const causalLabs = useCausal((s) => s.labs);
  const [q, setQ] = useState("");
  const [track, setTrack] = useState<TrackFilter>("全部");

  const progress = progressPercent(completed);
  const doneCount = completedCount(completed);
  const cont = getContinueLesson(completed);
  const contIdx = LESSONS.findIndex((l) => l.slug === cont.slug);
  const allDone = isAllComplete(completed);
  const causalPct = worldMastery(causalLabs);

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
              Vue Causal Lab · See Vue Think
            </p>
            {streak > 0 ? (
              <span className="rounded-full bg-surface-3 px-2.5 py-1 font-mono text-xs text-muted">
                连续 {streak} 天
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance text-fg sm:text-4xl">
            Vue — 从一个按钮生长成完整应用
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
            逐步改变代码，实时观察程序为何随之改变。训练的不是会不会敲{" "}
            <code className="rounded-sm bg-surface-3 px-1 font-mono text-[13px]">computed()</code>
            ，而是能不能看见 Vue 背后的因果结构。
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link to="/causal/$labId" params={{ labId: "ref" }} className="no-underline">
              <Button size="lg" className="w-full sm:w-auto">
                {causalPct > 0 ? "继续因果实验" : "打开程序时间机器"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/causal" className="no-underline">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                World 1 · 三个概念
              </Button>
            </Link>
          </div>

          <p className="mt-4 font-mono text-xs text-subtle">
            World 1 掌握 {causalPct}% · 资料库 {doneCount}/{LESSONS.length} 课
          </p>

          <ol className="mt-6 flex flex-wrap gap-1.5">
            {LOOP.map((step, i) => (
              <li
                key={step}
                className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-[11px] text-muted"
              >
                <span className="font-mono text-primary">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-fg">World 1 · 一个按钮活起来</h2>
        <p className="mt-1 text-sm text-muted">
          只做 ref、computed、watch。但必须同时拥有时间轴、预测、消融和反事实。
        </p>
        <ol className="mt-4 space-y-2">
          {CAUSAL_LABS.map((lab) => {
            const m = labMastery(lab.id, causalLabs);
            return (
              <li key={lab.id}>
                <Link
                  to="/causal/$labId"
                  params={{ labId: lab.id }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 no-underline hover:border-border-strong hover:bg-surface-2"
                >
                  <span className="font-mono text-xs text-primary">{lab.concept}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-fg">{lab.title}</span>
                    <span className="block text-xs text-muted">{lab.subtitle}</span>
                  </span>
                  <span className="font-mono text-xs text-subtle">{m}%</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-fg">一个软件系统的生命史</h2>
        <p className="mt-1 text-sm text-muted">知识不再是第 1 课、第 2 课，而是程序世界不断变复杂。</p>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {PROGRAM_WORLDS.map((w) => (
            <li
              key={w.id}
              className={cn(
                "rounded-xl border px-4 py-3",
                w.status === "ready"
                  ? "border-primary/35 bg-primary-soft/40"
                  : "border-border bg-surface",
              )}
            >
              <p className="flex items-center gap-1.5 text-sm font-semibold text-fg">
                {w.status === "soon" ? <Lock className="h-3.5 w-3.5 text-subtle" /> : null}
                World {w.n}
              </p>
              <p className="mt-0.5 text-sm text-fg">{w.title}</p>
              <p className="text-xs text-muted">{w.blurb}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 grid gap-2 sm:grid-cols-2">
        {[
          { to: "/docs" as const, icon: Library, title: "资料库 · 文档地图", desc: "69 节对照官网" },
          { to: "/cheatsheet" as const, icon: BookMarked, title: "速查表", desc: "写码时扫一眼 API" },
          { to: "/studio" as const, icon: Server, title: "全栈工坊", desc: "模拟 REST / 鉴权" },
          { to: "/playground" as const, icon: Code2, title: "SFC 编辑器", desc: "真实 Vue 单文件" },
          { to: "/hub" as const, icon: LayoutDashboard, title: "学习中心", desc: "掌握度 · 打卡 · 错题" },
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

      <section id="course-outline" className="mt-12 scroll-mt-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-fg">资料库 · 参考课节</h2>
            <p className="mt-1 text-sm text-muted">
              69 节仍在。它们是 Reference Library，不是主路径。主路径是程序世界的生命史。
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

        {allDone ? (
          <p className="mt-3 text-xs text-muted">资料库已读完 · 总进度 {progress}%</p>
        ) : (
          <p className="mt-3 text-xs text-muted">
            资料库下一节：{trackLabel(cont.track)} · {cont.title}（#{String(contIdx + 1).padStart(2, "0")}）
          </p>
        )}

        <ol className="mt-4 flex flex-col gap-2">
          {pathCards.length && track !== "全部" ? null : null}
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
                      <h3 className="font-medium text-fg group-hover:text-primary">{lesson.title}</h3>
                      <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-muted">
                        {trackLabel(lesson.track)}
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
