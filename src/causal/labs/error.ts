import type { CausalLab } from "../types";

const api = `const ITEMS = [
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学错误处理', done: false },
]

export function getTodos({ delay = 700, fail = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) reject(new Error('网络断开'))
      else resolve(ITEMS.map((t) => ({ ...t })))
    }, delay)
  })
}

export function getTodosEmpty({ delay = 700 } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => resolve([]), delay)
  })
}
`;

const happy = `<script setup>
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

const failNoCatch = `<script setup>
import { ref } from 'vue'
import { getTodos } from './api.js'

const todos = ref([])
const loading = ref(false)

async function load(fail) {
  loading.value = true
  todos.value = await getTodos({ fail })
  loading.value = false
}
</script>

<template>
  <button @click="load(false)">正常加载</button>
  <button @click="load(true)">模拟失败</button>
  <p v-if="loading" class="loading">加载中…</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const failCatchUnused = `<script setup>
import { ref } from 'vue'
import { getTodos } from './api.js'

const todos = ref([])
const loading = ref(false)
const error = ref(null)

async function load(fail) {
  loading.value = true
  error.value = null
  try {
    todos.value = await getTodos({ fail })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button @click="load(false)">正常加载</button>
  <button @click="load(true)">模拟失败</button>
  <p v-if="loading" class="loading">加载中…</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const failCatchWired = `<script setup>
import { ref } from 'vue'
import { getTodos } from './api.js'

const todos = ref([])
const loading = ref(false)
const error = ref(null)

async function load(fail) {
  loading.value = true
  error.value = null
  try {
    todos.value = await getTodos({ fail })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button @click="load(false)">正常加载</button>
  <button @click="load(true)">模拟失败</button>
  <p v-if="loading" class="loading">加载中…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const failStickyError = `<script setup>
import { ref } from 'vue'
import { getTodos } from './api.js'

const todos = ref([])
const loading = ref(false)
const error = ref(null)

async function load(fail) {
  loading.value = true
  try {
    todos.value = await getTodos({ fail })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button @click="load(false)">正常加载</button>
  <button @click="load(true)">模拟失败</button>
  <p v-if="loading" class="loading">加载中…</p>
  <p v-if="error" class="error">{{ error }}</p>
  <ul v-if="!loading">
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const emptyAsError = `<script setup>
import { ref, onMounted } from 'vue'
import { getTodosEmpty } from './api.js'

const todos = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  loading.value = true
  const data = await getTodosEmpty()
  if (!data.length) error.value = '加载失败'
  else todos.value = data
  loading.value = false
})
</script>

<template>
  <p v-if="loading" class="loading">加载中…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
  <p v-if="!loading && !error && !todos.length" class="empty">还没有待办</p>
</template>
`;

const noFinally = `<script setup>
import { ref } from 'vue'
import { getTodos } from './api.js'

const todos = ref([])
const loading = ref(false)
const error = ref(null)

async function load(fail) {
  loading.value = true
  error.value = null
  try {
    todos.value = await getTodos({ fail })
    loading.value = false
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <button @click="load(false)">正常加载</button>
  <button @click="load(true)">模拟失败</button>
  <p v-if="loading" class="loading">加载中…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <ul v-else>
    <li v-for="t in todos" :key="t.id">
      <span :class="{ done: t.done }">{{ t.title }}</span>
    </li>
  </ul>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const title = ref('新待办')
function save() {
  title.value = ''
}
</script>

<template>
  <form @submit.prevent="save">
    <input v-model="title" />
    <button>保存</button>
  </form>
  <p class="hint">保存总是成功</p>
</template>
`;

const saveApi = `export function saveTodo(title, { fail = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail || !title.trim()) reject(new Error('保存失败'))
      else resolve({ id: 3, title })
    }, 500)
  })
}
`;

const transferAfter = `<script setup>
import { ref } from 'vue'
import { saveTodo } from './api.js'

const title = ref('新待办')
const saving = ref(false)
const error = ref(null)
const ok = ref(false)

