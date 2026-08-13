import type { CausalLab, CounterfactualWorld } from "../types";

const bothLive = `<script setup>
import { ref } from 'vue'
const n = ref(0)
</script>
<template>
  <p class="hint">两张都跟着 n 走</p>
  <p class="card">冻 {{ n }}</p>
  <p class="card">活 {{ n }}</p>
  <button @click="n++">+1</button>
</template>
`;

const freezeOne = `<script setup>
import { ref } from 'vue'
const n = ref(0)
</script>
<template>
  <p class="hint">上面那张 v-once</p>
  <p v-once class="card">冻 {{ n }}</p>
  <p class="card">活 {{ n }}</p>
  <button @click="n++">+1</button>
</template>
`;

const freezeWrap = `<script setup>
import { ref } from 'vue'
const n = ref(0)
</script>
<template>
  <p class="hint">v-once 包住两张</p>
  <div v-once>
    <p class="card">冻 {{ n }}</p>
    <p class="card">活 {{ n }}</p>
  </div>
  <button @click="n++">+1</button>
</template>
`;

const freezeSpan = `<script setup>
import { ref } from 'vue'
const n = ref(0)
</script>
<template>
  <p class="hint">只有里面的 span 冻住</p>
  <p class="card">活 {{ n }} · <span v-once>冻 {{ n }}</span></p>
  <button @click="n++">+1</button>
</template>
`;

const remount = `<script setup>
import { ref } from 'vue'
const n = ref(0)
const show = ref(true)
</script>
<template>
  <p class="hint">关掉再打开，v-once 会重新拍一张</p>
  <p v-if="show" v-once class="card">冻 {{ n }}</p>
  <p class="card">活 {{ n }}</p>
  <button @click="n++">+1</button>
  <button @click="show = !show">{{ show ? '拆掉冻住的' : '再挂上' }}</button>
</template>
`;

const panel = `<script setup>
defineProps({ n: Number })
</script>
<template>
  <p class="card">子 {{ n }}</p>
</template>
`;

const freezeChild = `<script setup>
import { ref } from 'vue'
import Panel from './Panel.vue'
const n = ref(0)
</script>
<template>
  <p class="hint">v-once 在子组件标签上</p>
  <Panel v-once :n="n" />
  <p class="card">活 {{ n }}</p>
  <button @click="n++">+1</button>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const price = ref(36)
</script>
<template>
  <p class="hint">价钱没有 v-once</p>
  <p class="card">{{ price }} 元</p>
  <button @click="price++">涨价</button>
</template>
`;

const transferFixed = `<script setup>
import { ref } from 'vue'
const price = ref(36)
</script>
<template>
  <p class="hint">标价 v-once</p>
  <p v-once class="card">{{ price }} 元</p>
  <p class="card">现价 {{ price }} 元</p>
  <button @click="price++">涨价</button>
</template>
`;

const worldLive: CounterfactualWorld = {
  id: "live",
  name: "没有 v-once",
  tagline: "两张都跟",
  files: { "src/App.vue": bothLive },
  nodes: [
    { id: "n", kind: "ref", label: "n" },
    { id: "a", kind: "dom", label: "冻 1" },
    { id: "b", kind: "dom", label: "活 1" },
  ],
  edges: [
    { from: "n", to: "a" },
    { from: "n", to: "b" },
  ],
  note: "点 +1，两张都变成 1。没有人被冻住。",
};

const worldOnce: CounterfactualWorld = {
  id: "once",
  name: "上面 v-once",
  tagline: "冻住 0",
  files: { "src/App.vue": freezeOne },
  nodes: [
    { id: "n", kind: "ref", label: "n" },
    { id: "a", kind: "dom", label: "冻 0" },
    { id: "b", kind: "dom", label: "活 1" },
  ],
  edges: [{ from: "n", to: "b" }],
  note: "v-once 把第一次画的脸钉住。n 还在加，上面那张不再画。",
};

