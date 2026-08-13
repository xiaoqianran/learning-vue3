import type { CausalLab, CounterfactualWorld } from "../types";

const nestedLive = `<script setup>
import { reactive, ref } from 'vue'
const state = reactive({ user: { name: 'Ada' } })
const tick = ref(0)
function rename() { state.user.name = 'Lin' }
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">{{ state.user.name }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <button @click="rename">改成 Lin</button>
  <button @click="redraw">强迫刷新</button>
</template>
`;

const nestedRaw = `<script setup>
import { markRaw, reactive, ref } from 'vue'
const state = reactive({ user: markRaw({ name: 'Ada' }) })
const tick = ref(0)
function rename() { state.user.name = 'Lin' }
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">{{ state.user.name }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <button @click="rename">改成 Lin</button>
  <button @click="redraw">强迫刷新</button>
</template>
`;

const replacePlain = `<script setup>
import { markRaw, reactive, ref } from 'vue'
const state = reactive({ user: markRaw({ name: 'Ada' }) })
const tick = ref(0)
function rename() { state.user.name = 'Lin' }
function swap() { state.user = { name: 'Lin' } }
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">{{ state.user.name }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <button @click="rename">改里面</button>
  <button @click="swap">换成普通对象</button>
  <button @click="redraw">强迫刷新</button>
</template>
`;

const replaceRaw = `<script setup>
import { markRaw, reactive, ref } from 'vue'
const state = reactive({ user: markRaw({ name: 'Ada' }) })
const tick = ref(0)
function swap() { state.user = markRaw({ name: 'Lin' }) }
function rename() { state.user.name = 'Bob' }
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">{{ state.user.name }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <button @click="swap">换成新的 raw</button>
  <button @click="rename">再改里面</button>
  <button @click="redraw">强迫刷新</button>
</template>
`;

const bypass = `<script setup>
import { reactive, ref, toRaw } from 'vue'
const state = reactive({ n: 0 })
const tick = ref(0)
function bump() { state.n++ }
function bumpRaw() { toRaw(state).n++ }
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">画面 {{ state.n }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <button @click="bump">走代理 +1</button>
  <button @click="bumpRaw">绕过代理 +1</button>
  <button @click="redraw">强迫刷新</button>
</template>
`;

const transferBefore = `<script setup>
import { reactive } from 'vue'
const chart = { points: [1, 2, 3] }
const state = reactive({ chart, title: '销量' })
function add() { state.chart.points.push(4) }
function rename() { state.title = '库存' }
</script>
<template>
  <p class="card">{{ state.title }} · {{ state.chart.points.join(',') }}</p>
  <button @click="add">加一个点</button>
  <button @click="rename">改标题</button>
</template>
`;

const transferRaw = `<script setup>
import { markRaw, reactive } from 'vue'
const chart = markRaw({ points: [1, 2, 3] })
const state = reactive({ chart, title: '销量' })
function add() { state.chart.points.push(4) }
function rename() { state.title = '库存' }
</script>
<template>
  <p class="card">{{ state.title }} · {{ state.chart.points.join(',') }}</p>
  <button @click="add">加一个点</button>
  <button @click="rename">改标题</button>
</template>
`;

const worldLive: CounterfactualWorld = {
  id: "live",
  name: "普通嵌套对象",
  tagline: "reactive({ user: { name } })",
  files: { "src/App.vue": nestedLive },
  nodes: [
    { id: "name", kind: "ref", label: "user.name" },
    { id: "dom", kind: "dom", label: "Lin" },
  ],
  edges: [{ from: "name", to: "dom", label: "深代理" }],
  note: "嵌套对象会被做成代理。改 name，画面走。",
};

const worldRaw: CounterfactualWorld = {
  id: "raw",
  name: "markRaw 嵌进去",
  tagline: "user: markRaw({ name })",
  files: { "src/App.vue": nestedRaw },
  nodes: [
    { id: "name", kind: "ref", label: "name 内存变了" },
    { id: "dom", kind: "dom", label: "Ada 冻住" },
  ],
  edges: [{ from: "name", to: "dom", label: "永不代理" }],
  note: "这枚对象进 reactive 也不会被包。改 name，没人通知。",
};

