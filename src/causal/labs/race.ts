import type { CausalLab, CounterfactualWorld } from "../types";

const api = `const USERS = [
  { id: 1, name: 'Ada', bio: '慢请求 · 约 1.8s' },
  { id: 2, name: 'Lin', bio: '快请求 · 约 0.3s' },
]

export function getUser(id, { delay, signal } = {}) {
  const ms = delay ?? (id === 1 ? 1800 : 280)
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(USERS.find((u) => u.id === id) ?? null)
    }, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}
`;

const oneUser = `<script setup>
import { ref } from 'vue'
import { getUser } from './api.js'

const user = ref(null)
const loading = ref(false)

async function load() {
  loading.value = true
  user.value = await getUser(1)
  loading.value = false
}
</script>

<template>
  <button @click="load">加载 Ada</button>
  <p v-if="loading" class="loading">加载中…</p>
  <div v-else-if="user" class="card">
    <h3>{{ user.name }}</h3>
    <p class="hint">{{ user.bio }}</p>
  </div>
</template>
`;

const raceBare = `<script setup>
import { ref } from 'vue'
import { getUser } from './api.js'

const user = ref(null)
const loading = ref(false)
const requested = ref(null)

async function load(id) {
  requested.value = id
  loading.value = true
  user.value = await getUser(id)
  loading.value = false
}
</script>

<template>
  <button @click="load(1)">Ada · 慢</button>
  <button @click="load(2)">Lin · 快</button>
  <p class="hint">最近一次点击 id = {{ requested }}</p>
  <p v-if="loading" class="loading">加载中…</p>
  <div v-else-if="user" class="card">
    <h3>{{ user.name }}</h3>
    <p class="hint">卡片是 id {{ user.id }} · {{ user.bio }}</p>
  </div>
</template>
`;

const raceCleared = `<script setup>
import { ref } from 'vue'
import { getUser } from './api.js'

const user = ref(null)
const loading = ref(false)
const requested = ref(null)

async function load(id) {
  requested.value = id
  user.value = null
  loading.value = true
  user.value = await getUser(id)
  loading.value = false
}
</script>

<template>
  <button @click="load(1)">Ada · 慢</button>
  <button @click="load(2)">Lin · 快</button>
  <p class="hint">最近一次点击 id = {{ requested }}</p>
  <p v-if="loading" class="loading">加载中…</p>
  <div v-else-if="user" class="card">
    <h3>{{ user.name }}</h3>
    <p class="hint">卡片是 id {{ user.id }} · {{ user.bio }}</p>
  </div>
</template>
`;

const raceSeq = `<script setup>
import { ref } from 'vue'
import { getUser } from './api.js'

const user = ref(null)
const loading = ref(false)
const requested = ref(null)
let seq = 0

async function load(id) {
  const mine = ++seq
  requested.value = id
  loading.value = true
  const data = await getUser(id)
  if (mine !== seq) return
  user.value = data
  loading.value = false
}
</script>

<template>
  <button @click="load(1)">Ada · 慢</button>
  <button @click="load(2)">Lin · 快</button>
  <p class="hint">最近一次点击 id = {{ requested }}</p>
  <p v-if="loading" class="loading">加载中…</p>
  <div v-else-if="user" class="card">
    <h3>{{ user.name }}</h3>
    <p class="hint">卡片是 id {{ user.id }} · {{ user.bio }}</p>
  </div>
</template>
`;

const raceAbort = `<script setup>
import { ref } from 'vue'
import { getUser } from './api.js'

const user = ref(null)
const loading = ref(false)
const requested = ref(null)
let ac = null

async function load(id) {
  ac?.abort()
  ac = new AbortController()
  requested.value = id
  loading.value = true
  try {
    const data = await getUser(id, { signal: ac.signal })
    user.value = data
    loading.value = false
  } catch (e) {
    if (e.name === 'AbortError') return
    loading.value = false
  }
}
</script>

<template>
  <button @click="load(1)">Ada · 慢</button>
  <button @click="load(2)">Lin · 快</button>
  <p class="hint">最近一次点击 id = {{ requested }}</p>
  <p v-if="loading" class="loading">加载中…</p>
  <div v-else-if="user" class="card">
    <h3>{{ user.name }}</h3>
    <p class="hint">卡片是 id {{ user.id }} · {{ user.bio }}</p>
  </div>
</template>
`;

