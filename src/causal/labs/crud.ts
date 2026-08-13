import type { CausalLab, CounterfactualWorld } from "../types";

const apiSrc = `let items = [
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 CRUD', done: false },
]
let nid = 3

export function getTodos({ delay = 350 } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(items.map((t) => ({ ...t }))), delay)
  })
}

export function addTodo(title, { delay = 350, fail = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) reject(new Error('保存失败'))
      else {
        const row = { id: nid++, title, done: false }
        items.push(row)
        resolve({ ...row })
      }
    }, delay)
  })
}
`;

const api = (tag: string) => `/* ${tag} */\n${apiSrc}`;

const listOnly = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos } from './api.js'

const todos = ref([])
const loading = ref(true)

onMounted(async () => {
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

const localAdd = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos } from './api.js'

const todos = ref([])
const title = ref('学保存')
const loading = ref(true)

async function reload() {
  loading.value = true
  todos.value = await getTodos()
  loading.value = false
}

function add() {
  todos.value.push({ id: Date.now(), title: title.value, done: false })
  title.value = ''
}

onMounted(reload)
</script>

<template>
  <form @submit.prevent="add">
    <input v-model="title" />
    <button>添加</button>
  </form>
  <button type="button" @click="reload">重新加载</button>
  <p v-if="loading" class="loading">加载中…</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const postNoList = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos, addTodo } from './api.js'

const todos = ref([])
const title = ref('学保存')
const loading = ref(true)
const saving = ref(false)

async function reload() {
  loading.value = true
  todos.value = await getTodos()
  loading.value = false
}

async function add() {
  saving.value = true
  await addTodo(title.value)
  title.value = ''
  saving.value = false
}

onMounted(reload)
</script>

<template>
  <form @submit.prevent="add">
    <input v-model="title" />
    <button :disabled="saving">{{ saving ? '保存中…' : '添加' }}</button>
  </form>
  <button type="button" @click="reload">重新加载</button>
  <p v-if="loading" class="loading">加载中…</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const postThenPush = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos, addTodo } from './api.js'

const todos = ref([])
const title = ref('学保存')
const loading = ref(true)
const saving = ref(false)

async function reload() {
  loading.value = true
  todos.value = await getTodos()
  loading.value = false
}

async function add() {
  saving.value = true
  const row = await addTodo(title.value)
  todos.value.push(row)
  title.value = ''
  saving.value = false
}

onMounted(reload)
</script>

<template>
  <form @submit.prevent="add">
    <input v-model="title" />
    <button :disabled="saving">{{ saving ? '保存中…' : '添加' }}</button>
  </form>
  <button type="button" @click="reload">重新加载</button>
  <p v-if="loading" class="loading">加载中…</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const optimisticNoRollback = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos, addTodo } from './api.js'

const todos = ref([])
const title = ref('学保存')
const loading = ref(true)
const error = ref(null)

async function reload() {
  loading.value = true
  todos.value = await getTodos()
  loading.value = false
}

async function add(fail) {
  error.value = null
  const temp = { id: 'tmp-' + Date.now(), title: title.value, done: false }
  todos.value.push(temp)
  title.value = ''
  try {
    await addTodo(temp.title, { fail })
  } catch (e) {
    error.value = e.message
  }
}

onMounted(reload)
</script>

<template>
  <form @submit.prevent="add(false)">
    <input v-model="title" />
    <button>添加</button>
  </form>
  <button type="button" @click="add(true)">添加但失败</button>
  <button type="button" @click="reload">重新加载</button>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-if="loading" class="loading">加载中…</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const optimisticRollback = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodos, addTodo } from './api.js'

const todos = ref([])
const title = ref('学保存')
const loading = ref(true)
const error = ref(null)

async function reload() {
  loading.value = true
  todos.value = await getTodos()
  loading.value = false
}

async function add(fail) {
  error.value = null
  const temp = { id: 'tmp-' + Date.now(), title: title.value, done: false }
  todos.value.push(temp)
  title.value = ''
  try {
    const row = await addTodo(temp.title, { fail })
    const i = todos.value.findIndex((t) => t.id === temp.id)
    if (i >= 0) todos.value[i] = row
  } catch (e) {
    error.value = e.message
    todos.value = todos.value.filter((t) => t.id !== temp.id)
  }
}

onMounted(reload)
</script>

<template>
  <form @submit.prevent="add(false)">
    <input v-model="title" />
    <button>添加</button>
  </form>
  <button type="button" @click="add(true)">添加但失败</button>
  <button type="button" @click="reload">重新加载</button>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-if="loading" class="loading">加载中…</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const n = ref(12)