export const MARKRAW_LAB: CausalLab = {
  id: "markraw",
  world: 10,
  concept: "markRaw",
  title: "有些对象永不代理",
  subtitle: "markRaw 盖章：进了 reactive 也不发光。toRaw 则是你主动绕过已经存在的代理。",
  promise:
    "一镜一条边：先嵌套对象会走，再 markRaw 冻住，再换成普通对象又被包上，再换成新的 raw 只走一次，再 toRaw 绕过代理。",
  minutes: 16,
  official: "/api/reactivity-advanced.html#markraw",
  scenes: [
    {
      id: "markraw-s0",
      tick: "S0",
      title: "嵌套对象会被包",
      goal: "reactive({ user: { name: 'Ada' } })。改 name。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": nestedLive },
        blocks: [{ id: "deep", label: "① 普通嵌套" }],
        narration: "上一课浅的是「这一层不代理」。这一课是「这一枚对象永远不代理」。先看默认：嵌进去就会被包。",
      },
      observe: {
        state: [{ id: "n", label: "user.name", value: "Ada → Lin", symbol: "name" }],
        dom: [{ id: "card", label: ".card", value: "Lin" }],
        events: [],
      },
      nodes: [
        { id: "name", kind: "ref", label: "name" },
        { id: "dom", kind: "dom", label: "画面" },
      ],
      edges: [{ from: "name", to: "dom" }],
      explanation: {
        headline: "reactive 会把嵌进去的普通对象也包起来",
        body: "改 name，画面走。下一镜盖章 markRaw，同一行赋值不再发光。",
      },
      tryThis: "点改成 Lin。卡片必须立刻变成 Lin。强迫刷新不必上场。",
      faqs: [
        { q: "和 shallowRef 什么区别？", a: "浅是层。markRaw 是这枚对象。浅外壳里的字段都不订阅；盖章的对象换到哪都不订阅。" },
      ],
    },
    {
      id: "markraw-s1",
      tick: "S1",
      title: "盖章之后，改里面冻住",
      goal: "user: markRaw({ name: 'Ada' })。再改 name。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点改成 Lin。卡片会？",
        choices: [
          { id: "lin", label: "Lin。已经在 reactive 里了", correct: false, why: "盖章的对象不会被包。name 不是响应式属性。" },
          { id: "ada", label: "仍是 Ada。强迫刷新才变成 Lin", correct: true, why: "内存改了。画面没订阅。和浅内部突变同一张冻脸，原因是这枚对象被禁止代理。" },
          { id: "err", label: "报错：只读", correct: false, why: "markRaw 不是 freeze。能改，不通知。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": nestedRaw },
        blocks: [{ id: "raw", label: "② markRaw" }],
        narration: "只给那枚对象盖章。改名字的那一行不动。",
      },
      counterfactual: {
        id: "raw-vs-live",
        title: "包 vs 不包",
        setup: "同一行 state.user.name = 'Lin'。差在 user 有没有盖章。",
        worlds: [worldLive, worldRaw],
        punchline: "盖章不是只读。它是「别追踪我」。强迫刷新会把已经改过的 Lin 画出来。",
      },
      observe: {
        state: [{ id: "n", label: "name", value: "内存 Lin，画面 Ada" }],
        dom: [{ id: "card", label: ".card", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "raw", kind: "script", label: "markRaw", symbol: "markRaw" },
        { id: "name", kind: "ref", label: "name" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [{ from: "raw", to: "dom", label: "禁止代理" }],
      explanation: {
        headline: "盖章 = 永不代理",
        body: "DOM 节点、图表实例、class 实例，常被盖章，免得 Vue 把它拆成代理。下一镜把盖章的换成普通对象——reactive 会重新包。",
      },
      faqs: [
        { q: "和 Object.freeze 一样吗？", a: "不一样。freeze 不能改。markRaw 能改，只是 Vue 不追踪。" },
      ],
      tryThis: "点改成 Lin，卡片必须仍是 Ada。再强迫刷新，必须变成 Lin。打开反事实。",
      mapping: [{ code: "markRaw({ name })", runtime: "永不代理", ui: "改 name 画面冻" }],
    },
    {
      id: "markraw-s2",
      tick: "S2",
      title: "换成普通对象，又被包上",
      goal: "state.user = { name: 'Lin' }。普通对象，没有盖章。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「换成普通对象」。卡片会？",
        choices: [
          { id: "lin", label: "立刻 Lin。第一层键被赋值，而且新对象会被包", correct: true, why: "reactive 在赋值时看到普通对象，会把它做成代理。" },
          { id: "ada", label: "仍是 Ada。盖章会传染给后来的对象", correct: false, why: "章盖在那一枚上。新对象是干净的。" },
          { id: "need", label: "还要强迫刷新", correct: false, why: "替换 user 这一键会通知。新对象随后也能追踪。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": replacePlain },
        blocks: [{ id: "plain", label: "③ 换成普通对象" }],
        narration: "盖章不会传染。新来的普通对象，reactive 照包。",
      },
      observe: {
        state: [{ id: "u", label: "user", value: "新代理" }],
        dom: [{ id: "card", label: ".card", value: "Lin" }],
        events: [],
      },
      nodes: [
        { id: "swap", kind: "event", label: "赋值 user" },
        { id: "proxy", kind: "ref", label: "新代理" },
        { id: "dom", kind: "dom", label: "Lin" },
      ],
      edges: [
        { from: "swap", to: "proxy" },
        { from: "proxy", to: "dom" },
      ],
      explanation: {
        headline: "章盖在对象上，不盖在字段名上",
        body: "user 这个键还是响应式的。换进去的那一枚如果没盖章，就会被包。下一镜换进去的仍是 raw：替换这一下会走，再改里面又冻。",
      },
      faqs: [
        { q: "改里面那一钮现在还能用吗？", a: "换成普通对象之后，再点改里面，会走。因为新对象是代理。你可以自己试。" },
      ],
      tryThis: "先点改里面，应仍冻在 Ada。再换成普通对象，必须立刻 Lin。",
      mapping: [{ code: "state.user = { name: 'Lin' }", runtime: "普通对象被包", ui: "立刻 Lin" }],
    },
    {
      id: "markraw-s3",
      tick: "S3",
      title: "换成新的 raw：走一次，再冻",
      goal: "state.user = markRaw({ name: 'Lin' })。然后再改里面。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "先点「换成新的 raw」，再点「再改里面」。会？",
        choices: [
          { id: "once", label: "先变成 Lin，再改成 Bob 时冻住", correct: true, why: "替换 user 键会通知一次。新对象盖了章，里面的 name 仍不追踪。" },
          { id: "both", label: "两次都走。都在 reactive 里", correct: false, why: "第二下是改盖章对象的字段。" },
          { id: "none", label: "两次都冻。raw 连替换都不让画面走", correct: false, why: "替换的是 state.user 这一层键，外壳是代理。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": replaceRaw },
        blocks: [{ id: "raw2", label: "④ 新 raw 替换" }],
        narration: "两下点击，两条边。先替换，再改里面。不要一次做完。",
      },
      observe: {
        state: [{ id: "u", label: "user", value: "Lin，再改则冻" }],
        dom: [{ id: "card", label: ".card", value: "Lin" }],
        events: [],
      },
      nodes: [
        { id: "swap", kind: "event", label: "替换键" },
        { id: "inner", kind: "script", label: "改 name" },
        { id: "dom", kind: "dom", label: "Lin 冻住" },
      ],
      edges: [
        { from: "swap", to: "dom", label: "走一次" },
        { from: "inner", to: "dom", label: "又冻" },
      ],
      explanation: {
        headline: "键是响应式的，值可以不是",
        body: "和浅 reactive 很像：第一层赋值发光，再往里不发光。差别是：这枚对象挪到别处，仍然不发光。下一镜主动绕过已经包好的代理。",
      },
      faqs: [
        { q: "强迫刷新能看见 Bob 吗？", a: "能。内存已经是 Bob。画面没订阅。" },
      ],
      tryThis: "换成新的 raw，卡片必须是 Lin。再改里面，必须仍是 Lin。再强迫刷新，必须变成 Bob。",
      mapping: [
        { code: "state.user = markRaw(…)", runtime: "键赋值", ui: "走一次" },
        { code: "state.user.name = 'Bob'", runtime: "盖章对象", ui: "冻住" },
      ],
    },
    {
      id: "markraw-s4",
      tick: "S4",
      title: "走代理会亮，绕过就不亮",
      goal: "reactive({ n: 0 })。toRaw(state).n++。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "先点「走代理 +1」，再点「绕过代理 +1」。画面会？",
        choices: [
          { id: "split", label: "第一下变 1，第二下仍是 1，强迫刷新才到 2", correct: true, why: "toRaw 拿到原始对象。赋值不经过代理，订阅者听不见。" },
          { id: "both", label: "两下都走。反正是同一份数据", correct: false, why: "同一份数据，两条路。只有走代理才通知。" },
          { id: "err", label: "toRaw 在组件里不能用", correct: false, why: "能用。调试和给外部库原件时会用。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": bypass },
        blocks: [{ id: "raw", label: "⑤ toRaw 绕过" }],
        narration: "对象已经被包了。你也可以选择不走代理那扇门。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "走代理亮，绕过冻", symbol: "n" }],
        dom: [{ id: "card", label: ".card", value: "1，然后冻" }],
        events: [],
      },
      nodes: [
        { id: "proxy", kind: "ref", label: "代理" },
        { id: "raw", kind: "script", label: "toRaw", symbol: "toRaw" },
        { id: "dom", kind: "dom", label: "画面" },
      ],
      edges: [
        { from: "proxy", to: "dom", label: "通知" },
        { from: "raw", to: "dom", label: "绕过" },
      ],
      explanation: {
        headline: "toRaw 是原件，不是只读副本",
        body: "改原件，内存变，铃不响。markRaw 是盖章禁止包装。toRaw 是已经包装了，你绕开它。下一镜看图表那种不该被包的对象。",
      },
      faqs: [
        { q: "为什么要 toRaw？", a: "把原件交给不会用代理的库（图表、WebGL、class）。或者调试时对比代理和原件是不是同一份。" },
      ],
      tryThis: "走代理，画面必须到 1。绕过代理，必须仍是 1。强迫刷新，必须到 2。",
      mapping: [{ code: "toRaw(state).n++", runtime: "改原件", ui: "画面冻" }],
    },
    {
      id: "markraw-s5",
      tick: "S5",
      title: "标题会走，点不会走",
      goal: "图表对象没盖章，和标题一起放进 reactive。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "现在图表是普通对象。点「加一个点」。卡片会？",
        choices: [
          { id: "four", label: "销量 · 1,2,3,4。嵌套数组也会被包", correct: true, why: "没盖章。push 会通知。先看这张会走的脸，下一镜盖章。" },
          { id: "stay", label: "仍是 1,2,3。数组很特殊", correct: false, why: "reactive 会包数组。" },
          { id: "title", label: "标题变成库存", correct: false, why: "没点改标题。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "chart", label: "⑥ 普通图表对象" }],
        narration: "假装 chart 是某图表库的 option。现在还没盖章。先确认默认会追踪。",
      },
      observe: {
        state: [{ id: "p", label: "points", value: "1,2,3,4" }],
        dom: [{ id: "card", label: ".card", value: "1,2,3,4" }],
        events: [],
      },
      nodes: [
        { id: "pts", kind: "ref", label: "points" },
        { id: "dom", kind: "dom", label: "画面" },
      ],
      edges: [{ from: "pts", to: "dom" }],
      explanation: {
        headline: "库对象被包，常常是事故",
        body: "画面是对的，库可能已经坏了：它的 this、私有字段、循环引用经不起代理。下一镜盖章，点数冻住，标题仍走。",
      },
      faqs: [
        { q: "为什么不直接浅 reactive？", a: "浅会让所有第二层都不追踪。你可能仍想追踪 title。markRaw 只冻这一枚。" },
      ],
      tryThis: "加一个点，必须出现 4。再改标题，必须变成库存。两头都会走。",
      mapping: [{ code: "reactive({ chart })", runtime: "chart 被包", ui: "点数会走" }],
    },
    {
      id: "markraw-s6",
      tick: "S6",
      title: "拆成盖章冻 / 换普通包 / 绕过冻",
      goal: "三种对照：markRaw、换成普通对象、toRaw。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到 markRaw 的 user。改成 Lin。卡片会？",
        choices: [
          { id: "ada", label: "仍是 Ada", correct: true, why: "先确认冻脸。" },
          { id: "lin", label: "Lin", correct: false, why: "那是没盖章。" },
          { id: "err", label: "报错", correct: false, why: "能改。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": nestedRaw },
        blocks: [{ id: "keep", label: "盖章版先留着" }],
        narration: "先改成 Lin 看见冻。再分别：普通嵌套、换成普通对象、绕过代理。",
      },
      observe: {
        state: [{ id: "ok", label: "name", value: "冻在 Ada" }],
        dom: [{ id: "card", label: ".card", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "raw", kind: "script", label: "markRaw" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "raw", to: "dom" }],
      ablations: [
        {
          id: "live",
          prompt: "如果去掉 markRaw？",
          files: { "src/App.vue": nestedLive },
          expected: { kind: "stale", message: "这是对照：立刻 Lin。对象被包了。" },
          lesson: "默认会代理嵌套对象。",
        },
        {
          id: "plain",
          prompt: "如果换成普通对象？",
          files: { "src/App.vue": replacePlain },
          expected: { kind: "stale", message: "章不传染。新对象被包，立刻 Lin。" },
          lesson: "章盖在那一枚上。",
        },
        {
          id: "toraw",
          prompt: "如果改的是已经包好的，却走 toRaw？",
          files: { "src/App.vue": bypass },
          expected: { kind: "stale", message: "走代理亮，绕过冻。同一份数据，两条路。" },
          lesson: "toRaw 是绕开铃，不是盖章。",
        },
      ],
      explanation: {
        headline: "禁止包装，和绕过包装",
        body: "markRaw 事先禁止。toRaw 事后绕开。冻脸很像，时间点不同。下一镜给图表盖章。",
      },
      tryThis: "三种消融：立刻 Lin、立刻 Lin、绕过冻。对上号再恢复盖章冻脸。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先去掉章（对照），再换普通对象（章不传染），再 toRaw（已经包了却绕开）。" },
      ],
    },
    {
      id: "markraw-s7",
      tick: "S7",
      title: "换：给图表盖章",
      goal: "chart 盖章后放进 reactive。加一个点。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "点加一个点。卡片上的数字会？",
        choices: [
          { id: "four", label: "出现 4。标题在 reactive 里，图表也会被带着走", correct: false, why: "章只冻这一枚。title 仍走，points 不走。" },
          { id: "stay", label: "仍是 1,2,3。改标题才会走", correct: true, why: "和 user.name 同一张图。库对象不该被包。" },
          { id: "err", label: "报错", correct: false, why: "能 push。画面不知道。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferRaw },
        blocks: [{ id: "seal", label: "换场景：图表盖章" }],
        narration: "用户换成图表。问的仍是：哪一枚被禁止代理。",
      },
      observe: {
        state: [
          { id: "t", label: "title", value: "仍会走" },
          { id: "p", label: "points", value: "内存有 4，画面没有" },
        ],
        dom: [{ id: "card", label: ".card", value: "1,2,3" }],
        events: [],
      },
      nodes: [
        { id: "chart", kind: "script", label: "markRaw(chart)" },
        { id: "dom", kind: "dom", label: "点数冻" },
      ],
      edges: [{ from: "chart", to: "dom" }],
      ablations: [
        {
          id: "live",
          prompt: "如果图表不盖章？",
          files: { "src/App.vue": transferBefore },
          expected: {
            kind: "stale",
            message: "点数会走到 1,2,3,4。库对象被包了。标题也仍会走。",
          },
          lesson: "下一课：通知也可以你自己设计——customRef 的 track 和 trigger。",
        },
      ],
      explanation: {
        headline: "冻哪一枚，由你盖章",
        body: "浅是按层关。盖章是按对象关。下一课把铃铛交给你：get 时 track，set 时 trigger。",
      },
      faqs: [
        { q: "那点数怎么更新画面？", a: "改完 points 之后，另用一个版本号 ref++，或把 option 换成新对象。别让 Vue 代理图表实例。" },
      ],
      tryThis: "加一个点，数字必须仍是 1,2,3。改标题必须变成库存。",
      mapping: [
        { code: "markRaw(chart)", runtime: "禁止代理", ui: "点数冻" },
        { code: "state.title = …", runtime: "普通字段", ui: "标题走" },
      ],
    },
  ],
};
