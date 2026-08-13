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

const cheat = `<script setup>
import { ref, computed } from 'vue'

const price = ref(10)
const quantity = ref(2)

const total = computed(() => {
  return price.value * quantity.value
})

function cheat() {
  total.value = 99
}
</script>

<template>
  <p>单价 {{ price }} × 数量 {{ quantity }}</p>
  <p class="total">合计 {{ total }}</p>
  <button @click="quantity++">多买一件</button>
  <button @click="cheat">把合计写成 99</button>
</template>
`;

const methodTotal = `<script setup>
import { ref } from 'vue'

const price = ref(10)
const quantity = ref(2)
const label = ref('合计')

function total() {
  console.log('计算 total')
  return price.value * quantity.value
}
</script>

<template>
  <p>单价 {{ price }} × 数量 {{ quantity }}</p>
  <p class="total">{{ label }} {{ total() }}</p>
  <button @click="quantity++">多买一件</button>
  <button @click="label = '应付'">只改文案</button>
</template>
`;

const computedLabel = `<script setup>
import { ref, computed } from 'vue'

const price = ref(10)
const quantity = ref(2)
const label = ref('合计')

const total = computed(() => {
  console.log('计算 total')
  return price.value * quantity.value
})
</script>

<template>
  <p>单价 {{ price }} × 数量 {{ quantity }}</p>
  <p class="total">{{ label }} {{ total }}</p>
  <button @click="quantity++">多买一件</button>
  <button @click="label = '应付'">只改文案</button>
</template>
`;

