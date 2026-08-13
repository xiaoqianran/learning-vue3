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
    <li v-for="t in todos">
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
      {{ t.title }}
    </li>
  </ul>
</template>
`;

const s4 = `<script setup>
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
      {{ t.done ? '✓' : '○' }} {{ t.title }}
    </li>
  </ul>
</template>
`;

const s5Read = `<script setup>
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
        <input type="checkbox" :checked="t.done" />
        <span :class="{ done: t.done }">{{ t.title }}</span>
      </label>
    </li>
  </ul>
</template>
`;

const s5 = `<script setup>
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

const s6 = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
  { id: 3, title: '写组件', done: false },
])

function prepend() {
  todos.value.unshift({
    id: Date.now(),
    title: '插到最前',
    done: false,
  })
}
</script>

<template>
  <button @click="prepend">插到最前</button>
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

function prepend() {
  todos.unshift({ id: Date.now(), title: '插到最前', done: false })
}
</script>

<template>
  <button @click="prepend">插到最前</button>
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

const noKey = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
  { id: 3, title: '写组件', done: false },
])

function prepend() {
  todos.value.unshift({
    id: Date.now(),
    title: '插到最前',
    done: false,
  })
}
</script>

<template>
  <button @click="prepend">插到最前</button>
  <ul>
    <li v-for="t in todos">
      <label>
        <input type="checkbox" :checked="t.done" @change="t.done = !t.done" />
        <span :class="{ done: t.done }">{{ t.title }}</span>
      </label>
    </li>
  </ul>
