import { useEffect, useState, type ReactNode } from "react";
import {
  Group,
  Panel,
  Separator,
  useGroupRef,
  type Layout,
  type LayoutChangedMeta,
} from "react-resizable-panels";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "vue-causal-lab-split-v1";

type Saved = {
  rows?: Layout;
  top?: Layout;
  bottom?: Layout;
  stack?: Layout;
};

function readSaved(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Saved;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeSaved(part: keyof Saved, layout: Layout) {
  try {
    const next = { ...readSaved(), [part]: layout };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota */
  }
}

function Pane({ children }: { children: ReactNode }) {
  return <div className="flex h-full min-h-0 flex-col overflow-hidden">{children}</div>;
}

function Split({ axis }: { axis: "x" | "y" }) {
  return (
    <Separator
      className={cn(
        "causal-split z-10 flex items-center justify-center bg-border",
        axis === "x" ? "w-1.5" : "h-1.5",
      )}
      title="拖动调整大小，双击恢复默认"
    >
      <span
        className={cn(
          "rounded-full bg-overlay1",
          axis === "x" ? "h-8 w-0.5" : "h-0.5 w-8",
        )}
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
  part: keyof Saved;
  groupId: string;
  className?: string;
  orientation: "horizontal" | "vertical";
  children: ReactNode;
}) {
  const groupRef = useGroupRef();

  useEffect(() => {
    const saved = readSaved()[part];
    if (saved) groupRef.current?.setLayout(saved);
  }, [groupRef, part]);

  function onLayoutChanged(layout: Layout, meta: LayoutChangedMeta) {
    if (meta.isUserInteraction) writeSaved(part, layout);
  }

  return (
    <Group
      id={groupId}
      groupRef={groupRef}
      orientation={orientation}
      className={className}
      onLayoutChanged={onLayoutChanged}
    >
      {children}
    </Group>
  );
}

type WorkspaceProps = {
  code: ReactNode;
  live: ReactNode;
  xray: ReactNode;
  narrative: ReactNode;
};

export function CausalWorkspace({ code, live, xray, narrative }: WorkspaceProps) {
  const [desktop, setDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (!desktop) {
    return (
      <PersistentGroup
        part="stack"
        groupId="causal-stack"
        orientation="vertical"
        className="min-h-0 w-full flex-1"
      >
        <Panel id="code" minSize="14%" defaultSize="28%" className="min-h-0">
          <Pane>{code}</Pane>
        </Panel>
        <Split axis="y" />
        <Panel id="live" minSize="14%" defaultSize="28%" className="min-h-0">
          <Pane>{live}</Pane>
        </Panel>
        <Split axis="y" />
        <Panel id="xray" minSize="14%" defaultSize="22%" className="min-h-0">
          <Pane>{xray}</Pane>
        </Panel>
        <Split axis="y" />
        <Panel id="narrative" minSize="14%" defaultSize="22%" className="min-h-0">
          <Pane>{narrative}</Pane>
        </Panel>
      </PersistentGroup>
    );
  }

  return (
    <PersistentGroup
      part="rows"
      groupId="causal-rows"
      orientation="vertical"
      className="min-h-0 w-full flex-1"
    >
      <Panel id="top" minSize="18%" defaultSize="50%" className="min-h-0">
        <PersistentGroup
          part="top"
          groupId="causal-top"
          orientation="horizontal"
          className="h-full min-h-0 w-full"
        >
          <Panel id="code" minSize="18%" defaultSize="50%" className="min-h-0">
            <Pane>{code}</Pane>
          </Panel>
          <Split axis="x" />
          <Panel id="live" minSize="18%" defaultSize="50%" className="min-h-0">
            <Pane>{live}</Pane>
          </Panel>
        </PersistentGroup>
      </Panel>
      <Split axis="y" />
      <Panel id="bottom" minSize="18%" defaultSize="50%" className="min-h-0">
        <PersistentGroup
          part="bottom"
          groupId="causal-bottom"
          orientation="horizontal"
          className="h-full min-h-0 w-full"
        >
          <Panel id="xray" minSize="18%" defaultSize="50%" className="min-h-0">
            <Pane>{xray}</Pane>
          </Panel>
          <Split axis="x" />
          <Panel id="narrative" minSize="18%" defaultSize="50%" className="min-h-0">
            <Pane>{narrative}</Pane>
          </Panel>
        </PersistentGroup>
      </Panel>
    </PersistentGroup>
  );
}
