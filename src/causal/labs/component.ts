import type { CausalLab, CounterfactualWorld } from "../types";

const inlineApp = `<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学组件', done: false },
])

function toggle(id) {
  const t = todos.value.find((x) => x.id === id)
  if (t) t.done = !t.done
}
</script>

<template>
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

const itemHardcoded = `<template>
  <label>
    <input type="checkbox" checked disabled />
    <span class="done">买牛奶</span>
  </label>
</template>
`;

const usedHardcodedApp = `<script setup>
import { ref } from 'vue'
import TodoItem from './TodoItem.vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学组件', done: false },
])

function toggle(id) {
  const t = todos.value.find((x) => x.id === id)
  if (t) t.done = !t.done
}
</script>

<template>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <TodoItem />
    </li>
  </ul>
</template>
`;

const itemDisplay = `<script setup>
defineProps({
  todo: { type: Object, required: true },
})
</script>

<template>
  <label>
    <input type="checkbox" :checked="todo.done" disabled />
    <span :class="{ done: todo.done }">{{ todo.title }}</span>
  </label>
</template>
`;

const usedNoPropsApp = `<script setup>
import { ref } from 'vue'
import TodoItem from './TodoItem.vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学组件', done: false },
])

function toggle(id) {
  const t = todos.value.find((x) => x.id === id)
  if (t) t.done = !t.done
}
</script>

<template>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <TodoItem />
    </li>
  </ul>
</template>
`;

const usedWithPropsApp = `<script setup>
import { ref } from 'vue'
import TodoItem from './TodoItem.vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学组件', done: false },
])

function toggle(id) {
  const t = todos.value.find((x) => x.id === id)
  if (t) t.done = !t.done
}
</script>

<template>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <TodoItem :todo="t" />
    </li>
  </ul>
</template>
`;

const itemEmit = `<script setup>
defineProps({
  todo: { type: Object, required: true },
})
defineEmits(['toggle'])
</script>

<template>
  <label>
    <input
      type="checkbox"
      :checked="todo.done"
      @change="$emit('toggle', todo.id)"
    />
    <span :class="{ done: todo.done }">{{ todo.title }}</span>
  </label>
</template>
`;

const parentNoListen = `<script setup>
import { ref } from 'vue'
import TodoItem from './TodoItem.vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学组件', done: false },
])

function toggle(id) {
  const t = todos.value.find((x) => x.id === id)
  if (t) t.done = !t.done
}
</script>

<template>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <TodoItem :todo="t" />
    </li>
  </ul>
</template>
`;

const parentListen = `<script setup>
import { ref } from 'vue'
import TodoItem from './TodoItem.vue'

const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学组件', done: false },
])

function toggle(id) {
  const t = todos.value.find((x) => x.id === id)
  if (t) t.done = !t.done
}
</script>

<template>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <TodoItem :todo="t" @toggle="toggle" />
    </li>
  </ul>
</template>
`;

const mutateProp = `<script setup>
defineProps({
  todo: { type: Object, required: true },
})
</script>

<template>
  <label>
    <input
      type="checkbox"
      :checked="todo.done"
      @change="todo.done = !todo.done"
    />
    <span :class="{ done: todo.done }">{{ todo.title }}</span>
  </label>
</template>
`;

const emitWholeTodo = `<script setup>
defineProps({
  todo: { type: Object, required: true },
})
defineEmits(['toggle'])
</script>

<template>
  <label>
    <input
      type="checkbox"
      :checked="todo.done"
      @change="$emit('toggle', todo)"
    />
    <span :class="{ done: todo.done }">{{ todo.title }}</span>
  </label>
</template>
`;

const likeBefore = `<script setup>
import { ref } from 'vue'

const liked = ref(false)
</script>

<template>
  <button @click="liked = !liked">
    {{ liked ? '已喜欢' : '喜欢' }}
  </button>
</template>
`;

const likeButton = `<script setup>
defineProps({
  liked: { type: Boolean, required: true },
})
defineEmits(['toggle'])
</script>

<template>
  <button @click="$emit('toggle')">
    {{ liked ? '已喜欢' : '喜欢' }}
  </button>
</template>
`;

const likeAfter = `<script setup>
import { ref } from 'vue'
import LikeButton from './LikeButton.vue'

