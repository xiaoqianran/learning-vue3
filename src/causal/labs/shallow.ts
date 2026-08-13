import type { CausalLab, CounterfactualWorld } from "../types";

const deepRef = `<script setup>
import { ref } from 'vue'
const obj = ref({ n: 0 })
const tick = ref(0)
function bump() { obj.value.n++ }
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">画面 {{ obj.n }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <button @click="bump">内部 +1</button>
  <button @click="redraw">强迫刷新</button>
</template>
`;

const shallow = `<script setup>
import { ref, shallowRef } from 'vue'
const obj = shallowRef({ n: 0 })
const tick = ref(0)
function bump() { obj.value.n++ }
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">画面 {{ obj.n }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <button @click="bump">内部 +1</button>
  <button @click="redraw">强迫刷新</button>
</template>
`;

const replace = `<script setup>
import { ref, shallowRef } from 'vue'
const obj = shallowRef({ n: 0 })
const tick = ref(0)
function bump() { obj.value.n++ }
function redraw() { tick.value++ }
function swap() { obj.value = { n: obj.value.n + 1 } }
</script>
<template>
  <p class="card">画面 {{ obj.n }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <button @click="bump">内部 +1</button>
  <button @click="swap">换成新对象</button>
  <button @click="redraw">强迫刷新</button>
</template>
`;

const withTrigger = `<script setup>
import { ref, shallowRef, triggerRef } from 'vue'
const obj = shallowRef({ n: 0 })
const tick = ref(0)
function bump() { obj.value.n++ }
function redraw() { tick.value++ }
function force() {
  obj.value.n++
  triggerRef(obj)
}
</script>
<template>
  <p class="card">画面 {{ obj.n }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <button @click="bump">内部 +1</button>
  <button @click="force">+1 并 triggerRef</button>
  <button @click="redraw">强迫刷新</button>
</template>
`;

const shallowRoot = `<script setup>
import { ref, shallowReactive } from 'vue'
const state = shallowReactive({ n: 0, inner: { n: 0 } })
const tick = ref(0)
function bumpRoot() { state.n++ }
function bumpInner() { state.inner.n++ }
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">根 {{ state.n }} · 内 {{ state.inner.n }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <button @click="bumpRoot">根 +1</button>
  <button @click="bumpInner">内 +1</button>
  <button @click="redraw">强迫刷新</button>
</template>
`;

const deepReactive = `<script setup>
import { reactive, ref } from 'vue'
const state = reactive({ n: 0, inner: { n: 0 } })
const tick = ref(0)
function bumpRoot() { state.n++ }
function bumpInner() { state.inner.n++ }
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">根 {{ state.n }} · 内 {{ state.inner.n }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <button @click="bumpRoot">根 +1</button>
  <button @click="bumpInner">内 +1</button>
  <button @click="redraw">强迫刷新</button>
</template>
`;

const transferBefore = `<script setup>
import { shallowRef } from 'vue'
const cart = shallowRef({ qty: 1 })
function add() { cart.value.qty++ }
</script>
<template>
  <p class="card">{{ cart.qty }} 件</p>
  <button @click="add">加一件</button>
</template>
`;

const transferFixed = `<script setup>
import { shallowRef, triggerRef } from 'vue'
const cart = shallowRef({ qty: 1 })
function add() {
  cart.value.qty++
  triggerRef(cart)
}
</script>
<template>
  <p class="card">{{ cart.qty }} 件</p>
  <button @click="add">加一件</button>
</template>
`;

const transferReplace = `<script setup>
import { shallowRef } from 'vue'
const cart = shallowRef({ qty: 1 })
function add() {
  cart.value = { qty: cart.value.qty + 1 }
}
</script>
<template>
  <p class="card">{{ cart.qty }} 件</p>
  <button @click="add">加一件</button>
</template>
`;

const worldDeep: CounterfactualWorld = {
  id: "deep",
  name: "深 ref",
  tagline: "ref({ n: 0 })",
  files: { "src/App.vue": deepRef },
  nodes: [
    { id: "n", kind: "ref", label: "obj.n" },
    { id: "dom", kind: "dom", label: "画面跟着走" },
  ],
  edges: [{ from: "n", to: "dom", label: "深订阅" }],
  note: "对象被做成深代理。改 n，渲染重新跑。",
};