const raceWatchBare = `<script setup>
import { ref, watch } from 'vue'
import { getUser } from './api.js'

const id = ref(2)
const user = ref(null)
const loading = ref(false)

watch(id, async (next) => {
  loading.value = true
  user.value = await getUser(next)
  loading.value = false
}, { immediate: true })
</script>

<template>
  <button @click="id = 1">Ada · 慢</button>
  <button @click="id = 2">Lin · 快</button>
  <p class="hint">id = {{ id }}</p>
  <p v-if="loading" class="loading">加载中…</p>
  <div v-else-if="user" class="card">
    <h3>{{ user.name }}</h3>
    <p class="hint">卡片是 id {{ user.id }}</p>
  </div>
</template>
`;

const raceWatchAbort = `<script setup>
import { ref, watch } from 'vue'
import { getUser } from './api.js'

const id = ref(2)
const user = ref(null)
const loading = ref(false)

watch(id, async (next, _prev, onCleanup) => {
  const ac = new AbortController()
  onCleanup(() => ac.abort())
  loading.value = true
  try {
    user.value = await getUser(next, { signal: ac.signal })
    loading.value = false
  } catch (e) {
    if (e.name === 'AbortError') return
    loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <button @click="id = 1">Ada · 慢</button>
  <button @click="id = 2">Lin · 快</button>
  <p class="hint">id = {{ id }}</p>
  <p v-if="loading" class="loading">加载中…</p>
  <div v-else-if="user" class="card">
    <h3>{{ user.name }}</h3>
    <p class="hint">卡片是 id {{ user.id }}</p>
  </div>
</template>
`;

const seqForgot = `<script setup>
import { ref } from 'vue'
import { getUser } from './api.js'

const user = ref(null)
const loading = ref(false)
const requested = ref(null)
let seq = 0

async function load(id) {
  const mine = seq
  requested.value = id
  loading.value = true
  const data = await getUser(id)
  if (mine !== seq) return
  user.value = data
  loading.value = false
}
</script>

<template>
  <button @click="load(1)">Ada · 慢</button>
  <button @click="load(2)">Lin · 快</button>
  <p class="hint">最近一次点击 id = {{ requested }}</p>
  <p v-if="loading" class="loading">加载中…</p>
  <div v-else-if="user" class="card">
    <h3>{{ user.name }}</h3>
    <p class="hint">卡片是 id {{ user.id }} · {{ user.bio }}</p>
  </div>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const q = ref('')
const hits = ref(['Ada', 'Lin', 'Vue'])
</script>

<template>
  <input v-model="q" placeholder="搜索" />
  <ul>
    <li v-for="h in hits" :key="h">{{ h }}</li>
  </ul>
</template>
`;

const searchApi = `const ALL = ['Ada', 'Lin', 'Vue', 'Vite', 'Pinia']
export function search(q) {
  const delay = q.toLowerCase() === 'a' ? 1200 : 200
  return new Promise((resolve) => {
    setTimeout(() => {
      const n = q.trim().toLowerCase()
      resolve(n ? ALL.filter((x) => x.toLowerCase().includes(n)) : ALL)
    }, delay)
  })
}
`;

const transferAfter = `<script setup>
import { ref, watch } from 'vue'
import { search } from './api.js'

const q = ref('')
const hits = ref([])
const loading = ref(false)
let seq = 0

watch(q, async (next) => {
  const mine = ++seq
  loading.value = true
  const data = await search(next)
  if (mine !== seq) return
  hits.value = data
  loading.value = false
}, { immediate: true })
</script>

<template>
  <input v-model="q" placeholder="搜索" />
  <p v-if="loading" class="loading">搜索中…</p>
  <ul>
    <li v-for="h in hits" :key="h">{{ h }}</li>
  </ul>
</template>
`;

