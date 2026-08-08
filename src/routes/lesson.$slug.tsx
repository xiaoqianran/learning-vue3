import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getAdjacent, getLesson, getLessonIndex, LESSONS } from "@/data/lessons";
import { getContinueLesson, isAllComplete, trackLabel } from "@/lib/nav";
import { CodeBlock } from "@/components/CodeBlock";
import { InteractiveDemo } from "@/components/demos/InteractiveDemos";
import { Quiz } from "@/components/Quiz";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/store/progress";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Clock,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lesson/$slug")({
  component: LessonPage,
});

function LessonPage() {
  const { slug } = Route.useParams();
  const lesson = getLesson(slug);
  if (!lesson) {
    throw notFound();
  }

  const idx = getLessonIndex(slug);
  const { prev, next } = getAdjacent(slug);
  const completed = useProgress((s) => s.completed);
  const markComplete = useProgress((s) => s.markComplete);
  const bookmarks = useProgress((s) => s.bookmarks);
  const toggleBookmark = useProgress((s) => s.toggleBookmark);
  const notes = useProgress((s) => s.notes);
  const setNote = useProgress((s) => s.setNote);
  const checkInToday = useProgress((s) => s.checkInToday);
  const done = completed.includes(slug);
  const bookmarked = bookmarks.includes(slug);
  const [note, setNoteLocal] = useState(notes[slug] ?? "");

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setNoteLocal(notes[slug] ?? "");
  }, [slug]); // 切课时重置；不把 notes 放依赖以免回写抖动

  // 输入后自动保存（不必等 blur，避免点「下一节」丢笔记）
  useEffect(() => {
    if (note === (notes[slug] ?? "")) return;
    const id = window.setTimeout(() => setNote(slug, note), 400);
    return () => window.clearTimeout(id);
  }, [note, slug, notes, setNote]);

  return (
    <article className="mx-auto max-w-3xl pb-20">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted">
        <Link to="/" className="text-muted no-underline hover:text-fg">
          首页
        </Link>
        <span className="text-subtle">/</span>
        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium text-primary">
          {trackLabel(lesson.track)}
        </span>
        <span className="text-subtle">/</span>
        <span className="text-fg">
          第 {idx + 1}/{LESSONS.length} 节
        </span>
      </div>

      <header className="border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-medium text-primary">
            {lesson.level}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3.5 w-3.5" />约 {lesson.minutes} 分钟
          </span>
          {done ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary">
              <Check className="h-3 w-3" />
              已完成
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            {lesson.title}
          </h1>
          <button
            type="button"
            onClick={() => toggleBookmark(slug)}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors",
              bookmarked
                ? "border-primary/40 bg-primary-soft text-primary"
                : "border-border bg-surface text-muted hover:text-fg",
            )}
          >
            {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {bookmarked ? "已收藏" : "收藏"}
          </button>
        </div>
        <p className="mt-2 text-base text-muted">{lesson.summary}</p>
        {lesson.official ? (
          <p className="mt-3">
            <a
              href={`https://cn.vuejs.org${lesson.official}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary no-underline hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              对照官网文档
            </a>
            <span className="ml-2 font-mono text-[11px] text-subtle">
              cn.vuejs.org{lesson.official}
            </span>
          </p>
        ) : null}
      </header>

      <div className="mt-8 space-y-8">
        {lesson.blocks.map((block, i) => {
          if (block.type === "text") {
            return (
              <section key={i}>
                {block.title ? (
                  <h2 className="mb-2 font-display text-lg font-semibold text-fg">{block.title}</h2>
                ) : null}
                <p className="text-[15px] leading-relaxed text-muted whitespace-pre-line">
                  {block.body}
                </p>
              </section>
            );
          }
          if (block.type === "code") {
            return <CodeBlock key={i} code={block.code} title={block.title} lang={block.lang} />;
          }
          if (block.type === "tip") {
            return (
              <aside
                key={i}
                className="flex gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-muted">{block.body}</p>
              </aside>
            );
          }
          if (block.type === "demo") {
            return (
              <InteractiveDemo key={i} kind={block.kind} title={block.title} hint={block.hint} />
            );
          }
          if (block.type === "quiz") {
            return <Quiz key={i} slug={slug} questions={block.questions} />;
          }
          return null;
        })}
      </div>

      <section className="mt-10 rounded-xl border border-border bg-surface p-4 sm:p-5">
        <h2 className="font-display text-base font-semibold text-fg">本节笔记</h2>
        <p className="mt-1 text-xs text-muted">自动保存在本机，仅你可见</p>
        <textarea
          value={note}
          onChange={(e) => setNoteLocal(e.target.value)}
          onBlur={() => setNote(slug, note)}
          rows={4}
          placeholder="记下重点、疑问或代码片段…"
          className="mt-3 w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-fg placeholder:text-subtle"
        />
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
        {!done ? (
          <Button
            variant="secondary"
            onClick={() => {
              markComplete(slug);
              checkInToday();
            }}
          >
            <Check className="h-4 w-4" />
            标记本节完成
          </Button>
        ) : null}
      </div>

      <nav className="mt-6 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link to="/lesson/$slug" params={{ slug: prev.slug }} className="no-underline">
            <div className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-2">
              <p className="inline-flex items-center gap-1 text-xs text-muted">
                <ArrowLeft className="h-3.5 w-3.5" />
                上一节
              </p>
              <p className="mt-1 font-medium text-fg">{prev.title}</p>
              <p className="mt-0.5 text-[11px] text-subtle">{trackLabel(prev.track)}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            to="/lesson/$slug"
            params={{ slug: next.slug }}
            className="no-underline sm:text-right"
          >
            <div className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-2">
              <p className="inline-flex items-center gap-1 text-xs text-muted sm:justify-end">
                下一节
                <ArrowRight className="h-3.5 w-3.5" />
              </p>
              <p className="mt-1 font-medium text-fg">{next.title}</p>
              <p className="mt-0.5 text-[11px] text-subtle sm:text-right">
                {trackLabel(next.track)}
                {next.track !== lesson.track ? " · 进入新路径" : ""}
              </p>
            </div>
          </Link>
        ) : isAllComplete(completed) ? (
          <Link to="/certificate" className="no-underline sm:text-right">
            <div className="rounded-xl border border-primary/30 bg-primary-soft p-4">
              <p className="text-xs text-primary">全部学完了</p>
              <p className="mt-1 font-medium text-fg">查看结业证明</p>
            </div>
          </Link>
        ) : (
          <Link
            to="/lesson/$slug"
            params={{ slug: getContinueLesson(completed).slug }}
            className="no-underline sm:text-right"
          >
            <div className="rounded-xl border border-primary/30 bg-primary-soft p-4">
              <p className="text-xs text-primary">还有未完成课程</p>
              <p className="mt-1 font-medium text-fg">继续：{getContinueLesson(completed).title}</p>
            </div>
          </Link>
        )}
      </nav>
    </article>
  );
}
