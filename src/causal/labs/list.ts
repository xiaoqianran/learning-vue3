import type { CausalLab } from "../types";

const s0 = `<template>
  <ul>
    <li>买牛奶</li>
    <li>学 v-for</li>
  </ul>
</template>
`;

const s1 = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
  { id: 3, title: '写组件', done: false },
])
</script>

<template>
  <ul>
    <li>买牛奶</li>
    <li>学 v-for</li>
  </ul>
</template>
`;

const s2 = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
  { id: 3, title: '写组件', done: false },
])
</script>

<template>
  <ul>
    <li v-for="t in todos" :key="t.id">
      {{ t.title }}
    </li>
  </ul>
</template>
`;

const s3 = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
  { id: 3, title: '写组件', done: false },
])
</script>

<template>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <label>
        <input type="checkbox" :checked="t.done" @change="t.done = !t.done" />
        <span :class="{ done: t.done }">{{ t.title }}</span>
      </label>
    </li>
  </ul>
</template>
`;

const plainArray = `<script setup>
let todos = [
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
  { id: 3, title: '写组件', done: false },
]

function add() {
  todos.push({ id: Date.now(), title: '新任务', done: false })
}
</script>

<template>
  <button @click="add">加一项</button>
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const noKey = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
  { id: 3, title: '写组件', done: false },
])

function prepend() {
  todos.value.unshift({ id: Date.now(), title: '插到最前', done: false })
}
</script>

<template>
  <button @click="prepend">插到最前</button>
  <ul>
    <li v-for="t in todos">
      <label>
        <input type="checkbox" :checked="t.done" @change="t.done = !t.done" />
        <span>{{ t.title }}</span>
      </label>
    </li>
  </ul>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'

const tags = ref(['vue', 'ref', 'computed'])
</script>

<template>
  <p>标签写死了两颗</p>
  <span>vue</span>
  <span>ref</span>
</template>
`;

const transferAfter = `<script setup>
import { ref } from 'vue'

const tags = ref(['vue', 'ref', 'computed'])
</script>

<template>
  <p>{{ tags.length }} 个标签</p>
  <span v-for="tag in tags" :key="tag">{{ tag }}</span>
