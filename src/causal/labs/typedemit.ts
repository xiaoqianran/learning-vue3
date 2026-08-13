import type { CausalLab, CounterfactualWorld } from "../types";

const childLoose = `<script setup>
const emit = defineEmits(['add'])
</script>
<template>
  <button @click="emit('add', 1)">+1</button>
</template>
`;

const appAdd = `<script setup>
import { ref } from 'vue'
import Plus from './Plus.vue'
const total = ref(0)
</script>
<template>
  <p class="card">合计 {{ total }}</p>
  <p class="probe">typeof total：{{ typeof total }}</p>
  <Plus @add="total += $event" />
</template>
`;

const childString = `<script setup>
const emit = defineEmits(['add'])
</script>
<template>
  <button @click="emit('add', '1')">+1</button>
</template>
`;

const childTyped = `<script setup lang="ts">
const emit = defineEmits<{
  add: [n: number]
}>()
</script>
<template>
  <button @click="emit('add', 1)">+1</button>
</template>
`;

const childWrongName = `<script setup lang="ts">
const emit = defineEmits<{
  add: [n: number]
}>()
</script>
<template>
  <button @click="emit('plus', 1)">+1</button>
</template>
`;

const childNoPayload = `<script setup lang="ts">
const emit = defineEmits<{
  add: [n: number]
}>()
</script>
<template>
  <button @click="emit('add')">+1</button>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
import Like from './Like.vue'
const liked = ref(0)
</script>
<template>
  <p class="card">喜欢 {{ liked }}</p>
  <Like @bump="liked += $event" />
</template>
`;

const likeLoose = `<script setup>
const emit = defineEmits(['bump'])
</script>
<template>
  <button @click="emit('bump', '1')">喜欢</button>
</template>
`;

const likeTyped = `<script setup lang="ts">
const emit = defineEmits<{
  bump: [n: number]
}>()
</script>
<template>
  <button @click="emit('bump', 1)">喜欢</button>
</template>
`;

const worldNum: CounterfactualWorld = {
  id: "num",
  name: "送出数字 1",
  tagline: "emit('add', 1)",
  files: { "src/App.vue": appAdd, "src/Plus.vue": childLoose },
  nodes: [
    { id: "emit", kind: "event", label: "add" },
    { id: "dom", kind: "dom", label: "1" },
  ],
  edges: [{ from: "emit", to: "dom", label: "数字" }],
  note: "0 + 1 是 1。种类对了。",
};

const worldStr: CounterfactualWorld = {
  id: "str",
  name: "送出字符串 '1'",
  tagline: "emit('add', '1')",
  files: { "src/App.vue": appAdd, "src/Plus.vue": childString },
  nodes: [
    { id: "emit", kind: "event", label: "add" },
    { id: "dom", kind: "dom", label: "01" },
  ],
  edges: [{ from: "emit", to: "dom", label: "字符串" }],
  note: "0 + '1' 是 '01'。同一条 +=，种类换了脸。",
};

