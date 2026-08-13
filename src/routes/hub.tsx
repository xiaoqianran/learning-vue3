import { createFileRoute, Link } from "@tanstack/react-router";
import { LESSONS, getLessonsByTrack, getCourseLessons } from "@/data/lessons";
import {
  completedCount,
  getContinueLesson,
  isAllComplete,
  orderedTracks,
  progressPercent,
  trackLabel,
} from "@/lib/nav";
import { useProgress, todayKey } from "@/store/progress";
import { Button } from "@/components/ui/button";
import { Award, BookX, Flame, StickyNote, Target } from "lucide-react";
import { labMastery, scoresFor, useCausal, worldMastery } from "@/store/causal";
import { CAUSAL_LABS } from "@/causal/labs";

export const Route = createFileRoute("/hub")({
  component: HubPage,
});

function HubPage() {
  const completed = useProgress((s) => s.completed);
  const mastered = useProgress((s) => s.mastered);
  const quizScores = useProgress((s) => s.quizScores);
  const bookmarks = useProgress((s) => s.bookmarks);
  const notes = useProgress((s) => s.notes);
  const wrongBook = useProgress((s) => s.wrongBook);
  const streak = useProgress((s) => s.streak);
  const checkIns = useProgress((s) => s.checkIns);
  const checkInToday = useProgress((s) => s.checkInToday);

  const noteEntries = Object.entries(notes).filter(([, v]) => v.trim());
  const avgScore =
    Object.keys(quizScores).length === 0
      ? null
      : Math.round(
          Object.values(quizScores).reduce((a, b) => a + b, 0) / Object.keys(quizScores).length,
        );
  const checkedIn = checkIns.includes(todayKey());

  const cont = getContinueLesson(completed);
  const progress = progressPercent(completed);
  const doneCount = completedCount(completed);
  const allDone = isAllComplete(completed);
  const reset = useProgress((s) => s.reset);
  const causalLabs = useCausal((s) => s.labs);
  const causalPct = worldMastery(causalLabs);

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">v10 · 掌握度</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-fg">学习中心</h1>
        <p className="mt-1 text-sm text-muted">
          因果实验室看预测/消融/迁移；资料库课节仍按测验统计。
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-primary/30 bg-primary-soft p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
              Vue Causal Lab
            </p>
            <p className="mt-0.5 font-display text-base font-semibold text-fg">
              World 1 掌握 {causalPct}%
            </p>
            <p className="text-xs text-muted">预测 · 因果解释 · 反事实 · 迁移</p>
          </div>
          <Link to="/causal" className="no-underline">
            <Button>进入实验室</Button>
          </Link>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {CAUSAL_LABS.map((lab) => {
            const sc = scoresFor(lab.id, causalLabs[lab.id]);
            return (
              <li key={lab.id} className="rounded-lg border border-border/60 bg-bg/40 px-3 py-2">
                <Link
                  to="/causal/$labId"
                  params={{ labId: lab.id }}
                  className="text-sm font-medium text-fg no-underline hover:text-primary"
                >
                  {lab.concept}
                </Link>
                <p className="font-mono text-[11px] text-muted">
                  {labMastery(lab.id, causalLabs)}% · 预测 {sc.predict.correct}/{sc.predict.total}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
            {allDone ? "已毕业" : "资料库下一步"}
          </p>
          <p className="mt-0.5 font-display text-base font-semibold text-fg">
            {allDone ? "领取结业证明" : cont.title}
          </p>
          <p className="text-xs text-muted">
            {allDone
              ? `全部 ${LESSONS.length} 课 · 100%`
              : `${trackLabel(cont.track)} · 总进度 ${progress}%`}
          </p>
        </div>
        {allDone ? (
          <Link to="/certificate" className="no-underline">
            <Button>结业证明</Button>
          </Link>
        ) : (
          <Link to="/lesson/$slug" params={{ slug: cont.slug }} className="no-underline">
            <Button>{doneCount > 0 ? "继续学习" : "开始学习"}</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Target}
          label="主修完成"
          value={`${doneCount}/${getCourseLessons().length}`}
        />
        <Stat
          icon={Award}
          label="掌握 ≥80%"
          value={`${mastered.filter((s) => getCourseLessons().some((l) => l.slug === s)).length}/${getCourseLessons().length}`}
        />
        <Stat icon={Flame} label="连续打卡" value={`${streak} 天`} />
        <Stat icon={BookX} label="错题" value={String(wrongBook.length)} />
      </div>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-base font-semibold">路径进度</h2>
        <ul className="mt-3 space-y-2">
          {orderedTracks().map((t) => {
            const list = getLessonsByTrack(t);
            const done = list.filter((l) => completed.includes(l.slug)).length;
            const pct = list.length ? Math.round((done / list.length) * 100) : 0;
            return (
              <li key={t}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg">{trackLabel(t)}</span>
                  <span className="font-mono text-xs text-muted">
                    {done}/{list.length}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full bg-primary" style={{ width: pct + "%" }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">每日打卡</h2>
            <p className="mt-0.5 text-sm text-muted">
              {checkedIn ? "今天已打卡，保持节奏" : "完成测验或标记完成会自动打卡"}
            </p>
          </div>
          <Button variant={checkedIn ? "secondary" : "default"} onClick={() => checkInToday()}>
            {checkedIn ? "已打卡" : "立即打卡"}
          </Button>
        </div>
        {avgScore !== null ? (
          <p className="mt-3 font-mono text-xs text-muted">平均测验分 {avgScore}%</p>
        ) : null}
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          to="/mistakes"
          className="rounded-xl border border-border bg-surface p-4 no-underline transition-colors hover:border-border-strong"
        >
          <BookX className="h-5 w-5 text-primary" />
          <h3 className="mt-2 font-medium text-fg">错题本</h3>
          <p className="mt-1 text-sm text-muted">
            {wrongBook.length ? `${wrongBook.length} 道待复习` : "暂无错题，保持全对"}
          </p>
        </Link>
        <Link
          to="/certificate"
          className="rounded-xl border border-border bg-surface p-4 no-underline transition-colors hover:border-border-strong"
        >
          <Award className="h-5 w-5 text-primary" />
          <h3 className="mt-2 font-medium text-fg">结业证明</h3>
          <p className="mt-1 text-sm text-muted">完成全部 {LESSONS.length} 课后解锁</p>
        </Link>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-base font-semibold flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-primary" />
          我的笔记
        </h2>
        {noteEntries.length === 0 ? (
          <p className="mt-3 text-sm text-muted">在课程页底部写笔记，会显示在这里</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {noteEntries.map(([slug, text]) => {
              const lesson = LESSONS.find((l) => l.slug === slug);
              return (
                <li key={slug}>
                  <Link
                    to="/lesson/$slug"
                    params={{ slug }}
                    className="block rounded-lg border border-border bg-surface p-3 no-underline hover:border-border-strong"
                  >
                    <p className="text-sm font-medium text-fg">{lesson?.title ?? slug}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{text}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-display text-sm font-semibold text-fg">数据</h2>
        <p className="mt-1 text-xs text-muted">进度保存在本机浏览器，换设备不会同步。</p>
        {doneCount > 0 ? (
          <button
            type="button"
            className="mt-3 text-xs text-subtle underline-offset-2 hover:text-danger hover:underline"
            onClick={() => {
              if (window.confirm("确定重置全部学习进度？此操作不可撤销。")) reset();
            }}
          >
            重置学习进度
          </button>
        ) : (
          <p className="mt-3 text-xs text-subtle">尚无进度可重置</p>
        )}
      </section>

      {bookmarks.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-display text-base font-semibold">收藏课程</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {bookmarks.map((slug) => {
              const l = LESSONS.find((x) => x.slug === slug);
              if (!l) return null;
              return (
                <Link
                  key={slug}
                  to="/lesson/$slug"
                  params={{ slug }}
                  className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-fg no-underline hover:border-primary/40"
                >
                  {l.title}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-3 font-mono text-xl font-semibold tabular-nums text-fg">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}
