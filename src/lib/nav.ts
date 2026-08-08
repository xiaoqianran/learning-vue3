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
    官网对齐: { order: 3, label: "③ 官网补全", blurb: "对照 llms.txt 可选加深" },
    全栈准备: { order: 4, label: "④ 全栈基础", blurb: "请求 · 守卫 · 校验" },
    全栈实训: { order: 5, label: "⑤ 项目实训", blurb: "REST · 鉴权 · Nuxt · 毕业" },
    工程化: { order: 6, label: "⑥ 工程化", blurb: "TS · 测试 · 部署" },
    进阶模式: { order: 7, label: "⑦ 模式与面试", blurb: "内置组件 · 性能 · 串讲" },
  };

export function trackLabel(track: Lesson["track"]) {
  return TRACK_META[track]?.label ?? track;
}

export function orderedTracks(): Lesson["track"][] {
  return [...TRACKS].sort((a, b) => (TRACK_META[a]?.order ?? 99) - (TRACK_META[b]?.order ?? 99));
}

export function getContinueLesson(completed: string[]): Lesson {
  return LESSONS.find((l) => !completed.includes(l.slug)) ?? LESSONS[0]!;
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
  { to: "/docs", label: "查 · 文档", hint: "官网对照", icon: Library },
  { to: "/studio", label: "练 · 工坊", hint: "模拟全栈", icon: Server },
  { to: "/hub", label: "我 · 进度", hint: "学习中心", icon: LayoutDashboard },
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
