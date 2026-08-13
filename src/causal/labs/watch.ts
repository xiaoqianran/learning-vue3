import type { CausalLab, CounterfactualWorld } from "../types";

const need = `<script setup>
import { ref } from 'vue'

const price = ref(10)
const quantity = ref(2)
</script>

<template>
  <p>单价 {{ price }} × {{ quantity }} 件</p>
  <button @click="quantity++">多买一件</button>
</template>
`;

const computedWorld = `<script setup>
import { ref, computed } from 'vue'

const price = ref(10)
const quantity = ref(2)

const total = computed(() => price.value * quantity.value)
</script>

<template>
  <p>单价 {{ price }} × {{ quantity }} 件</p>
  <p class="total">合计 {{ total }}</p>
  <button @click="quantity++">多买一件</button>
</template>
`;

const watchWorld = `<script setup>
import { ref, watch } from 'vue'

const price = ref(10)
const quantity = ref(2)
const total = ref(0)

watch([price, quantity], () => {
  total.value = price.value * quantity.value
}, { immediate: true })
</script>

<template>
  <p>单价 {{ price }} × {{ quantity }} 件</p>
  <p class="total">合计 {{ total }}</p>
  <button @click="quantity++">多买一件</button>
</template>
`;

const watchNoImmediate = `<script setup>
import { ref, watch } from 'vue'

const price = ref(10)
const quantity = ref(2)
const total = ref(0)

watch([price, quantity], () => {
  total.value = price.value * quantity.value
})
</script>

<template>
  <p>单价 {{ price }} × {{ quantity }} 件</p>
  <p class="total">合计 {{ total }}</p>
  <button @click="quantity++">多买一件</button>
</template>
`;

const computedDiscount = `<script setup>
import { ref, computed } from 'vue'

const price = ref(10)
const quantity = ref(2)
const discount = ref(0.8)

const total = computed(() => {
  return price.value * quantity.value * discount.value
})
</script>

<template>
  <p>单价 {{ price }} × {{ quantity }} × 折扣 {{ discount }}</p>
  <p class="total">合计 {{ total }}</p>
  <button @click="quantity++">多买一件</button>
</template>
`;

const watchDiscount = `<script setup>
import { ref, watch } from 'vue'

const price = ref(10)
const quantity = ref(2)
const discount = ref(0.8)
const total = ref(0)

watch([price, quantity, discount], () => {
  total.value = price.value * quantity.value * discount.value
}, { immediate: true })
</script>

<template>
  <p>单价 {{ price }} × {{ quantity }} × 折扣 {{ discount }}</p>
  <p class="total">合计 {{ total }}</p>
  <button @click="quantity++">多买一件</button>
</template>
`;

const watchForgot = `<script setup>
import { ref, watch } from 'vue'

const price = ref(10)
const quantity = ref(2)
const discount = ref(0.8)
const total = ref(0)

watch([price, quantity], () => {
  total.value = price.value * quantity.value * discount.value
}, { immediate: true })
</script>

<template>
  <p>单价 {{ price }} × {{ quantity }} × 折扣 {{ discount }}</p>
  <p class="total">合计 {{ total }}</p>
  <button @click="discount = 0.5">改折扣为 0.5</button>
</template>
`;

const titleWatch = `<script setup>
import { ref, computed, watch } from 'vue'

const price = ref(10)
const quantity = ref(2)
const total = computed(() => price.value * quantity.value)

watch(total, (value) => {
  document.title = '合计 ' + value
}, { immediate: true })
</script>

<template>
  <p>合计 {{ total }}（看浏览器标题）</p>
  <button @click="quantity++">多买一件</button>
</template>
`;

const transfer = `<script setup>
import { ref } from 'vue'

const query = ref('')
const users = ref([
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Lin' },
  { id: 3, name: 'Turing' },
])
</script>

<template>
  <input v-model="query" placeholder="搜索名字" />
  <ul>
    <li v-for="u in users" :key="u.id">{{ u.name }}</li>
  </ul>
</template>
`;

