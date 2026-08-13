import type { CausalLab, CounterfactualWorld } from "../types";

const headerProps = `<script setup>
defineProps({ user: { type: String, required: true } })
</script>
<template>
  <p class="who">你好，{{ user }}</p>
</template>
`;

const shellProps = `<script setup>
import Header from './Header.vue'
defineProps({ user: { type: String, required: true } })
</script>
<template>
  <div class="panel">
    <p class="hint">Shell · 中间层</p>
    <Header :user="user" />
  </div>
</template>
`;

const appDrill = `<script setup>
import { ref } from 'vue'
import Shell from './Shell.vue'
const user = ref('Ada')
</script>
<template>
  <p class="hint">App 持有 user</p>
  <Shell :user="user" />
  <button @click="user = user === 'Ada' ? 'Lin' : 'Ada'">换人</button>
</template>
`;

const shellNoPass = `<script setup>
import Header from './Header.vue'
defineProps({ user: { type: String, required: true } })
</script>
<template>
  <div class="panel">
    <p class="hint">Shell · 不再往下传</p>
    <Header />
  </div>
</template>
`;

const headerMissing = `<script setup>
defineProps({ user: { type: String, default: '游客' } })
</script>
<template>
  <p class="who">你好，{{ user }}</p>
</template>
`;

const appProvideUnused = `<script setup>
import { ref, provide } from 'vue'
import Shell from './Shell.vue'
const user = ref('Ada')
provide('user', user)
</script>
<template>
  <p class="hint">App provide('user') · Shell 仍不传 props</p>
  <Shell :user="user" />
  <button @click="user = user === 'Ada' ? 'Lin' : 'Ada'">换人</button>
</template>
`;

const headerInject = `<script setup>
import { inject } from 'vue'
const user = inject('user', '游客')
</script>
<template>
  <p class="who">你好，{{ user }}</p>
</template>
`;

const shellIgnore = `<script setup>
import Header from './Header.vue'
</script>
<template>
  <div class="panel">
    <p class="hint">Shell · 不声明 user</p>
    <Header />
  </div>
</template>
`;

const appProvide = `<script setup>
import { ref, provide } from 'vue'
import Shell from './Shell.vue'
const user = ref('Ada')
provide('user', user)
</script>
<template>
  <p class="hint">App provide('user', user)</p>
  <Shell />
  <button @click="user = user === 'Ada' ? 'Lin' : 'Ada'">换人</button>
</template>
`;

const headerWrongKey = `<script setup>
import { inject } from 'vue'
const user = inject('usr', '游客')
</script>
<template>
  <p class="who">你好，{{ user }}</p>
</template>
`;

const appProvideValue = `<script setup>
import { ref, provide } from 'vue'
import Shell from './Shell.vue'
const user = ref('Ada')
provide('user', user.value)
</script>
<template>
  <p class="hint">provide('user', user.value) · 只交出当前字符串</p>
  <Shell />
  <button @click="user = user === 'Ada' ? 'Lin' : 'Ada'">换人</button>
</template>
`;

const shellShadow = `<script setup>
import { provide } from 'vue'
import Header from './Header.vue'
provide('user', '（被 Shell 盖住）')
</script>
<template>
  <div class="panel">
    <p class="hint">Shell provide 了另一份 user</p>
    <Header />
  </div>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const theme = ref('dark')
</script>
<template>
  <p class="stats">主题 {{ theme }}</p>
  <button @click="theme = theme === 'dark' ? 'light' : 'dark'">切换</button>
</template>
`;

const themeBox = `<script setup>
import { inject } from 'vue'
const theme = inject('theme', 'unset')
</script>
<template>
  <p class="stats">盒子主题 {{ theme }}</p>
</template>
`;

const themeAppBad = `<script setup>
import { ref, provide } from 'vue'
import Box from './Box.vue'
const theme = ref('dark')
provide('theme', theme.value)
</script>
<template>
  <p class="hint">App 主题 {{ theme }}</p>
  <Box />
  <button @click="theme = theme === 'dark' ? 'light' : 'dark'">切换</button>
</template>
`;

const themeAppGood = `<script setup>
import { ref, provide } from 'vue'
import Box from './Box.vue'
const theme = ref('dark')
provide('theme', theme)
</script>
<template>
  <p class="hint">App 主题 {{ theme }}</p>
  <Box />
  <button @click="theme = theme === 'dark' ? 'light' : 'dark'">切换</button>
</template>
`;