const worldStale: CounterfactualWorld = {
  id: "stale",
  name: "后来者覆盖",
  tagline: "慢请求后到，卡片变成 Ada",
  files: {
    "src/App.vue": raceBare,
    "src/api.js": api,
  },
  nodes: [
    { id: "a", kind: "async", label: "getUser(1) 慢" },
    { id: "b", kind: "async", label: "getUser(2) 快" },
    { id: "user", kind: "ref", label: "user" },
    { id: "dom", kind: "dom", label: "Ada（错）" },
  ],
  edges: [
    { from: "b", to: "user", label: "先到" },
    { from: "a", to: "user", label: "后到盖掉" },
    { from: "user", to: "dom" },
  ],
  note: "await 不会检查这次点击还是不是最新的。谁后到谁说了算。",
};

const worldSeq: CounterfactualWorld = {
  id: "seq",
  name: "只收下最新序号",
  tagline: "慢请求回来，发现自己过期，丢掉",
  files: {
    "src/App.vue": raceSeq,
    "src/api.js": api,
  },
  nodes: [
    { id: "seq", kind: "async", label: "seq" },
    { id: "user", kind: "ref", label: "user" },
    { id: "dom", kind: "dom", label: "Lin（对）" },
  ],
  edges: [
    { from: "seq", to: "user", label: "过期则 return" },
    { from: "user", to: "dom" },
  ],
  note: "序号是客户端的因果：只有最后一次点击有权写 user。",
};

