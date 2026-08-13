import type { CausalLab, CounterfactualWorld } from "../types";

const panel = `<script setup>
const name = 'Ada'
</script>
<template>
  <p class="card">{{ name }}</p>
</template>
`;

const panelAwait = `<script setup>
await new Promise((r) => setTimeout(r, 700))
const name = 'Ada'
</script>
<template>
  <p class="card">{{ name }}</p>
</template>
`;

const adaFast = `<script setup>
await new Promise((r) => setTimeout(r, 400))
</script>
<template>
  <p class="card">Ada</p>
</template>
`;

const priceSlow = `<script setup>
await new Promise((r) => setTimeout(r, 900))
</script>
<template>
  <p class="card">36 元</p>
</template>
`;

const appSync = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">没有 await</p>
  <Panel />
</template>
`;

const appBare = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">setup 里 await · 外面没有 Suspense</p>
  <Panel />
</template>
`;

const appFallback = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">Suspense 接住了 fallback</p>
  <Suspense>
    <Panel />
    <template #fallback>
      <p class="loading">加载中</p>
    </template>
  </Suspense>
</template>
`;

const appNoFallback = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">有 Suspense · 没有 fallback</p>
  <Suspense>
    <Panel />
  </Suspense>
</template>
`;

const appOneShell = `<script setup>
import Ada from './Ada.vue'
import Price from './Price.vue'
</script>
<template>
  <p class="hint">一个 Suspense 等两个孩子</p>
  <Suspense>
    <div>
      <Ada />
      <Price />
    </div>
    <template #fallback>
      <p class="loading">加载中</p>
    </template>
  </Suspense>
</template>
`;

const appTwoShells = `<script setup>
import Ada from './Ada.vue'
import Price from './Price.vue'
</script>
<template>
  <p class="hint">两个 Suspense 各等各的</p>
  <Suspense>
    <Ada />
    <template #fallback>
      <p class="loading">Ada 加载中</p>
    </template>
  </Suspense>
  <Suspense>
    <Price />
    <template #fallback>
      <p class="loading">价钱加载中</p>
    </template>
  </Suspense>
</template>
`;

const appTwoBare = `<script setup>
import Ada from './Ada.vue'
import Price from './Price.vue'
</script>
<template>
  <p class="hint">两个 await 的孩子 · 没有壳</p>
  <Ada />
  <Price />
</template>
`;

const transferBefore = `<script setup>
import Course from './Course.vue'
import When from './When.vue'
</script>
<template>
  <p class="hint">课表也在等</p>
  <Course />
  <When />
</template>
`;

const course = `<script setup>
await new Promise((r) => setTimeout(r, 400))
</script>
<template>
  <p class="card">今天的课</p>
</template>
`;

const when = `<script setup>
await new Promise((r) => setTimeout(r, 900))
</script>
<template>
  <p class="card">14:00</p>
</template>
`;

const transferFixed = `<script setup>
import Course from './Course.vue'
import When from './When.vue'
</script>
<template>
  <p class="hint">一个壳接住课表</p>
  <Suspense>
    <div>
      <Course />
      <When />
    </div>
    <template #fallback>
      <p class="loading">加载中</p>
    </template>
  </Suspense>
</template>
`;

const worldBare: CounterfactualWorld = {
  id: "bare",
  name: "没有 Suspense",
  tagline: "空白 + 警告",
  files: { "src/App.vue": appBare, "src/Panel.vue": panelAwait },
  nodes: [
    { id: "wait", kind: "async", label: "await" },
    { id: "dom", kind: "dom", label: "空白" },
  ],
  edges: [{ from: "wait", to: "dom" }],
  note: "异步依赖没有壳。Vue 不知道把「还在等」画成哪张脸。",
};

const worldFace: CounterfactualWorld = {
  id: "face",
  name: "有 fallback",
  tagline: "加载中 → Ada",
  files: { "src/App.vue": appFallback, "src/Panel.vue": panelAwait },
  nodes: [
    { id: "fb", kind: "async", label: "fallback" },
    { id: "dom", kind: "dom", label: "Ada" },
  ],
  edges: [{ from: "fb", to: "dom", label: "到了" }],
  note: "Suspense 把等待接成一张脸。",
};

