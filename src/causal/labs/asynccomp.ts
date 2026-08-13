import type { CausalLab, CounterfactualWorld } from "../types";

const panel = `<script setup>
const name = 'Ada'
</script>
<template>
  <p class="card">{{ name }}</p>
</template>
`;

const appSync = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">同步组件</p>
  <Panel />
</template>
`;

const appBlank = `<script setup>
import { defineAsyncComponent } from 'vue'
import Panel from './Panel.vue'
const AsyncPanel = defineAsyncComponent(() =>
  new Promise((resolve) => {
    setTimeout(() => resolve(Panel), 700)
  }),
)
</script>
<template>
  <p class="hint">分包还在路上 · 没有 loading</p>
  <AsyncPanel />
</template>
`;

const appLoading = `<script setup>
import { defineAsyncComponent } from 'vue'
import Panel from './Panel.vue'
const Loading = { template: '<p class="loading">加载中</p>' }
const AsyncPanel = defineAsyncComponent({
  loader: () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(Panel), 700)
    }),
  loadingComponent: Loading,
  delay: 0,
})
</script>
<template>
  <p class="hint">delay: 0 · 立刻出示加载中</p>
  <AsyncPanel />
</template>
`;

const appDelaySkip = `<script setup>
import { defineAsyncComponent } from 'vue'
import Panel from './Panel.vue'
const Loading = { template: '<p class="loading">加载中</p>' }
const AsyncPanel = defineAsyncComponent({
  loader: () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(Panel), 200)
    }),
  loadingComponent: Loading,
  delay: 500,
})
</script>
<template>
  <p class="hint">delay 500ms · 分包 200ms · 加载中来不及出场</p>
  <AsyncPanel />
</template>
`;

const boom = `<script setup>
defineProps({
  error: Object,
  retry: Function,
})
</script>
<template>
  <p class="error">失败{{ error && error.message ? '：' + error.message : '' }}</p>
</template>
`;

const appFail = `<script setup>
import { defineAsyncComponent } from 'vue'
const AsyncPanel = defineAsyncComponent(() =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error('分包丢失')), 400)
  }),
)
</script>
<template>
  <p class="hint">loader 拒绝了 · 没有 errorComponent</p>
  <AsyncPanel />
</template>
`;

const appFailFace = `<script setup>
import { defineAsyncComponent } from 'vue'
import Boom from './Boom.vue'
const AsyncPanel = defineAsyncComponent({
  loader: () =>
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('分包丢失')), 400)
    }),
  errorComponent: Boom,
  delay: 0,
})
</script>
<template>
  <p class="hint">失败有一张脸</p>
  <AsyncPanel />
</template>
`;

const transferBefore = `<script setup>
import { defineAsyncComponent } from 'vue'
import Price from './Price.vue'
const AsyncPrice = defineAsyncComponent(() =>
  new Promise((resolve) => {
    setTimeout(() => resolve(Price), 700)
  }),
)
</script>
<template>
  <p class="hint">价钱也在路上</p>
  <AsyncPrice />
</template>
`;

const price = `<script setup>
</script>
<template>
  <p class="card">36 元</p>
</template>
`;

const transferFixed = `<script setup>
import { defineAsyncComponent } from 'vue'
import Price from './Price.vue'
const Loading = { template: '<p class="loading">加载中</p>' }
const AsyncPrice = defineAsyncComponent({
  loader: () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(Price), 700)
    }),
  loadingComponent: Loading,
  delay: 0,
})
</script>
<template>
  <p class="hint">先出示加载中</p>
  <AsyncPrice />
