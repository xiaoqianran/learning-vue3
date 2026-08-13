import type { CausalLab } from "../types";

const s0 = `<script setup>
import { ref } from 'vue'

const price = ref(10)
const quantity = ref(2)
</script>

<template>
  <p>单价 {{ price }} × 数量 {{ quantity }}</p>
  <button @click="quantity++">多买一件</button>
</template>
`;

const s1 = `<script setup>
import { ref, computed } from 'vue'

const price = ref(10)
const quantity = ref(2)

const total = computed(() => {
  return price.value * quantity.value
})
</script>

<template>
  <p>单价 {{ price }} × 数量 {{ quantity }}</p>
  <button @click="quantity++">多买一件</button>
</template>
`;

const s2 = `<script setup>
import { ref, computed } from 'vue'

const price = ref(10)
const quantity = ref(2)

const total = computed(() => {
  return price.value * quantity.value
})
</script>

<template>
  <p>单价 {{ price }} × 数量 {{ quantity }}</p>
  <p class="total">合计 {{ total }}</p>
  <button @click="quantity++">多买一件</button>
</template>
`;

const plainConst = `<script setup>
import { ref } from 'vue'

const price = ref(10)
const quantity = ref(2)
const total = price.value * quantity.value
</script>

<template>
  <p>单价 {{ price }} × 数量 {{ quantity }}</p>
  <p class="total">合计 {{ total }}</p>
  <button @click="quantity++">多买一件</button>
</template>
`;

const noComputed = `<script setup>
import { ref } from 'vue'

const price = ref(10)
const quantity = ref(2)
</script>

<template>
  <p>单价 {{ price }} × 数量 {{ quantity }}</p>
  <p class="total">合计 {{ total }}</p>
  <button @click="quantity++">多买一件</button>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '学 ref', done: true },
  { id: 2, title: '学 computed', done: false },
  { id: 3, title: '学 watch', done: false },
])
</script>

<template>
  <p>全部 {{ todos.length }} 项</p>
  <ul>
    <li v-for="t in todos" :key="t.id">
      {{ t.done ? '✓' : '○' }} {{ t.title }}
    </li>
  </ul>
</template>
`;

const transferAfter = `<script setup>
import { ref, computed } from 'vue'

const todos = ref([
  { id: 1, title: '学 ref', done: true },
  { id: 2, title: '学 computed', done: false },
  { id: 3, title: '学 watch', done: false },
])

const completedTodos = computed(() => {
  return todos.value.filter((t) => t.done)
})
</script>

<template>
  <p>完成 {{ completedTodos.length }} / {{ todos.length }}</p>
  <ul>
    <li v-for="t in todos" :key="t.id">
      {{ t.done ? '✓' : '○' }} {{ t.title }}
    </li>
  </ul>
</template>
`;

