import type { CausalLab, CounterfactualWorld } from "../types";

const sharedApp = `<script setup>
import Stats from './Stats.vue'
import { useTodos } from './composables/useTodos.js'

const { todos, toggle } = useTodos()
</script>

<template>
  <Stats />
  <ul>
    <li v-for="t in todos" :key="t.id">
      <label>
        <input type="checkbox" :checked="t.done" @change="toggle(t.id)" />
        <span :class="{ done: t.done }">{{ t.title }}</span>
      </label>
    </li>
  </ul>
</template>
`;

const sharedStats = `<script setup>
import { useTodos } from './composables/useTodos.js'
const { todos, completed } = useTodos()
</script>

<template>
  <p class="stats">完成 {{ completed }} / {{ todos.length }}</p>
</template>
`;

const sharedComposable = `import { ref, computed } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 Pinia', done: false },
])

export function useTodos() {
  const completed = computed(() => todos.value.filter((t) => t.done).length)
  function toggle(id) {
    const t = todos.value.find((x) => x.id === id)
    if (t) t.done = !t.done
  }
  return { todos, completed, toggle }
}
`;

const storeStateOnly = `import { defineStore } from 'pinia'

export const useTodosStore = defineStore('todos', {
  state: () => ({
    items: [
      { id: 1, title: '买牛奶', done: true },
      { id: 2, title: '学 Pinia', done: false },
    ],
  }),
})
`;

const storeWithGetter = `import { defineStore } from 'pinia'

export const useTodosStore = defineStore('todos', {
  state: () => ({
    items: [
      { id: 1, title: '买牛奶', done: true },
      { id: 2, title: '学 Pinia', done: false },
    ],
  }),
  getters: {
    completed: (s) => s.items.filter((t) => t.done).length,
  },
})
`;

const storeFull = `import { defineStore } from 'pinia'

export const useTodosStore = defineStore('todos', {
  state: () => ({
    items: [
      { id: 1, title: '买牛奶', done: true },
      { id: 2, title: '学 Pinia', done: false },
    ],
  }),
  getters: {
    completed: (s) => s.items.filter((t) => t.done).length,
  },
  actions: {
    toggle(id) {
      const t = this.items.find((x) => x.id === id)
      if (t) t.done = !t.done
    },
  },
})
`;

const appUsesStoreNoPlugin = `<script setup>
import { computed } from 'vue'
import Stats from './Stats.vue'
import { useTodosStore } from './stores/todos.js'

const store = useTodosStore()
const completed = computed(() => store.items.filter((t) => t.done).length)

function toggle(id) {
  const t = store.items.find((x) => x.id === id)
  if (t) t.done = !t.done
}
</script>

<template>
  <Stats :completed="completed" :total="store.items.length" />
  <ul>
    <li v-for="t in store.items" :key="t.id">
      <label>
        <input type="checkbox" :checked="t.done" @change="toggle(t.id)" />
        <span :class="{ done: t.done }">{{ t.title }}</span>
      </label>
    </li>
  </ul>
</template>
`;

const statsProps = `<script setup>
defineProps({
  completed: { type: Number, required: true },
  total: { type: Number, required: true },
})
</script>
<template>
  <p class="stats">完成 {{ completed }} / {{ total }}</p>
</template>
`;

const mainPinia = `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

createApp(App).use(createPinia()).mount('#app')
`;

const mainNoPinia = `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`;

const appStore = `<script setup>
import { computed } from 'vue'
import Stats from './Stats.vue'
import { useTodosStore } from './stores/todos.js'

const store = useTodosStore()
const completed = computed(() => store.items.filter((t) => t.done).length)

function toggle(id) {
  const t = store.items.find((x) => x.id === id)
  if (t) t.done = !t.done
}
</script>

<template>
  <Stats :completed="completed" :total="store.items.length" />
  <ul>
    <li v-for="t in store.items" :key="t.id">
      <label>
        <input type="checkbox" :checked="t.done" @change="toggle(t.id)" />
        <span :class="{ done: t.done }">{{ t.title }}</span>
      </label>
    </li>
  </ul>
</template>
`;

