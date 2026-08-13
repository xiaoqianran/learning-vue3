import type { CausalLab } from "../types";

const hardcoded = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 slots', done: false },
])
</script>

<template>
  <section class="panel">
    <h3>今日待办</h3>
    <ul>
      <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
    </ul>
  </section>
</template>
`;

const panelEmpty = `<script setup>
defineProps({
  title: { type: String, default: '面板' },
})
</script>

<template>
  <section class="panel">
    <h3>{{ title }}</h3>
  </section>
</template>
`;

const unusedPanelApp = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 slots', done: false },
])
</script>

<template>
  <section class="panel">
    <h3>今日待办</h3>
    <ul>
      <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
    </ul>
  </section>
</template>
`;

const defaultSlotPanel = `<script setup>
defineProps({
  title: { type: String, default: '面板' },
})
</script>

<template>
  <section class="panel">
    <h3>{{ title }}</h3>
    <slot />
  </section>
</template>
`;

const defaultSlotApp = `<script setup>
import { ref } from 'vue'
import Panel from './Panel.vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 slots', done: false },
])
</script>

<template>
  <Panel title="今日待办">
    <ul>
      <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
    </ul>
  </Panel>
</template>
`;

const namedSlotPanel = `<script setup>
</script>

<template>
  <section class="panel">
    <h3><slot name="title">面板</slot></h3>
    <slot />
  </section>
</template>
`;

const namedSlotApp = `<script setup>
import { ref } from 'vue'
import Panel from './Panel.vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 slots', done: false },
])
</script>

<template>
  <Panel>
    <template #title>今日待办 · {{ todos.length }}</template>
    <ul>
      <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
    </ul>
  </Panel>
</template>
`;

const emptySlotApp = `<script setup>
import Panel from './Panel.vue'
</script>

<template>
  <Panel title="今日待办" />
</template>
`;

const transferBefore = `<script setup>
const user = { name: 'Ada', bio: '写编译器' }
</script>

<template>
  <article class="panel">
    <h3>Ada</h3>
    <p>写编译器</p>
  </article>
</template>
`;

const cardSlot = `<script setup>
</script>

<template>
  <article class="panel">
    <h3><slot name="title" /></h3>
    <slot />
  </article>
</template>
`;

const transferAfter = `<script setup>
import Card from './Card.vue'

const user = { name: 'Ada', bio: '写编译器' }
</script>

<template>
  <Card>
    <template #title>{{ user.name }}</template>
    <p>{{ user.bio }}</p>
  </Card>
</template>
`;

