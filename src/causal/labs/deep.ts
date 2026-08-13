import type { CausalLab, CounterfactualWorld } from "../types";

const panel = `<template>
  <p class="card"><span class="me">乙</span></p>
</template>
`;

const panelA = `<template>
  <p class="card"><span class="me a">乙甲</span></p>
</template>
`;

const panelB = `<template>
  <p class="card"><span class="me b">乙乙</span></p>
</template>
`;

const price = `<template>
  <p class="card"><span class="me">36 元</span></p>
</template>
`;

const appOwn = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">父 scoped 只涂甲</p>
  <p class="card"><span class="me">甲</span></p>
  <div class="child">
    <Panel />
  </div>
</template>
<style scoped>
.me { color: #f38ba8; }
</style>
`;

const appDesc = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">父写了 .child .me，仍没有 :deep</p>
  <p class="card"><span class="me">甲</span></p>
  <div class="child">
    <Panel />
  </div>
</template>
<style scoped>
.me { color: #f38ba8; }
.child .me { color: #f38ba8; }
</style>
`;

const appDeep = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">.child :deep(.me)</p>
  <p class="card"><span class="me">甲</span></p>
  <div class="child">
    <Panel />
  </div>
</template>
<style scoped>
.me { color: #f38ba8; }
.child :deep(.me) { color: #f38ba8; }
</style>
`;

const appWrong = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">:deep(.nope) 对不上乙</p>
  <p class="card"><span class="me">甲</span></p>
  <div class="child">
    <Panel />
  </div>
</template>
<style scoped>
.me { color: #f38ba8; }
.child :deep(.nope) { color: #f38ba8; }
</style>
`;

const appUnscoped = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">不写 scoped，用全局 .me</p>
  <p class="card"><span class="me">甲</span></p>
  <div class="child">
    <Panel />
  </div>
</template>
<style>
.me { color: #f38ba8; }
</style>
`;

const appPick = `<script setup>
import Ada from './Ada.vue'
import Price from './Price.vue'
</script>
<template>
  <p class="hint">只穿透 .a</p>
  <div class="child">
    <Ada />
    <Price />
  </div>
</template>
<style scoped>
.child :deep(.a) { color: #f38ba8; }
</style>
`;

const transferBefore = `<script setup>
import Price from './Price.vue'
</script>
<template>
  <p class="hint">想涂价钱，只写了 .child .me</p>
  <p class="card"><span class="me">甲</span></p>
  <div class="child">
    <Price />
  </div>
</template>
<style scoped>
.me { color: #f38ba8; }
.child .me { color: #f38ba8; }
</style>
`;

const transferFixed = `<script setup>
import Price from './Price.vue'
</script>
<template>
  <p class="hint">:deep 开了口</p>
  <p class="card"><span class="me">甲</span></p>
  <div class="child">
    <Price />
  </div>
</template>
<style scoped>
.me { color: #f38ba8; }
.child :deep(.me) { color: #f38ba8; }
</style>
`;

const worldDesc: CounterfactualWorld = {
  id: "desc",
  name: "后代选择器",
  tagline: "乙仍默认",
  files: { "src/App.vue": appDesc, "src/Panel.vue": panel },
  nodes: [
    { id: "css", kind: "script", label: ".child .me" },
    { id: "b", kind: "dom", label: "乙 默认" },
  ],
  edges: [{ from: "css", to: "b", label: "认不到" }],
  note: "scoped 把 .me 收成 .me[data-v-父]。乙的 .me 带着子的指纹，对不上。",
};

const worldDeep: CounterfactualWorld = {
  id: "deep",
  name: ":deep(.me)",
  tagline: "乙也粉",
  files: { "src/App.vue": appDeep, "src/Panel.vue": panel },
  nodes: [
    { id: "css", kind: "script", label: ":deep", symbol: ":deep" },
    { id: "b", kind: "dom", label: "乙 粉" },
  ],
  edges: [{ from: "css", to: "b", label: "开口" }],
  note: ":deep 让后面那段选择器不再要父的指纹。乙的 .me 就能被认到。",
};

export const DEEP_LAB: CausalLab = {
  id: "deep",
  world: 14,
  concept: ":deep()",
  title: "故意开口去涂子",
  subtitle: "scoped 拦住之后，父要涂子的节点，得用 :deep。后代选择器不够。",
  promise:
    "一镜一条边：先父只涂甲，再 .child .me 仍涂不到乙，再 :deep 开口，再选错 class 仍涂不到，再去掉 scoped 变成漏，再 :deep(.a) 只涂一个孩子。",
  minutes: 16,
  official: "/api/sfc-css-features.html#deep-selectors",
  scenes: [
    {
      id: "deep-s0",
      tick: "S0",
      title: "父 scoped，乙没有粉",
      goal: "App scoped .me 粉色。Panel 在 .child 里。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appOwn, "src/Panel.vue": panel },
        blocks: [{ id: "own", label: "① 只涂自己" }],
        narration: "上一课 scoped 把颜色停在甲。这一课父想涂乙。先看还没开口的脸。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "粉" },
          { id: "b", label: "乙", value: "默认色" },
        ],
        events: [],
      },
      nodes: [
        { id: "css", kind: "script", label: "scoped .me" },
        { id: "b", kind: "dom", label: "乙 默认" },
      ],
      edges: [{ from: "css", to: "b", label: "停在边界" }],
      explanation: {
        headline: "边界先立住",
        body: "下一镜加一行 .child .me。很多人以为后代选择器就能穿过去。",
      },
      tryThis: "甲必须粉。乙必须是默认浅色。",
      faqs: [
        { q: "为什么乙要包在 .child 里？", a: "下一镜穿透时，开口只对准这棵子树，避免误伤甲。" },
      ],
    },
    {
      id: "deep-s1",
      tick: "S1",
      title: "后代选择器穿不过去",
      goal: "再写 .child .me { color: 粉 }。仍然 scoped。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "父已经写了 .child .me。乙会？",
        choices: [
          { id: "stay", label: "仍默认。scoped 把 .me 钉在父的指纹上", correct: true, why: "编译成 .child .me[data-v-父]。乙的节点没有父的 data-v。" },
          { id: "pink", label: "乙变粉。写了后代就能进子树", correct: false, why: "那是下一镜 :deep 的脸。" },
          { id: "blank", label: "乙消失。选择器冲突", correct: false, why: "乙还在，只是没被涂。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appDesc, "src/Panel.vue": panel },
        blocks: [{ id: "desc", label: "② 后代不够" }],
        narration: "空格在 CSS 里是后代。在 scoped 里，它仍要父的指纹。",
      },
      counterfactual: {
        id: "desc-vs-deep",
        title: "后代 vs :deep",
        setup: "都想涂 .child 里的 .me。差在有没有 :deep。",
        worlds: [worldDesc, worldDeep],
        punchline: "空格不是开口。:deep 才是。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "粉" },
          { id: "b", label: "乙", value: "默认色" },
        ],
        events: [],
      },
      nodes: [
        { id: "css", kind: "script", label: ".child .me" },
        { id: "b", kind: "dom", label: "乙 默认" },
      ],
      edges: [{ from: "css", to: "b", label: "认不到" }],
      explanation: {
        headline: "空格还是自己的选择器",
        body: "下一镜把中间那段换成 :deep(.me)。开口只开在 .child 里面。",
      },
      faqs: [
        { q: "::v-deep 呢？", a: "旧写法。现在用 :deep()。边是同一条。" },
      ],
      tryThis: "乙必须仍是默认色。打开反事实。",
      mapping: [{ code: ".child .me 且 scoped", runtime: ".me[data-v-父]", ui: "乙默认" }],
    },
    {
      id: "deep-s2",
      tick: "S2",
      title: ":deep 把口开在子树上",
      goal: ".child :deep(.me)。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加上 :deep 之后。乙会？",
        choices: [
          { id: "pink", label: "乙变粉。开口对准 .child 里面的 .me", correct: true, why: ":deep 后面的 .me 不再要父的指纹。" },
          { id: "stay", label: "仍默认。:deep 只对原生 DOM 有效", correct: false, why: "组件里的节点也是 DOM。能涂。" },
          { id: "both", label: "甲变成默认。:deep 会关掉上面那行", correct: false, why: "上面 .me { 粉 } 还在。甲仍粉。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appDeep, "src/Panel.vue": panel },
        blocks: [{ id: "deep", label: "③ :deep" }],
        narration: "scoped 还在。只是给 .child 里面开了一口。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "粉" },
          { id: "b", label: "乙", value: "粉" },
        ],
        events: [],
      },
      nodes: [
        { id: "deep", kind: "script", label: ":deep", symbol: ":deep" },
        { id: "b", kind: "dom", label: "乙 粉" },
      ],
      edges: [{ from: "deep", to: "b", label: "开口" }],
      explanation: {
        headline: ":deep 是故意的口，不是漏",
        body: "下一镜把 .me 写成 .nope。口开了，但对不上人。",
      },
      faqs: [
        { q: "为什么不直接去掉 scoped？", a: "去掉会把甲乙以及以后所有 .me 一起涂上。:deep 只开你写的那一口。" },
      ],
      tryThis: "甲和乙必须都是粉。甲靠 scoped，乙靠 :deep。",
      mapping: [{ code: ".child :deep(.me)", runtime: "子树里认 .me", ui: "乙粉" }],
    },
    {
      id: "deep-s3",
      tick: "S3",
      title: "口开了，人写错",
      goal: ".child :deep(.nope)。乙仍是 .me。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: ":deep(.nope)。乙会？",
        choices: [
          { id: "stay", label: "仍默认。开口对不上 .me", correct: true, why: ":deep 只放开指纹。class 对不上还是涂不到。" },
          { id: "pink", label: "乙仍粉。:deep 会涂整棵子树", correct: false, why: "不是整棵。是后面那段选择器。" },
          { id: "a", label: "甲变成默认。写错会拆掉 scoped", correct: false, why: "上面那行 .me 还在。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appWrong, "src/Panel.vue": panel },
        blocks: [{ id: "nope", label: "④ 选错" }],
        narration: "口还在。人的名字写错了。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "粉" },
          { id: "b", label: "乙", value: "默认色" },
        ],
        events: [],
      },
      nodes: [
        { id: "deep", kind: "script", label: ":deep(.nope)" },
        { id: "b", kind: "dom", label: "乙 默认" },
      ],
      edges: [{ from: "deep", to: "b", label: "对不上" }],
      explanation: {
        headline: "开口不是油漆桶",
        body: "下一镜把 scoped 整份拿掉，改用全局 .me：乙会粉，但那是漏，不是口。",
      },
      faqs: [
        { q: ":deep(*) 呢？", a: "能涂到很多节点。口开得越大，越像漏。能写准 class 就写准。" },
      ],
      tryThis: "甲必须粉。乙必须是默认浅色。",
      mapping: [{ code: ":deep(.nope)", runtime: "开口对空", ui: "乙默认" }],
    },
    {
      id: "deep-s4",
      tick: "S4",
      title: "拿掉 scoped，又变成漏",
      goal: "<style> 无 scoped。.me 粉色。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "不写 scoped，也不写 :deep。乙会？",
        choices: [
          { id: "both", label: "甲乙都粉。这是漏，不是开口", correct: true, why: "全局 .me 谁都涂。没有边界可开。" },
          { id: "b", label: "只有乙粉。没有 scoped 就只剩子", correct: false, why: "甲也叫 .me。" },
          { id: "stay", label: "乙仍默认。没有 :deep 就穿不过", correct: false, why: "没有 scoped 时不需要穿。本来就没有墙。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appUnscoped, "src/Panel.vue": panel },
        blocks: [{ id: "leak", label: "⑤ 退回漏" }],
        narration: "墙拆了。口也不需要了。所有 .me 一起粉。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "粉" },
          { id: "b", label: "乙", value: "粉" },
        ],
        events: [],
      },
      nodes: [
        { id: "css", kind: "script", label: "全局 .me" },
        { id: "b", kind: "dom", label: "乙 粉" },
      ],
      edges: [{ from: "css", to: "b", label: "漏" }],
      explanation: {
        headline: "漏和开口看起来都是粉",
        body: "原因不同。下一镜墙还在，口只对准 class a。",
      },
      faqs: [
        { q: "那为什么还要 scoped？", a: "因为你还想让以后第三个 .me 不要被误伤。墙先立住，口再开小。" },
      ],
      tryThis: "甲和乙必须都粉。这一镜没有 :deep。",
      mapping: [{ code: "<style> 无 scoped", runtime: "没有墙", ui: "都粉" }],
    },
    {
      id: "deep-s5",
      tick: "S5",
      title: "口只对准一个孩子",
      goal: "两个子。:deep(.a) 只涂乙甲。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "乙甲有 class a，乙乙有 class b。会？",
        choices: [
          { id: "one", label: "只有乙甲粉。乙乙默认", correct: true, why: "开口后面仍是普通选择器。只认 .a。" },
          { id: "both", label: "两个都粉。:deep 涂整棵 .child", correct: false, why: "S3 已经见过：对不上就不涂。" },
          { id: "none", label: "都不粉。两个根不能 :deep", correct: false, why: "能。这一镜就是。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appPick,
          "src/Ada.vue": panelA,
          "src/Price.vue": panelB,
        },
        blocks: [{ id: "pick", label: "⑥ 只开一口" }],
        narration: "墙还在。口很小。只让 .a 进来。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "乙甲", value: "粉" },
          { id: "b", label: "乙乙", value: "默认色" },
        ],
        events: [],
      },
      nodes: [
        { id: "deep", kind: "script", label: ":deep(.a)" },
        { id: "hit", kind: "dom", label: "乙甲 粉" },
      ],
      edges: [{ from: "deep", to: "hit" }],
      explanation: {
        headline: "口有大小",
        body: "下一镜拆三种：后代不够、选错 class、拆墙变成漏。",
      },
      faqs: [
        { q: "子想涂插槽里的字呢？", a: "方向反了。那是 :slotted。下一课。" },
      ],
      tryThis: "乙甲必须粉。乙乙必须是默认浅色。",
      mapping: [{ code: ":deep(.a)", runtime: "只认 a", ui: "乙甲粉" }],
    },
    {
      id: "deep-s6",
      tick: "S6",
      title: "拆成穿不过 / 选错 / 拆墙",
      goal: "对照：后代选择器、:deep(.nope)、无 scoped。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到 .child :deep(.me)。乙会？",
        choices: [
          { id: "pink", label: "乙粉", correct: true, why: "先确认好的脸。" },
          { id: "stay", label: "乙默认", correct: false, why: "那是没有 :deep，或选错。" },
          { id: "none", label: "甲也默认", correct: false, why: "甲自己的 .me 还在。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appDeep, "src/Panel.vue": panel },
        blocks: [{ id: "keep", label: ":deep 先留着" }],
        narration: "先看见乙粉。再分别：后代不够、选错、拆墙。",
      },
      observe: {
        state: [],
        dom: [{ id: "b", label: "乙", value: "粉" }],
        events: [],
      },
      nodes: [
        { id: "deep", kind: "script", label: ":deep" },
        { id: "b", kind: "dom", label: "乙" },
      ],
      edges: [{ from: "deep", to: "b" }],
      ablations: [
        {
          id: "desc",
          prompt: "如果只写 .child .me，没有 :deep？",
          files: { "src/App.vue": appDesc, "src/Panel.vue": panel },
          expected: { kind: "stale", message: "乙仍默认。后代选择器穿不过 scoped。" },
          lesson: "空格不是开口。",
        },
        {
          id: "nope",
          prompt: "如果 :deep(.nope)？",
          files: { "src/App.vue": appWrong, "src/Panel.vue": panel },
          expected: { kind: "stale", message: "乙仍默认。口开了对空。" },
          lesson: "开口不是油漆桶。",
        },
        {
          id: "leak",
          prompt: "如果拿掉 scoped？",
          files: { "src/App.vue": appUnscoped, "src/Panel.vue": panel },
          expected: { kind: "stale", message: "甲乙都粉。这是漏，不是口。" },
          lesson: "墙拆了就不叫穿透。",
        },
      ],
      explanation: {
        headline: "穿不过、对空、拆墙",
        body: "三张脸，三种原因。下一课方向反过来：子要涂插槽里那份内容。",
      },
      tryThis: "三种消融：乙默认、乙默认、都粉。对上号再恢复乙粉。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先后代不够，再选错，再拆墙。" },
      ],
    },
    {
      id: "deep-s7",
      tick: "S7",
      title: "换：价钱",
      goal: "想涂 36 元。只写了 .child .me，没有 :deep。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "价钱在 .child 里。它会？",
        choices: [
          { id: "stay", label: "默认色。和乙那一课同一张穿不过", correct: true, why: "换了组件，scoped 的墙还在。" },
          { id: "pink", label: "变粉。价钱很浅，能直接涂", correct: false, why: "选择器仍要父的指纹。" },
          { id: "err", label: "报错", correct: false, why: "能跑。只是没涂上。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore, "src/Price.vue": price },
        blocks: [{ id: "price", label: "换场景：价钱" }],
        narration: "乙换成价钱。问的仍是：墙还在的时候，口开了没有。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "粉" },
          { id: "p", label: "36 元", value: "默认色" },
        ],
        events: [],
      },
      nodes: [
        { id: "css", kind: "script", label: ".child .me" },
        { id: "p", kind: "dom", label: "价钱 默认" },
      ],
      edges: [{ from: "css", to: "p", label: "穿不过" }],
      ablations: [
        {
          id: "fix",
          prompt: "改成 :deep(.me) 之后？",
          files: { "src/App.vue": transferFixed, "src/Price.vue": price },
          expected: {
            kind: "stale",
            message: "这是修复：甲和 36 元都粉。口开在 .child 里。",
          },
          lesson: "下一课：插槽里的节点，所有权在父。子要涂它，得用 :slotted。",
        },
      ],
      explanation: {
        headline: "想涂子，就开一口",
        body: "后代选择器不够。:deep 是 scoped 墙上的门。下一课门开在另一面：插槽。",
      },
      faqs: [
        { q: "价钱自己 scoped 绿，父 :deep 粉，谁赢？", a: "看选择器谁更具体、谁后到。两边都能碰到节点。能让子自己涂就别 :deep。" },
      ],
      tryThis: "先看价钱默认。再打开修复：价钱必须粉。",
      mapping: [
        { code: ".child .me", runtime: "穿不过", ui: "价钱默认" },
        { code: ".child :deep(.me)", runtime: "开口", ui: "价钱粉" },
      ],
    },
  ],
};
