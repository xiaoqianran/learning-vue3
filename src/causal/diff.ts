export type DiffKind = "same" | "add" | "remove";

export type DiffLine = {
  kind: DiffKind;
  text: string;
  /** Consecutive add/remove runs share a block so we can animate by semantic chunk */
  block: number;
};

/**
 * Line-level LCS diff. Small SFCs only — this is for teaching, not git.
 */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.replace(/\n$/, "").split("\n");
  const b = after.replace(/\n$/, "").split("\n");
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  const raw: { kind: DiffKind; text: string }[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      raw.push({ kind: "same", text: a[i]! });
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      raw.push({ kind: "remove", text: a[i]! });
      i++;
    } else {
      raw.push({ kind: "add", text: b[j]! });
      j++;
    }
  }
  while (i < n) {
    raw.push({ kind: "remove", text: a[i]! });
    i++;
  }
  while (j < m) {
    raw.push({ kind: "add", text: b[j]! });
    j++;
  }

  let block = 0;
  let prev: DiffKind | null = null;
  return raw.map((line) => {
    if (line.kind !== prev) {
      if (prev !== null) block += 1;
      prev = line.kind;
    }
    return { ...line, block };
  });
}

export function changedBlocks(lines: DiffLine[]): number[] {
  const seen = new Set<number>();
  for (const l of lines) {
    if (l.kind !== "same") seen.add(l.block);
  }
  return [...seen].sort((x, y) => x - y);
}

export type WriteStep =
  | { kind: "remove"; indices: number[] }
  | { kind: "add"; index: number };

/** Old lines leave as a hunk; new lines arrive one at a time so the write reads as a process. */
export function writePlan(lines: DiffLine[]): WriteStep[] {
  const steps: WriteStep[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.kind === "same") {
      i += 1;
      continue;
    }
    if (line.kind === "remove") {
      const indices: number[] = [];
      while (i < lines.length && lines[i]!.kind === "remove") {
        indices.push(i);
        i += 1;
      }
      steps.push({ kind: "remove", indices });
      continue;
    }
    steps.push({ kind: "add", index: i });
    i += 1;
  }
  return steps;
}
