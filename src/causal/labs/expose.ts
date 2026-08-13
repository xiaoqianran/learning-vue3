import type { CausalLab, CounterfactualWorld } from "../types";

const boxClosed = `<script setup>
import { ref } from 'vue'
const el = ref()
const count = ref(0)
function focus() { el.value.focus() }
function inc() { count.value++ }
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <p class="probe">count {{ count }}</p>
    <input ref="el" placeholder="点聚焦应跳到这里" />
    <button @click="inc">子 +1</button>
  </div>
</template>
`;

const boxFocus = `<script setup>
import { ref } from 'vue'
const el = ref()
const count = ref(0)
function focus() { el.value.focus() }
function inc() { count.value++ }
defineExpose({ focus })
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <p class="probe">count {{ count }}</p>
    <input ref="el" placeholder="点聚焦应跳到这里" />
    <button @click="inc">子 +1</button>
  </div>
</template>
`;

const boxBoth = `<script setup>
import { ref } from 'vue'
const el = ref()
const count = ref(0)
function focus() { el.value.focus() }
function inc() { count.value++ }
defineExpose({ focus, count })
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <p class="probe">count {{ count }}</p>
    <input ref="el" placeholder="点聚焦应跳到这里" />
    <button @click="inc">子 +1</button>
  </div>
</template>
`;

const boxInc = `<script setup>
import { ref } from 'vue'
const el = ref()
const count = ref(0)
function focus() { el.value.focus() }
function inc() { count.value++ }
defineExpose({ focus, count, inc })
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <p class="probe">count {{ count }}</p>
    <input ref="el" placeholder="点聚焦应跳到这里" />
    <button @click="inc">子 +1</button>
  </div>
</template>
`;

const boxEl = `<script setup>
import { ref } from 'vue'
const el = ref()
defineExpose({ el })
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input ref="el" placeholder="点聚焦应跳到这里" />
  </div>
</template>
`;

const appProbe = `<script setup>
import { ref } from 'vue'
import Box from './Box.vue'
const box = ref()
function focus() {
  box.value.focus()
}
</script>
<template>
  <p class="card">focus 是 {{ box && typeof box.focus }}</p>
  <p class="probe">count 是 {{ box && box.count }}</p>
  <button @click="focus">父：聚焦</button>
  <Box ref="box" />
</template>
`;

const appSafe = `<script setup>
import { ref } from 'vue'
import Box from './Box.vue'
const box = ref()
function focus() {
  box.value?.focus?.()
}
</script>
<template>
  <p class="card">focus 是 {{ box && typeof box.focus }}</p>
  <p class="probe">count 是 {{ box && box.count }}</p>
  <button @click="focus">父：聚焦</button>
  <Box ref="box" />
</template>
`;

const appInc = `<script setup>
import { ref } from 'vue'
import Box from './Box.vue'
const box = ref()
function inc() {
  box.value.inc()
}
</script>
<template>
  <p class="card">focus 是 {{ box && typeof box.focus }}</p>
  <p class="probe">父看到 count {{ box && box.count }}</p>
  <button @click="inc">父：+1</button>
  <Box ref="box" />
</template>
`;

const appEl = `<script setup>
import { ref } from 'vue'
import Box from './Box.vue'
const box = ref()
function focus() {
  box.value.el.focus()
}
</script>
<template>
  <p class="card">el 是 {{ box && box.el && box.el.tagName }}</p>
  <button @click="focus">父：聚焦里面的 input</button>
  <Box ref="box" />
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
import Dialog from './Dialog.vue'
const dlg = ref()
function open() { dlg.value.open() }
</script>
<template>
  <p class="card">open 是 {{ dlg && typeof dlg.open }}</p>
  <button @click="open">打开</button>
  <Dialog ref="dlg" />
</template>
`;

const dialogClosed = `<script setup>
import { ref } from 'vue'
const show = ref(false)
function open() { show.value = true }
function close() { show.value = false }
</script>
<template>
  <div class="panel">
    <p class="hint">{{ show ? '开着' : '关着' }}</p>
    <button v-if="show" @click="close">关闭</button>
  </div>
</template>
`;

const dialogExpose = `<script setup>
import { ref } from 'vue'
const show = ref(false)
function open() { show.value = true }
function close() { show.value = false }
defineExpose({ open, close })
</script>
<template>
  <div class="panel">
    <p class="hint">{{ show ? '开着' : '关着' }}</p>
    <button v-if="show" @click="close">关闭</button>
  </div>
</template>
`;

