import type { CausalLab, CounterfactualWorld } from "../types";

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

const titleUnused = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
])
const title = ref('')
</script>

<template>
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const bareInput = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
])
const title = ref('')
</script>

<template>
  <input placeholder="新待办" />
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const oneWayValue = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
])
const title = ref('')
</script>

<template>
  <p class="hint">title = 「{{ title }}」</p>
  <input :value="title" placeholder="新待办" />
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
</script>

<template>
  <p class="hint">title = 「{{ title }}」</p>
  <input v-model="title" placeholder="新待办" />
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const explicitPair = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
])
const title = ref('')
</script>

<template>
  <p class="hint">title = 「{{ title }}」</p>
  <input
    :value="title"
    @input="title = $event.target.value"
    placeholder="新待办"
  />
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const withPush = `<script setup>
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
}
</script>

<template>
  <p class="hint">title = 「{{ title }}」</p>
  <input v-model="title" placeholder="新待办" />
  <button @click="add">添加</button>
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const withAdd = `<script setup>
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
  <p class="hint">title = 「{{ title }}」</p>
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
  const text = title.trim()
  if (!text) return
  todos.value.push({ id: Date.now(), title: text, done: false })
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
  const text = title.value.trim()
  if (!text) return
  todos.value.push({ id: Date.now(), title: text, done: false })
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

