import type { CausalLab, CounterfactualWorld } from "../types";

const panelHint = `<template>
  <article class="card">
    <p class="hint me">子</p>
    <slot />
  </article>
</template>
<style scoped>
.me { color: #a6e3a1; }
</style>
`;

const panelScopedMe = `<template>
  <article class="card">
    <p class="hint me">子</p>
    <slot />
  </article>
</template>
<style scoped>
.me { color: #f38ba8; }
</style>
`;

const panelSlotted = `<template>
  <article class="card">
    <p class="hint me">子</p>
    <slot />
  </article>
</template>
<style scoped>
.me { color: #a6e3a1; }
:slotted(.me) { color: #f38ba8; }
</style>
`;

const panelWrong = `<template>
  <article class="card">
    <p class="hint me">子</p>
    <slot />
  </article>
</template>
<style scoped>
.me { color: #a6e3a1; }
:slotted(.nope) { color: #f38ba8; }
</style>
`;

const panelNamed = `<template>
  <article class="card">
    <p class="hint me">子</p>
    <slot />
    <slot name="price" />
  </article>
</template>
<style scoped>
.me { color: #a6e3a1; }
:slotted(.price) { color: #f38ba8; }
</style>
`;

const appPass = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">Ada 从父穿进子的插槽</p>
  <Panel>
    <span class="me">Ada</span>
  </Panel>
</template>
`;

const appNamed = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">默认槽是 Ada，具名槽是价钱</p>
  <Panel>
    <span class="me">Ada</span>
    <template #price>
      <span class="me price">36 元</span>
    </template>
  </Panel>
</template>
`;

const appNamedOnly = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">只有价钱带 .price</p>
  <Panel>
    <span class="me">Ada</span>
    <template #price>
      <span class="me price">36 元</span>
    </template>
  </Panel>
</template>
`;

const transferBefore = `<script setup>
import Box from './Box.vue'
</script>
<template>
  <p class="hint">标签从父穿进去</p>
  <Box>
    <span class="me">会员</span>
  </Box>
</template>
`;

const boxScoped = `<template>
  <article class="card">
    <p class="hint me">盒子</p>
    <slot />
  </article>
