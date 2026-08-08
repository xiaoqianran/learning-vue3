import { createFileRoute, Link } from "@tanstack/react-router";
import { getLessonsByTrack } from "@/data/lessons";
import { orderedTracks, trackLabel } from "@/lib/nav";
import { useProgress, isCertificateReady, coreProgress } from "@/store/progress";
import { Button } from "@/components/ui/button";
import { Award, Lock } from "lucide-react";

export const Route = createFileRoute("/certificate")({
  component: CertificatePage,
});

function CertificatePage() {
  const completed = useProgress((s) => s.completed);
  const mastered = useProgress((s) => s.mastered);
  const quizScores = useProgress((s) => s.quizScores);
  const streak = useProgress((s) => s.streak);
  const unlocked = isCertificateReady(mastered, completed);
  const core = coreProgress(completed, mastered);
  const avg =
    Object.keys(quizScores).length === 0
      ? 0
      : Math.round(
          Object.values(quizScores).reduce((a, b) => a + b, 0) /
            Object.keys(quizScores).length,
        );

  return (
    <div className="mx-auto max-w-lg pb-16">
      <header className="mb-6 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          v9 · 掌握度结业
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-fg">结业证明</h1>
        <p className="mt-1 text-sm text-muted">
          主修课测验 ≥80% 掌握后解锁（官网知识卡片不计入硬门槛）
        </p>
      </header>

      <section className="mb-4 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-medium text-fg">主修 / 各路径</h2>
        <ul className="mt-3 space-y-2">
          {orderedTracks().map((t) => {
            const list = getLessonsByTrack(t);
            const done = list.filter((l) => completed.includes(l.slug)).length;
            const mast = list.filter((l) => mastered.includes(l.slug)).length;
            const pct = list.length ? Math.round((mast / list.length) * 100) : 0;
            return (
              <li key={t}>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">
                    {trackLabel(t)}
                    {t === "官网对齐" ? " · 可选" : ""}
                  </span>
                  <span className="font-mono text-subtle">
                    掌握 {mast}/{list.length} · 完成 {done}
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {!unlocked ? (
        <section className="rounded-xl border border-border bg-surface p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-4 text-sm text-muted">
            主修掌握 {core.mastered}/{core.total}（测验≥80%）· 完成 {core.completed}/
            {core.total}
          </p>
          <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${core.pctMastered}%` }}
            />
          </div>
          <Link to="/" className="mt-6 inline-block no-underline">
            <Button>回路径继续</Button>
          </Link>
        </section>
      ) : (
        <section className="rounded-xl border border-primary/30 bg-surface p-8 text-center shadow-soft">
          <Award className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 font-display text-xl font-semibold text-fg">Vue 3 主修结业</h2>
          <p className="mt-2 text-sm text-muted">
            兹证明持有人已掌握本站主修路径（测验 ≥80%），并完成工坊 / SFC 等实践模块。
          </p>
          <dl className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3 text-left text-sm">
            <div className="rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-xs text-subtle">主修掌握</dt>
              <dd className="font-mono text-primary">
                {core.mastered}/{core.total}
              </dd>
            </div>
            <div className="rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-xs text-subtle">平均测验</dt>
              <dd className="font-mono text-primary">{avg}%</dd>
            </div>
            <div className="rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-xs text-subtle">连续打卡</dt>
              <dd className="font-mono text-primary">{streak} 天</dd>
            </div>
            <div className="rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-xs text-subtle">完成课</dt>
              <dd className="font-mono text-primary">{core.completed}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}
