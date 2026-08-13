import type { CausalLab, CounterfactualWorld } from "../types";

const panel = `<script setup>
const name = 'Ada'
</script>
<template>
  <p class="card">{{ name }}</p>
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

const boomRetry = `<script setup>
defineProps({
  error: Object,
  retry: Function,
})
</script>
<template>
  <div>
    <p class="error">失败{{ error && error.message ? '：' + error.message : '' }}</p>
    <button type="button" @click="retry">再试一次</button>
  </div>
</template>
`;

const loadingHint = `const Loading = { template: '<p class="loading">加载中</p>' }
`;

const appOk = `<script setup>
import { defineAsyncComponent } from 'vue'
import Panel from './Panel.vue'
${loadingHint}const AsyncPanel = defineAsyncComponent({
  loader: () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(Panel), 700)
    }),
  loadingComponent: Loading,
  delay: 0,
})
</script>
<template>
  <p class="hint">一次就到</p>
  <AsyncPanel />
</template>
`;

const appAlwaysBoom = `<script setup>
import { defineAsyncComponent } from 'vue'
import Boom from './Boom.vue'
${loadingHint}const AsyncPanel = defineAsyncComponent({
  loader: () =>
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('分包失败')), 500)
    }),
  loadingComponent: Loading,
  errorComponent: Boom,
  delay: 0,
})
</script>
<template>
  <p class="hint">第一次永远 Boom · 没有按钮</p>
  <AsyncPanel />
</template>
`;

const appRetryStuck = `<script setup>
import { defineAsyncComponent } from 'vue'
import Boom from './Boom.vue'
${loadingHint}const AsyncPanel = defineAsyncComponent({
  loader: () =>
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('分包失败')), 500)
    }),
  loadingComponent: Loading,
  errorComponent: Boom,
  delay: 0,
})
</script>
<template>
  <p class="hint">按钮接到 retry · loader 仍拒绝</p>
  <AsyncPanel />
</template>
`;

const appRetryWorks = `<script setup>
import { defineAsyncComponent } from 'vue'
import Panel from './Panel.vue'
import Boom from './Boom.vue'
${loadingHint}let attempts = 0
const AsyncPanel = defineAsyncComponent({
  loader: () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        attempts += 1
        if (attempts === 1) reject(new Error('分包失败'))
        else resolve(Panel)
      }, 500)
    }),
  loadingComponent: Loading,
  errorComponent: Boom,
  delay: 0,
})
</script>
<template>
  <p class="hint">第一次失败 · 再试一次才给 Ada</p>
  <AsyncPanel />
</template>
`;

const appTimeout = `<script setup>
import { defineAsyncComponent } from 'vue'
import Boom from './Boom.vue'
${loadingHint}const AsyncPanel = defineAsyncComponent({
  loader: () => new Promise(() => {}),
  loadingComponent: Loading,
  errorComponent: Boom,
  delay: 0,
  timeout: 800,
})
</script>
<template>
  <p class="hint">永不回来 · timeout 800</p>
  <AsyncPanel />
</template>
`;

const appForever = `<script setup>
import { defineAsyncComponent } from 'vue'
import Boom from './Boom.vue'
${loadingHint}const AsyncPanel = defineAsyncComponent({
  loader: () => new Promise(() => {}),
  loadingComponent: Loading,
  errorComponent: Boom,
  delay: 0,
})
</script>
<template>
  <p class="hint">永不回来 · 没有 timeout</p>
  <AsyncPanel />
</template>
`;

const appFailBlank = `<script setup>
import { defineAsyncComponent } from 'vue'
${loadingHint}const AsyncPanel = defineAsyncComponent({
  loader: () =>
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('分包失败')), 500)
    }),
  loadingComponent: Loading,
  delay: 0,
})
</script>
<template>
  <p class="hint">拒绝了 · 没有 errorComponent</p>
  <AsyncPanel />
</template>
`;

const price = `<script setup>
</script>
<template>
  <p class="card">36 元</p>
</template>
`;

const transferBefore = `<script setup>
import { defineAsyncComponent } from 'vue'
import Price from './Price.vue'
import Boom from './Boom.vue'
${loadingHint}let attempts = 0
const AsyncPrice = defineAsyncComponent({
  loader: () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        attempts += 1
        if (attempts === 1) reject(new Error('价钱丢失'))
        else resolve(Price)
      }, 500)
    }),
  loadingComponent: Loading,
  errorComponent: Boom,
  delay: 0,
})
</script>
<template>
  <p class="hint">价钱第一次会失败</p>
  <AsyncPrice />
