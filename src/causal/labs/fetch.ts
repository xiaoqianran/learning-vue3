import type { CausalLab, CounterfactualWorld } from "../types";

const apiOk = `const ITEMS = [
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 fetch', done: false },
]

export function getTodos({ delay = 900, fail = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) reject(new Error('网络断开'))
      else resolve(ITEMS.map((t) => ({ ...t })))
    }, delay)
  })
}
`;

const localApp = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 fetch', done: false },
])
</script>

<template>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const fetchNoLoading = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos } from './api.js'

const todos = ref([])

onMounted(() => {
  getTodos().then((data) => {
    todos.value = data
  })
})
</script>

<template>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
  <p v-if="!todos.length" class="hint">（空）</p>
</template>
`;

const fetchLoadingUnused = `<script setup>
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
  <ul>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
  <p v-if="!todos.length" class="hint">（空）</p>
</template>
`;

const fetchLoadingWired = `<script setup>
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

const fetchShadow = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos } from './api.js'

const todos = ref([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  const todos = await getTodos()
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

const fetchNeverCalled = `<script setup>
import { ref } from 'vue'
import { getTodos } from './api.js'

const todos = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  todos.value = await getTodos()
  loading.value = false
}
</script>

<template>
  <p v-if="loading" class="loading">加载中…</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
  <p v-if="!loading && !todos.length" class="hint">（空）</p>
</template>
`;

const fetchTopAwait = `<script setup>
import { ref } from 'vue'
import { getTodos } from './api.js'

const todos = ref(await getTodos())
</script>

<template>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const user = ref({ name: 'Ada', city: '杭州' })
</script>

<template>
  <div class="card">
    <h3>{{ user.name }}</h3>
    <p class="hint">{{ user.city }}</p>
  </div>
</template>
`;

const userApi = `export function getUser({ delay = 800 } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ name: 'Ada', city: '杭州' }), delay)
  })
}
`;

const transferAfter = `<script setup>
import { ref, onMounted } from 'vue'
import { getUser } from './api.js'

const user = ref(null)
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  user.value = await getUser()
  loading.value = false
})
</script>

<template>
  <p v-if="loading" class="loading">加载中…</p>
  <div v-else-if="user" class="card">
    <h3>{{ user.name }}</h3>
    <p class="hint">{{ user.city }}</p>
  </div>
</template>
`;

const worldFlash: CounterfactualWorld = {
  id: "flash",
  name: "没有 loading UI",
  tagline: "请求在飞，模板只认识 []",
  files: {
    "src/App.vue": fetchNoLoading,
    "src/api.js": apiOk,
  },
  nodes: [
    { id: "api", kind: "async", label: "getTodos" },
    { id: "todos", kind: "ref", label: "todos=[]" },
    { id: "dom", kind: "dom", label: "（空）→ 列表" },
  ],
  edges: [
    { from: "api", to: "todos", label: "then" },
    { from: "todos", to: "dom" },
  ],
  note: "空数组是合法数据。模板没法区分「还没回来」和「就是没有」。",
};

const worldLoading: CounterfactualWorld = {
  id: "wired",
  name: "模板读 loading",
  tagline: "加载是一种状态，要画出来",
  files: {
    "src/App.vue": fetchLoadingWired,
    "src/api.js": apiOk,
  },
  nodes: [
    { id: "api", kind: "async", label: "getTodos" },
    { id: "loading", kind: "ref", label: "loading" },
    { id: "dom", kind: "dom", label: "加载中 → 列表" },
  ],
  edges: [
    { from: "api", to: "loading", label: "finally" },
    { from: "loading", to: "dom" },
  ],
  note: "loading 必须被模板读取。变量存在不算接上。",
};

export const FETCH_LAB: CausalLab = {
  id: "fetch",
  world: 4,
  concept: "async-fetch",
  title: "数据不在组件里，在路上",
  subtitle: "onMounted 去取。空数组先画出来。loading 是另一条边。",
  promise:
    "一镜一条边：先本地清单，再 onMounted 请求，再加 loading 却不画，再让模板读它，再看内层 const 盖住赋值，再看 load 没人调用。",
  minutes: 18,
  official: "/guide/essentials/lifecycle.html",
  scenes: [
    {
      id: "fetch-s0",
      tick: "S0",
      title: "清单还住在组件里",
      goal: "两项 todos 写死在 ref 里。没有网络，没有等待。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": localApp },
        blocks: [{ id: "local", label: "① 本地 todos" }],
        narration: "到现在为止，数据都是同步的。下一镜让同一份清单从 getTodos() 回来——它需要时间。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2（同步）", symbol: "todos" }],
        dom: [{ id: "ul", label: "ul", value: "立刻两项" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "todos", to: "dom" }],
      explanation: {
        headline: "同步世界没有「还在路上」",
        body: "ref 里已经有两项。模板第一帧就画出来。真实接口会在 setup 之后才 resolve。下一镜只换数据源，先不画加载。",
      },
      tryThis: "看列表。没有转圈，没有空白。记住这一帧。",
      faqs: [
        { q: "为什么不直接上真实 URL？", a: "教学预览在 iframe 里。本地 api.js 用 setTimeout 模拟延迟，延迟是可控的因果，不是网络运气。" },
      ],
    },
    {
      id: "fetch-s1",
      tick: "S1",
      title: "onMounted 去取，todos 从 [] 起",
      goal: "只接 getTodos().then。没有 loading。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "todos 初始是 []。请求约 0.9 秒后才回来。打开页面，你先看到？",
        choices: [
          { id: "now", label: "立刻两项，和上一镜一样", correct: false, why: "onMounted 在第一帧之后才跑。then 更晚。第一帧读的是 []。" },
          { id: "empty", label: "先（空），大约一秒后两项出现", correct: true, why: "空数组是合法数据。模板老老实实画空。这不是 bug，是你还没告诉它「正在取」。" },
          { id: "err", label: "报错：不能在 onMounted 里请求", correct: false, why: "这正是客户端取数的标准位置。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": fetchNoLoading,
          "src/api.js": apiOk,
        },
        blocks: [{ id: "fetch", label: "② onMounted → getTodos().then" }],
        narration: "请盯着预览。空白会先出现。这是这一镜要你看见的缝。",
      },
      replay: {
        label: "页面打开",
        steps: [
          { caption: "setup：todos = []", highlight: ["todos"] },
          { caption: "第一帧画出（空）", highlight: ["dom"] },
          { caption: "onMounted 发出请求", event: "mounted", highlight: ["api"] },
          { caption: "0.9s 后 todos = 两项", state: { id: "todos", from: "[]", to: "2" }, highlight: ["todos"] },
        ],
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "[] → 2", symbol: "todos" }],
        dom: [{ id: "hint", label: "UI", value: "（空）→ 列表" }],
        events: [{ id: "m", label: "onMounted", value: "getTodos" }],
      },
      nodes: [
        { id: "m", kind: "effect", label: "onMounted", symbol: "onMounted" },
        { id: "api", kind: "async", label: "getTodos", symbol: "getTodos" },
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "m", to: "api" },
        { from: "api", to: "todos", label: "then" },
        { from: "todos", to: "dom" },
      ],
      why: {
        question: "为什么第一帧不是两项？",
        choices: [
          { id: "time", label: "请求是后来的事。模板先按当前 ref 画", correct: true, why: "响应式只保证「值变了再画」。它不会把未来的 Promise 提前画出来。" },
          { id: "slow", label: "setTimeout 写错了，应该是 0", correct: false, why: "就算 0，也要等微任务。同步数据和异步数据中间永远有一帧空。" },
          { id: "mount", label: "onMounted 太晚，该写在 setup 顶层", correct: false, why: "setup 里 .then 同样会先画空。下一课才说顶层 await。" },
        ],
      },
      explanation: {
        headline: "空，是还没回来",
        body: "[] 和「正在加载」对模板是同一张脸，除非你另给一个状态。下一镜只加 loading 变量——先故意不画它。",
      },
      tryThis: "刷新预览，盯着「（空）」出现再变成列表。不要跳过这一秒。",
      mapping: [{ code: "onMounted(() => getTodos().then)", runtime: "第一帧 []，随后赋值", ui: "空白闪一下" }],
    },
    {
      id: "fetch-s2",
      tick: "S2",
      title: "loading 在，模板不读",
      goal: "加 loading ref，true → false。模板仍只看 todos。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "有了 loading，但模板还是 v-for todos。打开页面会？",
        choices: [
          { id: "spin", label: "自动出现「加载中」", correct: false, why: "模板没有读 loading。没过边界的状态，对面看不见——和 Stats 写死数字同一条规则。" },
          { id: "empty", label: "仍先（空），再出现列表", correct: true, why: "loading 只是内存里的布尔。UI 仍用 !todos.length 当空。" },
          { id: "err", label: "报错：loading 未使用", correct: false, why: "合法。静默无用。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": fetchLoadingUnused,
          "src/api.js": apiOk,
        },
        blocks: [{ id: "flag", label: "③ loading ref（模板不读）" }],
        narration: "状态有了。管道没接到 DOM。请再刷一次，确认空白还在。",
      },
      observe: {
        state: [{ id: "loading", label: "loading", value: "true → false（未被读取）", symbol: "loading" }],
        dom: [{ id: "hint", label: "UI", value: "仍是（空）" }],
        events: [],
      },
      nodes: [
        { id: "loading", kind: "ref", label: "loading", symbol: "loading" },
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "todos", to: "dom" }],
      explanation: {
        headline: "声明 ≠ 接入",
        body: "和 defineStore 没人调用、RouterLink 没有 RouterView 同一张脸。下一镜只让模板读 loading。",
      },
      tryThis: "打开 App.vue，确认 loading 被赋值了。预览里不该出现「加载中」。",
      faqs: [
        { q: "用 todos.length 当加载不行吗？", a: "0 条待办也是合法结果。空列表和还在路上必须分开。" },
      ],
    },
    {
      id: "fetch-s3",
      tick: "S3",
      title: "模板读 loading",
      goal: "只补 v-if=\"loading\"。请求代码不动。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "模板改成 v-if=\"loading\" 显示「加载中」。打开会？",
        choices: [
          { id: "ok", label: "先「加载中…」，再变成列表", correct: true, why: "loading 过了边界。第一帧 true，await 结束 false。" },
          { id: "empty", label: "还是先（空），loading 只是布尔", correct: false, why: "现在模板读它了。布尔一旦被读，就是 UI。" },
          { id: "stay", label: "永远加载中，因为没人改回 false", correct: false, why: "await 之后有 loading.value = false。卡住是消融。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": fetchLoadingWired,
          "src/api.js": apiOk,
        },
        blocks: [{ id: "ui", label: "④ v-if=\"loading\"" }],
        narration: "请再刷一次。空白应换成「加载中…」。",
      },
      observe: {
        state: [{ id: "loading", label: "loading", value: "true → false", symbol: "loading" }],
        dom: [{ id: "ui", label: "UI", value: "加载中 → 列表" }],
        events: [],
      },
      nodes: [
        { id: "api", kind: "async", label: "getTodos", symbol: "getTodos" },
        { id: "loading", kind: "ref", label: "loading", symbol: "loading" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "api", to: "loading" },
        { from: "loading", to: "dom" },
      ],
      counterfactual: {
        id: "flash-vs-loading",
        title: "空白闪 vs 加载中",
        setup: "同一份 getTodos。差在模板认不认 loading。",
        worlds: [worldFlash, worldLoading],
        punchline: "请求两边一样。脸完全不同。异步的第一条边是：把「还在路上」画出来。",
      },
      explanation: {
        headline: "加载是一种状态",
        body: "数据、加载、错误，至少三份 ref。现在只接了前两份。下一镜看一种安静的失败：请求成功了，赋值写进了另一份 todos。",
      },
      tryThis: "刷新。必须先看到「加载中…」。打开反事实，对比不画 loading 的世界。",
      mapping: [{ code: 'v-if="loading"', runtime: "布尔过边界", ui: "加载中…" }],
    },
    {
      id: "fetch-s4",
      tick: "S4",
      title: "内层 const 盖住赋值",
      goal: "load 里写 const todos = await getTodos()。外层 ref 不动。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "await 成功后，列表会？",
        choices: [
          { id: "ok", label: "出现两项。请求已经成功", correct: false, why: "成功写进了函数里那份局部变量。模板绑的是外层 ref，它仍是 []。" },
          { id: "empty", label: "加载中结束，列表是空的", correct: true, why: "loading 被设回 false。todos 那个 ref 从未赋值。这是静默成功。" },
          { id: "err", label: "报错：重复声明", correct: false, why: "内层 const 合法。它只是盖住了外层名字。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": fetchShadow,
          "src/api.js": apiOk,
        },
        blocks: [{ id: "shadow", label: "⑤ 内层 const todos = await …" }],
        narration: "请看预览。加载中会消失。列表不该出现。打开代码，找到那份没人用的 const。",
      },
      observe: {
        state: [
          { id: "inner", label: "内层 todos", value: "两项（丢了）" },
          { id: "outer", label: "ref todos", value: "[]", symbol: "todos" },
        ],
        dom: [{ id: "ui", label: "UI", value: "空列表" }],
        events: [],
      },
      nodes: [
        { id: "api", kind: "async", label: "getTodos" },
        { id: "inner", kind: "script", label: "const todos" },
        { id: "outer", kind: "ref", label: "ref todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "api", to: "inner", label: "写错地方" },
        { from: "outer", to: "dom" },
      ],
      why: {
        question: "请求明明成功了，为什么界面空？",
        choices: [
          { id: "name", label: "赋值写进了另一份同名变量。模板不认识它", correct: true, why: "和两次 useTodos 各一份清单同一类：名字一样，不是同一个源。" },
          { id: "await", label: "await 不能赋给 ref", correct: false, why: "todos.value = await getTodos() 才是那条边。" },
          { id: "load", label: "onMounted 不能用 async", correct: false, why: "可以。返回的 Promise 被忽略，这恰好是常见写法。" },
        ],
      },
      explanation: {
        headline: "成功写进了没人读的盒子",
        body: "网络对了，边界错了。下一镜反过来：赋值是对的，但 load 根本没被调用。",
      },
      tryThis: "等加载中消失。列表应是空的。这是这一镜的正确答案。",
      mapping: [{ code: "const todos = await getTodos()", runtime: "局部变量", ui: "空" }],
    },
    {
      id: "fetch-s5",
      tick: "S5",
      title: "写了 load，没有人喊",
      goal: "函数是对的。没有 onMounted，没有点击。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "load 写好了，没调用。页面会？",
        choices: [
          { id: "auto", label: "setup 结束会自动跑一次", correct: false, why: "函数不是生命周期。声明 ≠ 发出请求。" },
          { id: "empty", label: "一直空。请求从未发出", correct: true, why: "和 store 文件闲置、路由表没有出口同一课。" },
          { id: "err", label: "报错：未使用的函数", correct: false, why: "静默。预览空白。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": fetchNeverCalled,
          "src/api.js": apiOk,
        },
        blocks: [{ id: "idle", label: "⑥ load() 写了，没调用" }],
        narration: "打开文件树。api.js 在。没有人 import 之后再喊它。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "[]", symbol: "todos" }],
        dom: [{ id: "ui", label: "UI", value: "（空）" }],
        events: [],
      },
      nodes: [
        { id: "load", kind: "async", label: "load()", detail: "未调用" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [],
      explanation: {
        headline: "请求是一次调用",
        body: "onMounted(load)、按钮 @click=\"load\"、watch 里 load，都是调用。写在那里不等于发生。下一镜把这几种失败放在一起拆。",
      },
      tryThis: "确认没有「加载中」，列表空。函数不会自己跑。",
    },
    {
      id: "fetch-s6",
      tick: "S6",
      title: "拆掉调用 / 盖住赋值 / 顶层 await",
      goal: "三种坏法：没人喊、写错盒子、把组件变成 async。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "setup 顶层写 const todos = ref(await getTodos())，没有 Suspense。会？",
        choices: [
          { id: "ok", label: "和平时一样，先加载再列表", correct: false, why: "顶层 await 让组件本身变成异步组件。父级没有 <Suspense>，这是另一条边。" },
          { id: "async", label: "组件挂起或警告：缺 Suspense", correct: true, why: "onMounted + 三份 ref 是客户端取数的默认协议。顶层 await 要走 Suspense。" },
          { id: "sync", label: "setup 会同步等到请求结束", correct: false, why: "它会把整个组件推迟。不是「更方便的 onMounted」。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": fetchLoadingWired,
          "src/api.js": apiOk,
        },
        blocks: [{ id: "keep", label: "正确版本先留着" }],
        narration: "先看到「加载中」再列表。再分别拆调用、盖住赋值、改成顶层 await。",
      },
      observe: {
        state: [{ id: "ok", label: "loading + todos", value: "接好了" }],
        dom: [{ id: "ui", label: "UI", value: "加载中 → 列表" }],
        events: [],
      },
      nodes: [
        { id: "m", kind: "effect", label: "onMounted" },
        { id: "api", kind: "async", label: "getTodos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "m", to: "api" },
        { from: "api", to: "dom" },
      ],
      ablations: [
        {
          id: "idle",
          prompt: "如果 load 没人调用？",
          files: {
            "src/App.vue": fetchNeverCalled,
            "src/api.js": apiOk,
          },
          expected: {
            kind: "stale",
            message: "永远（空）。函数是说明书，调用才是请求。",
          },
          lesson: "onMounted(load) 才是那条边。",
        },
        {
          id: "shadow",
          prompt: "如果内层 const 盖住 todos？",
          files: {
            "src/App.vue": fetchShadow,
            "src/api.js": apiOk,
          },
          expected: {
            kind: "stale",
            message: "加载中会结束。列表仍空。成功写进了局部变量。",
          },
          lesson: "todos.value = await getTodos()。名字要对上那一份 ref。",
        },
        {
          id: "top",
          prompt: "如果顶层 await，没有 Suspense？",
          files: {
            "src/App.vue": fetchTopAwait,
            "src/api.js": apiOk,
          },
          expected: {
            kind: "error",
            message: "组件因顶层 await 变成异步组件。没有 <Suspense> 时会警告或挂起。",
          },
          lesson: "顶层 await 不是更短的 onMounted。它换了一套协议。",
        },
      ],
      explanation: {
        headline: "发出去，写进对的盒子，告诉模板在等",
        body: "三条边：调用、赋值、loading。下一课才让请求失败——失败也是一种结果，不是「一直加载」。",
      },
      tryThis: "三种消融都刷一次预览。空白、空列表、Suspense 警告，对上号再恢复。",
    },
    {
      id: "fetch-s7",
      tick: "S7",
      title: "换：一张用户卡片",
      goal: "资料从 getUser() 来。第一帧该是什么？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "现在卡片写死 Ada。改成 onMounted(getUser)，user 初始 null，不画 loading。第一帧会？",
        choices: [
          { id: "ada", label: "立刻看到 Ada", correct: false, why: "那是同步世界。null 第一帧，卡片不该在。" },
          { id: "blank", label: "空白一会儿，再出现卡片", correct: true, why: "和 todos 从 [] 起同一张图。要消除空白，另接 loading。" },
          { id: "err", label: "user.city 会报错，因为第一帧 user 是 null", correct: false, why: "若模板直接 {{ user.name }} 且没有 v-if，确实会炸。那是消融里的一种脸。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "card", label: "换场景：用户卡片" }],
        narration: "先是同步的 Ada。想清楚抽成请求之后，null 和 loading 谁先被模板读到。",
      },
      observe: {
        state: [{ id: "user", label: "user", value: "Ada（同步）", symbol: "user" }],
        dom: [{ id: "card", label: "card", value: "立刻" }],
        events: [],
      },
      nodes: [
        { id: "user", kind: "ref", label: "user", symbol: "user" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "user", to: "dom" }],
      ablations: [
        {
          id: "fetch",
          prompt: "onMounted + loading 之后？",
          files: {
            "src/App.vue": transferAfter,
            "src/api.js": userApi,
          },
          expected: {
            kind: "stale",
            message: "这是修复：先加载中，再卡片。null 不再直接进模板。",
          },
          lesson: "清单和卡片是同一张图。下一课让 getTodos 失败——你还没有 error 那一份 ref。",
        },
      ],
      explanation: {
        headline: "异步的第一帧永远更穷",
        body: "同步数据第一帧就满。远程数据第一帧是空/null。loading 把「穷」说成「在路上」。错误是第三种穷法。",
      },
      tryThis: "先看写死的卡片。再打开「onMounted + loading」，盯第一帧。",
    },
  ],
};