const worldDrill: CounterfactualWorld = {
  id: "drill",
  name: "层层 props",
  tagline: "Shell 必须认识 user 才能路过",
  files: {
    "src/App.vue": appDrill,
    "src/Shell.vue": shellProps,
    "src/Header.vue": headerProps,
  },
  nodes: [
    { id: "app", kind: "component", label: "App" },
    { id: "shell", kind: "component", label: "Shell" },
    { id: "header", kind: "component", label: "Header" },
  ],
  edges: [
    { from: "app", to: "shell", label: "props" },
    { from: "shell", to: "header", label: "props" },
  ],
  note: "中间层并不关心 user。它只是管道。管道会钻。",
};

const worldProvide: CounterfactualWorld = {
  id: "provide",
  name: "provide / inject",
  tagline: "Shell 不再声明 user",
  files: {
    "src/App.vue": appProvide,
    "src/Shell.vue": shellIgnore,
    "src/Header.vue": headerInject,
  },
  nodes: [
    { id: "app", kind: "component", label: "App provide" },
    { id: "header", kind: "component", label: "Header inject" },
  ],
  edges: [{ from: "app", to: "header", label: "跳过 Shell" }],
  note: "祖先提供。后代注入。中间层可以不认识这份数据。",
};

export const PROVIDE_LAB: CausalLab = {
  id: "provide",
  world: 5,
  concept: "provide-inject",
  title: "不必路过的中间层",
  subtitle: "provide 是祖先交出来的源。inject 是后代伸手。中间人可以不认识这份数据。",
  promise:
    "一镜一条边：先 props 钻过 Shell，再中间层不传，再 provide 却不 inject，再接上 inject，再交错 key，再 provide 一个冻结的字符串。",
  minutes: 16,
  official: "/guide/components/provide-inject.html",
  scenes: [
    {
      id: "provide-s0",
      tick: "S0",
      title: "user 要路过 Shell",
      goal: "App → Shell → Header。每一层都声明 props。",
      layer: "see",
      fading: 1,
      mutation: {
        files: {
          "src/App.vue": appDrill,
          "src/Shell.vue": shellProps,
          "src/Header.vue": headerProps,
        },
        blocks: [{ id: "drill", label: "① 三层 props" }],
        narration: "点「换人」。Ada / Lin 能传到 Header。Shell 自己并不展示名字——它只是管道。",
      },
      observe: {
        state: [{ id: "user", label: "user", value: "Ada", symbol: "user" }],
        dom: [{ id: "who", label: "Header", value: "你好，Ada" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "component", label: "App" },
        { id: "shell", kind: "component", label: "Shell" },
        { id: "header", kind: "component", label: "Header" },
      ],
      edges: [
        { from: "app", to: "shell", label: "props" },
        { from: "shell", to: "header", label: "props" },
      ],
      explanation: {
        headline: "中间层被迫认识数据",
        body: "Shell 不关心 user，却必须声明它。十层布局就会钻。下一镜 Shell 停止往下传——只断这一条边。",
      },
      tryThis: "点「换人」。Header 应跟着变。打开 Shell.vue：它只是把 user 再递出去。",
    },
    {
      id: "provide-s1",
      tick: "S1",
      title: "中间层不传了",
      goal: "Shell 仍收 props，不再给 Header。Header 用默认「游客」。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "App 仍传 :user。Header 收不到。点换人，问候会？",
        choices: [
          { id: "ada", label: "仍是 Ada，再变成 Lin", correct: false, why: "Header 不再接到 props。默认游客。换人改的是 App 那一份。" },
          { id: "guest", label: "冻在「游客」", correct: true, why: "管道在 Shell 断了。和 Stats 写死数字同一类缝。" },
          { id: "err", label: "报错：缺 required prop", correct: false, why: "这一版 Header 给了 default。静默游客。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appDrill,
          "src/Shell.vue": shellNoPass,
          "src/Header.vue": headerMissing,
        },
        blocks: [{ id: "cut", label: "② Shell 不再 :user" }],
        narration: "请换人。Header 应一直是游客。App 明明还持有 Ada/Lin。",
      },
      observe: {
        state: [
          { id: "app", label: "App.user", value: "Ada/Lin", symbol: "user" },
          { id: "h", label: "Header.user", value: "游客" },
        ],
        dom: [{ id: "who", label: "Header", value: "你好，游客" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "component", label: "App" },
        { id: "shell", kind: "component", label: "Shell", detail: "断了" },
        { id: "header", kind: "component", label: "Header" },
      ],
      edges: [{ from: "app", to: "shell" }],
      explanation: {
        headline: "钻，是因为中间层必须经手",
        body: "下一镜 App 调用 provide('user', user)。Header 仍不 inject——provide 存在但不接入。",
      },
      tryThis: "换人。问候必须仍是游客。",
    },
    {
      id: "provide-s2",
      tick: "S2",
      title: "provide 了，没有人 inject",
      goal: "App provide('user', user)。Header 仍吃默认 props。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "祖先已经 provide。Header 仍用 props 默认值。问候会？",
        choices: [
          { id: "ada", label: "变成 Ada。provide 会自动灌进同名 prop", correct: false, why: "provide 不是 props。要 inject，或继续传 props。" },
          { id: "guest", label: "仍是游客", correct: true, why: "声明 ≠ 接入。和 createPinia 没人 use、RouterView 没挂同一张脸。" },
          { id: "err", label: "报错：provide 未被消费", correct: false, why: "合法。静默无用。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appProvideUnused,
          "src/Shell.vue": shellNoPass,
          "src/Header.vue": headerMissing,
        },
        blocks: [{ id: "p", label: "③ provide('user')（无人 inject）" }],
        narration: "源交出来了。没有人伸手。请再换人，问候仍应是游客。",
      },
      observe: {
        state: [{ id: "user", label: "provided user", value: "未被读取", symbol: "user" }],
        dom: [{ id: "who", label: "Header", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "component", label: "provide", symbol: "provide" },
        { id: "header", kind: "component", label: "props 默认" },
      ],
      edges: [],
      explanation: {
        headline: "交出来 ≠ 接到",
        body: "下一镜 Header 只改一行：inject('user', '游客')。Shell 可以不再认识 user。",
      },
      tryThis: "打开 App.vue 确认有 provide。预览仍是游客。",
    },
    {
      id: "provide-s3",
      tick: "S3",
      title: "Header 伸手 inject",
      goal: "inject('user')。Shell 不再声明 user。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点换人。问候会？",
        choices: [
          { id: "ok", label: "Ada ↔ Lin。跳过了 Shell", correct: true, why: "inject 读到的是那份 ref。换人改源，Header 订阅同一份。" },
          { id: "guest", label: "仍是游客，因为中间层没传", correct: false, why: "中间层正是要跳过的。管道不再需要。" },
          { id: "once", label: "第一次是 Ada，换人不变", correct: false, why: "那是 provide 了 user.value。下一镜才拆反应性。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appProvide,
          "src/Shell.vue": shellIgnore,
          "src/Header.vue": headerInject,
        },
        blocks: [{ id: "inj", label: "④ inject('user')" }],
        narration: "请换人。Header 必须跟着变。打开 Shell.vue：里面没有 user。",
      },
      observe: {
        state: [{ id: "user", label: "user", value: "同一份 ref", symbol: "user" }],
        dom: [{ id: "who", label: "Header", value: "跟着换" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "component", label: "provide", symbol: "provide" },
        { id: "header", kind: "component", label: "inject", symbol: "inject" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "app", to: "header", label: "跳过 Shell" },
        { from: "header", to: "dom" },
      ],
      counterfactual: {
        id: "drill-vs-provide",
        title: "路过 vs 跳过",
        setup: "同一份 Ada。差在 Shell 是否必须经手。",
        worlds: [worldDrill, worldProvide],
        punchline: "名字两边一样。管道完全不同。provide 的第一条边是：中间层可以不认识这份数据。",
      },
      explanation: {
        headline: "祖先给源，后代读取",
        body: "和模块顶层 ref 同一类共享，只是范围限在这棵子树。下一镜 inject 写错 key。",
      },
      tryThis: "换人。打开反事实对比层层 props。再看 Shell 里没有 user。",
      mapping: [{ code: "provide('user', user) / inject('user')", runtime: "子树内同一份 ref", ui: "问候跟着变" }],
      faqs: [
        { q: "和 Pinia 有什么差别？", a: "Pinia 是应用级、有 id、要安装插件。provide 是这棵子树的祖先。跨路由、跨无关分支，用 store。" },
      ],
    },
    {
      id: "provide-s4",
      tick: "S4",
      title: "key 写错",
      goal: "inject('usr')。provide 的是 'user'。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "key 对不上。问候会？",
        choices: [
          { id: "ada", label: "仍是 Ada。名字差不多就行", correct: false, why: "key 是字符串契约。usr ≠ user。" },
          { id: "guest", label: "落到默认值「游客」", correct: true, why: "inject 找不到，就用第二个参数。静默。和 params.todoId 读错同一类。" },
          { id: "err", label: "报错：未知的 injection", correct: false, why: "有默认值时不报错。这正是它危险的原因。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appProvide,
          "src/Shell.vue": shellIgnore,
          "src/Header.vue": headerWrongKey,
        },
        blocks: [{ id: "key", label: "⑤ inject('usr')" }],
        narration: "请换人。问候应冻在游客。源还在，伸手伸错了抽屉。",
      },
      observe: {
        state: [{ id: "user", label: "inject('usr')", value: "游客（默认）" }],
        dom: [{ id: "who", label: "Header", value: "你好，游客" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "component", label: "provide('user')" },
        { id: "header", kind: "component", label: "inject('usr')" },
      ],
      edges: [],
      explanation: {
        headline: "key 是契约",
        body: "官方建议用 Symbol 当 key，就是为了少写错字。下一镜 key 对了，却 provide 了 user.value——交出一个冻结的字符串。",
      },
      tryThis: "换人。必须仍是游客。对比 Header 里的 'usr' 和 App 里的 'user'。",
    },
    {
      id: "provide-s5",
      tick: "S5",
      title: "provide 了 .value，不再响应",
      goal: "provide('user', user.value)。inject 拿到字符串。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "第一帧是 Ada。点换人。问候会？",
        choices: [
          { id: "lin", label: "变成 Lin", correct: false, why: "交出去的是当时的字符串 'Ada'。不是那份 ref。" },
          { id: "ada", label: "冻在 Ada。App 自己那一行会变", correct: true, why: "两份真相。祖先还是响应式。后代拿到的是快照。" },
          { id: "guest", label: "变成游客", correct: false, why: "第一帧 inject 成功，拿到了 'Ada'。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appProvideValue,
          "src/Shell.vue": shellIgnore,
          "src/Header.vue": headerInject,
        },
        blocks: [{ id: "val", label: "⑥ provide('user', user.value)" }],
        narration: "请看第一帧是 Ada。再换人。上面的 hint 会变，问候不应变。",
      },
      observe: {
        state: [
          { id: "src", label: "App.user", value: "会变", symbol: "user" },
          { id: "inj", label: "inject", value: "'Ada' 快照" },
        ],
        dom: [{ id: "who", label: "Header", value: "冻在 Ada" }],
        events: [],
      },
      nodes: [
        { id: "ref", kind: "ref", label: "user ref", symbol: "user" },
        { id: "str", kind: "script", label: "字符串快照" },
        { id: "header", kind: "component", label: "Header" },
      ],
      edges: [{ from: "str", to: "header" }],
      why: {
        question: "为什么要 provide 那份 ref，而不是 .value？",
        choices: [
          { id: "sub", label: "后代需要订阅同一份源。字符串没有订阅", correct: true, why: "provide(key, ref) 让 inject 拿到 ref（模板里仍自动解包）。provide(key, ref.value) 只交出一次值。" },
          { id: "vue", label: "Vue 3 禁止 provide 字符串", correct: false, why: "允许。常量主题可以。会变的值不行。" },
          { id: "name", label: "必须和 props 同名", correct: false, why: "key 任意。反应性来自你交的是不是 ref / computed。" },
        ],
      },
      explanation: {
        headline: "交源，不要交快照",
        body: "和 todos.value = await 同一判断：名字要对上那一份会变的盒子。下一镜中间层自己 provide，把祖先盖住。",
      },
      tryThis: "换人。App 那一行变成 Lin，问候仍是 Ada。",
      mapping: [{ code: "provide('user', user.value)", runtime: "一次性字符串", ui: "冻住" }],
    },
    {
      id: "provide-s6",
      tick: "S6",
      title: "拆掉 inject / 写错 key / 中间层盖住",
      goal: "三种坏法：没伸手、伸错抽屉、更近的祖先抢源。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "Shell 也 provide('user', '被盖住')。Header inject 会拿到？",
        choices: [
          { id: "ada", label: "Ada。App 更顶层，优先", correct: false, why: "inject 找最近的祖先。Shell 更近。" },
          { id: "cover", label: "「被 Shell 盖住」。近的赢", correct: true, why: "和 CSS 就近原则一样。覆盖是显式的，也可能是事故。" },
          { id: "err", label: "报错：重复 provide", correct: false, why: "合法。用来做局部覆盖，比如在某个面板里换一套主题。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appProvide,
          "src/Shell.vue": shellIgnore,
          "src/Header.vue": headerInject,
        },
        blocks: [{ id: "keep", label: "正确版本先留着" }],
        narration: "先换人确认问候跟着走。再拆 inject、写错 key、让 Shell 盖住。",
      },
      observe: {
        state: [{ id: "ok", label: "user", value: "子树共享" }],
        dom: [{ id: "who", label: "Header", value: "跟着变" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "component", label: "provide" },
        { id: "header", kind: "component", label: "inject" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "app", to: "header" },
        { from: "header", to: "dom" },
      ],
      ablations: [
        {
          id: "noinj",
          prompt: "如果 Header 不 inject？",
          files: {
            "src/App.vue": appProvideUnused,
            "src/Shell.vue": shellNoPass,
            "src/Header.vue": headerMissing,
          },
          expected: { kind: "stale", message: "问候是游客。provide 闲置。" },
          lesson: "交出来还要有人伸手。",
        },
        {
          id: "key",
          prompt: "如果 key 写成 usr？",
          files: {
            "src/App.vue": appProvide,
            "src/Shell.vue": shellIgnore,
            "src/Header.vue": headerWrongKey,
          },
          expected: { kind: "stale", message: "落到默认游客。契约对不上。" },
          lesson: "key 是名字。写错就等于没 provide。",
        },
        {
          id: "shadow",
          prompt: "如果 Shell 盖住 user？",
          files: {
            "src/App.vue": appProvide,
            "src/Shell.vue": shellShadow,
            "src/Header.vue": headerInject,
          },
          expected: { kind: "stale", message: "问候变成「被 Shell 盖住」。换人也不改。近的祖先赢。" },
          lesson: "inject 就近。覆盖有用，也可能是事故。",
        },
      ],
      explanation: {
        headline: "子树里的最近源",
        body: "没伸手、伸错、被更近的盖住，脸都是错名字。下一课 KeepAlive 会问：切走的组件是睡了还是死了。",
      },
      tryThis: "三种消融都换一次人。游客、游客、被盖住，对上号再恢复。",
    },
    {
      id: "provide-s7",
      tick: "S7",
      title: "换：主题",
      goal: "App 有 theme。深处的盒子也要跟着切。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "provide('theme', theme.value) 之后点切换。盒子会？",
        choices: [
          { id: "follow", label: "跟着变成 light", correct: false, why: "交的是快照。和 user.value 同一镜。" },
          { id: "stuck", label: "冻在 dark。App 自己那一行会变", correct: true, why: "你会的：交 ref，不要交 .value。" },
          { id: "err", label: "报错", correct: false, why: "能跑。只是后代订阅断了。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "theme", label: "换场景：主题" }],
        narration: "先是同一个文件里的 theme。想清楚交到子树之后，交的是源还是快照。",
      },
      observe: {
        state: [{ id: "theme", label: "theme", value: "dark", symbol: "theme" }],
        dom: [{ id: "p", label: "p", value: "主题 dark" }],
        events: [],
      },
      nodes: [
        { id: "theme", kind: "ref", label: "theme", symbol: "theme" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "theme", to: "dom" }],
      ablations: [
        {
          id: "snap",
          prompt: "provide(.value) 到盒子？",
          files: {
            "src/App.vue": themeAppBad,
            "src/Box.vue": themeBox,
          },
          expected: { kind: "stale", message: "切换后 App 变了，盒子冻在 dark。" },
          lesson: "快照不是源。",
        },
        {
          id: "ref",
          prompt: "provide(theme) 那份 ref 之后？",
          files: {
            "src/App.vue": themeAppGood,
            "src/Box.vue": themeBox,
          },
          expected: { kind: "stale", message: "这是修复：切换一次，两行一起变。user 和 theme 是同一张图。" },
          lesson: "user 和 theme 是同一张图。下一课：切走的面板，实例还在不在。",
        },
      ],
      explanation: {
        headline: "provide 的身份是「子树内的源」",
        body: "props 路过。store 全应用。provide 在这两者中间：这棵子树的后代可以伸手，别人看不见。",
      },
      tryThis: "先在同一文件切换。再分别试快照版和 ref 版。",
    },
  ],
};
