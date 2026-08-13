import type { CausalLab, CounterfactualWorld } from "../types";

const api = `const TOKEN = 'ada-token'
const ITEMS = [
  { id: 1, title: 'Ada 的待办', done: true },
  { id: 2, title: '私密事项', done: false },
]

export function login(name, pass, { delay = 300 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (name === 'ada' && pass === 'vue') resolve({ token: TOKEN, name: 'Ada' })
      else reject(new Error('账号或密码错误'))
    }, delay)
  })
}

export function getTodos({ token, delay = 350 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (token !== TOKEN) reject(new Error('未登录'))
      else resolve(ITEMS.map((t) => ({ ...t })))
    }, delay)
  })
}
`;

const publicList = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos } from './api.js'

const todos = ref([])

onMounted(async () => {
  todos.value = await getTodos({ token: 'ada-token' })
})
</script>

<template>
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const noToken = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos } from './api.js'

const todos = ref([])
const error = ref(null)
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    todos.value = await getTodos()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <p v-if="loading" class="loading">加载中…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const tokenUnused = `<script setup>
import { ref } from 'vue'
import { login, getTodos } from './api.js'

const name = ref('ada')
const pass = ref('vue')
const token = ref(null)
const who = ref(null)
const todos = ref([])
const error = ref(null)
const loading = ref(false)

async function doLogin() {
  error.value = null
  const u = await login(name.value, pass.value)
  token.value = u.token
  who.value = u.name
}

async function load() {
  loading.value = true
  error.value = null
  try {
    todos.value = await getTodos()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="doLogin">
    <input v-model="name" />
    <input v-model="pass" type="password" />
    <button>登录</button>
  </form>
  <p v-if="who" class="who">已登录 {{ who }} · token 在内存里</p>
  <button type="button" @click="load">加载待办</button>
  <p v-if="loading" class="loading">加载中…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const tokenSent = `<script setup>
import { ref } from 'vue'
import { login, getTodos } from './api.js'

const name = ref('ada')
const pass = ref('vue')
const token = ref(null)
const who = ref(null)
const todos = ref([])
const error = ref(null)
const loading = ref(false)

async function doLogin() {
  error.value = null
  const u = await login(name.value, pass.value)
  token.value = u.token
  who.value = u.name
}

