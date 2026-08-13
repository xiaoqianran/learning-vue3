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

const unusedChildApp = `<script setup>
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

const usedChildApp = `<script setup>
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
    <input type="checkbox" :checked="todo.done" @change="$emit('toggle', todo.id)" />
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
    <input type="checkbox" :checked="todo.done" @change="todo.done = !todo.done" />
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
  name: "emit",
  tagline: "子通知，父改数据",
  files: {
    "src/App.vue": parentListen,
    "src/TodoItem.vue": itemEmit,
  },
  nodes: [
    { id: "child", kind: "component", label: "TodoItem" },
    { id: "emit", kind: "event", label: "emit toggle" },
    { id: "todos", kind: "ref", label: "todos" },
    { id: "dom", kind: "dom", label: "DOM" },
  ],
  edges: [
    { from: "child", to: "emit" },
    { from: "emit", to: "todos", label: "父写入" },
    { from: "todos", to: "dom" },
  ],
  note: "子组件不拥有 todos。它只发出意图。真相留在父级。",
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
  promise: "看见 props 往下、emit 往上——以及直接改 prop 为什么常常能跑、却把边界撕掉。",
  minutes: 16,
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
        narration: "能跑。但「一项长什么样」和「清单是什么」糊在一起。",
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
        body: "组件不是为了「看起来专业」。是为了让「一项」有自己的输入和输出，而清单的真相仍只有一份。下一镜先创建文件，先不使用它。",
      },
    },
    {
      id: "component-s1",
      tick: "S1",
      title: "文件在，还没上场",
      goal: "写出 TodoItem.vue。App 暂不引用。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "多了一个 TodoItem.vue，但 App 没 import。页面会？",
        choices: [
          { id: "use", label: "自动换成子组件外观", correct: false, why: "文件存在不等于被挂上。没有 import、没有标签，运行时看不到它。" },
          { id: "same", label: "完全不变", correct: true, why: "和当初 count 已创建、模板未读取是同一类：声明 ≠ 接入。" },
          { id: "err", label: "报错：未使用的组件", correct: false, why: "多余的文件不会让当前 App 爆炸。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": unusedChildApp,
          "src/TodoItem.vue": itemDisplay,
        },
        blocks: [
          { id: "file", label: "① 新建 TodoItem.vue" },
          { id: "props", label: "② defineProps({ todo })" },
        ],
        narration: "子组件会显示一项，但还没人把它放进树里。",
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
        body: "SFC 只是源。要成为运行时的一颗节点，必须被创建、被传入 props、被插进父模板。这一镜只做了源。",
      },
    },
    {
      id: "component-s2",
      tick: "S2",
      title: "挂上，只往下传",
      goal: "App 使用 <TodoItem :todo=\"t\" />。先不监听事件。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "换成子组件后，勾选复选框会？",
        choices: [
          { id: "ok", label: "照样切换完成态", correct: false, why: "这一版复选框是 disabled，而且没有把事件传回父级。" },
          { id: "dead", label: "不能勾。显示在，写入不在", correct: true, why: "props 是往下的边。现在还没有往上的边。" },
          { id: "err", label: "报错：不能传对象", correct: false, why: "对象作为 prop 完全合法——这也是下一镜的陷阱。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": usedChildApp,
          "src/TodoItem.vue": itemDisplay,
        },
        blocks: [
          { id: "import", label: "③ import TodoItem" },
          { id: "use", label: "④ <TodoItem :todo=\"t\" />" },
        ],
        narration: "外观搬进了子组件。清单和 toggle 仍在父级，只是暂时没接到。",
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
      why: {
        question: "为什么看起来像一项，却勾不了？",
        choices: [
          { id: "oneway", label: "只接了向下的 props，没有向上的 emit", correct: true, why: "组件边界把事件留在了子树内部，而内部又禁用了输入。" },
          { id: "key", label: "缺 :key", correct: false, why: "key 仍在 v-for 的 li 上。" },
          { id: "ref", label: "todo 不是 ref", correct: false, why: "传入的是响应式对象。缺的是事件协议。" },
        ],
      },
      explanation: {
        headline: "props 是只读契约",
        body: "父把一项的快照（其实是引用）交给子。子负责怎么画。谁改 todos，应该仍是拥有它的那一层。",
      },
      mapping: [
        { code: '<TodoItem :todo="t" />', runtime: "props.todo", ui: "一行待办" },
      ],
    },
    {
      id: "component-s3",
      tick: "S3",
      title: "子会喊，父没听",
      goal: "子组件 emit('toggle')。父暂时不写 @toggle。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "现在勾选，todos 会变吗？",
        choices: [
          { id: "yes", label: "会。emit 会自动改父数据", correct: false, why: "emit 只是发消息。没人监听，消息掉在地上。" },
          { id: "no", label: "不会。父没有 @toggle", correct: true, why: "和「有 ref、没人读」对称：有事件、没人接。" },
          { id: "dom", label: "只改复选框 DOM，刷新后还原", correct: false, why: "复选框受 :checked 控制。父数据不变，勾选会被打回。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": parentNoListen,
          "src/TodoItem.vue": itemEmit,
        },
        blocks: [{ id: "emit", label: "⑤ defineEmits + $emit" }],
        narration: "往上的边从子这边长出来了。父还没握住。",
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
      explanation: {
        headline: "emit 不是赋值",
        body: "它像 DOM 事件：发生了，不一定有监听者。组件通信是协议，不是共享变量的隐式魔术。",
      },
    },
    {
      id: "component-s4",
      tick: "S4",
      title: "父听了",
      goal: "接上 @toggle=\"toggle\"。因果链闭合。",
      layer: "see",
      fading: 2,
      mutation: {
        files: {
          "src/App.vue": parentListen,
          "src/TodoItem.vue": itemEmit,
        },
        blocks: [{ id: "listen", label: "⑥ @toggle=\"toggle\"" }],
        narration: "现在可以勾选。改数据的仍是 App。",
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
        body: "数据往下，意图往上。子组件变得可复用，是因为 vis 不知道清单怎么存——它只要求「给我一项，我会喊」。",
      },
      faqs: [
        { q: "为什么不在子组件里改 todos？", a: "子拿不到那份数组，也不该拿。否则每一项都变成仓库，清单会有很多份真相。" },
      ],
    },
    {
      id: "component-s5",
      tick: "S5",
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
        narration: "打开两个世界：发消息 vs 改引用。",
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
            message: "勾选被 :checked 打回。事件发生了，没有写入。",
          },
          lesson: "这是干净的失败：协议缺了一半。比偷偷成功更好修。",
        },
      ],
      explanation: {
        headline: "共享引用不是协议",
        body: "JavaScript 把对象当引用传来传去。Vue 不会因此帮你维持单向数据流。协议要你自己写出来。",
      },
    },
    {
      id: "component-s6",
      tick: "S6",
      title: "换：喜欢按钮",
      goal: "把喜欢按钮抽成组件。状态该留在哪？",
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
        narration: "先是一个内联按钮。判断抽出去之后状态住哪。",
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
            message: "这是修复：按钮可复用，liked 仍在父级。点击走 emit。",
          },
          lesson: "TodoItem 和 LikeButton 是同一个结构：外观在子，真相在父。",
        },
      ],
      explanation: {
        headline: "组件切的是边界，不是文件数",
        body: "你会不会写 defineProps 不重要。重要的是换一个按钮，你仍能指出数据该停在哪一层。下一镜才轮到插槽：把「里面是什么」也交给父。",
      },
    },
  ],
};