</template>
`;

const boomNoBtn = boom;

const worldStuck: CounterfactualWorld = {
  id: "stuck",
  name: "retry 仍失败",
  tagline: "按钮在，Ada 不来",
  files: { "src/App.vue": appRetryStuck, "src/Boom.vue": boomRetry },
  nodes: [
    { id: "btn", kind: "event", label: "再试一次" },
    { id: "boom", kind: "dom", label: "仍失败" },
  ],
  edges: [{ from: "btn", to: "boom" }],
  note: "retry 只是再跑 loader。loader 永远拒绝，按钮没有第二条边。",
};

const worldWorks: CounterfactualWorld = {
  id: "works",
  name: "第二次才给",
  tagline: "点了之后是 Ada",
  files: {
    "src/App.vue": appRetryWorks,
    "src/Panel.vue": panel,
    "src/Boom.vue": boomRetry,
  },
  nodes: [
    { id: "btn", kind: "event", label: "再试一次" },
    { id: "ada", kind: "dom", label: "Ada" },
  ],
  edges: [{ from: "btn", to: "ada", label: "第二次" }],
  note: "次数写在模块里。同一条边再走一遍，结果可以换。",
};

export const ASYNCERR_LAB: CausalLab = {
  id: "asyncerr",
  world: 13,
  concept: "retry",
  title: "失败也能再试一次",
  subtitle: "errorComponent 接到 error 和 retry。timeout 把永远等着切成失败。",
  promise:
    "一镜一条边：先一次就到，再永远 Boom 没有按钮，再按钮接到 retry 但仍失败，再第二次才给组件，再 timeout 切成失败，再没有 timeout 永远加载中。",
  minutes: 16,
  official: "/guide/components/async.html#error-handling",
  scenes: [
    {
      id: "asyncerr-s0",
      tick: "S0",
      title: "一次就到",
      goal: "defineAsyncComponent 成功。delay 0，700ms 加载中之后 Ada。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appOk, "src/Panel.vue": panel },
        blocks: [{ id: "ok", label: "① 成功路径" }],
        narration: "上一课把等待交给 Suspense。这一课回到分包，看失败怎么退。先钉住成功的脸。",
      },
      observe: {
        state: [],
        dom: [{ id: "load", label: ".loading", value: "加载中 → Ada" }],
        events: [],
      },
      nodes: [
        { id: "load", kind: "async", label: "loading" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [{ from: "load", to: "dom" }],
      explanation: {
        headline: "成功路径先钉住",
        body: "下一镜 loader 一直拒绝。errorComponent 画失败，但没有按钮。",
      },
      tryThis: "打开必须先「加载中」，再 Ada。",
      faqs: [
        { q: "为什么不接着用 Suspense？", a: "retry 和 timeout 是 defineAsyncComponent 自己的边。Suspense 下一层才接 error。" },
      ],
    },
    {
      id: "asyncerr-s1",
      tick: "S1",
      title: "失败停在红脸上",
      goal: "loader 一直 reject。errorComponent 只有红字，没有按钮。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "拒绝之后。画面会？",
        choices: [
          { id: "err", label: "出现「失败：分包失败」。没有按钮", correct: true, why: "errorComponent 接到 error。这一镜没把 retry 画出来。" },
          { id: "retry", label: "自动再试，最后仍是 Ada", correct: false, why: "不会自动再试。" },
          { id: "blank", label: "空白。失败要 Suspense", correct: false, why: "errorComponent 自己就能挂。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appAlwaysBoom, "src/Boom.vue": boom },
        blocks: [{ id: "boom", label: "② 只有红脸" }],
        narration: "失败有脸。没有退路。",
      },
      observe: {
        state: [],
        dom: [{ id: "err", label: ".error", value: "失败：分包失败" }],
        events: [],
      },
      nodes: [
        { id: "rej", kind: "async", label: "reject" },
        { id: "dom", kind: "dom", label: "红字" },
      ],
      edges: [{ from: "rej", to: "dom" }],
      explanation: {
        headline: "失败有脸，但没有退路",
        body: "Vue 其实会把 retry 传给 errorComponent。下一镜把按钮画上。",
      },
      faqs: [
        { q: "retry 从哪来？", a: "defineAsyncComponent 塞进 errorComponent 的 prop。不是你自己 emit。" },
      ],
      tryThis: "等一下。必须出现红字。不要 Ada，也不要按钮。",
      mapping: [{ code: "errorComponent 不画 retry", runtime: "停在失败", ui: "红字" }],
    },
    {
      id: "asyncerr-s2",
      tick: "S2",
      title: "按钮接到 retry",
      goal: "Boom 声明 retry，按钮写「再试一次」。loader 仍一直拒绝。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「再试一次」。画面会？",
        choices: [
          { id: "again", label: "又转一下加载中，然后还是失败", correct: true, why: "retry() 再跑 loader。loader 永远 reject，脸回到红字。" },
          { id: "ada", label: "变成 Ada。有按钮就会成功", correct: false, why: "按钮只接线。成功是下一镜的边。" },
          { id: "noop", label: "没反应。retry 要自己写", correct: false, why: "Vue 已经把 retry 传进来了。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appRetryStuck, "src/Boom.vue": boomRetry },
        blocks: [{ id: "btn", label: "③ 接上按钮" }],
        narration: "同一记拒绝。只多了一颗会再跑 loader 的按钮。",
      },
      observe: {
        state: [],
        dom: [{ id: "err", label: ".error", value: "失败 + 再试一次" }],
        events: [{ id: "retry", label: "retry", value: "再跑 loader", symbol: "retry" }],
      },
      nodes: [
        { id: "btn", kind: "event", label: "再试一次" },
        { id: "rej", kind: "async", label: "仍 reject" },
      ],
      edges: [{ from: "btn", to: "rej" }],
      explanation: {
        headline: "retry 是再走同一条边",
        body: "按钮不是魔法成功。下一镜让第二次 resolve。",
      },
      faqs: [
        { q: "点了为什么会闪一下加载中？", a: "retry 从失败回到等待，再进入失败。loadingComponent 还在。" },
      ],
      tryThis: "先看见红字和按钮。点「再试一次」。必须再失败，不要 Ada。",
      mapping: [{ code: "retry()", runtime: "再跑 loader", ui: "仍失败" }],
    },
    {
      id: "asyncerr-s3",
      tick: "S3",
      title: "第二次才给组件",
      goal: "模块里记次数。第一次 reject，点按钮之后 resolve Panel。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "先看见失败。点「再试一次」之后会？",
        choices: [
          { id: "ada", label: "加载中之后变成 Ada", correct: true, why: "第二次 loader resolve 了 Panel。" },
          { id: "still", label: "仍失败。次数写在组件里会重置", correct: false, why: "attempts 在模块里，跟这次定义活在一起。" },
          { id: "two", label: "两张 Ada。retry 会叠一个新的", correct: false, why: "还是同一个异步组件，只是再跑 loader。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appRetryWorks,
          "src/Panel.vue": panel,
          "src/Boom.vue": boomRetry,
        },
        blocks: [{ id: "two", label: "④ 第二次给 Ada" }],
        narration: "同一颗按钮。loader 第二次换了一条结果。",
      },
      counterfactual: {
        id: "stuck-vs-works",
        title: "仍失败 vs 第二次给",
        setup: "都有按钮。差在第二次 loader 会不会 resolve。",
        worlds: [worldStuck, worldWorks],
        punchline: "retry 不保证成功。它只保证再走一遍。",
      },
      observe: {
        state: [{ id: "n", label: "attempts", value: "1 → 2" }],
        dom: [{ id: "card", label: ".card", value: "Ada" }],
        events: [{ id: "retry", label: "retry", value: "第二次 resolve" }],
      },
      nodes: [
        { id: "btn", kind: "event", label: "再试一次" },
        { id: "ada", kind: "component", label: "Panel" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [
        { from: "btn", to: "ada", label: "第二次" },
        { from: "ada", to: "dom" },
      ],
      explanation: {
        headline: "次数写在边上，不写在按钮里",
        body: "下一镜换一种失败：loader 永远不回来。timeout 把它切成红脸。",
      },
      faqs: [
        { q: "刷新页面呢？", a: "attempts 从 0 再来。第一次仍失败。这是这一镜的设定，不是缓存。" },
      ],
      tryThis: "等红字出现。点「再试一次」。必须变成 Ada。打开反事实。",
      mapping: [{ code: "attempts === 1 ? reject : resolve", runtime: "第二次换边", ui: "Ada" }],
    },
    {
      id: "asyncerr-s4",
      tick: "S4",
      title: "timeout 把永远等着切成失败",
      goal: "loader 永不 resolve。timeout: 800。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开之后。画面会？",
        choices: [
          { id: "err", label: "先加载中，超时后变成失败", correct: true, why: "timeout 把「一直没有回来」画成失败。" },
          { id: "load", label: "永远加载中。没 reject 就不算失败", correct: false, why: "timeout 自己会走 errorComponent。" },
          { id: "ada", label: "最后仍是 Ada。timeout 只是警告", correct: false, why: "loader 从未 resolve。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appTimeout, "src/Boom.vue": boom },
        blocks: [{ id: "to", label: "⑤ timeout 800" }],
        narration: "没有拒绝。只是再也不回来。时钟替你拒绝。",
      },
      observe: {
        state: [],
        dom: [{ id: "err", label: ".error", value: "加载中 → 失败" }],
        events: [],
      },
      nodes: [
        { id: "wait", kind: "async", label: "永不回来" },
        { id: "to", kind: "async", label: "timeout", symbol: "timeout" },
        { id: "dom", kind: "dom", label: "红字" },
      ],
      edges: [{ from: "to", to: "dom" }],
      explanation: {
        headline: "不回来，也是一种失败",
        body: "下一镜拿掉 timeout：errorComponent 在那儿也没用，因为失败这条边从未被触发。",
      },
      faqs: [
        { q: "timeout 默认是多少？", a: "Infinity。不写就一直等。这一镜写成 800，好让你看见切过去。" },
      ],
      tryThis: "打开必须先「加载中」。大约一秒后必须变成红字。不要 Ada。",
      mapping: [{ code: "timeout: 800", runtime: "时钟拒绝", ui: "失败" }],
    },
    {
      id: "asyncerr-s5",
      tick: "S5",
      title: "没有 timeout，永远加载中",
      goal: "同样永不 resolve 的 loader。不写 timeout。Boom 仍挂着。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "等两秒。画面会？",
        choices: [
          { id: "load", label: "仍是加载中。Boom 从未出场", correct: true, why: "失败这条边没被触发。errorComponent 只是站在旁边。" },
          { id: "err", label: "还是会失败。等久了就算超时", correct: false, why: "没有 timeout，Vue 不会替你切。" },
          { id: "blank", label: "空白。加载中也有时限", correct: false, why: "delay 0，替身一直在。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appForever, "src/Boom.vue": boom },
        blocks: [{ id: "inf", label: "⑥ 没有 timeout" }],
        narration: "红脸的组件在文件里。边没走到它。",
      },
      observe: {
        state: [],
        dom: [{ id: "load", label: ".loading", value: "加载中（停住）" }],
        events: [],
      },
      nodes: [
        { id: "wait", kind: "async", label: "永不回来" },
        { id: "load", kind: "async", label: "loading" },
        { id: "boom", kind: "component", label: "Boom" },
      ],
      edges: [{ from: "wait", to: "load", label: "从未切走" }],
      explanation: {
        headline: "没走到的脸，等于没有",
        body: "下一镜拆三种：失败没脸、按钮仍失败、永远加载中。",
      },
      faqs: [
        { q: "和 delay 有什么不同？", a: "delay 管加载中何时出门。timeout 管等待何时变成失败。两条边。" },
      ],
      tryThis: "打开后应一直「加载中」。数到两秒也不要出现红字或 Ada。",
      mapping: [{ code: "无 timeout 的悬挂 Promise", runtime: "失败边未触发", ui: "加载中" }],
    },
    {
      id: "asyncerr-s6",
      tick: "S6",
      title: "拆成没脸 / 仍失败 / 永远等",
      goal: "对照：拒绝却没有 errorComponent、有按钮仍失败、没有 timeout。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到第二次才给 Ada 的世界。第一次打开会？",
        choices: [
          { id: "err", label: "先失败，点了才 Ada", correct: true, why: "先确认好的脸。" },
          { id: "ada", label: "直接 Ada", correct: false, why: "第一次仍 reject。" },
          { id: "load", label: "永远加载中", correct: false, why: "那是没有 timeout。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appRetryWorks,
          "src/Panel.vue": panel,
          "src/Boom.vue": boomRetry,
        },
        blocks: [{ id: "keep", label: "能重试的先留着" }],
        narration: "先失败再点成 Ada。再分别：失败没脸、按钮仍失败、永远加载中。",
      },
      observe: {
        state: [],
        dom: [{ id: "err", label: ".error", value: "失败 + 按钮" }],
        events: [],
      },
      nodes: [
        { id: "btn", kind: "event", label: "retry" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [{ from: "btn", to: "dom" }],
      ablations: [
        {
          id: "blank",
          prompt: "如果拒绝了却没有 errorComponent？",
          files: { "src/App.vue": appFailBlank },
          expected: { kind: "stale", message: "加载中之后空白。失败没有脸。" },
          lesson: "reject 发生了，图上却没有失败的节点。",
        },
        {
          id: "stuck",
          prompt: "如果按钮在，但 loader 永远拒绝？",
          files: { "src/App.vue": appRetryStuck, "src/Boom.vue": boomRetry },
          expected: { kind: "stale", message: "再试一次仍是失败。按钮只接线。" },
          lesson: "retry 不保证成功。",
        },
        {
          id: "forever",
          prompt: "如果永不回来也不写 timeout？",
          files: { "src/App.vue": appForever, "src/Boom.vue": boom },
          expected: { kind: "stale", message: "永远加载中。Boom 从未出场。" },
          lesson: "没走到的脸，等于没有。",
        },
      ],
      explanation: {
        headline: "没脸、仍失败、永远等",
        body: "三张停住的脸，三种原因。World 13 收束：组件还在路上。等待、失败、重试，都要有脸。",
      },
      tryThis: "三种消融：空白、点了仍红、永远转。对上号再恢复：失败后点成 Ada。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先没脸，再按钮仍失败，再永远加载中。" },
      ],
    },
    {
      id: "asyncerr-s7",
      tick: "S7",
      title: "换：价钱",
      goal: "AsyncPrice 第一次拒绝。Boom 有「再试一次」。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "打开之后。价钱会？",
        choices: [
          { id: "err", label: "先失败。点「再试一次」才 36 元", correct: true, why: "换了组件，retry 边还在。" },
          { id: "now", label: "立刻 36 元。价钱很轻", correct: false, why: "第一次仍 reject。" },
          { id: "blank", label: "空白。价钱没有 errorComponent", correct: false, why: "这一镜挂了 Boom 和按钮。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": transferBefore,
          "src/Price.vue": price,
          "src/Boom.vue": boomRetry,
        },
        blocks: [{ id: "price", label: "换场景：价钱" }],
        narration: "人名换成价钱。问的仍是：失败之后能不能再走一遍。",
      },
      observe: {
        state: [],
        dom: [{ id: "err", label: ".error", value: "失败：价钱丢失" }],
        events: [{ id: "retry", label: "retry", value: "再试一次 → 36 元" }],
      },
      nodes: [
        { id: "rej", kind: "async", label: "第一次 reject" },
        { id: "btn", kind: "event", label: "再试一次" },
        { id: "dom", kind: "dom", label: "36 元" },
      ],
      edges: [{ from: "btn", to: "dom", label: "第二次" }],
      ablations: [
        {
          id: "nobtn",
          prompt: "如果 Boom 不画按钮？",
          files: {
            "src/App.vue": transferBefore,
            "src/Price.vue": price,
            "src/Boom.vue": boomNoBtn,
          },
          expected: {
            kind: "stale",
            message: "停在「失败：价钱丢失」。retry 在 prop 里，画面上没接线。",
          },
          lesson: "World 13 收束：等待、失败、重试，都要有脸。",
        },
      ],
      explanation: {
        headline: "失败不是终点",
        body: "retry 把同一条边再走一遍。timeout 把永远等着切成失败。World 13 停在还没到的组件：分包、setup、拒绝，三张不同的脸。",
      },
      faqs: [
        { q: "和 World 4 请求失败重试有什么不同？", a: "那一课 retry 是你自己写的函数去 fetch。这一课 retry 是 Vue 塞进 errorComponent 的 prop，再跑的是 loader。" },
      ],
      tryThis: "先看见失败。点「再试一次」必须出现 36 元。再打开消融：没有按钮，停在红字。",
      mapping: [
        { code: "retry()", runtime: "再跑 loader", ui: "36 元" },
        { code: "不画按钮", runtime: "retry 在 prop 里", ui: "停在失败" },
      ],
    },
  ],
};