async function save() {
  saving.value = true
  error.value = null
  ok.value = false
  try {
    await saveTodo(title.value)
    ok.value = true
    title.value = ''
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form @submit.prevent="save">
    <input v-model="title" />
    <button :disabled="saving">{{ saving ? '保存中…' : '保存' }}</button>
  </form>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-else-if="ok" class="stats">已保存</p>
</template>
`;

export const ERROR_LAB: CausalLab = {
  id: "error",
  world: 4,
  concept: "async-error",
  title: "失败也是一种结果",
  subtitle: "catch 只是把错误放进盒子。模板不读，就等于没失败。",
  promise:
    "一镜一条边：先成功加载，再无 catch，再 catch 却不画，再画出 error，再看错误黏住，再把空列表误当成失败。",
  minutes: 16,
  official: "/guide/essentials/lifecycle.html",
  scenes: [
    {
      id: "error-s0",
      tick: "S0",
      title: "现在只会成功",
      goal: "上一课的结局：loading + 列表。没有失败这条路。",
      layer: "see",
      fading: 1,
      mutation: {
        files: {
          "src/App.vue": happy,
          "src/api.js": api,
        },
        blocks: [{ id: "ok", label: "① 只会成功的 getTodos" }],
        narration: "真实接口会断开。下一镜给一个「模拟失败」按钮，先不 catch。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2", symbol: "todos" }],
        dom: [{ id: "ui", label: "UI", value: "列表" }],
        events: [],
      },
      nodes: [
        { id: "api", kind: "async", label: "getTodos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "api", to: "dom" }],
      explanation: {
        headline: "成功路径不是全部路径",
        body: "await 在失败时抛。没有 catch，Promise 变成未处理拒绝。界面往往停在加载或空白。",
      },
      tryThis: "等列表出现。这一镜没有失败按钮。",
    },
    {
      id: "error-s1",
      tick: "S1",
      title: "失败，没有 catch",
      goal: "load(true) 会 reject。没有 try/catch。也没有 finally。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「模拟失败」。loading 已设为 true。会？",
        choices: [
          { id: "msg", label: "页面显示「网络断开」", correct: false, why: "没有 catch，也没有 error ref。拒绝进了控制台。" },
          { id: "spin", label: "永远「加载中…」。loading 没人设回 false", correct: true, why: "await 抛错，后面的 loading.value = false 不会跑。失败卡在加载，是最常见的脸。" },
          { id: "empty", label: "回到空列表", correct: false, why: "那需要 finally。现在连 finally 都没有。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": failNoCatch,
          "src/api.js": api,
        },
        blocks: [{ id: "throw", label: "② reject，无 catch / 无 finally" }],
        narration: "先点「正常加载」确认能成功。再点「模拟失败」。应停在加载中。",
      },
      replay: {
        label: "模拟失败",
        steps: [
          { caption: "loading = true", event: "click", highlight: ["loading"] },
          { caption: "getTodos reject", highlight: ["api"] },
          { caption: "await 抛错，false 那一行没跑到", highlight: ["loading"] },
          { caption: "UI 停在加载中", highlight: ["dom"] },
        ],
      },
      observe: {
        state: [{ id: "loading", label: "loading", value: "卡在 true", symbol: "loading" }],
        dom: [{ id: "ui", label: "UI", value: "加载中…" }],
        events: [{ id: "click", label: "click", value: "模拟失败" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "模拟失败" },
        { id: "api", kind: "async", label: "reject", symbol: "getTodos" },
        { id: "loading", kind: "ref", label: "loading", symbol: "loading" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "click", to: "api" },
        { from: "api", to: "loading", label: "没走到 false" },
        { from: "loading", to: "dom" },
      ],
      why: {
        question: "为什么失败看起来像「还在加载」？",
        choices: [
          { id: "line", label: "抛错会跳过后面的语句。false 写在 await 后面", correct: true, why: "finally 就是为了这条边：无论成败都离开加载。" },
          { id: "vue", label: "Vue 把错误显示成加载中", correct: false, why: "Vue 不管。是你的控制流。" },
          { id: "btn", label: "按钮点太快", correct: false, why: "点一次就够。请求失败了。" },
        ],
      },
      explanation: {
        headline: "未接住的失败卡在路上",
        body: "下一镜补 try/catch/finally，把 error 放进 ref——先故意不画它。你会看见：加载结束了，失败仍然没脸。",
      },
      tryThis: "点「模拟失败」。确认停在加载中。打开控制台应有未处理的拒绝。",
      mapping: [{ code: "todos.value = await getTodos({ fail: true })", runtime: "throw，false 未执行", ui: "永远加载中" }],
    },
    {
      id: "error-s2",
      tick: "S2",
      title: "error 在，模板不读",
      goal: "catch 写入 error。finally 结束 loading。模板仍只认 loading / 列表。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「模拟失败」。error 被赋值。页面会？",
        choices: [
          { id: "msg", label: "显示网络断开", correct: false, why: "模板没有读 error。和 loading 未接入同一条规则。" },
          { id: "empty", label: "加载结束，列表空，看起来像「没有数据」", correct: true, why: "finally 让 loading 变 false。todos 仍是 []。失败被装扮成空。" },
          { id: "spin", label: "仍永远加载中", correct: false, why: "这一镜有 finally。加载会结束。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": failCatchUnused,
          "src/api.js": api,
        },
        blocks: [{ id: "box", label: "③ error ref（模板不读）" }],
        narration: "失败被接住了。请再点「模拟失败」。不应再卡加载。也不该看到红字。",
      },
      observe: {
        state: [{ id: "error", label: "error", value: "网络断开（未被读取）", symbol: "error" }],
        dom: [{ id: "ui", label: "UI", value: "空列表" }],
        events: [],
      },
      nodes: [
        { id: "error", kind: "ref", label: "error", symbol: "error" },
        { id: "todos", kind: "ref", label: "todos=[]", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "todos", to: "dom" }],
      explanation: {
        headline: "接住 ≠ 说出来",
        body: "catch 是控制流。模板读取才是 UI。下一镜只补 v-else-if=\"error\"。",
      },
      tryThis: "失败一次。页面应是空列表，不是红字。打开 App.vue 确认 error.value 被赋值。",
    },
    {
      id: "error-s3",
      tick: "S3",
      title: "模板读 error",
      goal: "只补 v-else-if=\"error\"。load 逻辑不动。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "模板开始读 error。点「模拟失败」会？",
        choices: [
          { id: "msg", label: "显示「网络断开」", correct: true, why: "error 过了边界。loading false 之后走 v-else-if。" },
          { id: "empty", label: "仍是空列表，因为 todos 是 []", correct: false, why: "v-else-if 抢在列表前面。" },
          { id: "both", label: "红字和列表同时出现", correct: false, why: "v-if / v-else-if / v-else 互斥。黏住是下一镜。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": failCatchWired,
          "src/api.js": api,
        },
        blocks: [{ id: "ui", label: "④ v-else-if=\"error\"" }],
        narration: "请失败一次，再点「正常加载」。红字应消失，列表出现。",
      },
      observe: {
        state: [{ id: "error", label: "error", value: "网络断开", symbol: "error" }],
        dom: [{ id: "ui", label: "UI", value: "红字" }],
        events: [],
      },
      nodes: [
        { id: "api", kind: "async", label: "reject" },
        { id: "error", kind: "ref", label: "error", symbol: "error" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "api", to: "error", label: "catch" },
        { from: "error", to: "dom" },
      ],
      explanation: {
        headline: "失败要有一张脸",
        body: "loading / error / data 三选一。下一镜看漏清 error：成功回来之后红字还在。",
      },
      tryThis: "失败 → 红字。再正常加载 → 列表。确认 error.value = null 发生在下一次 load 开头。",
      mapping: [{ code: 'v-else-if="error"', runtime: "失败过边界", ui: "网络断开" }],
      faqs: [
        { q: "为什么开头要 error.value = null？", a: "否则上一次失败会黏在这一次成功上。下一镜故意漏掉它。" },
      ],
    },
    {
      id: "error-s4",
      tick: "S4",
      title: "错误黏住",
      goal: "catch 仍赋值。新一次 load 开头不清 error。模板用 v-if 而不是 v-else-if。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "先失败，再点「正常加载」。会？",
        choices: [
          { id: "ok", label: "只有列表。红字消失", correct: false, why: "error 没被清。模板又用 v-if 同时画 error 和列表。" },
          { id: "both", label: "列表出现了，红字还在", correct: true, why: "两份真相。成功没有把失败从屏幕上撤走。" },
          { id: "err", label: "仍只有红字", correct: false, why: "todos 会被赋上两项。红字是额外黏着的。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": failStickyError,
          "src/api.js": api,
        },
        blocks: [{ id: "sticky", label: "⑤ 不清 error，且 v-if 叠着画" }],
        narration: "请按顺序：失败一次，再成功一次。红字应赖着不走。",
      },
      observe: {
        state: [
          { id: "error", label: "error", value: "仍是「网络断开」", symbol: "error" },
          { id: "todos", label: "todos", value: "2", symbol: "todos" },
        ],
        dom: [{ id: "ui", label: "UI", value: "红字 + 列表" }],
        events: [],
      },
      nodes: [
        { id: "error", kind: "ref", label: "error", symbol: "error" },
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "error", to: "dom" },
        { from: "todos", to: "dom" },
      ],
      why: {
        question: "为什么成功之后红字还在？",
        choices: [
          { id: "clear", label: "error 是上一次 catch 留下的。新请求开头没把它清掉", correct: true, why: "状态机要在每次出发时复位。loading / error / data 不能各画各的。" },
          { id: "cache", label: "浏览器缓存了错误页面", correct: false, why: "是内存里的 ref。" },
          { id: "v", label: "必须用 v-else-if，v-if 是语法错误", correct: false, why: "v-if 合法，所以更危险：它允许两张脸同时在。" },
        ],
      },
      explanation: {
        headline: "每次出发，先复位",
        body: "error.value = null 和 loading.value = true 是同一类边。下一镜看另一种误判：空数组被当成失败。",
      },
      tryThis: "失败，再成功。红字和列表应叠在一起。这是这一镜要你看见的。",
    },
    {
      id: "error-s5",
      tick: "S5",
      title: "空列表被当成失败",
      goal: "接口成功返回 []。代码写 if (!data.length) error = '加载失败'。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "服务器诚实地说：0 条待办。页面会？",
        choices: [
          { id: "empty", label: "「还没有待办」", correct: false, why: "代码把 length===0 写成了失败。走 error 分支，空状态那一行进不去。" },
          { id: "err", label: "显示「加载失败」", correct: true, why: "空是合法结果。失败是抛错或非 2xx。两者必须分开。" },
          { id: "list", label: "空白 ul，什么字都没有", correct: false, why: "error 分支会画红字。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": emptyAsError,
          "src/api.js": api,
        },
        blocks: [{ id: "empty", label: "⑥ 把 [] 当成失败" }],
        narration: "这次请求成功了。请看它被说成失败。",
      },
      observe: {
        state: [
          { id: "data", label: "data", value: "[]（成功）" },
          { id: "error", label: "error", value: "加载失败", symbol: "error" },
        ],
        dom: [{ id: "ui", label: "UI", value: "红字" }],
        events: [],
      },
      nodes: [
        { id: "api", kind: "async", label: "[]" },
        { id: "error", kind: "ref", label: "error", symbol: "error" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "error", to: "dom", label: "误判" }],
      explanation: {
        headline: "空 ≠ 失败",
        body: "loading / 空 / 失败 / 有数据，四张脸。用 length 当错误码，会把「没有」说成「坏了」。",
      },
      tryThis: "确认看到的是「加载失败」，不是「还没有待办」。下一镜会拆开它们。",
      faqs: [
        { q: "HTTP 404 算空还是失败？", a: "看协议。资源不存在常常是失败。列表接口返回 [] 是成功。别用同一份 error 混装。" },
      ],
    },
    {
      id: "error-s6",
      tick: "S6",
      title: "拆掉 finally / 让空变失败 / 黏住",
      goal: "三种坏法：失败卡加载、空被喊失败、成功仍带红字。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "catch 里不写 loading = false，也不用 finally。失败后会？",
        choices: [
          { id: "msg", label: "红字出现，加载结束", correct: false, why: "false 只写在 try 成功分支。失败走 catch，loading 仍 true。" },
          { id: "spin", label: "永远加载中。红字进不去 v-else-if", correct: true, why: "模板先看 loading。卡住的加载把错误挡在后面。" },
          { id: "ok", label: "finally 是语法糖，可有可无", correct: false, why: "它是「离开加载」这条边的固定位置。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": failCatchWired,
          "src/api.js": api,
        },
        blocks: [{ id: "keep", label: "正确版本先留着" }],
        narration: "先失败一次看到红字，再成功一次看到列表。然后拆 finally、把空当失败、让错误黏住。",
      },
      observe: {
        state: [{ id: "ok", label: "三份 ref", value: "互斥" }],
        dom: [{ id: "ui", label: "UI", value: "对的脸" }],
        events: [],
      },
      nodes: [
        { id: "loading", kind: "ref", label: "loading" },
        { id: "error", kind: "ref", label: "error" },
        { id: "todos", kind: "ref", label: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "loading", to: "dom" },
        { from: "error", to: "dom" },
        { from: "todos", to: "dom" },
      ],
      ablations: [
        {
          id: "finally",
          prompt: "如果失败时不结束 loading？",
          files: {
            "src/App.vue": noFinally,
            "src/api.js": api,
          },
          expected: {
            kind: "stale",
            message: "点「模拟失败」后永远加载中。error 有值，但模板先被 loading 挡住。",
          },
          lesson: "离开加载写在 finally。成败都要走。",
        },
        {
          id: "empty",
          prompt: "如果把 [] 当成失败？",
          files: {
            "src/App.vue": emptyAsError,
            "src/api.js": api,
          },
          expected: {
            kind: "stale",
            message: "成功的空列表变成「加载失败」。",
          },
          lesson: "空是数据。失败是抛错。",
        },
        {
          id: "sticky",
          prompt: "如果成功不清 error？",
          files: {
            "src/App.vue": failStickyError,
            "src/api.js": api,
          },
          expected: {
            kind: "stale",
            message: "先失败再成功：红字和列表叠在一起。",
          },
          lesson: "每次出发复位。v-if 叠画会把两张脸同时留下。",
        },
      ],
      explanation: {
        headline: "三份状态，一次只露出一张脸",
        body: "卡在加载、空被喊失败、红字黏住，都是状态机破了。下一课请求会重叠——慢的那次后到，会把对的脸盖掉。",
      },
      tryThis: "三种消融都点一次失败、一次成功。对上号再恢复。",
    },
    {
      id: "error-s7",
      tick: "S7",
      title: "换：保存按钮",
      goal: "提交也会失败。第一帧不该像已经存好。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "现在保存总是立刻清空输入。若改成 await saveTodo() 且可能失败，成功之前该？",
        choices: [
          { id: "clear", label: "先清空输入，失败再把字打回去", correct: false, why: "那是乐观更新，而且失败时用户以为存上了。先等结果。" },
          { id: "wait", label: "按钮进入保存中；失败出红字；成功再清空", correct: true, why: "和 load 同一张状态机：saving / error / ok。" },
          { id: "sync", label: "表单提交不能用 async", correct: false, why: "@submit.prevent=\"save\" 可以等 Promise。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "form", label: "换场景：保存" }],
        narration: "先是同步成功。想清楚失败时输入框和红字谁该在。",
      },
      observe: {
        state: [{ id: "title", label: "title", value: "新待办", symbol: "title" }],
        dom: [{ id: "form", label: "form", value: "总是成功" }],
        events: [],
      },
      nodes: [
        { id: "title", kind: "ref", label: "title", symbol: "title" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "title", to: "dom" }],
      ablations: [
        {
          id: "async",
          prompt: "接上 saving / error 之后？",
          files: {
            "src/App.vue": transferAfter,
            "src/api.js": saveApi,
          },
          expected: {
            kind: "stale",
            message: "这是修复：保存中、失败红字、成功提示。空标题会失败。",
          },
          lesson: "读和写是同一台状态机。下一课两个请求叠在一起，后到的不一定是你要的。",
        },
      ],
      explanation: {
        headline: "写回服务器也有三种穷法",
        body: "保存中、失败、成功。清空输入是成功之后的事。下一课才让两次请求赛跑。",
      },
      tryThis: "先点保存看同步清空。再打开异步版：留空提交应失败；有字应成功。",
    },
  ],
};