</template>
`;

const indexKey = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学 v-for', done: false },
  { id: 3, title: '写组件', done: false },
])

function prepend() {
  todos.value.unshift({
    id: Date.now(),
    title: '插到最前',
    done: false,
  })
}
</script>

<template>
  <button @click="prepend">插到最前</button>
  <ul>
    <li v-for="(t, i) in todos" :key="i">
      <label>
        <input type="checkbox" :checked="t.done" @change="t.done = !t.done" />
        <span :class="{ done: t.done }">{{ t.title }}</span>
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
  promise:
    "一镜只接一条边：先有数组，再投影，再给身份，再读字段，再读进控件，再写回字段。亲手勾选会弹回，再亲手看见缺 :key 时勾选粘错行。",
  minutes: 22,
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
        body: "你看见的两项来自标记本身。程序里没有数组，所以谈不上增删、完成、过滤。下一镜先把数据请来——先不渲染它。",
      },
      tryThis: "数一下右侧有几项。记住：这两项是写在 HTML 里的，不是从数据长出来的。",
      faqs: [
        { q: "为什么不直接写 v-for？", a: "因为你还没看见「有数组但模板不读它」时页面会怎样。和 ref 那一课同一条规则：声明 ≠ 显示。" },
        { q: "这和静态按钮那一课有什么关系？", a: "一模一样。那时缺的是 count；现在缺的是「一份可投影的源」。" },
      ],
    },
    {
      id: "list-s1",
      tick: "S1",
      title: "数组进门，模板不动",
      goal: "程序记住 3 条待办。模板仍手写两项。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加入 todos = ref([...3 项])，模板一行不改。页面会？",
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
          { id: "todos", label: "② 创建 todos（3 项）" },
        ],
        narration: "3 条数据已经在程序里。界面还在读那两行写死的文字。一次只引入源，不引入投影。",
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
          { id: "read", label: "模板没有读取 todos，没有依赖", correct: true, why: "渲染函数根本没碰到这个数组。两份清单各说各的。" },
          { id: "delay", label: "Vue 要等 nextTick 才会同步", correct: false, why: "不是时机。是根本没有那条边。" },
          { id: "key", label: "缺 :key 所以少渲染一项", correct: false, why: ":key 管身份，不管「要不要读数组」。这一镜连 v-for 都还没有。" },
        ],
      },
      explanation: {
        headline: "两份真相开始打架",
        body: "脚本说有 3 项，模板说有 2 项。这就是手写清单的代价。v-for 要做的，是删掉模板里那份假真相。下一镜只做这件事，先不加 :key。",
      },
      tryThis: "对照左侧代码和右侧预览：数组第三项是「写组件」，页面上没有它。",
      faqs: [
        { q: "为什么数组里是对象，不是字符串？", a: "因为待办不止一个标题。后面要读 done、要写 done。先把「一项是对象」放进源里，投影时才有字段可读。" },
        { q: "script 里为什么是 todos.value，模板里不是？", a: "这一镜还没在 script 里读它。记住：script 里 ref 是对象，要 .value；模板自动解包。" },
      ],
      mapping: [{ code: "const todos = ref([...])", runtime: "todos: 3", ui: "仍是 2 个 <li>" }],
    },
    {
      id: "list-s2",
      tick: "S2",
      title: "只加 v-for，不加 key",
      goal: "让 DOM 从数组长出来。身份以后再说。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "改成 v-for=\"t in todos\"，不写 :key。页面会？",
        choices: [
          { id: "three", label: "出现 3 项，含「写组件」", correct: true, why: "模板开始读取数组。第三项终于有地方长出来。:key 不是投影的前提。" },
          { id: "two", label: "还是 2 项，因为没写 :key", correct: false, why: ":key 不决定「渲染几项」。它决定「哪一项是哪一项」。" },
          { id: "warn", label: "直接报错，Vue 3 强制要 key", correct: false, why: "会有警告，但列表仍会渲染。警告是在提醒身份，不是拦住投影。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s2 },
        blocks: [{ id: "vfor", label: "③ v-for 读取 todos（暂无 key）" }],
        narration: "手写的两项消失了。DOM 现在是数组的投影。:key 还没写——这是故意的。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "3 items", symbol: "todos" }],
        dom: [{ id: "list", label: "ul", value: "买牛奶 / 学 v-for / 写组件", symbol: "todos" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "render", kind: "render", label: "v-for", detail: "无 key", symbol: "v-for" },
        { id: "dom", kind: "dom", label: "DOM", detail: "3 项，按位置复用" },
      ],
      edges: [
        { from: "todos", to: "render", label: "读取" },
        { from: "render", to: "dom" },
      ],
      why: {
        question: "现在列表对了。为什么还要再加 :key？",
        choices: [
          { id: "id", label: "现在只是投影。还没有稳定身份，以后增删会认错节点", correct: true, why: "没有 key 时 Vue 默认按位置复用。看起来对，只是因为还没打乱顺序。" },
          { id: "perf", label: "纯属性能优化，功能上可有可无", correct: false, why: "性能是副作用。真正的事故是：勾选状态粘到错误的那一行。" },
          { id: "syntax", label: "v-for 语法规定必须成对出现", correct: false, why: "可以分开写。我们就是故意先投影、后给身份。" },
        ],
      },
      explanation: {
        headline: "投影和身份是两条边",
        body: "v-for 回答「有几项、每项长什么样」。:key 回答「这一项是不是刚才那一项」。先看见投影成立，再单独接上身份——否则你会以为 key 是让列表出现的那个东西。",
      },
      tryThis: "确认右侧现在是 3 项，含「写组件」。控制台可能有 key 警告——先记下，下一镜才修。",
      faqs: [
        { q: "控制台那句 key 警告要紧张吗？", a: "要在意，但不是这一镜的失败。它在说：节点没有身份证。下一镜才发证。" },
        { q: "t 是什么？", a: "循环别名，代表数组里当前那一个对象。它只在这个 v-for 内部存在。" },
      ],
      mapping: [{ code: 'v-for="t in todos"', runtime: "遍历 ref 数组", ui: "3 个 <li>（尚无身份）" }],
    },
    {
      id: "list-s3",
      tick: "S3",
      title: "补上 :key",
      goal: "给每一项一个稳定身份。页面看起来可以完全一样。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加上 :key=\"t.id\" 之后，首次渲染会？",
        choices: [
          { id: "same", label: "看起来一样，仍是那 3 项", correct: true, why: "key 不改变投影结果。它只登记身份。还没打乱顺序，所以脸相同。" },
          { id: "reorder", label: "会按 id 重新排序", correct: false, why: "key 不是 sort。顺序仍由数组下标决定。" },
          { id: "hide", label: "done: true 的项会被藏起来", correct: false, why: "模板还没读 done。key 更不会过滤。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s3 },
        blocks: [{ id: "key", label: "④ :key=\"t.id\"" }],
        narration: "脸可以不变。图上多了一条「身份」边。后面勾选、插入时才用得上。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "3 items", symbol: "todos" }],
        dom: [{ id: "list", label: "ul", value: "3 项，带 id 身份", symbol: "todos" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "render", kind: "render", label: "v-for + key", detail: "t.id", symbol: "v-for" },
        { id: "dom", kind: "dom", label: "DOM", detail: "稳定复用" },
      ],
      edges: [
        { from: "todos", to: "render", label: "读取" },
        { from: "render", to: "dom", label: "按 id 对齐" },
      ],
      why: {
        question: "加上 :key 之后，为什么看起来和上一镜一模一样？",
        choices: [
          { id: "id", label: "key 不改投影结果，只改「以后怎么认人」", correct: true, why: "还没插入、删除、重排，身份用不上。脸相同是正常的。" },
          { id: "noop", label: "所以 :key 其实可有可无", correct: false, why: "静态时用不上，一打乱顺序就出事。后面会让你亲手勾选再插入。" },
          { id: "sort", label: "其实已经按 id 排过序了，只是这组 id 刚好和原顺序相同", correct: false, why: "key 不是 sort。数组仍是 1、2、3。" },
        ],
      },
      explanation: {
        headline: "key 是身份证，不是显示条件",
        body: "Vue 更新列表时拿 key 去认人：id=2 还是「学 v-for」那一项，即使它从第 2 行变成第 3 行。没有身份证，它只能说「第 2 行还是第 2 行」——行在，人可能已经换了。",
      },
      tryThis: "看代码：每一行现在有 :key=\"t.id\"。页面不必有新东西。记住这张「看起来没变」的脸。",
      faqs: [
        { q: "为什么不用 :key=\"t.title\"？", a: "标题可能重复，也可能被改。id 才是「这一项活着期间不变」的那块牌子。" },
        { q: "可以用下标 i 当 key 吗？", a: "插入、删除、重排时下标会跟着变，等于没给身份。后面消融会让你亲眼看见。" },
      ],
      mapping: [{ code: ':key="t.id"', runtime: "节点身份", ui: "看起来一样，复用策略变了" }],
    },
    {
      id: "list-s4",
      tick: "S4",
      title: "先读 done，不写",
      goal: "投影对象的另一个字段。还不要做勾选。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "模板改成「✓/○ + 标题」之后？",
        choices: [
          { id: "mark", label: "买牛奶前面是 ✓，另外两项是 ○", correct: true, why: "模板读取 t.done。源里第一项已经是 true。这一镜只读，不写。" },
          { id: "all", label: "三项都会变成 ✓", correct: false, why: "每项读自己的 done。不是读数组上的一个总开关。" },
          { id: "none", label: "还是纯标题，因为没 checkbox", correct: false, why: "插值就能读字段。控件是下一镜的事。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s4 },
        blocks: [{ id: "read-done", label: "⑤ 模板读取 t.done" }],
        narration: "对象当一项，字段才能被分别投影。先看见读，再谈写。",
      },
      observe: {
        state: [
          { id: "d0", label: "todos[0].done", value: "true", symbol: "todos" },
          { id: "d1", label: "todos[1].done", value: "false", symbol: "todos" },
        ],
        dom: [{ id: "list", label: "ul", value: "✓ 买牛奶 / ○ 学 v-for / ○ 写组件" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos[i].done", symbol: "todos" },
        { id: "render", kind: "render", label: "读字段" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "todos", to: "render", label: "读取 done" },
        { from: "render", to: "dom" },
      ],
      explanation: {
        headline: "读字段 ≠ 写字段",
        body: "v-for 投影的是对象。{{ t.done }} 只建立「渲染订阅这个字段」。还没有人去改它。和当初「模板读 count、还没有 @click」是同一拆法。",
      },
      tryThis: "看第一项前面是 ✓，后两项是 ○。还没有复选框，所以你点不到任何东西——这是故意的。",
      faqs: [
        { q: "为什么不直接上 checkbox？", a: "checkbox 会同时引入 :checked（读）和 @change（写）。一次两条边。先确认读已经接通。" },
        { q: "t.done 为什么不用 .value？", a: "t 不是 ref，是数组里的普通对象。done 是它的布尔字段。todos 才是 ref。" },
      ],
      mapping: [{ code: "{{ t.done ? '✓' : '○' }}", runtime: "读取该项 done", ui: "✓ / ○" }],
    },
    {
      id: "list-s5",
      tick: "S5",
      title: "复选框只读 :checked",
      goal: "把 done 读进控件。先不写 @change。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "换成 :checked=\"t.done\" 的复选框，不写 @change。勾选「学 v-for」会？",
        choices: [
          { id: "keep", label: "勾上并划线，todos[1].done 变成 true", correct: false, why: "没有写回。源仍是 false。受控复选框会按源把勾选打回去。" },
          { id: "snap", label: "看起来勾了一下，随即弹回；数据没变", correct: true, why: "和表单课只绑 :value 一样：控件受源控制，源没被更新。" },
          { id: "dom", label: "勾选留在 DOM 里，只是样式不变", correct: false, why: "原生 checkbox 非受控时才会留下。:checked 每一轮渲染都说了算。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s5Read },
        blocks: [{ id: "checked", label: "⑥ :checked=\"t.done\"（只读方向）" }],
        narration: "✓/○ 换成了真的复选框。只接了读。请勾第二项——它不该留下来。",
      },
      observe: {
        state: [{ id: "todos", label: "todos[1].done", value: "false（未被写入）", symbol: "todos" }],
        dom: [{ id: "item", label: "checkbox", value: "受控于 false", symbol: "todos" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos[i].done", symbol: "todos" },
        { id: "dom", kind: "dom", label: "checkbox", detail: "被 false 按住" },
      ],
      edges: [{ from: "todos", to: "dom", label: ":checked（无写回）" }],
      why: {
        question: "为什么 ✓/○ 能显示对，换成 checkbox 点了却弹回？",
        choices: [
          { id: "ctrl", label: "插值只读；checkbox 还会被用户改 DOM，但源会把它按回去", correct: true, why: "读已经接通。缺的是写回。下一镜只补 @change。" },
          { id: "key", label: "因为还没有稳定 key", correct: false, why: "key 已经是 t.id。这和身份无关。" },
          { id: "disabled", label: "必须加 disabled 才能只读", correct: false, why: "我们故意让你点，才能看见「弹回」这个失败。" },
        ],
      },
      explanation: {
        headline: "受控控件会按源覆盖你",
        body: "原生 checkbox 自己记一份勾选。:checked 把它变成受控：每一轮渲染都用 t.done 覆盖控件。源是 false，勾选就必须是 false。写回是另一条边。",
      },
      tryThis: "连续勾「学 v-for」好几下。它会弹回。X-Ray 里 todos[1].done 应仍是 false。",
      faqs: [
        { q: "为什么不用 disabled？", a: "disabled 让你点不了，也就看不见「弹回」。弹回才证明：读已经接上，写还没有。" },
        { q: "和后面 v-model 有什么关系？", a: "v-model 会把 :checked + @change 收成糖。你现在先看见只接一半会怎样。" },
      ],
      mapping: [{ code: ':checked="t.done"', runtime: "done → 控件", ui: "勾选被源按住" }],
    },
    {
      id: "list-s6",
      tick: "S6",
      title: "勾选：写回这一项",
      goal: "只补 @change。change 只改这一项的 done。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加上 @change=\"t.done = !t.done\" 之后，勾选「学 v-for」会？",
        choices: [
          { id: "item", label: "只改这一项的 done，该项留下勾选并划线", correct: true, why: "t 是响应式对象。改 t.done 会通知用到它的那一块。数组没被替换。" },
          { id: "all", label: "整个 todos 被换成新数组，三行全重绘", correct: false, why: "这里没有替换数组，只改了对象字段。" },
          { id: "snap", label: "还是弹回，因为没 v-model", correct: false, why: "@change 就是写回。v-model 只是这对边的糖。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s5 },
        blocks: [{ id: "change", label: "⑦ @change 写 done" }],
        narration: "读和写终于成对。请再勾「学 v-for」——这次它必须留下来。这一镜仍然没有增删项。",
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
      why: {
        question: "为什么 checkbox 要 :checked 再加上 @change，而不是只放一个属性？",
        choices: [
          { id: "pair", label: "一个负责读进控件，一个负责写回对象", correct: true, why: "这就是受控控件。下一课 v-model 会把这对边收成糖。" },
          { id: "html", label: "HTML 规定 checkbox 必须两个属性", correct: false, why: "原生 HTML 用 checked 就够。Vue 里要接到响应式源，才拆成读写。" },
          { id: "key", label: "没有 :key 就不能勾选", correct: false, why: "能勾。只是之后插入时可能勾错人。" },
        ],
      },
      explanation: {
        headline: "改字段和改长度是两种边",
        body: "这一镜改的是对象字段，数组长度没变。下一镜才去 unshift。先确认「一项内部的变化」走的是字段订阅，再看「列表结构变化」走的是 key 对齐。",
      },
      tryThis: "勾选「学 v-for」，确认划线留下。再取消勾选。不要点还不存在的插入按钮。",
      faqs: [
        { q: "t.done = !t.done 算不算改 prop？", a: "现在 t 不是 prop，是 v-for 别名，指向源数组里的对象。组件课才会碰到「子改 prop」这条陷阱。" },
        { q: "为什么不用 v-model=\"t.done\"？", a: "可以，而且更短。这一镜故意写成读写一对，好让你看见 v-model 是糖。表单课会专门拆它。" },
      ],
      mapping: [
        { code: ':checked="t.done"', runtime: "读字段 → 控件", ui: "勾上/勾掉" },
        { code: "@change=\"t.done = !t.done\"", runtime: "控件 → 写字段", ui: "划线" },
      ],
    },
    {
      id: "list-s7",
      tick: "S7",
      title: "插入一项，看身份",
      goal: "unshift 打乱位置。有 key 时，勾选应该跟着人走。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "先勾选「学 v-for」，再点「插到最前」。勾选会？",
        choices: [
          { id: "follow", label: "跟着「学 v-for」走，新的第一行是未勾选", correct: true, why: ":key=\"t.id\" 让 Vue 认人。勾选状态住在那一项上，不跟座位走。" },
          { id: "stick", label: "粘在新的第一行「插到最前」上", correct: false, why: "那是没有 key、或 key 用下标时的事故。这一镜身份是对的。" },
          { id: "clear", label: "所有勾选被清空", correct: false, why: "unshift 不重置已有项的 done。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s6 },
        blocks: [{ id: "prepend", label: "⑧ prepend / unshift" }],
        narration: "先勾选「学 v-for」，再点「插到最前」。正确时，勾选仍在「学 v-for」上，不会粘在新的第一行。",
      },
      replay: {
        label: "先勾选再插入",
        steps: [
          { caption: "勾选「学 v-for」", event: "change", highlight: ["todos"] },
          { caption: "unshift 新项到 index 0", event: "click", highlight: ["click"] },
          { caption: "key=2 的节点带着勾选搬家", highlight: ["render", "dom"] },
        ],
      },
      observe: {
        state: [{ id: "todos", label: "todos.length", value: "3 → 4", symbol: "todos" }],
        dom: [{ id: "first", label: "第一行", value: "插到最前（新）" }],
        events: [{ id: "click", label: "click", value: "prepend()" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "prepend" },
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "render", kind: "render", label: "按 key 对齐" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "click", to: "todos", label: "unshift" },
        { from: "todos", to: "render" },
        { from: "render", to: "dom", label: "认人，不认座位" },
      ],
      explanation: {
        headline: "先用正确版本做一次实验",
        body: "请真的勾一下第二项，再插入。记住这个正确结果。下一镜会拆掉 ref、拆掉 key、把 key 换成下标——三种坏法，三种错法。",
      },
      tryThis: "① 勾选「学 v-for」  ② 点「插到最前」  ③ 确认勾选仍在「学 v-for」上，新的第一行是空的。",
      faqs: [
        { q: "为什么用 unshift 而不是 push？", a: "push 加在末尾，按位置复用也几乎看不出错。插到最前才会逼 Vue 回答：第一行还是原来那个人吗？" },
        { q: "todos.value.unshift？", a: "script 里必须 .value。模板里的 todos 已经解包。漏 .value 等于给 ref 对象自己 push，数组没被改到。" },
      ],
    },
    {
      id: "list-s8",
      tick: "S8",
      title: "拆掉 ref / key / 用下标当 key",
      goal: "三种坏法：通知不到、认错人、假装有身份。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "如果 todos 是普通 let 数组，点「插到最前」后列表会？",
        choices: [
          { id: "grow", label: "第一行出现「插到最前」", correct: false, why: "unshift 发生了，但没有订阅者。界面冻在 3 项。" },
          { id: "stuck", label: "内存里变长，页面仍是 3 项", correct: true, why: "和 let count = 0 同一类因果：有写入，无通知。" },
          { id: "err", label: "直接报错", correct: false, why: "合法。静默过期。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s6 },
        blocks: [{ id: "keep", label: "正确版本先留着" }],
        narration: "先记住带 ref 和 :key=\"t.id\" 的图。再分别拆。每一种消融请：先勾选第二项，再插入。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "ref(3)", symbol: "todos" }],
        dom: [{ id: "list", label: "ul", value: "3 项", symbol: "todos" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "render", kind: "render", label: "v-for + key" },
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
            message: "点「插到最前」时数组变长，DOM 仍是 3 项。普通数组没有订阅者。",
          },
          lesson: "v-for 只能投影它读到的响应式源。源若不是 ref，循环是一次性的。失败是「界面不知道」。",
        },
        {
          id: "no-key",
          prompt: "如果没有 :key？",
          files: { "src/App.vue": noKey },
          expected: {
            kind: "stale",
            message: "先勾选第二项再插入：勾选往往粘在新的第一行。Vue 按位置复用节点，人换了，座位上的 DOM 还在。",
          },
          lesson: "失败是「认错人」。投影还在工作，身份没有。",
        },
        {
          id: "index-key",
          prompt: "如果 :key 用下标 i？",
          files: { "src/App.vue": indexKey },
          expected: {
            kind: "stale",
            message: "看起来写了 key，其实 key 跟着座位变。插入后 0、1、2 重新发牌，勾选仍可能粘错。",
          },
          lesson: "下标不是身份。它是位置。用位置当身份证，和没有身份证几乎一样。",
        },
      ],
      why: {
        question: "「没有 key」和「key 用下标」是同一类错误吗？",
        choices: [
          { id: "same", label: "是。都是按位置认人", correct: true, why: "没有 key 时 Vue 默认用下标。你亲手写 :key=\"i\"，只是把默认策略写明白了，没有修好。" },
          { id: "better", label: "用下标至少消除了警告，所以是修好了", correct: false, why: "警告没了，事故还在。消警告 ≠ 给身份。" },
          { id: "ref", label: "都不如拆掉 ref 严重", correct: false, why: "拆 ref 是通知失败；拆身份是认人失败。两种都要会诊断。" },
        ],
      },
      explanation: {
        headline: "长度靠 ref，身份靠稳定 id",
        body: "拆掉 ref：增删发生在内存，界面不知道。拆掉 key：界面知道变了，却认错是哪一项。用下标当 key：警告消失，认错还在。列表要同时有「可追踪的源」和「稳定的身份」。",
      },
      tryThis: "每开一种消融：先勾选第二项，再点「插到最前」，看勾选还在不在「学 v-for」上。看完点「恢复」。",
      faqs: [
        { q: "什么时候下标当 key 可以？", a: "列表静态、永不增删重排、也没有内部状态（如勾选、输入）。待办清单不满足。" },
        { q: "三种消融要按什么顺序看？", a: "先拆 ref（界面不知道变了），再拆 key（认错人），再用下标当 key（警告没了，事故还在）。三种失败的脸不一样。" },
      ],
    },
    {
      id: "list-s9",
      tick: "S9",
      title: "换：标签云",
      goal: "tags 已经在。界面还在手写两颗。指出缺的是哪一条边。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "这段程序会显示 3 个标签吗？",
        choices: [
          { id: "yes", label: "会。tags 里有 3 个字符串", correct: false, why: "模板手写了 vue / ref。第三项 computed 还没出现。源在，投影不在。" },
          { id: "no", label: "不会。模板没读 tags", correct: true, why: "数组是 3，DOM 是 2。缺的是 v-for，不是缺一个 span。" },
          { id: "err", label: "会报错", correct: false, why: "能跑，只是两份真相。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "tags", label: "换场景：标签" }],
        narration: "待办换成了标签。对象换成了字符串。因果结构没换。",
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
          prompt: "补上 v-for + :key 之后？",
          files: { "src/App.vue": transferAfter },
          expected: {
            kind: "stale",
            message: "这是修复：3 个标签从数组长出来。手写的两颗消失了。字符串用自身当 key 可以，因为它们就是身份。",
          },
          lesson: "迁移成功：你指出的是「模板没读数组」，不是「少写一个 span」。",
        },
      ],
      why: {
        question: "字符串数组可以用 :key=\"tag\"，对象数组为什么不行？",
        choices: [
          { id: "id", label: "对象没有稳定的「自身即身份」；字段会变、内容会重复", correct: true, why: "字符串当 key 要求不重复。对象要另给 id。" },
          { id: "same", label: "其实对象也可以 :key=\"t\"，Vue 会比较引用", correct: false, why: "可以拿引用当 key，但一替换对象（新 {}）身份就断。显式 id 更稳。" },
          { id: "str", label: "对象必须先 JSON.stringify 再当 key", correct: false, why: "那会把每次内容变化都当成换人。" },
        ],
      },
      explanation: {
        headline: "列表的身份是投影 + 身份证",
        body: "待办、标签、购物车行——都是「一份数组，一排节点」。World 2 从这里开始长：先有列表，才谈得上表单往里加、组件往外拆。",
      },
      tryThis: "先数右侧几颗标签（应是 2）。再打开「补上 v-for + :key」，确认变成 3 颗，含 computed。",
      faqs: [
        { q: "和 computed 课的 todos 有什么关系？", a: "那一课问「完成数是派生」。这一课问「这一排节点从哪长出来」。一个源，两种投影：派生值 vs 节点列表。" },
        { q: "标签为什么可以用自身当 key？", a: "这里三个字符串互不相同，自身就是身份。待办标题可能重复、会被改，所以要另给 id。" },
      ],
    },
  ],
};