const liked = ref(false)
</script>

<template>
  <LikeButton :liked="liked" @toggle="liked = !liked" />
</template>
`;

const worldEmit: CounterfactualWorld = {
  id: "emit",
  name: "emit id",
  tagline: "子通知，父改数据",
  files: {
    "src/App.vue": parentListen,
    "src/TodoItem.vue": itemEmit,
  },
  nodes: [
    { id: "child", kind: "component", label: "TodoItem" },
    { id: "emit", kind: "event", label: "emit toggle(id)" },
    { id: "todos", kind: "ref", label: "todos" },
    { id: "dom", kind: "dom", label: "DOM" },
  ],
  edges: [
    { from: "child", to: "emit" },
    { from: "emit", to: "todos", label: "父写入" },
    { from: "todos", to: "dom" },
  ],
  note: "子组件不拥有 todos。它只发出「哪一项」的意图。真相留在父级。",
};

const worldMutate: CounterfactualWorld = {
  id: "mutate",
  name: "改 prop",
  tagline: "子直接改对象字段",
  files: {
    "src/App.vue": parentListen,
    "src/TodoItem.vue": mutateProp,
  },
  nodes: [
    { id: "child", kind: "component", label: "TodoItem" },
    { id: "todos", kind: "ref", label: "todos" },
    { id: "dom", kind: "dom", label: "DOM" },
  ],
  edges: [{ from: "child", to: "todos", label: "偷偷写入" }],
  note: "对象是引用。子改 todo.done，父的数组也变了。界面往往「看起来对」。",
};

export const COMPONENT_LAB: CausalLab = {
  id: "component",
  world: 2,
  concept: "props",
  title: "一项变成一个组件",
  subtitle: "子组件能显示，不该拥有清单",
  promise:
    "一镜一条边：先有文件，再挂标签（仍写死），再声明 props，再传入，再 emit，再监听。看见「挂上了但两项都叫买牛奶」，以及改 prop 为什么常常能跑。",
  minutes: 24,
  official: "/guide/essentials/component-basics.html",
  scenes: [
    {
      id: "component-s0",
      tick: "S0",
      title: "全部写在 App",
      goal: "列表能勾选。标记都挤在一个文件里。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": inlineApp },
        blocks: [{ id: "inline", label: "① 一项的标记在 App 里" }],
        narration: "能跑。但「一项长什么样」和「清单是什么」糊在一起。先问边界，再剪文件。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2", symbol: "todos" }],
        dom: [{ id: "list", label: "ul", value: "买牛奶 / 学组件" }],
        events: [{ id: "toggle", label: "change", value: "toggle(id)" }],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "todos", to: "dom" }],
      explanation: {
        headline: "先问边界，再剪文件",
        body: "组件不是为了「看起来专业」。是为了让「一项」有自己的输入和输出，而清单的真相仍只有一份。下一镜只创建文件，先不使用它。",
      },
      faqs: [
        { q: "为什么不直接复制到两个文件再 import？", a: "那样一次接了「有文件 / 被引用 / 传入数据」三条边。失败时你不知道缺的是哪一条。" },
        { q: "现在 toggle 写在哪？", a: "写在 App。拆组件之后，它仍应写在拥有 todos 的那一层。" },
      ],
      tryThis: "先勾选「学组件」，确认现在一切都挤在 App 里也能跑。记住这个能勾选的版本。",
    },
    {
      id: "component-s1",
      tick: "S1",
      title: "文件在，还没上场",
      goal: "写出 TodoItem.vue。App 一行不改。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "多了一个 TodoItem.vue，App 没 import。页面会？",
        choices: [
          { id: "use", label: "自动换成子组件外观", correct: false, why: "文件存在不等于被挂上。没有 import、没有标签，运行时看不到它。" },
          { id: "same", label: "完全不变", correct: true, why: "和当初 count 已创建、模板未读取是同一类：声明 ≠ 接入。" },
          { id: "err", label: "报错：未使用的组件", correct: false, why: "多余的文件不会让当前 App 爆炸。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": inlineApp,
          "src/TodoItem.vue": itemHardcoded,
        },
        blocks: [{ id: "file", label: "② 新建 TodoItem.vue（内容写死）" }],
        narration: "子文件里写死了「买牛奶」。还没人把它放进树。这一镜故意还没有 defineProps。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "仍由 App 渲染", symbol: "todos" }],
        dom: [{ id: "list", label: "ul", value: "仍是内联标记" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "script", label: "App.vue" },
        { id: "child", kind: "component", label: "TodoItem", detail: "未挂载", symbol: "TodoItem" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "app", to: "dom" }],
      explanation: {
        headline: "组件是节点，不是文件",
        body: "SFC 只是源。要成为运行时的一颗节点，必须被 import、被插进父模板。这一镜只做了源。内容写死，是为了下一镜让你看见：挂上了，不等于读到了循环里的 t。",
      },
      tryThis: "在文件树里找到 TodoItem.vue。右侧预览应和上一镜完全一样。",
      faqs: [
        { q: "为什么先写死，不先写 defineProps？", a: "先看见「挂上一个不会接收数据的组件」会长出两份相同的买牛奶。那和「声明了 props 却没传」是两种空白。" },
      ],
    },
    {
      id: "component-s2",
      tick: "S2",
      title: "挂上标签，内容仍写死",
      goal: "App 使用 <TodoItem />。子组件还不接收 props。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "v-for 里换成 <TodoItem />，子组件写死「买牛奶」。页面会？",
        choices: [
          { id: "same", label: "和原来一样：买牛奶 / 学组件，能勾选", correct: false, why: "子组件看不见 t。它每次都画出写死的买牛奶。父的 toggle 也没人调用。" },
          { id: "dup", label: "两行都是「买牛奶」，而且不能勾", correct: true, why: "循环只决定挂几次。每次挂上的是同一份写死的标记。" },
          { id: "err", label: "报错：子组件没用到 t", correct: false, why: "t 在父模板里合法存在，只是没被传下去。失败是静默的重复。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": usedHardcodedApp,
          "src/TodoItem.vue": itemHardcoded,
        },
        blocks: [
          { id: "import", label: "③ import TodoItem" },
          { id: "tag", label: "④ v-for 里挂 <TodoItem />" },
        ],
        narration: "组件树换了。请看右侧：两项都变成「买牛奶」。循环在转，数据没进去。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2（没传下去）", symbol: "todos" }],
        dom: [{ id: "item", label: "TodoItem × 2", value: "都是买牛奶" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "child", kind: "component", label: "TodoItem", detail: "写死", symbol: "TodoItem" },
        { id: "dom", kind: "dom", label: "DOM", detail: "两份买牛奶" },
      ],
      edges: [{ from: "child", to: "dom", label: "不读 props" }],
      why: {
        question: "v-for 明明循环了 t，为什么第二项不是「学组件」？",
        choices: [
          { id: "scope", label: "t 出不了父模板。子组件有自己的作用域", correct: true, why: "这就是边界。下一镜子声明要 todo、父仍不传——失败会变成空白，不是重复。" },
          { id: "key", label: "缺 :key", correct: false, why: "key 仍在 li 上。" },
          { id: "name", label: "组件必须叫 t 才能接到循环变量", correct: false, why: "名字无关。要显式传 props。" },
        ],
      },
      explanation: {
        headline: "挂上 ≠ 读到循环变量",
        body: "v-for 只决定创建几份子组件。每一份默认是孤立的。你现在看见的失败是「重复的买牛奶」。下一镜让子声明要 todo、父仍不传——失败会变成空白。两种脸，同一条缝：数据没过边界。",
      },
      tryThis: "看右侧两行是不是都叫「买牛奶」。点复选框——它是 disabled，点不动。",
      faqs: [
        { q: "父的 toggle 函数还在，为什么勾不了？", a: "内联标记已经换成子组件。子没有调用 toggle，复选框还 disabled。函数在，接线不在。" },
      ],
      mapping: [{ code: "<TodoItem />", runtime: "子节点 × 2，不读 t", ui: "买牛奶 / 买牛奶" }],
    },
    {
      id: "component-s3",
      tick: "S3",
      title: "声明要 todo，先不传",
      goal: "子组件改成 defineProps({ todo })。父仍然不写 :todo。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "子开始读取 todo.title，父仍写 <TodoItem />。两行「买牛奶」会？",
        choices: [
          { id: "keep", label: "还是两行买牛奶，因为父没改", correct: false, why: "子不再画写死的文字。它读 props.todo，而 todo 是 undefined。" },
          { id: "blank", label: "变成两个空行，控制台警告缺 required prop", correct: true, why: "声明了入口却没人送货。失败从「重复」变成「空白」。" },
          { id: "err", label: "整页崩溃", correct: false, why: "通常是警告 + 空内容，不是白屏。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": usedNoPropsApp,
          "src/TodoItem.vue": itemDisplay,
        },
        blocks: [{ id: "props", label: "⑤ defineProps({ todo })，仍不传" }],
        narration: "契约有了，管道没有。请看右侧：重复的买牛奶变成了空白。v-for 仍循环两次。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2（没传下去）", symbol: "todos" }],
        dom: [{ id: "item", label: "TodoItem", value: "todo 缺失" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "child", kind: "component", label: "TodoItem", symbol: "TodoItem" },
        { id: "dom", kind: "dom", label: "DOM", detail: "空壳" },
      ],
      edges: [{ from: "child", to: "dom", label: "没有 props" }],
      why: {
        question: "v-for 还在，为什么标题没了？",
        choices: [
          { id: "pipe", label: "循环只决定挂几次子组件。显示什么要靠 props", correct: true, why: "v-for 和 :todo 是两条边。这一镜只接了第一条。" },
          { id: "scope", label: "t 在子组件里自动可用", correct: false, why: "别名 t 出不了父模板。子组件看不到 t，除非你传。" },
          { id: "key", label: "缺 :key", correct: false, why: "key 仍在 li 上。" },
        ],
      },
      explanation: {
        headline: "挂上 ≠ 喂饱",
        body: "父模板的 t 不会泄漏进子组件。这是边界的意义。声明 props 只是开口。下一镜只补 :todo=\"t\"，仍不接事件——所以还是不能勾。",
      },
      tryThis: "对比上一镜：两行买牛奶变成了两个空壳。控制台若有 missing required prop，就是这一条缝。",
      faqs: [
        { q: "required: true 为什么没把页面炸掉？", a: "开发时会警告。运行时常常继续用 undefined 渲染。安静的空白比红屏难查。" },
        { q: "defineProps 写在子文件里，父会自动知道吗？", a: "不会。那是子的入口契约。父必须在模板里写 :todo=... 才会把值送进去。" },
      ],
      mapping: [{ code: "<TodoItem />", runtime: "子节点 × 2，props.todo 缺失", ui: "空行" }],
    },
    {
      id: "component-s4",
      tick: "S4",
      title: "只往下传 :todo",
      goal: "外观对了。写入还关着。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加上 :todo=\"t\" 之后，勾选复选框会？",
        choices: [
          { id: "ok", label: "照样切换完成态", correct: false, why: "这一版复选框是 disabled，而且没有把事件传回父级。" },
          { id: "dead", label: "能看见两项，但不能勾。显示在，写入不在", correct: true, why: "props 是往下的边。现在还没有往上的边。" },
          { id: "err", label: "报错：不能传对象", correct: false, why: "对象作为 prop 完全合法——这也是后面「改字段能跑」的伏笔。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": usedWithPropsApp,
          "src/TodoItem.vue": itemDisplay,
        },
        blocks: [{ id: "prop", label: "⑥ :todo=\"t\"" }],
        narration: "数据往下流了。父的 toggle 还在，但子没有调用它。disabled 是故意的路障。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2", symbol: "todos" }],
        dom: [{ id: "item", label: "TodoItem", value: "disabled checkbox" }],
        events: [],
      },
      nodes: [
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "child", kind: "component", label: "TodoItem", symbol: "TodoItem" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "todos", to: "child", label: "props.todo" },
        { from: "child", to: "dom" },
      ],
      explanation: {
        headline: "props 是只读契约",
        body: "父把一项交给子。子负责怎么画。谁改 todos，应该仍是拥有它的那一层。对象作为 prop 传的是引用——所以后面「偷偷改字段」才会看起来对。",
      },
      tryThis: "两项标题应该对了。试着勾选——disabled，点不动。这是故意的：数据下来了，事件还没上去。",
      faqs: [
        { q: "为什么传 t 而不是 t.title？", a: "一项有多个字段。传对象让子一次拿到 title 和 done。代价是：子拿到了引用，也就具备了改源的物理能力。协议要靠 emit 来约束。" },
        { q: "disabled 是 Vue 的吗？", a: "是原生 HTML。这里当路障，防止你以为「看起来能勾」就是协议已经接通。" },
      ],
      mapping: [{ code: '<TodoItem :todo="t" />', runtime: "props.todo", ui: "一行待办（不能勾）" }],
    },
    {
      id: "component-s5",
      tick: "S5",
      title: "子会喊，父没听",
      goal: "子组件 emit('toggle', id)。父暂时不写 @toggle。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "现在勾选，todos 会变吗？",
        choices: [
          { id: "yes", label: "会。emit 会自动改父数据", correct: false, why: "emit 只是发消息。没人监听，消息掉在地上。" },
          { id: "no", label: "不会。父没有 @toggle", correct: true, why: "和「有 ref、没人读」对称：有事件、没人接。" },
          { id: "dom", label: "只改复选框 DOM，数据也会变", correct: false, why: "复选框受 :checked 控制。父数据不变，勾选会被打回。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": parentNoListen,
          "src/TodoItem.vue": itemEmit,
        },
        blocks: [
          { id: "emits", label: "⑦ defineEmits(['toggle'])" },
          { id: "fire", label: "⑧ $emit('toggle', todo.id)" },
        ],
        narration: "往上的边从子这边长出来了。父的 toggle 函数还在，只是模板没握住。请勾选——它会被弹回。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "不变", symbol: "todos" }],
        events: [{ id: "emit", label: "emit", value: "toggle(id) → （无人听）" }],
        dom: [{ id: "item", label: "checkbox", value: "受控于 props" }],
      },
      nodes: [
        { id: "child", kind: "component", label: "TodoItem" },
        { id: "emit", kind: "event", label: "emit toggle" },
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
      ],
      edges: [{ from: "child", to: "emit" }],
      why: {
        question: "父明明写了 function toggle，为什么没用？",
        choices: [
          { id: "bind", label: "函数在，模板没写 @toggle=\"toggle\"，等于没接线", correct: true, why: "声明函数 ≠ 监听事件。和声明 ref ≠ 模板读取同一规则。" },
          { id: "name", label: "事件名必须是 onToggle 才能自动连上", correct: false, why: "那是部分 JSX / 某些约定。这里要显式 @toggle。" },
          { id: "id", label: "应该 emit 整个 todo 对象", correct: false, why: "传 id 或传对象都能工作。缺的不是载荷形状，是监听。" },
        ],
      },
      explanation: {
        headline: "emit 不是赋值",
        body: "它像 DOM 事件：发生了，不一定有监听者。defineEmits 只是声明「我会喊」。$emit 是喊。@toggle 才是听。三步里我们现在做了前两步。",
      },
      faqs: [
        { q: "为什么 emit id 而不是整个 todo？", a: "意图越窄越好：「切换这一项」。父拥有数组，自己去 find。传整个对象也能跑，但更容易在父里直接改这个引用——又绕回偷偷写入。" },
        { q: "勾选为什么会弹回？", a: "复选框受 :checked=\"todo.done\" 控制。父数据没变，下一轮渲染把勾选按回去。和列表课只绑 :checked 同一张脸。" },
      ],
      tryThis: "勾选「学组件」。它应弹回。X-Ray 里 todos[1].done 仍是 false。",
    },
    {
      id: "component-s6",
      tick: "S6",
      title: "父听了",
      goal: "只补 @toggle=\"toggle\"。因果链闭合。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "父加上 @toggle=\"toggle\" 之后，勾选「学组件」会？",
        choices: [
          { id: "ok", label: "留下勾选并划线。改数据的是 App.toggle", correct: true, why: "emit 被接住。父按 id 改自己的数组，props 再流下去。" },
          { id: "snap", label: "还是弹回，因为子不能改数据", correct: false, why: "子不改数据，但可以喊。父听了就会改。" },
          { id: "child", label: "子自己改了 todo.done", correct: false, why: "这一版子只 emit id。写入在父级。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": parentListen,
          "src/TodoItem.vue": itemEmit,
        },
        blocks: [{ id: "listen", label: "⑨ @toggle=\"toggle\"" }],
        narration: "现在可以勾选。改数据的仍是 App。请真的勾一下。",
      },
      replay: {
        label: "勾选第二项",
        steps: [
          { caption: "子 checkbox change", event: "change", highlight: ["child"] },
          { caption: "emit('toggle', 2)", highlight: ["emit"] },
          { caption: "父 toggle(2) → done true", highlight: ["todos"], state: { id: "todos", from: "false", to: "true" } },
          { caption: "props 往下流，DOM 划线", highlight: ["dom"] },
        ],
      },
      observe: {
        state: [{ id: "todos", label: "todos[1].done", value: "false → true", symbol: "todos" }],
        dom: [{ id: "item", label: "TodoItem", value: "学组件" }],
        events: [{ id: "emit", label: "toggle", value: "id" }],
      },
      nodes: [
        { id: "child", kind: "component", label: "TodoItem" },
        { id: "emit", kind: "event", label: "emit" },
        { id: "todos", kind: "ref", label: "todos", symbol: "todos" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "child", to: "emit" },
        { from: "emit", to: "todos", label: "父写入" },
        { from: "todos", to: "child", label: "props" },
        { from: "child", to: "dom" },
      ],
      explanation: {
        headline: "下 props，上 emit",
        body: "数据往下，意图往上。子组件变得可复用，是因为它不知道清单怎么存——它只要求「给我一项，我会喊」。下一镜把这条协议和「改引用」并排放。",
      },
      tryThis: "勾选「学组件」，确认划线留下。再取消。改数据的是 App，不是 TodoItem。",
      faqs: [
        { q: "@toggle=\"toggle\" 和 @toggle=\"toggle($event)\" 有何不同？", a: "前者把载荷原样交给函数，正好是 id。后者也行。不要写成 @toggle=\"toggle()\"——那会丢掉 id。" },
      ],
    },
    {
      id: "component-s7",
      tick: "S7",
      title: "直接改 prop 呢？",
      goal: "两条路界面都可以对。图不一样。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "子组件写 todo.done = !todo.done，不 emit。勾选后界面会？",
        choices: [
          { id: "fail", label: "不动。prop 是只读的", correct: false, why: "对象 prop 是引用。改字段常常能驱动更新——所以这才危险。" },
          { id: "work", label: "会动。但这是偷偷改了父的对象", correct: true, why: "看起来对，边界没了。父不知道谁改的，子也无法用在不可变数据上。" },
          { id: "err", label: "Vue 会抛错拦住", correct: false, why: "改 prop 对象的字段通常只是警告或沉默，不是硬错误。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": parentListen,
          "src/TodoItem.vue": itemEmit,
        },
        blocks: [{ id: "keep", label: "emit 版本先留着" }],
        narration: "打开两个世界：发消息 vs 改引用。再看「父不监听」这种干净的失败。",
      },
      observe: {
        state: [{ id: "todos", label: "todos", value: "2", symbol: "todos" }],
        events: [],
        dom: [],
      },
      nodes: worldEmit.nodes,
      edges: worldEmit.edges,
      counterfactual: {
        id: "emit-vs-mutate",
        title: "emit vs 改 prop",
        setup: "同一勾选。两种内部图。",
        worlds: [worldEmit, worldMutate],
        punchline:
          "两边勾选都可能成功。你不能用「页面看起来对不对」来选边界。mutate 让子组件拥有了它不该拥有的写入。",
      },
      ablations: [
        {
          id: "mutate-prop",
          prompt: "如果子直接改 todo.done？",
          files: {
            "src/App.vue": parentListen,
            "src/TodoItem.vue": mutateProp,
          },
          expected: {
            kind: "stale",
            message: "界面往往仍会更新。失败是架构上的：写入绕过了父，协议消失了。",
          },
          lesson: "能跑 ≠ 边界正确。props 下行、emit 上行，是为了以后还能换存储、换不可变更新。",
        },
        {
          id: "no-listen",
          prompt: "如果父不写 @toggle？",
          files: {
            "src/App.vue": parentNoListen,
            "src/TodoItem.vue": itemEmit,
          },
          expected: {
            kind: "stale",
            message: "勾选被 :checked 打回。事件发生了，没有写入。这是干净的失败。",
          },
          lesson: "协议缺了一半。比偷偷成功更好修。",
        },
        {
          id: "emit-object",
          prompt: "如果 emit 整个 todo 对象？",
          files: {
            "src/App.vue": parentListen,
            "src/TodoItem.vue": emitWholeTodo,
          },
          expected: {
            kind: "stale",
            message: "父的 toggle(id) 会拿到对象，find 对不上 id，勾选失效。载荷形状也是协议的一部分。",
          },
          lesson: "emit 的载荷必须和监听函数的参数对上。传错形状，和没监听一样静默。",
        },
      ],
      explanation: {
        headline: "共享引用不是协议",
        body: "JavaScript 把对象当引用传来传去。Vue 不会因此帮你维持单向数据流。协议要你自己写出来：传什么、喊什么、谁来写。",
      },
      tryThis: "先打开反事实：两边都勾选，看图。再试三种消融：改 prop、不监听、emit 整个对象。",
    },
    {
      id: "component-s8",
      tick: "S8",
      title: "换：喜欢按钮",
      goal: "抽出 LikeButton。liked 最该住在哪？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "抽出 LikeButton 之后，liked 最该住在？",
        choices: [
          { id: "parent", label: "父级：props 往下，emit 往上", correct: true, why: "和 TodoItem 同一张图。按钮不拥有业务状态。" },
          { id: "child", label: "子组件自己 ref(false)", correct: false, why: "父就再也读不到「喜欢了没有」，也无法持久化。" },
          { id: "both", label: "两边各存一份，watch 同步", correct: false, why: "那是 watch 课里已经拆过的假同步。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": likeBefore },
        blocks: [{ id: "like", label: "换场景：喜欢" }],
        narration: "先是一个内联按钮。判断抽出去之后状态住哪。不要只想着「再做一个文件」。",
      },
      observe: {
        state: [{ id: "liked", label: "liked", value: "false", symbol: "liked" }],
        dom: [{ id: "btn", label: "button", value: "喜欢" }],
        events: [],
      },
      nodes: [
        { id: "liked", kind: "ref", label: "liked", symbol: "liked" },
        { id: "dom", kind: "dom", label: "button" },
      ],
      edges: [{ from: "liked", to: "dom" }],
      ablations: [
        {
          id: "extract",
          prompt: "抽成 LikeButton 之后？",
          files: {
            "src/App.vue": likeAfter,
            "src/LikeButton.vue": likeButton,
          },
          expected: {
            kind: "stale",
            message: "这是修复：按钮可复用，liked 仍在父级。点击走 emit。布尔 prop 不是对象，子想偷偷改 liked = true 也改不到父的那一份——这和对象 prop 不同。",
          },
          lesson: "TodoItem 和 LikeButton 是同一个结构：外观在子，真相在父。布尔传的是值，对象传的是引用。",
        },
      ],
      why: {
        question: "为什么布尔 prop 比对象 prop 更难「偷偷改」？",
        choices: [
          { id: "value", label: "布尔是值拷贝；对象是引用", correct: true, why: "子里 liked = !liked 只改了局部绑定，写不回父。todo.done = 却能打到父的数组里。" },
          { id: "bool", label: "Vue 对 Boolean prop 做了特殊只读保护", correct: false, why: "没有这种魔法。是 JavaScript 的值 vs 引用。" },
          { id: "emit", label: "布尔必须 emit，对象可以不 emit", correct: false, why: "两边都该 emit。对象只是让错误能跑起来。" },
        ],
      },
      explanation: {
        headline: "组件切的是边界，不是文件数",
        body: "你会不会写 defineProps 不重要。重要的是换一个按钮，你仍能指出数据该停在哪一层。下一镜才轮到插槽：把「里面是什么」也交给父。",
      },
      tryThis: "先点内联按钮确认它能切换。再打开「抽成 LikeButton」：liked 仍在父级，点击走 emit。",
    },
  ],
};