export const COMPUTED_LAB: CausalLab = {
  id: "computed",
  world: 1,
  concept: "computed",
  title: "合计是算出来的",
  subtitle: "派生值不该再手写一份状态",
  promise: "看见 total 如何从 price × quantity 长出来——为什么它不是又一个 ref、为什么不能赋值、以及方法和 computed 差在缓存。",
  minutes: 22,
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
        { q: "再做一个 total = ref(20)，点按钮时手动改它不行吗？", a: "能跑，直到你忘了改那一次。那是下一节 watch 会拆穿的假同步。这里先不要第三份记忆。" },
      ],
      tryThis: "点「多买一件」。数量会变，页面上还没有合计。记住缺的是显示，不是缺一个变量。",
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
      tryThis: "确认页面仍没有「合计」。打开 X-Ray：total 在，但是 lazy。",
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
        { q: "写成 function total() 再 {{ total() }} 呢？", a: "两镜之后会让你亲眼对比。先记住：现在 total 是一颗会失效的节点，不是每次渲染都跑的函数。" },
      ],
      mapping: [
        { code: "{{ total }}", runtime: "读取 computed → 20", ui: "合计 20" },
      ],
      tryThis: "确认出现「合计 20」。还不要点按钮——下一镜才看它跟着变。",
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
      tryThis: "连点「多买一件」。合计必须是 30、40、50。没有人给 total 赋值。",
    },
    {
      id: "computed-s4",
      tick: "S4",
      title: "把合计写成 99",
      goal: "派生值默认只读。写入会被拒绝。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「把合计写成 99」之后，合计会？",
        choices: [
          { id: "99", label: "变成 99，直到下一次多买才改回来", correct: false, why: "默认 computed 没有 setter。赋值进不去。" },
          { id: "keep", label: "仍是 20。赋值被拒绝，控制台会警告", correct: true, why: "total 没有自己的真相。99 不是合法写入。公式还是 10×2。" },
          { id: "err", label: "页面崩溃", correct: false, why: "Vue 会警告，不会把应用炸掉。失败是静默的拒绝。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": cheat },
        blocks: [{ id: "cheat", label: "⑤ total.value = 99" }],
        narration: "只多了一个「作弊」按钮。它试图给派生值赋值。",
      },
      observe: {
        state: [{ id: "total", label: "total", value: "20（只读）", symbol: "total" }],
        dom: [{ id: "total", label: ".total", value: "合计 20", symbol: "total" }],
        events: [{ id: "cheat", label: "click", value: "cheat()" }],
      },
      nodes: [
        { id: "cheat", kind: "event", label: "cheat" },
        { id: "total", kind: "computed", label: "total", detail: "readonly", symbol: "total" },
        { id: "dom", kind: "dom", label: "DOM", detail: "仍是 20" },
      ],
      edges: [
        { from: "cheat", to: "total", label: "写入被拒" },
        { from: "total", to: "dom" },
      ],
      why: {
        question: "为什么不能给 total 赋值？",
        choices: [
          { id: "derived", label: "它是算出来的。真相在 price 和 quantity", correct: true, why: "你要改合计，就去改数量或单价。直接写 total 是在第二份记忆上动手。" },
          { id: "bug", label: "Vue 3 的限制，Vue 2 的计算属性可以写", correct: false, why: "Vue 2 默认也不能写。两边都要显式提供 set 才是可写 computed。" },
          { id: "ref", label: "应该先把 total 改成 ref", correct: false, why: "那又变回第三份要同步的记忆。watch 课会拆这条路。" },
        ],
      },
      explanation: {
        headline: "派生没有自己的抽屉",
        body: "ref 是记忆。computed 是公式。给公式赋值，等于要求它忘掉来源。Vue 拒绝，是在保护那张图。下一镜再看：换成普通函数，脸可以一样，缓存不一样。",
      },
      faqs: [
        { q: "可写的 computed 呢？", a: "可以提供 { get, set }。set 里你仍应去改源状态，而不是偷偷存一份。多数合计不需要。" },
        { q: "控制台那句 readonly 要紧张吗？", a: "要。它在说：你走错了边。改 quantity，不要改 total。" },
      ],
      tryThis: "先点「把合计写成 99」。必须仍是 20。再点「多买一件」，变成 30——公式还活着。",
      mapping: [
        { code: "total.value = 99", runtime: "readonly computed → 拒绝", ui: "合计仍是 20" },
      ],
    },
    {
      id: "computed-s5",
      tick: "S5",
      title: "换成方法",
      goal: "function total() 每次渲染都跑。computed 只在依赖变时重算。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "把 total 换成 function，模板写 {{ total() }}。点「只改文案」（不改数量）会？",
        choices: [
          { id: "rerun", label: "合计仍是 20，但函数又跑了一次", correct: true, why: "改 label 会重渲染。渲染读到 total()，方法每次都执行。价格没变，白算了。" },
          { id: "skip", label: "函数不跑，因为 price / quantity 没变", correct: false, why: "那是 computed 的缓存。方法没有这张图。" },
          { id: "zero", label: "合计变成 0", correct: false, why: "函数仍会算出 20。错的不是结果，是「不该跑却跑了」。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": methodTotal },
        blocks: [{ id: "fn", label: "⑥ total 改成 function" }],
        narration: "脸几乎一样。图上少了一颗会失效的节点，多了一个每次渲染都调用的函数。",
      },
      observe: {
        state: [
          { id: "label", label: "label", value: "合计", symbol: "label" },
          { id: "total", label: "total()", value: "每次渲染都跑", symbol: "total" },
        ],
        dom: [{ id: "total", label: ".total", value: "合计 20" }],
        events: [{ id: "label", label: "click", value: "只改文案" }],
      },
      nodes: [
        { id: "label", kind: "ref", label: "label", symbol: "label" },
        { id: "fn", kind: "script", label: "total()", detail: "无缓存" },
        { id: "render", kind: "render", label: "render" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "label", to: "render" },
        { from: "fn", to: "render", label: "每次都跑" },
        { from: "render", to: "dom" },
      ],
      ablations: [
        {
          id: "use-computed",
          prompt: "换回 computed 之后？",
          files: { "src/App.vue": computedLabel },
          expected: {
            kind: "stale",
            message: "这是修复：点「只改文案」时不再打印「计算 total」。label 不是公式的依赖。",
          },
          lesson: "方法回答「现在算一遍」。computed 回答「依赖没变就用上次的」。脸可以一样，图不一样。",
        },
      ],
      why: {
        question: "方法和 computed 什么时候看起来一样、什么时候分叉？",
        choices: [
          { id: "cache", label: "依赖没变却要重渲染时，方法白跑，computed 安静", correct: true, why: "改文案、改无关状态、父组件重渲染，都会让方法再跑。computed 看的是自己读过的源。" },
          { id: "same", label: "永远一样，只是写法不同", correct: false, why: "这一镜就是反例。打开控制台就能看见。" },
          { id: "method", label: "方法更快，因为没有依赖图开销", correct: false, why: "便宜的乘法看不出来。过滤大列表、一排 {{ total() }} 时，缓存才是正确性也是性能。" },
        ],
      },
      explanation: {
        headline: "看起来像，图不一样",
        body: "模板里写 total()，渲染期间会去读 price / quantity，所以点「多买一件」合计仍会对。它不是「坏掉的 computed」，是「没有缓存的计算」。要的是派生节点时，用 computed。",
      },
      faqs: [
        { q: "为什么方法也能跟着 quantity 变？", a: "因为渲染函数调用它时读了 .value。依赖登记在模板 effect 上，不在 total 这颗节点上。所以无关的 label 一变，它也得再跑。" },
        { q: "控制台没有打印？", a: "打开浏览器控制台再点「只改文案」。方法每次一条「计算 total」。换回 computed 后，改文案应安静。" },
      ],
      tryThis: "打开控制台。点「只改文案」——数字仍是 20，但每次都在算。再打开「换回 computed」：改文案时控制台应安静；多买一件才会再算。",
      mapping: [
        { code: "{{ total() }}", runtime: "每次渲染调用", ui: "合计 20（无缓存）" },
        { code: "{{ total }}", runtime: "读取 computed 缓存", ui: "合计 20（依赖变才重算）" },
      ],
    },
    {
      id: "computed-s6",
      tick: "S6",
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
        body: "一次乘法给你一个数字。computed 给你一颗会失效、会重算、会被模板订阅的节点。购物车合计属于后者。给它赋值会被拒；换成方法则丢掉缓存。三种都不是「再存一份 ref」。",
      },
      tryThis: "先连点确认合计会走。再试「如果只乘一次」：冻在 20。看完点「恢复」。",
      faqs: [
        { q: "和上一镜的方法有何不同？", a: "方法每次渲染会重算，结果仍对。一次乘法只在 setup 时算一次，之后永远是 20。一个是没缓存，一个是没订阅。" },
        { q: "为什么这里不用 watch？", a: "因为你要的是一个值。watch 去同步另一个 ref，是下一节要拆的多余中间人。" },
      ],
    },
    {
      id: "computed-s7",
      tick: "S7",
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
        { q: "completedTodos.value = [] 可以清空完成项吗？", a: "不行。和 total.value = 99 同一条边。要改的是 todos 里的 done，不是派生数组。" },
      ],
      tryThis: "先看「全部 3 项」。再打开「放入 computed」：应是完成 1 / 3。没有人另存一份完成列表。",
    },
  ],
};