const statsStore = `<script setup>
import { useTodosStore } from './stores/todos.js'
const store = useTodosStore()
</script>

<template>
  <p class="stats">完成 {{ store.completed }} / {{ store.items.length }}</p>
</template>
`;

const appStoreGetter = `<script setup>
import Stats from './Stats.vue'
import { useTodosStore } from './stores/todos.js'

const store = useTodosStore()

function toggle(id) {
  const t = store.items.find((x) => x.id === id)
  if (t) t.done = !t.done
}
</script>

<template>
  <Stats />
  <ul>
    <li v-for="t in store.items" :key="t.id">
      <label>
        <input type="checkbox" :checked="t.done" @change="toggle(t.id)" />
        <span :class="{ done: t.done }">{{ t.title }}</span>
      </label>
    </li>
  </ul>
</template>
`;

const appStoreAction = `<script setup>
import Stats from './Stats.vue'
import { useTodosStore } from './stores/todos.js'

const store = useTodosStore()
</script>

<template>
  <Stats />
  <ul>
    <li v-for="t in store.items" :key="t.id">
      <label>
        <input type="checkbox" :checked="t.done" @change="store.toggle(t.id)" />
        <span :class="{ done: t.done }">{{ t.title }}</span>
      </label>
    </li>
  </ul>
</template>
`;

const twoPiniaMain = `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

createApp(App).use(createPinia()).use(createPinia()).mount('#app')
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const cart = ref([{ id: 1, name: 'Vue 书', n: 1 }])
function add() {
  cart.value[0].n++
}
</script>

<template>
  <p class="stats">{{ cart[0].name }} × {{ cart[0].n }}</p>
  <button @click="add">再买一本</button>
</template>
`;

const cartStore = `import { defineStore } from 'pinia'
export const useCart = defineStore('cart', {
  state: () => ({ items: [{ id: 1, name: 'Vue 书', n: 1 }] }),
  getters: {
    total: (s) => s.items.reduce((n, i) => n + i.n, 0),
  },
  actions: {
    add(id) {
      const i = this.items.find((x) => x.id === id)
      if (i) i.n++
    },
  },
})
`;

const transferAfter = `<script setup>
import { useCart } from './stores/cart.js'
const cart = useCart()
</script>

<template>
  <p class="stats">{{ cart.items[0].name }} × {{ cart.total }}</p>
  <button @click="cart.add(1)">再买一本</button>
</template>
`;

const transferMain = `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
createApp(App).use(createPinia()).mount('#app')
`;

const worldPlugin: CounterfactualWorld = {
  id: "plugin",
  name: "有 createPinia",
  tagline: "app.use 之后 store 才能活",
  files: {
    "src/main.js": mainPinia,
    "src/App.vue": appStore,
    "src/Stats.vue": statsProps,
    "src/stores/todos.js": storeStateOnly,
  },
  nodes: [
    { id: "pinia", kind: "store", label: "createPinia" },
    { id: "store", kind: "store", label: "useTodosStore" },
    { id: "dom", kind: "dom", label: "DOM" },
  ],
  edges: [
    { from: "pinia", to: "store", label: "激活" },
    { from: "store", to: "dom" },
  ],
  note: "Pinia 是插件。store 函数只是仓库的说明书。没有 app.use，说明书找不到房子。",
};

const worldBare: CounterfactualWorld = {
  id: "bare",
  name: "没有插件",
  tagline: "useStore 被调用，Pinia 没安装",
  files: {
    "src/App.vue": appUsesStoreNoPlugin,
    "src/Stats.vue": statsProps,
    "src/stores/todos.js": storeStateOnly,
  },
  nodes: [
    { id: "store", kind: "store", label: "useTodosStore" },
    { id: "dom", kind: "dom", label: "报错" },
  ],
  edges: [],
  note: "getActivePinia() 为空。不是 defineStore 写错，是应用没有仓库运行时。",
};

