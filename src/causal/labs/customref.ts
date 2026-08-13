import type { CausalLab, CounterfactualWorld } from "../types";

const plain = `<script setup>
import { ref } from 'vue'
const text = ref('Ada')
const tick = ref(0)
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">画面 {{ text }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <input v-model="text" placeholder="打字" />
  <button @click="redraw">强迫刷新</button>
</template>
`;

const debounced = `<script setup>
import { customRef, ref } from 'vue'
let value = 'Ada'
let timer
const text = customRef((track, trigger) => ({
  get() {
    track()
    return value
  },
  set(v) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      value = v
      trigger()
    }, 400)
  },
}))
const tick = ref(0)
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">画面 {{ text }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次 · 延迟 400ms</p>
  <input v-model="text" placeholder="打字" />
  <button @click="redraw">强迫刷新</button>
</template>
`;

const immediateCustom = `<script setup>
import { customRef, ref } from 'vue'
let value = 'Ada'
const text = customRef((track, trigger) => ({
  get() {
    track()
    return value
  },
  set(v) {
    value = v
    trigger()
  },
}))
const tick = ref(0)
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">画面 {{ text }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次 · 无延迟</p>
  <input v-model="text" placeholder="打字" />
  <button @click="redraw">强迫刷新</button>
</template>
`;

const noTrigger = `<script setup>
import { customRef, ref } from 'vue'
let value = 'Ada'
let ping
const text = customRef((track, trigger) => {
  ping = trigger
  return {
    get() {
      track()
      return value
    },
    set(v) {
      value = v
    },
  }
})
const tick = ref(0)
function notify() { ping() }
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">画面 {{ text }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <input v-model="text" placeholder="打字" />
  <button @click="notify">手动 trigger</button>
  <button @click="redraw">强迫刷新</button>
</template>
`;

const noTrack = `<script setup>
import { customRef, ref } from 'vue'
let value = 'Ada'
let ping
const text = customRef((track, trigger) => {
  ping = trigger
  return {
    get() {
      return value
    },
    set(v) {
      value = v
      trigger()
    },
  }
})
const tick = ref(0)
function notify() { ping() }
function redraw() { tick.value++ }
</script>
<template>
  <p class="card">画面 {{ text }}</p>
  <p class="hint">强迫刷新 {{ tick }} 次</p>
  <input v-model="text" placeholder="打字" />
  <button @click="notify">手动 trigger</button>
  <button @click="redraw">强迫刷新</button>
</template>
`;

const transferBefore = `<script setup>
import { customRef } from 'vue'
let value = ''
let timer
const q = customRef((track, trigger) => ({
  get() {
    track()
    return value
  },
  set(v) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      value = v
      trigger()
    }, 400)
  },
}))
</script>
<template>
  <p class="card">搜索 {{ q || '（空）' }}</p>
  <input v-model="q" placeholder="搜名字" />
</template>
`;

const transferImmediate = `<script setup>
import { ref } from 'vue'
const q = ref('')
</script>
<template>
  <p class="card">搜索 {{ q || '（空）' }}</p>
  <input v-model="q" placeholder="搜名字" />
</template>
`;

const worldNow: CounterfactualWorld = {
  id: "now",
  name: "立刻写回",
  tagline: "ref / 无延迟 customRef",
  files: { "src/App.vue": plain },
  nodes: [
    { id: "set", kind: "event", label: "input" },
    { id: "dom", kind: "dom", label: "画面立刻走" },
  ],
  edges: [{ from: "set", to: "dom" }],
  note: "每个字都 track + trigger。卡片和输入框同一张脸。",
};

const worldLater: CounterfactualWorld = {
  id: "later",
  name: "400ms 后写回",
  tagline: "setTimeout 里才 trigger",
  files: { "src/App.vue": debounced },
  nodes: [
    { id: "input", kind: "event", label: "输入框已变" },
    { id: "dom", kind: "dom", label: "画面还是旧的" },
  ],
  edges: [{ from: "input", to: "dom", label: "等 400ms" }],
  note: "set 把值藏到定时器里。内存和画面都还是 Ada，直到铃响。",
};