async function load() {
  loading.value = true
  error.value = null
  try {
    todos.value = await getTodos({ token: token.value })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="doLogin">
    <input v-model="name" />
    <input v-model="pass" type="password" />
    <button>登录</button>
  </form>
  <p v-if="who" class="who">已登录 {{ who }}</p>
  <button type="button" @click="load">加载待办</button>
  <p v-if="loading" class="loading">加载中…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const loginNoRefetch = `<script setup>
import { ref, onMounted } from 'vue'
import { login, getTodos } from './api.js'

const name = ref('ada')
const pass = ref('vue')
const token = ref(null)
const who = ref(null)
const todos = ref([])
const error = ref(null)
const loading = ref(false)

async function doLogin() {
  error.value = null
  const u = await login(name.value, pass.value)
  token.value = u.token
  who.value = u.name
}

async function load() {
  loading.value = true
  error.value = null
  try {
    todos.value = await getTodos({ token: token.value })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <form @submit.prevent="doLogin">
    <input v-model="name" />
    <input v-model="pass" type="password" />
    <button>登录</button>
  </form>
  <p v-if="who" class="who">已登录 {{ who }}</p>
  <p v-if="loading" class="loading">加载中…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const loginThenLoad = `<script setup>
import { ref } from 'vue'
import { login, getTodos } from './api.js'

const name = ref('ada')
const pass = ref('vue')
const token = ref(null)
const who = ref(null)
const todos = ref([])
const error = ref(null)
const loading = ref(false)

async function doLogin() {
  error.value = null
  const u = await login(name.value, pass.value)
  token.value = u.token
  who.value = u.name
  await load()
}

async function load() {
  loading.value = true
  error.value = null
  try {
    todos.value = await getTodos({ token: token.value })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="doLogin">
    <input v-model="name" />
    <input v-model="pass" type="password" />
    <button>登录</button>
  </form>
  <p v-if="who" class="who">已登录 {{ who }}</p>
  <p v-if="loading" class="loading">加载中…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const logoutKeeps = `<script setup>
import { ref } from 'vue'
import { login, getTodos } from './api.js'

const name = ref('ada')
const pass = ref('vue')
const token = ref(null)
const who = ref(null)
const todos = ref([])
const error = ref(null)

async function doLogin() {
  error.value = null
  const u = await login(name.value, pass.value)
  token.value = u.token
  who.value = u.name
  todos.value = await getTodos({ token: token.value })
}

function logout() {
  token.value = null
  who.value = null
}
</script>

<template>
  <form v-if="!who" @submit.prevent="doLogin">
    <input v-model="name" />
    <input v-model="pass" type="password" />
    <button>登录</button>
  </form>
  <p v-else class="who">
    已登录 {{ who }}
    <button type="button" @click="logout">退出</button>
  </p>
  <p v-if="error" class="error">{{ error }}</p>
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const logoutClears = `<script setup>
import { ref } from 'vue'
import { login, getTodos } from './api.js'

const name = ref('ada')
const pass = ref('vue')
const token = ref(null)
const who = ref(null)
const todos = ref([])
const error = ref(null)

async function doLogin() {
  error.value = null
  const u = await login(name.value, pass.value)
  token.value = u.token
  who.value = u.name
  todos.value = await getTodos({ token: token.value })
}

function logout() {
  token.value = null
  who.value = null
  todos.value = []
  error.value = null
}
</script>

<template>
  <form v-if="!who" @submit.prevent="doLogin">
    <input v-model="name" />
    <input v-model="pass" type="password" />
    <button>登录</button>
  </form>
  <p v-else class="who">
    已登录 {{ who }}
    <button type="button" @click="logout">退出</button>
  </p>
  <p v-if="error" class="error">{{ error }}</p>
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const user = ref({ name: 'Ada', role: 'admin' })
</script>

<template>
  <p class="who">{{ user.name }} · {{ user.role }}</p>
  <button>删除所有待办</button>
</template>
`;

const transferAfter = `<script setup>
import { ref } from 'vue'
const user = ref(null)
function asAda() { user.value = { name: 'Ada', role: 'admin' } }
function asLin() { user.value = { name: 'Lin', role: 'user' } }
function logout() { user.value = null }
</script>

<template>
  <button @click="asAda">Ada</button>
  <button @click="asLin">Lin</button>
  <button @click="logout">退出</button>
  <p v-if="user" class="who">{{ user.name }} · {{ user.role }}</p>
  <p v-else class="hint">未登录</p>
  <button v-if="user?.role === 'admin'">删除所有待办</button>
</template>
`;

const worldBare: CounterfactualWorld = {
  id: "bare",
  name: "token 不随请求走",
  tagline: "已登录，加载仍未登录",
  files: { "src/App.vue": tokenUnused, "src/api.js": api },
  nodes: [
    { id: "token", kind: "ref", label: "token" },
    { id: "api", kind: "async", label: "getTodos()" },
    { id: "dom", kind: "dom", label: "未登录" },
  ],
  edges: [{ from: "api", to: "dom" }],
  note: "内存里有令牌。请求没带上。服务器只认请求，不认你的 ref。",
};

const worldSent: CounterfactualWorld = {
  id: "sent",
  name: "token 进 getTodos",
  tagline: "同一份令牌过了边界",
  files: { "src/App.vue": tokenSent, "src/api.js": api },
  nodes: [
    { id: "token", kind: "ref", label: "token" },
    { id: "api", kind: "async", label: "getTodos({ token })" },
    { id: "dom", kind: "dom", label: "私密列表" },
  ],
  edges: [
    { from: "token", to: "api", label: "参数" },
    { from: "api", to: "dom" },
  ],
  note: "身份是请求上的字段。不是页面上的「已登录」四个字。",
};

export const AUTH_LAB: CausalLab = {
  id: "auth",
  world: 4,
  concept: "async-auth",
  title: "请求得说出你是谁",
  subtitle: "「已登录」写在页面上不够。令牌必须跟着这一次 getTodos 走。",
  promise:
    "一镜一条边：先公开列表，再无 token 的 未登录，再登录却不带令牌，再把 token 传进请求，再登录不重拉，再退出仍留下私密数据。",
  minutes: 16,
  official: "/guide/essentials/lifecycle.html",
  scenes: [
    {
      id: "auth-s0",
      tick: "S0",
      title: "现在谁都能读",
      goal: "getTodos 带着写死的 token。没有登录框。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": publicList, "src/api.js": api },
        blocks: [{ id: "open", label: "① 写死 token" }],
        narration: "私密事项直接出现。下一镜接口开始检查令牌，调用却不带。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2", symbol: "todos" }],
        dom: [{ id: "ul", label: "ul", value: "公开可见" }],
        events: [],
      },
      nodes: [
        { id: "api", kind: "async", label: "getTodos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "api", to: "dom" }],
      explanation: {
        headline: "没有身份的读取",
        body: "真实接口会问：你是谁。令牌是这次请求的身份，不是页面装饰。",
      },
      tryThis: "看两项私密待办。现在没有人把你拦下。",
      faqs: [
        { q: "为什么用字符串 token，不用 cookie？", a: "教学里 token 是一份看得见的 ref。cookie 自动附带，反而把「跟着请求走」这条边藏起来。" },
      ],
    },
    {
      id: "auth-s1",
      tick: "S1",
      title: "接口要 token，调用不带",
      goal: "getTodos() 无参数。接口拒绝。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开页面。getTodos() 不传 token。会？",
        choices: [
          { id: "list", label: "列表照出。本地开发不检查", correct: false, why: "api.js 写了 if (token !== TOKEN) reject。" },
          { id: "err", label: "显示「未登录」", correct: true, why: "失败是一种结果。这一次失败的原因是身份，不是网络。" },
          { id: "spin", label: "永远加载中", correct: false, why: "有 try/finally。加载会结束。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": noToken, "src/api.js": api },
        blocks: [{ id: "401", label: "② getTodos() 无 token" }],
        narration: "请看预览。应是红字「未登录」，不是列表。",
      },
      observe: {
        state: [{ id: "error", label: "error", value: "未登录", symbol: "error" }],
        dom: [{ id: "ui", label: "UI", value: "红字" }],
        events: [],
      },
      nodes: [
        { id: "api", kind: "async", label: "reject 未登录" },
        { id: "error", kind: "ref", label: "error", symbol: "error" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "api", to: "error" },
        { from: "error", to: "dom" },
      ],
      explanation: {
        headline: "拒绝发生在请求上",
        body: "下一镜加上登录。token 会进内存——先故意不放进 getTodos。",
      },
      tryThis: "确认是「未登录」。打开 api.js，看检查发生在 getTodos 里。",
    },
    {
      id: "auth-s2",
      tick: "S2",
      title: "登录了，请求仍不带令牌",
      goal: "login 写入 token。load 仍调用 getTodos()。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点登录（ada / vue），再点「加载待办」。会？",
        choices: [
          { id: "ok", label: "列表出现。已经登录了", correct: false, why: "页面写着已登录。请求仍是 getTodos()，没有 token 参数。" },
          { id: "err", label: "仍是「未登录」", correct: true, why: "服务器看不见你的 ref。它只看见这一次调用的参数。" },
          { id: "login", label: "登录本身失败", correct: false, why: "账号是对的。失败发生在第二次请求。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": tokenUnused, "src/api.js": api },
        blocks: [{ id: "mem", label: "③ token 在内存，请求不带" }],
        narration: "请登录。应出现「已登录 Ada」。再加载待办——仍应是未登录。",
      },
      observe: {
        state: [
          { id: "token", label: "token", value: "ada-token（未被发送）", symbol: "token" },
          { id: "error", label: "error", value: "未登录", symbol: "error" },
        ],
        dom: [{ id: "ui", label: "UI", value: "已登录 + 红字" }],
        events: [],
      },
      nodes: [
        { id: "token", kind: "ref", label: "token", symbol: "token" },
        { id: "api", kind: "async", label: "getTodos()" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "api", to: "dom" }],
      why: {
        question: "为什么页面说已登录，接口说未登录？",
        choices: [
          { id: "edge", label: "身份必须过请求边界。ref 不会自动附到每个调用上", correct: true, why: "和 loading 未接入、POST 未更新列表同一条规则：声明 ≠ 接入。" },
          { id: "wrong", label: "token 写错了，必须叫 Authorization", correct: false, why: "教学 API 认的是参数名 token。没传就是没传。" },
          { id: "time", label: "登录太慢，加载抢先了", correct: false, why: "请先登录再点加载。顺序对了也会失败。" },
        ],
      },
      explanation: {
        headline: "已登录不是请求头",
        body: "下一镜只补 { token: token.value }。同一份内存，第一次过边界。",
      },
      tryThis: "登录，再加载。两张脸叠在一起：已登录 Ada，红字未登录。",
      mapping: [{ code: "getTodos()", runtime: "token undefined", ui: "未登录" }],
    },
    {
      id: "auth-s3",
      tick: "S3",
      title: "令牌跟着请求走",
      goal: "getTodos({ token: token.value })。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "登录后再加载。会？",
        choices: [
          { id: "ok", label: "私密列表出现", correct: true, why: "这一次调用带上了令牌。服务器认人。" },
          { id: "err", label: "仍未登录，必须用 cookie", correct: false, why: "这个 API 认参数。参数在，就通过。" },
          { id: "empty", label: "登录成功但 todos 仍是 []，因为没 onMounted", correct: false, why: "点「加载待办」就是调用。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": tokenSent, "src/api.js": api },
        blocks: [{ id: "send", label: "④ getTodos({ token })" }],
        narration: "请再走一遍：登录，加载。列表必须出现。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2", symbol: "todos" }],
        dom: [{ id: "ul", label: "ul", value: "Ada 的待办" }],
        events: [],
      },
      nodes: [
        { id: "token", kind: "ref", label: "token", symbol: "token" },
        { id: "api", kind: "async", label: "getTodos", symbol: "token" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "token", to: "api", label: "参数" },
        { from: "api", to: "dom" },
      ],
      counterfactual: {
        id: "token-vs-bare",
        title: "令牌在不在请求里",
        setup: "都登录了。差在 getTodos 认不认 token。",
        worlds: [worldBare, worldSent],
        punchline: "「已登录」两边一样。脸完全不同。身份的第一条边是请求参数。",
      },
      explanation: {
        headline: "身份是这次调用的参数",
        body: "下一镜把加载放进 onMounted。打开页面时还没登录——登录之后，没有人再喊 load。",
      },
      tryThis: "登录 → 加载。打开反事实，对比不带 token 的世界。",
      mapping: [{ code: "getTodos({ token: token.value })", runtime: "请求带身份", ui: "私密列表" }],
    },
    {
      id: "auth-s4",
      tick: "S4",
      title: "登录了，没有再拉一次",
      goal: "onMounted(load) 在 token 还是 null 时跑完。登录只写 token。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "页面先加载失败。再点登录。列表会？",
        choices: [
          { id: "auto", label: "自动出现。token 变了会重跑 onMounted", correct: false, why: "onMounted 只跑一次。token 不是它的依赖。" },
          { id: "stuck", label: "仍停在「未登录」。没人在登录成功后调用 load", correct: true, why: "和 watch(id) 才发请求同一课：值变了，要有人喊。" },
          { id: "ok", label: "登录接口会顺便返回待办", correct: false, why: "login 只返回 token 和名字。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": loginNoRefetch, "src/api.js": api },
        blocks: [{ id: "once", label: "⑤ onMounted(load)；登录不重拉" }],
        narration: "打开即失败。请登录。已登录应出现，红字应留下。",
      },
      observe: {
        state: [
          { id: "token", label: "token", value: "已有", symbol: "token" },
          { id: "error", label: "error", value: "未登录（旧的）", symbol: "error" },
        ],
        dom: [{ id: "ui", label: "UI", value: "已登录 + 红字" }],
        events: [],
      },
      nodes: [
        { id: "m", kind: "effect", label: "onMounted" },
        { id: "token", kind: "ref", label: "token", symbol: "token" },
        { id: "error", kind: "ref", label: "error" },
      ],
      edges: [{ from: "m", to: "error", label: "只这一次" }],
      explanation: {
        headline: "token 变了，请求不会自己再发",
        body: "下一镜登录成功后 await load()。身份变化要触发一次新的读取。",
      },
      tryThis: "等红字出现，再登录。确认列表不会自己来。",
      faqs: [
        { q: "用 watch(token) 可以吗？", a: "可以。登录后 await load() 更直白：身份边和读取边接在同一条函数里。" },
      ],
    },
    {
      id: "auth-s5",
      tick: "S5",
      title: "退出，私密数据还在",
      goal: "logout 只清 token / who。todos 不动。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "登录看到列表后点退出。会？",
        choices: [
          { id: "gone", label: "列表清空。没令牌就不能看", correct: false, why: "令牌清了。已经在内存里的拷贝还在。" },
          { id: "keep", label: "登录条没了，两项私密待办还在", correct: true, why: "退出要同时拆掉身份和这份拷贝。只拆一个，脸会泄密。" },
          { id: "err", label: "报错：未登录", correct: false, why: "退出没有再发请求。它只改 ref。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": logoutKeeps, "src/api.js": api },
        blocks: [{ id: "leak", label: "⑥ logout 不清 todos" }],
        narration: "请登录。看到私密事项。再退出。列表应赖着。",
      },
      observe: {
        state: [
          { id: "token", label: "token", value: "null", symbol: "token" },
          { id: "todos", label: "todos", value: "仍是 2", symbol: "todos" },
        ],
        dom: [{ id: "ul", label: "ul", value: "泄密" }],
        events: [],
      },
      nodes: [
        { id: "token", kind: "ref", label: "token", symbol: "token" },
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "todos", to: "dom" }],
      why: {
        question: "为什么退出后还能看见 Ada 的待办？",
        choices: [
          { id: "copy", label: "todos 是登录时拷进来的。清 token 不会自动清拷贝", correct: true, why: "和 POST 之后列表不会自己变同一条规则，方向相反：源没了，拷贝还在。" },
          { id: "cache", label: "浏览器缓存了 HTML", correct: false, why: "是内存里的 ref。" },
          { id: "api", label: "getTodos 在退出时又成功了一次", correct: false, why: "logout 没有发请求。" },
        ],
      },
      explanation: {
        headline: "退出要收回拷贝",
        body: "身份和数据是两份 ref。下一镜 logout 同时 todos = []。",
      },
      tryThis: "登录 → 看见私密事项 → 退出。两项应还在。这是这一镜的正确答案。",
      mapping: [{ code: "token = null", runtime: "身份没了", ui: "数据还在" }],
    },
    {
      id: "auth-s6",
      tick: "S6",
      title: "拆掉参数 / 不重拉 / 不清拷贝",
      goal: "三种坏法：令牌不上路、登录不读取、退出泄密。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "logout 里加上 todos = [] 之后，退出会？",
        choices: [
          { id: "empty", label: "列表清空。私密事项离开屏幕", correct: true, why: "拷贝被收回。这是修复。" },
          { id: "keep", label: "仍在，因为已经渲染过", correct: false, why: "ref 变 []，模板会重画。" },
          { id: "err", label: "必须再请求一次才会清", correct: false, why: "退出是本地动作。不必问服务器。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": loginThenLoad, "src/api.js": api },
        blocks: [{ id: "keep", label: "登录后立刻 load 的版本" }],
        narration: "先登录看到列表。再拆：不带 token、登录不重拉、退出不清列表。最后看清拷贝的修复。",
      },
      observe: {
        state: [{ id: "ok", label: "token + todos", value: "一起到、一起走" }],
        dom: [{ id: "ul", label: "ul", value: "登录可见" }],
        events: [],
      },
      nodes: [
        { id: "token", kind: "ref", label: "token" },
        { id: "todos", kind: "ref", label: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "token", to: "todos", label: "load" },
        { from: "todos", to: "dom" },
      ],
      ablations: [
        {
          id: "bare",
          prompt: "如果请求不带 token？",
          files: { "src/App.vue": tokenUnused, "src/api.js": api },
          expected: { kind: "error", message: "登录后加载仍「未登录」。身份没过请求边界。" },
          lesson: "getTodos({ token: token.value }) 才是那条边。",
        },
        {
          id: "once",
          prompt: "如果只在 onMounted 加载？",
          files: { "src/App.vue": loginNoRefetch, "src/api.js": api },
          expected: { kind: "stale", message: "先红字，登录后红字留下。没有第二次 GET。" },
          lesson: "token 变化要触发一次新的读取。",
        },
        {
          id: "leak",
          prompt: "退出时清掉 todos 之后？",
          files: { "src/App.vue": logoutClears, "src/api.js": api },
          expected: { kind: "stale", message: "这是修复：退出后列表空。私密拷贝离开内存。" },
          lesson: "身份和数据一起来，一起走。",
        },
      ],
      explanation: {
        headline: "身份跟着请求，拷贝跟着身份",
        body: "不上路、不重拉、不收回，是三种泄密或拒识。World 4 到这里：延迟、失败、赛跑、写回、身份。下一世界才问：这份身份怎么跨过组件树，而不用层层 props。",
      },
      tryThis: "三种消融都走一遍登录。对上号再恢复。",
    },
    {
      id: "auth-s7",
      tick: "S7",
      title: "换：管理员按钮",
      goal: "删除所有待办。谁该看见它？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "现在按钮谁都能看见。若只让 role === 'admin' 看见，Lin 登录后会？",
        choices: [
          { id: "see", label: "仍看见。按钮是静态的", correct: false, why: "v-if 读 user.role。Lin 是 user。" },
          { id: "hide", label: "按钮消失。可见性跟身份走", correct: true, why: "和 token 跟请求走同一张图。UI 权限是另一条边：先藏，再在服务器上再查一次。" },
          { id: "err", label: "报错：Lin 不能渲染该按钮", correct: false, why: "v-if false 只是不画。真正的删除仍要服务器认角色。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "admin", label: "换场景：管理员按钮" }],
        narration: "先是写死的 Ada。想清楚换人之后，危险按钮还该不该在。",
      },
      observe: {
        state: [{ id: "role", label: "role", value: "admin", symbol: "user" }],
        dom: [{ id: "btn", label: "button", value: "可见" }],
        events: [],
      },
      nodes: [
        { id: "user", kind: "ref", label: "user", symbol: "user" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "user", to: "dom" }],
      ablations: [
        {
          id: "role",
          prompt: "v-if=\"user?.role === 'admin'\" 之后？",
          files: { "src/App.vue": transferAfter },
          expected: {
            kind: "stale",
            message: "这是修复：Ada 看见删除。Lin 看不见。退出谁都不看见。服务器仍必须再查一次——藏按钮不是安全边界。",
          },
          lesson: "World 4 收束。下一课 provide/inject：这份 user 怎么到达深处的按钮，而不层层传 props。",
        },
      ],
      explanation: {
        headline: "权限也是一条边",
        body: "请求带令牌。模板读角色。两边都要接。藏按钮只是脸；拒绝删除才是源。",
      },
      tryThis: "先看写死的删除按钮。再打开角色版：Ada / Lin / 退出，看按钮在不在。",
    },
  ],
};
