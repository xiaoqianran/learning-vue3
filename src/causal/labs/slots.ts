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

const panelNoSlot = `<script setup>
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

const shellOnlyApp = `<script setup>
import { ref } from 'vue'
import Panel from './Panel.vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 slots', done: false },
])
</script>

<template>
  <Panel title="今日待办" />
</template>
`;

const panelDefaultSlot = `<script setup>
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

const filledDefaultApp = `<script setup>
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

const panelNamed = `<script setup>
</script>

<template>
  <section class="panel">
    <h3><slot name="title">面板</slot></h3>
    <slot />
  </section>
</template>
`;

const namedFilledApp = `<script setup>
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

const namedFallbackApp = `<script setup>
import { ref } from 'vue'
import Panel from './Panel.vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 slots', done: false },
])
</script>

<template>
  <Panel>
    <ul>
      <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
    </ul>
  </Panel>
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
  promise:
    "一镜一条边：先做空壳，再换上去（列表会丢），再开洞（还是空），再填洞，再把标题从 props 换成具名洞（标题走后备），再填 #title。看见 props 传不进一段模板。",
  minutes: 18,
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
        narration: "换一套外壳，你得把列表剪出来再贴回去。props 能传入 title 字符串，却传不进「一段模板」。",
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
        body: "title 是值，可以用 props。列表是界面，要用 slot。下一镜只创建空壳文件，先不替换 App——否则你会分不清「文件出现」和「内容丢失」。",
      },
      tryThis: "看右侧：边框、标题、列表长在一起。下一镜文件会出现，这一页不应变。",
    },
    {
      id: "slots-s1",
      tick: "S1",
      title: "空壳进门，App 不动",
      goal: "Panel.vue 只有标题 props，没有 slot。App 仍内联。",
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
          "src/App.vue": hardcoded,
          "src/Panel.vue": panelNoSlot,
        },
        blocks: [{ id: "panel", label: "② 新建 Panel.vue（无 slot）" }],
        narration: "壳会画标题。里面没有洞。列表仍由 App 自己画。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "仍由 App 画" }],
        dom: [{ id: "panel", label: ".panel", value: "内联，完整" }],
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
        body: "title 可以用 props 传字符串。列表不行——它不是一个值。下一镜把 App 换成 <Panel title=... />，你会看见列表消失。这是故意的。",
      },
      tryThis: "确认列表还在。Panel.vue 已经存在，但 App 没用它。",
    },
    {
      id: "slots-s2",
      tick: "S2",
      title: "换上壳，列表消失",
      goal: "App 改成 <Panel title=\"今日待办\" />，一个子节点都不传。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "换成自闭合 Panel 之后，会看到？",
        choices: [
          { id: "keep", label: "标题和列表都在，只是换了样式", correct: false, why: "列表还在 todos 里，但没有被放进 Panel。壳不知道有这份数组。" },
          { id: "chrome", label: "只剩标题「今日待办」，身体是空的", correct: true, why: "你换上了壳，却把内容留在了内存里。props 只传了字符串标题。" },
          { id: "err", label: "报错：todos 没用到", correct: false, why: "未使用的 ref 不报错。失败是空白。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": shellOnlyApp,
          "src/Panel.vue": panelNoSlot,
        },
        blocks: [{ id: "use", label: "③ <Panel title=\"今日待办\" />" }],
        narration: "请看右侧：边框和标题在，两项待办没了。todos 仍在 script 里。这就是「props 传不进界面」。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2（未被投影）", symbol: "todos" }],
        dom: [{ id: "panel", label: "Panel", value: "只有标题" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "panel", kind: "component", label: "Panel" },
        { id: "dom", kind: "dom", label: "DOM", detail: "空身体" },
      ],
      edges: [{ from: "panel", to: "dom", label: "只有 title prop" }],
      why: {
        question: "为什么不把 todos 做成 Panel 的 prop？",
        choices: [
          { id: "ui", label: "那会让壳知道清单怎么画，壳就不再是壳", correct: true, why: "prop 传数据。身体可能是列表、表单、一段字。壳不该规定内容类型。" },
          { id: "can", label: "其实应该传 todos，这才是 Vue 的方式", correct: false, why: "能做，但 Panel 会变成 TodoPanel。换名片就要再做一个组件。" },
          { id: "slot", label: "下一镜开洞之前，传 todos 也能显示", correct: false, why: "传了还得在 Panel 内部写 v-for。那就不是插槽课了。" },
        ],
      },
      explanation: {
        headline: "换壳会丢掉没交接的内容",
        body: "这不是 bug，是边界。下一镜只在 Panel 里开一个 <slot />，App 先不改——洞是空的，所以页面仍该是空身体。先看见「有洞 ≠ 有内容」。",
      },
      tryThis: "看右侧：标题「今日待办」还在，两项待办没了。todos 仍在 script 里。",
    },
    {
      id: "slots-s3",
      tick: "S3",
      title: "开洞，先不填",
      goal: "Panel 加上 <slot />。App 仍自闭合。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "壳上开了默认插槽，父什么都不传入。身体会？",
        choices: [
          { id: "list", label: "列表自动出现，因为 todos 还在", correct: false, why: "slot 不会去找父的变量。它只渲染你放进去的节点。" },
          { id: "empty", label: "仍是空的。洞在，没人往里放东西", correct: true, why: "和有 ref、没人读一样：出口在，入口是空。" },
          { id: "err", label: "报错：slot 缺少内容", correct: false, why: "空 slot 合法。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": shellOnlyApp,
          "src/Panel.vue": panelDefaultSlot,
        },
        blocks: [{ id: "slot", label: "④ Panel 放入 <slot />" }],
        narration: "洞开了。右侧仍只有标题。请确认这一点，再进入「填洞」。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2（仍在父级）", symbol: "todos" }],
        dom: [{ id: "panel", label: "Panel", value: "标题 + 空洞" }],
        events: [],
      },
      nodes: [
        { id: "panel", kind: "component", label: "Panel" },
        { id: "slot", kind: "render", label: "<slot />", detail: "空" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "panel", to: "dom" }],
      explanation: {
        headline: "有洞 ≠ 有内容",
        body: "slot 不像 v-for 会去读一个数组。它是出口。下一镜父把 ul 写进 <Panel>…</Panel> 里，内容才会出现在洞的位置。",
      },
      tryThis: "确认身体仍是空的。洞开了，没人往里放东西。",
      faqs: [
        { q: "空 slot 会报错吗？", a: "不会。合法，只是空洞。和有 ref 没人读一样安静。" },
      ],
      mapping: [{ code: "<slot />", runtime: "默认插槽出口（空）", ui: "身体空白" }],
    },
    {
      id: "slots-s4",
      tick: "S4",
      title: "把列表放进洞里",
      goal: "父提供默认插槽内容。壳仍然不知道 todos。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "父模板写在 <Panel> 里的 ul，最终会出现在？",
        choices: [
          { id: "slot", label: "Panel 内部 <slot /> 的位置", correct: true, why: "默认插槽就是这块洞。父提供内容，子决定洞在哪。" },
          { id: "after", label: "Panel 后面，当成兄弟节点", correct: false, why: "那是没写 slot 时对未知子节点的处理，不是插槽。" },
          { id: "lost", label: "被丢掉，因为 Panel 没有 props.todos", correct: false, why: "slot 传的是界面，不经过 props。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": filledDefaultApp,
          "src/Panel.vue": panelDefaultSlot,
        },
        blocks: [{ id: "fill", label: "⑤ 列表写进 Panel 标签里" }],
        narration: "壳复用了。列表仍属于 App——它只是被投影进洞里。标题仍是 props 字符串。",
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
        body: "props 走 JavaScript 值。slot 走模板碎片。父仍然拥有 todos；子甚至可以不知道有这么一个数组。标题现在还是死字符串——下一镜才让标题也变成洞。",
      },
      faqs: [
        { q: "写在 <Panel> 和 </Panel> 之间的东西，默认进哪个洞？", a: "没有 v-slot 的内容进默认插槽，也就是 <slot />（不带 name）。" },
        { q: "Panel 现在知道 todos 吗？", a: "不知道。它只在洞的位置投影父给的节点。todos 仍只属于 App。" },
      ],
      tryThis: "列表应回来。标题仍是 props 字符串「今日待办」。下一镜才动标题。",
      mapping: [
        { code: "<slot />", runtime: "默认插槽出口", ui: "父传入的节点" },
        { code: "<Panel>…</Panel>", runtime: "默认插槽入口", ui: "列表" },
      ],
    },
    {
      id: "slots-s5",
      tick: "S5",
      title: "标题洞开了，props 填不进去",
      goal: "Panel 改用 <slot name=\"title\">。App 仍写 title=\"今日待办\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "壳改成具名标题洞（后备是「面板」），父仍写 title=\"今日待办\"。标题会？",
        choices: [
          { id: "prop", label: "仍是「今日待办」，因为属性还在", correct: false, why: "title= 不再对应任何 prop。它不会自动进名为 title 的插槽。" },
          { id: "fb", label: "变成后备「面板」。列表还在", correct: true, why: "开了洞不等于填了洞。属性不是插槽内容。默认插槽里的列表不受影响。" },
          { id: "blank", label: "标题空白，列表也丢了", correct: false, why: "标题有后备；列表仍在默认插槽里。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": filledDefaultApp,
          "src/Panel.vue": panelNamed,
        },
        blocks: [{ id: "named", label: "⑥ <slot name=\"title\">面板</slot>" }],
        narration: "标题从 props 换成了洞。父还在用旧的 title= 属性。请看右侧：标题应变成「面板」，列表还在。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2", symbol: "todos" }],
        dom: [{ id: "h3", label: "h3", value: "面板（后备）" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "script", label: "App", detail: "title= 落空" },
        { id: "titleSlot", kind: "render", label: "slot title", detail: "后备" },
        { id: "bodySlot", kind: "render", label: "slot default" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "titleSlot", to: "dom", label: "fallback" },
        { from: "app", to: "bodySlot" },
        { from: "bodySlot", to: "dom" },
      ],
      why: {
        question: "为什么 title=\"今日待办\" 没把标题改回来？",
        choices: [
          { id: "attr", label: "那是 HTML 属性 / 已删除的 prop，不是 #title 插槽内容", correct: true, why: "填具名洞要写 <template #title>…</template>。属性进不去洞里。" },
          { id: "name", label: "属性名和 slot 名碰巧都叫 title，Vue 会自动对接", correct: false, why: "不会。这正是这一镜要打破的错觉。" },
          { id: "lost", label: "因为列表抢了默认插槽，标题洞被关掉了", correct: false, why: "两个洞互不抢。标题洞只是空着。" },
        ],
      },
      explanation: {
        headline: "属性填不进插槽",
        body: "props 走 JavaScript 值。具名插槽走模板碎片。你把壳换成洞之后，旧的 title= 就只是落空的属性。下一镜父才用 #title 把界面放进这个洞。",
      },
      tryThis: "看标题是不是「面板」，列表是不是还在。title=\"今日待办\" 还写在 App 里，但它没生效。",
      faqs: [
        { q: "那 title= 跑到哪去了？", a: "没有对应 prop 时，往往变成根元素上的普通 HTML 属性。打开 DOM 也许能看见，但 h3 读的是插槽。" },
        { q: "后备是什么？", a: "<slot name=\"title\">面板</slot> 标签里的「面板」。洞空着时才显示。下一镜填上就会被换掉。" },
      ],
      mapping: [
        { code: '<slot name="title">面板</slot>', runtime: "具名洞 + 后备", ui: "面板" },
        { code: 'title="今日待办"', runtime: "落空的属性", ui: "不进 h3" },
      ],
    },
    {
      id: "slots-s6",
      tick: "S6",
      title: "用 #title 填进洞里",
      goal: "父提供具名插槽内容。标题要能放表达式。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "改成 #title 传入「今日待办 · {{ todos.length }}」后，标题会？",
        choices: [
          { id: "count", label: "变成「今日待办 · 2」，并随列表长度更新", correct: true, why: "具名插槽里的模板仍在父作用域求值。它能读 todos。" },
          { id: "prop", label: "仍显示后备「面板」", correct: false, why: "你传入了 #title。后备只在完全不传时出现。" },
          { id: "empty", label: "标题空白，因为去掉了 title prop", correct: false, why: "prop 本来就已经没用了。现在洞被填上了。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": namedFilledApp,
          "src/Panel.vue": panelNamed,
        },
        blocks: [{ id: "hash", label: "⑦ #title 传入计数" }],
        narration: "标题不再是死字符串，也不再走后备。父可以在洞里写 {{ todos.length }}。#title 是 v-slot:title 的缩写。",
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
      why: {
        question: "为什么 props.title 不够，非要具名插槽？",
        choices: [
          { id: "expr", label: "prop 只能传值；插槽能传一段还在变化的界面", correct: true, why: "计数、图标、链接都不该先在父里拼成字符串再塞进去。" },
          { id: "style", label: "只是写法不同，能力一样", correct: false, why: "字符串 prop 塞不进一个 <span> 或一个按钮。" },
          { id: "scope", label: "具名插槽能让子读到父的 todos", correct: false, why: "默认插槽也能。求值作用域本来就在父。具名只是多个洞。" },
        ],
      },
      explanation: {
        headline: "具名插槽 = 再开一个洞",
        body: "一个壳常常有「头」和「身」。props.title 只能传字符串；#title 能传任意界面，包括还在变化的派生文本。你已经见过：开洞却用属性去填，会掉进后备。",
      },
      tryThis: "看标题是不是「今日待办 · 2」。默认插槽里的列表应原样还在。",
      faqs: [
        { q: "#title 是什么？", a: "v-slot:title 的缩写。把这段模板交给名为 title 的洞。" },
        { q: "默认插槽还在吗？", a: "在。<slot /> 仍接列表。两个洞互不抢。" },
        { q: "不传 #title 会怎样？", a: "上一镜已经见过：走后备「面板」。消融里还会再拆一次两个洞都不填。" },
      ],
    },
    {
      id: "slots-s7",
      tick: "S7",
      title: "两个洞都不填",
      goal: "回到自闭合 <Panel />。标题走后备，身体真空。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "<Panel /> 一个子节点都不传（用带后备的壳），会看到？",
        choices: [
          { id: "list", label: "仍然有列表，因为 todos 还在", correct: false, why: "todos 在 App 里，但没有被放进 slot。" },
          { id: "fb", label: "标题是「面板」，身体是空的", correct: true, why: "title 洞有后备；默认洞没有后备。" },
          { id: "err", label: "报错：slot 缺少内容", correct: false, why: "空 slot 合法。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": namedFilledApp,
          "src/Panel.vue": panelNamed,
        },
        blocks: [{ id: "keep", label: "填满的版本先留着" }],
        narration: "正确的图是两个洞都被填上。下面把内容全部拿掉。",
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
          id: "no-title",
          prompt: "如果只不传 #title？",
          files: {
            "src/App.vue": namedFallbackApp,
            "src/Panel.vue": panelNamed,
          },
          expected: {
            kind: "stale",
            message: "列表还在。标题走后备「面板」。这是「一个洞空着」：不是全身空白，只是头回到默认家具。",
          },
          lesson: "两个洞独立。默认插槽填了，具名洞仍可走后备。",
        },
        {
          id: "empty",
          prompt: "如果两个洞都不传？",
          files: {
            "src/App.vue": shellOnlyApp,
            "src/Panel.vue": panelNamed,
          },
          expected: {
            kind: "stale",
            message: "标题走后备「面板」。身体真空。todos 还在内存里。这一版壳已经不用 title prop，所以 title=\"今日待办\" 会被忽略（落成普通属性）。",
          },
          lesson: "组件不会因为父有数据就自动显示。必须把界面放进洞里。多余的 title= 属性若没有对应 prop，也不会填进具名插槽。",
        },
        {
          id: "no-hole",
          prompt: "如果壳上根本没有 slot？",
          files: {
            "src/App.vue": filledDefaultApp,
            "src/Panel.vue": panelNoSlot,
          },
          expected: {
            kind: "stale",
            message: "父传入的列表没有出口，进不去壳。往往直接丢弃。标题若仍用 props 会显示「今日待办」，身体仍空。",
          },
          lesson: "没有洞，内容就没有地方去。开洞和填洞是两条边。",
        },
      ],
      explanation: {
        headline: "空洞是合法的，也是空的",
        body: "slot 只渲染你放进去的节点，或子写下的后备。这是和 props、和 v-for 最大的差别。",
      },
      tryThis: "先看填满的版本。再试：只不传 #title、两个洞都不传、壳上根本没有 slot。每种失败的脸不一样。",
    },
    {
      id: "slots-s8",
      tick: "S8",
      title: "换：名片",
      goal: "用户卡片：名字和简介该走 slot 还是写死？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "这段名片要复用外壳。名字和简介最适合？",
        choices: [
          { id: "slot", label: "具名标题 + 默认插槽放简介", correct: true, why: "外壳重复，内容每次不同。和 Panel 同一张图。你已经见过：只换壳会丢掉内容。" },
          { id: "props", label: "只能全部做成 props 字符串", correct: false, why: "简介若要加链接、换行、子组件，props 会立刻不够用。" },
          { id: "copy", label: "每张卡复制一份 .panel 标记", correct: false, why: "那是 S0。壳一改，要改 N 处。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "card", label: "换场景：名片" }],
        narration: "待办面板换成名片。先看写死的版本。想一想：换壳时哪一块会丢。",
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
          lesson: "World 2 收束：列表投影数据，表单写回数据，组件切边界，插槽把界面交还父级。每一条边都单独接过，才算仔细。",
        },
      ],
      explanation: {
        headline: "Todo 已经不是 20 行了",
        body: "从手写两项，到数组投影，到输入写回，到子组件协议，到外壳插槽。World 3 才会让这份 Todo 变成带路由和仓库的 SPA。机制已经可以迁移——前提是你能指出每一条边。",
      },
      tryThis: "先看写死的名片。想清楚哪一块是壳、哪一块是内容。再打开「抽成 Card 插槽」。",
    },
  ],
};