export const PINIA_LAB: CausalLab = {
  id: "pinia",
  world: 3,
  concept: "pinia",
  title: "给那份单例一个官方身份",
  subtitle: "defineStore 是说明书。createPinia 才把仓库接进应用。",
  promise:
    "一镜一条边：先看模块单例，再写出 store 不用它，再调用却不安装插件，再 app.use，再 getter，再 action。看见没有 Pinia 插件时的报错。",
  minutes: 18,
  official: "/guide/scaling-up/state-management.html",
  scenes: [
    {
      id: "pinia-s0",
      tick: "S0",
      title: "模块单例已经能共享",
      goal: "上一课的结局：useTodos 顶层 ref。两个组件同步。",
      layer: "see",
      fading: 1,
      mutation: {
        files: {
          "src/App.vue": sharedApp,
          "src/Stats.vue": sharedStats,
          "src/composables/useTodos.js": sharedComposable,
        },
        blocks: [{ id: "shared", label: "① 模块级 composable" }],
        narration: "已经能用。Pinia 不是为了让勾选突然能工作。是为了给这份单例名字、结构、和一次安装。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "模块单例", symbol: "useTodos" }],
        dom: [{ id: "ui", label: "UI", value: "同步" }],
        events: [],
      },
      nodes: [
        { id: "use", kind: "composable", label: "useTodos", symbol: "useTodos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "use", to: "dom" }],
      explanation: {
        headline: "能跑 ≠ 有身份",
        body: "模块顶层 ref 没有名字、没有 DevTools、SSR 时会串请求。下一镜只创建 stores/todos.js，先不调用。",
      },
      tryThis: "勾选一项，确认统计跟着变。这是你已经会的共享。",
      faqs: [
        { q: "这不就是上一课的模块单例吗？", a: "是。Pinia 要正式化的是这件事：给单例一个 id、一套协议、一个 DevTools 入口。先确认你已经有一份能跑的共享。" },
      ],
    },
    {
      id: "pinia-s1",
      tick: "S1",
      title: "store 文件在，还没人用",
      goal: "写出 defineStore。App 仍走 composable。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "多了一个 stores/todos.js，没人 import。页面会？",
        choices: [
          { id: "use", label: "自动改走 Pinia", correct: false, why: "文件不是运行时。和 TodoItem 未挂载同一课。" },
          { id: "same", label: "完全不变", correct: true, why: "声明 ≠ 接入。" },
          { id: "err", label: "报错：未安装 pinia", correct: false, why: "没人调用 useTodosStore，不会去找插件。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": sharedApp,
          "src/Stats.vue": sharedStats,
          "src/composables/useTodos.js": sharedComposable,
          "src/stores/todos.js": storeStateOnly,
        },
        blocks: [{ id: "file", label: "② defineStore('todos', { state })" }],
        narration: "说明书写好了。还没有读者，也还没有房子（createPinia）。",
      },
      observe: {
        state: [{ id: "todos", label: "仍是 composable", value: "单例" }],
        dom: [{ id: "ui", label: "UI", value: "不变" }],
        events: [],
      },
      nodes: [
        { id: "store", kind: "store", label: "useTodosStore", detail: "未调用", symbol: "defineStore" },
        { id: "use", kind: "composable", label: "useTodos", symbol: "useTodos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "use", to: "dom" }],
      explanation: {
        headline: "defineStore 不是 createPinia",
        body: "前者注册一份「叫 todos 的状态形状」。后者在应用上安装仓库运行时。下一镜只让 App 调用 useTodosStore，故意不安装插件。",
      },
      tryThis: "预览应和上一镜一样。打开 stores/todos.js，确认还没人 import 它。",
      faqs: [
        { q: "id 'todos' 有什么用？", a: "DevTools 里的名字，也是同一应用里这份 store 的身份证。重复 id 会撞车。" },
      ],
    },
    {
      id: "pinia-s2",
      tick: "S2",
      title: "调用 store，不安装插件",
      goal: "App 改用 useTodosStore()。没有 createPinia。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "没有 app.use(createPinia())，setup 里调用 useTodosStore() 会？",
        choices: [
          { id: "ok", label: "照常工作，defineStore 已经够了", correct: false, why: "store 函数要去找「当前激活的 Pinia」。没有插件，就找不到。" },
          { id: "err", label: "报错：getActivePinia() 为空", correct: true, why: "这是干净的失败。缺的是运行时，不是 state 写错。" },
          { id: "empty", label: "页面空白但不报错", correct: false, why: "Pinia 会明确抛错。比静默更好查。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appUsesStoreNoPlugin,
          "src/Stats.vue": statsProps,
          "src/stores/todos.js": storeStateOnly,
        },
        blocks: [{ id: "call", label: "③ useTodosStore()（无插件）" }],
        narration: "请看预览/控制台。这一镜的正确结果是失败。下一镜才安装房子。",
      },
      observe: {
        state: [],
        dom: [{ id: "err", label: "runtime", value: "无 active Pinia" }],
        events: [],
      },
      nodes: [
        { id: "store", kind: "store", label: "useTodosStore", symbol: "defineStore" },
        { id: "dom", kind: "dom", label: "错误" },
      ],
      edges: [],
      counterfactual: {
        id: "plugin-vs-bare",
        title: "有插件 vs 没插件",
        setup: "同一份 defineStore。差在应用有没有 createPinia。",
        worlds: [worldPlugin, worldBare],
        punchline: "store 文件两边一样。脸完全不同。Pinia 的第一条边是插件，不是 state。",
      },
      why: {
        question: "为什么 composable 不需要 createXxx，Pinia 需要？",
        choices: [
          { id: "app", label: "Pinia 挂在 app 实例上，才能跨组件找到同一份仓库，并在 SSR 时按请求隔离", correct: true, why: "模块单例做不到按请求隔离。插件是那条「安装进应用」的边。" },
          { id: "tax", label: "只是官方多收一道手续", correct: false, why: "没有这道手续，useStore 不知道读哪一座仓库。" },
          { id: "vue", label: "Vue 3 强制所有状态走插件", correct: false, why: "ref / composable 完全合法。Pinia 是可选项。" },
        ],
      },
      explanation: {
        headline: "仓库运行时要安装",
        body: "useTodosStore 像一封信。createPinia 是邮局。下一镜只补 main.js 里的 app.use(createPinia())。",
      },
      tryThis: "确认预览报错或空白。打开反事实，对比装上插件的世界。",
      faqs: [
        { q: "为什么要 main.js？", a: "createApp 发生在组件之外。App.vue 被挂载时，插件必须已经 use 过。playground 默认帮你 createApp(App)；有 main.js 时改由你写。" },
      ],
    },
    {
      id: "pinia-s3",
      tick: "S3",
      title: "安装 createPinia",
      goal: "main.js：createApp(App).use(createPinia()).mount(#app)。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "装上插件之后，勾选会？",
        choices: [
          { id: "ok", label: "列表和统计一起变", correct: true, why: "现在有 active Pinia。useTodosStore() 拿到同一份 todos 仓库。" },
          { id: "err", label: "仍报错，因为 Stats 还在用 props", correct: false, why: "props 完全合法。插件只服务 store 调用。" },
          { id: "two", label: "App 和 Stats 会拿到两份 store", correct: false, why: "同一 id 'todos' 在同一 Pinia 里是单例。下一镜 Stats 自己调用时才演示这一点。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainPinia,
          "src/App.vue": appStore,
          "src/Stats.vue": statsProps,
          "src/stores/todos.js": storeStateOnly,
        },
        blocks: [{ id: "main", label: "④ main.js · app.use(createPinia())" }],
        narration: "房子盖好了。请勾选。Stats 这一镜仍吃 props——先确认插件本身让 App 活过来。",
      },
      observe: {
        state: [{ id: "items", label: "store.items", value: "2", symbol: "defineStore" }],
        dom: [{ id: "ui", label: "UI", value: "可勾选" }],
        events: [],
      },
      nodes: [
        { id: "pinia", kind: "store", label: "createPinia", symbol: "createPinia" },
        { id: "store", kind: "store", label: "todos", symbol: "defineStore" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "pinia", to: "store", label: "激活" },
        { from: "store", to: "dom" },
      ],
      explanation: {
        headline: "插件激活仓库",
        body: "state 还只是一份数组。completed 仍在组件里用 computed 算。下一镜把派生搬进 getters——让 Stats 自己读 store，不再吃 props。",
      },
      tryThis: "勾选「学 Pinia」。统计应变成 2 / 2。看文件树里的 main.js。",
      mapping: [
        { code: "createPinia()", runtime: "仓库运行时", ui: "store 可调用" },
        { code: "useTodosStore()", runtime: "拿到 id=todos 的单例", ui: "列表" },
      ],
    },
    {
      id: "pinia-s4",
      tick: "S4",
      title: "getter：派生搬进仓库",
      goal: "store 增加 completed getter。Stats 自己读 store，不再吃 props。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "Stats 改为 store.completed。勾选后会？",
        choices: [
          { id: "ok", label: "统计跟着变。getter 像 computed，缓存、可订阅", correct: true, why: "getter 依赖 state。state 变，getter 失效。Stats 和 App 读同一份。" },
          { id: "once", label: "只算一次，冻在 1", correct: false, why: "那是普通函数或一次乘法。getter 留在图里。" },
          { id: "props", label: "不传 props 会空", correct: false, why: "Stats 改走 store。不需要父喂。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainPinia,
          "src/App.vue": appStoreGetter,
          "src/Stats.vue": statsStore,
          "src/stores/todos.js": storeWithGetter,
        },
        blocks: [
          { id: "get", label: "⑤ getters.completed" },
          { id: "stats", label: "⑥ Stats 读 store" },
        ],
        narration: "派生不再散落在组件里。请勾选。Stats 不再向父要数字。",
      },
      observe: {
        state: [{ id: "c", label: "store.completed", value: "1 → 2", symbol: "defineStore" }],
        dom: [{ id: "stats", label: "Stats", value: "读 getter" }],
        events: [],
      },
      nodes: [
        { id: "state", kind: "store", label: "state.items" },
        { id: "get", kind: "computed", label: "getters.completed" },
        { id: "stats", kind: "component", label: "Stats" },
      ],
      edges: [
        { from: "state", to: "get", label: "派生" },
        { from: "get", to: "stats" },
      ],
      why: {
        question: "为什么不继续在每个组件里写 computed？",
        choices: [
          { id: "one", label: "完成数只有一个定义。十个组件不会写出十份稍有不同的 filter", correct: true, why: "和 computed 课同一判断：派生要有名字、有缓存、有一处真相。" },
          { id: "perf", label: "只是微优化，可有可无", correct: false, why: "正确性先于性能：定义散落会漏改。" },
          { id: "pinia", label: "Pinia 不允许组件里用 computed", correct: false, why: "允许。只是这份派生属于仓库。" },
        ],
      },
      explanation: {
        headline: "getter 是仓库里的 computed",
        body: "state 是源。getter 是派生。组件只读。下一镜把 toggle 从组件挪进 actions——写入也有一处真相。",
      },
      tryThis: "勾选。打开 Stats.vue：它不再 declare props。",
      mapping: [{ code: "getters.completed", runtime: "computed 挂在 store 上", ui: "完成 n" }],
    },
    {
      id: "pinia-s5",
      tick: "S5",
      title: "action：写入也搬进仓库",
      goal: "只补 toggle action。组件改叫 store.toggle(id)。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "组件不再自己改 store.items[i].done，改调 store.toggle。勾选会？",
        choices: [
          { id: "ok", label: "照样切换。写入走仓库", correct: true, why: "action 里的 this.items 就是那份 state。界面订阅的还是它。" },
          { id: "dead", label: "界面不动，因为组件没改数据", correct: false, why: "组件喊仓库改。和 emit 同一结构：意图往上。" },
          { id: "err", label: "不能在 action 里改 state", correct: false, why: "action 正是官方写入通道。直接改 state 往往也能跑——那是消融。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainPinia,
          "src/App.vue": appStoreAction,
          "src/Stats.vue": statsStore,
          "src/stores/todos.js": storeFull,
        },
        blocks: [{ id: "act", label: "⑦ actions.toggle" }],
        narration: "请勾选。改数据的是仓库。组件不知道数组怎么找 id。",
      },
      replay: {
        label: "勾选第二项",
        steps: [
          { caption: "change → store.toggle(2)", event: "change", highlight: ["store"] },
          { caption: "state.items[1].done true", highlight: ["store"] },
          { caption: "getter 失效 → 统计 2 / 2", highlight: ["dom"] },
        ],
      },
      observe: {
        state: [{ id: "d", label: "items[1].done", value: "false → true", symbol: "defineStore" }],
        events: [{ id: "click", label: "toggle", value: "action" }],
        dom: [{ id: "ui", label: "UI", value: "划线 + 统计" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "change" },
        { id: "act", kind: "store", label: "actions.toggle" },
        { id: "state", kind: "store", label: "state" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "click", to: "act" },
        { from: "act", to: "state", label: "写入" },
        { from: "state", to: "dom" },
      ],
      explanation: {
        headline: "state / getter / action",
        body: "源、派生、写入。和 ref / computed / 事件同一张图，只是搬到了应用级。下一镜拆插件、拆成两个 Pinia、让组件直接改 state。",
      },
      tryThis: "勾选、取消。打开 stores/todos.js，确认 toggle 在 actions 里。",
      faqs: [
        { q: "组件里直接 store.items[0].done = true 可以吗？", a: "对象是引用，常常能跑。DevTools 时间旅行、以后换持久化会痛。协议是 action。" },
        { q: "this 是什么？", a: "option 风格的 action 里，this 是 store。组合式 defineStore(() => {}) 则没有 this，直接改 ref。" },
      ],
      mapping: [{ code: "store.toggle(id)", runtime: "action → state", ui: "勾选" }],
    },
    {
      id: "pinia-s6",
      tick: "S6",
      title: "拆掉插件 / 装两次 / 直接改 state",
      goal: "三种坏法：没有运行时、两座仓库、写入不走门。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "main.js 里漏掉 .use(createPinia())，会？",
        choices: [
          { id: "ok", label: "仍能用，defineStore 已够", correct: false, why: "S2 已经见过：找不到 active Pinia。" },
          { id: "err", label: "useTodosStore 报错", correct: true, why: "插件是第一条边。拆掉它，后面的 getter、action 都不存在。" },
          { id: "stale", label: "界面冻住但不报错", correct: false, why: "这一次是红字，不是静默。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainPinia,
          "src/App.vue": appStoreAction,
          "src/Stats.vue": statsStore,
          "src/stores/todos.js": storeFull,
        },
        blocks: [{ id: "keep", label: "完整版本先留着" }],
        narration: "先留下能勾选的图。再拆插件、重复 createPinia、让组件直接改字段。",
      },
      observe: {
        state: [{ id: "ok", label: "store", value: "完整" }],
        dom: [{ id: "ui", label: "UI", value: "同步" }],
        events: [],
      },
      nodes: [
        { id: "pinia", kind: "store", label: "createPinia" },
        { id: "store", kind: "store", label: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "pinia", to: "store" },
        { from: "store", to: "dom" },
      ],
      ablations: [
        {
          id: "no-plugin",
          prompt: "如果没有 createPinia？",
          files: {
            "src/main.js": mainNoPinia,
            "src/App.vue": appStoreAction,
            "src/Stats.vue": statsStore,
            "src/stores/todos.js": storeFull,
          },
          expected: {
            kind: "error",
            message: "getActivePinia() 为空。store 函数找不到运行时。",
          },
          lesson: "定义仓库 ≠ 安装仓库。缺的是 app.use。",
        },
        {
          id: "twice",
          prompt: "如果 use 两次 createPinia()？",
          files: {
            "src/main.js": twoPiniaMain,
            "src/App.vue": appStoreAction,
            "src/Stats.vue": statsStore,
            "src/stores/todos.js": storeFull,
          },
          expected: {
            kind: "stale",
            message: "后装的 Pinia 覆盖前者。调用时可能拿到另一座空仓库，或表现怪异。一座应用，一座 Pinia。",
          },
          lesson: "单例是「一座 Pinia 里的一个 id」，不是「每次 createPinia 都是同一座」。",
        },
        {
          id: "mutate",
          prompt: "如果组件直接改 store.items？",
          files: {
            "src/main.js": mainPinia,
            "src/App.vue": appStoreGetter,
            "src/Stats.vue": statsStore,
            "src/stores/todos.js": storeWithGetter,
          },
          expected: {
            kind: "stale",
            message: "勾选往往仍能工作。失败是协议上的：写入散落在组件，仓库不再是唯一的门。",
          },
          lesson: "能跑 ≠ 边界正确。和子组件改 prop 同一类诱惑。",
        },
      ],
      explanation: {
        headline: "一座应用，一座 Pinia，一个 id",
        body: "没插件：找不到房子。两座插件：不知道住哪。直接改 state：房子还在，门形同虚设。",
      },
      tryThis: "三种消融分开看。报错、怪异、能跑但没协议，脸都不一样。",
    },
    {
      id: "pinia-s7",
      tick: "S7",
      title: "换：购物车",
      goal: "cart 要在按钮和合计之间共享。它最像什么？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "合计要从 cart 派生，多个页面要读写。最适合？",
        choices: [
          { id: "store", label: "Pinia：state + getter + action", correct: true, why: "应用级一份购物车。和 todos 同一张图。你已经见过：模块单例能跑，插件给它身份。" },
          { id: "prop", label: "一直从 App props 往下传", correct: false, why: "能做，深树会钻。这正是仓库要收掉的。" },
          { id: "own", label: "每个页面自己 ref([])，watch 同步", correct: false, why: "watch 课已经拆过假同步。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "cart", label: "换场景：购物车" }],
        narration: "先是一个组件里的 cart。想清楚抽出去之后状态份数。",
      },
      observe: {
        state: [{ id: "cart", label: "cart", value: "1 本", symbol: "cart" }],
        dom: [{ id: "p", label: "p", value: "Vue 书 × 1" }],
        events: [],
      },
      nodes: [
        { id: "cart", kind: "ref", label: "cart", symbol: "cart" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "cart", to: "dom" }],
      ablations: [
        {
          id: "extract",
          prompt: "抽成 useCart store 之后？",
          files: {
            "src/main.js": transferMain,
            "src/App.vue": transferAfter,
            "src/stores/cart.js": cartStore,
          },
          expected: {
            kind: "stale",
            message: "这是修复：合计是 getter，再买一本是 action。任何页面 import useCart 都是同一份车。",
          },
          lesson: "todos 和 cart 是同一个结构。下一课才让这份应用按 URL 切页面。",
        },
      ],
      explanation: {
        headline: "仓库的身份是应用级单例",
        body: "composable 决定状态份数。Pinia 给「应用一份」那种一个 id、一扇写入的门。路由要问的是另一件事：现在屏幕上该是哪一页。",
      },
      tryThis: "先点「再买一本」。再打开抽成 store，确认仍能加、合计仍对。",
    },
  ],
};
