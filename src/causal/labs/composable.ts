import type { CausalLab } from "../types";

const appOnly = `<script setup>
import { ref, computed } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 composable', done: false },
])

const completed = computed(() => todos.value.filter((t) => t.done).length)

function toggle(id) {
  const t = todos.value.find((x) => x.id === id)
  if (t) t.done = !t.done
}
</script>

<template>
  <p class="stats">完成 {{ completed }} / {{ todos.length }}</p>
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

const statsHardcoded = `<script setup>
</script>

<template>
  <p class="stats">完成 1 / 2</p>
</template>
`;

const appWithHardStats = `<script setup>
import { ref } from 'vue'
import Stats from './Stats.vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 composable', done: false },
])

function toggle(id) {
  const t = todos.value.find((x) => x.id === id)
  if (t) t.done = !t.done
}
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

const appWithProps = `<script setup>
import { ref, computed } from 'vue'
import Stats from './Stats.vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 composable', done: false },
])

const completed = computed(() => todos.value.filter((t) => t.done).length)

function toggle(id) {
  const t = todos.value.find((x) => x.id === id)
  if (t) t.done = !t.done
}
</script>

<template>
  <Stats :completed="completed" :total="todos.length" />
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

const useTodosInstance = `import { ref, computed } from 'vue'

export function useTodos() {
  const todos = ref([
    { id: 1, title: '买牛奶', done: true },
    { id: 2, title: '学 composable', done: false },
  ])
  const completed = computed(() => todos.value.filter((t) => t.done).length)
  function toggle(id) {
    const t = todos.value.find((x) => x.id === id)
    if (t) t.done = !t.done
  }
  return { todos, completed, toggle }
}
`;

const appUsesComposable = `<script setup>
import Stats from './Stats.vue'
import { useTodos } from './composables/useTodos.js'

const { todos, completed, toggle } = useTodos()
</script>

<template>
  <Stats :completed="completed" :total="todos.length" />
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

const statsUsesOwn = `<script setup>
import { useTodos } from './composables/useTodos.js'

const { todos, completed } = useTodos()
</script>

<template>
  <p class="stats">完成 {{ completed }} / {{ todos.length }}</p>
</template>
`;

const appBothCall = `<script setup>
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

const useTodosShared = `import { ref, computed } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 composable', done: false },
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

const unusedFile = `export function useTodos() {
  return { todos: [], completed: 0, toggle() {} }
}
`;

const transferBefore = `<script setup>
import { ref } from 'vue'

const n = ref(0)
</script>

<template>
  <button @click="n++">A {{ n }}</button>
  <button @click="n++">B {{ n }}</button>
</template>
`;

const useCountOwn = `import { ref } from 'vue'
export function useCount() {
  const n = ref(0)
  return { n, inc: () => n.value++ }
}
`;

const transferSplit = `<script setup>
import { useCount } from './composables/useCount.js'

const a = useCount()
const b = useCount()
</script>

<template>
  <button @click="a.inc()">A {{ a.n }}</button>
  <button @click="b.inc()">B {{ b.n }}</button>
</template>
`;

const useCountShared = `import { ref } from 'vue'
const n = ref(0)
export function useCount() {
  return { n, inc: () => n.value++ }
}
`;

const transferShared = `<script setup>
import { useCount } from './composables/useCount.js'

const a = useCount()
const b = useCount()
</script>

<template>
  <button @click="a.inc()">A {{ a.n }}</button>
  <button @click="b.inc()">B {{ b.n }}</button>
</template>
`;

