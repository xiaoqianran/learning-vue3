import { useMemo, useState } from "react";
import type { QuizQuestion } from "@/data/lessons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";
import { CheckCircle2, XCircle } from "lucide-react";

export function Quiz({ slug, questions }: { slug: string; questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, null])),
  );
  const [submitted, setSubmitted] = useState(false);
  const setQuizScore = useProgress((s) => s.setQuizScore);
  const markComplete = useProgress((s) => s.markComplete);
  const markMastered = useProgress((s) => s.markMastered);
  const addWrong = useProgress((s) => s.addWrong);
  const checkInToday = useProgress((s) => s.checkInToday);

  const score = useMemo(
    () => questions.reduce((acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0), 0),
    [answers, questions],
  );

  function submit() {
    const real = questions.reduce((acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0), 0);
    const realPct = Math.round((real / questions.length) * 100);
    setSubmitted(true);
    setQuizScore(slug, realPct);
    checkInToday();

    for (const q of questions) {
      const chosen = answers[q.id];
      if (chosen === null || chosen === undefined) continue;
      if (chosen !== q.answer) {
        addWrong({
          id: `${slug}:${q.id}`,
          lessonSlug: slug,
          question: q.question,
          options: q.options,
          answer: q.answer,
          explain: q.explain,
          wrongChoice: chosen,
        });
      }
    }

    // completed = 交卷；mastered = ≥80%
    if (realPct >= 80) markMastered(slug);
    else markComplete(slug);
  }

  function reset() {
    setAnswers(Object.fromEntries(questions.map((q) => [q.id, null])));
    setSubmitted(false);
  }

  const allAnswered = questions.every((q) => answers[q.id] !== null);

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-soft sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">小测验</p>
          <h3 className="font-display text-lg font-semibold">检验一下</h3>
        </div>
        {submitted ? (
          <p className="font-mono text-sm tabular-nums text-muted">
            {score}/{questions.length}
          </p>
        ) : null}
      </div>

      <div className="space-y-5">
        {questions.map((q, qi) => {
          const chosen = answers[q.id];
          const correct = chosen === q.answer;
          return (
            <div key={q.id}>
              <p className="text-sm font-medium text-fg">
                <span className="mr-2 font-mono text-subtle">{qi + 1}.</span>
                {q.question}
              </p>
              <div className="mt-2 grid gap-2">
                {q.options.map((opt, oi) => {
                  const selected = chosen === oi;
                  let stateClass = "border-border bg-surface-2 hover:border-border-strong";
                  if (submitted) {
                    if (oi === q.answer) {
                      stateClass = "border-primary/50 bg-primary-soft text-fg";
                    } else if (selected && !correct) {
                      stateClass = "border-danger/40 bg-danger/10 text-fg";
                    } else {
                      stateClass = "border-border bg-surface-2 opacity-70";
                    }
                  } else if (selected) {
                    stateClass = "border-primary bg-primary-soft text-fg";
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className={cn(
                        "rounded-md border px-3 py-2.5 text-left text-sm transition-colors duration-150",
                        stateClass,
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted ? (
                <p
                  className={cn(
                    "mt-2 flex items-start gap-1.5 text-xs",
                    correct ? "text-primary" : "text-warn",
                  )}
                >
                  {correct ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  )}
                  {q.explain}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {!submitted ? (
          <Button onClick={submit} disabled={!allAnswered}>
            提交答案
          </Button>
        ) : (
          <>
            <Button onClick={reset} variant="secondary">
              再测一次
            </Button>
            {Math.round((score / questions.length) * 100) >= 80 ? (
              <span className="inline-flex items-center text-sm text-primary">
                ≥80% · 已掌握（mastered）
              </span>
            ) : (
              <span className="inline-flex items-center text-sm text-muted">
                已计完成 · 错题入错题本 · 再测到 80% 可掌握
              </span>
            )}
          </>
        )}
      </div>
    </section>
  );
}
