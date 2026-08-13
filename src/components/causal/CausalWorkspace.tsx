import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import {
  Group,
  Panel,
  Separator,
  useGroupRef,
  type Layout,
  type LayoutChangedMeta,
} from "react-resizable-panels";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALL_SLOTS,
  FOCUS_SLOTS,
  PANE_IDS,
  PANE_META,
  canHide,
  canMove,
  hidePane,
  layoutSignature,
  movePane,
  readSlots,
  rowIds,
  showPane,
  swapPanes,
  togglePane,
  writeSlots,
  type MoveDir,
  type PaneId,
  type Slots,
} from "./workspaceLayout";

const SPLIT_KEY = "vue-causal-lab-split-v3";

type SavedSplits = Record<string, Layout>;

function readSplits(): SavedSplits {
  try {
    const raw = localStorage.getItem(SPLIT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SavedSplits;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeSplit(part: string, layout: Layout) {
  try {
    localStorage.setItem(SPLIT_KEY, JSON.stringify({ ...readSplits(), [part]: layout }));
  } catch {
    /* private mode / quota */
  }
}

function Split({ axis, id }: { axis: "x" | "y"; id: string }) {
  return (
    <Separator
      id={id}
      className={cn(
        "causal-split z-10 flex items-center justify-center",
        axis === "x" ? "w-2" : "h-2",
      )}
      title="拖动调整大小，双击恢复默认"
    >
      <span
        className={cn("rounded-full bg-overlay1", axis === "x" ? "h-8 w-0.5" : "h-0.5 w-8")}
      />
    </Separator>
  );
}

function PersistentGroup({
  part,
  groupId,
  className,
  orientation,
  children,
}: {
  part: string;
  groupId: string;
  className?: string;
  orientation: "horizontal" | "vertical";
  children: ReactNode;
}) {
  const groupRef = useGroupRef();

  useEffect(() => {
    const saved = readSplits()[part];
    if (!saved || typeof saved !== "object") return;
    try {
      groupRef.current?.setLayout(saved);
    } catch {
      /* stale layout from an older pane schema */
    }
  }, [groupRef, part]);

  function onLayoutChanged(layout: Layout, meta: LayoutChangedMeta) {
    if (meta.isUserInteraction) writeSplit(part, layout);
  }

  return (
    <Group
      id={groupId}
      groupRef={groupRef}
      orientation={orientation}
      className={className}
      onLayoutChanged={onLayoutChanged}
      resizeTargetMinimumSize={{ coarse: 28, fine: 12 }}
    >
      {children}
    </Group>
  );
}

type Chrome = {
  id: PaneId;
  canHide: boolean;
  moves: Record<MoveDir, boolean>;
  onHide: () => void;
  onMove: (dir: MoveDir) => void;
  onDragStart: (e: DragEvent) => void;
};

const PaneChromeContext = createContext<Chrome | null>(null);

export function usePaneChrome() {
  return useContext(PaneChromeContext);
}

function PaneShell({
  id,
  chrome,
  onDropSwap,
  children,
}: {
  id: PaneId;
  chrome: Chrome;
  onDropSwap: (from: PaneId, to: PaneId) => void;
  children: ReactNode;
}) {
  const [over, setOver] = useState(false);

  return (
    <PaneChromeContext.Provider value={chrome}>
      <div
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden bg-surface",
          over && "ring-2 ring-inset ring-primary/70",
        )}
        onDragOver={(e) => {
          const kinds = Array.from(e.dataTransfer.types);
          if (!kinds.includes("text/pane-id") && !kinds.includes("text/plain")) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const from = (e.dataTransfer.getData("text/pane-id") ||
            e.dataTransfer.getData("text/plain")) as PaneId;
          if (PANE_IDS.includes(from) && from !== id) onDropSwap(from, id);
        }}
      >
        {children}
      </div>
    </PaneChromeContext.Provider>
  );
}

export function PaneMoveBar() {
  const chrome = usePaneChrome();
  if (!chrome) return null;
  const btn =
    "flex h-5 w-5 items-center justify-center rounded text-subtle transition-colors hover:bg-surface-3 hover:text-fg disabled:opacity-25";
  return (
    <div
      className="ml-auto flex shrink-0 items-center gap-px"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button type="button" className={btn} disabled={!chrome.moves.left} title="向左移" onClick={() => chrome.onMove("left")}>
        <ChevronLeft className="h-3 w-3" />
      </button>
      <button type="button" className={btn} disabled={!chrome.moves.right} title="向右移" onClick={() => chrome.onMove("right")}>
        <ChevronRight className="h-3 w-3" />
      </button>
      <button type="button" className={btn} disabled={!chrome.moves.up} title="向上移" onClick={() => chrome.onMove("up")}>
        <ChevronUp className="h-3 w-3" />
      </button>
      <button type="button" className={btn} disabled={!chrome.moves.down} title="向下移" onClick={() => chrome.onMove("down")}>
        <ChevronDown className="h-3 w-3" />
      </button>
      <button
        type="button"
        className={btn}
        disabled={!chrome.canHide}
        title={chrome.canHide ? "隐藏此格" : "至少留一格"}
        onClick={chrome.onHide}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

type WorkspaceProps = {
  code: ReactNode;
  live: ReactNode;
  xray: ReactNode;
  narrative: ReactNode;
};

export function CausalWorkspace({ code, live, xray, narrative }: WorkspaceProps) {
  const [slots, setSlots] = useState<Slots>(FOCUS_SLOTS);
  const bodies: Record<PaneId, ReactNode> = useMemo(
    () => ({ code, live, xray, narrative }),
    [code, live, xray, narrative],
  );

  useEffect(() => {
    setSlots(readSlots());
  }, []);

  const commit = useCallback((next: Slots) => {
    setSlots(next);
    writeSlots(next);
  }, []);

  const onDropSwap = useCallback(
    (from: PaneId, to: PaneId) => {
      commit(swapPanes(slots, from, to));
    },
    [commit, slots],
  );

  function chromeFor(id: PaneId): Chrome {
    return {
      id,
      canHide: canHide(slots),
      moves: {
        left: canMove(slots, id, "left"),
        right: canMove(slots, id, "right"),
        up: canMove(slots, id, "up"),
        down: canMove(slots, id, "down"),
      },
      onHide: () => commit(hidePane(slots, id)),
      onMove: (dir) => commit(movePane(slots, id, dir)),
      onDragStart: (e) => {
        e.dataTransfer.setData("text/pane-id", id);
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";
      },
    };
  }

  function renderPane(id: PaneId) {
    return (
      <PaneShell id={id} chrome={chromeFor(id)} onDropSwap={onDropSwap}>
        {bodies[id]}
      </PaneShell>
    );
  }

  const top = rowIds(slots, 0);
  const bottom = rowIds(slots, 1);
  const sig = layoutSignature(slots);

  function renderRow(ids: PaneId[], part: string) {
    if (ids.length === 0) return null;
    if (ids.length === 1) return renderPane(ids[0]!);
    const kids: ReactNode[] = [];
    ids.forEach((id, i) => {
      if (i > 0) {
        kids.push(<Split key={`split-${part}-${i}`} axis="x" id={`split-${part}-${i}`} />);
      }
      kids.push(
        <Panel
          key={id}
          id={id}
          minSize="18%"
          defaultSize={`${Math.round(100 / ids.length)}%`}
          className="min-h-0"
        >
          {renderPane(id)}
        </Panel>,
      );
    });
    return (
      <PersistentGroup
        part={`${sig}:${part}`}
        groupId={`causal-${part}`}
        orientation="horizontal"
        className="h-full min-h-0 w-full"
      >
        {kids}
      </PersistentGroup>
    );
  }

  let grid: ReactNode;
  if (top.length && bottom.length) {
    grid = (
      <PersistentGroup
        part={`${sig}:rows`}
        groupId="causal-rows"
        orientation="vertical"
        className="h-full min-h-0 w-full flex-1"
      >
        <Panel id="top" minSize="18%" defaultSize="50%" className="min-h-0">
          {renderRow(top, "top")}
        </Panel>
        <Split axis="y" id="split-rows" />
        <Panel id="bottom" minSize="18%" defaultSize="50%" className="min-h-0">
          {renderRow(bottom, "bottom")}
        </Panel>
      </PersistentGroup>
    );
  } else {
    const only = top.length ? top : bottom;
    const part = top.length ? "top" : "bottom";
    if (only.length <= 1) {
      grid = <div className="h-full min-h-0 w-full flex-1">{only[0] ? renderPane(only[0]) : null}</div>;
    } else {
      grid = (
        <div className="h-full min-h-0 w-full flex-1">{renderRow(only, part)}</div>
      );
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-8 shrink-0 items-center gap-1 border-b border-border bg-surface-2 px-2">
        <p className="mr-1 hidden text-[10px] uppercase tracking-[0.14em] text-subtle sm:block">显示</p>
        {PANE_IDS.map((id) => {
          const on = slots.includes(id);
          return (
            <button
              key={id}
              type="button"
              title={on ? `隐藏${PANE_META[id].hint}` : `显示${PANE_META[id].hint}`}
              disabled={on && !canHide(slots)}
              onClick={() => commit(togglePane(slots, id))}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] transition-colors duration-150",
                on
                  ? "bg-primary-soft font-medium text-primary"
                  : "text-muted hover:bg-surface-3 hover:text-fg",
                on && !canHide(slots) && "opacity-60",
              )}
            >
              {PANE_META[id].label}
            </button>
          );
        })}
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="rounded-full px-2 py-0.5 text-[11px] text-muted transition-colors hover:bg-surface-3 hover:text-fg"
            title="只留代码和问题"
            onClick={() => commit(FOCUS_SLOTS)}
          >
            代码 + 问题
          </button>
          <button
            type="button"
            className="rounded-full px-2 py-0.5 text-[11px] text-muted transition-colors hover:bg-surface-3 hover:text-fg"
            title="四格都打开"
            onClick={() => commit(ALL_SLOTS)}
          >
            四格
          </button>
        </span>
      </div>
      {grid}
    </div>
  );
}
