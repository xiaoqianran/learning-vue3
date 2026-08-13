import type { CausalLab, CounterfactualWorld } from "../types";

const childRuntime = `<script setup>
defineProps({
  n: { required: true },
})
</script>
<template>
  <p class="probe">typeof n：{{ typeof n }}</p>
  <p class="card">n + n = {{ n + n }}</p>
</template>
`;

const appNumber = `<script setup>
import Price from './Price.vue'
</script>
<template>
  <Price :n="3" />
</template>
`;

const appStringAttr = `<script setup>
import Price from './Price.vue'
</script>
<template>
  <Price n="3" />
</template>
`;

const childRuntimeNumber = `<script setup>
defineProps({
  n: { type: Number, required: true },
})
</script>
<template>
  <p class="probe">typeof n：{{ typeof n }}</p>
  <p class="card">n + n = {{ n + n }}</p>
</template>
`;

const childGeneric = `<script setup lang="ts">
defineProps<{
  n: number
}>()
</script>
<template>
  <p class="probe">typeof n：{{ typeof n }}</p>
  <p class="card">n + n = {{ n + n }}</p>
</template>
`;

const appMissing = `<script setup>
import Price from './Price.vue'
</script>
<template>
  <Price />
</template>
`;

const childDefaults = `<script setup lang="ts">
withDefaults(defineProps<{
  n?: number
}>(), {
  n: 0,
})
</script>
<template>
  <p class="probe">typeof n：{{ typeof n }}</p>
  <p class="card">n + n = {{ n + n }}</p>
</template>
`;

const childOptional = `<script setup lang="ts">
defineProps<{
  n?: number
}>()
</script>
<template>
  <p class="probe">typeof n：{{ typeof n }}</p>
  <p class="card">n + n = {{ n + n }}</p>
</template>
`;

const transferBefore = `<script setup>
import Tag from './Tag.vue'
</script>
<template>
  <Tag count="2" />
</template>
`;

const tagLoose = `<script setup>
defineProps({
  count: { required: true },
})
</script>
<template>
  <p class="card">还有 {{ count + 1 }} 件</p>
</template>
`;

const tagTyped = `<script setup lang="ts">
defineProps<{
  count: number
}>()
</script>
<template>
  <p class="card">还有 {{ count + 1 }} 件</p>
</template>
`;

const transferAfter = `<script setup lang="ts">
import Tag from './Tag.vue'
</script>
<template>
  <Tag :count="2" />
</template>
`;

const worldNum: CounterfactualWorld = {
  id: "num",
  name: "绑的是数字",
  tagline: ":n=\"3\" 是表达式",
  files: { "src/App.vue": appNumber, "src/Price.vue": childRuntime },
  nodes: [
    { id: "parent", kind: "component", label: "父 :n" },
    { id: "dom", kind: "dom", label: "6" },
  ],
  edges: [{ from: "parent", to: "dom", label: "数字" }],
  note: "冒号是 v-bind。右边是 JavaScript。3 是数字。",
};

const worldStr: CounterfactualWorld = {
  id: "str",
  name: "绑的是属性字符串",
  tagline: "n=\"3\" 没有冒号",
  files: { "src/App.vue": appStringAttr, "src/Price.vue": childRuntime },
  nodes: [
    { id: "parent", kind: "component", label: "父 n=" },
    { id: "dom", kind: "dom", label: "33" },
  ],
  edges: [{ from: "parent", to: "dom", label: "字符串" }],
  note: "HTML 属性永远是字符串。没有冒号，3 只是三个字符。",
};

