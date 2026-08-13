import type { CausalLab } from "../types";

const listOnly = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
])
</script>

<template>
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const inputNoModel = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
])
const title = ref('')

function add() {
  todos.value.push({ id: Date.now(), title: title.value, done: false })
  title.value = ''
}
</script>

<template>
  <input placeholder="新待办" />
  <button @click="add">添加</button>
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const withModel = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
])
const title = ref('')

function add() {
  todos.value.push({ id: Date.now(), title: title.value, done: false })
  title.value = ''
}
</script>

<template>
  <input v-model="title" placeholder="新待办" />
  <button @click="add">添加</button>
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const withForm = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
])
const title = ref('')

function add() {
  const text = title.value.trim()
  if (!text) return
  todos.value.push({ id: Date.now(), title: text, done: false })
  title.value = ''
}
</script>

<template>
  <form @submit.prevent="add">
    <input v-model="title" placeholder="新待办" />
    <button type="submit">添加</button>
  </form>
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const plainTitle = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
])
let title = ''

function add() {
  todos.value.push({ id: Date.now(), title, done: false })
  title = ''
}
</script>

<template>
  <form @submit.prevent="add">
    <input v-model="title" placeholder="新待办" />
    <button type="submit">添加</button>
  </form>
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const noPrevent = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
])
const title = ref('')

function add() {
  todos.value.push({ id: Date.now(), title: title.value, done: false })
  title.value = ''
}
</script>

<template>
  <form @submit="add">
    <input v-model="title" placeholder="新待办" />
    <button type="submit">添加</button>
  </form>
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'

const note = ref('')
</script>

<template>
  <textarea placeholder="写一句笔记"></textarea>
  <p class="hint">程序还不知道你写了什么</p>
</template>
`;

const transferAfter = `<script setup>
import { ref } from 'vue'

const note = ref('')
</script>

<template>
  <textarea v-model="note" placeholder="写一句笔记"></textarea>
  <p>{{ note ? note.length + ' 字' : '还是空的' }}</p>