</template>
`;

const worldBlank: CounterfactualWorld = {
  id: "blank",
  name: "没有 loading",
  tagline: "空白等 700ms",
  files: { "src/App.vue": appBlank, "src/Panel.vue": panel },
  nodes: [
    { id: "wait", kind: "async", label: "700ms" },
    { id: "dom", kind: "dom", label: "空白 → Ada" },
  ],
  edges: [{ from: "wait", to: "dom" }],
  note: "分包还没到。父不知道该说什么，就什么都不画。",
};

const worldLoad: CounterfactualWorld = {
  id: "load",
  name: "有 loadingComponent",
  tagline: "加载中 → Ada",
  files: { "src/App.vue": appLoading, "src/Panel.vue": panel },
  nodes: [
    { id: "load", kind: "async", label: "loading" },
    { id: "dom", kind: "dom", label: "Ada" },
  ],
  edges: [{ from: "load", to: "dom", label: "到了" }],
  note: "等待也是一张脸。不要用空白冒充还没到。",
};

export const ASYNCCOMP_LAB: CausalLab = {
  id: "asynccomp",
  world: 13,
  concept: "defineAsyncComponent",
  title: "组件还在路上",
  subtitle: "defineAsyncComponent 把一次 import 变成等待。空白、加载中、失败，是三张不同的脸。",
  promise:
    "一镜一条边：先同步立刻 Ada，再异步空白等待，再出示加载中，再 delay 比分包还长于是跳过加载中，再拒绝后空白，再 errorComponent 露出失败。",
  minutes: 16,
  official: "/guide/components/async.html",
  scenes: [
    {
      id: "asynccomp-s0",
      tick: "S0",
      title: "同步组件，立刻 Ada",
      goal: "import Panel from './Panel.vue'。没有异步。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appSync, "src/Panel.vue": panel },
        blocks: [{ id: "sync", label: "① 同步 import" }],
        narration: "World 2 的组件是一起到的。这一课假装 Panel 还在另一个分包里。先看立刻到的脸。",
      },
      observe: {
        state: [],
        dom: [{ id: "card", label: ".card", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "panel", kind: "component", label: "Panel" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [{ from: "panel", to: "dom" }],
      explanation: {
        headline: "同步 import 没有等待这张脸",
        body: "下一镜用 Promise 推迟 700ms。同一份 Panel，先空白再出现。",
      },
      tryThis: "打开就必须看见 Ada。没有「加载中」。",
      faqs: [
        { q: "为什么不用真的 import()？", a: "预览里用 setTimeout 假装分包在路上。边是一样的：组件还没 resolve。" },
      ],
    },
    {
      id: "asynccomp-s1",
      tick: "S1",
      title: "异步到了之前，是空白",
      goal: "defineAsyncComponent + 700ms。没有 loadingComponent。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开后的前半秒。画面会？",
        choices: [
          { id: "blank", label: "空白。组件还没 resolve，父不画它", correct: true, why: "没有 loadingComponent，等待期就是什么都没有。" },
          { id: "ada", label: "立刻 Ada。defineAsyncComponent 只是写法", correct: false, why: "Promise 还没到。同步那一镜才立刻有。" },
          { id: "load", label: "自动出现加载中", correct: false, why: "不会自动。下一镜才加。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appBlank, "src/Panel.vue": panel },
        blocks: [{ id: "wait", label: "② 空白等待" }],
        narration: "父一行还是 <AsyncPanel />。子晚 700ms 才到手。",
      },
      counterfactual: {
        id: "blank-vs-load",
        title: "空白 vs 加载中",
        setup: "都等 700ms。差在有没有 loadingComponent。",
        worlds: [worldBlank, worldLoad],
        punchline: "等待不是没发生。它只是还没有一张脸。",
      },
      observe: {
        state: [],
        dom: [{ id: "app", label: "#app", value: "先空白，再 Ada" }],
        events: [],
      },
      nodes: [
        { id: "p", kind: "async", label: "Promise", symbol: "defineAsyncComponent" },
        { id: "dom", kind: "dom", label: "空白" },
      ],
      edges: [{ from: "p", to: "dom", label: "还没到" }],
      explanation: {
        headline: "没到的组件，默认不占地方",
        body: "和 World 4 请求没有 loading 同一张空白。下一镜给等待一张脸。",
      },
      faqs: [
        { q: "空白会不会闪一下？", a: "会。网速快时你可能只看见 Ada。这一镜延迟足够长，空白必须被看见。" },
      ],
      tryThis: "打开后先确认没有 Ada。大约一秒后必须出现 Ada。打开反事实。",
      mapping: [{ code: "defineAsyncComponent(() => Promise)", runtime: "等待期无节点", ui: "空白" }],
    },
    {
      id: "asynccomp-s2",
      tick: "S2",
      title: "等待也要有一张脸",
      goal: "loadingComponent + delay: 0。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开后的前半秒。画面会？",
        choices: [
          { id: "load", label: "加载中。delay 0 立刻出示", correct: true, why: "loadingComponent 是等待期的替身。" },
          { id: "blank", label: "仍空白。loading 要 Suspense 才行", correct: false, why: "defineAsyncComponent 自己就能挂 loading。" },
          { id: "ada", label: "立刻 Ada", correct: false, why: "700ms 还没到。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appLoading, "src/Panel.vue": panel },
        blocks: [{ id: "load", label: "③ loadingComponent" }],
        narration: "分包速度没变。只多了一张等待的脸。",
      },
      observe: {
        state: [],
        dom: [{ id: "load", label: ".loading", value: "加载中 → Ada" }],
        events: [],
      },
      nodes: [
        { id: "load", kind: "async", label: "loading" },
        { id: "panel", kind: "component", label: "Panel" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [
        { from: "load", to: "panel", label: "resolve" },
        { from: "panel", to: "dom" },
      ],
      explanation: {
        headline: "loadingComponent 是等待的替身",
        body: "下一镜把 delay 设成 500ms，分包却只要 200ms：加载中来不及出场。",
      },
      faqs: [
        { q: "delay 默认是多少？", a: "200ms。避免极快的分包闪一下「加载中」。这一镜写成 0，好让你看见替身。" },
      ],
      tryThis: "打开必须先看见「加载中」，再变成 Ada。不要空白。",
      mapping: [{ code: "loadingComponent, delay: 0", runtime: "立刻替身", ui: "加载中" }],
    },
    {
      id: "asynccomp-s3",
      tick: "S3",
      title: "delay 比分包还长，跳过加载中",
      goal: "delay: 500。loader 200ms 就到。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "分包 200ms 就到。delay 要等 500ms 才出示加载中。会？",
        choices: [
          { id: "skip", label: "看不到加载中。直接 Ada", correct: true, why: "还没到出示替身的时刻，真组件已经 resolve。" },
          { id: "load", label: "仍先加载中。delay 是最低显示时间", correct: false, why: "delay 是「多久以后才允许出示」，不是「至少显示多久」。" },
          { id: "blank", label: "空白 500ms", correct: false, why: "200ms 时 Ada 已经能画。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appDelaySkip, "src/Panel.vue": panel },
        blocks: [{ id: "delay", label: "④ delay 500 / 分包 200" }],
        narration: "替身准备出场。主角先到了。",
      },
      observe: {
        state: [],
        dom: [{ id: "card", label: ".card", value: "Ada（没经过加载中）" }],
        events: [],
      },
      nodes: [
        { id: "delay", kind: "async", label: "delay 500" },
        { id: "done", kind: "async", label: "200ms 到了" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [{ from: "done", to: "dom", label: "跳过替身" }],
      explanation: {
        headline: "delay 是出门的门槛，不是演出时长",
        body: "快的分包不该闪一下加载中。慢的才需要替身。下一镜 loader 拒绝：没有 errorComponent 时又是空白。",
      },
      faqs: [
        { q: "那怎么让加载中至少转一圈？", a: "那是另一条边。delay 管的是「要不要出场」，不管「出场后最少待多久」。" },
      ],
      tryThis: "打开后应很快看见 Ada，中间不要出现「加载中」。",
      mapping: [{ code: "delay: 500, loader 200ms", runtime: "替身还没出门", ui: "直接 Ada" }],
    },
    {
      id: "asynccomp-s4",
      tick: "S4",
      title: "拒绝了，仍是空白",
      goal: "loader reject。没有 errorComponent。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "400ms 后 Promise 拒绝。画面会？",
        choices: [
          { id: "blank", label: "仍空白。失败也没有脸", correct: true, why: "没有 errorComponent，拒绝和等待一样不画。" },
          { id: "err", label: "自动出现红字", correct: false, why: "不会自动。下一镜才加。" },
          { id: "ada", label: "Ada 还是会到。拒绝只是警告", correct: false, why: "没有 resolve，就没有 Panel。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appFail },
        blocks: [{ id: "rej", label: "⑤ reject，没有脸" }],
        narration: "等待变成失败。你仍什么都没准备。",
      },
      observe: {
        state: [],
        dom: [{ id: "app", label: "#app", value: "空白" }],
        events: [],
      },
      nodes: [
        { id: "rej", kind: "async", label: "reject" },
        { id: "dom", kind: "dom", label: "空白" },
      ],
      edges: [{ from: "rej", to: "dom" }],
      explanation: {
        headline: "失败默认也是空白",
        body: "等待空白、失败空白，看起来像同一张脸。原因不同。下一镜给失败一张红脸。",
      },
      faqs: [
        { q: "控制台会红吗？", a: "会有未处理的 Promise。画面仍可能什么都没有。所以要 errorComponent。" },
      ],
      tryThis: "等一秒。必须一直没有 Ada，也没有「失败」二字。",
      mapping: [{ code: "reject() 且无 errorComponent", runtime: "没有节点", ui: "空白" }],
    },
    {
      id: "asynccomp-s5",
      tick: "S5",
      title: "失败也要有一张脸",
      goal: "errorComponent: Boom。Boom 显示 error.message。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "拒绝之后。画面会？",
        choices: [
          { id: "err", label: "出现「失败：分包丢失」", correct: true, why: "errorComponent 接到 error prop。" },
          { id: "blank", label: "仍空白。errorComponent 要 Suspense", correct: false, why: "defineAsyncComponent 自己就能挂。" },
          { id: "load", label: "停在加载中", correct: false, why: "这一镜没写 loadingComponent。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appFailFace, "src/Boom.vue": boom },
        blocks: [{ id: "boom", label: "⑥ errorComponent" }],
        narration: "同一记拒绝。只多了一张红脸。",
      },
      observe: {
        state: [],
        dom: [{ id: "err", label: ".error", value: "失败：分包丢失" }],
        events: [],
      },
      nodes: [
        { id: "rej", kind: "async", label: "reject" },
        { id: "boom", kind: "component", label: "Boom" },
        { id: "dom", kind: "dom", label: "红字" },
      ],
      edges: [
        { from: "rej", to: "boom" },
        { from: "boom", to: "dom" },
      ],
      explanation: {
        headline: "error 是 prop，不是魔法红字",
        body: "下一镜拆三种：空白等待、加载中、失败红脸。第三课才把重试和超时加上。",
      },
      faqs: [
        { q: "retry 呢？", a: "errorComponent 还能收到 retry 函数。下一课专门按这颗按钮。" },
      ],
      tryThis: "等一下。必须出现「失败：分包丢失」。不要 Ada。",
      mapping: [{ code: "errorComponent", runtime: "reject → Boom", ui: "红字" }],
    },
    {
      id: "asynccomp-s6",
      tick: "S6",
      title: "拆成空白 / 加载中 / 失败",
      goal: "三种对照：无 loading、有 loading、失败红脸。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到有加载中的世界。打开后前半秒会？",
        choices: [
          { id: "load", label: "加载中", correct: true, why: "先确认好的脸。" },
          { id: "blank", label: "空白", correct: false, why: "那是没有 loading。" },
          { id: "err", label: "失败", correct: false, why: "那是 reject。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appLoading, "src/Panel.vue": panel },
        blocks: [{ id: "keep", label: "加载中先留着" }],
        narration: "先看见加载中变成 Ada。再分别：空白等待、跳过加载中、失败红脸。",
      },
      observe: {
        state: [],
        dom: [{ id: "load", label: ".loading", value: "加载中" }],
        events: [],
      },
      nodes: [
        { id: "load", kind: "async", label: "loading" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "load", to: "dom" }],
      ablations: [
        {
          id: "blank",
          prompt: "如果没有 loadingComponent？",
          files: { "src/App.vue": appBlank, "src/Panel.vue": panel },
          expected: { kind: "stale", message: "等待期空白。Ada 仍会到。" },
          lesson: "等待不是没发生，是没脸。",
        },
        {
          id: "skip",
          prompt: "如果 delay 比分包长？",
          files: { "src/App.vue": appDelaySkip, "src/Panel.vue": panel },
          expected: { kind: "stale", message: "看不到加载中。直接 Ada。" },
          lesson: "delay 是出门门槛。",
        },
        {
          id: "boom",
          prompt: "如果拒绝并给了 errorComponent？",
          files: { "src/App.vue": appFailFace, "src/Boom.vue": boom },
          expected: { kind: "stale", message: "红字：分包丢失。没有 Ada。" },
          lesson: "失败要自己准备脸。",
        },
      ],
      explanation: {
        headline: "空白、加载中、失败",
        body: "三张脸，三种原因。下一课把等待收到 Suspense 的 fallback 槽里：async setup 也能等。",
      },
      tryThis: "三种消融：空白等 Ada、直接 Ada、红字。对上号再恢复加载中。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先空白，再跳过加载中，再失败。都是「还没到」的不同说法。" },
      ],
    },
    {
      id: "asynccomp-s7",
      tick: "S7",
      title: "换：价钱",
      goal: "AsyncPrice 等 700ms。没有 loading。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "打开后的前半秒。价钱会？",
        choices: [
          { id: "blank", label: "没有。和 Ada 那一课同一张空白", correct: true, why: "换了组件，等待边还在。" },
          { id: "now", label: "立刻 36 元。价钱很轻", correct: false, why: "Promise 一样会等。" },
          { id: "err", label: "报错", correct: false, why: "能跑。只是晚到。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore, "src/Price.vue": price },
        blocks: [{ id: "price", label: "换场景：价钱" }],
        narration: "人名换成价钱。问的仍是：等待期有没有脸。",
      },
      observe: {
        state: [],
        dom: [{ id: "app", label: "#app", value: "先空白" }],
        events: [],
      },
      nodes: [
        { id: "p", kind: "async", label: "Promise" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "p", to: "dom" }],
      ablations: [
        {
          id: "fix",
          prompt: "加上 loadingComponent 之后？",
          files: { "src/App.vue": transferFixed, "src/Price.vue": price },
          expected: {
            kind: "stale",
            message: "这是修复：先加载中，再 36 元。",
          },
          lesson: "下一课：async setup 的 await，要 Suspense 的 fallback 来接。",
        },
      ],
      explanation: {
        headline: "分包晚到，不是组件坏了",
        body: "空白是默认。加载中是你准备的替身。下一课 await 写在子组件自己的 setup 里。",
      },
      faqs: [
        { q: "和 fetch loading 有什么不同？", a: "fetch 是数据还在路上。这一课是组件自身还在路上。脸很像，边界不同。" },
      ],
      tryThis: "先看空白再 36 元。再打开修复：必须先「加载中」。",
      mapping: [
        { code: "没有 loading", runtime: "等待期无节点", ui: "空白" },
        { code: "loadingComponent", runtime: "替身", ui: "加载中" },
      ],
    },
  ],
};