export const COMPOSABLE_LAB: CausalLab = {
  id: "composable",
  world: 3,
  concept: "composables",
  title: "抽函数，不等于共享状态",
  subtitle: "useXxx 只是带响应式的函数。状态住在哪，由你决定。",
  promise:
    "一镜一条边：先拆出 Stats，再 props，再抽函数，再让两边都调用，再把 ref 提到模块顶层。亲眼看见两次 useTodos() 是两份清单。",
  minutes: 18,
  official: "/guide/reusability/composables.html",
  scenes: [
    {
      id: "composable-s0",
      tick: "S0",
      title: "统计写死在同一文件",
      goal: "清单和「完成数」还糊在 App 里。先看见需求：统计也要跟着勾选变。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appOnly },
        blocks: [{ id: "all", label: "① 清单和统计都在 App" }],
        narration: "完成数是派生，它碰巧和列表住在一起。下一镜先把它剪成子组件——先不接数据。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2", symbol: "todos" }],
        dom: [{ id: "stats", label: ".stats", value: "完成 1 / 2" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "todos", to: "dom" }],
      explanation: {
        headline: "两个消费者，一份真相",
        body: "列表要 todos，统计也要 todos。复制一份完成数会过期。先把统计剪出去，再决定数据怎么过边界。",
      },
      tryThis: "勾选「学 composable」。统计应变成 2 / 2。记住：现在它们还住在同一个组件里。",
      faqs: [
        { q: "这不是 computed 课已经做过的吗？", a: "那一课问「完成数是不是派生」。这一课问「两个组件怎么读同一份派生」。" },
      ],
    },
    {
      id: "composable-s1",
      tick: "S1",
      title: "Stats 上场，数字写死",
      goal: "挂上 <Stats />。里面写死「完成 1 / 2」。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "Stats 写死 1 / 2。勾选第二项之后，统计会？",
        choices: [
          { id: "upd", label: "变成 2 / 2", correct: false, why: "Stats 不读 todos。它只是一段静态标记。" },
          { id: "stale", label: "冻在 1 / 2，列表却划上线", correct: true, why: "两份真相。和当初手写清单同一类缝：界面在，数据管道不在。" },
          { id: "err", label: "报错", correct: false, why: "合法。静默过期。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appWithHardStats,
          "src/Stats.vue": statsHardcoded,
        },
        blocks: [
          { id: "file", label: "② 新建 Stats.vue" },
          { id: "tag", label: "③ <Stats />（写死数字）" },
        ],
        narration: "统计被剪出去了。数据没跟过去。请勾选第二项。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "在 App", symbol: "todos" }],
        dom: [{ id: "stats", label: "Stats", value: "冻在 1 / 2" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "stats", kind: "component", label: "Stats" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "todos", to: "dom", label: "只喂列表" }],
      why: {
        question: "为什么子组件不能直接读 App 的 todos？",
        choices: [
          { id: "scope", label: "每个组件有自己的作用域。没过边界的状态，对面看不见", correct: true, why: "和 TodoItem 看不见 t 同一条规则。下一镜先用 props 过边界。" },
          { id: "vue", label: "Vue 3 禁止子组件读父数据", correct: false, why: "可以读，但必须你传：props、provide、composable、store。" },
          { id: "comp", label: "缺 computed", correct: false, why: "App 里曾经有 completed。Stats 根本没接到。" },
        ],
      },
      explanation: {
        headline: "剪组件会剪断读取",
        body: "文件边界就是作用域边界。下一镜只补 props。composable 还没出场——先确认「过边界」这件事本身。",
      },
      tryThis: "勾选第二项。列表划线，统计仍是 1 / 2。",
      faqs: [
        { q: "Stats 为什么还能显示 1 / 2？", a: "那是写在它自己模板里的字。不是读出来的。和手写清单两项同一类假真相。" },
        { q: "为什么不直接抽 useTodos？", a: "因为你还没看见「剪组件会剪断读取」。先断，再接 props，再抽函数。一次一条边。" },
      ],
    },
    {
      id: "composable-s2",
      tick: "S2",
      title: "先用 props 喂饱 Stats",
      goal: "只补 :completed 和 :total。还不要抽函数。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "Props 接通之后，勾选第二项，统计会？",
        choices: [
          { id: "ok", label: "变成 2 / 2", correct: true, why: "Stats 读的是父传下来的派生值。父的 todos 一变，completed 变，props 变。" },
          { id: "stale", label: "还是冻住，因为 Stats 自己没有 todos", correct: false, why: "它不需要自己有。props 就是那条边。" },
          { id: "err", label: "不能传 computed", correct: false, why: "computed 解包成 number 再传。完全合法。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appWithProps,
          "src/Stats.vue": statsProps,
        },
        blocks: [{ id: "props", label: "④ :completed / :total" }],
        narration: "管道接通了。请再勾选。统计必须跟着变。props 能用——但每多一个消费者，父就要再传一遍。",
      },
      observe: {
        state: [{ id: "completed", label: "completed", value: "1 → 2", symbol: "todos" }],
        dom: [{ id: "stats", label: "Stats", value: "跟着变" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "stats", kind: "component", label: "Stats" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "todos", to: "stats", label: "props" },
        { from: "stats", to: "dom" },
      ],
      explanation: {
        headline: "props 能用，也会钻",
        body: "两个消费者还好。十个页面、一个深孙子，就要一直往下传。composable 要解决的是：让读取发生在需要它的地方，而不是从 App 层层递。下一镜只抽函数，先不让 Stats 自己调用。",
      },
      tryThis: "勾选、取消。统计应和列表一致。这是「对的」，但还不是终点。",
      faqs: [
        { q: "为什么还要再抽 composable？", a: "props 能用。消费者一多，App 就变成接线板。抽函数是为了让读取发生在需要它的地方。" },
        { q: "completed 为什么可以当 prop 传？", a: "它是 number。computed 在模板/传参时会解包。和 ref 同一条规则。" },
      ],
      mapping: [{ code: '<Stats :completed :total />', runtime: "props 过边界", ui: "统计跟着变" }],
    },
    {
      id: "composable-s3",
      tick: "S3",
      title: "抽 useTodos，只有 App 用",
      goal: "把 todos / toggle 搬进函数。Stats 仍吃 props。页面可以不变。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "App 改成 const { todos, toggle } = useTodos()。Stats 仍吃 props。页面会？",
        choices: [
          { id: "same", label: "看起来一样，勾选仍带动统计", correct: true, why: "只是搬家。状态仍只有一份，仍由 App 调用一次，再经 props 给 Stats。" },
          { id: "break", label: "统计冻住，因为离开了 App", correct: false, why: "useTodos 在 App 里调用，返回值还在 App。props 边没断。" },
          { id: "err", label: "报错：不能在函数里用 ref", correct: false, why: "这正是 composable 的定义：在函数里调 Vue 的组合式 API。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appUsesComposable,
          "src/Stats.vue": statsProps,
          "src/composables/useTodos.js": useTodosInstance,
        },
        blocks: [{ id: "extract", label: "⑤ 抽出 useTodos()（ref 在函数里）" }],
        narration: "逻辑搬家了。状态仍由这一次调用创建。Stats 还不知道有这个函数。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "useTodos() 的这一份", symbol: "useTodos" }],
        dom: [{ id: "stats", label: "Stats", value: "仍吃 props" }],
        events: [],
      },
      nodes: [
        { id: "use", kind: "composable", label: "useTodos()", symbol: "useTodos" },
        { id: "app", kind: "component", label: "App" },
        { id: "stats", kind: "component", label: "Stats" },
      ],
      edges: [
        { from: "use", to: "app", label: "这一次调用" },
        { from: "app", to: "stats", label: "props" },
      ],
      why: {
        question: "为什么此时 ref 写在函数里面是对的？",
        choices: [
          { id: "once", label: "因为现在只有一次调用。每次调用本该有自己的状态——除非你故意共享", correct: true, why: "useMouse、useFetch 就该每次一份。清单这种「全应用一份」才要另说。下一镜让 Stats 也调用，你就看见两份。" },
          { id: "wrong", label: "ref 必须写在函数外，否则不是响应式", correct: false, why: "函数里的 ref 完全响应式。只对这一次调用。" },
          { id: "setup", label: "只能在 <script setup> 顶层用 ref", correct: false, why: "composable 正是「被 setup 调用的函数」。规则是：同步地在 setup 期间调用。" },
        ],
      },
      explanation: {
        headline: "composable 是函数，不是单例",
        body: "useXxx() 每次调用都执行函数体。ref 写在里面，就每份一份状态。这常常是对的。清单若要全应用共享，必须另接一条边。下一镜让 Stats 自己调用——别传 props 了。",
      },
      tryThis: "勾选仍应带动统计。打开 useTodos.js：todos 在函数里面。先记住。",
      faqs: [
        { q: "文件必须叫 composables/ 吗？", a: "约定。机制上只是一个导出函数的模块。" },
        { q: "为什么是 .js 不是 .vue？", a: "它没有模板。纯逻辑用模块。SFC 是给有界面的东西。" },
      ],
      mapping: [{ code: "useTodos()", runtime: "一次调用 → 一份 ref", ui: "仍正常" }],
    },
    {
      id: "composable-s4",
      tick: "S4",
      title: "Stats 自己也调用",
      goal: "去掉 props。两边都 useTodos()。ref 仍在函数里。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "两边各调用一次 useTodos()。勾选列表里的项，统计会？",
        choices: [
          { id: "sync", label: "跟着变成 2 / 2", correct: false, why: "两次调用创建两份 todos。你改的是 App 那一份。Stats 拿着另一份初始数据。" },
          { id: "split", label: "列表划线，统计冻在 1 / 2", correct: true, why: "抽函数不等于共享。每次调用是一个新的响应式世界。" },
          { id: "err", label: "报错：重复调用", correct: false, why: "合法。这是最常见的静默 bug。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appBothCall,
          "src/Stats.vue": statsUsesOwn,
          "src/composables/useTodos.js": useTodosInstance,
        },
        blocks: [{ id: "second", label: "⑥ Stats 也调用 useTodos()" }],
        narration: "请勾选第二项。列表和统计会分手。这不是 Vue 坏了，是你要的「共享」还没接上。",
      },
      replay: {
        label: "勾选第二项",
        steps: [
          { caption: "App 的那一份 todos[1].done → true", event: "change", highlight: ["app"] },
          { caption: "Stats 的那一份纹丝不动", highlight: ["stats"] },
          { caption: "两份 DOM 各说各的", highlight: ["dom"] },
        ],
      },
      observe: {
        state: [
          { id: "a", label: "App.todos[1].done", value: "true", symbol: "useTodos" },
          { id: "b", label: "Stats.todos[1].done", value: "false（另一份）", symbol: "useTodos" },
        ],
        dom: [{ id: "split", label: "UI", value: "列表对，统计错" }],
        events: [{ id: "click", label: "change", value: "toggle" }],
      },
      nodes: [
        { id: "use", kind: "composable", label: "useTodos", symbol: "useTodos" },
        { id: "app", kind: "component", label: "App 的那一份" },
        { id: "stats", kind: "component", label: "Stats 的那一份" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "use", to: "app", label: "调用 #1" },
        { from: "use", to: "stats", label: "调用 #2" },
      ],
      why: {
        question: "两次调用为什么不是同一份 todos？",
        choices: [
          { id: "new", label: "函数每次执行都 new 一个 ref([...])", correct: true, why: "和两次 setup 各有各的 count 一样。模块被 import 两次不会重新跑顶层——但 ref 不在顶层。" },
          { id: "import", label: "import 了两次，模块执行了两次", correct: false, why: "ESM 模块只求值一次。求值一次，函数仍可被调用两次。" },
          { id: "vue", label: "Vue 给每个组件隔离了 composable", correct: false, why: "没有这种魔法。是你把 ref 放在了函数体里。" },
        ],
      },
      explanation: {
        headline: "调用次数 = 状态份数",
        body: "ref 写在函数里：每次调用一份。这适合 useMouse。不适合「整个应用只有一份待办」。下一镜只把 const todos = ref(...) 挪到模块顶层。函数体不再 new。",
      },
      tryThis: "勾选「学 composable」。确认统计仍是 1 / 2。这是这一镜的正确答案。",
      faqs: [
        { q: "那 props 岂不是更安全？", a: "对「少数字段」是。composable 的价值是：很多组件要同一套读写，又不想层层传。共享必须显式。" },
      ],
      mapping: [{ code: "useTodos() × 2", runtime: "两份 ref 数组", ui: "统计过期" }],
    },
    {
      id: "composable-s5",
      tick: "S5",
      title: "把 todos 提到模块顶层",
      goal: "只挪一行：ref 离开函数体。两边仍各调用一次。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "todos 提到模块顶层后，再勾选。统计会？",
        choices: [
          { id: "ok", label: "跟着变成 2 / 2。两次调用读同一份 ref", correct: true, why: "模块只求值一次。顶层的 ref 是单例。函数只是把同一份交出去。" },
          { id: "still", label: "还是两份，因为调用了两次", correct: false, why: "调用两次只是两次 return 同一个 todos。" },
          { id: "err", label: "顶层不能用 ref", correct: false, why: "可以。这就是「模块级单例状态」。Pinia 要正式化的，也是这个。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appBothCall,
          "src/Stats.vue": statsUsesOwn,
          "src/composables/useTodos.js": useTodosShared,
        },
        blocks: [{ id: "hoist", label: "⑦ todos 挪到模块顶层" }],
        narration: "函数还是那个函数。变的是状态的住所。请再勾选——这一次两边必须一起变。",
      },
      replay: {
        label: "勾选第二项",
        steps: [
          { caption: "toggle 写模块级 todos", event: "change", highlight: ["use"] },
          { caption: "App 读到同一份", highlight: ["app"] },
          { caption: "Stats 读到同一份", highlight: ["stats"] },
        ],
      },
      observe: {
        state: [{ id: "todos", label: "todos（模块单例）", value: "1 份", symbol: "useTodos" }],
        dom: [{ id: "all", label: "UI", value: "列表和统计一致" }],
        events: [{ id: "click", label: "change", value: "toggle" }],
      },
      nodes: [
        { id: "use", kind: "composable", label: "模块级 todos", symbol: "useTodos" },
        { id: "app", kind: "component", label: "App" },
        { id: "stats", kind: "component", label: "Stats" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "use", to: "app", label: "同一份" },
        { from: "use", to: "stats", label: "同一份" },
        { from: "app", to: "dom" },
        { from: "stats", to: "dom" },
      ],
      explanation: {
        headline: "共享是把源放在调用之外",
        body: "模块顶层求值一次。所有 useTodos() 拿到同一个 ref。这已经是一个极小的 store。下一镜拆掉它，你会看见两种失败：再放回函数里，或根本没有这个模块。",
      },
      tryThis: "勾选、取消。统计必须同步。打开 useTodos.js，确认 const todos = ref 在 export function 上面。",
      faqs: [
        { q: "这不就是全局变量吗？", a: "是有意的单例。差别是：它仍是 ref，模板和 computed 能订阅。Pinia 会给它名字、DevTools、热更新。" },
        { q: "SSR 怎么办？", a: "模块单例会在请求之间泄漏状态。那正是下一课 Pinia 要管的。浏览器里的这份 Todo 先把图看清。" },
      ],
      mapping: [{ code: "const todos = ref(...) // 顶层", runtime: "单例 ref", ui: "两边同步" }],
    },
    {
      id: "composable-s6",
      tick: "S6",
      title: "拆掉单例 / 拆掉模块",
      goal: "两种坏法：每次一份，或根本没有这份逻辑。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "如果把 todos 再放回函数里，勾选后统计会？",
        choices: [
          { id: "ok", label: "仍然同步", correct: false, why: "那是上一镜刚修好的。放回去就回到两份状态。" },
          { id: "split", label: "再次分手：列表变，统计冻", correct: true, why: "调用次数又变成状态份数。" },
          { id: "err", label: "报错", correct: false, why: "静默。这就是它危险的原因。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appBothCall,
          "src/Stats.vue": statsUsesOwn,
          "src/composables/useTodos.js": useTodosShared,
        },
        blocks: [{ id: "keep", label: "共享版本先留着" }],
        narration: "先记住同步的图。再分别把 ref 放回函数里，或换成空壳模块。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "单例", symbol: "useTodos" }],
        dom: [{ id: "ok", label: "UI", value: "同步" }],
        events: [],
      },
      nodes: [
        { id: "use", kind: "composable", label: "useTodos", symbol: "useTodos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "use", to: "dom" }],
      ablations: [
        {
          id: "inside",
          prompt: "如果 ref 写在函数里？",
          files: {
            "src/App.vue": appBothCall,
            "src/Stats.vue": statsUsesOwn,
            "src/composables/useTodos.js": useTodosInstance,
          },
          expected: {
            kind: "stale",
            message: "勾选只改 App 那一份。Stats 仍显示 1 / 2。两次调用，两份数组。",
          },
          lesson: "抽函数只复用代码。共享状态要把源放在调用之外。",
        },
        {
          id: "empty",
          prompt: "如果模块是空壳？",
          files: {
            "src/App.vue": appBothCall,
            "src/Stats.vue": statsUsesOwn,
            "src/composables/useTodos.js": unusedFile,
          },
          expected: {
            kind: "stale",
            message: "toggle 是空函数，todos 是 []。界面空白或点了没反应。名字还在，源没有。",
          },
          lesson: "import { useTodos } 不会凭空变出状态。函数体才是源。",
        },
      ],
      explanation: {
        headline: "复用代码和复用状态是两条边",
        body: "空壳：有名字，没源。函数内 ref：有源，但每份各一份。模块顶层 ref：一份源，多次读取。Pinia 把第三种做成有名字的仓库。",
      },
      tryThis: "两种消融都勾一次第二项。看统计还跟不跟。看完点「恢复」。",
      faqs: [
        { q: "useMouse 也该提到顶层吗？", a: "不该。每个组件要自己的鼠标坐标。问「这份状态的寿命是一次调用，还是整个应用」。" },
      ],
    },
    {
      id: "composable-s7",
      tick: "S7",
      title: "换：两个计数按钮",
      goal: "A、B 两个按钮都要 n。它们该共享还是各一份？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "现在两个按钮绑同一个 n。若改成两次 useCount() 且 n 在函数里，点 A 会？",
        choices: [
          { id: "both", label: "A 和 B 一起加", correct: false, why: "那是共享。函数里的 ref 不会共享。" },
          { id: "a", label: "只有 A 加。B 仍是 0", correct: true, why: "两次调用，两份 n。和 todos 分手同一张图。若要一起加，把 n 提到顶层。" },
          { id: "err", label: "报错", correct: false, why: "能跑，只是你可能以为它们是一个计数器。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "count", label: "换场景：两个按钮" }],
        narration: "先是同一个 n。想清楚：拆成 useCount 之后，你要的是两个计数器，还是一个。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "0（一份）", symbol: "n" }],
        dom: [{ id: "btns", label: "button × 2", value: "共享" }],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n", symbol: "n" },
        { id: "dom", kind: "dom", label: "A 和 B" },
      ],
      edges: [{ from: "n", to: "dom" }],
      ablations: [
        {
          id: "own",
          prompt: "两次 useCount，n 在函数里？",
          files: {
            "src/App.vue": transferSplit,
            "src/composables/useCount.js": useCountOwn,
          },
          expected: {
            kind: "stale",
            message: "这不一定是 bug：A、B 各是一个计数器。点 A，B 不动。",
          },
          lesson: "先问产品：要几个计数器。再决定 ref 放函数里还是模块顶层。",
        },
        {
          id: "share",
          prompt: "两次 useCount，n 在顶层？",
          files: {
            "src/App.vue": transferShared,
            "src/composables/useCount.js": useCountShared,
          },
          expected: {
            kind: "stale",
            message: "这是共享：点 A，B 也加。和模块级 todos 同一张图。",
          },
          lesson: "迁移成功：你能指出「状态份数 = 调用次数还是模块次数」。下一课 Pinia 给这份单例一个官方身份。",
        },
      ],
      why: {
        question: "如何判断 ref 该放函数里还是模块顶层？",
        choices: [
          { id: "life", label: "看寿命：每次使用一份，还是整个应用一份", correct: true, why: "鼠标、请求、表单草稿 → 函数里。当前用户、待办清单、主题 → 模块或 store。" },
          { id: "always", label: "永远放顶层，省事", correct: false, why: "两个输入框会共享一份草稿。灾难。" },
          { id: "never", label: "永远放函数里，才是真正的 composable", correct: false, why: "官方文档两种都有。共享是显式选择，不是教条。" },
        ],
      },
      explanation: {
        headline: "composable 的身份是「带响应式的函数」",
        body: "你会不会写 useXxx 不重要。重要的是换两个按钮，你仍能指出状态该有几份。Pinia 只是给「应用一份」那种，换一个带名字的房子。",
      },
      tryThis: "先点 A、B 确认它们现在共享。再试两种消融：各一份 vs 顶层单例。",
    },
  ],
};
