import {
  Award,
  BookMarked,
  BookOpen,
  BookX,
  Code2,
  FlaskConical,
  LayoutDashboard,
  Library,
  Server,
  type LucideIcon,
} from "lucide-react";
import type { Lesson } from "@/data/lessons";
import { LESSONS, TRACKS } from "@/data/lessons";

/** 用户向路径命名（序号 + 短名） */
export const TRACK_META: Record<Lesson["track"], { order: number; label: string; blurb: string }> =
  {
    基础: { order: 1, label: "① 入门", blurb: "模板 · 响应式 · 组件基础" },
    进阶: { order: 2, label: "② 组件进阶", blurb: "路由 · 状态 · 项目" },
    全栈准备: { order: 3, label: "③ 全栈基础", blurb: "请求 · 守卫 · 校验" },
    全栈实训: { order: 4, label: "④ 项目实训", blurb: "REST · 鉴权 · Nuxt · 毕业" },
    工程化: { order: 5, label: "⑤ 工程化", blurb: "TS · 测试 · 部署" },
    进阶模式: { order: 6, label: "⑥ 模式与面试", blurb: "内置组件 · 性能 · 串讲" },
    /** 可选加深：与 LESSONS 数组一致，放在主路径之后，避免「继续学习」与路径卡错位 */
    官网对齐: { order: 7, label: "⑦ 官网补全", blurb: "对照 llms.txt · 可选加深" },
  };

export function trackLabel(track: Lesson["track"]) {
  return TRACK_META[track]?.label ?? track;
}

export function orderedTracks(): Lesson["track"][] {
  return [...TRACKS].sort((a, b) => (TRACK_META[a]?.order ?? 99) - (TRACK_META[b]?.order ?? 99));
}

/** 仅统计仍存在的课（忽略历史脏 slug） */
export function getValidCompleted(completed: string[]): string[] {
  const set = new Set(LESSONS.map((l) => l.slug));
  return completed.filter((s) => set.has(s));
}

export function completedCount(completed: string[]): number {
  return getValidCompleted(completed).length;
}

export function progressPercent(completed: string[]): number {
  if (LESSONS.length === 0) return 0;
  return Math.round((completedCount(completed) / LESSONS.length) * 100);
}

export function isAllComplete(completed: string[]): boolean {
  return LESSONS.every((l) => completed.includes(l.slug));
}

/** 下一未完成课；若已全部完成则返回最后一课 */
export function getContinueLesson(completed: string[]): Lesson {
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
  to:
    | "/"
    | "/docs"
    | "/cheatsheet"
    | "/studio"
    | "/playground"
    | "/lab"
    | "/hub"
    | "/mistakes"
    | "/certificate";
  label: string;
  hint?: string;
  icon: LucideIcon;
};

/** 顶栏主导航：学 / 查 / 练 / 我 */
export const NAV_PRIMARY: NavItem[] = [
  { to: "/docs", label: "文档", hint: "查 · 官网对照地图", icon: Library },
  { to: "/studio", label: "工坊", hint: "练 · 模拟全栈闯关", icon: Server },
  { to: "/hub", label: "进度", hint: "我 · 学习中心", icon: LayoutDashboard },
];

/** 更多工具（侧栏分组 + 顶栏下拉） */
export const NAV_TOOLS: NavItem[] = [
  { to: "/cheatsheet", label: "速查表", hint: "写码时扫一眼", icon: BookMarked },
  { to: "/playground", label: "SFC 编辑器", hint: "真 Vue 单文件", icon: Code2 },
  { to: "/lab", label: "练习场", hint: "刷测验题", icon: FlaskConical },
  { to: "/mistakes", label: "错题本", hint: "错题重练", icon: BookX },
  { to: "/certificate", label: "结业证书", hint: "全部完成后解锁", icon: Award },
];

export const NAV_HOME: NavItem = {
  to: "/",
  label: "学 · 首页",
  hint: "路径与大纲",
  icon: BookOpen,
};