function like() { n.value++ }
</script>

<template>
  <button @click="like">♥ {{ n }}</button>
</template>
`;

const likeApi = `let n = 12
export function getLikes() {
  return new Promise((r) => setTimeout(() => r(n), 200))
}
export function like({ fail = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) reject(new Error('点赞失败'))
      else resolve(++n)
    }, 300)
  })
}
`;

const transferAfter = `<script setup>
import { ref, onMounted } from 'vue'
import { getLikes, like as likeApi } from './api.js'

const n = ref(0)
const error = ref(null)

onMounted(async () => { n.value = await getLikes() })

async function like(fail) {
  error.value = null
  const prev = n.value
  n.value++
  try {
    n.value = await likeApi({ fail })
  } catch (e) {
    error.value = e.message
    n.value = prev
  }
}
</script>

<template>
  <button @click="like(false)">♥ {{ n }}</button>
  <button type="button" @click="like(true)">失败的赞</button>
  <p v-if="error" class="error">{{ error }}</p>
</template>
`;

const worldLocal: CounterfactualWorld = {
  id: "local",
  name: "只改内存",
  tagline: "重新加载，新项消失",
  files: { "src/App.vue": localAdd, "src/api.js": api("v1") },
  nodes: [
    { id: "ui", kind: "ref", label: "todos" },
    { id: "db", kind: "async", label: "服务器 items" },
    { id: "dom", kind: "dom", label: "DOM" },
  ],
  edges: [{ from: "ui", to: "dom" }],
  note: "界面那一份和服务器那一份不是同一个源。刷新读的是服务器。",
};

const worldSaved: CounterfactualWorld = {
  id: "saved",
  name: "先 POST 再推进列表",
  tagline: "重新加载，新项还在",
  files: { "src/App.vue": postThenPush, "src/api.js": api("v2") },
  nodes: [
    { id: "api", kind: "async", label: "addTodo" },
    { id: "ui", kind: "ref", label: "todos" },
    { id: "dom", kind: "dom", label: "DOM" },
  ],
  edges: [
    { from: "api", to: "ui", label: "返回值" },
    { from: "ui", to: "dom" },
  ],
  note: "服务器先收下。列表再收同一份。两份真相对齐。",
};

export const CRUD_LAB: CausalLab = {
  id: "crud",
  world: 4,
  concept: "async-crud",
  title: "界面改了，服务器未必改了",
  subtitle: "push 进 todos 只改内存。POST 才写进那份会活过刷新的源。",
  promise:
    "一镜一条边：先只会读，再本地添加，再 POST 却不更新列表，再推进返回值，再乐观更新不回滚，再失败撤掉。",
  minutes: 18,
  official: "/guide/essentials/forms.html",
  scenes: [
    {
      id: "crud-s0",
      tick: "S0",
      title: "现在只会读",
      goal: "列表从 getTodos 来。没有写回。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": listOnly, "src/api.js": api("v3") },
        blocks: [{ id: "read", label: "① 只 GET" }],
        narration: "上一课请求会迟到、会失败、会赛跑。这一课问：你在屏幕上添加的那一项，服务器认不认。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2", symbol: "todos" }],
        dom: [{ id: "ul", label: "ul", value: "两项" }],
        events: [],
      },
      nodes: [
        { id: "api", kind: "async", label: "getTodos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "api", to: "dom" }],
      explanation: {
        headline: "读和写是两条边",
        body: "GET 把服务器拷进 ref。屏幕上的 push 若不经过 POST，拷贝和源会分手。下一镜先只 push。",
      },
      tryThis: "等列表出现。没有添加框。记住这两项是服务器给的。",
    },
    {
      id: "crud-s1",
      tick: "S1",
      title: "只往列表里 push",
      goal: "添加不调用 addTodo。有「重新加载」。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "添加「学保存」，再点「重新加载」。新项会？",
        choices: [
          { id: "keep", label: "还在。已经画出来了", correct: false, why: "重新加载用 getTodos 覆盖 todos。服务器从未见过这一项。" },
          { id: "gone", label: "消失。内存里的 push 活不过 GET", correct: true, why: "界面那一份不是源。刷新读源。" },
          { id: "err", label: "报错", correct: false, why: "合法。静默丢数据。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": localAdd, "src/api.js": api("v4") },
        blocks: [{ id: "push", label: "② todos.push（不 POST）" }],
        narration: "请添加一项，确认它出现。再重新加载。它必须消失。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "3 → 又变 2", symbol: "todos" }],
        dom: [{ id: "ul", label: "ul", value: "新项被 GET 洗掉" }],
        events: [],
      },
      nodes: [
        { id: "push", kind: "event", label: "push" },
        { id: "ui", kind: "ref", label: "todos", symbol: "todos" },
        { id: "db", kind: "async", label: "服务器 items" },
      ],
      edges: [{ from: "push", to: "ui" }],
      why: {
        question: "为什么看起来添加成功了？",
        choices: [
          { id: "copy", label: "你改的是 GET 回来的那份拷贝。源不知道", correct: true, why: "和模块单例 vs 两次 useTodos 同一课：两份数组。" },
          { id: "api", label: "getTodos 每次都返回初始两项，POST 没写也一样", correct: false, why: "下一镜 POST 之后，重新加载会多一项。源会变。" },
          { id: "key", label: "Date.now() 当 key 不合法", correct: false, why: "key 没问题。丢的是数据，不是 DOM 复用。" },
        ],
      },
      explanation: {
        headline: "屏幕不是服务器",
        body: "下一镜调用 addTodo。先故意不更新列表——保存发生了，脸还是旧的。",
      },
      tryThis: "添加「学保存」，看见三项。再重新加载，回到两项。",
      mapping: [{ code: "todos.push(...)", runtime: "只改拷贝", ui: "刷新丢失" }],
    },
    {
      id: "crud-s2",
      tick: "S2",
      title: "POST 了，列表不更新",
      goal: "await addTodo。不 push，不 reload。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点添加。保存中结束之后，列表会？",
        choices: [
          { id: "now", label: "立刻多一项", correct: false, why: "服务器收下了。todos 这份拷贝没人改。" },
          { id: "stale", label: "仍是两项。重新加载才会出现", correct: true, why: "写源和读 UI 是两条边。你只接了第一条。" },
          { id: "err", label: "报错：必须再 GET", correct: false, why: "合法。脸是旧的。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": postNoList, "src/api.js": api("v5") },
        blocks: [{ id: "post", label: "③ await addTodo（不改 todos）" }],
        narration: "请添加一次。列表应不动。再重新加载——新项应从服务器回来。",
      },
      observe: {
        state: [
          { id: "db", label: "服务器", value: "3" },
          { id: "ui", label: "todos", value: "2（过期）", symbol: "todos" },
        ],
        dom: [{ id: "ul", label: "ul", value: "仍两项" }],
        events: [],
      },
      nodes: [
        { id: "api", kind: "async", label: "addTodo", symbol: "addTodo" },
        { id: "ui", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "ui", to: "dom" }],
      explanation: {
        headline: "写源 ≠ 更新脸",
        body: "和 loading 存在但不画同一张脸。下一镜只把返回值 push 进列表。",
      },
      tryThis: "添加后列表仍是两项。再重新加载，应变成三项。",
      faqs: [
        { q: "为什么不自动刷新？", a: "没有人把响应写回 ref。Vue 不会去猜 POST 和列表的关系。" },
      ],
    },
    {
      id: "crud-s3",
      tick: "S3",
      title: "用返回值推进列表",
      goal: "const row = await addTodo(...)；todos.push(row)。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "添加之后，再重新加载。新项会？",
        choices: [
          { id: "keep", label: "还在。服务器和列表都有", correct: true, why: "POST 写源。push 写脸。两边对齐。" },
          { id: "dup", label: "变成两项重复，因为 push 又 GET", correct: false, why: "重新加载是覆盖，不是追加。源里只有一条新纪录。" },
          { id: "gone", label: "仍会消失", correct: false, why: "那是 S1。现在源已经变了。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": postThenPush, "src/api.js": api("v6") },
        blocks: [{ id: "push", label: "④ todos.push(row)" }],
        narration: "请添加一次。列表应立刻多一项。再重新加载，它应还在。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "与服务器一致", symbol: "todos" }],
        dom: [{ id: "ul", label: "ul", value: "立刻三项" }],
        events: [],
      },
      nodes: [
        { id: "api", kind: "async", label: "addTodo", symbol: "addTodo" },
        { id: "ui", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "api", to: "ui", label: "返回值" },
        { from: "ui", to: "dom" },
      ],
      counterfactual: {
        id: "local-vs-saved",
        title: "只改内存 vs 先写源",
        setup: "同一份添加框。差在有没有 POST。",
        worlds: [worldLocal, worldSaved],
        punchline: "脸可以骗你。重新加载才说出源在哪。",
      },
      explanation: {
        headline: "先写源，再改脸",
        body: "等待返回值，界面会慢一拍。下一镜先改脸——乐观更新——然后看失败时假数据赖着不走。",
      },
      tryThis: "添加「学保存」。立刻三项。再重新加载，仍是三项。打开反事实对比只 push 的世界。",
      mapping: [{ code: "todos.push(await addTodo(title))", runtime: "源 + 拷贝", ui: "立刻且可刷新" }],
    },
    {
      id: "crud-s4",
      tick: "S4",
      title: "乐观更新，失败不撤",
      goal: "先 push 临时项，再 await。catch 只设 error。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「添加但失败」。列表会？",
        choices: [
          { id: "gone", label: "新项出现再消失，红字出来", correct: false, why: "那是回滚。这一镜 catch 不清列表。" },
          { id: "stay", label: "新项留着，下面还有红字。重新加载才消失", correct: true, why: "脸已经当它成功了。源拒绝了。两份真相。" },
          { id: "never", label: "根本不出现，因为失败了", correct: false, why: "push 在 await 前面。失败来不及阻止第一帧。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": optimisticNoRollback, "src/api.js": api("v7") },
        blocks: [{ id: "opt", label: "⑤ 先 push，失败不 filter" }],
        narration: "请点「添加但失败」。新项应赖着。再重新加载，源会把它抹掉。",
      },
      observe: {
        state: [
          { id: "ui", label: "todos", value: "含假项", symbol: "todos" },
          { id: "err", label: "error", value: "保存失败", symbol: "error" },
        ],
        dom: [{ id: "ul", label: "ul", value: "假项 + 红字" }],
        events: [],
      },
      nodes: [
        { id: "push", kind: "event", label: "先 push" },
        { id: "api", kind: "async", label: "reject" },
        { id: "ui", kind: "ref", label: "todos", symbol: "todos" },
      ],
      edges: [
        { from: "push", to: "ui" },
        { from: "api", to: "ui", label: "没撤" },
      ],
      why: {
        question: "为什么失败了界面还当它存在？",
        choices: [
          { id: "order", label: "脸先改了。失败只写了 error，没把那一项拿掉", correct: true, why: "乐观更新的第二条边是回滚。缺它，error 和假数据叠在一起。" },
          { id: "id", label: "临时 id 让 Vue 没法删除", correct: false, why: "filter 完全可以按 id 拿掉。" },
          { id: "reload", label: "必须重新加载才能改列表", correct: false, why: "列表是你的 ref。你可以立刻 filter。" },
        ],
      },
      explanation: {
        headline: "乐观是借来的成功",
        body: "借了就要还。下一镜 catch 里把临时项撤掉，成功时再用真实 id 换上。",
      },
      tryThis: "点「添加但失败」。三项加红字。再重新加载，回到两项。",
    },
    {
      id: "crud-s5",
      tick: "S5",
      title: "失败就撤掉",
      goal: "catch 里 filter 临时 id。成功则换成服务器返回的 row。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「添加但失败」。列表会？",
        choices: [
          { id: "flash", label: "闪一下新项，然后撤掉，留下红字", correct: true, why: "乐观的第一帧仍会发生。回滚把脸还给源。" },
          { id: "stay", label: "新项留下。回滚太晚", correct: false, why: "await 失败后 filter 会跑。" },
          { id: "never", label: "完全不闪，因为你知道会失败", correct: false, why: "按钮叫「添加但失败」，代码仍是先 push。界面不知道未来。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": optimisticRollback, "src/api.js": api("v8") },
        blocks: [{ id: "rb", label: "⑥ catch 里 filter 临时项" }],
        narration: "请再失败一次。新项应出现再消失。成功添加则应留下，重新加载还在。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "与源一致", symbol: "todos" }],
        dom: [{ id: "ui", label: "UI", value: "闪一下 → 红字" }],
        events: [],
      },
      nodes: [
        { id: "push", kind: "event", label: "先 push" },
        { id: "api", kind: "async", label: "reject" },
        { id: "ui", kind: "ref", label: "todos", symbol: "todos" },
      ],
      edges: [
        { from: "push", to: "ui" },
        { from: "api", to: "ui", label: "filter" },
      ],
      explanation: {
        headline: "借的成功，失败要还",
        body: "等待 POST 再 push：慢，但不会撒谎。先 push 再回滚：快，但有一帧假数据。两条边都合法，取决于你能不能还。",
      },
      tryThis: "先失败一次看回滚。再成功添加一次，重新加载确认还在。",
      mapping: [{ code: "filter(t => t.id !== temp.id)", runtime: "脸还给源", ui: "假项消失" }],
    },
    {
      id: "crud-s6",
      tick: "S6",
      title: "拆掉 POST / 不更新脸 / 不回滚",
      goal: "三种坏法：只改内存、源改了脸不知道、乐观撒谎。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "POST 成功却不 push。用户会以为？",
        choices: [
          { id: "ok", label: "已保存，因为按钮恢复了", correct: false, why: "saving 结束只说明请求结束。列表才是「看见」。" },
          { id: "miss", label: "没保存。其实源已经有了", correct: true, why: "再点一次会重复创建。脸落后于源。" },
          { id: "err", label: "报错", correct: false, why: "静默。更危险。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": postThenPush, "src/api.js": api("v9") },
        blocks: [{ id: "keep", label: "正确版本先留着" }],
        narration: "先成功添加并重新加载。再分别只 push、只 POST、乐观不回滚。",
      },
      observe: {
        state: [{ id: "ok", label: "源和脸", value: "对齐" }],
        dom: [{ id: "ul", label: "ul", value: "一致" }],
        events: [],
      },
      nodes: [
        { id: "api", kind: "async", label: "addTodo" },
        { id: "ui", kind: "ref", label: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "api", to: "ui" },
        { from: "ui", to: "dom" },
      ],
      ablations: [
        {
          id: "local",
          prompt: "如果只 push，不 POST？",
          files: { "src/App.vue": localAdd, "src/api.js": api("v10") },
          expected: { kind: "stale", message: "添加后看得见。重新加载消失。源不知道。" },
          lesson: "屏幕上的成功不是服务器上的成功。",
        },
        {
          id: "noupdate",
          prompt: "如果 POST 了却不改列表？",
          files: { "src/App.vue": postNoList, "src/api.js": api("v11") },
          expected: { kind: "stale", message: "添加后列表不动。重新加载才冒出来。再点一次会重复。" },
          lesson: "写源之后必须改脸，或再 GET 一次。",
        },
        {
          id: "opt",
          prompt: "如果乐观更新失败不撤？",
          files: { "src/App.vue": optimisticNoRollback, "src/api.js": api("v12") },
          expected: { kind: "stale", message: "「添加但失败」留下假项 + 红字。重新加载才诚实。" },
          lesson: "借来的成功，失败必须还。",
        },
      ],
      explanation: {
        headline: "源、拷贝、谎言",
        body: "只改拷贝：刷新丢。只改源：脸落后。乐观不还：两份都在撒谎。下一课请求还要带上「我是谁」。",
      },
      tryThis: "三种消融都：添加一次，再重新加载。丢失、延迟出现、假项，对上号再恢复。",
    },
    {
      id: "crud-s7",
      tick: "S7",
      title: "换：点赞数",
      goal: "♥ 12 写在按钮上。点一下该先变还是先等服务器？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "现在 like 直接 n++。若改成乐观 + 失败回滚，点「失败的赞」会？",
        choices: [
          { id: "up", label: "变成 13 并留下", correct: false, why: "那是不回滚。失败要把 13 还成 12。" },
          { id: "flash", label: "13 闪一下，回到 12，出红字", correct: true, why: "和临时待办同一张图。数字也是拷贝。" },
          { id: "stay", label: "一直 12，因为你知道会失败", correct: false, why: "乐观代码先 ++。它不知道这次会失败。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "like", label: "换场景：点赞" }],
        narration: "先是同步 ++。想清楚服务器拒绝时，数字还该不该亮着。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "12", symbol: "n" }],
        dom: [{ id: "btn", label: "button", value: "♥ 12" }],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n", symbol: "n" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "n", to: "dom" }],
      ablations: [
        {
          id: "opt",
          prompt: "乐观点赞 + 回滚之后？",
          files: { "src/App.vue": transferAfter, "src/api.js": likeApi },
          expected: {
            kind: "stale",
            message: "这是修复：成功会停在服务器返回的数字。失败闪一下再还回去。",
          },
          lesson: "待办和点赞是同一张图。下一课：这些请求还没说「我是谁」。",
        },
      ],
      explanation: {
        headline: "写回的身份是「源认不认」",
        body: "GET 是拷贝。POST 是请求改源。脸可以等，也可以先借。下一课源会问令牌。",
      },
      tryThis: "先同步点赞。再打开乐观版：点一次成功，再点「失败的赞」。",
    },
  ],
};