export const VONCE_LAB: CausalLab = {
  id: "vonce",
  world: 16,
  concept: "v-once",
  title: "第一次画的，就钉住",
  subtitle: "v-once 跳过这棵子树以后的更新。不是值冻住，是节点不再画。拆掉再挂，会拍一张新的。",
  promise:
    "一镜一条边：先两张都跟 n 走，再上面那张钉在 0，再包一层两张都钉，再只钉里面的 span，再 v-if 重挂拍新照，再钉在子组件上。",
  minutes: 16,
  official: "/api/built-in-directives.html#v-once",
  scenes: [
    {
      id: "vonce-s0",
      tick: "S0",
      title: "两张都跟着走",
      goal: "冻和活都是 {{ n }}。没有 v-once。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": bothLive },
        blocks: [{ id: "live", label: "① 都活着" }],
        narration: "World 1 的按钮会改画面。这一课问：有些节点能不能不再画。先看两张都跟的脸。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "0 → 点了是 1" }],
        dom: [
          { id: "a", label: "冻", value: "跟着走" },
          { id: "b", label: "活", value: "跟着走" },
        ],
        events: [{ id: "click", label: "+1", value: "n++" }],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n" },
        { id: "a", kind: "dom", label: "冻" },
        { id: "b", kind: "dom", label: "活" },
      ],
      edges: [
        { from: "n", to: "a" },
        { from: "n", to: "b" },
      ],
      explanation: {
        headline: "默认每一帧都画",
        body: "下一镜给上面那张加上 v-once。点 +1，看谁还跟。",
      },
      tryThis: "点 +1。两张都必须变成 1。",
      faqs: [
        { q: "为什么一张叫冻？", a: "下一镜它会被钉住。这一镜先让你看见它现在还活着。" },
      ],
    },
    {
      id: "vonce-s1",
      tick: "S1",
      title: "上面那张钉在第一次",
      goal: "冻那张加 v-once。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点 +1。冻那张会？",
        choices: [
          { id: "zero", label: "仍是 0。第一次画的钉住了", correct: true, why: "v-once 跳过以后的更新。n 是 1，节点不再画。" },
          { id: "one", label: "也变成 1。v-once 只跳过第一次", correct: false, why: "名字是 once：只画一次，不是跳过第一次。" },
          { id: "blank", label: "消失。once 是卸掉", correct: false, why: "还在。只是不更新。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": freezeOne },
        blocks: [{ id: "once", label: "② v-once" }],
        narration: "n 还在加。上面那张拒绝再画。",
      },
      counterfactual: {
        id: "live-vs-once",
        title: "都活 vs 钉住",
        setup: "都点 +1。差在上面那张有没有 v-once。",
        worlds: [worldLive, worldOnce],
        punchline: "值没有冻住。冻住的是「还要不要再画」。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "1" }],
        dom: [
          { id: "a", label: "冻", value: "0" },
          { id: "b", label: "活", value: "1" },
        ],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n" },
        { id: "once", kind: "script", label: "v-once", symbol: "v-once" },
        { id: "a", kind: "dom", label: "冻 0" },
      ],
      edges: [{ from: "once", to: "a", label: "不再画" }],
      explanation: {
        headline: "钉的是节点，不是 ref",
        body: "下一镜把 v-once 包在两张外面。活着的那张也会被钉住。",
      },
      faqs: [
        { q: "n 还是响应式吗？", a: "是。活着的那张证明 n 在变。v-once 只让这一棵子树退出更新。" },
      ],
      tryThis: "点 +1。冻必须仍是 0，活必须是 1。打开反事实。",
      mapping: [{ code: "v-once", runtime: "跳过后续 patch", ui: "冻 0 / 活 1" }],
    },
    {
      id: "vonce-s2",
      tick: "S2",
      title: "包一层，整棵子树都钉",
      goal: "div v-once 包住冻和活。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点 +1。两张会？",
        choices: [
          { id: "both", label: "都仍是 0。v-once 钉的是整棵子树", correct: true, why: "指令在祖先上，子孙一起退出更新。" },
          { id: "live", label: "活变成 1。v-once 只钉写了它的那一个", correct: false, why: "那是上一镜。这一镜写在包层上。" },
          { id: "none", label: "两张消失", correct: false, why: "还在。只是不更新。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": freezeWrap },
        blocks: [{ id: "wrap", label: "③ 包住" }],
        narration: "活着的那张没写 v-once。祖先写了，它也动不了。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "1（点了）" }],
        dom: [
          { id: "a", label: "冻", value: "0" },
          { id: "b", label: "活", value: "0" },
        ],
        events: [],
      },
      nodes: [
        { id: "once", kind: "script", label: "v-once" },
        { id: "b", kind: "dom", label: "活 0" },
      ],
      edges: [{ from: "once", to: "b", label: "子树" }],
      explanation: {
        headline: "v-once 认子树，不认名字",
        body: "下一镜只把 v-once 写在里面的 span 上。外面的字还能走。",
      },
      faqs: [
        { q: "按钮为什么还能点？", a: "按钮在 v-once 外面。点了 n++ 发生。只是里面两张不画。" },
      ],
      tryThis: "点 +1。冻和活都必须仍是 0。",
      mapping: [{ code: "<div v-once>", runtime: "整棵子树跳过", ui: "两张都 0" }],
    },
    {
      id: "vonce-s3",
      tick: "S3",
      title: "只钉里面那一小段",
      goal: "同一行：活 {{ n }} · span v-once 冻 {{ n }}。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点 +1。这一行会？",
        choices: [
          { id: "split", label: "活变成 1，冻仍是 0", correct: true, why: "v-once 只钉 span。外面的文本节点还在更新。" },
          { id: "both", label: "整行钉在 0。写在里面也会冻一行", correct: false, why: "范围是那颗节点的子树，不是整行 p。" },
          { id: "live", label: "都变成 1。span 太小钉不住", correct: false, why: "小也能钉。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": freezeSpan },
        blocks: [{ id: "span", label: "④ 只钉 span" }],
        narration: "同一张卡片，两种寿命。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "1" }],
        dom: [{ id: "card", label: ".card", value: "活 1 · 冻 0" }],
        events: [],
      },
      nodes: [
        { id: "once", kind: "script", label: "span v-once" },
        { id: "span", kind: "dom", label: "冻 0" },
      ],
      edges: [{ from: "once", to: "span" }],
      explanation: {
        headline: "口有大小，钉也有大小",
        body: "下一镜给冻住的那张加上 v-if。拆掉再挂，会按当时的 n 再拍一张。",
      },
      faqs: [
        { q: "能不能 v-once=\"false\" 解冻？", a: "不能。v-once 没有值。要解冻就拿掉指令，或把节点卸掉再挂。" },
      ],
      tryThis: "点 +1。必须看见「活 1 · 冻 0」。",
      mapping: [{ code: "<span v-once>", runtime: "只跳过 span", ui: "活 1 · 冻 0" }],
    },
    {
      id: "vonce-s4",
      tick: "S4",
      title: "卸掉再挂，拍一张新的",
      goal: "v-if + v-once。先 +1，再拆掉冻住的，再挂上。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "n 已经是 1。拆掉再挂上。冻那张会？",
        choices: [
          { id: "one", label: "变成 1。新实例的第一次就是 1", correct: true, why: "v-once 跟实例走。卸掉就没了。再挂是新的第一次。" },
          { id: "zero", label: "仍是 0。v-once 记住第一次直到刷新页面", correct: false, why: "不是页面级缓存。是这颗节点的寿命。" },
          { id: "blank", label: "挂不上。v-if 和 v-once 不能在一起", correct: false, why: "能。v-if 管在不在，v-once 管在了之后还画不画。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": remount },
        blocks: [{ id: "if", label: "⑤ 重挂" }],
        narration: "钉住的是这一次挂上的脸。寿命结束，钉子也走。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "1" }],
        dom: [{ id: "a", label: "冻（重挂后）", value: "1" }],
        events: [],
      },
      nodes: [
        { id: "if", kind: "script", label: "v-if" },
        { id: "once", kind: "script", label: "v-once" },
        { id: "a", kind: "dom", label: "新的 1" },
      ],
      edges: [{ from: "if", to: "a", label: "新实例" }],
      explanation: {
        headline: "钉子跟实例走",
        body: "下一镜把 v-once 写在子组件标签上。子里面的字也会被钉住。",
      },
      faqs: [
        { q: "KeepAlive 呢？", a: "World 5：切走是睡。睡醒还是同一个实例，v-once 不会再拍。v-if 是死而复生。" },
      ],
      tryThis: "先 +1（冻仍 0）。再拆掉、再挂上。冻必须变成 1。",
      mapping: [{ code: "v-if + v-once 重挂", runtime: "新实例第一次画", ui: "冻 1" }],
    },
    {
      id: "vonce-s5",
      tick: "S5",
      title: "钉在子组件上",
      goal: "<Panel v-once :n=\"n\" />。Panel 显示子 {{ n }}。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点 +1。子那张会？",
        choices: [
          { id: "zero", label: "仍是 0。v-once 钉住整个子组件", correct: true, why: "组件标签上的 v-once，子树就是那整个组件。" },
          { id: "one", label: "变成 1。props 变了子一定会画", correct: false, why: "父不再 patch 这个子。props 边也被跳过。" },
          { id: "err", label: "报错。v-once 不能写在组件上", correct: false, why: "能写。范围是这颗组件节点。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": freezeChild, "src/Panel.vue": panel },
        blocks: [{ id: "comp", label: "⑥ 钉组件" }],
        narration: "子没写 v-once。父在标签上写了，子也动不了。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "1" }],
        dom: [
          { id: "c", label: "子", value: "0" },
          { id: "b", label: "活", value: "1" },
        ],
        events: [],
      },
      nodes: [
        { id: "once", kind: "script", label: "v-once" },
        { id: "c", kind: "component", label: "Panel 0" },
      ],
      edges: [{ from: "once", to: "c" }],
      explanation: {
        headline: "组件也是一颗节点",
        body: "下一镜拆三种：只钉一张、包住两张、钉在子上。",
      },
      faqs: [
        { q: "和 World 10 的 markRaw 像吗？", a: "像「不再追踪」。markRaw 是对象永不代理。v-once 是节点不再 patch。一层值，一层 DOM。" },
      ],
      tryThis: "点 +1。子必须仍是 0，活必须是 1。",
      mapping: [{ code: "<Panel v-once>", runtime: "整颗组件跳过 patch", ui: "子 0" }],
    },
    {
      id: "vonce-s6",
      tick: "S6",
      title: "拆成钉一张 / 钉子树 / 钉组件",
      goal: "对照：一张 v-once、包层 v-once、组件 v-once。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到只钉上面那张。点 +1 会？",
        choices: [
          { id: "split", label: "冻 0，活 1", correct: true, why: "先确认好的脸。" },
          { id: "both", label: "都 0", correct: false, why: "那是包层。" },
          { id: "live", label: "都 1", correct: false, why: "那是没有 v-once。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": freezeOne },
        blocks: [{ id: "keep", label: "钉一张先留着" }],
        narration: "先看见冻 0 活 1。再分别：包住两张、只钉 span、钉在子上。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "冻", value: "0" },
          { id: "b", label: "活", value: "1" },
        ],
        events: [],
      },
      nodes: [
        { id: "once", kind: "script", label: "v-once" },
        { id: "a", kind: "dom", label: "冻" },
      ],
      edges: [{ from: "once", to: "a" }],
      ablations: [
        {
          id: "wrap",
          prompt: "如果 v-once 包住两张？",
          files: { "src/App.vue": freezeWrap },
          expected: { kind: "stale", message: "点 +1，两张都仍是 0。" },
          lesson: "钉的是子树。",
        },
        {
          id: "span",
          prompt: "如果只钉里面的 span？",
          files: { "src/App.vue": freezeSpan },
          expected: { kind: "stale", message: "活 1 · 冻 0。" },
          lesson: "钉子可以很小。",
        },
        {
          id: "comp",
          prompt: "如果钉在子组件上？",
          files: { "src/App.vue": freezeChild, "src/Panel.vue": panel },
          expected: { kind: "stale", message: "子仍是 0，活是 1。" },
          lesson: "组件也是一颗节点。",
        },
      ],
      explanation: {
        headline: "一张、一棵、一颗组件",
        body: "三种钉子，三种范围。下一课钉子可以带条件：deps 没变才跳过。那是 v-memo。",
      },
      tryThis: "三种消融：两张都 0、活 1 冻 0、子 0。对上号再恢复冻 0 活 1。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先包层，再 span，再子组件。" },
      ],
    },
    {
      id: "vonce-s7",
      tick: "S7",
      title: "换：标价",
      goal: "一张价钱，没有 v-once。点涨价会变。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "点涨价。36 会？",
        choices: [
          { id: "up", label: "变成 37。没有钉子，跟着走", correct: true, why: "换了文案，默认仍是每帧都画。" },
          { id: "stay", label: "仍是 36。价钱该冻住", correct: false, why: "这一镜还没写 v-once。" },
          { id: "err", label: "报错", correct: false, why: "能跑。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "price", label: "换场景：标价" }],
        narration: "计数换成价钱。问的仍是：这张脸要不要再画。",
      },
      observe: {
        state: [{ id: "p", label: "price", value: "36 → 37" }],
        dom: [{ id: "card", label: ".card", value: "37 元" }],
        events: [],
      },
      nodes: [
        { id: "p", kind: "ref", label: "price" },
        { id: "dom", kind: "dom", label: "37 元" },
      ],
      edges: [{ from: "p", to: "dom" }],
      ablations: [
        {
          id: "fix",
          prompt: "标价加上 v-once，再留一行现价？",
          files: { "src/App.vue": transferFixed },
          expected: {
            kind: "stale",
            message: "这是修复：标价钉在 36，现价跟到 37。",
          },
          lesson: "下一课：不想永远钉住，只想 deps 没变时跳过——v-memo。",
        },
      ],
      explanation: {
        headline: "有些字只该出现一次",
        body: "v-once 是永远跳过。下一课 v-memo 带一份名单：名单没变才跳过。",
      },
      faqs: [
        { q: "静态文案也要 v-once 吗？", a: "不必。编译器已经把纯静态节点提走。v-once 留给「第一次是动态的，之后不必再动」的那一段。" },
      ],
      tryThis: "先点涨价看 37。再打开修复：标价 36，现价 37。",
      mapping: [
        { code: "没有 v-once", runtime: "每帧都画", ui: "37 元" },
        { code: "标价 v-once", runtime: "跳过更新", ui: "36 / 现价 37" },
      ],
    },
  ],
};
