import type { CausalLab } from "../types";

const api = `const ITEMS = [
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 payload', done: false },
]

export function getTodos({ delay = 800, empty = false } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(empty ? [] : ITEMS.map((t) => ({ ...t })))
    }, delay)
  })
}
`;

const payloadMod = `export const PAYLOAD = [
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 payload', done: false },
]
`;

const clientFlash = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos } from './api.js'

const todos = ref([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  todos.value = await getTodos()
  loading.value = false
})
</script>
<template>
  <p v-if="loading" class="loading">加载中…</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const payloadOnly = `<script setup>
import { ref } from 'vue'
import { PAYLOAD } from './payload.js'

const todos = ref(PAYLOAD)
</script>
<template>
  <p class="hint">第一帧就有数据。没有加载中。</p>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const wipeThenFetch = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos } from './api.js'
import { PAYLOAD } from './payload.js'

const todos = ref(PAYLOAD)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  todos.value = []
  todos.value = await getTodos()
  loading.value = false
})
</script>
<template>
  <p v-if="loading" class="loading">加载中…</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const keepWhileFetch = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos } from './api.js'
import { PAYLOAD } from './payload.js'

const todos = ref(PAYLOAD)
const refreshing = ref(false)

onMounted(async () => {
  refreshing.value = true
  todos.value = await getTodos()
  refreshing.value = false
})
</script>
<template>
  <p v-if="refreshing" class="hint">后台刷新中，列表先留着。</p>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const emptyOverwrite = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos } from './api.js'
import { PAYLOAD } from './payload.js'

const todos = ref(PAYLOAD)
const refreshing = ref(false)

onMounted(async () => {
  refreshing.value = true
  todos.value = await getTodos({ empty: true })
  refreshing.value = false
})
</script>
<template>
  <p v-if="refreshing" class="hint">后台刷新中，列表先留着。</p>
  <p v-if="!todos.length" class="empty">（空）</p>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const fromWindow = `<script setup>
import { ref } from 'vue'

const todos = ref(window.__PAYLOAD__ ?? [])
</script>
<template>
  <p class="hint">读自 window.__PAYLOAD__</p>
  <p v-if="!todos.length" class="empty">（空）没有注入</p>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const mainInject = `import { createApp } from 'vue'
import App from './App.vue'

window.__PAYLOAD__ = [
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 payload', done: false },
]

createApp(App).mount('#app')
`;

const mainNoInject = `import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
`;

const transferBefore = `<script setup>
import { ref, onMounted } from 'vue'

const body = ref('')
const loading = ref(true)

onMounted(async () => {
  await new Promise((r) => setTimeout(r, 700))
  body.value = 'Teleport 换的是 DOM 父亲。'
  loading.value = false
})
</script>
<template>
  <p v-if="loading" class="loading">加载中…</p>
  <article v-else class="card">
    <h3>一篇文章</h3>
    <p>{{ body }}</p>
  </article>
</template>
`;

const transferAfter = `<script setup>
import { ref, onMounted } from 'vue'

const PAYLOAD = 'Teleport 换的是 DOM 父亲。'
const body = ref(PAYLOAD)
const refreshing = ref(false)

onMounted(async () => {
  refreshing.value = true
  await new Promise((r) => setTimeout(r, 700))
  body.value = PAYLOAD
  refreshing.value = false
})
</script>
<template>
  <p v-if="refreshing" class="hint">后台刷新中。</p>
  <article class="card">
    <h3>一篇文章</h3>
    <p>{{ body }}</p>
  </article>
</template>
`;