</template>
`;

export const FORM_LAB: CausalLab = {
  id: "form",
  world: 2,
  concept: "v-model",
  title: "输入怎样变成一条待办",
  subtitle: "输入框的值必须住在程序里",
  promise: "看见 v-model 如何把 DOM 输入写回 ref——以及少写 .prevent 时页面为什么会闪掉。",
  minutes: 12,
  official: "/guide/essentials/forms.html",
  scenes: [
    {
      id: "form-s0",
      tick: "S0",
      title: "只能看，不能加",
      goal: "列表已经会投影。缺的是一条进入数组的路。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": listOnly },
        blocks: [{ id: "list", label: "① 列表已在" }],
        narration: "todos 只会从代码里长出来。用户还没有入口。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2 items", symbol: "todos" }],
        dom: [{ id: "list", label: "ul", value: "买牛奶 / 学 v-for" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "todos", to: "dom" }],
      explanation: {
        headline: "投影已经有了，写入还没有",
        body: "v-for 解决「数组 → 界面」。表单要解决「人 → 数组」。先别把 input、v-model、submit 一次全写上——一次只接一条边。",
      },
    },
    {
      id: "form-s1",
      tick: "S1",
      title: "有框，没绑定",
      goal: "先放输入框和添加按钮，先不绑 v-model。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "输入「学组件」再点添加。新项的 title 会是？",
        choices: [
          { id: "text", label: "「学组件」", correct: false, why: "输入框没绑到 title。你打的字只活在 DOM 里，程序读到的仍是 ''。" },
          { id: "empty", label: "空字符串。程序没读到输入", correct: true, why: "title 一直是 ''。add 把空标题推进数组。" },
          { id: "err", label: "报错", correct: false, why: "合法。只是推了一条空白待办。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": inputNoModel },
        blocks: [
          { id: "title", label: "① 创建 title" },
          { id: "input", label: "② 放一个裸 <input>" },
          { id: "add", label: "③ add() 去 push" },
        ],
        narration: "入口形状有了。数据和输入框各活各的。",
      },
      observe: {
        state: [
          { id: "title", label: "title", value: '""', symbol: "title" },
          { id: "todos", label: "todos", value: "2", symbol: "todos" },
        ],
        dom: [{ id: "input", label: "input", value: "未绑定" }],
        events: [{ id: "click", label: "click", value: "add()" }],
      },
      nodes: [
        { id: "domInput", kind: "dom", label: "input DOM", detail: "只管自己" },
        { id: "title", kind: "ref", label: "title", detail: '""', symbol: "title" },
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
      ],
      edges: [{ from: "title", to: "todos", label: "add() 读到的是空" }],
      why: {
        question: "人明明打了字，为什么程序是空的？",
        choices: [
          { id: "oneway", label: "DOM 输入没有写回 title 这份状态", correct: true, why: "没有 v-model / @input，事件只发生在浏览器控件内部。" },
          { id: "trim", label: "add 里忘了 trim", correct: false, why: "连原始字符串都没接到，还谈不上 trim。" },
          { id: "push", label: "不能 push，必须替换整个数组", correct: false, why: "ref 数组的 push 是能触发更新的。坏在读到的值。" },
        ],
      },
      explanation: {
        headline: "输入框默认不是状态",
        body: "原生 input 自己记一份值。Vue 不会因为旁边有个 title ref 就去同步它。v-model 要接的，就是这道缝。",
      },
    },
    {
      id: "form-s2",
      tick: "S2",
      title: "v-model 接通",
      goal: "让每次击键都写入 title。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加上 v-model=\"title\" 后再点添加？",
        choices: [
          { id: "ok", label: "新项标题等于你刚打的字", correct: true, why: "v-model 是 :value + @input 的糖。击键写入 title，add 读到的就是它。" },
          { id: "lag", label: "要再点一次输入框才会同步", correct: false, why: "input 事件随击键发生，不是失焦才发生。" },
          { id: "oneway", label: "只能显示 title，不能写回", correct: false, why: "那是只绑 :value。v-model 是双向的。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": withModel },
        blocks: [{ id: "model", label: "④ v-model=\"title\"" }],
        narration: "现在有一条完整的人 → title → todos 的路。你可以真的添加一项。",
      },
      observe: {
        state: [{ id: "title", label: "title", value: "随击键变化", symbol: "title" }],
        dom: [{ id: "input", label: "input", value: "绑定 title", symbol: "title" }],
        events: [{ id: "input", label: "input", value: "title = $event", symbol: "v-model" }],
      },
      nodes: [
        { id: "inputEv", kind: "event", label: "input" },
        { id: "title", kind: "ref", label: "title", symbol: "title" },
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "列表" },
      ],
      edges: [
        { from: "inputEv", to: "title", label: "v-model 写入" },
        { from: "title", to: "todos", label: "add()" },
        { from: "todos", to: "dom" },
      ],
      explanation: {
        headline: "v-model 是两条边的糖",
        body: ":value 让状态流向控件。@input 让控件流回状态。写成 v-model 不是新机制，是少写一遍这对边。",
      },
      mapping: [
        { code: 'v-model="title"', runtime: "title ↔ input", ui: "击键即同步" },
        { code: "todos.push({ title })", runtime: "读 title，写数组", ui: "多一项" },
      ],
      faqs: [
        { q: "为什么 add 之后 title 要清空？", a: "因为输入框绑的是同一份状态。title = '' 会立刻把框清空。这是双向的好处，也是双向的责任。" },
      ],
    },
    {
      id: "form-s3",
      tick: "S3",
      title: "回车也是提交",
      goal: "用 form + submit.prevent，不要只靠按钮 click。",
      layer: "see",
      fading: 2,
      mutation: {
        files: { "src/App.vue": withForm },
        blocks: [
          { id: "form", label: "⑤ 包成 <form>" },
          { id: "prevent", label: "⑥ @submit.prevent" },
        ],
        narration: "回车会触发 submit。.prevent 拦住浏览器默认的整页刷新。",
      },
      replay: {
        label: "提交一次",
        steps: [
          { caption: "submit", event: "submit", highlight: ["click"] },
          { caption: "preventDefault", highlight: ["click"] },
          { caption: "push 新项，title 清空", highlight: ["todos", "title"] },
          { caption: "列表多一行，输入框变空", highlight: ["dom"] },
        ],
      },
      observe: {
        state: [{ id: "title", label: "title", value: "提交后变 ''", symbol: "title" }],
        dom: [{ id: "form", label: "form", value: "submit.prevent" }],
        events: [{ id: "click", label: "submit", value: "add()" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "submit" },
        { id: "title", kind: "ref", label: "title", symbol: "title" },
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "click", to: "todos" },
        { from: "click", to: "title", label: "清空" },
        { from: "todos", to: "dom" },
      ],
      explanation: {
        headline: "表单事件属于浏览器",
        body: "Vue 管状态。浏览器默认会把 form GET 出去、刷新 iframe。.prevent 不是语法癖好，是把这次提交留在程序里。",
      },
    },
    {
      id: "form-s4",
      tick: "S4",
      title: "拆掉绑定 / 拆掉 prevent",
      goal: "两种坏法：状态不是响应式，或提交逃出了程序。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "如果 title 是普通 let，v-model 还在，输入时会？",
        choices: [
          { id: "ok", label: "照样同步", correct: false, why: "v-model 会赋值，但没有人通知渲染。框里的字和程序会再次分叉。" },
          { id: "stale", label: "输入框能打字，程序里的 title 对不上渲染", correct: true, why: "普通变量没有订阅者。和 let count = 0 同一类。" },
          { id: "err", label: "v-model 只能绑 ref，会报错", correct: false, why: "常常不报错，只是更新协议断了。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": withForm },
        blocks: [{ id: "keep", label: "正确版本先留着" }],
        narration: "先留下能添加的版本。再分别拆 ref 和 .prevent。",
      },
      observe: {
        state: [{ id: "title", label: "title", value: "ref('')", symbol: "title" }],
        dom: [{ id: "form", label: "form", value: "submit.prevent" }],
        events: [],
      },
      nodes: [
        { id: "title", kind: "ref", label: "title", symbol: "title" },
        { id: "todos", kind: "ref", label: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "title", to: "todos" },
        { from: "todos", to: "dom" },
      ],
      ablations: [
        {
          id: "plain-title",
          prompt: "如果 title 不是 ref？",
          files: { "src/App.vue": plainTitle },
          expected: {
            kind: "stale",
            message: "v-model 赋了值，但界面协议断了。添加时读到的可能是空的或过期的普通字符串。",
          },
          lesson: "v-model 不是魔法双向绑定。它只是写那份状态。状态必须可追踪。",
        },
        {
          id: "no-prevent",
          prompt: "如果没有 .prevent？",
          files: { "src/App.vue": noPrevent },
          expected: {
            kind: "crash",
            message: "submit 会触发浏览器默认行为：iframe 导航/刷新。程序里的 add 可能跑了，但页面被整页换掉。",
          },
          lesson: "副作用跑出了 Vue。.prevent 把这次提交留在依赖图里。",
        },
      ],
      explanation: {
        headline: "表单有两道缝",
        body: "控件 ↔ 状态，靠 ref + v-model。提交 ↔ 浏览器，靠 .prevent。拆哪一道，失败的样子都不一样。",
      },
    },
    {
      id: "form-s5",
      tick: "S5",
      title: "换：笔记框",
      goal: "textarea 已经在。字数统计还读不到。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "打字时，「还是空的」会变成字数吗？",
        choices: [
          { id: "yes", label: "会。textarea 里已经有字", correct: false, why: "字在 DOM 里。note 仍是 ''。模板读的是 note。" },
          { id: "no", label: "不会。textarea 没绑 v-model", correct: true, why: "和裸 input 同一条缝：人写了，程序没接住。" },
          { id: "err", label: "会报错", correct: false, why: "能打字，统计冻住。静默。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "note", label: "换场景：笔记" }],
        narration: "待办换成笔记。缺的仍是那条写回边。",
      },
      observe: {
        state: [{ id: "note", label: "note", value: '""', symbol: "note" }],
        dom: [{ id: "ta", label: "textarea", value: "未绑定" }],
        events: [],
      },
      nodes: [
        { id: "note", kind: "ref", label: "note", symbol: "note" },
        { id: "dom", kind: "dom", label: "textarea" },
      ],
      edges: [],
      ablations: [
        {
          id: "fix-model",
          prompt: "补上 v-model 之后？",
          files: { "src/App.vue": transferAfter },
          expected: {
            kind: "stale",
            message: "这是修复：击键写入 note，字数跟着变。",
          },
          lesson: "input 和 textarea 是同一种控件。v-model 接的都是「DOM 值 → ref」。",
        },
      ],
      explanation: {
        headline: "表单的身份是写回",
        body: "列表把状态投影出去。表单把人的动作写回来。下一实验才会把「一项」拆成子组件——那是边界，不是输入。",
      },
    },
  ],
};