const noTrim = `<script setup>
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
  <form @submit.prevent="add">
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
  <p class="hint">字数：{{ note.length }}</p>
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

const worldModel: CounterfactualWorld = {
  id: "model",
  name: "v-model",
  tagline: "一对边的糖",
  files: { "src/App.vue": withModel },
  nodes: [
    { id: "input", kind: "event", label: "input" },
    { id: "title", kind: "ref", label: "title" },
    { id: "dom", kind: "dom", label: "input + 预览" },
  ],
  edges: [
    { from: "title", to: "dom", label: "value" },
    { from: "input", to: "title", label: "写入" },
  ],
  note: "v-model 不是第三种机制。它就是下面那对边。",
};

const worldPair: CounterfactualWorld = {
  id: "pair",
  name: ":value + @input",
  tagline: "同一张图，拆开写",
  files: { "src/App.vue": explicitPair },
  nodes: [
    { id: "input", kind: "event", label: "input" },
    { id: "title", kind: "ref", label: "title" },
    { id: "dom", kind: "dom", label: "input + 预览" },
  ],
  edges: [
    { from: "title", to: "dom", label: ":value" },
    { from: "input", to: "title", label: "@input" },
  ],
  note: "击键时 $event.target.value 写回 title。脸和 v-model 完全一样。",
};

export const FORM_LAB: CausalLab = {
  id: "form",
  world: 2,
  concept: "v-model",
  title: "输入怎样变成一条待办",
  subtitle: "输入框的值必须住在程序里",
  promise:
    "一镜一条边：先有 title，再放裸 input，再 :value，再 v-model，再 push，再清空草稿，再拦住 submit。看见单向绑定如何把字吞掉。",
  minutes: 20,
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
        narration: "todos 只会从代码里长出来。用户还没有入口。先别把 input、v-model、submit 一次全写上。",
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
        body: "v-for 解决「数组 → 界面」。表单要解决「人 → 数组」。中间其实还有一份草稿状态叫 title。下一镜只请它进门。",
      },
      tryThis: "试着在预览里找输入框——没有。两项待办只能看，不能加。",
      faqs: [
        { q: "为什么不直接在 add 里读 input DOM？", a: "那是绕过状态。Vue 的协议是：界面读写的是源。先有源，再接控件。" },
        { q: "为什么不把新待办直接写进 todos 的最后一项？", a: "那会边打字边改已有待办。草稿和清单必须是两份状态。" },
      ],
    },
    {
      id: "form-s1",
      tick: "S1",
      title: "草稿进门，还没有框",
      goal: "创建 title = ref('')。先不放 input。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "多一个 title ref，模板不动。页面会？",
        choices: [
          { id: "box", label: "出现输入框", correct: false, why: "ref 不会自己长出控件。和 count 不会自己出现在按钮上一样。" },
          { id: "same", label: "完全不变", correct: true, why: "没人读 title，也没有 input。声明 ≠ 入口。" },
          { id: "err", label: "报错：未使用", correct: false, why: "合法。只是还没被接上。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": titleUnused },
        blocks: [{ id: "title", label: "② 创建 title = ref('')" }],
        narration: "草稿有了名字。还没有人能往里面打字。",
      },
      observe: {
        state: [{ id: "title", label: "title", value: '""（未被读取）', symbol: "title" }],
        dom: [{ id: "list", label: "ul", value: "仍是列表" }],
        events: [],
      },
      nodes: [
        { id: "title", kind: "ref", label: "title", detail: '""', symbol: "title" },
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "todos", to: "dom" }],
      explanation: {
        headline: "草稿是第三份状态",
        body: "todos 是清单。title 是「还没提交的那一行」。它们不是同一个 ref。很多人一上来就把输入绑到数组最后一项——那会边打字边改已有待办。",
      },
      tryThis: "看 X-Ray：现在多了一个 title，值是空字符串。页面上还没有框。",
      faqs: [
        { q: "为什么不直接在模板里放 input？", a: "可以，但你会分不清「框出现」和「状态出现」。先有源，再放控件——和 count 同一拆法。" },
      ],
      mapping: [{ code: "const title = ref('')", runtime: "草稿 ref", ui: "尚未出现" }],
    },
    {
      id: "form-s2",
      tick: "S2",
      title: "裸 input：字只活在 DOM",
      goal: "放一个不绑定的输入框。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "在框里打「学组件」。程序里的 title 会？",
        choices: [
          { id: "sync", label: "变成「学组件」", correct: false, why: "输入框没接到 title。你打的字只活在浏览器控件内部。" },
          { id: "empty", label: "仍是空字符串", correct: true, why: "没有 :value，也没有 @input / v-model。两份值各活各的。" },
          { id: "err", label: "报错", correct: false, why: "原生 input 完全合法。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": bareInput },
        blocks: [{ id: "input", label: "③ 放一个裸 <input>" }],
        narration: "入口形状有了。数据和输入框各活各的。请真的打几个字——title 不会变，因为没人读它，也没人写它。",
      },
      observe: {
        state: [{ id: "title", label: "title", value: '""', symbol: "title" }],
        dom: [{ id: "input", label: "input", value: "未绑定，自管自己" }],
        events: [],
      },
      nodes: [
        { id: "domInput", kind: "dom", label: "input DOM", detail: "只管自己" },
        { id: "title", kind: "ref", label: "title", detail: '""', symbol: "title" },
      ],
      edges: [],
      why: {
        question: "人明明打了字，为什么程序是空的？",
        choices: [
          { id: "oneway", label: "DOM 输入没有写回 title 这份状态", correct: true, why: "没有 v-model / @input，事件只发生在浏览器控件内部。" },
          { id: "ref", label: "title 不是 ref", correct: false, why: "它是 ref。只是没被接上。" },
          { id: "todo", label: "应该 v-model 绑在 todos 上", correct: false, why: "todos 是数组。草稿是 title。别绑错源。" },
        ],
      },
      explanation: {
        headline: "输入框默认不是状态",
        body: "原生 input 自己记一份值。Vue 不会因为旁边有个 title ref 就去同步它。下一镜先接「状态 → 控件」这一条边，看看只接一半会发生什么。",
      },
      tryThis: "在框里打「学组件」。看下方——这一镜还没有预览行。X-Ray 里 title 应仍是空的。",
      faqs: [
        { q: "那我打的字去哪了？", a: "活在浏览器控件内部。刷新就没了，程序也读不到。这就是「非受控」。" },
      ],
    },
    {
      id: "form-s3",
      tick: "S3",
      title: "只绑 :value，不绑写回",
      goal: "让控件受控于 title。先不写 @input。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "现在 :value=\"title\"，title 是 ''。你在框里打字，会看到？",
        choices: [
          { id: "keep", label: "字留下来，下方预览也更新", correct: false, why: "没有写回。title 仍是 ''。受控输入会把控件按源重置。" },
          { id: "eat", label: "字打不进去或一闪就没；预览仍是空的", correct: true, why: "这是受控控件只接了一半：每次渲染都用 '' 盖掉你刚打的字。" },
          { id: "dom", label: "框里有字，预览为空——各活各的，和裸 input 一样", correct: false, why: "裸 input 是非受控，字能留下。:value 把它变成受控，源是空的。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": oneWayValue },
        blocks: [{ id: "value", label: "④ :value=\"title\"（只读方向）" }],
        narration: "请打字。下方「title =」是程序里的值。这一镜它不该跟着你变。",
      },
      observe: {
        state: [{ id: "title", label: "title", value: '""', symbol: "title" }],
        dom: [{ id: "input", label: "input", value: "受控于 ''", symbol: "title" }],
        events: [],
      },
      nodes: [
        { id: "title", kind: "ref", label: "title", symbol: "title" },
        { id: "dom", kind: "dom", label: "input", detail: "被 '' 按住" },
      ],
      edges: [{ from: "title", to: "dom", label: ":value（无写回）" }],
      why: {
        question: "为什么裸 input 能打字，绑了 :value 反而打不稳？",
        choices: [
          { id: "ctrl", label: "变成受控：渲染用 title 覆盖控件。title 没被更新，就一直是空", correct: true, why: "单向绑定不是「显示一下」。它每轮都说了算。" },
          { id: "bug", label: "Vue 的 bug，应该用 :model-value", correct: false, why: "原生 input 用 value。组件才用 modelValue。机制一样。" },
          { id: "trim", label: "空字符串被 trim 掉了", correct: false, why: "这一镜还没有 add，更没有 trim。" },
        ],
      },
      explanation: {
        headline: "单向绑定会「说了算」",
        body: "状态流向控件，控件却不能流向状态。源是 ''，控件就必须是 ''。v-model 要补的，正是缺的那条写回边。不是「再给一个魔法属性」。",
      },
      faqs: [
        { q: "React 里这叫什么？", a: "受控组件。value={title} 没有 onChange 时，输入会被 state 按住。同一条因果。" },
        { q: "为什么下面多了一行 title =？", a: "那是程序里的值。这一镜它必须一直是空的。如果你看见它跟着变，说明不小心写了 v-model。" },
      ],
      mapping: [{ code: ':value="title"', runtime: "title → input", ui: "被空字符串按住" }],
      tryThis: "用力打字。字会一闪或打不进去。确认下方「title =」仍是空的。",
    },
    {
      id: "form-s4",
      tick: "S4",
      title: "v-model 补上写回",
      goal: "让每次击键都写入 title。还不要 push。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "换成 v-model=\"title\" 后打字，下方预览会？",
        choices: [
          { id: "follow", label: "跟着你打的字变", correct: true, why: "v-model = :value + @input。击键写入 title，预览读 title。" },
          { id: "blur", label: "要失焦才更新", correct: false, why: "input 事件随击键发生。change 才常在失焦时触发。" },
          { id: "list", label: "列表会多出一项", correct: false, why: "还没有 add。草稿变了，清单还没有接上。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": withModel },
        blocks: [{ id: "model", label: "⑤ v-model=\"title\"" }],
        narration: "现在请打字。预览必须同步。清单还不会变——草稿和清单仍是两份状态。",
      },
      observe: {
        state: [{ id: "title", label: "title", value: "随击键变化", symbol: "title" }],
        dom: [{ id: "input", label: "input", value: "绑定 title", symbol: "title" }],
        events: [{ id: "input", label: "input", value: "title = $event", symbol: "v-model" }],
      },
      nodes: [
        { id: "inputEv", kind: "event", label: "input" },
        { id: "title", kind: "ref", label: "title", symbol: "title" },
        { id: "dom", kind: "dom", label: "预览" },
      ],
      edges: [
        { from: "title", to: "dom", label: "value" },
        { from: "inputEv", to: "title", label: "写入" },
        { from: "title", to: "dom", label: "预览读取" },
      ],
      counterfactual: {
        id: "model-vs-pair",
        title: "v-model vs :value + @input",
        setup: "同一份 title。两种写法。",
        worlds: [worldModel, worldPair],
        punchline:
          "两边打字，预览都跟着走。v-model 不是新机制，是少写一遍这对边。你现在知道糖里面是什么，才不会在自定义组件上乱猜。",
      },
      explanation: {
        headline: "v-model 是两条边的糖",
        body: ":value 让状态流向控件。@input 让控件流回状态。写成 v-model 之前，你已经亲眼见过只接一半会把字吞掉。",
      },
      mapping: [
        { code: 'v-model="title"', runtime: "title ↔ input", ui: "击键即同步" },
        { code: ':value + @input', runtime: "同一张图", ui: "脸相同" },
      ],
      faqs: [
        { q: "checkbox 的 v-model 也是 value 吗？", a: "不是。checkbox 绑的是 checked，事件常是 change。糖会按控件类型换这对边。机制仍是读写成对。" },
        { q: "为什么清单还不变？", a: "草稿和清单是两份状态。v-model 只写 title。下一镜才 push。" },
      ],
      tryThis: "打「学组件」。下方「title =」必须跟着变。列表仍是两项。",
    },
    {
      id: "form-s5",
      tick: "S5",
      title: "add：草稿写进清单",
      goal: "点按钮才 push。这一镜先不清空草稿。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "输入「学组件」再点添加。列表和输入框会？",
        choices: [
          { id: "stay", label: "列表多一项，框里的字还在", correct: true, why: "add 只 push 了当时的字符串。title 这份草稿没被改，v-model 就让框继续显示它。" },
          { id: "ok", label: "列表多一项，输入框变空", correct: false, why: "那是下一镜才做的 title = ''。现在还没有这条边。" },
          { id: "empty", label: "推进去的是空标题，框被清空", correct: false, why: "v-model 已经接通，add 读得到字。trim 只挡住纯空格。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": withPush },
        blocks: [
          { id: "add", label: "⑥ add()：trim 后 push" },
          { id: "btn", label: "⑦ 按钮 @click" },
        ],
        narration: "草稿 → 清单 由一次点击触发。请添加「学组件」——框里的字应该还在。那是另一条边。",
      },
      replay: {
        label: "添加一项（不清空）",
        steps: [
          { caption: "title 已是「学组件」", highlight: ["title"] },
          { caption: "click add", event: "click", highlight: ["click"] },
          { caption: "push 新对象到 todos", highlight: ["todos"] },
          { caption: "title 仍是「学组件」", highlight: ["title"] },
          { caption: "列表多一行，输入框还留着字", highlight: ["dom"] },
        ],
      },
      observe: {
        state: [
          { id: "title", label: "title", value: "提交后仍在", symbol: "title" },
          { id: "todos", label: "todos.length", value: "2 → 3", symbol: "todos" },
        ],
        events: [{ id: "click", label: "click", value: "add()" }],
        dom: [{ id: "list", label: "ul", value: "+1 项，框未清空" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "click" },
        { id: "title", kind: "ref", label: "title", symbol: "title" },
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "click", to: "title", label: "读取" },
        { from: "title", to: "todos", label: "push 拷贝" },
        { from: "todos", to: "dom" },
      ],
      why: {
        question: "为什么列表多了一项，输入框却还留着字？",
        choices: [
          { id: "two", label: "push 和清空草稿是两条边。这一镜只做了第一条", correct: true, why: "草稿 title 和清单项里的 title 字段不是同一份东西。拷贝已经进数组，源没被清。" },
          { id: "bug", label: "v-model 坏了，应该用 :value", correct: false, why: "v-model 工作正常：title 还是「学组件」，所以框还显示它。" },
          { id: "trim", label: "trim 把清空给吃掉了", correct: false, why: "trim 只去掉两端空白，不会把字符串变成空。" },
        ],
      },
      explanation: {
        headline: "提交是拷贝，不是移动",
        body: "add 读出字符串，放进新对象。草稿还在。所以框还留着字、列表也有了那一项。下一镜只补 title = ''——你会看见框跟着草稿变空，列表里的字却留下。",
      },
      tryThis: "输入「学组件」，点添加。确认列表多了一行，框里的字还在。再点一次——会再加一条相同的。",
      faqs: [
        { q: "为什么用 Date.now() 当 id？", a: "演示够用。真项目用数据库 id 或 uuid。关键是：新项要有自己的稳定身份，不要用下标。" },
        { q: "漏了 .value 会怎样？", a: "title.value.trim 变成对 ref 对象 trim，会炸或得到错的值。script 里必须 .value。" },
        { q: "空字符串或纯空格呢？", a: "trim 后若是空，函数直接 return。这不是清空草稿，是拒绝进清单。" },
      ],
    },
    {
      id: "form-s6",
      tick: "S6",
      title: "提交后清草稿",
      goal: "只补 title = ''。列表里的字不该一起消失。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "add 末尾加上 title.value = ''。再添加「学组件」之后？",
        choices: [
          { id: "ok", label: "列表多一项，输入框变空；列表里仍是「学组件」", correct: true, why: "push 进去的是当时的字符串拷贝。清的是草稿 ref，不是数组里那份值。" },
          { id: "wipe", label: "框空了，刚加的那一项标题也变空", correct: false, why: "那会是它们共享引用。字符串是值拷贝。" },
          { id: "stay", label: "框里的字还在，因为 v-model 记住了 DOM", correct: false, why: "框绑的是 title。title 变 ''，框必须变空。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": withAdd },
        blocks: [{ id: "clear", label: "⑧ title.value = ''" }],
        narration: "请再添加一次。这一次框必须变空，列表里的新标题必须留下。",
      },
      replay: {
        label: "添加并清空",
        steps: [
          { caption: "title 已是「学组件」", highlight: ["title"] },
          { caption: "click add → push", event: "click", highlight: ["click", "todos"] },
          { caption: "title  「学组件」→ ''", highlight: ["title"], state: { id: "title", from: "学组件", to: "" } },
          { caption: "列表多一行，输入框变空", highlight: ["dom"] },
        ],
      },
      observe: {
        state: [
          { id: "title", label: "title", value: "提交后变 ''", symbol: "title" },
          { id: "todos", label: "todos.length", value: "2 → 3", symbol: "todos" },
        ],
        events: [{ id: "click", label: "click", value: "add()" }],
        dom: [{ id: "list", label: "ul", value: "+1 项，框已空" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "click" },
        { id: "title", kind: "ref", label: "title", symbol: "title" },
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "title", to: "todos", label: "push" },
        { from: "click", to: "title", label: "清空" },
        { from: "todos", to: "dom" },
        { from: "title", to: "dom", label: "框跟着 ''" },
      ],
      why: {
        question: "为什么清空的是 title，列表里新项的标题却还在？",
        choices: [
          { id: "copy", label: "push 进去的是当时的字符串拷贝，不是 title 这个 ref", correct: true, why: "新对象的 title 字段是一个普通 string。草稿 ref 被清空，不影响已经进数组的那份值。" },
          { id: "same", label: "它们是同一份引用，只是看起来像留下了", correct: false, why: "字符串是值。不是共享引用。" },
          { id: "vfor", label: "v-for 缓存了旧 DOM 文本", correct: false, why: "新项是新节点。文本来自新对象的字段。" },
        ],
      },
      explanation: {
        headline: "清草稿 ≠ 删刚提交的那一项",
        body: "两份 title：草稿 ref，和对象上的字符串字段。v-model 只绑前者。所以框会空、列表会留下字。trim 挡的是「看起来点了、其实推进去空白」——那是另一种静默失败，留给消融。",
      },
      tryThis: "输入「学组件」，点添加。框应变空，列表应留下「学组件」。再点添加：空草稿不该再进清单。",
      faqs: [
        { q: "为什么不在模板里写 @click=\"add(); title = ''\"？", a: "可以，但清空属于提交协议，写进 add 更不容易漏。一次提交，两件事：拷贝、复位。" },
        { q: "如果 push 的是 title 这个 ref 本身？", a: "不要。数组项应是普通数据。把 ref 推进去，清空草稿时可能把清单项一起掏空。" },
      ],
    },
    {
      id: "form-s7",
      tick: "S7",
      title: "回车也是提交",
      goal: "用 form + submit.prevent。不要只靠按钮 click。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "包成 <form @submit.prevent=\"add\"> 之后，在输入框按回车会？",
        choices: [
          { id: "add", label: "和点按钮一样：添加一项并清空，页面不刷新", correct: true, why: "回车触发 submit。.prevent 拦住浏览器默认导航。add 仍在程序里跑。" },
          { id: "none", label: "什么都不发生，因为没点按钮", correct: false, why: "input 在 form 里按回车，默认就是 submit。这正是要监听 submit 而不是只听 click 的原因。" },
          { id: "reload", label: "整页刷新 / 预览闪掉", correct: false, why: "那是没有 .prevent 的失败。这一镜已经拦住了。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": withForm },
        blocks: [
          { id: "form", label: "⑨ 包成 <form>" },
          { id: "prevent", label: "⑩ @submit.prevent" },
        ],
        narration: "回车会触发 submit。.prevent 拦住浏览器默认的整页刷新。按钮改成 type=\"submit\"。请不要点按钮，用回车。",
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
        body: "Vue 管状态。浏览器默认会把 form GET 出去、刷新 iframe。.prevent 不是语法癖好，是把这次提交留在程序里。下一镜会拆掉它，你会看见预览闪掉。",
      },
      tryThis: "输入「回车提交」，按 Enter，不要点按钮。列表应 +1，框应变空，预览不应整页闪掉。",
      faqs: [
        { q: "为什么不继续用 @click？", a: "回车在 input 里默认提交表单，不会点到那个按钮的 click（若按钮不在 form 里更不会）。监听 submit 才是表单的那条边。" },
        { q: ".prevent 写在哪？", a: "@submit.prevent=\"add\" 是修饰符，等价于事件里 event.preventDefault() 再调用 add。" },
      ],
    },
    {
      id: "form-s8",
      tick: "S8",
      title: "拆掉 ref / prevent / trim",
      goal: "三种坏法：状态不可追踪、提交逃出程序、空白混进清单。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "如果 title 是普通 let，v-model 还在，输入时会？",
        choices: [
          { id: "ok", label: "照样同步", correct: false, why: "v-model 会赋值，但没有人通知渲染。预览协议断了。" },
          { id: "stale", label: "框能打字，程序里的 title 对不上渲染", correct: true, why: "普通变量没有订阅者。和 let count = 0 同一类。" },
          { id: "err", label: "v-model 只能绑 ref，会报错", correct: false, why: "常常不报错，只是更新协议断了。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": withForm },
        blocks: [{ id: "keep", label: "正确版本先留着" }],
        narration: "先留下能添加的版本。再分别拆 ref、.prevent、trim。",
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
        {
          id: "no-trim",
          prompt: "如果不过 trim、空也 push？",
          files: { "src/App.vue": noTrim },
          expected: {
            kind: "stale",
            message: "连点添加会推进空白项。列表「变长了」但看起来没变——另一种静默失败。",
          },
          lesson: "协议通了不等于数据有意义。空标题是合法 push，也是产品错误。",
        },
      ],
      explanation: {
        headline: "表单有三道缝",
        body: "控件 ↔ 状态，靠 ref + v-model。提交 ↔ 浏览器，靠 .prevent。草稿 ↔ 清单，靠 trim 后的拷贝。拆哪一道，失败的样子都不一样。",
      },
      tryThis: "三种消融分开试：① 普通 let 再打字  ② 去掉 .prevent 再回车  ③ 连点添加看空白项。看完点「恢复」。",
      faqs: [
        { q: "为什么预览闪掉算 crash？", a: "iframe 被浏览器导航走了。程序里的 add 可能跑过，但你再也看不见结果。失败跑出了 Vue。" },
        { q: "空标题为什么叫 stale 而不是 error？", a: "push 成功了，界面也更新了。错的是数据含义。静默的产品错误比红屏难查。" },
      ],
    },
    {
      id: "form-s9",
      tick: "S9",
      title: "换：笔记框",
      goal: "textarea 已经在。字数统计读的是 note。框没绑。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "打字时，字数会从 0 往上走吗？",
        choices: [
          { id: "yes", label: "会。textarea 里已经有字", correct: false, why: "字在 DOM 里。note 仍是 ''。模板读的是 note.length。" },
          { id: "no", label: "不会。textarea 没绑 v-model", correct: true, why: "和裸 input 同一条缝：人写了，程序没接住。现在你还知道：若改成 :value=\"note\" 而不写回，字还会被空字符串按住。" },
          { id: "err", label: "会报错", correct: false, why: "能打字，统计冻在 0。静默。" },
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
        body: "列表把状态投影出去。表单把人的动作写回来。你已经见过只接 :value 会吞字。下一实验才会把「一项」拆成子组件——那是边界，不是输入。",
      },
      tryThis: "先在 textarea 打几个字，看字数是不是冻在 0。再打开「补上 v-model」，字数应跟着走。",
      faqs: [
        { q: "textarea 和 input 的 v-model 一样吗？", a: "一样：都是值 ↔ 控件。checkbox 才换一对边（checked / change）。" },
        { q: "如果只写 :value=\"note\" 不写回？", a: "和 S3 同一事故：字会被空字符串按住。迁移题里你已经能预见到。" },
      ],
    },
  ],
};
