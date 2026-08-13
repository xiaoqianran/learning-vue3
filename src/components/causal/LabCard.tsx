import { Link } from "@tanstack/react-router";
import type { CausalLab, ProgramWorld } from "@/causal/types";
import { getCausalLab } from "@/causal/labs";
import { PROGRAM_WORLDS } from "@/causal/worlds";
import { labMastery } from "@/store/causal";
import type { LabProgress } from "@/store/causal";
import { cn } from "@/lib/utils";

export function LabCard({
  lab,
  index,
  mastery,
}: {
  lab: CausalLab;
  index: number;
  mastery: number;
}) {
  return (
    <Link
      to="/causal/$labId"
      params={{ labId: lab.id }}
      className="lab-card group flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 no-underline transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:border-primary/35 hover:bg-surface-2 hover:shadow-soft"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft font-mono text-sm text-primary">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="font-display text-sm font-semibold text-fg group-hover:text-primary">
            {lab.title}
          </span>
          <span className="font-mono text-[11px] tabular-nums text-primary">{mastery}%</span>
        </span>
        <span className="mt-0.5 block text-xs text-muted">{lab.subtitle}</span>
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-surface-3">
          <span
            className="block h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${mastery}%` }}
          />
        </span>
      </span>
    </Link>
  );
}

export function LoopSteps() {
  return (
    <ol className="mt-8 flex flex-wrap gap-2 text-[11px] text-muted">
      {["预测", "一次因果变更", "看见程序为什么变"].map((label, i) => (
        <li
          key={label}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1"
        >
          <span className="font-mono text-[10px] text-primary">{String(i + 1).padStart(2, "0")}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}

export function WorldSection({
  world,
  progress,
}: {
  world: ProgramWorld;
  progress: Record<string, LabProgress>;
}) {
  const labs = world.labIds.map((id) => getCausalLab(id)).filter((l): l is CausalLab => Boolean(l));
  const ready = world.status === "ready" && labs.length > 0;

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-fg">
          World {world.n} · {world.title}
        </h2>
        {ready ? null : (
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-subtle">
            即将到来
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">{world.blurb}</p>
      {ready ? (
        <ol className="mt-3 space-y-2.5">
          {labs.map((lab, i) => (
            <li key={lab.id}>
              <LabCard lab={lab} index={i} mastery={labMastery(lab.id, progress)} />
            </li>
          ))}
        </ol>
      ) : (
        <p className={cn("mt-2 font-mono text-[11px] text-subtle")}>{world.topics.join(" · ")}</p>
      )}
    </section>
  );
}

export function WorldCatalog({ progress }: { progress: Record<string, LabProgress> }) {
  return (
    <div>
      {PROGRAM_WORLDS.map((world) => (
        <WorldSection key={world.id} world={world} progress={progress} />
      ))}
    </div>
  );
}
