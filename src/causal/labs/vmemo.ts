import type { CausalLab, CounterfactualWorld } from "../types";

const bothLive = `<script setup>
import { ref } from 'vue'
const n = ref(0)
const m = ref(0)
</script>
<template>
  <p class="hint">一张卡，两个数，都活着</p>
  <p class="card">n {{ n }} · m {{ m }}</p>
  <button @click="n++">n+1</button>
  <button @click="m++">m+1</button>
</template>
`;

const memoN = `<script setup>
import { ref } from 'vue'
const n = ref(0)
const m = ref(0)
</script>
<template>
  <p class="hint">v-memo="[n]" · 只盯 n</p>
  <p v-memo="[n]" class="card">n {{ n }} · m {{ m }}</p>
  <button @click="n++">n+1</button>
  <button @click="m++">m+1</button>
</template>
`;

const memoBoth = `<script setup>
import { ref } from 'vue'
const n = ref(0)
const m = ref(0)
</script>
<template>
  <p class="hint">v-memo="[n, m]" · 两个都盯</p>
  <p v-memo="[n, m]" class="card">n {{ n }} · m {{ m }}</p>
  <button @click="n++">n+1</button>
  <button @click="m++">m+1</button>
</template>
`;

const memoEmpty = `<script setup>
import { ref } from 'vue'
const n = ref(0)
const m = ref(0)
</script>
<template>
  <p class="hint">v-memo="[]" · 名单是空的</p>
  <p v-memo="[]" class="card">n {{ n }} · m {{ m }}</p>
  <button @click="n++">n+1</button>
  <button @click="m++">m+1</button>
</template>
`;

const memoWrap = `<script setup>
import { ref } from 'vue'
const n = ref(0)
const m = ref(0)
</script>
<template>
  <p class="hint">v-memo="[n]" 包住两行</p>
  <div v-memo="[n]">
    <p class="card">n {{ n }}</p>
    <p class="card">m {{ m }}</p>
  </div>
  <button @click="n++">n+1</button>
  <button @click="m++">m+1</button>
</template>
`;

const memoOneOfTwo = `<script setup>
import { ref } from 'vue'
const n = ref(0)
const m = ref(0)
</script>
<template>
  <p class="hint">只有上面钉名单</p>
  <p v-memo="[n]" class="card">钉 {{ n }} / {{ m }}</p>
  <p class="card">活 {{ n }} / {{ m }}</p>
  <button @click="n++">n+1</button>
  <button @click="m++">m+1</button>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const price = ref(36)
const tag = ref('早鸟')
</script>
<template>
  <p class="hint">价钱和标签都活着</p>
  <p class="card">{{ price }} 元 · {{ tag }}</p>
  <button @click="price++">涨价</button>
  <button @click="tag = tag === '早鸟' ? '普通' : '早鸟'">换标签</button>
</template>
`;

const transferFixed = `<script setup>
import { ref } from 'vue'
const price = ref(36)
const tag = ref('早鸟')
</script>
<template>
  <p class="hint">只盯价钱。换标签不重画</p>
  <p v-memo="[price]" class="card">{{ price }} 元 · {{ tag }}</p>
  <button @click="price++">涨价</button>
  <button @click="tag = tag === '早鸟' ? '普通' : '早鸟'">换标签</button>
</template>
`;

const worldLive: CounterfactualWorld = {
  id: "live",
  name: "没有 v-memo",
  tagline: "m+1 也更新",
  files: { "src/App.vue": bothLive },
  nodes: [
    { id: "m", kind: "ref", label: "m" },
    { id: "dom", kind: "dom", label: "m 1" },
  ],
  edges: [{ from: "m", to: "dom" }],
  note: "点 m+1，卡片上的 m 变成 1。",
};

const worldMemo: CounterfactualWorld = {
  id: "memo",
  name: "v-memo=\"[n]\"",
  tagline: "m 冻住",
  files: { "src/App.vue": memoN },
  nodes: [
    { id: "m", kind: "ref", label: "m" },
    { id: "dom", kind: "dom", label: "m 0" },
  ],
  edges: [{ from: "m", to: "dom", label: "名单没变" }],
  note: "m 变了，但名单里只有 n。这一棵子树跳过。",
};

