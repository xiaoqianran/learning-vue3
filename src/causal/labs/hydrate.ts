import type { CausalLab, CounterfactualWorld } from "../types";

const SERVER = "1700000000000";

const s0 = `<script setup>
const SERVER = ${SERVER}
const now = SERVER
</script>
<template>
  <p class="stamp">服务器送来的 HTML：{{ SERVER }}</p>
  <p class="card match">客户端这一帧：{{ now }}</p>
</template>
`;

const s1 = `<script setup>
const SERVER = ${SERVER}
const now = Date.now()
</script>
<template>
  <p class="stamp">服务器送来的 HTML：{{ SERVER }}</p>
  <p class="card mismatch">客户端这一帧：{{ now }}</p>
</template>
`;

const s2 = `<script setup>
import { ref, onMounted } from 'vue'
const SERVER = ${SERVER}
const now = ref(SERVER)
onMounted(() => {
  now.value = Date.now()
})
</script>
<template>
  <p class="stamp">服务器送来的 HTML：{{ SERVER }}</p>
  <p class="card match">客户端这一帧：{{ now }}</p>
</template>
`;

const s3 = `<script setup>
import { ref, onMounted } from 'vue'
const SERVER = ${SERVER}
const ready = ref(false)
onMounted(() => {
  ready.value = true
})
</script>
<template>
  <p class="stamp">服务器送来的 HTML：${SERVER}</p>
  <p v-if="ready" class="card">客户端这一帧：时钟出现了</p>
  <p v-else class="hint">客户端第一帧：什么都没有</p>
</template>
`;

const s4 = `<script setup>
const SERVER = '0.42'
const now = Math.random()
</script>
<template>
  <p class="stamp">服务器送来的 HTML：{{ SERVER }}</p>
  <p class="card mismatch">客户端这一帧：{{ now }}</p>
</template>
`;

const s5 = `<script setup>
const SERVER = '(服务器没有 window)'
const width = window.innerWidth
</script>
<template>
  <p class="stamp">服务器送来的 HTML：{{ SERVER }}</p>
  <p class="card mismatch">客户端这一帧：宽 {{ width }}</p>
</template>
`;

const transferBefore = `<script setup>
const label = ['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()]
</script>
<template>
  <p class="stamp">服务器送来的 HTML：星期X</p>
  <p class="card">今天星期{{ label }}</p>
</template>
`;

const transferAfter = `<script setup>
import { ref, onMounted } from 'vue'
const SERVER = 'X'
const label = ref(SERVER)
onMounted(() => {
  label.value = ['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()]
})
</script>
<template>
  <p class="stamp">服务器送来的 HTML：星期{{ SERVER }}</p>
  <p class="card">今天星期{{ label }}</p>
</template>
`;

const worldMatch: CounterfactualWorld = {
  id: "match",
  name: "同一份标记",
  tagline: "第一帧和服务器字符串相同",
  files: { "src/App.vue": s0 },
  nodes: [
    { id: "server", kind: "script", label: "服务器 HTML" },
    { id: "dom", kind: "dom", label: "第一帧" },
  ],
  edges: [{ from: "server", to: "dom", label: "对得上" }],
  note: "水合只是给已有 DOM 接上事件和响应式。它假定标记已经正确。",
};

const worldMismatch: CounterfactualWorld = {
  id: "mismatch",
  name: "两份时间",
  tagline: "客户端 setup 里 Date.now()",
  files: { "src/App.vue": s1 },
  nodes: [
    { id: "server", kind: "script", label: "服务器 HTML" },
    { id: "client", kind: "script", label: "Date.now()" },
    { id: "dom", kind: "dom", label: "对不上" },
  ],
  edges: [
    { from: "server", to: "dom" },
    { from: "client", to: "dom", label: "另算一遍" },
  ],
  note: "Vue 会警告 hydration mismatch，然后丢掉服务器 DOM，整段重画。第一帧白闪就是它。",
};