export const CUSTOMREF_LAB: CausalLab = {
  id: "customref",
  world: 10,
  concept: "customRef",
  title: "铃铛交给你",
  subtitle: "get 时 track，set 时 trigger。少一边，画面就冻。把 trigger 推迟，画面就滞后。",
  promise:
    "一镜一条边：先普通 ref 立刻走，再 400ms 滞后，再延迟期间强迫刷新仍是旧值，再无延迟的 customRef 同一张脸，再 set 不敲钟，再 get 不订阅。",
  minutes: 16,
  official: "/api/reactivity-advanced.html#customref",
  scenes: [
    {
      id: "customref-s0",
      tick: "S0",
      title: "普通 ref，每个字都走",
      goal: "text = ref('Ada')。v-model。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": plain },
        blocks: [{ id: "ref", label: "① ref + v-model" }],
        narration: "World 2 已经见过。这一课要拆开铃铛。先认立刻走的脸。",
      },
      observe: {
        state: [{ id: "t", label: "text", value: "每个字都变", symbol: "text" }],
        dom: [{ id: "card", label: ".card", value: "跟着输入框" }],
        events: [{ id: "input", label: "input", value: "立刻 trigger" }],
      },
      nodes: [
        { id: "input", kind: "event", label: "input" },
        { id: "text", kind: "ref", label: "text" },
        { id: "dom", kind: "dom", label: "画面" },
      ],
      edges: [
        { from: "input", to: "text" },
        { from: "text", to: "dom" },
      ],
      explanation: {
        headline: "ref 内部就是 track + trigger",
        body: "读的时候登记订阅。写的时候敲钟。下一镜把敲钟推迟 400ms。",
      },
      tryThis: "把 Ada 改成 Lin。卡片必须跟着每个字变，不要等。",
      faqs: [
        { q: "强迫刷新现在有用吗？", a: "没必要。画面已经是新的。它留给后面冻住的时候当镜子。" },
      ],
    },
    {
      id: "customref-s1",
      tick: "S1",
      title: "把敲钟推迟 400ms",
      goal: "customRef：set 里 setTimeout 400ms 才赋值并 trigger。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "很快把 Ada 改成 Lin，还没停手 400ms。卡片会？",
        choices: [
          { id: "live", label: "跟着每个字变。v-model 总会立刻写", correct: false, why: "v-model 调用的是你的 set。你把 trigger 推迟了。" },
          { id: "lag", label: "输入框已经是 Lin，卡片还是 Ada，停手后才追上", correct: true, why: "原生输入框自己留下了字。Vue 的画面还在等铃。" },
          { id: "snap", label: "输入框也会弹回 Ada", correct: false, why: "没有立刻重渲染时，浏览器控件可以暂时超前。400ms 后两者一起到 Lin。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": debounced },
        blocks: [{ id: "delay", label: "② 延迟 trigger" }],
        narration: "get 仍立刻 track。set 把值和铃都藏进定时器。",
      },
      counterfactual: {
        id: "now-vs-later",
        title: "立刻 vs 滞后",
        setup: "同一个输入框。差在 set 里有没有 setTimeout。",
        worlds: [worldNow, worldLater],
        punchline: "输入框是 DOM。画面是订阅。你可以让它们暂时不是同一张脸。",
      },
      observe: {
        state: [{ id: "t", label: "text", value: "400ms 后才变" }],
        dom: [{ id: "card", label: ".card", value: "滞后" }],
        events: [],
      },
      nodes: [
        { id: "input", kind: "event", label: "DOM 输入" },
        { id: "timer", kind: "effect", label: "400ms" },
        { id: "dom", kind: "dom", label: "画面" },
      ],
      edges: [
        { from: "input", to: "timer" },
        { from: "timer", to: "dom", label: "trigger" },
      ],
      explanation: {
        headline: "延迟的是铃，不是输入框",
        body: "这就是防抖。下一镜在 400ms 内点强迫刷新：内存也还是旧的，因为赋值同样在定时器里。",
      },
      faqs: [
        { q: "和 World 4 搜索防抖一样吗？", a: "脸一样：查询滞后。那里是 watch 里 setTimeout。这里是 ref 自己的 set。边更短。" },
      ],
      tryThis: "快速打成 Lin。卡片必须先停在 Ada，停手约 400ms 后才变成 Lin。打开反事实。",
      mapping: [{ code: "setTimeout(..., 400)", runtime: "推迟 trigger", ui: "画面滞后" }],
    },
    {
      id: "customref-s2",
      tick: "S2",
      title: "延迟期间，内存也还是旧的",
      goal: "仍是 400ms。打字后立刻强迫刷新。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "刚打完 Lin 立刻点强迫刷新（不到 400ms）。卡片会？",
        choices: [
          { id: "lin", label: "变成 Lin。刷新会读到输入框", correct: false, why: "强迫刷新读的是 customRef 的 get。value 还没被赋值。" },
          { id: "ada", label: "仍是 Ada。值还在定时器外面", correct: true, why: "set 只安排了将来。现在 value 仍是 Ada。刷新把旧值又画一遍。" },
          { id: "empty", label: "变成空。刷新会清掉未提交的字", correct: false, why: "输入框可能还显示 Lin。卡片仍 Ada。两张脸。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": debounced },
        blocks: [{ id: "peek", label: "③ 延迟内刷新" }],
        narration: "代码一行没改。只改你何时点强迫刷新。一条边：赋值发生在铃响的那一刻。",
      },
      observe: {
        state: [{ id: "t", label: "value", value: "仍是 Ada" }],
        dom: [{ id: "card", label: ".card", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "timer", kind: "effect", label: "定时器未到" },
        { id: "val", kind: "ref", label: "value" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [{ from: "timer", to: "dom", label: "还没写" }],
      explanation: {
        headline: "推迟的是赋值本身",
        body: "浅 ref 那一课：内存先变，画面后知道。这一课相反：画面和内存一起等，DOM 输入框自己超前。下一镜去掉定时器，customRef 就和 ref 同一张脸。",
      },
      faqs: [
        { q: "为什么输入框能超前？", a: "浏览器先改了控件。Vue 还没重渲染去 :value。定时器一到，两边对齐。" },
      ],
      tryThis: "打 Lin 后立刻强迫刷新，卡片必须仍是 Ada。等一会儿不要点，卡片自己变成 Lin。",
      mapping: [{ code: "value = v 写在 timeout 里", runtime: "现在仍是旧值", ui: "刷新也救不了" }],
    },
    {
      id: "customref-s3",
      tick: "S3",
      title: "无延迟的 customRef",
      goal: "set 里立刻 value = v; trigger()。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "现在每个字都立刻敲钟。卡片会？",
        choices: [
          { id: "live", label: "跟着每个字变。和 ref 同一张脸", correct: true, why: "customRef 不发明新机制。你自己把 ref 的两步写出来。" },
          { id: "lag", label: "仍滞后。customRef 默认防抖", correct: false, why: "默认什么都不做。延迟是你写的 setTimeout。" },
          { id: "err", label: "必须从 vue 再 import ref", correct: false, why: "这一镜只用 customRef。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": immediateCustom },
        blocks: [{ id: "sync", label: "④ 立刻 track + trigger" }],
        narration: "糖拆开了。脸必须和 S0 一样。",
      },
      observe: {
        state: [{ id: "t", label: "text", value: "立刻走" }],
        dom: [{ id: "card", label: ".card", value: "跟着输入框" }],
        events: [],
      },
      nodes: [
        { id: "get", kind: "script", label: "track" },
        { id: "set", kind: "script", label: "trigger" },
        { id: "dom", kind: "dom", label: "画面" },
      ],
      edges: [
        { from: "get", to: "dom", label: "订阅" },
        { from: "set", to: "dom", label: "通知" },
      ],
      explanation: {
        headline: "ref 就是这对边的糖",
        body: "和 defineModel 同一句：糖不发明第三条边。下一镜故意不敲钟。",
      },
      faqs: [
        { q: "那为什么还要 customRef？", a: "当你要推迟、合并、拒绝某次写入。默认 ref 没有这些阀门。" },
      ],
      tryThis: "打 Lin。卡片必须跟着每个字变，和第一镜一样。",
      mapping: [{ code: "set(v) { value = v; trigger() }", runtime: "立刻通知", ui: "同一张脸" }],
    },
    {
      id: "customref-s4",
      tick: "S4",
      title: "写了，但不敲钟",
      goal: "set 只赋值，不 trigger。另有手动 trigger 按钮。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打成 Lin。先看卡片，再点「手动 trigger」。会？",
        choices: [
          { id: "split", label: "打字时冻在 Ada，点手动 trigger 才变成 Lin", correct: true, why: "内存已经是 Lin。缺的是通知。和 triggerRef 同一张图。" },
          { id: "live", label: "打字就会走。v-model 自己会敲钟", correct: false, why: "v-model 只调用 set。钟在你手里。" },
          { id: "never", label: "手动 trigger 也救不了，必须强迫刷新", correct: false, why: "get 里有 track。画面订过阅。trigger 能救。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": noTrigger },
        blocks: [{ id: "silent", label: "⑤ set 不 trigger" }],
        narration: "订阅在。铃不在 set 里。你自己决定何时敲。",
      },
      observe: {
        state: [{ id: "t", label: "value", value: "已是 Lin，画面 Ada" }],
        dom: [{ id: "card", label: ".card", value: "Ada，直到手动 trigger" }],
        events: [],
      },
      nodes: [
        { id: "set", kind: "script", label: "value = v" },
        { id: "ping", kind: "effect", label: "trigger" },
        { id: "dom", kind: "dom", label: "画面" },
      ],
      edges: [
        { from: "set", to: "dom", label: "没铃" },
        { from: "ping", to: "dom" },
      ],
      explanation: {
        headline: "有订阅，缺通知",
        body: "和 shallowRef + triggerRef 同一条缝。下一镜反过来：敲钟了，但 get 时没登记订阅。",
      },
      faqs: [
        { q: "强迫刷新也能救吗？", a: "能。tick 让整页重读 get。手动 trigger 更干净：只通知订过这份值的人。" },
      ],
      tryThis: "打 Lin，卡片必须仍是 Ada。点手动 trigger，必须变成 Lin。不要先点强迫刷新。",
      mapping: [{ code: "set(v) { value = v }", runtime: "内存变了", ui: "画面等 trigger" }],
    },
    {
      id: "customref-s5",
      tick: "S5",
      title: "敲钟了，可是没人订",
      goal: "get 不调用 track()。set 立刻 trigger。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打成 Lin。点「手动 trigger」。卡片会？",
        choices: [
          { id: "lin", label: "变成 Lin。毕竟敲钟了", correct: false, why: "渲染时 get 没 track。这份值没有订阅者。钟敲给空气。" },
          { id: "ada", label: "仍是 Ada。强迫刷新才会变成 Lin", correct: true, why: "tick 是另一份 ref，它逼整页重跑。重跑时 get 读到新值，但仍然不会订阅下一次。" },
          { id: "err", label: "没用 track 会报错", correct: false, why: "不会报错。静默冻住。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": noTrack },
        blocks: [{ id: "deaf", label: "⑥ get 不 track" }],
        narration: "铃在敲。名单是空的。",
      },
      observe: {
        state: [{ id: "t", label: "value", value: "Lin" }],
        dom: [{ id: "card", label: ".card", value: "Ada，直到强迫刷新" }],
        events: [],
      },
      nodes: [
        { id: "trig", kind: "effect", label: "trigger" },
        { id: "get", kind: "script", label: "get 无 track" },
        { id: "dom", kind: "dom", label: "冻住" },
      ],
      edges: [{ from: "trig", to: "dom", label: "没订阅者" }],
      why: {
        question: "和上一镜「不敲钟」是同一张图吗？",
        choices: [
          { id: "pair", label: "同一条门的两扇合页。上一镜缺通知，这一镜缺订阅", correct: true, why: "和 v-model 的读/写、defineModel 的两扇合页同一张图。" },
          { id: "same", label: "完全一样，都是忘了 trigger", correct: false, why: "这一镜 trigger 在。缺的是 track。" },
          { id: "vue", label: "Vue 会自动 track 模板里出现的 customRef", correct: false, why: "模板读会进 get。get 自己不登记，就没订阅。" },
        ],
      },
      explanation: {
        headline: "有通知，缺订阅",
        body: "手动 trigger 救不了。强迫刷新能救这一帧，下一击仍冻。track 和 trigger 必须成对，和 v-model 那对边一样。",
      },
      faqs: [
        { q: "为什么强迫刷新能看见 Lin？", a: "tick 让组件重新渲染。渲染会再调用 get，读到当前 value。但它仍不订阅，所以下一击还要再刷新。" },
      ],
      tryThis: "打 Lin，卡片必须仍是 Ada。点手动 trigger，必须仍是 Ada。再强迫刷新，必须变成 Lin。",
      mapping: [{ code: "get() { return value }", runtime: "不登记", ui: "trigger 敲给空气" }],
    },
    {
      id: "customref-s6",
      tick: "S6",
      title: "拆成滞后 / 不敲钟 / 不订阅",
      goal: "三种坏法：400ms、set 无 trigger、get 无 track。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到立刻敲钟的 customRef。打字会？",
        choices: [
          { id: "live", label: "立刻走", correct: true, why: "先确认好的脸。" },
          { id: "lag", label: "滞后", correct: false, why: "那是定时器。" },
          { id: "freeze", label: "冻住", correct: false, why: "那是缺一边。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": immediateCustom },
        blocks: [{ id: "keep", label: "成对的 track/trigger 先留着" }],
        narration: "先打字确认立刻走。再分别：滞后、不敲钟、不订阅。",
      },
      observe: {
        state: [{ id: "ok", label: "text", value: "立刻走" }],
        dom: [{ id: "card", label: ".card", value: "跟着走" }],
        events: [],
      },
      nodes: [
        { id: "pair", kind: "ref", label: "track + trigger" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "pair", to: "dom" }],
      ablations: [
        {
          id: "delay",
          prompt: "如果 trigger 推迟 400ms？",
          files: { "src/App.vue": debounced },
          expected: { kind: "stale", message: "输入框超前，画面滞后。" },
          lesson: "铃可以晚点再敲。",
        },
        {
          id: "noping",
          prompt: "如果 set 不 trigger？",
          files: { "src/App.vue": noTrigger },
          expected: { kind: "stale", message: "打字冻住。手动 trigger 能救。" },
          lesson: "有订阅，缺通知。",
        },
        {
          id: "notrack",
          prompt: "如果 get 不 track？",
          files: { "src/App.vue": noTrack },
          expected: { kind: "stale", message: "手动 trigger 救不了。强迫刷新只能救一帧。" },
          lesson: "有通知，缺订阅。",
        },
      ],
      explanation: {
        headline: "铃铛的三种用法",
        body: "推迟、不敲、不订。World 10 收束：订阅停在哪一层、哪一枚对象、哪一次 get/set，画面就停在哪。",
      },
      tryThis: "三种消融都打一次 Lin：滞后、手动 trigger 能救、手动 trigger 救不了。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先滞后（铃还在），再不敲钟，再不订阅。一次比一次更像冻死。" },
      ],
    },
    {
      id: "customref-s7",
      tick: "S7",
      title: "换：搜索框",
      goal: "q 是 400ms 防抖的 customRef。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "很快打 vue。卡片「搜索」会？",
        choices: [
          { id: "live", label: "每个字都变。搜索必须跟手", correct: false, why: "和名字那一课同一张滞后脸。" },
          { id: "lag", label: "先停在（空），停手后才变成 vue", correct: true, why: "World 4 用 watch 防抖。现在铃就在 ref 上。" },
          { id: "err", label: "报错", correct: false, why: "能跑。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "search", label: "换场景：搜索" }],
        narration: "名字换成查询。问的仍是：铃什么时候敲。",
      },
      observe: {
        state: [{ id: "q", label: "q", value: "400ms 后才有" }],
        dom: [{ id: "card", label: ".card", value: "（空）→ vue" }],
        events: [],
      },
      nodes: [
        { id: "q", kind: "ref", label: "q" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "q", to: "dom" }],
      ablations: [
        {
          id: "now",
          prompt: "如果换成普通 ref？",
          files: { "src/App.vue": transferImmediate },
          expected: {
            kind: "stale",
            message: "这是对照：每个字都搜索。铃立刻敲。",
          },
          lesson: "World 10 收束：深浅、盖章、铃铛。追踪停在哪，画面就停在哪。",
        },
      ],
      explanation: {
        headline: "防抖是推迟敲钟",
        body: "World 1 让按钮活起来。World 10 告诉你活起来的边界：哪一层、哪一枚、哪一次通知。类型和双向门管契约；这里管追踪本身。",
      },
      faqs: [
        { q: "搜索该用 customRef 还是 watch？", a: "都能做。watch 适合「值立刻变、请求晚点发」。customRef 适合「值本身就该晚点变」。这一课要你看见铃在哪。" },
      ],
      tryThis: "快打 vue，卡片必须先是（空），停手后才出现 vue。再打开普通 ref：每个字都走。",
      mapping: [
        { code: "延迟 customRef", runtime: "铃晚点敲", ui: "搜索滞后" },
        { code: "ref('')", runtime: "立刻敲", ui: "每个字都搜" },
      ],
    },
  ],
};