export const VMEMO_LAB: CausalLab = {
  id: "vmemo",
  world: 16,
  concept: "v-memo",
  title: "名单没变，就不必画",
  subtitle: "v-memo 带一份依赖名单。名单和上次一样，这棵子树跳过。空名单等于 v-once。",
  promise:
    "一镜一条边：先两个数都活着，再只盯 n 时 m 冻住，再名单写上 m 就跟着走，再空名单永远钉住，再包一层 m 那行也冻，再旁边一张不受影响。",
  minutes: 16,
  official: "/api/built-in-directives.html#v-memo",
  scenes: [
    {
      id: "vmemo-s0",
      tick: "S0",
      title: "两个数都活着",
      goal: "卡片 n {{ n }} · m {{ m }}。没有 v-memo。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": bothLive },
        blocks: [{ id: "live", label: "① 都活着" }],
        narration: "上一课 v-once 永远不画。这一课想：有时要画，有时跳过。先看两个按钮都能改卡片。",
      },
      observe: {
        state: [
          { id: "n", label: "n", value: "0" },
          { id: "m", label: "m", value: "0" },
        ],
        dom: [{ id: "card", label: ".card", value: "n 0 · m 0" }],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n" },
        { id: "m", kind: "ref", label: "m" },
        { id: "dom", kind: "dom", label: "卡片" },
      ],
      edges: [
        { from: "n", to: "dom" },
        { from: "m", to: "dom" },
      ],
      explanation: {
        headline: "两份值，一条更新边",
        body: "下一镜加上 v-memo=\"[n]\"。点 m+1，看 m 还跟不跟。",
      },
      tryThis: "点 m+1。卡片必须变成 n 0 · m 1。再点 n+1，必须变成 n 1 · m 1。",
      faqs: [
        { q: "和 v-once 有什么不同？", a: "v-once 没有名单。这一课名单说了算。" },
      ],
    },
    {
      id: "vmemo-s1",
      tick: "S1",
      title: "只盯 n，m 冻住",
      goal: "v-memo=\"[n]\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点 m+1。卡片上的 m 会？",
        choices: [
          { id: "zero", label: "仍是 0。名单里没有 m，跳过这一棵", correct: true, why: "v-memo 拿这次的 [n] 和上次比。n 没变，整段不画。m 已经是 1，画面不知道。" },
          { id: "one", label: "变成 1。模板写了 m 就会跟", correct: false, why: "写了不等于这一帧会画。名单先拦。" },
          { id: "n", label: "n 变成 1。点错按钮也会改 n", correct: false, why: "点的是 m+1。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": memoN },
        blocks: [{ id: "n", label: "② 名单只有 n" }],
        narration: "m 变了。名单说：n 没变，不必画。",
      },
      counterfactual: {
        id: "live-vs-memo",
        title: "都活 vs 只盯 n",
        setup: "都点 m+1。差在有没有 v-memo=\"[n]\"。",
        worlds: [worldLive, worldMemo],
        punchline: "不是 m 冻住了。是这棵树决定这一帧不画。",
      },
      observe: {
        state: [
          { id: "n", label: "n", value: "0" },
          { id: "m", label: "m", value: "1（画面仍 0）" },
        ],
        dom: [{ id: "card", label: ".card", value: "n 0 · m 0" }],
        events: [],
      },
      nodes: [
        { id: "memo", kind: "script", label: "v-memo [n]", symbol: "v-memo" },
        { id: "dom", kind: "dom", label: "m 0" },
      ],
      edges: [{ from: "memo", to: "dom", label: "跳过" }],
      explanation: {
        headline: "名单是通行证",
        body: "下一镜把 m 写进名单。点 m+1，卡片就跟。",
      },
      faqs: [
        { q: "再点 n+1 呢？", a: "n 变了，名单变了，这一帧会画。你会同时看见新的 n 和已经加过的 m。" },
      ],
      tryThis: "只点 m+1。卡片必须仍是 n 0 · m 0。打开反事实。然后再点 n+1，m 才会跳到 1。",
      mapping: [{ code: "v-memo=\"[n]\"", runtime: "n 没变则跳过", ui: "m 画面冻住" }],
    },
    {
      id: "vmemo-s2",
      tick: "S2",
      title: "名单写上 m，就跟着走",
      goal: "v-memo=\"[n, m]\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点 m+1。卡片会？",
        choices: [
          { id: "one", label: "m 变成 1。名单里有 m", correct: true, why: "这一次 [n, m] 和上次不同。放行，画。" },
          { id: "zero", label: "仍是 0。v-memo 只要在就冻", correct: false, why: "那是空名单或 v-once。" },
          { id: "both", label: "n 也变成 1", correct: false, why: "没点 n。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": memoBoth },
        blocks: [{ id: "both", label: "③ 名单两个" }],
        narration: "同一张卡。只是通行证多盖了一个章。",
      },
      observe: {
        state: [{ id: "m", label: "m", value: "1" }],
        dom: [{ id: "card", label: ".card", value: "n 0 · m 1" }],
        events: [],
      },
      nodes: [
        { id: "memo", kind: "script", label: "[n, m]" },
        { id: "dom", kind: "dom", label: "m 1" },
      ],
      edges: [{ from: "memo", to: "dom", label: "放行" }],
      explanation: {
        headline: "写进名单的，才能叫醒它",
        body: "下一镜名单是 []。谁变都不画。那就是 v-once 的脸。",
      },
      faqs: [
        { q: "名单要写模板用到的每一个值吗？", a: "你想让谁能叫醒这次更新，就写谁。少写会漏更新；多写会少跳过。" },
      ],
      tryThis: "点 m+1。卡片必须变成 n 0 · m 1。",
      mapping: [{ code: "v-memo=\"[n, m]\"", runtime: "m 变则放行", ui: "m 1" }],
    },
    {
      id: "vmemo-s3",
      tick: "S3",
      title: "空名单，永远钉住",
      goal: "v-memo=\"[]\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点 n+1。卡片会？",
        choices: [
          { id: "zero", label: "仍是 0 · 0。空名单每次都相同", correct: true, why: "[] 和 [] 永远相等。等价于 v-once。" },
          { id: "n", label: "n 变成 1。空名单表示不限制", correct: false, why: "空不是不限制。空是「没有任何变化能叫醒」。" },
          { id: "err", label: "报错。名单不能空", correct: false, why: "合法。就是 v-once 的另一种写法。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": memoEmpty },
        blocks: [{ id: "empty", label: "④ 空名单" }],
        narration: "通行证上一个章都没有。每次对比都一样。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "1（画面仍 0）" }],
        dom: [{ id: "card", label: ".card", value: "n 0 · m 0" }],
        events: [],
      },
      nodes: [
        { id: "memo", kind: "script", label: "v-memo []" },
        { id: "dom", kind: "dom", label: "钉住" },
      ],
      edges: [{ from: "memo", to: "dom", label: "永远跳过" }],
      explanation: {
        headline: "空名单就是 v-once",
        body: "下一镜 v-memo=\"[n]\" 包住两行。m 那行自己没写指令，也会被跳过。",
      },
      faqs: [
        { q: "那还要 v-once 干什么？", a: "意思更直。v-memo=\"[]\" 是同一条边的另一种拼写。" },
      ],
      tryThis: "点 n+1 和 m+1。卡片必须仍是 n 0 · m 0。",
      mapping: [{ code: "v-memo=\"[]\"", runtime: "每次名单相同", ui: "永远第一次" }],
    },
    {
      id: "vmemo-s4",
      tick: "S4",
      title: "包一层，里面的 m 也跳过",
      goal: "div v-memo=\"[n]\" 包住 n 一行、m 一行。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点 m+1。m 那行会？",
        choices: [
          { id: "zero", label: "仍是 0。祖先的名单拦住整棵子树", correct: true, why: "和 v-once 包层同一张图。指令在祖先上。" },
          { id: "one", label: "变成 1。那一行没写 v-memo", correct: false, why: "子树一起跳过。" },
          { id: "n", label: "n 那行变成 1", correct: false, why: "点的是 m。n 没变，整棵都不画。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": memoWrap },
        blocks: [{ id: "wrap", label: "⑤ 包住" }],
        narration: "m 那行是无辜的。祖先说跳过，它也画不了。",
      },
      observe: {
        state: [{ id: "m", label: "m", value: "1（画面仍 0）" }],
        dom: [
          { id: "n", label: "n 行", value: "0" },
          { id: "m", label: "m 行", value: "0" },
        ],
        events: [],
      },
      nodes: [
        { id: "memo", kind: "script", label: "div v-memo [n]" },
        { id: "m", kind: "dom", label: "m 0" },
      ],
      edges: [{ from: "memo", to: "m", label: "子树" }],
      explanation: {
        headline: "名单拦的是子树",
        body: "下一镜两张卡，只有上面有 v-memo。下面那张点 m+1 仍会变。",
      },
      faqs: [
        { q: "点 n+1 呢？", a: "名单变了，两行一起画。m 会一次补上刚才加过的数。" },
      ],
      tryThis: "只点 m+1。两行都必须仍是 0。",
      mapping: [{ code: "<div v-memo=\"[n]\">", runtime: "子树跳过", ui: "m 行仍 0" }],
    },
    {
      id: "vmemo-s5",
      tick: "S5",
      title: "旁边那张不受影响",
      goal: "上面 v-memo=\"[n]\"。下面没有。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点 m+1。会？",
        choices: [
          { id: "split", label: "上面仍 0 / 0，下面变成 0 / 1", correct: true, why: "指令只拦写了它的那一棵。旁边还活着。" },
          { id: "both", label: "两张都冻。v-memo 是全局的", correct: false, why: "不是全局。是那颗节点。" },
          { id: "up", label: "上面变成 0 / 1。下面冻住", correct: false, why: "写了指令的才跳过。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": memoOneOfTwo },
        blocks: [{ id: "one", label: "⑥ 只拦一张" }],
        narration: "同一份 m。两张卡，两种寿命。",
      },
      observe: {
        state: [{ id: "m", label: "m", value: "1" }],
        dom: [
          { id: "a", label: "钉", value: "0 / 0" },
          { id: "b", label: "活", value: "0 / 1" },
        ],
        events: [],
      },
      nodes: [
        { id: "memo", kind: "script", label: "v-memo" },
        { id: "a", kind: "dom", label: "钉 0/0" },
        { id: "b", kind: "dom", label: "活 0/1" },
      ],
      edges: [{ from: "memo", to: "a", label: "跳过" }],
      explanation: {
        headline: "指令只认自己那棵",
        body: "下一镜拆三种：只盯 n、空名单、包层。",
      },
      faqs: [
        { q: "再点 n+1？", a: "上面放行，会画出 n 1 和已经是 1 的 m。下面也活，两张对齐。" },
      ],
      tryThis: "只点 m+1。上面必须 0 / 0，下面必须 0 / 1。",
      mapping: [{ code: "一张有 v-memo，一张没有", runtime: "只拦一棵", ui: "钉冻 / 活跟" }],
    },
    {
      id: "vmemo-s6",
      tick: "S6",
      title: "拆成只盯 n / 空名单 / 包层",
      goal: "对照：v-memo=\"[n]\"、[]、包住两行。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到 v-memo=\"[n]\"。点 m+1 会？",
        choices: [
          { id: "zero", label: "卡片仍是 0 · 0", correct: true, why: "先确认好的脸。" },
          { id: "one", label: "m 变成 1", correct: false, why: "那是名单里有 m。" },
          { id: "n", label: "n 变成 1", correct: false, why: "没点 n。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": memoN },
        blocks: [{ id: "keep", label: "只盯 n 先留着" }],
        narration: "先点 m+1 看见冻住。再分别：名单加上 m、空名单、包层。",
      },
      observe: {
        state: [],
        dom: [{ id: "card", label: ".card", value: "n 0 · m 0" }],
        events: [],
      },
      nodes: [
        { id: "memo", kind: "script", label: "[n]" },
        { id: "dom", kind: "dom", label: "冻住" },
      ],
      edges: [{ from: "memo", to: "dom" }],
      ablations: [
        {
          id: "both",
          prompt: "如果名单写成 [n, m]？",
          files: { "src/App.vue": memoBoth },
          expected: { kind: "stale", message: "点 m+1，卡片变成 n 0 · m 1。" },
          lesson: "写进名单的才能叫醒。",
        },
        {
          id: "empty",
          prompt: "如果名单是 []？",
          files: { "src/App.vue": memoEmpty },
          expected: { kind: "stale", message: "点 n+1 也仍是 0 · 0。空名单就是 v-once。" },
          lesson: "空名单永远相同。",
        },
        {
          id: "wrap",
          prompt: "如果 v-memo=\"[n]\" 包住两行？",
          files: { "src/App.vue": memoWrap },
          expected: { kind: "stale", message: "点 m+1，两行都仍是 0。" },
          lesson: "名单拦的是子树。",
        },
      ],
      explanation: {
        headline: "少写、空写、包住",
        body: "三张冻住或不冻，三种名单。下一课把名单写到 v-for 的每一项上。",
      },
      tryThis: "三种消融：m 跟着走、永远 0、两行都 0。对上号再恢复：点 m+1 卡片仍 0 · 0。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先加上 m，再空名单，再包层。" },
      ],
    },
    {
      id: "vmemo-s7",
      tick: "S7",
      title: "换：标价和标签",
      goal: "卡片 {{ price }} 元 · {{ tag }}。没有 v-memo。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "点「换标签」。卡片会？",
        choices: [
          { id: "tag", label: "变成普通。两个值都活着", correct: true, why: "换了文案，默认每帧都画。" },
          { id: "stay", label: "仍是早鸟。标签该冻", correct: false, why: "这一镜还没写 v-memo。" },
          { id: "price", label: "价钱也变成 37", correct: false, why: "没点涨价。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "price", label: "换场景：标价" }],
        narration: "n/m 换成价钱和标签。问的仍是：谁有资格叫醒这次更新。",
      },
      observe: {
        state: [{ id: "t", label: "tag", value: "普通" }],
        dom: [{ id: "card", label: ".card", value: "36 元 · 普通" }],
        events: [],
      },
      nodes: [
        { id: "t", kind: "ref", label: "tag" },
        { id: "dom", kind: "dom", label: "普通" },
      ],
      edges: [{ from: "t", to: "dom" }],
      ablations: [
        {
          id: "fix",
          prompt: "加上 v-memo=\"[price]\" 之后？",
          files: { "src/App.vue": transferFixed },
          expected: {
            kind: "stale",
            message: "这是修复：换标签，卡片仍是早鸟。涨价才会重画，那时标签也会一次补上。",
          },
          lesson: "下一课：名单写到列表的每一项上，只有选中状态变了的那几行才画。",
        },
      ],
      explanation: {
        headline: "叫醒谁，由名单说了算",
        body: "标签变了你可以不画。价钱变了再画，连标签一起补。下一课这张图长到 v-for 上。",
      },
      faqs: [
        { q: "漏更新怎么办？", a: "把漏掉的值写进名单。v-memo 是性能刀，名单写错就是错脸。" },
      ],
      tryThis: "先换标签看「普通」。再打开修复：换标签必须仍是早鸟。",
      mapping: [
        { code: "没有 v-memo", runtime: "每帧都画", ui: "普通" },
        { code: "v-memo=\"[price]\"", runtime: "标签变不画", ui: "早鸟冻住" },
      ],
    },
  ],
};