export const PAYLOAD_LAB: CausalLab = {
  id: "payload",
  world: 7,
  concept: "ssr-payload",
  title: "第一帧就该有数据",
  subtitle: "服务器已经查过库。客户端第一帧不该再从空列表闪过去。",
  promise:
    "一镜一条边：先看 CSR 的加载中，再把 PAYLOAD 冻进第一帧，再错误地清空再拉，再留下列表后台刷新，再被空响应对掉，再从 window 注入。",
  minutes: 16,
  official: "/guide/scaling-up/ssr.html",
  scenes: [
    {
      id: "payload-s0",
      tick: "S0",
      title: "CSR：先空，再加载",
      goal: "onMounted 才去取。第一帧是加载中。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": clientFlash, "src/api.js": api },
        blocks: [{ id: "csr", label: "① 客户端才 fetch" }],
        narration: "World 4 已经见过这张脸。生产环境若走了 SSR，这张脸不该再出现——服务器已经有数据了。",
      },
      observe: {
        state: [{ id: "loading", label: "loading", value: "true → false", symbol: "loading" }],
        dom: [{ id: "p", label: ".loading", value: "加载中…" }],
        events: [],
      },
      nodes: [
        { id: "mount", kind: "effect", label: "onMounted" },
        { id: "async", kind: "async", label: "getTodos" },
        { id: "dom", kind: "dom", label: "DOM", detail: "先空" },
      ],
      edges: [
        { from: "mount", to: "async" },
        { from: "async", to: "dom", label: "之后" },
      ],
      explanation: {
        headline: "CSR 的第一帧没有数据",
        body: "这不是 bug。没有服务器预渲染时，只能先转圈。SSR 的意义是：HTML 到达时，列表已经在里面。",
      },
      tryThis: "刷新预览。必须先看见「加载中…」，再变成两项。记住这闪一下。",
      faqs: [
        { q: "Nuxt 的 useAsyncData 呢？", a: "服务器 await 完再画 HTML。同一份结果序列化给客户端。第一帧就是列表，不是转圈。" },
        { q: "为什么还要客户端 fetch？", a: "刷新、过期、互动之后。但不要为了刷新，先把第一帧擦空。" },
      ],
    },
    {
      id: "payload-s1",
      tick: "S1",
      title: "PAYLOAD 冻进第一帧",
      goal: "todos = ref(PAYLOAD)。没有 onMounted。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "列表的初值是服务器送来的 PAYLOAD。第一帧会？",
        choices: [
          { id: "list", label: "直接是两项。没有加载中", correct: true, why: "数据已经在模块里。render 第一帧就能画。" },
          { id: "load", label: "仍会加载中，因为没 fetch 就不算有数据", correct: false, why: "fetch 是来源之一。PAYLOAD 也是来源。第一帧只问：ref 里有没有。" },
          { id: "err", label: "报错：不能没有 onMounted", correct: false, why: "合法。这就是 SSR 交给客户端的那一份。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": payloadOnly, "src/payload.js": payloadMod },
        blocks: [{ id: "pl", label: "② todos = ref(PAYLOAD)" }],
        narration: "请求发生在服务器（这里用一份冻住的模块扮演）。客户端只是把它画出来。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2（第一帧）", symbol: "todos" }],
        dom: [{ id: "list", label: "ul", value: "两项立刻在" }],
        events: [],
      },
      nodes: [
        { id: "payload", kind: "script", label: "PAYLOAD", symbol: "PAYLOAD" },
        { id: "todos", kind: "ref", label: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "payload", to: "todos", label: "第一帧" },
        { from: "todos", to: "dom" },
      ],
      explanation: {
        headline: "冻住的数据，就是第一帧的源",
        body: "HTML 里已经有两项。水合接上事件。用户不经过「空」。这和 hydrate 课同一纪律：第一帧要有东西，而且要和服务器那份相同。",
      },
      faqs: [
        { q: "这份 PAYLOAD 会过期吗？", a: "会。所以稍后可以后台再拉。但过期不等于第一帧该是空的。" },
        { q: "payload.js 在真 SSR 里是什么？", a: "内联进 HTML 的 JSON，或 Nuxt 的 payload 文件。模块只是教学里看得见的盒子。" },
      ],
      tryThis: "刷新。必须立刻看见两项，不能闪「加载中」。",
      mapping: [{ code: "ref(PAYLOAD)", runtime: "第一帧已有数据", ui: "没有转圈" }],
    },
    {
      id: "payload-s2",
      tick: "S2",
      title: "先清空，再去拉",
      goal: "有 PAYLOAD，onMounted 却把列表改成 [] 并亮加载中。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "第一帧有两项。挂载后立刻 todos = []、loading = true。用户会？",
        choices: [
          { id: "keep", label: "仍看见两项，因为 PAYLOAD 还在", correct: false, why: "你刚把 ref 改成空。第一帧的礼物被扔了。" },
          { id: "flash", label: "闪回加载中，再变成两项。SSR 白做了", correct: true, why: "这是最常见的接错：拿到 payload 仍按 CSR 的仪式走一遍。" },
          { id: "err", label: "报错：不能改 PAYLOAD", correct: false, why: "改的是 todos 这只盒子，不是常量本身。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": wipeThenFetch,
          "src/api.js": api,
          "src/payload.js": payloadMod,
        },
        blocks: [{ id: "wipe", label: "③ 挂载时清空再 fetch" }],
        narration: "PAYLOAD 还在。你亲手把它从画面上擦掉。",
      },
      observe: {
        state: [{ id: "loading", label: "loading", value: "挂载后 true", symbol: "loading" }],
        dom: [{ id: "flash", label: "脸", value: "两项 → 加载中 → 两项" }],
        events: [],
      },
      nodes: [
        { id: "payload", kind: "script", label: "PAYLOAD" },
        { id: "wipe", kind: "effect", label: "todos = []" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "payload", to: "dom", label: "第一帧" },
        { from: "wipe", to: "dom", label: "擦掉" },
      ],
      why: {
        question: "为什么「有 payload 还要 loading」会毁掉 SSR？",
        choices: [
          { id: "gift", label: "用户已经看见列表。再转圈等于把服务器工作当场扔掉", correct: true, why: "刷新数据可以在后台。第一帧的礼物不要退货。" },
          { id: "need", label: "必须 loading，否则不知道 fetch 在不在跑", correct: false, why: "可以用「刷新中」而不拆掉列表。下一镜。" },
          { id: "hyd", label: "必须清空才能水合", correct: false, why: "水合要的是第一帧和服务器相同。清空让它们立刻分叉。" },
        ],
      },
      explanation: {
        headline: "不要把礼物退回去",
        body: "CSR 的仪式是：空 → 转圈 → 数据。SSR 的第一帧已经是数据。再走一遍 CSR 仪式，用户看见一次倒退。",
      },
      faqs: [
        { q: "和 hydrate mismatch 有何关系？", a: "若服务器 HTML 是列表，客户端第一帧变成加载中，树也对不上。擦空既闪一下，也可能警告。" },
      ],
      tryThis: "刷新。第一帧两项，立刻变成加载中，再变回两项。这是倒退。",
      mapping: [{ code: "todos.value = []", runtime: "丢掉 payload", ui: "闪回空" }],
    },
    {
      id: "payload-s3",
      tick: "S3",
      title: "列表留着，后台刷新",
      goal: "不改 todos 为 []。只把 refreshing 设为 true。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "挂载后去 fetch，但不清空列表。用户会？",
        choices: [
          { id: "keep", label: "一直看见两项。或许有一句「后台刷新中」", correct: true, why: "第一帧的礼物留下。新数据到达再替换。" },
          { id: "flash", label: "仍会闪，因为 fetch 期间 Vue 必须空白", correct: false, why: "没有人规定 fetch 时 DOM 必须空。" },
          { id: "dup", label: "会变成四项，新旧叠在一起", correct: false, why: "赋值替换整份数组，不是 concat。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": keepWhileFetch,
          "src/api.js": api,
          "src/payload.js": payloadMod,
        },
        blocks: [{ id: "keep", label: "④ 不清空，只标 refreshing" }],
        narration: "只删掉 todos = [] 和整页 loading。数据还在树上。",
      },
      observe: {
        state: [{ id: "ref", label: "refreshing", value: "true → false" }],
        dom: [{ id: "list", label: "ul", value: "两项不消失" }],
        events: [],
      },
      nodes: [
        { id: "payload", kind: "script", label: "PAYLOAD" },
        { id: "fetch", kind: "async", label: "getTodos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "payload", to: "dom", label: "一直在" },
        { from: "fetch", to: "dom", label: "稍后替换" },
      ],
      explanation: {
        headline: "刷新不是从零开始",
        body: "pending 可以是一句提示，不必拆掉列表。Nuxt 的 pending vs refresh，差的就是会不会把第一帧退回空。",
      },
      faqs: [
        { q: "数据若真的变了呢？", a: "替换数组。用户看见的是旧 → 新，不是有 → 无 → 有。" },
      ],
      tryThis: "刷新。两项必须一直在。「后台刷新中」可以出现，加载中整页空白不可以。",
      mapping: [{ code: "refreshing = true（不清空）", runtime: "payload 仍在", ui: "列表不闪" }],
    },
    {
      id: "payload-s4",
      tick: "S4",
      title: "空响应把礼物盖掉",
      goal: "后台 fetch 返回 []。列表被换成空。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "PAYLOAD 是两项。客户端 fetch 得到空数组并赋值。最终会？",
        choices: [
          { id: "keep", label: "仍是两项。空响应不该覆盖 payload", correct: false, why: "你写了赋值。空也是一份数据。它会盖住第一帧。" },
          { id: "empty", label: "变成空。第一帧的两项被后来的空吃掉", correct: true, why: "后台刷新仍是写入。错的响应和擦空一样致命，只是来得晚。" },
          { id: "err", label: "报错：不能用空覆盖", correct: false, why: "合法。要你自己决定空是否可信。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": emptyOverwrite,
          "src/api.js": api,
          "src/payload.js": payloadMod,
        },
        blocks: [{ id: "empty", label: "⑤ fetch 得到 []" }],
        narration: "没有 todos = []。空是接口给的。结果仍是礼物消失。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2 → 0", symbol: "todos" }],
        dom: [{ id: "empty", label: ".empty", value: "（空）" }],
        events: [],
      },
      nodes: [
        { id: "payload", kind: "script", label: "PAYLOAD" },
        { id: "empty", kind: "async", label: "[]" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "payload", to: "dom", label: "第一帧" },
        { from: "empty", to: "dom", label: "盖掉" },
      ],
      explanation: {
        headline: "空也是一次写入",
        body: "擦空是你亲手丢。空响应是后来者丢。两种都让第一帧的工作作废。真项目里要对空、对失败做策略：保留旧列表，还是真的清空。",
      },
      faqs: [
        { q: "失败该不该覆盖？", a: "通常不该。World 4：error 是另一张脸，不是把 todos 改成 []。" },
      ],
      tryThis: "刷新。先看见两项，随后变成空。礼物被后来的空吃掉。",
      mapping: [{ code: "todos = await getTodos({ empty: true })", runtime: "空写入", ui: "列表消失" }],
    },
    {
      id: "payload-s5",
      tick: "S5",
      title: "从入口注入",
      goal: "main.js 写入 window.__PAYLOAD__。App 读它。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "没有 payload.js。入口把数据挂在 window 上。App 第一帧会？",
        choices: [
          { id: "list", label: "两项。入口在 mount 之前注入", correct: true, why: "真 SSR 把 JSON 内联进 HTML，客户端 setup 读到同一份。" },
          { id: "empty", label: "空。window 要等 onMounted", correct: false, why: "脚本顺序：先注入，再 createApp。setup 时已经在。" },
          { id: "err", label: "真 SSR 里 window 不存在，一定炸", correct: false, why: "注入发生在客户端入口。服务器画 HTML 时用的是自己那份，不读 window。两边值相同才安全。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainInject,
          "src/App.vue": fromWindow,
        },
        blocks: [{ id: "win", label: "⑥ window.__PAYLOAD__" }],
        narration: "盒子换了地方：从模块变成入口注入。第一帧仍要读到同一份。",
      },
      observe: {
        state: [{ id: "p", label: "__PAYLOAD__", value: "2", symbol: "PAYLOAD" }],
        dom: [{ id: "list", label: "ul", value: "两项" }],
        events: [],
      },
      nodes: [
        { id: "main", kind: "script", label: "main.js" },
        { id: "app", kind: "component", label: "App" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "main", to: "app", label: "注入" },
        { from: "app", to: "dom" },
      ],
      ablations: [
        {
          id: "no",
          prompt: "如果入口忘记注入？",
          files: { "src/main.js": mainNoInject, "src/App.vue": fromWindow },
          expected: {
            kind: "stale",
            message: "列表空。App 读到 undefined，落成 []。",
          },
          lesson: "入口没交出来，组件就没有第一帧的礼物。和 provide 没人 inject 同一类。",
        },
      ],
      explanation: {
        headline: "礼物要从入口交出来",
        body: "模块、window、Nuxt payload，都是盒子。重要的是：服务器用过的那份，客户端第一帧读到的是同一份，而且不要再擦空。",
      },
      faqs: [
        { q: "为什么不一直用 payload.js？", a: "教学里模块最看得见。真项目里数据是请求算出来的，只能在这次响应里注入，不能写死在源码。" },
        { q: "hydrate 课的 window 呢？", a: "那一课禁止在 setup 读 innerWidth——那是浏览器环境。这一课读的是入口刚刚写入的数据。数据不是环境。" },
      ],
      tryThis: "确认两项在。再试「入口忘记注入」：变成空。看完恢复。",
      mapping: [
        { code: "window.__PAYLOAD__ = [...]", runtime: "入口注入", ui: "第一帧有列表" },
        { code: "忘记注入", runtime: "undefined ?? []", ui: "空" },
      ],
    },
    {
      id: "payload-s6",
      tick: "S6",
      title: "拆回 CSR / 擦空 / 空覆盖",
      goal: "三种坏法：没有礼物、亲手丢掉、被空响应对掉。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到「onMounted 才 fetch、第一帧 loading」。用户会？",
        choices: [
          { id: "flash", label: "先加载中，再两项", correct: true, why: "CSR 仪式。SSR 的第一帧礼物不在了。" },
          { id: "keep", label: "仍立刻两项", correct: false, why: "没有 PAYLOAD。" },
          { id: "err", label: "报错", correct: false, why: "能跑。只是慢一拍。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": keepWhileFetch,
          "src/api.js": api,
          "src/payload.js": payloadMod,
        },
        blocks: [{ id: "keep", label: "后台刷新版先留着" }],
        narration: "先刷新确认两项一直在。再分别：纯 CSR、擦空再拉、空响应覆盖。",
      },
      observe: {
        state: [{ id: "ok", label: "todos", value: "第一帧就有" }],
        dom: [{ id: "list", label: "ul", value: "不闪" }],
        events: [],
      },
      nodes: [
        { id: "payload", kind: "script", label: "PAYLOAD" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "payload", to: "dom" }],
      ablations: [
        {
          id: "csr",
          prompt: "如果没有 PAYLOAD？",
          files: { "src/App.vue": clientFlash, "src/api.js": api },
          expected: { kind: "stale", message: "先加载中。CSR 的第一帧。" },
          lesson: "没有冻住的数据，就没有 SSR 的第一帧。",
        },
        {
          id: "wipe",
          prompt: "如果挂载时清空？",
          files: {
            "src/App.vue": wipeThenFetch,
            "src/api.js": api,
            "src/payload.js": payloadMod,
          },
          expected: { kind: "stale", message: "两项闪成加载中。礼物退货。" },
          lesson: "不要按 CSR 仪式把第一帧擦掉。",
        },
        {
          id: "empty",
          prompt: "如果刷新得到空数组？",
          files: {
            "src/App.vue": emptyOverwrite,
            "src/api.js": api,
            "src/payload.js": payloadMod,
          },
          expected: { kind: "stale", message: "两项被后来的空盖掉。" },
          lesson: "空也是写入。要不要信，是策略。",
        },
      ],
      explanation: {
        headline: "第一帧的三种死法",
        body: "没有礼物、亲手丢掉、被后来的空盖住。Nuxt / 手写 SSR 要守的就是：冻住、交出去、不要退货。",
      },
      tryThis: "三种消融都刷新一次。转圈、闪一下、变空，对上号再恢复。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先没有 payload，再擦空，再空覆盖。一次比一次更像「我有 SSR」，礼物却没了。" },
      ],
    },
    {
      id: "payload-s7",
      tick: "S7",
      title: "换：一篇文章",
      goal: "正文现在 onMounted 才到。第一帧该不该转圈？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "文章正文 700ms 后才赋值。若服务器已经查过正文，第一帧最该？",
        choices: [
          { id: "load", label: "仍显示加载中。正文必须 fetch 才算数", correct: false, why: "和待办同一张图。服务器查过就该冻进第一帧。" },
          { id: "body", label: "直接是文章。刷新可以在后台", correct: true, why: "PAYLOAD 是正文。转圈是 CSR 的第一帧，不该带回生产环境。" },
          { id: "empty", label: "先空文章，避免 mismatch", correct: false, why: "服务器若画了正文，客户端第一帧变空，才是 mismatch。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "article", label: "换场景：文章" }],
        narration: "列表换成正文。问的仍是：第一帧有没有礼物。",
      },
      observe: {
        state: [{ id: "body", label: "body", value: "晚到" }],
        dom: [{ id: "load", label: ".loading", value: "加载中…" }],
        events: [],
      },
      nodes: [
        { id: "mount", kind: "effect", label: "onMounted" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "mount", to: "dom", label: "700ms" }],
      ablations: [
        {
          id: "pl",
          prompt: "冻进第一帧并后台刷新之后？",
          files: { "src/App.vue": transferAfter },
          expected: {
            kind: "stale",
            message: "这是修复：文章立刻在。刷新中那一行可以出现，正文不消失。",
          },
          lesson: "World 7 收束：两帧对齐，请求隔离，第一帧带着冻住的数据。TS 还没上场，机制已经可以上线。",
        },
      ],
      explanation: {
        headline: "生产环境是三件事叠在一起",
        body: "水合要对齐。状态不能漏到下一个请求。数据要冻进第一帧。Nuxt 把它们包成框架；因果仍是这三条边。",
      },
      faqs: [
        { q: "这就是 Nuxt 吗？", a: "Nuxt 是这三条边的默认实现：SSR + 每请求上下文 + payload。课里不装 Nuxt，是为了让你看见边，而不是只看见命令。" },
        { q: "TypeScript 呢？", a: "它不改这三条边。它给边加上契约。下一课才轮到类型。" },
      ],
      tryThis: "先看加载中。再打开冻住版：正文必须立刻在，刷新中可以有，空白不可以。",
      mapping: [
        { code: "onMounted 才赋正文", runtime: "CSR 第一帧", ui: "加载中" },
        { code: "ref(PAYLOAD) + 后台刷新", runtime: "SSR 第一帧", ui: "文章在" },
      ],
    },
  ],
};