export const COMPUTED_LAB: CausalLab = {
  id: "computed",
  world: 1,
  concept: "computed",
  title: "合计是算出来的",
  subtitle: "派生值不该再手写一份状态",
  promise: "看见 total 如何从 price × quantity 长出来——以及为什么它不是又一个 ref。",
  minutes: 14,
  official: "/guide/essentials/computed.html",
  scenes: [
    {
      id: "computed-s0",
      tick: "S0",
      title: "单价与数量",
      goal: "页面已经有 price 和 quantity。需求：显示合计。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": s0 },
        blocks: [{ id: "base", label: "① 两个 ref" }],
        narration: "两个独立状态。合计还没有出现——我们还不知道它该以什么身份存在。",
      },
      observe: {
        state: [
          { id: "price", label: "price", value: "10", symbol: "price" },
          { id: "quantity", label: "quantity", value: "2", symbol: "quantity" },
        ],
        dom: [
          { id: "line", label: "p", value: "单价 10 × 数量 2" },
          { id: "btn", label: "button", value: "多买一件" },
        ],
        events: [{ id: "click", label: "click", value: "quantity++" }],
      },
      nodes: [
        { id: "price", kind: "ref", label: "price", detail: "10", symbol: "price" },
        { id: "qty", kind: "ref", label: "quantity", detail: "2", symbol: "quantity" },
        { id: "render", kind: "render", label: "template" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "price", to: "render" },
        { from: "qty", to: "render" },
        { from: "render", to: "dom" },
      ],
      replay: {
        label: "多买一件",
        steps: [
          { caption: "click", event: "click", highlight: ["qty"] },
          { caption: "quantity  2 → 3", highlight: ["qty"], state: { id: "quantity", from: "2", to: "3" } },
          { caption: "DOM 更新数量，仍没有合计", highlight: ["dom"] },
        ],
      },
      explanation: {
        headline: "需求是派生，不是第三份记忆",
        body: "合计可以由已有状态算出来。如果再存一个 total = ref(20)，你就多了一份必须亲手同步的记忆。先别写。先问：页面现在缺的是显示，还是缺一条派生边？",
      },
      faqs: [
        { q: "为什么不直接在模板里写 price * quantity？", a: "可以。但合计一旦被多处使用，或者还要加折扣，表达式会散落。computed 把派生变成有名字的状态。" },
      ],
    },
    {
      id: "computed-s1",
      tick: "S1",
      title: "创建 total",
      goal: "声明派生值，但先不放到模板里。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加入 const total = computed(() => price.value * quantity.value) 之后，右侧页面会变化吗？",
        choices: [
          { id: "yes", label: "会，出现合计 20", correct: false, why: "total 被创建了，但模板没读它。和当初 count 一样。" },
          { id: "no", label: "不会。模板还没读取 total", correct: true, why: "computed 是懒的：没人读，连计算函数都不会跑。" },
          { id: "err", label: "会报错，因为没用到", correct: false, why: "未使用的 computed 是合法的，只是不会求值。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s1 },
        blocks: [
          { id: "import", label: "① import computed" },
          { id: "total", label: "② 创建 total" },
          { id: "deps", label: "③ 声明对 price / quantity 的读取" },
        ],
        narration: "派生值有了名字。界面还不知道这件事。",
      },
      observe: {
        state: [
          { id: "price", label: "price", value: "10", symbol: "price" },
          { id: "quantity", label: "quantity", value: "2", symbol: "quantity" },
          { id: "total", label: "total", value: "未求值（无人读取）", symbol: "total" },
        ],
        dom: [{ id: "line", label: "p", value: "单价 10 × 数量 2" }],
        events: [],
      },
      nodes: [
        { id: "price", kind: "ref", label: "price", symbol: "price" },
        { id: "qty", kind: "ref", label: "quantity", symbol: "quantity" },
        { id: "total", kind: "computed", label: "total", detail: "lazy", symbol: "total" },
        { id: "dom", kind: "dom", label: "DOM", detail: "仍无合计" },
      ],
      edges: [
        { from: "price", to: "total", label: "尚未触发" },
        { from: "qty", to: "total", label: "尚未触发" },
      ],
      why: {
        question: "computed 为什么此时不算出 20？",
        choices: [
          { id: "lazy", label: "它是懒的：第一次被读取才计算", correct: true, why: "没人读 total，求值函数不会跑。这和「模板没读 count 页面不变」是同一条规则。" },
          { id: "bug", label: "写错了，应该用 total.value 立刻调用", correct: false, why: "创建 computed 不是调用。读取才是。" },
          { id: "watch", label: "必须配一个 watch 才会算", correct: false, why: "那会把派生误做成副作用。下一节会对比。" },
        ],
      },
      explanation: {
        headline: "创建 ≠ 求值 ≠ 显示",
        body: "三件不同的事：声明派生、第一次读取、写进 DOM。这一镜只做了第一件。这是故意的最小变更。",
      },
      faqs: [
        { q: "为什么页面没变化？", a: "模板没读 total。computed 默认懒计算，连 20 都还没算出来。" },
        { q: ".value 为什么 script 需要、模板不需要？", a: "script 里 total 是 ComputedRef 对象；模板自动解包。和 ref 同一条规则。" },
      ],
      mapping: [
        { code: "computed(() => price.value * quantity.value)", runtime: "total 节点（lazy）", ui: "尚未出现" },
      ],
    },
    {
      id: "computed-s2",
      tick: "S2",
      title: "模板读取 total",
      goal: "让合计出现在页面上。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "模板加上「合计 {{ total }}」后？",
        choices: [
          { id: "20", label: "出现合计 20", correct: true, why: "第一次读取 total → 求值 10×2 → 缓存 20 → 写进 DOM。" },
          { id: "0", label: "出现合计 0，要再点一次才对", correct: false, why: "首次读取就会立刻求值，不需要先点按钮。" },
          { id: "no", label: "还是没有合计", correct: false, why: "模板读取就是那一下触发。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s2 },
        blocks: [{ id: "read", label: "④ 模板读取 total" }],
        narration: "现在有一条完整的派生链：price、quantity → total → DOM。",
      },
      observe: {
        state: [
          { id: "price", label: "price", value: "10", symbol: "price" },
          { id: "quantity", label: "quantity", value: "2", symbol: "quantity" },
          { id: "total", label: "total", value: "20", symbol: "total" },
        ],
        dom: [
          { id: "line", label: "p", value: "单价 10 × 数量 2" },
          { id: "total", label: ".total", value: "合计 20", symbol: "total" },
        ],
        events: [],
      },
      nodes: [
        { id: "price", kind: "ref", label: "price", detail: "10", symbol: "price" },
        { id: "qty", kind: "ref", label: "quantity", detail: "2", symbol: "quantity" },
        { id: "total", kind: "computed", label: "total", detail: "20", symbol: "total" },
        { id: "render", kind: "render", label: "template" },
        { id: "dom", kind: "dom", label: "DOM", detail: "合计 20" },
      ],
      edges: [
        { from: "price", to: "total" },
        { from: "qty", to: "total" },
        { from: "total", to: "render" },
        { from: "render", to: "dom" },
      ],
      explanation: {
        headline: "total 没有自己的「真相」",
        body: "20 不是被记住的，是被算出来的。price 或 quantity 以后再变，total 只在有人读它时按需重算，并缓存到下次依赖变化。",
      },
      faqs: [
        { q: "和在模板里写 price * quantity 有何不同？", a: "结果一样。computed 的价值是：有名字、可复用、有缓存、能在 X-Ray 里成为一颗节点。" },
      ],
      mapping: [
        { code: "{{ total }}", runtime: "读取 computed → 20", ui: "合计 20" },
      ],
    },
    {
      id: "computed-s3",
      tick: "S3",
      title: "改数量，合计自己变",
      goal: "验证：没人给 total 赋值，它却会更新。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": s2 },
        blocks: [{ id: "same", label: "代码不变，只观察运行" }],
        narration: "这一镜不改代码。只看 quantity 变化时，哪条边被点亮。",
      },
      replay: {
        label: "多买两件",
        steps: [
          { caption: "click", event: "click", highlight: ["qty"] },
          { caption: "quantity  2 → 3", highlight: ["qty"], state: { id: "quantity", from: "2", to: "3" } },
          { caption: "total 缓存失效", highlight: ["total"] },
          { caption: "total  20 → 30", highlight: ["total"], state: { id: "total", from: "20", to: "30" } },
          { caption: "DOM  「合计 20」→「合计 30」", highlight: ["dom"] },
          { caption: "再点：3 → 4，total 30 → 40", event: "click", highlight: ["qty", "total", "dom"], state: { id: "total", from: "30", to: "40" } },
        ],
      },
      observe: {
        state: [
          { id: "quantity", label: "quantity", value: "2 → n", symbol: "quantity" },
          { id: "total", label: "total", value: "20 → 10n", symbol: "total" },
        ],
        dom: [{ id: "total", label: ".total", value: "合计 10×n", symbol: "total" }],
        events: [{ id: "click", label: "click", value: "quantity++" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "click" },
        { id: "qty", kind: "ref", label: "quantity", symbol: "quantity" },
        { id: "total", kind: "computed", label: "total", symbol: "total" },
        { id: "render", kind: "render", label: "render" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "click", to: "qty" },
        { from: "qty", to: "total", label: "失效" },
        { from: "total", to: "render" },
        { from: "render", to: "dom" },
      ],
      explanation: {
        headline: "没有人给 total 赋值",
        body: "你只改了 quantity。total 作为订阅者被失效，下一次渲染读取它时重算。这就是「派生」：它不是被同步的，是被依赖追踪出来的。",
      },
      faqs: [
        { q: "为什么这里不用 watch？", a: "因为你要的是一个值，不是一个副作用。watch 适合去 fetch、打日志、改 title。下一节会把两个世界并排放。" },
      ],
    },
    {
      id: "computed-s4",
      tick: "S4",
      title: "如果不用 computed？",
      goal: "消融：普通乘法 vs 派生。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "如果写成 const total = price.value * quantity.value（不是 computed），点「多买一件」后合计会？",
        choices: [
          { id: "upd", label: "跟着变成 30、40", correct: false, why: "那只算了一次，得到普通数字 20。之后 quantity 再变，total 不会知道。" },
          { id: "stuck", label: "冻在 20", correct: true, why: "一次乘法产出的是普通 number，没有依赖图。" },
          { id: "err", label: "报错", correct: false, why: "合法。静默过期比报错更糟。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s2 },
        blocks: [{ id: "keep", label: "正确版本先留着" }],
        narration: "先记住正确的图。再换成一次乘法，看哪条边消失。",
      },
      observe: {
        state: [{ id: "total", label: "total", value: "20（computed）", symbol: "total" }],
        dom: [{ id: "total", label: ".total", value: "合计 20", symbol: "total" }],
        events: [],
      },
      nodes: [
        { id: "price", kind: "ref", label: "price" },
        { id: "qty", kind: "ref", label: "quantity" },
        { id: "total", kind: "computed", label: "total", symbol: "total" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "price", to: "total" },
        { from: "qty", to: "total" },
        { from: "total", to: "dom" },
      ],
      ablations: [
        {
          id: "plain-const",
          prompt: "如果只乘一次？",
          files: { "src/App.vue": plainConst },
          expected: {
            kind: "stale",
            message: "合计冻在 20。quantity 变了，total 仍是当时算出来的普通数字。",
          },
          lesson: "缺少的不是乘法，是「依赖还活着」。computed 把这次读取登记进图里。",
        },
        {
          id: "missing",
          prompt: "如果没有 total？",
          files: { "src/App.vue": noComputed },
          expected: {
            kind: "error",
            message: "total is not defined",
          },
          lesson: "模板读一个不存在的名字会炸。和「算过一次但过期」是两种失败。",
        },
      ],
      explanation: {
        headline: "派生必须留在图里",
        body: "一次乘法给你一个数字。computed 给你一颗会失效、会重算、会被模板订阅的节点。购物车合计属于后者。",
      },
    },
    {
      id: "computed-s5",
      tick: "S5",
      title: "Todo：完成数放哪？",
      goal: "换场景。completedTodos 最适合以什么身份存在？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "列表要显示「完成 x / 全部 y」。completedTodos 最适合放在哪里？",
        choices: [
          { id: "computed", label: "computed：从 todos 过滤出来", correct: true, why: "它完全由 todos 决定，不该再存一份要同步的数组。" },
          { id: "ref-watch", label: "再做一个 ref，用 watch 去同步", correct: false, why: "能跑，但多了一条必须维护的边。下一节会让你看见这种成本。" },
          { id: "copy", label: "在点击完成时手动 push 到另一数组", correct: false, why: "事件里同步副本，迟早漏一次。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "todos", label: "换场景：Todo 列表" }],
        narration: "先只给 todos。完成数还没出现。你的工作是判断机制，不是默写 API。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "3 items", symbol: "todos" }],
        dom: [{ id: "all", label: "p", value: "全部 3 项" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "todos", to: "dom" }],
      ablations: [
        {
          id: "add-completed",
          prompt: "放入 computed 之后？",
          files: { "src/App.vue": transferAfter },
          expected: {
            kind: "stale",
            message: "这是修复：完成 1 / 3。completedTodos 从 todos 派生，没有第二份真相。",
          },
          lesson: "迁移题的正确答案不是「会写 filter」，而是「这是派生，不是存储」。",
        },
      ],
      explanation: {
        headline: "会判断身份，才算会用 computed",
        body: "购物车的 total 和 Todo 的 completedTodos 是同一个结构：源状态 → 纯函数 → 派生值。场景换了，图没换。",
      },
      faqs: [
        { q: "filteredUsers 呢？", a: "搜索关键词是源，过滤列表是派生。仍然是 computed。只有当你要在过滤之后去请求网络，才轮到 watch。" },
      ],
    },
  ],
};