export const HYDRATE_LAB: CausalLab = {
  id: "hydrate",
  world: 7,
  concept: "hydration",
  title: "两份 HTML 必须是同一张脸",
  subtitle: "水合不是重新渲染。它假设服务器送来的标记，客户端第一帧也能画出来。",
  promise:
    "一镜一条边：先让两帧相同，再在 setup 里 Date.now()，再挪到 onMounted，再 v-if 等到客户端才画，再 Math.random，再碰 window。",
  minutes: 16,
  official: "/guide/scaling-up/ssr.html",
  scenes: [
    {
      id: "hydrate-s0",
      tick: "S0",
      title: "两帧对得上",
      goal: "服务器印章和客户端第一帧是同一个数字。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": s0 },
        blocks: [{ id: "same", label: "① 同一份常量" }],
        narration: "预览里没有真的 Node 服务器。黄框是「已经送到浏览器的 HTML」。绿卡片是 Vue 这一帧要画的。现在它们相同。",
      },
      observe: {
        state: [{ id: "now", label: "now", value: SERVER, symbol: "now" }],
        dom: [
          { id: "stamp", label: ".stamp", value: SERVER },
          { id: "card", label: ".card", value: SERVER },
        ],
        events: [],
      },
      nodes: [
        { id: "server", kind: "script", label: "服务器 HTML" },
        { id: "client", kind: "render", label: "客户端第一帧" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "server", to: "dom", label: "已有标记" },
        { from: "client", to: "dom", label: "对得上" },
      ],
      explanation: {
        headline: "水合是接线，不是重画",
        body: "服务器已经把 HTML 放进文档。客户端 Vue 要做的是：找到这些节点，接上响应式。前提是：它自己再跑一遍 render，结果必须长得一样。",
      },
      tryThis: "看黄框和绿卡片必须是同一个数字。下一镜会让它们分叉。",
      faqs: [
        { q: "这不是真的 SSR？", a: "预览跑在浏览器里。黄框扮演「已经存在的 DOM」。真 SSR 的因果一样：两份 render 必须相等。" },
        { q: "CSR 为什么没这个问题？", a: "CSR 第一帧就是空的 #app，由客户端从头画。没有「已经存在的标记」要对齐。" },
      ],
    },
    {
      id: "hydrate-s1",
      tick: "S1",
      title: "setup 里 Date.now()",
      goal: "客户端每次加载自己算一个时间。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "now = Date.now()。黄框仍是服务器那一个常数。两帧会？",
        choices: [
          { id: "same", label: "仍相同。时间是数据，Vue 会对齐", correct: false, why: "Date.now() 每次调用都不同。服务器跑一次，客户端再跑一次，几乎不可能相等。" },
          { id: "diff", label: "对不上。客户端另算了一遍", correct: true, why: "水合失败。Vue 只能丢掉服务器 DOM，整段按客户端重画。用户看见闪一下。" },
          { id: "err", label: "直接报错，应用起不来", correct: false, why: "会警告，然后退回客户端渲染。能跑，第一帧却骗了人。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s1 },
        blocks: [{ id: "now", label: "② Date.now() 发生在 setup" }],
        narration: "只改了一处：时间在客户端重新取。黄框还是那份已经送来的 HTML。",
      },
      counterfactual: {
        id: "match-vs-not",
        title: "对得上 vs 对不上",
        setup: "同一张卡片。差在 now 怎么来。",
        worlds: [worldMatch, worldMismatch],
        punchline: "水合不是「再渲染一次更好看」。它要求两次 render 的字符串相等。",
      },
      observe: {
        state: [{ id: "now", label: "now", value: "每次不同", symbol: "now" }],
        dom: [
          { id: "stamp", label: ".stamp", value: SERVER },
          { id: "card", label: ".card", value: "另一个数" },
        ],
        events: [],
      },
      nodes: [
        { id: "server", kind: "script", label: "服务器 HTML" },
        { id: "now", kind: "script", label: "Date.now()", symbol: "now" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "server", to: "dom" },
        { from: "now", to: "dom", label: "对不上" },
      ],
      why: {
        question: "为什么 ref(Date.now()) 也不能放在 setup 里？",
        choices: [
          { id: "twice", label: "setup 在服务器跑一次、客户端再跑一次，两个 now 仍不同", correct: true, why: "ref 只是把值装进盒子。值本身已经分叉了。" },
          { id: "ref", label: "ref 会在水合时自动采用服务器那一份", correct: false, why: "没有这种魔法。水合比的是 DOM，不替你同步 Date。" },
          { id: "tick", label: "只要 nextTick 就能对齐", correct: false, why: "nextTick 等的是本批补丁。分叉发生在 setup，更早。" },
        ],
      },
      explanation: {
        headline: "setup 会跑两遍",
        body: "服务器一遍，客户端一遍。任何「每次调用结果不同」的东西，都不能出现在这两遍都要走的路径上：render、setup 顶层、computed 的纯计算。",
      },
      faqs: [
        { q: "控制台会看见什么？", a: "Hydration mismatch / children mismatch。真项目里它是红字。预览里你看见的是两行对不上的数字。" },
        { q: "Nuxt 会怎样？", a: "一样。useState / payload 把服务器算过的值序列化给客户端，避免再 Date.now() 一次。" },
      ],
      tryThis: "黄框必须仍是 1700000000000。绿卡片必须是另一个数。打开反事实对比对得上的世界。",
      mapping: [{ code: "const now = Date.now()", runtime: "setup 跑两遍", ui: "两帧对不上" }],
    },
    {
      id: "hydrate-s2",
      tick: "S2",
      title: "第一帧用服务器的值",
      goal: "now 先等于 SERVER。onMounted 再改成现在。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "第一帧 now 是 SERVER，挂载后再 Date.now()。水合会？",
        choices: [
          { id: "ok", label: "对得上。分叉被推迟到挂载之后", correct: true, why: "onMounted 只在客户端、水合成功之后跑。第一帧仍是那份 HTML。" },
          { id: "still", label: "仍对不上，因为马上就会改", correct: false, why: "马上改发生在挂载后。水合比的是第一帧。" },
          { id: "err", label: "onMounted 在服务器也会跑", correct: false, why: "不会。没有 DOM 就没有 mounted。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s2 },
        blocks: [{ id: "mount", label: "③ 分叉挪进 onMounted" }],
        narration: "只改时机。第一帧仍用服务器那份。活的时间在接线之后才出现。",
      },
      observe: {
        state: [{ id: "now", label: "now", value: "先 SERVER，再现在", symbol: "now" }],
        dom: [{ id: "card", label: ".card", value: "第一帧对齐" }],
        events: [],
      },
      nodes: [
        { id: "server", kind: "script", label: "SERVER" },
        { id: "mount", kind: "effect", label: "onMounted" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "server", to: "dom", label: "第一帧" },
        { from: "mount", to: "dom", label: "之后" },
      ],
      explanation: {
        headline: "先对齐，再增强",
        body: "水合要的是安静的第一帧。真正的「现在几点」是客户端增强。和 nextTick 同一类因果：问早了就会对不上，问晚了才是活的。",
      },
      faqs: [
        { q: "用户会看见数字跳一下？", a: "会。那是增强，不是 mismatch。第一帧已经正确，跳的是「从服务器时间到此刻」。" },
        { q: "能在服务器就算此刻吗？", a: "能，但要序列化进 payload，客户端读同一份，不要再 Date.now()。" },
      ],
      tryThis: "刷新预览。第一帧绿卡片应等于黄框，随后才变成现在。对得上的是第一帧，不是最终值。",
      mapping: [
        { code: "now = ref(SERVER)", runtime: "第一帧", ui: "对齐" },
        { code: "onMounted → Date.now()", runtime: "水合之后", ui: "增强" },
      ],
    },
    {
      id: "hydrate-s3",
      tick: "S3",
      title: "等到客户端才画",
      goal: "v-if=\"ready\"，ready 在 onMounted 才 true。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "服务器 HTML 里有时钟。客户端第一帧 v-if 为假。会？",
        choices: [
          { id: "ok", label: "更好。避免了 Date.now 分叉", correct: false, why: "节点有无也对不上。一边有卡片，一边是空的。这是另一种 mismatch。" },
          { id: "miss", label: "对不上。缺的是整段 DOM，不只是数字", correct: true, why: "水合比的是树。少一个节点和错一个数字，都是两张脸。" },
          { id: "hide", label: "v-if 在服务器也会是 false", correct: false, why: "若服务器真的画了时钟，客户端却藏起来，才是这一镜。ClientOnly 用错就是这样。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s3 },
        blocks: [{ id: "vif", label: "④ 第一帧不画卡片" }],
        narration: "数字分叉被你躲开了。树的形状分叉了。",
      },
      observe: {
        state: [{ id: "ready", label: "ready", value: "第一帧 false", symbol: "ready" }],
        dom: [
          { id: "stamp", label: ".stamp", value: "有时钟" },
          { id: "card", label: "卡片", value: "第一帧没有" },
        ],
        events: [],
      },
      nodes: [
        { id: "server", kind: "script", label: "有节点" },
        { id: "vif", kind: "render", label: "v-if ready" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "vif", to: "dom", label: "缺一块" }],
      explanation: {
        headline: "形状也要对齐",
        body: "ClientOnly 的正确用法是：服务器那一块本来就是占位，两边第一帧都是占位。服务器画了真内容、客户端却等 mounted 再画，树对不上。",
      },
      faqs: [
        { q: "那 ClientOnly 什么时候用？", a: "组件真的不能在服务器跑（地图、编辑器）。服务器放骨架，客户端第一帧也是同一块骨架。" },
        { q: "v-show 呢？", a: "节点还在，只是隐藏。形状容易对齐。但 Date.now 仍会写进 DOM。" },
      ],
      tryThis: "看黄框有数字。客户端第一帧应是「什么都没有」，随后才出现卡片。这是形状分叉。",
      mapping: [{ code: 'v-if="ready"', runtime: "第一帧缺节点", ui: "hydration mismatch" }],
    },
    {
      id: "hydrate-s4",
      tick: "S4",
      title: "Math.random()",
      goal: "每次 render 都换一个数。比 Date.now 更不稳。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "setup 里 Math.random()。两帧会？",
        choices: [
          { id: "diff", label: "对不上。而且客户端自己再渲染也会再变", correct: true, why: "不纯。服务器一次，客户端一次，之后每次 render 还可能再换。" },
          { id: "once", label: "setup 只跑一次，客户端会稳定", correct: false, why: "客户端 setup 仍会再跑一遍，结果几乎必变。" },
          { id: "ok", label: "Vue 会把随机数写进 payload", correct: false, why: "你得自己序列化。Vue 不会猜测哪个值该冻结。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s4 },
        blocks: [{ id: "rand", label: "⑤ Math.random()" }],
        narration: "时间换成骰子。同一条边：不纯的值出现在两遍 setup 里。",
      },
      observe: {
        state: [{ id: "now", label: "now", value: "随机", symbol: "now" }],
        dom: [{ id: "split", label: "两帧", value: "对不上" }],
        events: [],
      },
      nodes: [
        { id: "rand", kind: "script", label: "Math.random()" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "rand", to: "dom", label: "每次不同" }],
      explanation: {
        headline: "不纯就不能待在 render 路径",
        body: "Date、随机、是否登录若读的是「此刻的外界」，都要先冻成一份数据，再让两边读这一份。否则你在比两场不同的骰子。",
      },
      faqs: [
        { q: "key 用 Math.random() 呢？", a: "CSR 也会认错节点。SSR 更糟：两边 key 不同，整棵子树对不上。" },
        { q: "uuid 呢？", a: "在服务器生成一次，放进 payload。客户端不要再 new 一次。" },
      ],
      tryThis: "黄框是 0.42。卡片必须是另一个小数。刷新会再换。",
      mapping: [{ code: "Math.random()", runtime: "不纯", ui: "两帧两颗骰子" }],
    },
    {
      id: "hydrate-s5",
      tick: "S5",
      title: "setup 里碰 window",
      goal: "读取 window.innerWidth。真服务器上没有这个对象。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "const width = window.innerWidth 写在 setup。真的 SSR 会？",
        choices: [
          { id: "ok", label: "服务器也能读，宽度是 0", correct: false, why: "Node 没有 window。这是 ReferenceError，页面直接起不来。" },
          { id: "crash", label: "服务器扔错。客户端这一帧能画宽度", correct: true, why: "预览在浏览器里所以能跑。黄框扮演「服务器根本画不出这一行」。" },
          { id: "guard", label: "Vue 会自动跳过 window", correct: false, why: "不会。要你自己 typeof window !== 'undefined'，并且两边第一帧仍要对齐。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s5 },
        blocks: [{ id: "win", label: "⑥ window.innerWidth" }],
        narration: "预览能跑，是因为你人在浏览器。黄框写下了服务器做不到的事。",
      },
      observe: {
        state: [{ id: "w", label: "width", value: "仅客户端", symbol: "width" }],
        dom: [
          { id: "stamp", label: ".stamp", value: "没有 window" },
          { id: "card", label: ".card", value: "有宽度" },
        ],
        events: [],
      },
      nodes: [
        { id: "win", kind: "script", label: "window" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "win", to: "dom", label: "服务器走不通" }],
      explanation: {
        headline: "浏览器 API 不是 setup 的居民",
        body: "window、document、localStorage，只存在于挂载之后的世界。写在 setup 顶层，CSR 能跑，SSR 炸。守卫还不够：两边第一帧仍必须同一张脸。",
      },
      faqs: [
        { q: "typeof window !== 'undefined' 就行了吗？", a: "能避免扔错。若服务器走 false 分支画「未知」、客户端走 true 画数字，仍 mismatch。第一帧都画「未知」，onMounted 再填。" },
        { q: "import.meta.env.SSR 呢？", a: "Vite/Nuxt 的编译期旗标。同样：用它选分支时，两帧形状要相同。" },
      ],
      tryThis: "预览里卡片会显示宽度。记住黄框：真服务器画不出这一行。",
      mapping: [{ code: "window.innerWidth", runtime: "Node 里不存在", ui: "SSR 直接炸" }],
    },
    {
      id: "hydrate-s6",
      tick: "S6",
      title: "拆掉对齐 / 推迟过晚 / 碰 window",
      goal: "三种坏法：另算一遍、缺节点、没有 window。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到 setup 里 Date.now()。两帧会？",
        choices: [
          { id: "ok", label: "对得上", correct: false, why: "S1。" },
          { id: "diff", label: "对不上", correct: true, why: "setup 跑两遍，时间不同。" },
          { id: "err", label: "应用起不来", correct: false, why: "警告后退回 CSR。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s2 },
        blocks: [{ id: "keep", label: "onMounted 版本先留着" }],
        narration: "先刷新看第一帧对齐。再分别：Date.now 回 setup、等到客户端才画、碰 window。",
      },
      observe: {
        state: [{ id: "ok", label: "第一帧", value: "对齐" }],
        dom: [{ id: "card", label: ".card", value: "先 SERVER" }],
        events: [],
      },
      nodes: [
        { id: "server", kind: "script", label: "SERVER" },
        { id: "mount", kind: "effect", label: "onMounted" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "server", to: "dom" }],
      ablations: [
        {
          id: "now",
          prompt: "如果 setup 里 Date.now()？",
          files: { "src/App.vue": s1 },
          expected: { kind: "stale", message: "两帧数字对不上。水合失败。" },
          lesson: "不纯的值不能待在两遍 setup 里。",
        },
        {
          id: "vif",
          prompt: "如果第一帧不画卡片？",
          files: { "src/App.vue": s3 },
          expected: { kind: "stale", message: "形状对不上。一边有节点，一边没有。" },
          lesson: "缺一块 DOM 也是 mismatch。",
        },
        {
          id: "win",
          prompt: "如果 setup 读 window？",
          files: { "src/App.vue": s5 },
          expected: { kind: "error", message: "真 SSR 会 ReferenceError。预览能跑只因为人在浏览器。" },
          lesson: "浏览器 API 属于 mounted 之后。",
        },
      ],
      explanation: {
        headline: "三种对不上",
        body: "值不同、树不同、服务器根本跑不了。水合只做接线。你得先保证两份 render 是同一张脸。",
      },
      tryThis: "三种消融都看黄框和卡片。数字分叉、缺节点、window，对上号再恢复。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先 Date.now（值），再 v-if（形状），再 window（服务器跑不了）。" },
      ],
    },
    {
      id: "hydrate-s7",
      tick: "S7",
      title: "换：今天星期几",
      goal: "setup 里 new Date().getDay()。先判断两帧会怎样。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "标签在 setup 里用 getDay() 算。服务器印章是「星期X」。会？",
        choices: [
          { id: "ok", label: "对得上。星期不会那么快变", correct: false, why: "时区、刚好跨日、服务器在 UTC、客户端在本地——都会分叉。规则仍是：不要在两遍 setup 里另算。" },
          { id: "diff", label: "可能对不上。应先冻一份，挂载后再增强", correct: true, why: "和 Date.now 同一条边。看起来慢的值，也不该各算各的。" },
          { id: "err", label: "Date 在服务器不存在", correct: false, why: "Date 在 Node 里有。window 才没有。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "dow", label: "换场景：星期" }],
        narration: "时间戳换成星期。问的仍是：这份值该冻在哪。",
      },
      observe: {
        state: [{ id: "label", label: "label", value: "客户端自算" }],
        dom: [{ id: "card", label: ".card", value: "星期?" }],
        events: [],
      },
      nodes: [
        { id: "date", kind: "script", label: "getDay()" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "date", to: "dom" }],
      ablations: [
        {
          id: "mount",
          prompt: "第一帧用 X，onMounted 再填之后？",
          files: { "src/App.vue": transferAfter },
          expected: {
            kind: "stale",
            message: "这是修复：第一帧对齐「星期X」，挂载后变成今天。",
          },
          lesson: "迁移成功：你指出的是「不要各算一遍」，不是「星期变化很慢所以没事」。",
        },
      ],
      explanation: {
        headline: "冻住第一帧，再把此刻接上",
        body: "下一课会问另一件生产事故：服务器上的那份状态，会不会漏到下一个请求里。",
      },
      faqs: [
        { q: "时区怎么办？", a: "服务器算好、写进 payload，客户端读同一份。或者两边都只在 mounted 后显示本地时间，第一帧用占位。" },
      ],
      tryThis: "先看两行会不会对不上。再打开修复：第一帧都是 X，随后才变成今天。",
      mapping: [
        { code: "getDay() 在 setup", runtime: "两遍各算", ui: "可能 mismatch" },
        { code: "ref('X') + onMounted", runtime: "先对齐再增强", ui: "第一帧相同" },
      ],
    },
  ],
};