const worldClosed: CounterfactualWorld = {
  id: "closed",
  name: "没暴露",
  tagline: "script setup 默认关上",
  files: { "src/App.vue": appSafe, "src/Box.vue": boxClosed },
  nodes: [
    { id: "parent", kind: "component", label: "box.focus" },
    { id: "dom", kind: "dom", label: "undefined" },
  ],
  edges: [{ from: "parent", to: "dom", label: "没有这把钥匙" }],
  note: "子里面有 focus 函数。父手里的 ref 上看不到。",
};

const worldOpen: CounterfactualWorld = {
  id: "open",
  name: "defineExpose({ focus })",
  tagline: "只开这一扇窗",
  files: { "src/App.vue": appSafe, "src/Box.vue": boxFocus },
  nodes: [
    { id: "expose", kind: "script", label: "focus" },
    { id: "dom", kind: "dom", label: "function" },
  ],
  edges: [{ from: "expose", to: "dom" }],
  note: "卡片写 function。点聚焦，光标进输入框。count 仍看不见。",
};

export const EXPOSE_LAB: CausalLab = {
  id: "expose",
  world: 11,
  concept: "defineExpose",
  title: "父能调用的，只有你打开的窗",
  subtitle: "script setup 默认关上。defineExpose 列出父手里那份 ref 能看到的键。",
  promise:
    "一镜一条边：先没暴露 focus 是 undefined，再打开 focus 能聚焦，再 count 仍看不见，再把 count 也打开，再打开 inc 让父 +1，再暴露里面的 input 节点。",
  minutes: 16,
  official: "/api/sfc-script-setup.html#defineexpose",
  scenes: [
    {
      id: "expose-s0",
      tick: "S0",
      title: "默认关上，focus 是 undefined",
      goal: "子有 focus()。父 box.value.focus()。没有 defineExpose。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appSafe, "src/Box.vue": boxClosed },
        blocks: [{ id: "closed", label: "① 默认关上" }],
        narration: "script setup 里声明的东西，父通过模板 ref 拿不到。先认这张空窗。",
      },
      observe: {
        state: [{ id: "f", label: "box.focus", value: "undefined" }],
        dom: [{ id: "card", label: ".card", value: "undefined" }],
        events: [],
      },
      nodes: [
        { id: "fn", kind: "script", label: "focus()" },
        { id: "ref", kind: "ref", label: "box", symbol: "defineExpose" },
        { id: "dom", kind: "dom", label: "undefined" },
      ],
      edges: [{ from: "fn", to: "dom", label: "没开窗" }],
      explanation: {
        headline: "里面有，不等于外面能调用",
        body: "子自己的按钮可以 +1。父的「聚焦」调用了 ?.focus?.()，什么都不做。卡片写着 undefined。下一镜只打开 focus。",
      },
      tryThis: "卡片必须是 undefined。点「父：聚焦」，输入框必须没有光标。子自己的 +1 仍能用。",
      faqs: [
        { q: "为什么用 ?. 而不是直接调用？", a: "直接调用会抛错，预览变红。这一镜先看空窗。拆解镜再看抛错那张脸。" },
      ],
    },
    {
      id: "expose-s1",
      tick: "S1",
      title: "打开 focus 这一扇窗",
      goal: "defineExpose({ focus })。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "卡片上 focus 是？点「父：聚焦」会？",
        choices: [
          { id: "fn", label: "function，光标进入输入框", correct: true, why: "父手里的 ref 现在有 focus 这把钥匙。" },
          { id: "all", label: "function，而且 count 也能读到", correct: false, why: "只开了 focus。count 仍不在名单里。" },
          { id: "still", label: "仍是 undefined。要 Options API 才暴露", correct: false, why: "defineExpose 就是 script setup 的窗。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appSafe, "src/Box.vue": boxFocus },
        blocks: [{ id: "ex", label: "② defineExpose({ focus })" }],
        narration: "只开一扇窗。别的仍然关上。",
      },
      counterfactual: {
        id: "window",
        title: "关上 vs 打开 focus",
        setup: "子都有 focus 函数。差在有没有 defineExpose。",
        worlds: [worldClosed, worldOpen],
        punchline: "窗是白名单。没写上去的，父手里那份 ref 就没有。",
      },
      observe: {
        state: [
          { id: "f", label: "box.focus", value: "function" },
          { id: "c", label: "box.count", value: "仍是 undefined" },
        ],
        dom: [{ id: "card", label: ".card", value: "function" }],
        events: [],
      },
      nodes: [
        { id: "ex", kind: "script", label: "defineExpose" },
        { id: "focus", kind: "script", label: "focus" },
        { id: "dom", kind: "dom", label: "光标" },
      ],
      edges: [
        { from: "ex", to: "focus" },
        { from: "focus", to: "dom" },
      ],
      explanation: {
        headline: "开哪扇，父才能按哪颗",
        body: "点聚焦，光标必须进输入框。下一镜看 count：同一份 defineExpose 没写它。",
      },
      faqs: [
        { q: "Options API 默认全开吗？", a: "data / methods / computed 默认都能从父 ref 拿到。script setup 相反：默认全关。" },
      ],
      tryThis: "卡片必须是 function。点聚焦，光标必须在输入框里。打开反事实。",
      mapping: [{ code: "defineExpose({ focus })", runtime: "白名单", ui: "父能聚焦" }],
    },
    {
      id: "expose-s2",
      tick: "S2",
      title: "count 仍不在名单里",
      goal: "仍只暴露 focus。父模板读 box.count。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "在子里点 +1。父下方「count 是」会？",
        choices: [
          { id: "one", label: "变成 1。父 ref 能看见子的状态", correct: false, why: "没开这扇窗。读到的是 undefined。" },
          { id: "none", label: "仍是空 / undefined。子探针会变 1", correct: true, why: "两份脸：子自己看得到，父看不到。" },
          { id: "err", label: "报错：不能读 count", correct: false, why: "读 undefined 不报错。静默空着。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appSafe, "src/Box.vue": boxFocus },
        blocks: [{ id: "count", label: "③ 只开了 focus" }],
        narration: "代码几乎没变。请认清：聚焦通了，不等于状态也透出。",
      },
      observe: {
        state: [{ id: "c", label: "box.count", value: "undefined" }],
        dom: [
          { id: "child", label: "子探针", value: "1" },
          { id: "parent", label: "父探针", value: "空" },
        ],
        events: [],
      },
      nodes: [
        { id: "count", kind: "ref", label: "count" },
        { id: "parent", kind: "component", label: "box.count" },
      ],
      edges: [{ from: "count", to: "parent", label: "没开窗" }],
      explanation: {
        headline: "开了方法，不等于开了状态",
        body: "和 $attrs 声明成 prop 会除名同一类精确名单。下一镜把 count 写进白名单。",
      },
      faqs: [
        { q: "子探针为什么会变？", a: "那是子自己的模板在读 count。父读的是暴露出来的公共实例。" },
      ],
      tryThis: "点子 +1。子必须显示 1。父的 count 必须仍是空。聚焦仍可用。",
      mapping: [{ code: "defineExpose({ focus })", runtime: "名单里没有 count", ui: "父看不见 1" }],
    },
    {
      id: "expose-s3",
      tick: "S3",
      title: "把 count 也写上",
      goal: "defineExpose({ focus, count })。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点子 +1。父下方会？",
        choices: [
          { id: "one", label: "变成 1。暴露的 ref 会解包", correct: true, why: "公共实例上的 count 是数字，不是 Ref。" },
          { id: "ref", label: "变成 [object Ref]。父要 .value", correct: false, why: "defineExpose 会解包 ref。" },
          { id: "none", label: "仍空。模板 ref 不能读状态", correct: false, why: "写进名单就能读。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appSafe, "src/Box.vue": boxBoth },
        blocks: [{ id: "both", label: "④ 暴露 count" }],
        narration: "只在名单里多一个键。",
      },
      observe: {
        state: [{ id: "c", label: "box.count", value: "跟着子走" }],
        dom: [{ id: "probe", label: "父探针", value: "1" }],
        events: [],
      },
      nodes: [
        { id: "ex", kind: "script", label: "count" },
        { id: "parent", kind: "component", label: "父" },
      ],
      edges: [{ from: "ex", to: "parent" }],
      explanation: {
        headline: "名单里的 ref 会解包",
        body: "父读到的是数字。下一镜让父来按 +1：还需要把 inc 也打开。",
      },
      faqs: [
        { q: "父改 box.count++ 行吗？", a: "能改到那份值，但不该当 API。要给父用的动作，暴露函数。" },
      ],
      tryThis: "点子 +1。父探针必须变成 1。聚焦仍可用。",
      mapping: [{ code: "defineExpose({ count })", runtime: "解包后的数字", ui: "父看见 1" }],
    },
    {
      id: "expose-s4",
      tick: "S4",
      title: "让父来 +1",
      goal: "再暴露 inc。父按钮调用 box.inc()。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「父：+1」。两边的 count 会？",
        choices: [
          { id: "both", label: "都变成 1。调用的是同一份 inc", correct: true, why: "暴露的是函数引用。和子自己的按钮同一条边。" },
          { id: "child", label: "只有子变。父是另一份", correct: false, why: "没有拷贝。就是那一个函数。" },
          { id: "err", label: "inc 不是 focus，不能暴露", correct: false, why: "名单里可以有多个键。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appInc, "src/Box.vue": boxInc },
        blocks: [{ id: "inc", label: "⑤ 暴露 inc" }],
        narration: "父不再只读。它按子的按钮。",
      },
      observe: {
        state: [{ id: "c", label: "count", value: "父也能 +1" }],
        dom: [{ id: "probe", label: "父探针", value: "1" }],
        events: [{ id: "click", label: "click", value: "box.inc()" }],
      },
      nodes: [
        { id: "btn", kind: "event", label: "父按钮" },
        { id: "inc", kind: "script", label: "inc" },
        { id: "dom", kind: "dom", label: "两边 1" },
      ],
      edges: [
        { from: "btn", to: "inc" },
        { from: "inc", to: "dom" },
      ],
      explanation: {
        headline: "暴露函数，就是把按钮借出去",
        body: "下一镜不暴露函数，直接把里面的 input 节点递出去。父对着 DOM 调 focus。",
      },
      faqs: [
        { q: "这和 emit 有什么不同？", a: "emit 是子通知父。expose 是父调用子。方向相反。能用 props/emit 讲清的，别先上 expose。" },
      ],
      tryThis: "点父：+1。子探针和父探针必须都是 1。",
      mapping: [{ code: "defineExpose({ inc })", runtime: "同一份函数", ui: "父也能 +1" }],
    },
    {
      id: "expose-s5",
      tick: "S5",
      title: "把里面的节点递出去",
      goal: "defineExpose({ el })。父 box.el.focus()。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "卡片会显示 el 是？点聚焦会？",
        choices: [
          { id: "input", label: "INPUT，光标进入输入框", correct: true, why: "暴露的是那颗 DOM 节点。父直接调原生 focus。" },
          { id: "vue", label: "组件实例。还要 .$el", correct: false, why: "你暴露的就是 input 的 ref。" },
          { id: "und", label: "undefined。只能暴露函数", correct: false, why: "节点、数字、函数都可以上名单。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appEl, "src/Box.vue": boxEl },
        blocks: [{ id: "el", label: "⑥ 暴露 el" }],
        narration: "不再包一层 focus 函数。把节点本身递给父。",
      },
      observe: {
        state: [{ id: "el", label: "box.el", value: "INPUT" }],
        dom: [{ id: "card", label: ".card", value: "INPUT" }],
        events: [],
      },
      nodes: [
        { id: "el", kind: "dom", label: "input" },
        { id: "parent", kind: "component", label: "父" },
      ],
      edges: [{ from: "el", to: "parent", label: "递出节点" }],
      explanation: {
        headline: "递节点，父就碰到了 DOM",
        body: "能用。封装变薄。下一镜拆三种死法：没开窗、只开 focus 读 count、直接调用抛错。",
      },
      faqs: [
        { q: "哪种更好？", a: "暴露 focus() 更好：父不依赖里面是 input。暴露 el 等于把实现细节借出去。" },
      ],
      tryThis: "卡片必须是 INPUT。点聚焦，光标必须进入输入框。",
      mapping: [{ code: "defineExpose({ el })", runtime: "DOM 节点", ui: "父调 el.focus()" }],
    },
    {
      id: "expose-s6",
      tick: "S6",
      title: "拆成空窗 / 只开一扇 / 直接调用抛错",
      goal: "三种对照：没暴露、只开 focus、父直接 box.focus() 抛错。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到只开 focus。count 会？",
        choices: [
          { id: "und", label: "父仍看不见 count", correct: true, why: "先确认名单。" },
          { id: "one", label: "能看见", correct: false, why: "那是写进名单之后。" },
          { id: "err", label: "报错", correct: false, why: "读 undefined 不报错。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appSafe, "src/Box.vue": boxFocus },
        blocks: [{ id: "keep", label: "只开 focus 先留着" }],
        narration: "先确认聚焦通、count 空。再分别：关上、打开 count、直接调用抛错。",
      },
      observe: {
        state: [{ id: "ok", label: "focus", value: "function" }],
        dom: [{ id: "card", label: ".card", value: "function" }],
        events: [],
      },
      nodes: [
        { id: "ex", kind: "script", label: "defineExpose" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "ex", to: "dom" }],
      ablations: [
        {
          id: "closed",
          prompt: "如果去掉 defineExpose？",
          files: { "src/App.vue": appSafe, "src/Box.vue": boxClosed },
          expected: { kind: "stale", message: "focus 变回 undefined。点聚焦没光标。" },
          lesson: "默认关上。",
        },
        {
          id: "count",
          prompt: "如果把 count 也写上？",
          files: { "src/App.vue": appSafe, "src/Box.vue": boxBoth },
          expected: { kind: "stale", message: "这是修复：点子 +1，父看见 1。" },
          lesson: "名单有谁，父才能读谁。",
        },
        {
          id: "throw",
          prompt: "如果没暴露还直接 box.focus()？",
          files: { "src/App.vue": appProbe, "src/Box.vue": boxClosed },
          expected: { kind: "error", message: "点「父：聚焦」抛错：focus is not a function / undefined。" },
          lesson: "空窗加直接调用，就是红屏。",
        },
      ],
      explanation: {
        headline: "空窗、名单、红屏",
        body: "?. 把红屏藏成静默。直接调用把空窗变成错误。World 11 收束：属性贴到哪一层 DOM，方法从哪扇窗出去。",
      },
      tryThis: "三种消融：undefined、父看见 count、点聚焦预览报错。对上号再恢复。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先关上，再补 count，再直接调用看红屏。" },
      ],
    },
    {
      id: "expose-s7",
      tick: "S7",
      title: "换：对话框",
      goal: "Dialog 有 open()。父 dlg.open()。没有 defineExpose。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "卡片上 open 是？点打开会？",
        choices: [
          { id: "fn", label: "function，面板变成开着", correct: false, why: "和 focus 同一张图。默认关上。" },
          { id: "und", label: "undefined，点打开会抛错", correct: true, why: "这一镜父是直接调用，没有 ?." },
          { id: "open", label: "自己就开着。ref 会自动调", correct: false, why: "不会自动调。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore, "src/Dialog.vue": dialogClosed },
        blocks: [{ id: "dlg", label: "换场景：对话框" }],
        narration: "聚焦换成开关。问的仍是：名单里有没有 open。",
      },
      observe: {
        state: [{ id: "o", label: "dlg.open", value: "undefined" }],
        dom: [{ id: "card", label: ".card", value: "undefined" }],
        events: [],
      },
      nodes: [
        { id: "open", kind: "script", label: "open" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "open", to: "dom" }],
      ablations: [
        {
          id: "fix",
          prompt: "defineExpose({ open, close }) 之后？",
          files: { "src/App.vue": transferBefore, "src/Dialog.vue": dialogExpose },
          expected: {
            kind: "stale",
            message: "这是修复：open 是 function。点打开变成开着，再点关闭。",
          },
          lesson: "World 11 收束：透传贴到哪一层，暴露开哪一扇窗。能用 props/emit 就先用。",
        },
      ],
      explanation: {
        headline: "命令式 API 也是一扇窗",
        body: "对话框常用 open/close。那是暴露出来的方法，不是魔法。属性落点、事件落点、方法名单，都是同一张「过边界要报名字」的图。",
      },
      faqs: [
        { q: "能不能只用 v-model:open？", a: "能，而且更声明式。这一课要你看见 ref 调用这条边。两种都是门，方向不同。" },
      ],
      tryThis: "先点打开，预览应报错。再打开修复：必须变成开着，能关闭。",
      mapping: [
        { code: "dlg.open()", runtime: "没有这把钥匙", ui: "抛错" },
        { code: "defineExpose({ open })", runtime: "白名单", ui: "开着" },
      ],
    },
  ],
};