</template>
`;

export const LIST_LAB: CausalLab = {
  id: "list",
  world: 2,
  concept: "v-for",
  title: "列表从数组长出来",
  subtitle: "DOM 节点不该再手写一份清单",
  promise: "看见 v-for 如何让数组成为界面的唯一真相——以及 :key 为什么不是装饰。",
  minutes: 14,
  official: "/guide/essentials/list.html",
  scenes: [
    {
      id: "list-s0",
      tick: "S0",
      title: "写死的两项",
      goal: "屏幕上有一份待办。它现在是标记，不是数据。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": s0 },
        blocks: [{ id: "html", label: "① 手写两个 <li>" }],
        narration: "两项待办被写进模板。要加第三项，你只能再改 HTML。",
      },
      observe: {
        state: [],
        dom: [
          { id: "li1", label: "li", value: "买牛奶" },
          { id: "li2", label: "li", value: "学 v-for" },
        ],
        events: [],
      },
      nodes: [
        { id: "html", kind: "script", label: "template", detail: "静态清单" },
        { id: "dom", kind: "dom", label: "DOM", detail: "2 项" },
      ],
      edges: [{ from: "html", to: "dom", label: "首次渲染" }],
      explanation: {
        headline: "清单还不是程序状态",
        body: "你看见的两项来自标记本身。程序里没有数组，所以谈不上增删、完成、过滤。下一镜先把数据请来，先不渲染它。",
      },
      faqs: [
        { q: "为什么不直接写 v-for？", a: "因为你还没看见「有数组但模板不读它」时页面会怎样。和 ref 那一课同一条规则。" },
      ],
    },
    {
      id: "list-s1",
      tick: "S1",
      title: "数组进门",
      goal: "程序记住 3 条待办，模板先不动。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加入 todos = ref([...3 项]) 之后，页面会？",
        choices: [
          { id: "three", label: "变成 3 项，多出「写组件」", correct: false, why: "模板仍是手写的两个 <li>。数组存在，不等于被渲染。" },
          { id: "same", label: "还是 2 项。模板没读 todos", correct: true, why: "和 count 当初一样：状态在，订阅不在。" },
          { id: "err", label: "报错，因为没用到", correct: false, why: "未使用的 ref 合法。只是界面不知道。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s1 },
        blocks: [
          { id: "import", label: "① import { ref }" },
          { id: "todos", label: "② 创建 todos" },
        ],
        narration: "3 条数据已经在程序里。界面还在读那两行写死的文字。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "3 items（未被读取）", symbol: "todos" }],
        dom: [
          { id: "li1", label: "li", value: "买牛奶" },
          { id: "li2", label: "li", value: "学 v-for" },
        ],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", detail: "3 items", symbol: "todos" },
        { id: "html", kind: "script", label: "template", detail: "仍手写 2 项" },
        { id: "dom", kind: "dom", label: "DOM", detail: "2 项" },
      ],
      edges: [{ from: "html", to: "dom" }],
      why: {
        question: "为什么数组是 3 项，DOM 却是 2 项？",
        choices: [
          { id: "read", label: "模板没有读取 todos，没有依赖", correct: true, why: "渲染函数根本没碰到这个数组。两条清单各说各的。" },
          { id: "delay", label: "Vue 要等 nextTick 才会同步", correct: false, why: "不是时机。是根本没有那条边。" },
          { id: "key", label: "缺 :key 所以少渲染一项", correct: false, why: ":key 管身份，不管「要不要读数组」。" },
        ],
      },
      explanation: {
        headline: "两份真相开始打架",
        body: "脚本说有 3 项，模板说有 2 项。这就是手写清单的代价。v-for 要做的，是删掉模板里那份假真相。",
      },
      mapping: [{ code: "const todos = ref([...])", runtime: "todos: 3", ui: "仍是 2 个 <li>" }],
    },
    {
      id: "list-s2",
      tick: "S2",
      title: "模板改读数组",
      goal: "让 DOM 从 todos 长出来。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "改成 v-for=\"t in todos\" 之后？",
        choices: [
          { id: "three", label: "出现 3 项，含「写组件」", correct: true, why: "模板开始读取数组。数组是唯一真相，第三项终于有地方长出来。" },
          { id: "two", label: "还是 2 项，v-for 只循环已有 DOM", correct: false, why: "v-for 不是装饰已有节点，是按源数据创建节点。" },
          { id: "err", label: "报错：t 未定义", correct: false, why: "别名 t 只在这个循环里存在，这正是合法用法。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s2 },
        blocks: [
          { id: "vfor", label: "③ v-for 读取 todos" },
          { id: "key", label: "④ :key=\"t.id\"" },
        ],
        narration: "手写的两项消失了。DOM 现在是数组的投影。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "3 items", symbol: "todos" }],
        dom: [{ id: "list", label: "ul", value: "买牛奶 / 学 v-for / 写组件", symbol: "todos" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "render", kind: "render", label: "v-for", detail: "t in todos", symbol: "v-for" },
        { id: "dom", kind: "dom", label: "DOM", detail: "3 项" },
      ],
      edges: [
        { from: "todos", to: "render", label: "读取" },
        { from: "render", to: "dom" },
      ],
      explanation: {
        headline: "数组 → 节点，一对多的那条边",
        body: "ref 那一课是一个值对应一块文本。现在是一个数组对应一排节点。规则没变：被读取才会建立依赖。变的是投影的形状。",
      },
      faqs: [
        { q: ":key 现在有用吗？", a: "有。Vue 用它识别「哪一项是哪一项」。下一镜改完成状态时，没有 key 会把 DOM 复用错位。" },
      ],
      mapping: [
        { code: 'v-for="t in todos"', runtime: "遍历 ref 数组", ui: "3 个 <li>" },
        { code: ':key="t.id"', runtime: "节点身份", ui: "稳定复用" },
      ],
    },
    {
      id: "list-s3",
      tick: "S3",
      title: "点一项，只动一项",
      goal: "完成状态应该跟着这一项走，而不是整表重排。",
      layer: "see",
      fading: 2,
      prediction: {
        question: "勾选「学 v-for」之后，程序里发生的是？",
        choices: [
          { id: "item", label: "只改这一项的 done，该项 DOM 更新", correct: true, why: "t 是响应式对象。改 t.done 会通知用到它的那一块。" },
          { id: "all", label: "整个 todos 被换成新数组，三行全重绘", correct: false, why: "这里没有替换数组，只改了对象字段。" },
          { id: "dead", label: "内存变了，界面不动——要替换整个数组", correct: false, why: "嵌套对象默认也是响应式。这正是 Vue 数组项的好处。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s3 },
        blocks: [{ id: "toggle", label: "⑤ 绑定完成态" }],
        narration: "现在每项都有自己的 done。你可以真的勾选右侧列表。",
      },
      replay: {
        label: "勾选第二项",
        steps: [
          { caption: "change 第二项", event: "change", highlight: ["click"] },
          { caption: "todos[1].done  false → true", highlight: ["todos"], state: { id: "todos", from: "false", to: "true" } },
          { caption: "该项 DOM 加上 .done", highlight: ["dom"] },
        ],
      },
      observe: {
        state: [{ id: "todos", label: "todos[1].done", value: "false → true", symbol: "todos" }],
        dom: [{ id: "item", label: "li[1]", value: "学 v-for", symbol: "todos" }],
        events: [{ id: "click", label: "change", value: "t.done = !t.done" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "change" },
        { id: "todos", kind: "ref", label: "todos[i]", symbol: "todos" },
        { id: "render", kind: "render", label: "v-for item" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "click", to: "todos", label: "写入字段" },
        { from: "todos", to: "render" },
        { from: "render", to: "dom" },
      ],
      explanation: {
        headline: "项是对象，不只是字符串",
        body: "title 是显示，done 是状态。v-for 投影的是对象，所以改字段和改数组长度是两种不同的边。下一镜会拆掉其中一条。",
      },
    },
    {
      id: "list-s4",
      tick: "S4",
      title: "如果不是 ref？如果没有 key？",
      goal: "两种坏法：变化通知不到，或通知到了却认错人。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "如果 todos 是普通 let 数组，点「加一项」后列表会？",
        choices: [
          { id: "grow", label: "出现第四项", correct: false, why: "push 发生了，但没有订阅者。界面冻在 3 项。" },
          { id: "stuck", label: "内存里变长，页面仍是 3 项", correct: true, why: "和 let count = 0 同一类因果：有写入，无通知。" },
          { id: "err", label: "直接报错", correct: false, why: "合法。静默过期。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s3 },
        blocks: [{ id: "keep", label: "正确版本先留着" }],
        narration: "先记住带 ref 和 :key 的图。再分别拆掉它们。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "ref(3)", symbol: "todos" }],
        dom: [{ id: "list", label: "ul", value: "3 项", symbol: "todos" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "render", kind: "render", label: "v-for" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "todos", to: "render" },
        { from: "render", to: "dom" },
      ],
      ablations: [
        {
          id: "plain-array",
          prompt: "如果不要 ref？",
          files: { "src/App.vue": plainArray },
          expected: {
            kind: "stale",
            message: "点「加一项」时数组变长，DOM 仍是 3 项。普通数组没有订阅者。",
          },
          lesson: "v-for 只能投影它读到的响应式源。源若不是 ref，循环是一次性的。",
        },
        {
          id: "no-key",
          prompt: "如果没有 :key？",
          files: { "src/App.vue": noKey },
          expected: {
            kind: "stale",
            message: "插到最前时，Vue 按位置复用节点。勾选状态可能粘在错误的那一行。",
          },
          lesson: ":key 不是性能彩蛋。它是身份。没有身份，DOM 会张冠李戴。",
        },
      ],
      explanation: {
        headline: "长度靠 ref，身份靠 key",
        body: "拆掉 ref：增删发生在内存，界面不知道。拆掉 key：界面知道变了，却认错是哪一项。列表要同时有这两条边。",
      },
    },
    {
      id: "list-s5",
      tick: "S5",
      title: "换：标签云",
      goal: "tags 已经在。界面还在手写两颗。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "这段程序会显示 3 个标签吗？",
        choices: [
          { id: "yes", label: "会。tags 里有 3 个字符串", correct: false, why: "模板手写了 vue / ref。computed 那一课的第三项还没出现，是同一类错位。" },
          { id: "no", label: "不会。模板没读 tags", correct: true, why: "数组是 3，DOM 是 2。缺的是 v-for，不是缺一个 span。" },
          { id: "err", label: "会报错", correct: false, why: "能跑，只是两份真相。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "tags", label: "换场景：标签" }],
        narration: "待办换成了标签。因果结构没换。",
      },
      observe: {
        state: [{ id: "tags", label: "tags", value: "3（未被投影）", symbol: "tags" }],
        dom: [{ id: "spans", label: "span", value: "vue, ref" }],
        events: [],
      },
      nodes: [
        { id: "tags", kind: "ref", label: "tags", symbol: "tags" },
        { id: "dom", kind: "dom", label: "DOM", detail: "2 颗手写" },
      ],
      edges: [],
      ablations: [
        {
          id: "fix-vfor",
          prompt: "补上 v-for 之后？",
          files: { "src/App.vue": transferAfter },
          expected: {
            kind: "stale",
            message: "这是修复：3 个标签从数组长出来。手写的两颗消失了。",
          },
          lesson: "迁移成功：你指出的是「模板没读数组」，不是「少写一个 span」。",
        },
      ],
      why: {
        question: "和 todos 相比，缺的是同一类东西吗？",
        choices: [
          { id: "same", label: "是。都是「源在、投影不在」", correct: true, why: "表面是标签云，图仍是：ref 数组没有接到 v-for。" },
          { id: "str", label: "不是。字符串数组和对象数组规则不同", correct: false, why: "v-for 都能投影。差别只在 :key 用什么。" },
          { id: "css", label: "缺的是样式组件", correct: false, why: "CSS 不会把第三项变出来。" },
        ],
      },
      explanation: {
        headline: "列表的身份是投影",
        body: "待办、标签、购物车行——都是「一份数组，一排节点」。World 2 从这里开始长：先有列表，才谈得上表单往里加、组件往外拆。",
      },
    },
  ],
};
