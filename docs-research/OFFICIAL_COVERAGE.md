# Vue 官方文档 ↔ learning-vue3 覆盖对照

数据源：
- https://vuejs.org/llms.txt （目录）
- https://vuejs.org/llms-full.txt （全文，约 953KB / 94 节）
- 中文镜像：https://cn.vuejs.org/llms.txt

目标：交互式中文课站在「主题覆盖 + 可动手」上不输官网；官网仍是权威 API 原文。

## 状态图例

| 标记 | 含义 |
|------|------|
| ✅ | 有课 + 源码对照 + Demo/测验 |
| 🟡 | 有课但偏浅 / 合并在其他课 |
| ⬜ | 本版新增中 |
| ❌ | 仍缺（可后续） |

## Guide · Essentials

| 官网 | 课站 | 状态 |
|------|------|------|
| Introduction | intro | ✅ |
| Quick Start | project | 🟡 |
| Creating App | project / intro | 🟡 |
| Template Syntax | template | ✅ |
| Reactivity Fundamentals | reactivity | ✅ |
| Computed | computed | ✅ |
| Class and Style | class-style | ⬜ |
| Conditional | list-render | 🟡 合并 |
| List Rendering | list-render | ✅ |
| Event Handling | events | ✅ |
| Form Input Bindings | forms | ✅ |
| Watchers | watchers | ⬜ |
| Template Refs | template-refs | ⬜ |
| Components Basics | components | ✅ |
| Lifecycle Hooks | lifecycle | ✅ |

## Components In-Depth

| 官网 | 课站 | 状态 |
|------|------|------|
| Registration | components | 🟡 |
| Props | props-emits | ✅ |
| Events | props-emits | ✅ |
| Component v-model | component-vmodel | ⬜ |
| Fallthrough Attributes | fallthrough-attrs | ⬜ |
| Slots | slots | ✅ |
| Provide / Inject | provide-inject | ✅ |
| Async Components | async-components | ⬜ |

## Reusability

| 官网 | 课站 | 状态 |
|------|------|------|
| Composables | composition | ✅ |
| Custom Directives | custom-directive | ✅ |
| Plugins | plugins | ⬜ |

## Built-in Components

| 官网 | 课站 | 状态 |
|------|------|------|
| Transition | transition | ⬜ |
| TransitionGroup | transition | 🟡 同课 |
| KeepAlive | keep-alive | ✅ |
| Teleport | teleport | ✅ |
| Suspense | suspense | ⬜ |

## Scaling Up / Best Practices

| 官网 | 课站 | 状态 |
|------|------|------|
| SFC | components / playground | ✅ |
| Tooling | project / deploy | 🟡 |
| Routing | router | ✅ |
| State | pinia | ✅ |
| Testing | testing-vue | ✅ |
| SSR | nuxt-map / ssr-basics | ⬜ 加深 |
| Production | deploy-prod | ✅ |
| Performance | perf-patterns | ✅ |
| Accessibility | a11y-security | ⬜ |
| Security | a11y-security | ⬜ |

## TypeScript / Extras

| 官网 | 课站 | 状态 |
|------|------|------|
| TS overview + Composition | vue-ts | ✅ |
| Options API TS | options-api | ⬜ 对照 |
| Reactivity in Depth | reactivity-depth | ⬜ |
| Rendering Mechanism | render-jsx | 🟡 同课 |
| Render Functions & JSX | render-jsx | ⬜ |
| Web Components | ❌ 后续 |
| Animation | transition | 🟡 |
| Style Guide | style-guide | ⬜ 速查+课 |

## 我们相对官网的「超额」能力

- 每节：**讲解 → 对应源码 → Live Demo → 测验**
- 进度 / 错题本 / 结业 / 全栈工坊 / SFC 真实编辑器
- 中文交互优先，不是纯文档站

## 本轮不做（有意）

- 逐字镜像 API Reference 每一页（用速查 + 外链）
- Options API 全量重写（以 Composition 为主 + 对照课）
- 官方 Tutorial 逐步克隆