export const RACE_LAB: CausalLab = {
  id: "race",
  world: 4,
  concept: "async-race",
  title: "后到的请求，不一定是你要的",
  subtitle: "两次 await 叠在一起。慢的那次会把快的结果盖掉。",
  promise:
    "一镜一条边：先加载一个人，再让快慢赛跑，再清空也不够，再丢弃过期序号，再 AbortController，再 watch 里不清理。",
  minutes: 18,
  official: "/guide/essentials/watchers.html",
  scenes: [
    {
      id: "race-s0",
      tick: "S0",
      title: "一次只请一个人",
      goal: "一个按钮，一个慢请求。还没有赛跑。",
      layer: "see",
      fading: 1,
      mutation: {
        files: {
          "src/App.vue": oneUser,
          "src/api.js": api,
        },
        blocks: [{ id: "one", label: "① 只加载 Ada" }],
        narration: "点一次，等 1.8 秒。卡片是对的。下一镜加上 Lin——她快得多。",
      },
      observe: {
        state: [{ id: "user", label: "user", value: "Ada", symbol: "user" }],
        dom: [{ id: "card", label: "card", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "click", kind: "event", label: "click" },
        { id: "api", kind: "async", label: "getUser(1)" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "click", to: "api" },
        { from: "api", to: "dom" },
      ],
      explanation: {
        headline: "一次请求没有竞态",
        body: "竞态要两次飞行中的 Promise。下一镜两个按钮。请先点慢的，再立刻点快的。",
      },
      tryThis: "点「加载 Ada」，等卡片出现。记住要等一会儿。",
    },
    {
      id: "race-s1",
      tick: "S1",
      title: "先慢后快，慢的后到",
      goal: "两个按钮。load 不做任何丢弃。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "先点 Ada（1.8s），再立刻点 Lin（0.3s）。最终卡片是？",
        choices: [
          { id: "lin", label: "Lin。你最后点的是她", correct: false, why: "最后点击只决定谁后发出。谁后到达，才决定 user。" },
          { id: "ada", label: "Ada。慢请求后到，把 Lin 盖掉", correct: true, why: "Lin 先写入。Ada 的 await 随后结束，再写一次。界面跟后到的走。" },
          { id: "err", label: "报错：不能同时请求", correct: false, why: "完全合法。这是静默的错人。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": raceBare,
          "src/api.js": api,
        },
        blocks: [{ id: "two", label: "② 两个请求，谁后到谁赢" }],
        narration: "请严格按顺序：Ada，立刻 Lin。看卡片最后是谁。再看「最近一次点击 id」。",
      },
      replay: {
        label: "Ada 然后立刻 Lin",
        steps: [
          { caption: "click Ada → 请求 #1 起飞", event: "click", highlight: ["a"] },
          { caption: "click Lin → 请求 #2 起飞", event: "click", highlight: ["b"] },
          { caption: "0.3s：Lin 写入 user", highlight: ["user"] },
          { caption: "1.8s：Ada 后到，覆盖", highlight: ["user"] },
        ],
      },
      observe: {
        state: [
          { id: "req", label: "requested", value: "2", symbol: "requested" },
          { id: "user", label: "user.id", value: "1（错）", symbol: "user" },
        ],
        dom: [{ id: "card", label: "card", value: "Ada" }],
        events: [{ id: "click", label: "click", value: "1 然后 2" }],
      },
      nodes: [
        { id: "a", kind: "async", label: "getUser(1) 慢" },
        { id: "b", kind: "async", label: "getUser(2) 快" },
        { id: "user", kind: "ref", label: "user", symbol: "user" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "b", to: "user", label: "先到" },
        { from: "a", to: "user", label: "后到" },
        { from: "user", to: "dom" },
      ],
      why: {
        question: "为什么最后点了 Lin，卡片却是 Ada？",
        choices: [
          { id: "late", label: "await 结束就写 user。它不问这次是不是最新点击", correct: true, why: "飞行中的 Promise 互相不认识。要你自己给它们序号或 abort。" },
          { id: "id", label: "getUser 写反了延迟", correct: false, why: "延迟是故意的。Ada 慢，是为了让后到可见。" },
          { id: "vue", label: "Vue 会把两次赋值合并成一次", correct: false, why: "两次都会写。第二次赢。" },
        ],
      },
      explanation: {
        headline: "后到 ≠ 最新意图",
        body: "点击 id 已经是 2。卡片却是 1。两份真相。下一镜切换时先清空 user——很多人以为这就修好了。",
      },
      tryThis: "Ada，立刻 Lin。等两秒。卡片应是 Ada，提示却是 id 2。",
      mapping: [{ code: "user.value = await getUser(id)", runtime: "后到的赋值赢", ui: "错人" }],
      faqs: [
        { q: "真实网络也会这样？", a: "会。Wi-Fi 抖动时旧请求更慢。列表筛选、详情页切换，全是这个图。" },
      ],
    },
    {
      id: "race-s2",
      tick: "S2",
      title: "切换时清空，仍会被盖",
      goal: "每次 load 先 user = null。不丢弃过期响应。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "先点 Ada 再立刻点 Lin。中间会闪空白。最终会？",
        choices: [
          { id: "lin", label: "停在 Lin。清空等于取消 Ada", correct: false, why: "清空只改当前屏幕。Ada 的 Promise 还在飞，结束仍会赋值。" },
          { id: "ada", label: "仍被 Ada 盖掉", correct: true, why: "你修的是过渡帧，不是写入权。" },
          { id: "empty", label: "永远空白，因为被清空了", correct: false, why: "两次 await 都会再写回来。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": raceCleared,
          "src/api.js": api,
        },
        blocks: [{ id: "clear", label: "③ 切换时 user = null" }],
        narration: "请再赛一次。空白闪过之后，Ada 仍可能回来。",
      },
      observe: {
        state: [{ id: "user", label: "user", value: "最终仍可能是 Ada", symbol: "user" }],
        dom: [{ id: "card", label: "card", value: "错人" }],
        events: [],
      },
      nodes: [
        { id: "clear", kind: "script", label: "user = null" },
        { id: "a", kind: "async", label: "Ada 仍在飞" },
        { id: "user", kind: "ref", label: "user", symbol: "user" },
      ],
      edges: [{ from: "a", to: "user", label: "照样写入" }],
      explanation: {
        headline: "清空不是取消",
        body: "过渡帧变干净了。写入权还在每个 await 手里。下一镜只加一个序号：过期的 return。",
      },
      tryThis: "Ada，立刻 Lin。看会不会先空白，再变成 Ada。",
    },
    {
      id: "race-s3",
      tick: "S3",
      title: "过期的序号丢掉",
      goal: "每次 load ++seq。await 回来后若不是最新，return。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "有了序号。先 Ada 再立刻 Lin。最终会？",
        choices: [
          { id: "lin", label: "Lin。Ada 回来时 mine !== seq，丢掉", correct: true, why: "第二次点击把 seq 变成 2。第一次的 mine 是 1。过期写入被拒绝。" },
          { id: "ada", label: "仍是 Ada。序号只是个数字", correct: false, why: "if (mine !== seq) return 就是那条边。" },
          { id: "both", label: "两张卡片", correct: false, why: "还是一份 user。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": raceSeq,
          "src/api.js": api,
        },
        blocks: [{ id: "seq", label: "④ let seq；过期则 return" }],
        narration: "请再赛一次。点击 id 和卡片 id 必须一致。",
      },
      observe: {
        state: [
          { id: "req", label: "requested", value: "2", symbol: "requested" },
          { id: "user", label: "user.id", value: "2", symbol: "user" },
        ],
        dom: [{ id: "card", label: "card", value: "Lin" }],
        events: [],
      },
      nodes: [
        { id: "seq", kind: "async", label: "seq", symbol: "seq" },
        { id: "user", kind: "ref", label: "user", symbol: "user" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "seq", to: "user", label: "允许写入" },
        { from: "user", to: "dom" },
      ],
      counterfactual: {
        id: "stale-vs-seq",
        title: "后到覆盖 vs 丢掉过期",
        setup: "同一份 getUser。差在 await 之后是否检查序号。",
        worlds: [worldStale, worldSeq],
        punchline: "请求两边一样。脸完全不同。竞态的第一条边是：过期结果没有写入权。",
      },
      explanation: {
        headline: "最新意图才有写入权",
        body: "序号是最便宜的闸门。请求仍会打到「服务器」，只是结果被丢掉。下一镜换成 abort：根本不要让它回来。",
      },
      tryThis: "Ada，立刻 Lin。卡片应是 Lin。打开反事实对比没有序号的世界。",
      mapping: [{ code: "if (mine !== seq) return", runtime: "拒绝过期赋值", ui: "对的人" }],
    },
    {
      id: "race-s4",
      tick: "S4",
      title: "AbortController 取消上一次",
      goal: "每次 load 先 abort 上一个 signal。忽略 AbortError。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "abort 之后再点 Lin。Ada 那次会？",
        choices: [
          { id: "write", label: "仍可能写回 Ada，abort 只是建议", correct: false, why: "api.js 在 abort 时 clearTimeout 并 reject AbortError。catch 里 return，不会写 user。" },
          { id: "drop", label: "被取消。卡片停在 Lin", correct: true, why: "取消是更早的闸门：过期请求不再 resolve 成数据。" },
          { id: "err", label: "页面报错 Aborted", correct: false, why: "要忽略 AbortError。否则取消本身变成红字。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": raceAbort,
          "src/api.js": api,
        },
        blocks: [{ id: "abort", label: "⑤ ac.abort()；忽略 AbortError" }],
        narration: "再赛一次。Ada 的定时器应被清掉。卡片是 Lin。",
      },
      observe: {
        state: [{ id: "user", label: "user", value: "Lin", symbol: "user" }],
        dom: [{ id: "card", label: "card", value: "Lin" }],
        events: [],
      },
      nodes: [
        { id: "ac", kind: "async", label: "AbortController", symbol: "AbortController" },
        { id: "user", kind: "ref", label: "user", symbol: "user" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "ac", to: "user", label: "取消旧的" },
        { from: "user", to: "dom" },
      ],
      why: {
        question: "序号丢弃和 abort 差在哪？",
        choices: [
          { id: "when", label: "序号在结果回来之后拒绝写入。abort 在回来之前拆掉请求", correct: true, why: "都能修错人。abort 更省，也能避免过期错误去改 error ref。" },
          { id: "same", label: "完全一样，换个名字", correct: false, why: "一个丢结果，一个取消飞行。" },
          { id: "must", label: "Vue 强制必须 abort", correct: false, why: "序号在任何语言都能用。abort 要请求支持 signal。" },
        ],
      },
      explanation: {
        headline: "取消是更早的闸门",
        body: "真实 fetch 把 signal 传进去，过期请求在网络层停掉。下一镜把点击换成 watch(id)——忘了 onCleanup 时，竞态会回来。",
      },
      tryThis: "Ada，立刻 Lin。应是 Lin。打开 api.js，看 abort 如何 clearTimeout。",
      mapping: [{ code: "ac.abort()", runtime: "旧 Promise reject AbortError", ui: "只留下最新" }],
    },
    {
      id: "race-s5",
      tick: "S5",
      title: "watch(id) 不清理",
      goal: "id 一变就请求。没有 onCleanup / abort。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "先点 Ada 再立刻点 Lin。watch 会为两次 id 各发一次请求。最终？",
        choices: [
          { id: "lin", label: "Lin。watch 会自动取消上一次", correct: false, why: "不会。除非你在 onCleanup 里 abort。默认两次 await 仍赛跑。" },
          { id: "ada", label: "又被 Ada 盖掉。和 S1 同一张图", correct: true, why: "触发源换成了 id。飞行中的 Promise 还是互不认识。" },
          { id: "err", label: "watch 不能用 async 回调", correct: false, why: "能用。返回的 Promise 被忽略，竞态正好发生在这里。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": raceWatchBare,
          "src/api.js": api,
        },
        blocks: [{ id: "watch", label: "⑥ watch(id) 无 onCleanup" }],
        narration: "按钮改的是 id。请再赛一次。错人会回来。",
      },
      observe: {
        state: [
          { id: "id", label: "id", value: "2", symbol: "id" },
          { id: "user", label: "user.id", value: "1（错）", symbol: "user" },
        ],
        dom: [{ id: "card", label: "card", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "id", kind: "ref", label: "id", symbol: "id" },
        { id: "watch", kind: "watch", label: "watch", symbol: "watch" },
        { id: "user", kind: "ref", label: "user", symbol: "user" },
      ],
      edges: [
        { from: "id", to: "watch" },
        { from: "watch", to: "user", label: "两次飞行" },
      ],
      explanation: {
        headline: "watch 不会帮你取消",
        body: "immediate 的 watch 就是带依赖的 load。onCleanup 是它的 abort 挂钩。下一镜把几种闸门拆开。",
      },
      tryThis: "Ada，立刻 Lin。id 显示 2，卡片却可能是 Ada。",
      faqs: [
        { q: "onCleanup 什么时候跑？", a: "下一次 watch 回调之前，以及 watch 被停止时。正好用来 abort 上一次。" },
      ],
    },
    {
      id: "race-s6",
      tick: "S6",
      title: "拆掉序号 / 忘了 ++ / 不清理 watch",
      goal: "三种坏法：没有闸门、序号从不增加、watch 不 abort。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "写了 const mine = seq，却忘了 ++seq。过期检查会？",
        choices: [
          { id: "ok", label: "仍能丢掉 Ada", correct: false, why: "mine 永远等于当前 seq。检查恒真，等于没有闸门。" },
          { id: "open", label: "形同虚设。后到的仍会写入", correct: true, why: "闸门要在出发时打孔。忘了 ++，人人都是最新。" },
          { id: "err", label: "报错", correct: false, why: "静默错人。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": raceSeq,
          "src/api.js": api,
        },
        blocks: [{ id: "keep", label: "序号版本先留着" }],
        narration: "先赛一次确认是 Lin。再拆掉闸门、忘了 ++、换成不清理的 watch。",
      },
      observe: {
        state: [{ id: "ok", label: "seq", value: "工作中" }],
        dom: [{ id: "card", label: "card", value: "对的人" }],
        events: [],
      },
      nodes: [
        { id: "seq", kind: "async", label: "seq" },
        { id: "user", kind: "ref", label: "user" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "seq", to: "user" },
        { from: "user", to: "dom" },
      ],
      ablations: [
        {
          id: "bare",
          prompt: "如果没有任何闸门？",
          files: {
            "src/App.vue": raceBare,
            "src/api.js": api,
          },
          expected: {
            kind: "stale",
            message: "Ada 然后 Lin：最终卡片是 Ada。后到覆盖。",
          },
          lesson: "await 不问是不是最新意图。",
        },
        {
          id: "plusplus",
          prompt: "如果忘了 ++seq？",
          files: {
            "src/App.vue": seqForgot,
            "src/api.js": api,
          },
          expected: {
            kind: "stale",
            message: "mine 始终等于 seq。检查形同虚设。错人回来。",
          },
          lesson: "出发时打孔。回来时对孔。少一步就没有闸门。",
        },
        {
          id: "watch",
          prompt: "watch(id) 加上 onCleanup abort 之后？",
          files: {
            "src/App.vue": raceWatchAbort,
            "src/api.js": api,
          },
          expected: {
            kind: "stale",
            message: "这是修复：id 一变就 abort 上一次。卡片跟 id 走。",
          },
          lesson: "watch 的第三条参数 onCleanup，就是这条边的挂钩。",
        },
      ],
      explanation: {
        headline: "飞行中的请求必须认主人",
        body: "没闸门、假闸门、watch 不清理，脸都是错人。World 4 收束：发出去、说在路上、失败有脸、过期丢掉。",
      },
      tryThis: "每种消融都 Ada→立刻 Lin。错人对上号再恢复。",
    },
    {
      id: "race-s7",
      tick: "S7",
      title: "换：搜索框",
      goal: "每个字母一次请求。打 A 很慢。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "输入 a（慢）再立刻补成 ad（快）。若没有序号，列表会？",
        choices: [
          { id: "ad", label: "停在 ad 的结果", correct: false, why: "a 的慢请求后到，会盖掉 ad。" },
          { id: "a", label: "被 a 的慢结果盖掉", correct: true, why: "和 Ada/Lin 同一张图。搜索只是把点击换成了每个字母。" },
          { id: "ok", label: "v-model 会自动取消上一次", correct: false, why: "v-model 只写 q。watch(q) 才发请求，默认不取消。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "search", label: "换场景：搜索" }],
        narration: "先是同步过滤。想清楚每个字母发出去之后，谁有权写 hits。",
      },
      observe: {
        state: [{ id: "q", label: "q", value: "同步", symbol: "q" }],
        dom: [{ id: "ul", label: "ul", value: "立刻过滤" }],
        events: [],
      },
      nodes: [
        { id: "q", kind: "ref", label: "q", symbol: "q" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "q", to: "dom" }],
      ablations: [
        {
          id: "seq",
          prompt: "watch(q) + 序号之后？",
          files: {
            "src/App.vue": transferAfter,
            "src/api.js": searchApi,
          },
          expected: {
            kind: "stale",
            message: "这是修复：每个字母一次请求，过期丢掉。先打 a 再打 ad，应停在 ad 的命中。",
          },
          lesson: "World 4 收束：远程数据有延迟、会失败、会赛跑。auth / CRUD 还在后面。机制已经可以迁移。",
        },
      ],
      explanation: {
        headline: "每个按键都是一次 Ada/Lin",
        body: "搜索、切页、切 Tab、切路由 params，都是「新意图发出去，旧飞机还在飞」。闸门是同一条边。",
      },
      tryThis: "先同步输入。再打开序号版：先打 a，立刻打 ad，看列表会不会被慢的 a 盖回去。",
    },
  ],
};
