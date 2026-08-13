import type { CausalLab, CounterfactualWorld } from "../types";

const panelBare = `<template>
  <p class="card"><span class="me">乙</span></p>
</template>
`;

const panelLeak = `<template>
  <p class="card"><span class="me">乙</span></p>
</template>
<style>
.me { color: #f38ba8; }
</style>
`;

const panelScoped = `<template>
  <p class="card"><span class="me">乙</span></p>
</template>
<style scoped>
.me { color: #f38ba8; }
</style>
`;

const panelGreen = `<template>
  <p class="card"><span class="me">乙</span></p>
</template>
<style scoped>
.me { color: #a6e3a1; }
</style>
`;

const appNone = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">粉 = 样式碰到了这层。现在都没有上色</p>
  <p class="card"><span class="me">甲</span></p>
  <Panel />
</template>
`;

const appLeak = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">父的样式没有 scoped</p>
  <p class="card"><span class="me">甲</span></p>
  <Panel />
</template>
<style>
.me { color: #f38ba8; }
</style>
`;

const appScoped = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">父的样式有 scoped</p>
  <p class="card"><span class="me">甲</span></p>
  <Panel />
</template>
<style scoped>
.me { color: #f38ba8; }
</style>
`;

const appFromChild = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">父没有样式。子的样式没有 scoped</p>
  <p class="card"><span class="me">甲</span></p>
  <Panel />
</template>
`;

const appChildScoped = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">父没有样式。子的样式有 scoped</p>
  <p class="card"><span class="me">甲</span></p>
  <Panel />
</template>
`;

const appBoth = `<script setup>
import Panel from './Panel.vue'
</script>
<template>
  <p class="hint">两份 scoped，两种颜色</p>
  <p class="card"><span class="me">甲</span></p>
  <Panel />
</template>
<style scoped>
.me { color: #f38ba8; }
</style>
`;

const priceBare = `<template>
  <p class="card"><span class="me">36 元</span></p>
</template>
`;

const transferBefore = `<script setup>
import Price from './Price.vue'
</script>
<template>
  <p class="hint">价钱也在子里</p>
  <p class="card"><span class="me">甲</span></p>
  <Price />
</template>
<style>
.me { color: #f38ba8; }
</style>
`;

const transferFixed = `<script setup>
import Price from './Price.vue'
</script>
<template>
  <p class="hint">父 scoped，价钱不受影响</p>
  <p class="card"><span class="me">甲</span></p>
  <Price />
</template>
<style scoped>
.me { color: #f38ba8; }
</style>
`;

const worldLeak: CounterfactualWorld = {
  id: "leak",
  name: "没有 scoped",
  tagline: "甲乙都粉",
  files: { "src/App.vue": appLeak, "src/Panel.vue": panelBare },
  nodes: [
    { id: "css", kind: "script", label: "父 .me" },
    { id: "a", kind: "dom", label: "甲 粉" },
    { id: "b", kind: "dom", label: "乙 粉" },
  ],
  edges: [
    { from: "css", to: "a" },
    { from: "css", to: "b", label: "漏" },
  ],
  note: "没有 scoped 的选择器是全局的。子的 .me 也被涂上。",
};

const worldScoped: CounterfactualWorld = {
  id: "scoped",
  name: "有 scoped",
  tagline: "只有甲粉",
  files: { "src/App.vue": appScoped, "src/Panel.vue": panelBare },
  nodes: [
    { id: "css", kind: "script", label: "父 .me" },
    { id: "a", kind: "dom", label: "甲 粉" },
    { id: "b", kind: "dom", label: "乙 默认" },
  ],
  edges: [{ from: "css", to: "a" }],
  note: "scoped 给模板打上指纹。选择器只认自己的节点。",
};

export const SCOPED_LAB: CausalLab = {
  id: "scoped",
  world: 14,
  concept: "scoped CSS",
  title: "颜色停在自己的模板",
  subtitle: "没有 scoped 的选择器是全局的。scoped 给这层模板打指纹，颜色就停在自己的节点上。",
  promise:
    "一镜一条边：先都没有上色，再父漏到子，再父 scoped 只涂甲，再子漏到父，再子 scoped 只涂乙，再两份 scoped 两种颜色。",
  minutes: 16,
  official: "/api/sfc-css-features.html#scoped-css",
  scenes: [
    {
      id: "scoped-s0",
      tick: "S0",
      title: "都没有上色",
      goal: "甲和乙都是 span.me。没有 <style>。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appNone, "src/Panel.vue": panelBare },
        blocks: [{ id: "none", label: "① 没有样式" }],
        narration: "World 12 用指令碰颜色。这一课颜色写在 CSS 里。先看没有样式的脸。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "默认色" },
          { id: "b", label: "乙", value: "默认色" },
        ],
        events: [],
      },
      nodes: [
        { id: "a", kind: "dom", label: "甲" },
        { id: "b", kind: "dom", label: "乙" },
      ],
      edges: [{ from: "a", to: "b", label: "都没上色" }],
      explanation: {
        headline: "没有样式，就没有这层指纹",
        body: "下一镜父写 .me { color: 粉 }，不加 scoped。看它会不会漏到乙。",
      },
      tryThis: "甲和乙必须都是默认的浅色字。没有粉。",
      faqs: [
        { q: "预览里本来就有 .card 样式？", a: "有，那是外壳给的边框。这一课盯 span.me 的文字颜色。" },
      ],
    },
    {
      id: "scoped-s1",
      tick: "S1",
      title: "没有 scoped，漏到子",
      goal: "App 里 <style> 不写 scoped。.me 粉色。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "父给 .me 上粉色。乙也会？",
        choices: [
          { id: "both", label: "甲乙都粉。没有 scoped 就是全局", correct: true, why: "选择器不认组件边界。乙的 .me 一样匹配。" },
          { id: "a", label: "只有甲粉。写在 App 里就只涂 App", correct: false, why: "那是下一镜 scoped 的脸。" },
          { id: "none", label: "都不粉。class 在子里不算", correct: false, why: ".me 就是 .me。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appLeak, "src/Panel.vue": panelBare },
        blocks: [{ id: "leak", label: "② 父漏下去" }],
        narration: "一行 CSS。两张脸都被涂上。",
      },
      counterfactual: {
        id: "leak-vs-scoped",
        title: "漏 vs 停",
        setup: "同一行 .me { color: 粉 }。差在有没有 scoped。",
        worlds: [worldLeak, worldScoped],
        punchline: "scoped 不是更深的粉。它是一枚指纹，决定选择器认谁。",
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
        { id: "css", kind: "script", label: "父 .me", symbol: "scoped" },
        { id: "b", kind: "dom", label: "乙 粉" },
      ],
      edges: [{ from: "css", to: "b", label: "漏" }],
      explanation: {
        headline: "没有指纹，选择器不认边界",
        body: "下一镜加上 scoped。同一行颜色，乙应回到默认。",
      },
      faqs: [
        { q: "这和 World 11 属性贴到根上像吗？", a: "像。都是「你以为停在这一层，其实漏到了另一层」。属性漏的是 HTML，这里漏的是 CSS。" },
      ],
      tryThis: "甲和乙必须都是粉。打开反事实。",
      mapping: [{ code: "<style> 无 scoped", runtime: "全局选择器", ui: "甲乙都粉" }],
    },
    {
      id: "scoped-s2",
      tick: "S2",
      title: "父 scoped，只涂甲",
      goal: "<style scoped>。.me 粉色。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加上 scoped 之后。乙会？",
        choices: [
          { id: "stop", label: "乙回到默认。指纹只认甲", correct: true, why: "scoped 把选择器收成 .me[data-v-父]。乙没有这枚指纹。" },
          { id: "both", label: "仍都粉。scoped 只是防命名冲突的注释", correct: false, why: "它改的是选择器，不是注释。" },
          { id: "b", label: "只有乙粉。scoped 会传给子", correct: false, why: "方向反了。scoped 是拦住，不是传下去。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appScoped, "src/Panel.vue": panelBare },
        blocks: [{ id: "stop", label: "③ 父 scoped" }],
        narration: "颜色一行没改。只多了 scoped。",
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
        { id: "css", kind: "script", label: "scoped", symbol: "scoped" },
        { id: "a", kind: "dom", label: "甲 粉" },
      ],
      edges: [{ from: "css", to: "a" }],
      explanation: {
        headline: "scoped 把选择器钉在自己的节点上",
        body: "下一镜把样式写到子里，而且不写 scoped。漏可以往上走。",
      },
      faqs: [
        { q: "data-v-xxx 是什么？", a: "编译器给这层模板的节点打的属性。scoped 选择器要同时匹配 class 和这枚属性。" },
      ],
      tryThis: "甲必须粉。乙必须是默认浅色。不要两人都粉。",
      mapping: [{ code: "<style scoped>", runtime: ".me[data-v-父]", ui: "只有甲粉" }],
    },
    {
      id: "scoped-s3",
      tick: "S3",
      title: "子没有 scoped，漏到父",
      goal: "App 没有样式。Panel 的 <style> 不写 scoped。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "粉色写在子里。甲会？",
        choices: [
          { id: "both", label: "甲也粉。子的全局选择器照样打到父", correct: true, why: "漏没有方向。没有 scoped 就是全树。" },
          { id: "b", label: "只有乙粉。子不能改父", correct: false, why: "CSS 不认父子。它认选择器。" },
          { id: "none", label: "都不粉。子的 style 进不了页面", correct: false, why: "会进。而且是全局的。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appFromChild, "src/Panel.vue": panelLeak },
        blocks: [{ id: "up", label: "④ 子漏上来" }],
        narration: "父把样式删了。子写了同一行，仍不打 scoped。",
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
        { id: "css", kind: "script", label: "子 .me" },
        { id: "a", kind: "dom", label: "甲 粉" },
      ],
      edges: [{ from: "css", to: "a", label: "漏上来" }],
      explanation: {
        headline: "漏没有上下",
        body: "S1 是父漏到子。这一镜是子漏到父。下一镜给子加上 scoped。",
      },
      faqs: [
        { q: "那子还能涂自己吗？", a: "能。下一镜 scoped 之后，只有乙粉。" },
      ],
      tryThis: "甲和乙必须都是粉。粉来自子的文件。",
      mapping: [{ code: "子 <style> 无 scoped", runtime: "全局选择器", ui: "甲也粉" }],
    },
    {
      id: "scoped-s4",
      tick: "S4",
      title: "子 scoped，只涂乙",
      goal: "Panel <style scoped>。.me 粉色。App 没有样式。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "子加上 scoped。甲会？",
        choices: [
          { id: "stop", label: "甲回到默认。只有乙粉", correct: true, why: "指纹在子的节点上。甲没有这枚。" },
          { id: "both", label: "仍都粉。子 scoped 管不了已经漏出去的", correct: false, why: "这一镜子从一开始就 scoped，没有漏。" },
          { id: "a", label: "只有甲粉。scoped 会交给父", correct: false, why: "scoped 不交给任何人。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appChildScoped, "src/Panel.vue": panelScoped },
        blocks: [{ id: "child", label: "⑤ 子 scoped" }],
        narration: "同一行粉色。只多了 scoped。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "默认色" },
          { id: "b", label: "乙", value: "粉" },
        ],
        events: [],
      },
      nodes: [
        { id: "css", kind: "script", label: "子 scoped" },
        { id: "b", kind: "dom", label: "乙 粉" },
      ],
      edges: [{ from: "css", to: "b" }],
      explanation: {
        headline: "每一层自己的指纹",
        body: "下一镜两层都 scoped：甲粉，乙绿。各涂各的。",
      },
      faqs: [
        { q: "两层都叫 .me 会不会撞？", a: "scoped 之后不会。选择器带着不同的 data-v。" },
      ],
      tryThis: "乙必须粉。甲必须是默认浅色。",
      mapping: [{ code: "子 <style scoped>", runtime: ".me[data-v-子]", ui: "只有乙粉" }],
    },
    {
      id: "scoped-s5",
      tick: "S5",
      title: "两份 scoped，两种颜色",
      goal: "App scoped 粉。Panel scoped 绿。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "甲和乙会？",
        choices: [
          { id: "split", label: "甲粉，乙绿。指纹把两行 CSS 隔开", correct: true, why: "两份选择器认两枚不同的属性。" },
          { id: "pink", label: "都粉。父会盖住子", correct: false, why: "父的选择器匹配不到乙。" },
          { id: "green", label: "都绿。后写的文件赢", correct: false, why: "不是层叠顺序的问题。是选择器根本认不到对方。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appBoth, "src/Panel.vue": panelGreen },
        blocks: [{ id: "both", label: "⑥ 各涂各的" }],
        narration: "同样的 class 名。两枚指纹，两张脸。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "粉" },
          { id: "b", label: "乙", value: "绿" },
        ],
        events: [],
      },
      nodes: [
        { id: "p", kind: "script", label: "父 scoped 粉" },
        { id: "c", kind: "script", label: "子 scoped 绿" },
        { id: "a", kind: "dom", label: "甲" },
        { id: "b", kind: "dom", label: "乙" },
      ],
      edges: [
        { from: "p", to: "a" },
        { from: "c", to: "b" },
      ],
      explanation: {
        headline: "同名 class，不同指纹",
        body: "下一镜拆三种：父漏下去、子漏上来、两份 scoped。",
      },
      faqs: [
        { q: "那父想涂乙怎么办？", a: "下一课 :deep()。scoped 先把边界立住，穿透是另一条边。" },
      ],
      tryThis: "甲必须粉。乙必须绿。不要两人同色。",
      mapping: [{ code: "两份 scoped .me", runtime: "两枚 data-v", ui: "甲粉乙绿" }],
    },
    {
      id: "scoped-s6",
      tick: "S6",
      title: "拆成漏下去 / 漏上来 / 各涂各的",
      goal: "对照：父全局、子全局、两份 scoped。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到两份 scoped。甲和乙会？",
        choices: [
          { id: "split", label: "甲粉乙绿", correct: true, why: "先确认好的脸。" },
          { id: "pink", label: "都粉", correct: false, why: "那是漏。" },
          { id: "none", label: "都默认", correct: false, why: "两行 CSS 都在。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appBoth, "src/Panel.vue": panelGreen },
        blocks: [{ id: "keep", label: "各涂各的先留着" }],
        narration: "先看见甲粉乙绿。再分别：父漏下去、子漏上来、只给子 scoped。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "粉" },
          { id: "b", label: "乙", value: "绿" },
        ],
        events: [],
      },
      nodes: [
        { id: "p", kind: "script", label: "父" },
        { id: "c", kind: "script", label: "子" },
      ],
      edges: [{ from: "p", to: "c", label: "隔开" }],
      ablations: [
        {
          id: "down",
          prompt: "如果父去掉 scoped？",
          files: { "src/App.vue": appLeak, "src/Panel.vue": panelBare },
          expected: { kind: "stale", message: "甲乙都粉。父漏下去。" },
          lesson: "没有指纹，选择器不认边界。",
        },
        {
          id: "up",
          prompt: "如果样式写在子里且没有 scoped？",
          files: { "src/App.vue": appFromChild, "src/Panel.vue": panelLeak },
          expected: { kind: "stale", message: "甲乙都粉。子漏上来。" },
          lesson: "漏没有上下。",
        },
        {
          id: "child",
          prompt: "如果只有子 scoped，父没有样式？",
          files: { "src/App.vue": appChildScoped, "src/Panel.vue": panelScoped },
          expected: { kind: "stale", message: "只有乙粉。甲是默认色。" },
          lesson: "每一层自己的指纹。",
        },
      ],
      explanation: {
        headline: "漏下去、漏上来、隔开",
        body: "三张脸，三种原因。下一课父就是想涂乙：:deep 是专门的穿透。",
      },
      tryThis: "三种消融：都粉（父）、都粉（子）、只有乙粉。对上号再恢复甲粉乙绿。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先父漏下去，再子漏上来，再只有子 scoped。" },
      ],
    },
    {
      id: "scoped-s7",
      tick: "S7",
      title: "换：价钱",
      goal: "Price 里也是 .me。父的样式没有 scoped。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "父给 .me 上粉色。价钱会？",
        choices: [
          { id: "both", label: "甲和 36 元都粉。和乙那一课同一张漏", correct: true, why: "换了组件，没有 scoped 的边还在。" },
          { id: "a", label: "只有甲粉。价钱在别的文件", correct: false, why: "CSS 不认文件，认选择器。" },
          { id: "none", label: "价钱报错", correct: false, why: "能跑。只是被涂上了。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore, "src/Price.vue": priceBare },
        blocks: [{ id: "price", label: "换场景：价钱" }],
        narration: "乙换成价钱。问的仍是：颜色有没有漏。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "粉" },
          { id: "p", label: "36 元", value: "粉" },
        ],
        events: [],
      },
      nodes: [
        { id: "css", kind: "script", label: "父 .me" },
        { id: "p", kind: "dom", label: "价钱 粉" },
      ],
      edges: [{ from: "css", to: "p", label: "漏" }],
      ablations: [
        {
          id: "fix",
          prompt: "给父加上 scoped 之后？",
          files: { "src/App.vue": transferFixed, "src/Price.vue": priceBare },
          expected: {
            kind: "stale",
            message: "这是修复：只有甲粉。36 元回到默认色。",
          },
          lesson: "下一课：父如果就是想涂价钱，要用 :deep。",
        },
      ],
      explanation: {
        headline: "样式也有组件边界",
        body: "没有 scoped 会漏。有 scoped 就停。下一课穿透是你故意开的口，不是漏。",
      },
      faqs: [
        { q: "能不能让颜色跟按钮走？", a: "能。CSS 里写 color: v-bind(color)。那是另一条边：响应式进了样式表。" },
      ],
      tryThis: "先看甲和价钱都粉。再打开修复：只有甲粉。",
      mapping: [
        { code: "无 scoped", runtime: "全局", ui: "甲和价钱都粉" },
        { code: "scoped", runtime: "只认甲", ui: "价钱默认" },
      ],
    },
  ],
};