export const SUSPENSE_LAB: CausalLab = {
  id: "suspense",
  world: 13,
  concept: "Suspense",
  title: "等孩子自己醒",
  subtitle: "setup 里的 await 让组件变成异步依赖。Suspense 的 fallback 是等待的脸。一个壳等所有孩子。",
  promise:
    "一镜一条边：先没有 await 立刻 Ada，再 await 没有壳会空白，再 fallback 出示加载中，再没有 fallback 仍空白，再一个壳等两个孩子，再两个壳各等各的。",
  minutes: 16,
  official: "/guide/built-ins/suspense.html",
  scenes: [
    {
      id: "suspense-s0",
      tick: "S0",
      title: "没有 await，立刻 Ada",
      goal: "Panel 的 setup 里没有 await。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appSync, "src/Panel.vue": panel },
        blocks: [{ id: "sync", label: "① 同步孩子" }],
        narration: "上一课等的是分包。这一课等的是组件自己的 setup。先看没有 await 的脸。",
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
        headline: "同步的孩子没有等待这张脸",
        body: "下一镜让 Panel 在 setup 里睡 700ms。外面先不套 Suspense。",
      },
      tryThis: "打开就必须看见 Ada。没有「加载中」。",
      faqs: [
        { q: "和上一课的同步 import 有什么不同？", a: "上一课组件文件还在路上。这一课文件已经在，只是 setup 自己要 await。" },
      ],
    },
    {
      id: "suspense-s1",
      tick: "S1",
      title: "await 了，外面没有壳",
      goal: "Panel setup 顶层 await。App 里没有 <Suspense>。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开后的前半秒。画面会？",
        choices: [
          { id: "blank", label: "空白。没有壳接住等待", correct: true, why: "async setup 让组件变成异步依赖。父级没有 Suspense，等待期不画。" },
          { id: "ada", label: "立刻 Ada。await 只推迟数据", correct: false, why: "顶层 await 推迟的是组件自己。同步那一镜才立刻有。" },
          { id: "load", label: "自动出现加载中", correct: false, why: "不会自动。下一镜才给 fallback。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appBare, "src/Panel.vue": panelAwait },
        blocks: [{ id: "bare", label: "② 没有壳" }],
        narration: "子自己睡着了。父不知道该出示哪张脸。",
      },
      counterfactual: {
        id: "bare-vs-face",
        title: "没有壳 vs fallback",
        setup: "都 await 700ms。差在外面有没有 Suspense 和 fallback。",
        worlds: [worldBare, worldFace],
        punchline: "等待不是没发生。它只是还没有一张脸。",
      },
      observe: {
        state: [],
        dom: [{ id: "app", label: "#app", value: "先空白，再 Ada" }],
        events: [],
      },
      nodes: [
        { id: "wait", kind: "async", label: "await", symbol: "await" },
        { id: "dom", kind: "dom", label: "空白" },
      ],
      edges: [{ from: "wait", to: "dom", label: "没有壳" }],
      explanation: {
        headline: "异步依赖必须被接住",
        body: "控制台还会警告缺 Suspense。下一镜把壳和 fallback 一起加上。",
      },
      faqs: [
        { q: "这和 World 4 的 fetch loading 是同一条边吗？", a: "不是。fetch 是数据还在路上，组件已经挂上。这一镜是组件自己的 setup 还没跑完。" },
      ],
      tryThis: "打开后先确认没有 Ada。大约一秒后必须出现 Ada。打开反事实。",
      mapping: [{ code: "await 且无 <Suspense>", runtime: "异步依赖悬空", ui: "空白" }],
    },
    {
      id: "suspense-s2",
      tick: "S2",
      title: "fallback 是等待的脸",
      goal: "<Suspense> + #fallback「加载中」。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开后的前半秒。画面会？",
        choices: [
          { id: "load", label: "加载中。fallback 立刻出示", correct: true, why: "Suspense 把还在 await 的孩子换成 fallback。" },
          { id: "blank", label: "仍空白。fallback 要 defineAsyncComponent", correct: false, why: "async setup 走的是 Suspense，不是 loadingComponent。" },
          { id: "ada", label: "立刻 Ada", correct: false, why: "700ms 还没醒。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appFallback, "src/Panel.vue": panelAwait },
        blocks: [{ id: "fb", label: "③ fallback" }],
        narration: "子还是睡 700ms。只多了一张等待的脸。",
      },
      observe: {
        state: [],
        dom: [{ id: "load", label: ".loading", value: "加载中 → Ada" }],
        events: [],
      },
      nodes: [
        { id: "fb", kind: "async", label: "fallback", symbol: "Suspense" },
        { id: "panel", kind: "component", label: "Panel" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [
        { from: "fb", to: "panel", label: "醒了" },
        { from: "panel", to: "dom" },
      ],
      explanation: {
        headline: "fallback 是等待的替身",
        body: "下一镜壳还在，但不写 #fallback：接住了等待，却不给它脸。",
      },
      faqs: [
        { q: "和 loadingComponent 哪张图？", a: "同一张等待的脸，两条边。loadingComponent 挂在 defineAsyncComponent 上。fallback 挂在 Suspense 上。" },
      ],
      tryThis: "打开必须先看见「加载中」，再变成 Ada。不要空白。",
      mapping: [{ code: "<Suspense> + #fallback", runtime: "等待被接住", ui: "加载中" }],
    },
    {
      id: "suspense-s3",
      tick: "S3",
      title: "有壳，没有 fallback",
      goal: "<Suspense> 包着 Panel。不写 #fallback。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开后的前半秒。画面会？",
        choices: [
          { id: "blank", label: "空白。壳接住了，但没给等待一张脸", correct: true, why: "没有 fallback，Suspense 在等待期什么都不画。" },
          { id: "load", label: "仍会加载中。有壳就够了", correct: false, why: "壳只挂钩。脸要自己写。" },
          { id: "warn", label: "空白且控制台警告缺 Suspense", correct: false, why: "壳已经在。警告那一镜是 S1。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appNoFallback, "src/Panel.vue": panelAwait },
        blocks: [{ id: "empty", label: "④ 空壳" }],
        narration: "等待被接住了。你仍没准备替身。",
      },
      observe: {
        state: [],
        dom: [{ id: "app", label: "#app", value: "先空白，再 Ada" }],
        events: [],
      },
      nodes: [
        { id: "shell", kind: "component", label: "Suspense" },
        { id: "dom", kind: "dom", label: "空白" },
      ],
      edges: [{ from: "shell", to: "dom", label: "没有 fallback" }],
      explanation: {
        headline: "壳不是脸",
        body: "S1 空白是因为没壳。这一镜空白是因为没 fallback。看起来像，原因不同。下一镜一个壳里塞两个睡着的孩子。",
      },
      faqs: [
        { q: "那还要壳干什么？", a: "没有壳会警告，有壳才知道该把等待交给谁。脸是另一条边。" },
      ],
      tryThis: "打开后先空白，再 Ada。不要出现「加载中」。",
      mapping: [{ code: "<Suspense> 无 fallback", runtime: "等待被接住", ui: "仍空白" }],
    },
    {
      id: "suspense-s4",
      tick: "S4",
      title: "一个壳等两个孩子",
      goal: "Ada 睡 400ms，Price 睡 900ms，塞进同一个 Suspense。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "Ada 先醒。画面会？",
        choices: [
          { id: "wait", label: "仍加载中。一个壳要等两人都醒", correct: true, why: "Suspense 等它下面所有异步依赖。快的陪慢的。" },
          { id: "ada", label: "先出现 Ada，价钱还在加载中", correct: false, why: "那是下一镜：切开成两个壳。" },
          { id: "both", label: "400ms 时两张卡一起到", correct: false, why: "Price 要 900ms。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appOneShell,
          "src/Ada.vue": adaFast,
          "src/Price.vue": priceSlow,
        },
        blocks: [{ id: "both", label: "⑤ 一个壳两个人" }],
        narration: "快的那个也得坐在 fallback 里，直到慢的那个醒。",
      },
      observe: {
        state: [],
        dom: [{ id: "load", label: ".loading", value: "加载中直到两人都到" }],
        events: [],
      },
      nodes: [
        { id: "ada", kind: "async", label: "Ada 400ms" },
        { id: "price", kind: "async", label: "Price 900ms" },
        { id: "fb", kind: "async", label: "fallback" },
      ],
      edges: [{ from: "price", to: "fb", label: "慢的说了算" }],
      explanation: {
        headline: "一个 Suspense 等整棵子树",
        body: "下一镜把壳切开：Ada 先到先画，价钱还在加载中。",
      },
      faqs: [
        { q: "为什么外面要包一层 div？", a: "让两个孩子落在同一棵默认槽里。壳等的是这棵树，不是某一个标签。" },
      ],
      tryThis: "打开后应先「加载中」很久。不要先看见 Ada 再看见价钱。两张卡应几乎一起出现。",
      mapping: [{ code: "一个 <Suspense> 两个 await", runtime: "等最慢的", ui: "加载中到齐" }],
    },
    {
      id: "suspense-s5",
      tick: "S5",
      title: "两个壳，各等各的",
      goal: "Ada 和 Price 各套一个 Suspense。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "Ada 400ms 醒了，Price 还在睡。画面会？",
        choices: [
          { id: "split", label: "Ada 已经在，价钱仍是「价钱加载中」", correct: true, why: "切开之后，快的那条边先结算。" },
          { id: "wait", label: "仍一起加载中。外面看起来还是一棵树", correct: false, why: "两个壳互不等。" },
          { id: "adaonly", label: "只有 Ada，价钱空白", correct: false, why: "价钱有自己的 fallback。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appTwoShells,
          "src/Ada.vue": adaFast,
          "src/Price.vue": priceSlow,
        },
        blocks: [{ id: "split", label: "⑥ 切开" }],
        narration: "等待被切成两条边。快的先有脸。",
      },
      observe: {
        state: [],
        dom: [
          { id: "ada", label: "Ada", value: "先到" },
          { id: "price", label: "价钱", value: "仍加载中" },
        ],
        events: [],
      },
      nodes: [
        { id: "a", kind: "async", label: "Ada 壳" },
        { id: "ada", kind: "dom", label: "Ada" },
        { id: "b", kind: "async", label: "Price 仍加载中" },
      ],
      edges: [{ from: "a", to: "ada", label: "先到" }],
      explanation: {
        headline: "切开，就是两条等待的边",
        body: "下一镜拆三种：没壳、空壳、一个壳等两人。",
      },
      faqs: [
        { q: "嵌套 Suspense 呢？", a: "内层可以先结算。这一镜用并列，图更干净：两条边互不阻塞。" },
      ],
      tryThis: "打开后应很快看见 Ada，同时价钱还写着「价钱加载中」。再等一下价钱变成 36 元。",
      mapping: [{ code: "两个 <Suspense>", runtime: "各等各的", ui: "Ada 先到" }],
    },
    {
      id: "suspense-s6",
      tick: "S6",
      title: "拆成没壳 / 空壳 / 一个壳",
      goal: "对照：没有 Suspense、有壳无 fallback、一个壳等两人。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到有 fallback 的单人世界。打开后前半秒会？",
        choices: [
          { id: "load", label: "加载中", correct: true, why: "先确认好的脸。" },
          { id: "blank", label: "空白", correct: false, why: "那是没壳或空壳。" },
          { id: "ada", label: "立刻 Ada", correct: false, why: "还在 await。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appFallback, "src/Panel.vue": panelAwait },
        blocks: [{ id: "keep", label: "fallback 先留着" }],
        narration: "先看见加载中变成 Ada。再分别：没壳、空壳、一个壳等两人。",
      },
      observe: {
        state: [],
        dom: [{ id: "load", label: ".loading", value: "加载中" }],
        events: [],
      },
      nodes: [
        { id: "fb", kind: "async", label: "fallback" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "fb", to: "dom" }],
      ablations: [
        {
          id: "bare",
          prompt: "如果去掉 Suspense？",
          files: { "src/App.vue": appBare, "src/Panel.vue": panelAwait },
          expected: { kind: "stale", message: "等待期空白，控制台警告缺壳。Ada 仍会到。" },
          lesson: "异步依赖必须被接住。",
        },
        {
          id: "empty",
          prompt: "如果有壳但不写 fallback？",
          files: { "src/App.vue": appNoFallback, "src/Panel.vue": panelAwait },
          expected: { kind: "stale", message: "等待期空白。没有警告，也没有加载中。" },
          lesson: "壳不是脸。",
        },
        {
          id: "both",
          prompt: "如果一个壳里塞两个孩子？",
          files: {
            "src/App.vue": appOneShell,
            "src/Ada.vue": adaFast,
            "src/Price.vue": priceSlow,
          },
          expected: { kind: "stale", message: "加载中要等到两人都醒。Ada 不能先露面。" },
          lesson: "一个壳等整棵子树。",
        },
      ],
      explanation: {
        headline: "没壳、空壳、一个壳",
        body: "三张空白或一张很久的加载中，三种原因。下一课：加载失败怎么把 retry 接到按钮上。",
      },
      tryThis: "三种消融：警告着空白、安静地空白、两人一起出。对上号再恢复加载中。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先没壳，再空壳，再一个壳等两人。" },
      ],
    },
    {
      id: "suspense-s7",
      tick: "S7",
      title: "换：课表",
      goal: "Course 和 When 都 await。外面没有 Suspense。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "打开后的前半秒。课表会？",
        choices: [
          { id: "blank", label: "没有。和 Ada 那一课同一张空白", correct: true, why: "换了组件，等待边还在。两个孩子都没有壳。" },
          { id: "now", label: "立刻「今天的课」和 14:00", correct: false, why: "两人都在 await。" },
          { id: "part", label: "课名先到，时间空白", correct: false, why: "没有壳，两人都还没脸。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": transferBefore,
          "src/Course.vue": course,
          "src/When.vue": when,
        },
        blocks: [{ id: "table", label: "换场景：课表" }],
        narration: "人名换成课表。问的仍是：等待有没有被接住。",
      },
      observe: {
        state: [],
        dom: [{ id: "app", label: "#app", value: "先空白" }],
        events: [],
      },
      nodes: [
        { id: "c", kind: "async", label: "Course" },
        { id: "w", kind: "async", label: "When" },
        { id: "dom", kind: "dom", label: "空白" },
      ],
      edges: [
        { from: "c", to: "dom" },
        { from: "w", to: "dom" },
      ],
      ablations: [
        {
          id: "fix",
          prompt: "加上一个 Suspense 和 fallback 之后？",
          files: {
            "src/App.vue": transferFixed,
            "src/Course.vue": course,
            "src/When.vue": when,
          },
          expected: {
            kind: "stale",
            message: "这是修复：先加载中，两人都到了再一起出现。",
          },
          lesson: "下一课：失败不是终点。errorComponent 还能接到 retry。",
        },
      ],
      explanation: {
        headline: "孩子自己的 await，要壳来接",
        body: "空白是默认。fallback 是你准备的替身。一个壳等所有人。下一课 loader 拒绝之后，怎么再试一次。",
      },
      faqs: [
        { q: "能不能让课名先出来？", a: "能。给 Course 和 When 各套一个 Suspense。那是 S5 的边。" },
      ],
      tryThis: "先看空白。再打开修复：必须先「加载中」，再一起出现课名和时间。",
      mapping: [
        { code: "没有 <Suspense>", runtime: "异步依赖悬空", ui: "空白" },
        { code: "一个壳 + fallback", runtime: "等两人", ui: "加载中 → 课表" },
      ],
    },
  ],
};
