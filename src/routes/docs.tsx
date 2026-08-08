import { createFileRoute, Link } from "@tanstack/react-router";
import { DOC_SECTIONS, getDocsCoverage } from "@/data/docs-map";
import { getLesson } from "@/data/lessons";
import { BookOpen, ExternalLink, Library, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/docs")({
  component: DocsMapPage,
});

function DocsMapPage() {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const llms = `${base}/llms.txt`;
  const llmsFull = `${base}/llms-full.txt`;
  const coverage = getDocsCoverage();
  const [q, setQ] = useState("");

  const sections = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return DOC_SECTIONS;
    return DOC_SECTIONS.map((sec) => ({
      ...sec,
      items: sec.items.filter(
        (it) =>
          it.title.toLowerCase().includes(query) ||
          it.lessonSlug?.toLowerCase().includes(query) ||
          it.note?.toLowerCase().includes(query) ||
          it.official.toLowerCase().includes(query) ||
          sec.title.toLowerCase().includes(query),
      ),
    })).filter((sec) => sec.items.length > 0);
  }, [q]);

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <header className="mb-6">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
          <Library className="h-3.5 w-3.5" />
          对照官方
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-fg sm:text-3xl">文档地图</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          按{" "}
          <a
            href="https://vuejs.org/llms.txt"
            target="_blank"
            rel="noreferrer"
            className="text-primary no-underline hover:underline"
          >
            vuejs.org/llms.txt
          </a>{" "}
          的结构整理。左侧官方权威文档，右侧本站交互课（有则跳转）。我们做「动手 + 源码对照 + 测验 +
          工坊」，官网做「规范全文 + API」。
        </p>
      </header>

      <div className="mb-5 rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted">对照官方覆盖</p>
            <p className="mt-0.5 font-display text-2xl font-semibold tabular-nums text-fg">
              {coverage.percent}%
            </p>
            <p className="text-xs text-subtle">
              {coverage.linked}/{coverage.total} 条目已挂本站课
            </p>
          </div>
          <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-surface-3 sm:w-48">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${coverage.percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-xs leading-relaxed text-muted">
        <p>
          <span className="font-medium text-fg">本站 LLM 文件：</span>
          <a
            className="mx-1 text-primary hover:underline"
            href={llms}
            target="_blank"
            rel="noreferrer"
          >
            llms.txt
          </a>
          ·
          <a
            className="mx-1 text-primary hover:underline"
            href={llmsFull}
            target="_blank"
            rel="noreferrer"
          >
            llms-full.txt
          </a>
          <span className="text-subtle"> — 静态托管，便于 AI/检索对齐</span>
        </p>
        <p>
          官方 AI 资源：
          <a
            className="mx-1 text-primary hover:underline"
            href="https://vuejs.org/llms.txt"
            target="_blank"
            rel="noreferrer"
          >
            vuejs.org/llms.txt
          </a>
          ·
          <a
            className="mx-1 text-primary hover:underline"
            href="https://vuejs.org/llms-full.txt"
            target="_blank"
            rel="noreferrer"
          >
            llms-full.txt
          </a>
          ·
          <a
            className="mx-1 text-primary hover:underline"
            href="https://cn.vuejs.org/"
            target="_blank"
            rel="noreferrer"
          >
            中文文档
          </a>
        </p>
      </div>

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索章节 / 课 slug / 官网路径…"
          className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm text-fg placeholder:text-subtle"
        />
      </div>

      <div className="grid gap-4">
        {sections.map((sec) => (
          <section
            key={sec.title}
            className="overflow-hidden rounded-xl border border-border bg-surface"
          >
            <h2 className="border-b border-border bg-surface-2 px-4 py-2.5 font-display text-sm font-semibold text-fg">
              {sec.title}
              <span className="ml-2 font-sans text-[11px] font-normal text-subtle">
                {sec.items.length}
              </span>
            </h2>
            <ul className="divide-y divide-border">
              {sec.items.map((it) => {
                const lesson = it.lessonSlug ? getLesson(it.lessonSlug) : undefined;
                return (
                  <li
                    key={it.title + it.official}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-fg">{it.title}</p>
                      {it.note ? <p className="mt-0.5 text-xs text-subtle">{it.note}</p> : null}
                      {lesson ? (
                        <p className="mt-0.5 text-[11px] text-muted">
                          本站：{lesson.title}
                          <span className="ml-1.5 rounded-full bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-subtle">
                            {lesson.track}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={it.official}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-bg px-2.5 py-1 text-[11px] text-muted no-underline hover:text-fg"
                      >
                        官网
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {it.lessonSlug && lesson ? (
                        <Link
                          to="/lesson/$slug"
                          params={{ slug: it.lessonSlug }}
                          className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] text-primary no-underline hover:opacity-90"
                        >
                          <BookOpen className="h-3 w-3" />
                          本站课
                        </Link>
                      ) : it.lessonSlug ? (
                        <span
                          className={cn(
                            "rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] text-amber-700 dark:text-amber-300",
                          )}
                          title={`slug 未找到: ${it.lessonSlug}`}
                        >
                          课缺失
                        </span>
                      ) : (
                        <span className="rounded-full bg-surface-3 px-2.5 py-1 text-[11px] text-subtle">
                          以官网为准
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {sections.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
            没有匹配「{q}」的条目
          </p>
        ) : null}
      </div>
    </div>
  );
}