const transferComputed = `<script setup>
import { ref, computed } from 'vue'

const query = ref('')
const users = ref([
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Lin' },
  { id: 3, name: 'Turing' },
])

const filteredUsers = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter((u) => u.name.toLowerCase().includes(q))
})
</script>

<template>
  <input v-model="query" placeholder="搜索名字" />
  <ul>
    <li v-for="u in filteredUsers" :key="u.id">{{ u.name }}</li>
  </ul>
</template>
`;

const worldA: CounterfactualWorld = {
  id: "A",
  name: "computed",
  tagline: "total 自动派生",
  files: { "src/App.vue": computedWorld },
  nodes: [
    { id: "price", kind: "ref", label: "price" },
    { id: "qty", kind: "ref", label: "quantity" },
    { id: "total", kind: "computed", label: "total" },
    { id: "dom", kind: "dom", label: "DOM" },
  ],
  edges: [
    { from: "price", to: "total" },
    { from: "qty", to: "total" },
    { from: "total", to: "dom" },
  ],
  note: "price / quantity 直接流入 total。没有中间的手写赋值。",
};

const worldB: CounterfactualWorld = {
  id: "B",
  name: "watch",
  tagline: "手动同步 total",
  files: { "src/App.vue": watchWorld },
  nodes: [
    { id: "price", kind: "ref", label: "price" },
    { id: "qty", kind: "ref", label: "quantity" },
    { id: "watch", kind: "watch", label: "watch" },
    { id: "total", kind: "ref", label: "total" },
    { id: "dom", kind: "dom", label: "DOM" },
  ],
  edges: [
    { from: "price", to: "watch" },
    { from: "qty", to: "watch" },
    { from: "watch", to: "total", label: "赋值" },
    { from: "total", to: "dom" },
  ],
  note: "多了一颗 watch 节点，再把结果写进另一个 ref。界面可以长得一样。",
};

const worldA2: CounterfactualWorld = {
  ...worldA,
  files: { "src/App.vue": computedDiscount },
  nodes: [
    { id: "price", kind: "ref", label: "price" },
    { id: "qty", kind: "ref", label: "quantity" },
    { id: "disc", kind: "ref", label: "discount" },
    { id: "total", kind: "computed", label: "total" },
    { id: "dom", kind: "dom", label: "DOM" },
  ],
  edges: [
    { from: "price", to: "total" },
    { from: "qty", to: "total" },
    { from: "disc", to: "total" },
    { from: "total", to: "dom" },
  ],
  note: "折扣只是公式里多一个因子。图自然长出一条边。",
};

const worldB2: CounterfactualWorld = {
  ...worldB,
  files: { "src/App.vue": watchDiscount },
  nodes: [
    { id: "price", kind: "ref", label: "price" },
    { id: "qty", kind: "ref", label: "quantity" },
    { id: "disc", kind: "ref", label: "discount" },
    { id: "watch", kind: "watch", label: "watch" },
    { id: "total", kind: "ref", label: "total" },
    { id: "dom", kind: "dom", label: "DOM" },
  ],
  edges: [
    { from: "price", to: "watch" },
    { from: "qty", to: "watch" },
    { from: "disc", to: "watch" },
    { from: "watch", to: "total" },
    { from: "total", to: "dom" },
  ],
  note: "你必须记得把 discount 放进 watch 数组。漏了，界面仍显示旧合计。",
};