</template>
<style scoped>
.me { color: #f38ba8; }
</style>
`;

const boxSlotted = `<template>
  <article class="card">
    <p class="hint me">盒子</p>
    <slot />
  </article>
</template>
<style scoped>
.me { color: #a6e3a1; }
:slotted(.me) { color: #f38ba8; }
</style>
`;

const worldScoped: CounterfactualWorld = {
  id: "own",
  name: "只写 .me",
  tagline: "Ada 默认，子绿",
  files: { "src/App.vue": appPass, "src/Panel.vue": panelHint },
  nodes: [
    { id: "css", kind: "script", label: "子 .me" },
    { id: "ada", kind: "dom", label: "Ada 默认" },
  ],
  edges: [{ from: "css", to: "ada", label: "涂不到插槽" }],
  note: "插槽里的节点属于父。子的 scoped .me 认不到它。",
};

const worldSlotted: CounterfactualWorld = {
  id: "slot",
  name: ":slotted(.me)",
  tagline: "Ada 粉，子绿",
  files: { "src/App.vue": appPass, "src/Panel.vue": panelSlotted },
  nodes: [
    { id: "css", kind: "script", label: ":slotted", symbol: ":slotted" },
    { id: "ada", kind: "dom", label: "Ada 粉" },
  ],
  edges: [{ from: "css", to: "ada", label: "开口" }],
  note: ":slotted 让子去认投影进来的节点。所有权仍在父，口开在子这边。",
};

export const SLOTTED_LAB: CausalLab = {
  id: "slotted",
  world: 14,
  concept: ":slotted()",
  title: "插槽里的字，子要开口才涂得到",
  subtitle: "插槽内容的节点属于父。子的 scoped 涂不到它。:slotted 是子这边开的口。",
  promise:
    "一镜一条边：先子能涂自己的「子」，再 scoped .me 涂不到 Ada，再 :slotted 涂到 Ada，再选错 class 仍涂不到，再 :slotted(.price) 只涂价钱。",
  minutes: 16,
  official: "/api/sfc-css-features.html#slotted-selectors",
  scenes: [
    {
      id: "slotted-s0",
      tick: "S0",
      title: "子能涂自己，涂不到插槽",
      goal: "Panel scoped .me 绿色。插槽里是 Ada。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appPass, "src/Panel.vue": panelHint },
        blocks: [{ id: "own", label: "① 只涂自己" }],
        narration: "World 2 的插槽把 Ada 穿进去。这一课问：子的 CSS 认不认这份内容。先看子只涂到「子」。",
      },
      observe: {
        state: [],
        dom: [
          { id: "h", label: "子", value: "绿" },
          { id: "ada", label: "Ada", value: "默认色" },
        ],
        events: [],
      },
      nodes: [
        { id: "css", kind: "script", label: "子 scoped" },
        { id: "h", kind: "dom", label: "子 绿" },
        { id: "ada", kind: "dom", label: "Ada 默认" },
      ],
      edges: [{ from: "css", to: "h" }],
      explanation: {
        headline: "插槽里的节点不是子的模板",
        body: "「子」是 Panel 自己写的。Ada 是父传进来的。下一镜再给子加一行 .me { 粉 }，看 Ada 会不会变。",
      },
      tryThis: "「子」必须绿。Ada 必须是默认浅色。",
      faqs: [
        { q: "Ada 明明渲染在卡片里面？", a: "DOM 在里面。所有权仍在父。scoped 认的是所有权，不是位置。" },
      ],
    },
    {
      id: "slotted-s1",
      tick: "S1",
      title: "子写 .me，仍涂不到 Ada",
      goal: "Panel 再写 .me { 粉 }。仍然 scoped，没有 :slotted。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "子给 .me 上粉色。Ada 也有 class me。会？",
        choices: [
          { id: "stay", label: "Ada 仍默认。「子」变粉（盖住绿）", correct: true, why: "scoped .me 只认子自己的节点。Ada 没有子的指纹。" },
          { id: "ada", label: "Ada 变粉。它就在子的卡片里", correct: false, why: "位置在里面，所有权在父。下一镜才开口。" },
          { id: "both", label: "「子」和 Ada 都粉", correct: false, why: "Ada 这块碰不到。自己的 .me 会把「子」涂粉。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPass, "src/Panel.vue": panelScopedMe },
        blocks: [{ id: "miss", label: "② 涂不到插槽" }],
        narration: "同一份 .me。只碰到自己写的那一行。",
      },
      counterfactual: {
        id: "own-vs-slot",
        title: "自己的 .me vs :slotted",
        setup: "Ada 都带 .me。差在子有没有 :slotted。",
        worlds: [worldScoped, worldSlotted],
        punchline: "插槽是父的节点住在子的房子里。要涂客人，得用客人的门。",
      },
      observe: {
        state: [],
        dom: [
          { id: "h", label: "子", value: "粉" },
          { id: "ada", label: "Ada", value: "默认色" },
        ],
        events: [],
      },
      nodes: [
        { id: "css", kind: "script", label: "子 .me" },
        { id: "ada", kind: "dom", label: "Ada 默认" },
      ],
      edges: [{ from: "css", to: "ada", label: "涂不到" }],
      explanation: {
        headline: "scoped 不认客人",
        body: "下一镜改成 :slotted(.me)。「子」仍绿，Ada 变粉。",
      },
      faqs: [
        { q: "为什么「子」从绿变粉？", a: "它自己也叫 .me。scoped 只认自己的节点。下一镜绿留给自己，粉只给 :slotted。" },
      ],
      tryThis: "「子」必须粉。Ada 必须仍是默认浅色。打开反事实。",
      mapping: [{ code: "子 scoped .me", runtime: "只认自己的节点", ui: "Ada 默认" }],
    },
    {
      id: "slotted-s2",
      tick: "S2",
      title: ":slotted 去涂客人",
      goal: ":slotted(.me) 粉色。自己的 .me 绿色。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加上 :slotted(.me) 之后。Ada 会？",
        choices: [
          { id: "split", label: "Ada 粉，「子」绿。两张口两张脸", correct: true, why: ".me 涂自己。:slotted(.me) 涂插槽里的 .me。" },
          { id: "both", label: "都粉。:slotted 会盖住自己的 .me", correct: false, why: ":slotted 不匹配子自己写的节点。" },
          { id: "stay", label: "Ada 仍默认。:slotted 要父来写", correct: false, why: "口开在子的样式表里。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPass, "src/Panel.vue": panelSlotted },
        blocks: [{ id: "slot", label: "③ :slotted" }],
        narration: "scoped 还在。只是给插槽里的节点开了一口。",
      },
      observe: {
        state: [],
        dom: [
          { id: "h", label: "子", value: "绿" },
          { id: "ada", label: "Ada", value: "粉" },
        ],
        events: [],
      },
      nodes: [
        { id: "own", kind: "script", label: ".me" },
        { id: "slot", kind: "script", label: ":slotted", symbol: ":slotted" },
        { id: "ada", kind: "dom", label: "Ada 粉" },
      ],
      edges: [{ from: "slot", to: "ada", label: "开口" }],
      explanation: {
        headline: ":slotted 是子开给客人的门",
        body: "和 :deep 方向相反。:deep 是父涂子。:slotted 是子涂父传进来的节点。下一镜把 .me 写成 .nope。",
      },
      faqs: [
        { q: "父自己也能给 Ada 上色？", a: "能。Ada 本来就是父的模板。父 scoped .me 就能涂。子要用 :slotted 是因为节点不是它的。" },
      ],
      tryThis: "Ada 必须粉。「子」必须绿。不要两人同色。",
      mapping: [{ code: ":slotted(.me)", runtime: "认插槽里的 .me", ui: "Ada 粉" }],
    },
    {
      id: "slotted-s3",
      tick: "S3",
      title: "口开了，人写错",
      goal: ":slotted(.nope)。Ada 仍是 .me。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: ":slotted(.nope)。Ada 会？",
        choices: [
          { id: "stay", label: "仍默认。开口对不上 .me", correct: true, why: "和 :deep(.nope) 同一张图。" },
          { id: "pink", label: "仍粉。:slotted 会涂整个插槽", correct: false, why: "不是整个。是后面那段选择器。" },
          { id: "green", label: "Ada 变绿。会落到自己的 .me 上", correct: false, why: ":slotted 不匹配自己的节点。Ada 不是子的 .me。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPass, "src/Panel.vue": panelWrong },
        blocks: [{ id: "nope", label: "④ 选错" }],
        narration: "口还在。人的名字写错了。",
      },
      observe: {
        state: [],
        dom: [
          { id: "h", label: "子", value: "绿" },
          { id: "ada", label: "Ada", value: "默认色" },
        ],
        events: [],
      },
      nodes: [
        { id: "slot", kind: "script", label: ":slotted(.nope)" },
        { id: "ada", kind: "dom", label: "Ada 默认" },
      ],
      edges: [{ from: "slot", to: "ada", label: "对不上" }],
      explanation: {
        headline: "开口不是油漆桶",
        body: "下一镜两个槽：Ada 走默认槽，价钱走 #price。:slotted(.price) 只涂价钱。",
      },
      faqs: [
        { q: "和 :deep(.nope) 有什么不同？", a: "方向不同，错法相同：口开了，选择器对空。" },
      ],
      tryThis: "「子」必须绿。Ada 必须是默认浅色。",
      mapping: [{ code: ":slotted(.nope)", runtime: "开口对空", ui: "Ada 默认" }],
    },
    {
      id: "slotted-s4",
      tick: "S4",
      title: "两个槽，只涂价钱",
      goal: ":slotted(.price)。Ada 没有 .price，36 元有。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "只有价钱带 .price。会？",
        choices: [
          { id: "one", label: "36 元粉，Ada 默认，「子」绿", correct: true, why: "口只认 .price。默认槽的 Ada 对不上。" },
          { id: "both", label: "Ada 和价钱都粉。:slotted 涂所有槽", correct: false, why: "所有槽里的节点都是客人，但选择器还是要匹配。" },
          { id: "ada", label: "只有 Ada 粉。默认槽优先", correct: false, why: "Ada 没有 .price。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appNamed, "src/Panel.vue": panelNamed },
        blocks: [{ id: "named", label: "⑤ 只涂具名槽" }],
        narration: "两个客人。口只对准带 .price 的那位。",
      },
      observe: {
        state: [],
        dom: [
          { id: "h", label: "子", value: "绿" },
          { id: "ada", label: "Ada", value: "默认色" },
          { id: "p", label: "36 元", value: "粉" },
        ],
        events: [],
      },
      nodes: [
        { id: "slot", kind: "script", label: ":slotted(.price)" },
        { id: "p", kind: "dom", label: "36 元 粉" },
      ],
      edges: [{ from: "slot", to: "p" }],
      explanation: {
        headline: "口有大小，槽有名字",
        body: "下一镜把 :slotted 整行拿掉：价钱回到默认，只剩「子」绿。",
      },
      faqs: [
        { q: ":slotted 能写 .me.price 吗？", a: "能。选择器越准，口越小。" },
      ],
      tryThis: "36 元必须粉。Ada 必须默认。「子」必须绿。",
      mapping: [{ code: ":slotted(.price)", runtime: "只认 .price", ui: "价钱粉" }],
    },
    {
      id: "slotted-s5",
      tick: "S5",
      title: "拿掉 :slotted，客人又没色",
      goal: "仍是两个槽。Panel 只 scoped 涂自己的 .me。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "没有 :slotted。价钱会？",
        choices: [
          { id: "stay", label: "Ada 和价钱都默认。「子」绿", correct: true, why: "客人都不认。只剩自己的节点。" },
          { id: "keep", label: "价钱仍粉。具名槽会记住上一镜", correct: false, why: "这一镜文件里已经没有 :slotted。" },
          { id: "pink", label: "都粉。两个槽会落到子的 .me 上", correct: false, why: "客人没有子的指纹。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appNamedOnly, "src/Panel.vue": panelHint },
        blocks: [{ id: "off", label: "⑥ 收回口" }],
        narration: "槽还在。口关了。",
      },
      observe: {
        state: [],
        dom: [
          { id: "h", label: "子", value: "绿" },
          { id: "ada", label: "Ada", value: "默认色" },
          { id: "p", label: "36 元", value: "默认色" },
        ],
        events: [],
      },
      nodes: [
        { id: "css", kind: "script", label: "子 .me" },
        { id: "p", kind: "dom", label: "价钱 默认" },
      ],
      edges: [{ from: "css", to: "p", label: "关口" }],
      explanation: {
        headline: "口关上，客人就没色",
        body: "下一镜拆三种：涂不到 Ada、选错 class、只涂价钱。",
      },
      faqs: [
        { q: "父给 Ada 上色算不算作弊？", a: "不算。那是父涂自己的节点。这一课问的是子能不能涂。" },
      ],
      tryThis: "「子」必须绿。Ada 和 36 元都必须是默认浅色。",
      mapping: [{ code: "无 :slotted", runtime: "不认客人", ui: "价钱默认" }],
    },
    {
      id: "slotted-s6",
      tick: "S6",
      title: "拆成涂不到 / 选错 / 只涂价钱",
      goal: "对照：scoped .me、:slotted(.nope)、:slotted(.price)。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到 :slotted(.me)。Ada 会？",
        choices: [
          { id: "pink", label: "Ada 粉，「子」绿", correct: true, why: "先确认好的脸。" },
          { id: "stay", label: "Ada 默认", correct: false, why: "那是没有 :slotted，或选错。" },
          { id: "both", label: "都粉", correct: false, why: ":slotted 不涂自己。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPass, "src/Panel.vue": panelSlotted },
        blocks: [{ id: "keep", label: ":slotted 先留着" }],
        narration: "先看见 Ada 粉。再分别：涂不到、选错、只涂价钱。",
      },
      observe: {
        state: [],
        dom: [{ id: "ada", label: "Ada", value: "粉" }],
        events: [],
      },
      nodes: [
        { id: "slot", kind: "script", label: ":slotted" },
        { id: "ada", kind: "dom", label: "Ada" },
      ],
      edges: [{ from: "slot", to: "ada" }],
      ablations: [
        {
          id: "miss",
          prompt: "如果只写 scoped .me，没有 :slotted？",
          files: { "src/App.vue": appPass, "src/Panel.vue": panelScopedMe },
          expected: { kind: "stale", message: "Ada 默认。「子」粉。涂不到客人。" },
          lesson: "scoped 不认客人。",
        },
        {
          id: "nope",
          prompt: "如果 :slotted(.nope)？",
          files: { "src/App.vue": appPass, "src/Panel.vue": panelWrong },
          expected: { kind: "stale", message: "Ada 默认。「子」绿。口开了对空。" },
          lesson: "开口不是油漆桶。",
        },
        {
          id: "price",
          prompt: "如果两个槽，只 :slotted(.price)？",
          files: { "src/App.vue": appNamed, "src/Panel.vue": panelNamed },
          expected: { kind: "stale", message: "36 元粉，Ada 默认。「子」绿。" },
          lesson: "口有大小。",
        },
      ],
      explanation: {
        headline: "涂不到、对空、只涂一位",
        body: "三张脸，三种原因。World 14 收束：样式也有边界。scoped 立墙，:deep 父开口，:slotted 子开口。",
      },
      tryThis: "三种消融：Ada 默认、「子」绿 Ada 默认、价钱粉 Ada 默认。对上号再恢复 Ada 粉。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先涂不到，再选错，再只涂价钱。" },
      ],
    },
    {
      id: "slotted-s7",
      tick: "S7",
      title: "换：会员标签",
      goal: "Box 有插槽。父穿进「会员」。子只写了 scoped .me。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "「会员」会？",
        choices: [
          { id: "stay", label: "默认色。和 Ada 那一课同一张涂不到", correct: true, why: "换了词，插槽边还在。" },
          { id: "pink", label: "变粉。标签很短，能直接涂", correct: false, why: "客人没有子的指纹。" },
          { id: "green", label: "变绿。会落到「盒子」那行 .me 上", correct: false, why: "「盒子」会绿。「会员」不会。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore, "src/Box.vue": boxScoped },
        blocks: [{ id: "tag", label: "换场景：标签" }],
        narration: "Ada 换成会员。问的仍是：子认不认插槽里的节点。",
      },
      observe: {
        state: [],
        dom: [
          { id: "h", label: "盒子", value: "粉" },
          { id: "t", label: "会员", value: "默认色" },
        ],
        events: [],
      },
      nodes: [
        { id: "css", kind: "script", label: "子 .me" },
        { id: "t", kind: "dom", label: "会员 默认" },
      ],
      edges: [{ from: "css", to: "t", label: "涂不到" }],
      ablations: [
        {
          id: "fix",
          prompt: "改成 :slotted(.me) 之后？",
          files: { "src/App.vue": transferBefore, "src/Box.vue": boxSlotted },
          expected: {
            kind: "stale",
            message: "这是修复：「会员」粉，「盒子」绿。",
          },
          lesson: "World 14 收束：墙、父开口、子开口。颜色停在哪一层，由指纹和口决定。",
        },
      ],
      explanation: {
        headline: "客人要走客人的门",
        body: "scoped 立墙。:deep 是父往子开。:slotted 是子往插槽开。World 14 停在样式的边界。",
      },
      faqs: [
        { q: "和 World 2 的插槽有什么不同？", a: "那一课问内容从哪来。这一课问样式认谁。节点还是那颗，边不同。" },
      ],
      tryThis: "先看「会员」默认、「盒子」粉。再打开修复：「会员」粉、「盒子」绿。",
      mapping: [
        { code: "子 scoped .me", runtime: "不认客人", ui: "会员默认" },
        { code: ":slotted(.me)", runtime: "开口", ui: "会员粉" },
      ],
    },
  ],
};