export const TYPEDEMIT_LAB: CausalLab = {
  id: "typedemit",
  world: 8,
  concept: "defineEmits",
  title: "出去的那一票也有形状",
  subtitle: "emit 是出口契约。名字要对，payload 的种类也要对。",
  promise:
    "一镜一条边：先送出数字 1，再送出字符串 '1' 变成 01，再只声明名字，再写成泛型，再喊错名字，再不带 payload。",
  minutes: 16,
  official: "/guide/typescript/composition-api.html",
  scenes: [
    {
      id: "typedemit-s0",
      tick: "S0",
      title: "送出数字 1",
      goal: "子 emit('add', 1)。父 total += $event。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appAdd, "src/Plus.vue": childLoose },
        blocks: [{ id: "num", label: "① emit 数字" }],
        narration: "World 2 已经会 emit。这一课问 payload 是哪种东西。先看对的脸。",
      },
      observe: {
        state: [{ id: "t", label: "total", value: "0 → 1", symbol: "total" }],
        dom: [{ id: "card", label: ".card", value: "1" }],
        events: [{ id: "click", label: "click", value: "emit('add', 1)" }],
      },
      nodes: [
        { id: "btn", kind: "event", label: "click" },
        { id: "emit", kind: "script", label: "add", symbol: "add" },
        { id: "total", kind: "ref", label: "total", symbol: "total" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "btn", to: "emit" },
        { from: "emit", to: "total", label: "+1" },
        { from: "total", to: "dom" },
      ],
      explanation: {
        headline: "出口也是一条赋值",
        body: "父用 += 接住。现在 payload 是数字，合计从 0 到 1。下一镜只改送出去的种类。",
      },
      tryThis: "点 +1。合计必须变成 1。探针仍是 number。",
      faqs: [
        { q: "为什么用 += 而不是赋值？", a: "+= 会把字符串加法露出来。下一镜就靠它。" },
      ],
    },
    {
      id: "typedemit-s1",
      tick: "S1",
      title: "送出字符串 '1'",
      goal: "emit('add', '1')。父那一行不变。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点一次。合计从 0 出发。会？",
        choices: [
          { id: "one", label: "仍是 1。字面上是 1", correct: false, why: "0 + '1' 会把左边也变成字符串，得到 '01'。" },
          { id: "join", label: "变成 01。字符串加法", correct: true, why: "payload 的种类换了。父仍用 +=，于是脸换了。" },
          { id: "err", label: "报错：不能 emit 字符串", correct: false, why: "现在只有事件名，没有 payload 契约。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appAdd, "src/Plus.vue": childString },
        blocks: [{ id: "str", label: "② payload 改成 '1'" }],
        narration: "只改引号。父不知道。",
      },
      counterfactual: {
        id: "payload-kind",
        title: "数字 vs 字符串",
        setup: "同一行 +=。差在 emit 的第二项。",
        worlds: [worldNum, worldStr],
        punchline: "事件名对了还不够。箱子里装的是什么，合计才知道怎么加。",
      },
      observe: {
        state: [{ id: "t", label: "total", value: "'01'", symbol: "total" }],
        dom: [{ id: "card", label: ".card", value: "01" }],
        events: [{ id: "click", label: "click", value: "emit('add', '1')" }],
      },
      nodes: [
        { id: "emit", kind: "script", label: "add '1'" },
        { id: "total", kind: "ref", label: "total", symbol: "total" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "emit", to: "total", label: "字符串" },
        { from: "total", to: "dom" },
      ],
      why: {
        question: "和上一课 n=\"3\" 变成 33，是同一张图吗？",
        choices: [
          { id: "same", label: "是。都是种类错了，加法先露馅", correct: true, why: "上一课错在入口。这一课错在出口。+= 和 + 是同一面镜子。" },
          { id: "diff", label: "不是。emit 总是传数字", correct: false, why: "emit 传你给的东西。没有契约就没有种类。" },
          { id: "vue", label: "Vue 会把事件参数转成 Number", correct: false, why: "不会。" },
        ],
      },
      explanation: {
        headline: "出口的种类也会污染父",
        body: "子随口送一个字符串，父的 total 从此不再是数字。下一镜先看：只声明名字，拦不住这件事。",
      },
      faqs: [
        { q: "点第二次呢？", a: "'01' + '1' 变成 '011'。谎言会变长。" },
      ],
      tryThis: "点 +1。合计必须是 01，不是 1。打开反事实对比数字版。",
      mapping: [{ code: "emit('add', '1')", runtime: "0 + '1'", ui: "01" }],
    },
    {
      id: "typedemit-s2",
      tick: "S2",
      title: "只有名字的契约",
      goal: "defineEmits(['add'])。仍送出 '1'。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "声明了事件名 add。payload 仍是 '1'。会？",
        choices: [
          { id: "join", label: "仍是 01。名字不等于种类", correct: true, why: "数组写法只登记频道。箱子里装什么，它不管。" },
          { id: "one", label: "变成 1。登记了就会转换", correct: false, why: "和 type: Number 同一类误会：登记不是管道。" },
          { id: "err", label: "未声明 payload，emit 会被丢掉", correct: false, why: "会送出去。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appAdd, "src/Plus.vue": childString },
        blocks: [{ id: "name", label: "③ 仍是 defineEmits(['add'])" }],
        narration: "这一镜代码几乎没变。请认清：你已经有「名字契约」，仍没有「种类契约」。",
      },
      observe: {
        state: [{ id: "t", label: "total", value: "仍会变 01" }],
        dom: [{ id: "card", label: ".card", value: "01" }],
        events: [],
      },
      nodes: [
        { id: "names", kind: "script", label: "['add']" },
        { id: "dom", kind: "dom", label: "01" },
      ],
      edges: [{ from: "names", to: "dom", label: "不管箱子" }],
      explanation: {
        headline: "名字是频道，payload 是箱子",
        body: "defineEmits(['add']) 只保证有人听 add。下一镜把箱子的种类写进泛型。",
      },
      faqs: [
        { q: "defineEmits({ add: null }) 呢？", a: "仍是运行时校验口。给 payload 写 validator 才能在浏览器里喊。TS 泛型不在浏览器里喊。" },
      ],
      tryThis: "再点一次，仍应得到 01。名字对了，种类仍错。",
      mapping: [{ code: "defineEmits(['add'])", runtime: "只登记频道", ui: "01 照旧" }],
    },
    {
      id: "typedemit-s3",
      tick: "S3",
      title: "payload 写成 number",
      goal: "defineEmits<{ add: [n: number] }>()。送回数字 1。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "泛型要求 number，emit('add', 1)。点一次会？",
        choices: [
          { id: "one", label: "合计 1。种类对了", correct: true, why: "和 S0 同一张脸。泛型是给下一处写 '1' 准备的红线。" },
          { id: "magic", label: "1。而且以后再写 '1' 也会被转成数字", correct: false, why: "类型会擦掉。运行时不会转换。" },
          { id: "err", label: "预览不懂这种写法，按钮没了", correct: false, why: "会擦掉再跑。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appAdd, "src/Plus.vue": childTyped },
        blocks: [{ id: "gen", label: "④ add: [n: number]" }],
        narration: "箱子的种类写进类型。送出去的重新是数字。",
      },
      observe: {
        state: [{ id: "t", label: "total", value: "1", symbol: "total" }],
        dom: [{ id: "card", label: ".card", value: "1" }],
        events: [],
      },
      nodes: [
        { id: "type", kind: "script", label: "[n: number]" },
        { id: "emit", kind: "event", label: "add" },
        { id: "dom", kind: "dom", label: "1" },
      ],
      edges: [
        { from: "type", to: "emit", label: "契约" },
        { from: "emit", to: "dom" },
      ],
      explanation: {
        headline: "元组就是箱子的形状",
        body: "add: [n: number] 表示：这个事件带一个数字参数。IDE 里 emit('add', '1') 会红。预览里你已经见过 01 那张脸。",
      },
      faqs: [
        { q: "为什么是元组不是 add: number？", a: "事件可以有多个参数。元组按位置排。add: [id: string, n: number]。" },
      ],
      tryThis: "点 +1。合计必须是 1，探针是 number。",
      mapping: [{ code: "add: [n: number]", runtime: "擦掉后仍是 emit", ui: "1" }],
    },
    {
      id: "typedemit-s4",
      tick: "S4",
      title: "喊错名字",
      goal: "emit('plus', 1)。父仍听 @add。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点按钮。合计会？",
        choices: [
          { id: "one", label: "变成 1。名字接近就会送到", correct: false, why: "事件名是精确匹配。plus 不是 add。" },
          { id: "stay", label: "仍是 0。没有人听 plus", correct: true, why: "频道空了。payload 再对也进不了父。" },
          { id: "err", label: "TS 会让按钮点不了", correct: false, why: "IDE 会红。预览仍能点。脸是：合计不动。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appAdd, "src/Plus.vue": childWrongName },
        blocks: [{ id: "name", label: "⑤ emit('plus')" }],
        narration: "种类对了。频道错了。",
      },
      observe: {
        state: [{ id: "t", label: "total", value: "0" }],
        dom: [{ id: "card", label: ".card", value: "0" }],
        events: [{ id: "click", label: "click", value: "plus（无人听）" }],
      },
      nodes: [
        { id: "plus", kind: "event", label: "plus" },
        { id: "add", kind: "script", label: "@add" },
        { id: "dom", kind: "dom", label: "0" },
      ],
      edges: [{ from: "plus", to: "dom", label: "没接上" }],
      explanation: {
        headline: "名字和种类是两条边",
        body: "World 2：没人听 emit。这一课加上：听对了，箱子种类还可能错。下一镜：名字对，箱子是空的。",
      },
      faqs: [
        { q: "泛型里没写 plus，为什么还能 emit？", a: "TS 会红。运行时 $emit / emit() 仍是普通函数。预览擦掉类型，所以能喊出声。" },
      ],
      tryThis: "多点几次。合计必须一直是 0。",
      mapping: [{ code: "emit('plus', 1)", runtime: "没有监听者", ui: "0" }],
    },
    {
      id: "typedemit-s5",
      tick: "S5",
      title: "名字对，箱子是空的",
      goal: "emit('add')。不传第二项。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点一次。total += undefined。合计会？",
        choices: [
          { id: "one", label: "当成 +1", correct: false, why: "没有默认 payload。" },
          { id: "nan", label: "变成 NaN", correct: true, why: "0 + undefined 是 NaN。之后再加也还是 NaN。" },
          { id: "stay", label: "仍是 0。undefined 会被忽略", correct: false, why: "+= 不会忽略。它会把数字变成 NaN。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appAdd, "src/Plus.vue": childNoPayload },
        blocks: [{ id: "empty", label: "⑥ emit('add') 不带参数" }],
        narration: "频道对了。箱子没装。",
      },
      observe: {
        state: [{ id: "t", label: "total", value: "NaN" }],
        dom: [{ id: "card", label: ".card", value: "NaN" }],
        events: [],
      },
      nodes: [
        { id: "emit", kind: "event", label: "add()" },
        { id: "total", kind: "ref", label: "total" },
        { id: "dom", kind: "dom", label: "NaN" },
      ],
      edges: [{ from: "emit", to: "dom", label: "undefined" }],
      explanation: {
        headline: "缺席的 payload 也是一种值",
        body: "和 props 漏传变成 NaN 同一张脸，方向相反：这次是子没给，父仍 +=。元组 [n: number] 的意思是：这一项必须在。",
      },
      faqs: [
        { q: "可选参数怎么写？", a: "add: [n?: number]。那是允许缺席。缺席之后父还用 +=，仍会 NaN。父也要会填洞。" },
      ],
      tryThis: "点 +1。合计必须变成 NaN。和 01、和 0 都不同。",
      mapping: [{ code: "emit('add')", runtime: "undefined", ui: "NaN" }],
    },
    {
      id: "typedemit-s6",
      tick: "S6",
      title: "拆成字符串 / 错名 / 空箱子",
      goal: "三种坏法：'1'、plus、不带参数。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到 emit('add', '1')。点一次会？",
        choices: [
          { id: "one", label: "1", correct: false, why: "S1。" },
          { id: "join", label: "01", correct: true, why: "字符串加法。" },
          { id: "nan", label: "NaN", correct: false, why: "那是空箱子。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appAdd, "src/Plus.vue": childTyped },
        blocks: [{ id: "keep", label: "数字版先留着" }],
        narration: "先点成 1。再分别：字符串、错名、空箱子。",
      },
      observe: {
        state: [{ id: "ok", label: "total", value: "数字" }],
        dom: [{ id: "card", label: ".card", value: "1" }],
        events: [],
      },
      nodes: [
        { id: "emit", kind: "event", label: "add: [n: number]" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "emit", to: "dom" }],
      ablations: [
        {
          id: "str",
          prompt: "如果送出 '1'？",
          files: { "src/App.vue": appAdd, "src/Plus.vue": childString },
          expected: { kind: "stale", message: "01。种类错了。" },
          lesson: "名字对，箱子错。",
        },
        {
          id: "plus",
          prompt: "如果喊 plus？",
          files: { "src/App.vue": appAdd, "src/Plus.vue": childWrongName },
          expected: { kind: "stale", message: "合计不动。频道错了。" },
          lesson: "箱子对，名字错。",
        },
        {
          id: "empty",
          prompt: "如果不带参数？",
          files: { "src/App.vue": appAdd, "src/Plus.vue": childNoPayload },
          expected: { kind: "stale", message: "NaN。箱子是空的。" },
          lesson: "频道对，箱子缺席。",
        },
      ],
      explanation: {
        headline: "出口的三种死法",
        body: "种类错、名字错、缺席。defineEmits 泛型把三件都写成契约。预览里你用三张脸核对。",
      },
      tryThis: "三种消融都点一次：01、0、NaN。对上号再恢复。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先字符串（种类），再 plus（频道），再空箱子（缺席）。和 props 那三件对称。" },
      ],
    },
    {
      id: "typedemit-s7",
      tick: "S7",
      title: "换：喜欢 +1",
      goal: "点喜欢时 emit('bump', '1')。父 liked += $event。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "payload 是字符串 '1'。点一次会？",
        choices: [
          { id: "one", label: "喜欢 1", correct: false, why: "又是 0 + '1'。" },
          { id: "join", label: "喜欢 01", correct: true, why: "和 add 同一张图。换了事件名，种类边还在。" },
          { id: "err", label: "报错", correct: false, why: "能跑。句子骗人。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore, "src/Like.vue": likeLoose },
        blocks: [{ id: "like", label: "换场景：喜欢" }],
        narration: "合计换成喜欢。问的仍是箱子里是哪种 1。",
      },
      observe: {
        state: [{ id: "l", label: "liked", value: "将变成 01" }],
        dom: [{ id: "card", label: ".card", value: "01" }],
        events: [],
      },
      nodes: [
        { id: "bump", kind: "event", label: "bump" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "bump", to: "dom" }],
      ablations: [
        {
          id: "fix",
          prompt: "改成 bump: [n: number] 并送出 1 之后？",
          files: { "src/App.vue": transferBefore, "src/Like.vue": likeTyped },
          expected: {
            kind: "stale",
            message: "这是修复：喜欢 1。种类对了。",
          },
          lesson: "下一课：provide/inject 的钥匙也可以不是字符串。",
        },
      ],
      explanation: {
        headline: "入口和出口都要说出种类",
        body: "props 进来，emit 出去。下一课树中间不再传 props：钥匙本身也可以是类型。",
      },
      faqs: [
        { q: "父写成 Number($event) 行吗？", a: "能修脸。但把子的谎言吞了。契约应该写在 emit 上。" },
      ],
      tryThis: "先点出 01。再打开修复：必须是 1。",
      mapping: [
        { code: "emit('bump', '1')", runtime: "0 + '1'", ui: "01" },
        { code: "bump: [n: number]", runtime: "0 + 1", ui: "1" },
      ],
    },
  ],
};