export const SLOTS_LAB: CausalLab = {
  id: "slots",
  world: 2,
  concept: "slots",
  title: "外壳留给子，内容还给父",
  subtitle: "props 传数据；slot 传界面",
  promise: "看见默认插槽和具名插槽如何把「里面是什么」从外壳里抽出来。",
  minutes: 12,
  official: "/guide/components/slots.html",
  scenes: [
    {
      id: "slots-s0",
      tick: "S0",
      title: "外壳和清单长在一起",
      goal: "面板的边框、标题、列表都在 App 里。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": hardcoded },
        blocks: [{ id: "all", label: "① 铬和内容糊在一起" }],
        narration: "换一套外壳，你得把列表剪出来再贴回去。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2", symbol: "todos" }],
        dom: [{ id: "panel", label: ".panel", value: "标题 + 列表" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "script", label: "App.vue" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "app", to: "dom" }],
      explanation: {
        headline: "可复用的是壳，不是这份列表",
        body: "props 能传入 title 字符串，却传不进「一段模板」。那是 slot 的工作。先做空壳，再看空壳有多空。",
      },
    },
    {
      id: "slots-s1",
      tick: "S1",
      title: "空壳上场",
      goal: "Panel.vue 只有标题，没有 slot。App 还没用它。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "现在页面会变成空面板吗？",
        choices: [
          { id: "empty", label: "会。新组件会替换当前 UI", correct: false, why: "App 还没使用 Panel。和 TodoItem 未 import 同一课。" },
          { id: "same", label: "不变。壳还没被挂上", correct: true, why: "文件不是节点。" },
          { id: "err", label: "报错", correct: false, why: "多余文件不会炸当前 App。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": unusedPanelApp,
          "src/Panel.vue": panelEmpty,
        },
        blocks: [{ id: "panel", label: "① 新建 Panel.vue（无 slot）" }],
        narration: "壳会画标题。里面还没有洞。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "仍由 App 画" }],
        dom: [{ id: "panel", label: ".panel", value: "内联" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "script", label: "App" },
        { id: "panel", kind: "component", label: "Panel", detail: "未挂载" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "app", to: "dom" }],
      explanation: {
        headline: "没有洞的组件，只能显示自己知道的东西",
        body: "title 可以用 props。列表不行——它不是一个值，是一块界面。下一镜在壳上开洞。",
      },
    },
    {
      id: "slots-s2",
      tick: "S2",
      title: "默认插槽",
      goal: "Panel 开一个 <slot />。App 把列表放进去。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "父模板写在 <Panel> 里的 ul，最终会出现在？",
        choices: [
          { id: "slot", label: "Panel 内部 <slot /> 的位置", correct: true, why: "默认插槽就是这块洞。父提供内容，子决定洞在哪。" },
          { id: "after", label: "Panel 后面，当成兄弟节点", correct: false, why: "那是没写 slot 时，编译器对「未知子节点」的处理，不是插槽。" },
          { id: "lost", label: "被丢掉，因为 Panel 没有 props.todos", correct: false, why: "slot 传的是界面，不经过 props。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": defaultSlotApp,
          "src/Panel.vue": defaultSlotPanel,
        },
        blocks: [
          { id: "slot", label: "② Panel 放入 <slot />" },
          { id: "use", label: "③ 列表写进 Panel 标签里" },
        ],
        narration: "壳复用了。列表仍属于 App——它只是被投影进洞里。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2", symbol: "todos" }],
        dom: [{ id: "panel", label: "Panel", value: "标题 + 列表" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "script", label: "App", detail: "提供内容" },
        { id: "panel", kind: "component", label: "Panel", detail: "提供壳" },
        { id: "slot", kind: "render", label: "<slot />" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "panel", to: "dom", label: "外壳" },
        { from: "app", to: "slot", label: "默认插槽" },
        { from: "slot", to: "dom" },
      ],
      explanation: {
        headline: "slot 传的是界面，不是数据",
        body: "props 走 JavaScript 值。slot 走模板碎片。父仍然拥有 todos；子甚至可以不知道有这么一个数组。",
      },
      mapping: [
        { code: "<slot />", runtime: "默认插槽出口", ui: "父传入的节点" },
        { code: "<Panel>…</Panel>", runtime: "默认插槽入口", ui: "列表" },
      ],
    },
    {
      id: "slots-s3",
      tick: "S3",
      title: "标题也变成洞",
      goal: "具名插槽：标题要能放表达式，不只是字符串 props。",
      layer: "see",
      fading: 2,
      mutation: {
        files: {
          "src/App.vue": namedSlotApp,
          "src/Panel.vue": namedSlotPanel,
        },
        blocks: [
          { id: "named", label: "④ <slot name=\"title\">" },
          { id: "hash", label: "⑤ #title 传入计数" },
        ],
        narration: "标题不再是死字符串。父可以在洞里写 {{ todos.length }}。",
      },
      observe: {
        state: [{ id: "todos", label: "todos.length", value: "2", symbol: "todos" }],
        dom: [{ id: "h3", label: "h3", value: "今日待办 · 2" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "script", label: "App" },
        { id: "titleSlot", kind: "render", label: "slot title" },
        { id: "bodySlot", kind: "render", label: "slot default" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "app", to: "titleSlot", label: "#title" },
        { from: "app", to: "bodySlot", label: "default" },
        { from: "titleSlot", to: "dom" },
        { from: "bodySlot", to: "dom" },
      ],
      explanation: {
        headline: "具名插槽 = 多个洞",
        body: "一个壳常常有「头」和「身」。props.title 只能传字符串；#title 能传任意界面，包括还在变化的派生文本。",
      },
      faqs: [
        { q: "#title 是什么？", a: "v-slot:title 的缩写。把这段模板交给名为 title 的洞。" },
        { q: "fallback「面板」呢？", a: "父若什么都不传，子的 <slot name=\"title\">面板</slot> 会显示后备内容。" },
      ],
    },
    {
      id: "slots-s4",
      tick: "S4",
      title: "洞是空的",
      goal: "挂上 Panel 却不往里放东西。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "<Panel title=\"今日待办\" /> 一个子节点都不传，会看到？",
        choices: [
          { id: "list", label: "仍然有列表，因为 todos 还在", correct: false, why: "todos 在 App 里，但没有被放进 slot。壳里是空的。" },
          { id: "chrome", label: "只有标题，身体是空的", correct: true, why: "默认插槽没内容就是空。数据不会自己漏进洞里。" },
          { id: "err", label: "报错：slot 缺少内容", correct: false, why: "空 slot 合法。只是壳没填满。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": namedSlotApp,
          "src/Panel.vue": namedSlotPanel,
        },
        blocks: [{ id: "keep", label: "填满的版本先留着" }],
        narration: "正确的图是两个洞都被填上。下面把内容拿掉。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2（仍在父级）", symbol: "todos" }],
        dom: [{ id: "panel", label: "Panel", value: "标题 + 列表" }],
        events: [],
      },
      nodes: [
        { id: "panel", kind: "component", label: "Panel" },
        { id: "slot", kind: "render", label: "slots" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "panel", to: "slot" },
        { from: "slot", to: "dom" },
      ],
      ablations: [
        {
          id: "empty",
          prompt: "如果什么都不传入？",
          files: {
            "src/App.vue": emptySlotApp,
            "src/Panel.vue": defaultSlotPanel,
          },
          expected: {
            kind: "stale",
            message: "只剩标题「今日待办」。todos 还在内存里，没有投影进 slot。",
          },
          lesson: "组件不会因为父有数据就自动显示。必须把界面放进洞里，或把数据放进 props。",
        },
      ],
      explanation: {
        headline: "空洞是合法的，也是空的",
        body: "slot 不像 v-for 会去找一个数组。它只渲染你放进去的节点。这是和 props 最大的差别。",
      },
    },
    {
      id: "slots-s5",
      tick: "S5",
      title: "换：名片",
      goal: "用户卡片：名字和简介该走 slot 还是写死？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "这段名片要复用外壳。名字和简介最适合？",
        choices: [
          { id: "slot", label: "具名标题 + 默认插槽放简介", correct: true, why: "外壳重复，内容每次不同。和 Panel 同一张图。" },
          { id: "props", label: "只能全部做成 props 字符串", correct: false, why: "简介若要加链接、换行、子组件，props 会立刻不够用。" },
          { id: "copy", label: "每张卡复制一份 .panel 标记", correct: false, why: "那是 S0。壳一改，要改 N 处。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "card", label: "换场景：名片" }],
        narration: "待办面板换成名片。先看写死的版本。",
      },
      observe: {
        state: [{ id: "user", label: "user", value: "Ada" }],
        dom: [{ id: "card", label: "article", value: "写死的壳" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "script", label: "App" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "app", to: "dom" }],
      ablations: [
        {
          id: "extract-card",
          prompt: "抽成 Card 插槽之后？",
          files: {
            "src/App.vue": transferAfter,
            "src/Card.vue": cardSlot,
          },
          expected: {
            kind: "stale",
            message: "这是修复：壳可复用，名字走 #title，简介走默认插槽。",
          },
          lesson: "World 2 收束：列表投影数据，表单写回数据，组件切边界，插槽把界面交还父级。",
        },
      ],
      explanation: {
        headline: "Todo 已经不是 20 行了",
        body: "从手写两项，到数组投影，到输入写回，到子组件协议，到外壳插槽。World 3 才会让这份 Todo 变成带路由和仓库的 SPA。机制已经可以迁移。",
      },
    },
  ],
};