export const TYPEDPROPS_LAB: CausalLab = {
  id: "typedprops",
  world: 8,
  concept: "defineProps",
  title: "进来的值也有形状",
  subtitle: "props 是入口契约。类型不改运行时加法，但能挡住把字符串当成数字送进来。",
  promise:
    "一镜一条边：先看数字 3 加出 6，再去掉冒号变成 33，再 runtime type: Number（只警告不转换），再写成泛型，再漏传，再用默认值补上。",
  minutes: 16,
  official: "/guide/typescript/composition-api.html",
  scenes: [
    {
      id: "typedprops-s0",
      tick: "S0",
      title: "数字进来，加法是 6",
      goal: "父用 :n=\"3\"。子把 n + n 画出来。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appNumber, "src/Price.vue": childRuntime },
        blocks: [{ id: "num", label: "① :n 是表达式" }],
        narration: "World 2 已经会传 props。这一课问的是：进来的值是哪种东西。探针会说出 typeof。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "3（number）", symbol: "n" }],
        dom: [{ id: "card", label: ".card", value: "6" }],
        events: [],
      },
      nodes: [
        { id: "parent", kind: "component", label: ":n=\"3\"" },
        { id: "prop", kind: "script", label: "n", symbol: "n" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "parent", to: "prop", label: "数字" },
        { from: "prop", to: "dom", label: "3+3" },
      ],
      explanation: {
        headline: "加法看见的是种类，不是字面",
        body: "同样写着 3。是数字还是字符串，n + n 会长出两张脸。下一镜去掉冒号。",
      },
      tryThis: "卡片必须是 6。探针必须是 number。记住这张脸。",
      faqs: [
        { q: "为什么用 n + n，不用 ×2？", a: "乘法会把字符串 '3' 也变成 6。加法才会让字符串露出 '33'。" },
        { q: "预览会做 TypeScript 检查吗？", a: "会把类型擦掉再跑。你看见的是运行时的脸。类型是这张脸在编译期的双胞胎。" },
      ],
    },
    {
      id: "typedprops-s1",
      tick: "S1",
      title: "去掉冒号",
      goal: "改成 n=\"3\"。没有 v-bind。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "没有冒号。子组件的 n + n 会？",
        choices: [
          { id: "six", label: "仍是 6。字面上是 3", correct: false, why: "HTML 属性的值是字符串。'3' + '3' 是 '33'。" },
          { id: "str", label: "变成 33。进来的是字符串", correct: true, why: "没有冒号就没有表达式。3 只是三个字符。" },
          { id: "err", label: "报错：不能把字符串传给 n", correct: false, why: "现在还没有契约。运行时照单全收。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appStringAttr, "src/Price.vue": childRuntime },
        blocks: [{ id: "attr", label: "② 去掉冒号" }],
        narration: "只删一个冒号。子组件一行没改。脸却换了。",
      },
      counterfactual: {
        id: "colon-or-not",
        title: "冒号 vs 属性",
        setup: "同一张卡片。差在 3 怎么送进去。",
        worlds: [worldNum, worldStr],
        punchline: "类型要守的，就是这张已经分叉的脸。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "'3'（string）", symbol: "n" }],
        dom: [{ id: "card", label: ".card", value: "33" }],
        events: [],
      },
      nodes: [
        { id: "parent", kind: "component", label: "n=\"3\"" },
        { id: "prop", kind: "script", label: "n", symbol: "n" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "parent", to: "prop", label: "字符串" },
        { from: "prop", to: "dom", label: "'3'+'3'" },
      ],
      why: {
        question: "为什么运行时不替你转成数字？",
        choices: [
          { id: "html", label: "没有冒号时，走的是 HTML 属性。属性没有数字这种东西", correct: true, why: "v-bind 才进入 JavaScript。类型系统要管的是这条 JS 边。" },
          { id: "vue", label: "Vue 会把能 parse 的字符串都转成 Number", correct: false, why: "只有 Boolean 等少数例外。Number 默认不转换。" },
          { id: "add", label: "是 + 的锅，跟 props 无关", correct: false, why: "+ 只是把已经进来的种类露出来。种类在入口就定了。" },
        ],
      },
      explanation: {
        headline: "入口没有种类，加法自己猜",
        body: "子组件声明了 n，没声明 n 是什么。父用错了绑定，脸先坏。类型是把这张脸提前画在契约上。",
      },
      faqs: [
        { q: "模板里 {{ n }} 看起来不也是 3？", a: "看起来一样。探针和加法才会拆穿。这就是类型存在的理由：有些错长得像对。" },
      ],
      tryThis: "卡片必须是 33。探针必须是 string。打开反事实对比有冒号的世界。",
      mapping: [{ code: "n=\"3\"", runtime: "string", ui: "33" }],
    },
    {
      id: "typedprops-s2",
      tick: "S2",
      title: "runtime type: Number",
      goal: "子组件加上 type: Number。父仍是 n=\"3\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "声明了 Number，父仍送字符串。卡片会？",
        choices: [
          { id: "six", label: "变成 6。Vue 会把 '3' 转成 3", correct: false, why: "Number 类型默认不转换。它是检查，不是管道。" },
          { id: "warn", label: "仍是 33。控制台可能警告，脸不改", correct: true, why: "运行时类型是标签。标签不对会喊，不会替你重算。" },
          { id: "err", label: "页面空白，prop 被丢掉", correct: false, why: "值仍在。只是种类错了。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appStringAttr, "src/Price.vue": childRuntimeNumber },
        blocks: [{ id: "rt", label: "③ type: Number" }],
        narration: "契约写在运行时对象里。父那一侧还是没冒号。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "仍是 string", symbol: "n" }],
        dom: [{ id: "card", label: ".card", value: "33" }],
        events: [],
      },
      nodes: [
        { id: "type", kind: "script", label: "type: Number" },
        { id: "prop", kind: "script", label: "n" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "prop", to: "dom", label: "仍是 33" }],
      explanation: {
        headline: "检查不是转换",
        body: "runtime props 能在控制台红字。它不能把已经进来的字符串变成数字。下一镜把契约挪到类型位置：给父看，不给浏览器看。",
      },
      faqs: [
        { q: "那 type: Number 有什么用？", a: "开发时警告。Boolean 还会把缺席当成 false。不要指望它替你 parse。" },
      ],
      tryThis: "卡片仍应是 33。若控制台有 Invalid prop，那是标签在喊，脸没变。",
      mapping: [{ code: "type: Number", runtime: "警告", ui: "仍 33" }],
    },
    {
      id: "typedprops-s3",
      tick: "S3",
      title: "写成泛型",
      goal: "defineProps<{ n: number }>()。父改回 :n=\"3\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "类型写在尖括号里。预览里卡片会？",
        choices: [
          { id: "six", label: "6。父用了冒号，种类本来就是数字", correct: true, why: "泛型不在运行时。脸对，是因为绑定对了。类型是给下一处写错准备的红线。" },
          { id: "magic", label: "6。TypeScript 会在运行时把值转成 number", correct: false, why: "类型会被擦掉。浏览器里没有 number 这个守卫。" },
          { id: "err", label: "编译失败，因为预览不懂 TS", correct: false, why: "会擦掉类型再跑。你看见的仍是 Vue。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appNumber, "src/Price.vue": childGeneric },
        blocks: [{ id: "gen", label: "④ defineProps<{ n: number }>()" }],
        narration: "契约换了房间：从运行时对象，搬进类型。父重新用回冒号。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "3（number）", symbol: "n" }],
        dom: [{ id: "card", label: ".card", value: "6" }],
        events: [],
      },
      nodes: [
        { id: "type", kind: "script", label: "{ n: number }" },
        { id: "parent", kind: "component", label: ":n" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "parent", to: "dom", label: "种类对" },
      ],
      explanation: {
        headline: "类型是编译期的入口",
        body: "父在 IDE 里写 n=\"3\" 会红。预览里你要自己记得那张 33 的脸。泛型不新增运行时行为，它把已经见过的分叉标成非法。",
      },
      faqs: [
        { q: "还要不要写 type: Number？", a: "TS 项目里泛型就够。runtime 类型是给纯 JS 或要在浏览器里喊的人。" },
        { q: "defineProps(['n']) 呢？", a: "只有名字，没有种类。和 S0 同一张图。" },
      ],
      tryThis: "卡片回到 6。探针是 number。对比上一镜：差别是父的冒号，不是泛型施了魔法。",
      mapping: [{ code: "defineProps<{ n: number }>()", runtime: "擦掉后仍是 props", ui: "种类由绑定决定" }],
    },
    {
      id: "typedprops-s4",
      tick: "S4",
      title: "声明了，却不传",
      goal: "n 仍是 required。父写成 <Price />。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "子要 n。父一个属性都不写。n + n 会？",
        choices: [
          { id: "zero", label: "当成 0，卡片是 0", correct: false, why: "没传就是 undefined。没有默认值。" },
          { id: "nan", label: "undefined + undefined，卡片是 NaN", correct: true, why: "required 只是契约。运行时仍可能缺席。加法把缺席喊成 NaN。" },
          { id: "err", label: "组件不会渲染", correct: false, why: "会渲染。只是入口是空的。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appMissing, "src/Price.vue": childGeneric },
        blocks: [{ id: "miss", label: "⑤ 父不传 n" }],
        narration: "种类问题解决了。现在缺的是值本身。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "undefined", symbol: "n" }],
        dom: [{ id: "card", label: ".card", value: "NaN" }],
        events: [],
      },
      nodes: [
        { id: "parent", kind: "component", label: "<Price />" },
        { id: "prop", kind: "script", label: "n" },
        { id: "dom", kind: "dom", label: "NaN" },
      ],
      edges: [{ from: "prop", to: "dom", label: "缺席" }],
      explanation: {
        headline: "required 不是默认值",
        body: "TS 会在父组件红：缺了 n。运行时仍可能漏。下一镜用默认值把洞填上——那是另一条边。",
      },
      faqs: [
        { q: "和 World 2 不传 :todo 一样吗？", a: "一样的洞。那时看见空白标题。这次加法把 undefined 喊成 NaN。" },
      ],
      tryThis: "卡片必须是 NaN。探针是 undefined。这是缺席，不是 33。",
      mapping: [{ code: "<Price />", runtime: "n 是 undefined", ui: "NaN" }],
    },
    {
      id: "typedprops-s5",
      tick: "S5",
      title: "缺席时用 0",
      goal: "withDefaults(..., { n: 0 })。父仍不传。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "n 改成可选，默认 0。父仍是 <Price />。会？",
        choices: [
          { id: "zero", label: "卡片是 0。洞被填上了", correct: true, why: "默认值发生在入口。加法看见的是数字 0。" },
          { id: "nan", label: "仍是 NaN。默认值只给类型看", correct: false, why: "withDefaults 会在运行时填。这和 TS 擦不擦掉无关。" },
          { id: "err", label: "可选就不能填默认值", correct: false, why: "可选 + 默认值正是一对。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appMissing, "src/Price.vue": childDefaults },
        blocks: [{ id: "def", label: "⑥ withDefaults n: 0" }],
        narration: "只补默认值。父仍然什么都不传。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "0", symbol: "n" }],
        dom: [{ id: "card", label: ".card", value: "0" }],
        events: [],
      },
      nodes: [
        { id: "def", kind: "script", label: "defaults" },
        { id: "prop", kind: "script", label: "n" },
        { id: "dom", kind: "dom", label: "0" },
      ],
      edges: [
        { from: "def", to: "prop", label: "填 0" },
        { from: "prop", to: "dom" },
      ],
      explanation: {
        headline: "默认值是运行时的填洞",
        body: "类型说可以不传。默认值说不传就当 0。两条边：合法缺席，和缺席之后是什么。",
      },
      faqs: [
        { q: "default: 0 写在 runtime 对象里呢？", a: "同一条边。withDefaults 是 TS 写法的同一口井。" },
      ],
      tryThis: "卡片必须是 0。探针是 number。和上一镜的 NaN 对上号。",
      mapping: [{ code: "withDefaults(..., { n: 0 })", runtime: "缺席 → 0", ui: "0" }],
    },
    {
      id: "typedprops-s6",
      tick: "S6",
      title: "拆掉冒号 / 漏传 / 拿掉默认值",
      goal: "三种坏法：字符串进来、入口空着、默认值被拿掉。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到 n=\"3\"（没有冒号）。卡片会？",
        choices: [
          { id: "six", label: "6", correct: false, why: "S1。" },
          { id: "str", label: "33", correct: true, why: "字符串加法。" },
          { id: "nan", label: "NaN", correct: false, why: "那是缺席。这里有值，只是种类错。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appNumber, "src/Price.vue": childGeneric },
        blocks: [{ id: "keep", label: "数字版先留着" }],
        narration: "先确认卡片是 6。再分别：去掉冒号、父不传、拿掉默认值只留可选。",
      },
      observe: {
        state: [{ id: "ok", label: "n", value: "3" }],
        dom: [{ id: "card", label: ".card", value: "6" }],
        events: [],
      },
      nodes: [
        { id: "prop", kind: "script", label: "n: number" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "prop", to: "dom" }],
      ablations: [
        {
          id: "attr",
          prompt: "如果去掉冒号？",
          files: { "src/App.vue": appStringAttr, "src/Price.vue": childGeneric },
          expected: { kind: "stale", message: "33。种类错了。TS 在父组件会红，预览仍会跑。" },
          lesson: "类型要挡的就是这张脸。",
        },
        {
          id: "miss",
          prompt: "如果父不传？",
          files: { "src/App.vue": appMissing, "src/Price.vue": childGeneric },
          expected: { kind: "stale", message: "NaN。required 在运行时仍可能缺席。" },
          lesson: "缺席和种类错是两张脸。",
        },
        {
          id: "nodef",
          prompt: "如果可选却没有默认值？",
          files: { "src/App.vue": appMissing, "src/Price.vue": childOptional },
          expected: { kind: "stale", message: "仍是 NaN。可选只表示允许缺席，不表示当 0。" },
          lesson: "合法缺席还要有人填洞。",
        },
      ],
      explanation: {
        headline: "三种入口事故",
        body: "种类错、值缺席、缺席却没默认。TS 把前两件在父组件标红。默认值是第三件的运行时修补。",
      },
      tryThis: "三种消融：33、NaN、NaN。对上号再恢复。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先去掉冒号（种类），再漏传（缺席），再没有默认值（洞还在）。" },
      ],
    },
    {
      id: "typedprops-s7",
      tick: "S7",
      title: "换：还剩几件",
      goal: "count=\"2\" 没有冒号。文案是「还有 N 件」。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "count + 1。父写成 count=\"2\"。用户会看见？",
        choices: [
          { id: "three", label: "还有 3 件", correct: false, why: "'2' + 1 是 '21'。和 n + n 同一张图。" },
          { id: "join", label: "还有 21 件", correct: true, why: "字符串加法。缺的是冒号，也是 count: number 这条契约。" },
          { id: "err", label: "报错", correct: false, why: "能跑。只是句子骗人。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore, "src/Tag.vue": tagLoose },
        blocks: [{ id: "tag", label: "换场景：件数" }],
        narration: "价格换成件数。问的仍是：进来的 2 是哪种 2。",
      },
      observe: {
        state: [{ id: "c", label: "count", value: "'2'" }],
        dom: [{ id: "card", label: ".card", value: "21 件" }],
        events: [],
      },
      nodes: [
        { id: "count", kind: "script", label: "count" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "count", to: "dom" }],
      ablations: [
        {
          id: "fix",
          prompt: "改成 :count=\"2\" 并写上 number 之后？",
          files: { "src/App.vue": transferAfter, "src/Tag.vue": tagTyped },
          expected: {
            kind: "stale",
            message: "这是修复：还有 3 件。种类对了。",
          },
          lesson: "下一课才问出去的事件：payload 也可能是错的种类。",
        },
      ],
      explanation: {
        headline: "进来的值要说出自己是谁",
        body: "冒号决定种类。泛型把种类写成契约。默认值填缺席。下一课：子组件喊出去的那一票，也有形状。",
      },
      faqs: [
        { q: "为什么不在子里 Number(count)？", a: "能修脸。但把入口谎言吞掉了。契约应该拦在父那一侧。" },
      ],
      tryThis: "先看见「还有 21 件」。再打开修复：必须是 3 件。",
      mapping: [
        { code: "count=\"2\"", runtime: "string", ui: "21 件" },
        { code: ":count=\"2\" + number", runtime: "number", ui: "3 件" },
      ],
    },
  ],
};
