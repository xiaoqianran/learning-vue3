import {
  BookOpen,
  FlaskConical,
  LayoutDashboard,
  Library,
  type LucideIcon,
} from "lucide-react";
import type { Lesson } from "@/data/lessons";
import { LESSONS, TRACKS, getCourseLessons } from "@/data/lessons";

export const TRACK_META: Record<Lesson["track"], { order: number; label: string; blurb: string }> =
  {
    基础: { order: 1, label: "① 入门", blurb: "模板 · 响应式 · 组件基础" },
    进阶: { order: 2, label: "② 组件进阶", blurb: "路由 · 状态 · 项目" },
    全栈准备: { order: 3, label: "③ 全栈基础", blurb: "请求 · 守卫 · 校验" },
    全栈实训: { order: 4, label: "④ 项目实训", blurb: "REST · 鉴权 · Nuxt · 毕业" },
    工程化: { order: 5, label: "⑤ 工程化", blurb: "TS · 测试 · 部署" },
    进阶模式: { order: 6, label: "⑥ 模式与面试", blurb: "内置组件 · 性能 · 串讲" },
    官网对齐: { order: 7, label: "⑦ 官网补全", blurb: "对照 llms.txt · 可选加深" },
  };

export function trackLabel(track: Lesson["track"]) {
  return TRACK_META[track]?.label ?? track;
}

export function orderedTracks(): Lesson["track"][] {
  return [...TRACKS].sort((a, b) => (TRACK_META[a]?.order ?? 99) - (TRACK_META[b]?.order ?? 99));
}

export function getValidCompleted(completed: string[]): string[] {
  const set = new Set(LESSONS.map((l) => l.slug));
  return completed.filter((s) => set.has(s));
}

export function completedCount(completed: string[]): number {
  const set = new Set(getValidCompleted(completed));
  return getCourseLessons().filter((l) => set.has(l.slug)).length;
}

export function progressPercent(completed: string[]): number {
  const core = getCourseLessons();
  if (core.length === 0) return 0;
  return Math.round((completedCount(completed) / core.length) * 100);
}

export function isAllComplete(completed: string[]): boolean {
  return getCourseLessons().every((l) => completed.includes(l.slug));
}

export function getContinueLesson(completed: string[]): Lesson {
  const coreNext = getCourseLessons().find((l) => !completed.includes(l.slug));
  if (coreNext) return coreNext;
  const next = LESSONS.find((l) => !completed.includes(l.slug));
  if (next) return next;
  return LESSONS[LESSONS.length - 1] ?? LESSONS[0]!;
}

export function getContinueHref(completed: string[]): {
  kind: "lesson" | "certificate";
  slug?: string;
} {
  if (isAllComplete(completed)) return { kind: "certificate" };
  return { kind: "lesson", slug: getContinueLesson(completed).slug };
}

export type NavItem = {
  to: "/" | "/causal" | "/causal/$labId" | "/hub" | "/docs";
  label: string;
  hint?: string;
  icon: LucideIcon;
};

export const NAV_PRIMARY: NavItem[] = [
  { to: "/causal", label: "实验室", hint: "程序时间机器", icon: FlaskConical },
  { to: "/hub", label: "掌握度", icon: LayoutDashboard },
];

export const NAV_TOOLS: NavItem[] = [
  { to: "/docs", label: "资料库", hint: "旧教程对照", icon: Library },
];

export const NAV_HOME: NavItem = {
  to: "/",
  label: "首页",
  icon: BookOpen,
};
