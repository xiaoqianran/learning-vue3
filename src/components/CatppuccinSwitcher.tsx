import { useEffect, useId, useRef, useState } from "react";
import {
  applyCtpAccent,
  applyCtpFlavor,
  CTP_ACCENTS,
  CTP_FLAVORS,
  readCtpAccent,
  readCtpFlavor,
  type CtpAccent,
  type CtpFlavor,
} from "@/lib/catppuccin";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ExternalLink, Palette, Sparkles } from "lucide-react";

type Mode = "popover" | "panel";

export function CatppuccinSwitcher({
  mode = "popover",
  className,
}: {
  /** popover：顶栏紧凑触发器 + 下拉；panel：侧栏/设置整块展开 */
  mode?: Mode;
  className?: string;
}) {
  const [flavor, setFlavor] = useState<CtpFlavor>("mocha");
  const [accent, setAccent] = useState<CtpAccent>("mauve");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    const f = readCtpFlavor();
    const a = readCtpAccent();
    setFlavor(f);
    setAccent(a);
    applyCtpFlavor(f);
    applyCtpAccent(a);
  }, []);

  useEffect(() => {
    if (!open || mode !== "popover") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, mode]);

  function pickFlavor(id: CtpFlavor) {
    setFlavor(id);
    applyCtpFlavor(id);
  }

  function pickAccent(id: CtpAccent) {
    setAccent(id);
    applyCtpAccent(id);
  }

  const flavorMeta = CTP_FLAVORS.find((f) => f.id === flavor) ?? CTP_FLAVORS[0];
  const accentMeta = CTP_ACCENTS.find((a) => a.id === accent) ?? CTP_ACCENTS[0];

  const body = (
    <ThemeBody
      flavor={flavor}
      accent={accent}
      onFlavor={pickFlavor}
      onAccent={pickAccent}
      dense={mode === "popover"}
    />
  );

  if (mode === "panel") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-surface shadow-soft",
          className,
        )}
      >
        <div className="flex items-start gap-2 border-b border-border bg-surface-2 px-3 py-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Palette className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-fg">Catppuccin</p>
            <p className="text-[11px] leading-snug text-muted">
              Userstyles · {flavorMeta.label} / {accentMeta.label}
            </p>
          </div>
          <a
            href="https://github.com/catppuccin/catppuccin"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[10px] text-subtle no-underline hover:text-primary"
            title="Catppuccin 官方"
          >
            官方
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="p-3">{body}</div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 max-w-[11.5rem] items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 text-xs font-medium text-fg shadow-soft transition-colors",
          "hover:border-border-strong hover:bg-surface-2",
          open && "border-primary/40 bg-primary-soft text-primary",
        )}
      >
        <span
          className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-border-strong"
          style={{ background: flavorMeta.swatch }}
          aria-hidden
        />
        <span className="truncate">{flavorMeta.label}</span>
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: accentMeta.css }}
          title={accentMeta.label}
          aria-hidden
        />
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-subtle transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          id={listId}
          role="dialog"
          aria-label="Catppuccin 主题"
          className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border bg-surface shadow-soft"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-2 px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-fg">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Catppuccin Userstyles
            </div>
            <a
              href="https://github.com/catppuccin/userstyles"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-[10px] text-muted no-underline hover:text-primary"
            >
              Userstyles
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="p-3">{body}</div>
          <p className="border-t border-border px-3 py-2 text-[10px] leading-relaxed text-subtle">
            选择会立刻应用，并保存在本机。Latte 为浅色；其余为深色口味。
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ThemeBody({
  flavor,
  accent,
  onFlavor,
  onAccent,
  dense,
}: {
  flavor: CtpFlavor;
  accent: CtpAccent;
  onFlavor: (id: CtpFlavor) => void;
  onAccent: (id: CtpAccent) => void;
  dense?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-wider text-subtle">
            Flavor 口味
          </p>
          <p className="text-[10px] text-muted">
            {CTP_FLAVORS.find((f) => f.id === flavor)?.label}
          </p>
        </div>
        <div
          className={cn("grid gap-1.5", dense ? "grid-cols-2" : "grid-cols-2")}
          role="group"
          aria-label="Catppuccin 口味"
        >
          {CTP_FLAVORS.map((f) => {
            const active = flavor === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => onFlavor(f.id)}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all",
                  active
                    ? "border-primary/50 bg-primary-soft shadow-soft"
                    : "border-border bg-bg hover:border-border-strong hover:bg-surface-2",
                )}
              >
                <span
                  className="h-8 w-8 shrink-0 rounded-md shadow-inner ring-1 ring-border"
                  style={{
                    background: `linear-gradient(145deg, ${f.swatch} 0%, color-mix(in oklab, ${f.swatch} 35%, #11111b) 100%)`,
                  }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-xs font-semibold",
                      active ? "text-primary" : "text-fg",
                    )}
                  >
                    {f.label}
                  </span>
                  <span className="block font-mono text-[10px] text-subtle">
                    {f.id}
                  </span>
                </span>
                {active ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-wider text-subtle">
            Accent 主色
          </p>
          <p className="text-[10px] text-muted">
            {CTP_ACCENTS.find((a) => a.id === accent)?.label}
          </p>
        </div>
        <div
          className="grid grid-cols-4 gap-1.5 sm:grid-cols-4"
          role="group"
          aria-label="主色 accent"
        >
          {CTP_ACCENTS.map((a) => {
            const active = accent === a.id;
            return (
              <button
                key={a.id}
                type="button"
                title={a.label}
                aria-label={`Accent ${a.label}`}
                aria-pressed={active}
                onClick={() => onAccent(a.id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border px-1 py-1.5 transition-all",
                  active
                    ? "border-primary/45 bg-primary-soft"
                    : "border-transparent hover:border-border hover:bg-surface-2",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-transform",
                    active && "scale-105 ring-2 ring-fg/25 ring-offset-2 ring-offset-bg",
                  )}
                >
                  <span
                    className="h-5 w-5 rounded-full shadow-sm"
                    style={{ background: a.css }}
                  />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    active ? "text-primary" : "text-muted",
                  )}
                >
                  {a.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** @deprecated 兼容旧 props；请改用 mode */
export function CatppuccinSwitcherLegacy(props: {
  compact?: boolean;
  showAccent?: boolean;
}) {
  return (
    <CatppuccinSwitcher mode={props.compact ? "popover" : "panel"} />
  );
}