const worldShallow: CounterfactualWorld = {
  id: "shallow",
  name: "浅 ref",
  tagline: "shallowRef({ n: 0 })",
  files: { "src/App.vue": shallow },
  nodes: [
    { id: "n", kind: "ref", label: "obj.n 内存变了" },
    { id: "dom", kind: "dom", label: "画面冻住" },
  ],
  edges: [{ from: "n", to: "dom", label: "没订阅" }],
  note: "只追踪 .value 整份替换。里面的 n 改了，没人通知画面。",
};

export const SHALLOW_LAB: CausalLab = {
  id: "shallow",
  world: 10,
  concept: "shallowRef",
  title: "订阅只到这一层",
  subtitle: "ref 会把里面也做成代理。shallowRef 只盯整份替换。内存可以先变，画面后知道。",
  promise:
    "一镜一条边：先深 ref 内部 +1 画面走，再浅 ref 画面冻住、强迫刷新才跳，再换成新对象自己走，再 triggerRef，再浅 reactive 根走内冻。",
  minutes: 16,
  official: "/api/reactivity-advanced.html#shallowref",
  scenes: [
    {
      id: "shallow-s0",
      tick: "S0",
      title: "深 ref，里面也订阅",
      goal: "obj = ref({ n: 0 })。内部 +1。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": deepRef },
        blocks: [{ id: "deep", label: "① ref({ n: 0 })" }],
        narration: "World 1 的 count 是数字。现在源是对象。先看深的脸：改里面的字段，画面跟着走。",
      },
      observe: {
        state: [{ id: "n", label: "obj.n", value: "0 → 1", symbol: "n" }],
        dom: [{ id: "card", label: ".card", value: "1" }],
        events: [{ id: "click", label: "click", value: "obj.n++" }],
      },
      nodes: [
        { id: "btn", kind: "event", label: "内部 +1" },
        { id: "n", kind: "ref", label: "obj.n", symbol: "n" },
        { id: "dom", kind: "dom", label: "画面" },
      ],
      edges: [
        { from: "btn", to: "n" },
        { from: "n", to: "dom" },
      ],
      explanation: {
        headline: "深代理把里面也接上了",
        body: "ref(对象) 会 reactive 里面那一层。改 n，渲染重新读。下一镜只换 shallowRef，按钮一行都不动。",
      },
      tryThis: "点内部 +1。画面必须立刻变成 1。强迫刷新只增加计数，不是它在救命。",
      faqs: [
        { q: "模板里为什么是 obj.n 不是 obj.value.n？", a: "顶层 ref 自动解包。脚本里 bump 仍要 obj.value.n。" },
      ],
    },
    {
      id: "shallow-s1",
      tick: "S1",
      title: "浅 ref，画面冻住",
      goal: "改成 shallowRef({ n: 0 })。内部 +1。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点内部 +1。画面会？",
        choices: [
          { id: "one", label: "变成 1。对象还是对象", correct: false, why: "shallowRef 不代理里面。n++ 没有通知渲染。" },
          { id: "freeze", label: "仍是 0。内存变了，画面不知道", correct: true, why: "只追踪 .value 整份替换。字段改了，订阅停在外壳。" },
          { id: "err", label: "报错：不能改浅 ref 的字段", correct: false, why: "能改。只是没人听。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": shallow },
        blocks: [{ id: "sh", label: "② shallowRef" }],
        narration: "按钮一行没改。只把外壳换成浅的。",
      },
      counterfactual: {
        id: "deep-vs-shallow",
        title: "深 vs 浅",
        setup: "同一行 obj.n++。差在外壳是不是深代理。",
        worlds: [worldDeep, worldShallow],
        punchline: "内存先变，画面后知道。强迫刷新是那面镜子：跳到 1，说明不是没改。",
      },
      observe: {
        state: [{ id: "n", label: "obj.n", value: "内存 1，画面 0" }],
        dom: [{ id: "card", label: ".card", value: "0" }],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n 已 +1" },
        { id: "shell", kind: "ref", label: "shallowRef", symbol: "shallowRef" },
        { id: "dom", kind: "dom", label: "仍是 0" },
      ],
      edges: [{ from: "n", to: "dom", label: "没通知" }],
      why: {
        question: "点强迫刷新之后画面变成 1。这说明？",
        choices: [
          { id: "mem", label: "内存早就 1 了。刷新只是重新读", correct: true, why: "tick 是另一份 ref。它一变，整页重渲染，才把已经改过的 n 画出来。" },
          { id: "magic", label: "强迫刷新会把浅 ref 变深", correct: false, why: "下一击内部 +1，画面又冻。外壳还是浅的。" },
          { id: "undo", label: "强迫刷新把 n 改回去了", correct: false, why: "它只加 tick。n 一直是 1。" },
        ],
      },
      explanation: {
        headline: "冻住不是没改，是没订阅",
        body: "和 World 1 忘了 .value 不同：那里赋值根本没写进 ref。这里写进去了，通知停在外壳。下一镜换整份对象。",
      },
      faqs: [
        { q: "大列表为什么有人用 shallowRef？", a: "里面每一层代理都有成本。你自己替换整份数据时，浅的更便宜。代价就是内部突变不再发光。" },
      ],
      tryThis: "先点内部 +1，画面必须仍是 0。再点强迫刷新，必须跳到 1。打开反事实对比深的世界。",
      mapping: [{ code: "shallowRef({ n: 0 })", runtime: "只追踪外壳", ui: "内部 +1 画面冻" }],
    },
    {
      id: "shallow-s2",
      tick: "S2",
      title: "换成新对象，外壳动了",
      goal: "obj.value = { n: obj.n + 1 }。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「换成新对象」。画面会？",
        choices: [
          { id: "live", label: "立刻 +1。外壳被替换，浅订阅能听见", correct: true, why: "shallowRef 盯的就是 .value 这一下赋值。" },
          { id: "freeze", label: "仍冻住。浅的什么都不听", correct: false, why: "它听外壳。不听里面。" },
          { id: "need", label: "还要再点强迫刷新", correct: false, why: "替换自己就会 trigger。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": replace },
        blocks: [{ id: "swap", label: "③ 换成新对象" }],
        narration: "内部 +1 仍冻。新按钮换整份。只多这一条边。",
      },
      observe: {
        state: [{ id: "n", label: "obj", value: "新对象" }],
        dom: [{ id: "card", label: ".card", value: "跟着替换走" }],
        events: [],
      },
      nodes: [
        { id: "swap", kind: "event", label: "替换 .value" },
        { id: "shell", kind: "ref", label: "shallowRef" },
        { id: "dom", kind: "dom", label: "画面" },
      ],
      edges: [
        { from: "swap", to: "shell" },
        { from: "shell", to: "dom" },
      ],
      explanation: {
        headline: "浅订阅听的是整份替换",
        body: "同一份内存里的 n++ 不发光。换一个新对象就发光。下一镜不想换对象：手动敲一下钟。",
      },
      faqs: [
        { q: "obj.value.n = 1 算替换吗？", a: "不算。改的是里面的字段。obj.value = { n: 1 } 才是替换外壳。" },
      ],
      tryThis: "先内部 +1，画面不动。再换成新对象，画面必须立刻走。",
      mapping: [{ code: "obj.value = { n: … }", runtime: "外壳替换", ui: "画面立刻走" }],
    },
    {
      id: "shallow-s3",
      tick: "S3",
      title: "不换对象，敲一下钟",
      goal: "内部 +1 之后 triggerRef(obj)。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「+1 并 triggerRef」。画面会？",
        choices: [
          { id: "live", label: "立刻走。手动通知了外壳的订阅者", correct: true, why: "triggerRef 假装 .value 被替换了。其实还是同一份对象。" },
          { id: "freeze", label: "仍冻住。没换对象就不算", correct: false, why: "triggerRef 就是为这种情况准备的。" },
          { id: "dup", label: "走两步。+1 一次，trigger 再一次", correct: false, why: "内部 +1 不发光。只有 trigger 让渲染跑一次，读到已经 +1 的 n。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": withTrigger },
        blocks: [{ id: "trig", label: "④ triggerRef" }],
        narration: "对象还是那一份。你替浅外壳喊一声。",
      },
      observe: {
        state: [{ id: "n", label: "obj.n", value: "1", symbol: "triggerRef" }],
        dom: [{ id: "card", label: ".card", value: "1" }],
        events: [],
      },
      nodes: [
        { id: "bump", kind: "script", label: "n++" },
        { id: "trig", kind: "effect", label: "triggerRef", symbol: "triggerRef" },
        { id: "dom", kind: "dom", label: "画面" },
      ],
      edges: [
        { from: "bump", to: "trig", label: "内存" },
        { from: "trig", to: "dom", label: "通知" },
      ],
      explanation: {
        headline: "triggerRef 是浅外壳的铃",
        body: "你自己保证里面改完了，再让画面来读。下一镜换 API：shallowReactive 没有 .value，订阅停在第一层字段。",
      },
      faqs: [
        { q: "triggerRef(深 ref) 呢？", a: "也能敲。但深 ref 的内部突变本来就会敲。多敲一次只是多渲染。" },
      ],
      tryThis: "内部 +1 画面必须冻。+1 并 triggerRef，画面必须走。tick 不必动。",
      mapping: [{ code: "triggerRef(obj)", runtime: "通知外壳订阅者", ui: "同一份对象，画面更新" }],
    },
    {
      id: "shallow-s4",
      tick: "S4",
      title: "浅 reactive，根字段会走",
      goal: "shallowReactive({ n, inner })。点根 +1。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「根 +1」。画面上的根会？",
        choices: [
          { id: "live", label: "立刻 +1。第一层字段被追踪", correct: true, why: "shallowReactive 代理的是自己的键。state.n++ 就是在外壳上赋值。" },
          { id: "freeze", label: "冻住。浅的什么根都不听", correct: false, why: "那是把 shallowRef 和 shallowReactive 混了。浅 ref 的 n 在 .value 里面，隔了一层。" },
          { id: "both", label: "根和内一起变", correct: false, why: "内没人点。这一镜只动根。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": shallowRoot },
        blocks: [{ id: "root", label: "⑤ shallowReactive 根 +1" }],
        narration: "没有 .value。浅代理停在第一层键。先看会发光的那一层。",
      },
      observe: {
        state: [{ id: "n", label: "state.n", value: "1", symbol: "n" }],
        dom: [{ id: "card", label: ".card", value: "根 1 · 内 0" }],
        events: [],
      },
      nodes: [
        { id: "root", kind: "ref", label: "state.n" },
        { id: "dom", kind: "dom", label: "根" },
      ],
      edges: [{ from: "root", to: "dom" }],
      explanation: {
        headline: "浅 reactive 听第一层赋值",
        body: "state.n++ 是外壳上的键。下一镜点内 +1：那一层没有代理。",
      },
      faqs: [
        { q: "和 shallowRef 怎么记？", a: "shallowRef：隔着 .value，里面整份都不代理。shallowReactive：这一层键代理，再往里不代理。" },
      ],
      tryThis: "只点根 +1。根必须立刻变，内必须仍是 0。",
      mapping: [{ code: "state.n++", runtime: "第一层键", ui: "根跟着走" }],
    },
    {
      id: "shallow-s5",
      tick: "S5",
      title: "浅 reactive，里面仍冻",
      goal: "同一份 shallowReactive。点内 +1。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「内 +1」。画面上的内会？",
        choices: [
          { id: "live", label: "立刻 +1。已经是 reactive 了", correct: false, why: "inner 没有被做成代理。n++ 改内存，不通知。" },
          { id: "freeze", label: "仍是 0。强迫刷新才跳", correct: true, why: "和 S1 同一张脸，层数不同：现在冻的是第二层。" },
          { id: "root", label: "根会跟着动", correct: false, why: "没人改根。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": shallowRoot },
        blocks: [{ id: "inner", label: "⑥ 内 +1" }],
        narration: "代码一行没改。只换你点的按钮。一层一条边。",
      },
      observe: {
        state: [{ id: "i", label: "inner.n", value: "内存 1，画面 0" }],
        dom: [{ id: "card", label: ".card", value: "内仍 0" }],
        events: [],
      },
      nodes: [
        { id: "inner", kind: "ref", label: "inner.n" },
        { id: "dom", kind: "dom", label: "冻住" },
      ],
      edges: [{ from: "inner", to: "dom", label: "没代理" }],
      explanation: {
        headline: "第二层没有代理",
        body: "根会走、内会冻。这就是浅的形状。下一镜拆三种死法：浅内部突变、忘了 triggerRef、用深 reactive 对照。",
      },
      faqs: [
        { q: "把 inner 换成新对象呢？", a: "state.inner = { n: 1 } 是第一层键赋值，会走。state.inner.n++ 才冻。" },
      ],
      tryThis: "点内 +1，内必须仍是 0。再强迫刷新，内必须变成 1。根不要动。",
      mapping: [{ code: "state.inner.n++", runtime: "第二层无代理", ui: "冻住" }],
    },
    {
      id: "shallow-s6",
      tick: "S6",
      title: "拆成内部冻 / 替换走 / 深的对照",
      goal: "三种对照：浅内部 +1、换成新对象、深 reactive。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到浅 ref。内部 +1。画面会？",
        choices: [
          { id: "freeze", label: "冻住", correct: true, why: "先确认坏的脸。" },
          { id: "live", label: "走", correct: false, why: "那是深的，或替换，或 triggerRef。" },
          { id: "err", label: "报错", correct: false, why: "能跑。句子骗人。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": shallow },
        blocks: [{ id: "keep", label: "浅 ref 先留着" }],
        narration: "先内部 +1 看见冻。再分别：换成新对象、深 reactive、triggerRef。",
      },
      observe: {
        state: [{ id: "ok", label: "obj.n", value: "内存先变" }],
        dom: [{ id: "card", label: ".card", value: "0" }],
        events: [],
      },
      nodes: [
        { id: "shell", kind: "ref", label: "shallowRef" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "shell", to: "dom" }],
      ablations: [
        {
          id: "swap",
          prompt: "如果换成新对象？",
          files: { "src/App.vue": replace },
          expected: { kind: "stale", message: "这是修复之一：外壳替换，画面走。" },
          lesson: "浅订阅听的是 .value =。",
        },
        {
          id: "deep",
          prompt: "如果改回深 reactive？",
          files: { "src/App.vue": deepReactive },
          expected: { kind: "stale", message: "这是对照：根和内都会走。深代理把第二层也接上。" },
          lesson: "深是默认。浅是你关掉里面那一层。",
        },
        {
          id: "trig",
          prompt: "如果内部 +1 后 triggerRef？",
          files: { "src/App.vue": withTrigger },
          expected: { kind: "stale", message: "这是修复之二：同一份对象，手动敲钟。" },
          lesson: "内存已经变了，缺的是通知。",
        },
      ],
      explanation: {
        headline: "浅的三种走法",
        body: "换外壳、改回深的、手动敲钟。冻住都是同一条缝：订阅停在某一层。下一课把某一层永远冻住：markRaw。",
      },
      tryThis: "三种消融都点一次：替换会走、深的内也会走、triggerRef 会走。对上号再恢复浅的冻脸。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先替换（外壳），再深对照（默认），再 triggerRef（同一份对象）。" },
      ],
    },
    {
      id: "shallow-s7",
      tick: "S7",
      title: "换：购物车件数",
      goal: "cart = shallowRef({ qty: 1 })。点加一件只改 qty。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "点加一件。卡片会？",
        choices: [
          { id: "two", label: "2 件", correct: false, why: "和 obj.n++ 同一张图。" },
          { id: "one", label: "仍是 1 件。浅外壳没被替换", correct: true, why: "qty++ 在里面。画面冻住。" },
          { id: "err", label: "报错", correct: false, why: "能跑。句子骗人。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "cart", label: "换场景：购物车" }],
        narration: "计数器换成购物车。问的仍是：你改的是外壳还是里面。",
      },
      observe: {
        state: [{ id: "q", label: "qty", value: "内存 2，画面 1" }],
        dom: [{ id: "card", label: ".card", value: "1 件" }],
        events: [],
      },
      nodes: [
        { id: "qty", kind: "ref", label: "qty" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "qty", to: "dom" }],
      ablations: [
        {
          id: "trig",
          prompt: "加一件后 triggerRef？",
          files: { "src/App.vue": transferFixed },
          expected: {
            kind: "stale",
            message: "这是修复：2 件。同一份对象，敲了钟。",
          },
          lesson: "也可以换成新对象 { qty: qty+1 }。下一课：有些对象你根本不该代理。",
        },
        {
          id: "swap",
          prompt: "如果每次都换成新对象？",
          files: { "src/App.vue": transferReplace },
          expected: {
            kind: "stale",
            message: "这也是修复：2 件。外壳被替换。",
          },
          lesson: "不可变更新天然适合 shallowRef。",
        },
      ],
      explanation: {
        headline: "件数冻住，不是加减写错了",
        body: "qty++ 已经发生。画面没订阅那一层。下一课 markRaw：有些对象进了 reactive，也永远不发光。",
      },
      faqs: [
        { q: "Pinia 的 state 默认深吗？", a: "默认深。大规范化数据才会有人改成浅的。先看见冻脸，再用。" },
      ],
      tryThis: "先点加一件，必须仍是 1 件。再打开两种修复：都必须变成 2 件。",
      mapping: [
        { code: "cart.qty++", runtime: "内存 2", ui: "1 件" },
        { code: "triggerRef(cart)", runtime: "通知外壳", ui: "2 件" },
      ],
    },
  ],
};