export const WATCH_LAB: CausalLab = {
  id: "watch",
  world: 1,
  concept: "watch",
  title: "两个世界，同一张脸",
  subtitle: "computed 是派生；watch 是副作用通道",
  promise: "先看两边 UI 完全一样，再看内部图如何分叉——然后亲手去掉 immediate，看见第一帧的 0。",
  minutes: 22,
  official: "/guide/essentials/watchers.html",
  scenes: [
    {
      id: "watch-s0",
      tick: "S0",
      title: "还是这张购物车",
      goal: "页面要显示 total。先不要急着选 API。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": need },
        blocks: [{ id: "base", label: "① 源状态已在" }],
        narration: "需求再次出现：合计。这一次我们准备两条路同时走。",
      },
      observe: {
        state: [
          { id: "price", label: "price", value: "10", symbol: "price" },
          { id: "quantity", label: "quantity", value: "2", symbol: "quantity" },
        ],
        dom: [{ id: "line", label: "p", value: "单价 10 × 2 件" }],
        events: [{ id: "click", label: "click", value: "quantity++" }],
      },
      nodes: [
        { id: "price", kind: "ref", label: "price" },
        { id: "qty", kind: "ref", label: "quantity" },
        { id: "dom", kind: "dom", label: "DOM", detail: "还没有 total" },
      ],
      edges: [
        { from: "price", to: "dom" },
        { from: "qty", to: "dom" },
      ],
      explanation: {
        headline: "先问身份，再选工具",
        body: "total 是「另一个要记住的数」，还是「可以从已有状态算出来的数」？如果你已经能回答，下一镜的两个世界就不会只是语法对比。",
      },
      faqs: [
        { q: "为什么不直接告诉我用 computed？", a: "因为被告诉的定义记不住。并排看见「一样的脸、不一样的图」，定义会自己长出来。" },
      ],
      tryThis: "点「多买一件」。数量会变，仍没有合计。先问：合计是记忆，还是算出来的？",
    },
    {
      id: "watch-s1",
      tick: "S1",
      title: "反事实：A / B",
      goal: "两个世界。用户看见的结果一样。",
      layer: "explain",
      fading: 1,
      prediction: {
        question: "世界 A 用 computed，世界 B 用 watch 去写 total。首次渲染后，两边的合计数字会？",
        choices: [
          { id: "same", label: "一样，都是 20", correct: true, why: "immediate 的 watch 和 computed 第一次读取都能得到 20。UI 可以完全相同。" },
          { id: "b0", label: "B 是 0，因为 watch 还没跑", correct: false, why: "这个例子用了 immediate: true。若忘记，B 才会先显示 0——那也是一种消融。" },
          { id: "err", label: "B 会报错", correct: false, why: "合法。只是多了一层同步。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": computedWorld },
        blocks: [{ id: "split", label: "打开两个世界" }],
        narration: "用户看到的结果一样。不同的是程序内部的依赖关系。",
      },
      observe: {
        state: [{ id: "total", label: "total", value: "20", symbol: "total" }],
        dom: [{ id: "total", label: ".total", value: "合计 20", symbol: "total" }],
        events: [],
      },
      nodes: worldA.nodes,
      edges: worldA.edges,
      counterfactual: {
        id: "computed-vs-watch",
        title: "computed vs watch",
        setup: "同一需求：显示 total。",
        worlds: [worldA, worldB],
        punchline:
          "两边 UI 完全一样。这反而是最好的教学点：你不能用「页面看起来对不对」来选 API，必须看图。",
      },
      why: {
        question: "既然结果一样，为什么还要区分？",
        choices: [
          { id: "graph", label: "因为内部依赖关系不同，以后扩展的成本不同", correct: true, why: "A 的 total 没有自己的存储；B 多了一份必须被写入的 ref。下一镜加折扣就能看见。" },
          { id: "style", label: "只是代码风格，没有机制差别", correct: false, why: "图已经不一样：B 多了 watch → 赋值。" },
          { id: "perf", label: "只是性能优化细节，新手不用管", correct: false, why: "更关键的是正确性：漏同步时 B 会静默显示错的数。" },
        ],
      },
      explanation: {
        headline: "一样的脸，两张图",
        body: "computed：派生节点。watch：观察变化，然后去做一件事（这里是给另一个 ref 赋值）。当「这件事」只是算出一个值，watch 就是多余的中间人。",
      },
      faqs: [
        { q: "为什么这里不用 watch？", a: "因为你要的是值，不是副作用。watch 更适合 fetch、改标题、写 localStorage。" },
        { q: "B 为什么要 immediate？", a: "否则首次 total 仍是 0，要等 price/quantity 再变才同步。computed 没有这个问题。忘记 immediate，是 watch 同步派生值时最常见的静默错误。" },
        { q: "watch 的回调里为什么用 .value？", a: "因为那是 script。price、quantity、total 都是 ref / computed ref。漏 .value 会把对象赋进去，合计变成 [object Object] 或根本不对。" },
      ],
      tryThis: "打开两个世界对比。两边合计都应是 20。先记住这张「一样的脸」。下一镜会拆掉 B 的 immediate。",
    },
    {
      id: "watch-s2",
      tick: "S2",
      title: "去掉 immediate",
      goal: "watch 默认不跑第一帧。合计会先亮 0。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "同一段 watch 同步 total，但去掉 { immediate: true }。首次渲染合计是？",
        choices: [
          { id: "20", label: "20，和 computed 一样", correct: false, why: "没有 immediate 时，回调要等依赖下一次变化。第一帧 total 仍是你写下的 0。" },
          { id: "zero", label: "0。要再点一次「多买一件」才会同步", correct: true, why: "setup 时 quantity 已经是 2，但 watch 还没跑。点击变成 3 才触发，合计直接跳到 30，20 从未出现。" },
          { id: "err", label: "报错：watch 必须写 immediate", correct: false, why: "合法。失败是静默的错数。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": watchNoImmediate },
        blocks: [{ id: "no-imm", label: "① 去掉 immediate" }],
        narration: "只删了一个选项。源还在，公式还在，第一帧却是错的。",
      },
      observe: {
        state: [{ id: "total", label: "total", value: "0（尚未同步）", symbol: "total" }],
        dom: [{ id: "total", label: ".total", value: "合计 0", symbol: "total" }],
        events: [{ id: "click", label: "click", value: "quantity++" }],
      },
      nodes: [
        { id: "qty", kind: "ref", label: "quantity" },
        { id: "watch", kind: "watch", label: "watch", detail: "等下一次变化" },
        { id: "total", kind: "ref", label: "total", detail: "仍是 0", symbol: "total" },
        { id: "dom", kind: "dom", label: "DOM", detail: "合计 0" },
      ],
      edges: [
        { from: "qty", to: "watch", label: "尚未触发" },
        { from: "watch", to: "total", label: "赋值" },
        { from: "total", to: "dom" },
      ],
      ablations: [
        {
          id: "add-immediate",
          prompt: "加回 immediate 之后？",
          files: { "src/App.vue": watchWorld },
          expected: {
            kind: "stale",
            message: "这是修复：第一帧就是 20。immediate 让 watch 在 setup 时立刻跑一次。",
          },
          lesson: "computed 第一次被读取就会求值。用 watch 去同步一个值时，你得自己补上这一帧。漏了不会报错。",
        },
      ],
      why: {
        question: "点一次「多买一件」后合计为什么是 30 不是 20？",
        choices: [
          { id: "skip", label: "第一帧被跳过。点击时 quantity 已经是 3，才第一次赋值", correct: true, why: "20 从来没有被写进 total。静默错误不是「不更新」，是「少更新一次」。" },
          { id: "offby", label: "watch 总是多加一次", correct: false, why: "没有这种偏差。是首次没跑。" },
          { id: "qty", label: "按钮把数量加了两次", correct: false, why: "数量 2→3 只一次。错的是 total 的初始值。" },
        ],
      },
      explanation: {
        headline: "少跑的那一帧不会报错",
        body: "这就是为什么不能用「页面看起来对不对」来选 API。加上 immediate，B 又能装成 A。但你已经看见：装的时候，第一帧是租来的。值应该用 computed。",
      },
      faqs: [
        { q: "flush: 'sync' 能代替 immediate 吗？", a: "不能。flush 管的是「变化之后何时跑」，immediate 管的是「现在先跑一次吗」。两件不同的事。" },
        { q: "watchEffect 需要 immediate 吗？", a: "不需要。它创建时就会跑，并在那时收集依赖。仍是副作用通道，不是派生值。" },
      ],
      tryThis: "先看合计是不是 0。再点「多买一件」——应变成 30，不是 20。然后打开「加回 immediate」，第一帧回到 20。",
      mapping: [
        { code: "watch(..., { immediate: true })", runtime: "setup 时先跑一次", ui: "合计 20" },
        { code: "watch(...) 无 immediate", runtime: "等下一次变化", ui: "合计 0 → 点击后 30" },
      ],
    },
    {
      id: "watch-s3",
      tick: "S3",
      title: "加入折扣",
      goal: "需求变了：total 还要乘 discount。看哪边自然生长。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加入 discount 之后，哪边更容易漏掉同步？",
        choices: [
          { id: "a", label: "A（computed）更容易漏", correct: false, why: "公式里加一个因子即可。依赖会在读取时被登记。" },
          { id: "b", label: "B（watch）更容易漏：必须记得扩展依赖列表", correct: true, why: "watch 的依赖是你手写的数组。漏写 discount，改折扣时 total 不更新。" },
          { id: "same", label: "两边风险一样", correct: false, why: "A 的依赖是自动收集的；B 的依赖是声明的。这就是分叉。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": computedDiscount },
        blocks: [{ id: "discount", label: "① 加入 discount" }],
        narration: "A：自然扩展。B：又多一个需要维护的同步关系。",
      },
      observe: {
        state: [
          { id: "discount", label: "discount", value: "0.8", symbol: "discount" },
          { id: "total", label: "total", value: "16", symbol: "total" },
        ],
        dom: [{ id: "total", label: ".total", value: "合计 16", symbol: "total" }],
        events: [],
      },
      nodes: worldA2.nodes,
      edges: worldA2.edges,
      counterfactual: {
        id: "add-discount",
        title: "折扣来了",
        setup: "total = price × quantity × discount",
        worlds: [worldA2, worldB2],
        punchline: "A 改公式；B 改公式还要改 watch 列表。漏改列表时，页面仍可能看起来「几乎对」。",
        twist: {
          title: "漏掉 discount 的 watch",
          body: "只改折扣按钮。A 会变；这个残缺的 B 不会。",
          worlds: [
            worldA2,
            {
              ...worldB2,
              name: "watch（漏了）",
              tagline: "依赖列表不完整",
              files: { "src/App.vue": watchForgot },
              note: "点击「改折扣」时 discount 变了，total 仍按旧同步结果停住。",
            },
          ],
        },
      },
      ablations: [
        {
          id: "forgot-dep",
          prompt: "watch 忘了写 discount？",
          files: { "src/App.vue": watchForgot },
          expected: {
            kind: "stale",
            message: "改折扣后合计仍可能是旧值。依赖列表是手写契约，漏写不会报错。",
          },
          lesson: "watch 的静默失败：事件发生了，图的一条边却没接上。",
        },
      ],
      explanation: {
        headline: "派生会生长；同步要人养",
        body: "computed 在读取时自动收集依赖。watch 依赖你列出来的东西。所以：值 → computed；副作用 → watch。",
      },
      tryThis: "打开两个世界。A 改公式即可。B 还要改 watch 数组。再试「watch 忘了写 discount」：点改折扣，合计不应变。",
    },
    {
      id: "watch-s4",
      tick: "S4",
      title: "watch 真正该做的事",
      goal: "把合计同步到 document.title。这才是副作用。",
      layer: "see",
      fading: 2,
      prediction: {
        question: "document.title = '合计 ' + total 这件事，应该放在？",
        choices: [
          { id: "computed", label: "computed 里", correct: false, why: "computed 必须纯。写 title 是对外的副作用。" },
          { id: "watch", label: "watch(total, …)", correct: true, why: "源是派生值，动作是改浏览器标题。watch 是通道。" },
          { id: "click", label: "只写在按钮的 click 里", correct: false, why: "price 若从别处改，标题会漏更新。副作用应该订阅数据，而不是订阅某一个按钮。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": titleWatch },
        blocks: [
          { id: "computed", label: "① total 仍是 computed" },
          { id: "watch", label: "② watch 去改标题" },
        ],
        narration: "两种工具第一次同时出现，而且各自做自己该做的事。",
      },
      replay: {
        label: "多买一件并看标题",
        steps: [
          { caption: "click", event: "click", highlight: ["qty"] },
          { caption: "quantity 变化", highlight: ["qty"] },
          { caption: "total 重算", highlight: ["total"] },
          { caption: "template 重渲染", highlight: ["render"] },
          { caption: "watch → document.title", highlight: ["watch"] },
        ],
      },
      observe: {
        state: [{ id: "total", label: "total", value: "20 → n", symbol: "total" }],
        dom: [{ id: "p", label: "p", value: "合计 n", symbol: "total" }],
        events: [
          { id: "click", label: "click", value: "quantity++" },
          { id: "title", label: "document.title", value: "合计 n" },
        ],
      },
      nodes: [
        { id: "qty", kind: "ref", label: "quantity" },
        { id: "total", kind: "computed", label: "total", symbol: "total" },
        { id: "render", kind: "render", label: "render" },
        { id: "watch", kind: "watch", label: "watch", detail: "document.title" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "qty", to: "total" },
        { from: "total", to: "render" },
        { from: "render", to: "dom" },
        { from: "total", to: "watch", label: "副作用" },
      ],
      explanation: {
        headline: "一条链上的两个出口",
        body: "total 变化后：一条边走向界面，一条边走向世界（标题、网络、日志）。watch 不是 computed 的平替，而是离开程序、进入外界的门。",
      },
      faqs: [
        { q: "watchEffect 呢？", a: "它创建时就跑，并自动收集依赖，更像「立刻跑的副作用 computed」。仍是副作用通道，不是派生值。上一镜的 immediate，正是 watch 在模仿 watchEffect 的第一帧。" },
        { q: "这里 React 会怎么写？", a: "total 用 useMemo；document.title 用 useEffect。同样是派生 vs 副作用。" },
        { q: "改标题为什么不写在 computed 里？", a: "computed 必须纯。一写 document.title，它就不再是派生值，缓存和调试都会撒谎。" },
      ],
      tryThis: "点「多买一件」，看合计数字。若运行环境暴露了 document.title，它应写成「合计 n」。",
    },
    {
      id: "watch-s5",
      tick: "S5",
      title: "搜索列表放哪？",
      goal: "filteredUsers：派生还是同步？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "输入框过滤用户列表。filteredUsers 最适合？",
        choices: [
          { id: "computed", label: "computed，从 query + users 过滤", correct: true, why: "纯函数 + 源状态。没有外界。这是派生。" },
          { id: "watch", label: "watch(query) 里去 splice 另一个数组", correct: false, why: "又能跑，又会漏。和用 watch 写 total 是同一类错误。" },
          { id: "fetch", label: "必须 watch + fetch，因为是搜索", correct: false, why: "本地数组过滤不需要网络。若要请求服务端搜索，那才是 watch/watchEffect 的戏。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transfer },
        blocks: [{ id: "search", label: "换场景：搜索" }],
        narration: "先只有 query 和 users。过滤还没出现。判断机制。",
      },
      observe: {
        state: [
          { id: "query", label: "query", value: '""', symbol: "query" },
          { id: "users", label: "users", value: "3", symbol: "users" },
        ],
        dom: [{ id: "list", label: "ul", value: "Ada, Lin, Turing" }],
        events: [],
      },
      nodes: [
        { id: "query", kind: "ref", label: "query" },
        { id: "users", kind: "ref", label: "users" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "query", to: "dom" },
        { from: "users", to: "dom" },
      ],
      ablations: [
        {
          id: "filter-computed",
          prompt: "用 computed 过滤之后？",
          files: { "src/App.vue": transferComputed },
          expected: {
            kind: "stale",
            message: "输入时列表即时过滤。没有第二份数组，没有 watch 同步。",
          },
          lesson: "第三次迁移：total、completedTodos、filteredUsers —— 同一张图。",
        },
      ],
      explanation: {
        headline: "三次都判断对，才是 mastered",
        body: "购物车、Todo、搜索。如果你每次都选「派生值用 computed，副作用用 watch」，机制已经可迁移。不是因为背过定义。",
      },
      faqs: [
        { q: "如果搜索要打到服务器呢？", a: "query 仍是源。请求是副作用：watch / watchEffect 里去 fetch。返回的列表才是另一份状态。World 4 会专门走这条边。" },
        { q: "用 watch(query) 去改 filteredUsers 呢？", a: "和用 watch 写 total 同一类错误。本地过滤没有外界，不该多一份要同步的数组。" },
      ],
      tryThis: "先输入 Ada——三项都在，因为还没过滤。再打开「用 computed 过滤」：输入 ad 应只剩 Ada。",
    },
  ],
};
