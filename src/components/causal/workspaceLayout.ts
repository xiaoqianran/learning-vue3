export const PANE_IDS = ["code", "live", "xray", "narrative"] as const;
export type PaneId = (typeof PANE_IDS)[number];
export type Slot = PaneId | null;
export type Slots = [Slot, Slot, Slot, Slot];
export type MoveDir = "left" | "right" | "up" | "down";

export const PANE_META: Record<PaneId, { label: string; hint: string }> = {
  code: { label: "代码", hint: "代码演化" },
  live: { label: "预览", hint: "实时应用" },
  xray: { label: "透视", hint: "运行时透视" },
  narrative: { label: "问题", hint: "这一镜" },
};

/** Code left, questions right. Preview and x-ray stay off until asked for. */
export const FOCUS_SLOTS: Slots = ["code", "narrative", null, null];
export const ALL_SLOTS: Slots = ["code", "live", "xray", "narrative"];

const STORAGE_KEY = "vue-causal-lab-panes-v3";

function isPaneId(v: unknown): v is PaneId {
  return PANE_IDS.includes(v as PaneId);
}

function emptySlots(): Slots {
  return [null, null, null, null];
}

export function normalizeSlots(raw: unknown): Slots | null {
  if (!Array.isArray(raw) || raw.length !== 4) return null;
  const next = emptySlots();
  const seen = new Set<PaneId>();
  for (let i = 0; i < 4; i++) {
    const v = raw[i];
    if (v == null) continue;
    if (!isPaneId(v) || seen.has(v)) return null;
    seen.add(v);
    next[i] = v;
  }
  if (seen.size === 0) return null;
  return next;
}

export function readSlots(): Slots {
  if (typeof window === "undefined") return FOCUS_SLOTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return FOCUS_SLOTS;
    const parsed = JSON.parse(raw) as { slots?: unknown };
    return normalizeSlots(parsed?.slots) ?? FOCUS_SLOTS;
  } catch {
    return FOCUS_SLOTS;
  }
}

export function writeSlots(slots: Slots) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ slots }));
  } catch {
    /* private mode / quota */
  }
}

export function visibleIds(slots: Slots): PaneId[] {
  return slots.filter((s): s is PaneId => s != null);
}

export function indexOfPane(slots: Slots, id: PaneId): number {
  return slots.indexOf(id);
}

export function canHide(slots: Slots): boolean {
  return visibleIds(slots).length > 1;
}

export function hidePane(slots: Slots, id: PaneId): Slots {
  if (!canHide(slots)) return slots;
  const i = indexOfPane(slots, id);
  if (i < 0) return slots;
  const next = [...slots] as Slots;
  next[i] = null;
  return next;
}

export function showPane(slots: Slots, id: PaneId): Slots {
  if (indexOfPane(slots, id) >= 0) return slots;
  const empty = slots.findIndex((s) => s == null);
  if (empty < 0) return slots;
  const next = [...slots] as Slots;
  next[empty] = id;
  return next;
}

export function togglePane(slots: Slots, id: PaneId): Slots {
  return indexOfPane(slots, id) >= 0 ? hidePane(slots, id) : showPane(slots, id);
}

export function canMove(slots: Slots, id: PaneId, dir: MoveDir): boolean {
  const i = indexOfPane(slots, id);
  if (i < 0) return false;
  const col = i % 2;
  const row = Math.floor(i / 2);
  if (dir === "left") return col === 1;
  if (dir === "right") return col === 0;
  if (dir === "up") return row === 1;
  return row === 0;
}

function targetIndex(i: number, dir: MoveDir): number | null {
  const col = i % 2;
  const row = Math.floor(i / 2);
  if (dir === "left") return col === 1 ? i - 1 : null;
  if (dir === "right") return col === 0 ? i + 1 : null;
  if (dir === "up") return row === 1 ? i - 2 : null;
  return row === 0 ? i + 2 : null;
}

export function movePane(slots: Slots, id: PaneId, dir: MoveDir): Slots {
  const i = indexOfPane(slots, id);
  if (i < 0) return slots;
  const j = targetIndex(i, dir);
  if (j == null) return slots;
  const next = [...slots] as Slots;
  const a = next[i];
  next[i] = next[j] ?? null;
  next[j] = a ?? null;
  return next;
}

export function swapPanes(slots: Slots, a: PaneId, b: PaneId): Slots {
  const i = indexOfPane(slots, a);
  const j = indexOfPane(slots, b);
  if (i < 0 || j < 0 || i === j) return slots;
  const next = [...slots] as Slots;
  const tmp = next[i];
  next[i] = next[j];
  next[j] = tmp;
  return next;
}

export function layoutSignature(slots: Slots): string {
  return slots.map((s) => s ?? "_").join("");
}

export function rowIds(slots: Slots, row: 0 | 1): PaneId[] {
  const a = slots[row * 2];
  const b = slots[row * 2 + 1];
  return [a, b].filter((s): s is PaneId => s != null);
}
