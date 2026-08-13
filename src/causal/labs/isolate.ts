import type { CausalLab } from "../types";

const sessionSingleton = `import { ref } from 'vue'

export const user = ref('游客')

export function login(name) {
  user.value = name
}
`;

const sessionFactoryOnce = `import { reactive } from 'vue'

export function createSession() {
  const session = reactive({
    user: '游客',
    login(name) {
      session.user = name
    },
  })
  return session
}

export const session = createSession()
`;

const sessionFactory = `import { reactive } from 'vue'

export function createSession() {
  const session = reactive({
    user: '游客',
    login(name) {
      session.user = name
    },
  })
  return session
}
`;

const onePanel = `<script setup>
import { user, login } from './session.js'
</script>
<template>
  <div class="panel">
    <h3>请求 A</h3>
    <p class="who">{{ user }}</p>
    <button @click="login('Ada')">登录 Ada</button>
  </div>
</template>
`;

const twoShared = `<script setup>
import { user, login } from './session.js'
</script>
<template>
  <div class="row">
    <div class="panel">
      <h3>请求 A</h3>
      <p class="who">{{ user }}</p>
      <button @click="login('Ada')">A 登录 Ada</button>
    </div>
    <div class="panel">
      <h3>请求 B</h3>
      <p class="who">{{ user }}</p>
      <button @click="login('Lin')">B 登录 Lin</button>
    </div>
  </div>
</template>
`;

const twoFactoryOnce = `<script setup>
import { session } from './session.js'
</script>
<template>
  <div class="row">
    <div class="panel">
      <h3>请求 A</h3>
      <p class="who">{{ session.user }}</p>
      <button @click="session.login('Ada')">A 登录 Ada</button>
    </div>
    <div class="panel">
      <h3>请求 B</h3>
      <p class="who">{{ session.user }}</p>
      <button @click="session.login('Lin')">B 登录 Lin</button>
    </div>
  </div>
</template>
`;

const twoIsolated = `<script setup>
import { createSession } from './session.js'
const a = createSession()
const b = createSession()
</script>
<template>
  <div class="row">
    <div class="panel">
      <h3>请求 A</h3>
      <p class="who">{{ a.user }}</p>
      <button @click="a.login('Ada')">A 登录 Ada</button>
    </div>
    <div class="panel">
      <h3>请求 B</h3>
      <p class="who">{{ b.user }}</p>
      <button @click="b.login('Lin')">B 登录 Lin</button>
    </div>
  </div>
</template>
`;

const twoStillSharedFn = `<script setup>
import { createSession } from './session.js'
const a = createSession()
const b = a
</script>
<template>
  <div class="row">
    <div class="panel">
      <h3>请求 A</h3>
      <p class="who">{{ a.user }}</p>
      <button @click="a.login('Ada')">A 登录 Ada</button>
    </div>
    <div class="panel">
      <h3>请求 B</h3>
      <p class="who">{{ b.user }}</p>
      <button @click="b.login('Lin')">B 登录 Lin</button>
    </div>
  </div>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'

const cart = ref(['牛奶'])

function add(item) {
  cart.value = cart.value.concat(item)
}
</script>
<template>
  <div class="panel">
    <h3>购物车</h3>
    <p>{{ cart.join('、') }}</p>
    <button @click="add('面包')">加面包</button>
  </div>
</template>
`;

const cartSingleton = `import { ref } from 'vue'
export const cart = ref(['牛奶'])
export function add(item) {
  cart.value = cart.value.concat(item)
}
`;

const cartFactory = `import { reactive } from 'vue'
export function createCart() {
  const state = reactive({
    cart: ['牛奶'],
    add(item) {
      state.cart = state.cart.concat(item)
    },
  })
  return state
}
`;

const transferShared = `<script setup>
import { cart, add } from './cart.js'
</script>
<template>
  <div class="row">
    <div class="panel">
      <h3>请求 A</h3>
      <p>{{ cart.join('、') }}</p>
      <button @click="add('面包')">A 加面包</button>
    </div>
    <div class="panel">
      <h3>请求 B</h3>
      <p>{{ cart.join('、') }}</p>
      <button @click="add('鸡蛋')">B 加鸡蛋</button>
    </div>
  </div>
</template>
`;

const transferIsolated = `<script setup>
import { createCart } from './cart.js'
const a = createCart()
const b = createCart()
</script>
<template>
  <div class="row">
    <div class="panel">
      <h3>请求 A</h3>
      <p>{{ a.cart.join('、') }}</p>
      <button @click="a.add('面包')">A 加面包</button>
    </div>
    <div class="panel">
      <h3>请求 B</h3>
      <p>{{ b.cart.join('、') }}</p>
      <button @click="b.add('鸡蛋')">B 加鸡蛋</button>
    </div>
  </div>
</template>
`;

export const ISOLATE_LAB: CausalLab = {
  id: "isolate",
  world: 7,
  concept: "ssr-state",
  title: "下一份请求不该认识 Ada",
  subtitle: "模块顶层的 ref 是进程级单例。SSR 里一份进程要服务许多人。",
  promise:
    "一镜一条边：先一个请求能登录，再并排两个请求，再让 A 登录（B 跟着变成 Ada），再工厂却仍 export 一次，再每个请求自己 createSession。",
  minutes: 16,
  official: "/guide/scaling-up/ssr.html",
  scenes: [
    {
      id: "isolate-s0",
      tick: "S0",
      title: "一个请求，一份会话",
      goal: "模块里的 user 能登录。现在只有请求 A。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": onePanel, "src/session.js": sessionSingleton },
        blocks: [{ id: "one", label: "① 模块级 user" }],
        narration: "CSR 里这样写常常能跑：整个标签页一份用户。SSR 的进程里，这份用户会活过许多次请求。",
      },
      observe: {
        state: [{ id: "user", label: "user", value: "游客", symbol: "user" }],
        dom: [{ id: "who", label: ".who", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "mod", kind: "script", label: "session.js" },
        { id: "dom", kind: "dom", label: "请求 A" },
      ],
      edges: [{ from: "mod", to: "dom" }],
      explanation: {
        headline: "单例在 CSR 是方便，在 SSR 是泄漏",
        body: "composable 课把 todos 提到模块顶层，是为了让两个组件共享。服务器上「两个组件」可能是两个用户。下一镜并排放上请求 B。",
      },
      tryThis: "登录 Ada。A 应变成 Ada。现在还没有 B。",
      faqs: [
        { q: "这不就是 Pinia 吗？", a: "Pinia 默认也是应用级单例。SSR 必须为每次请求 createPinia()，再 app.use。同一条边，下一镜先用最小的 ref 看清楚。" },
        { q: "预览里哪来的两个请求？", a: "两个面板扮演两次请求。它们 import 同一模块。进程只有一份。" },
      ],
    },
    {
      id: "isolate-s1",
      tick: "S1",
      title: "请求 B 进门",
      goal: "并排放上 B。还没有人登录。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "两个面板都读 session.js 的 user。现在都是游客。页面会？",
        choices: [
          { id: "same", label: "两份游客。还没人登录，看不出泄漏", correct: true, why: "共享已经发生。只是值还是初始值。下一镜 A 一登录，B 就会开口。" },
          { id: "copy", label: "B 会拿到一份拷贝，天然隔离", correct: false, why: "ESM 模块只求值一次。两个 import 是同一份 ref。" },
          { id: "err", label: "报错：不能 import 两次", correct: false, why: "合法。这正是泄漏的前提。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": twoShared, "src/session.js": sessionSingleton },
        blocks: [{ id: "two", label: "② 两个面板，同一份 user" }],
        narration: "文件边界不是请求边界。两个面板已经握着同一只盒子。",
      },
      observe: {
        state: [{ id: "user", label: "user", value: "1 份游客", symbol: "user" }],
        dom: [{ id: "both", label: "A / B", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "mod", kind: "script", label: "user 单例" },
        { id: "a", kind: "component", label: "请求 A" },
        { id: "b", kind: "component", label: "请求 B" },
      ],
      edges: [
        { from: "mod", to: "a" },
        { from: "mod", to: "b" },
      ],
      explanation: {
        headline: "共享已经发生",
        body: "看起来两份游客，像是隔离。其实是同一份还没被改过。泄漏要等一次写入才露脸。",
      },
      tryThis: "确认 A、B 都是游客。先别登录。记住这张「看起来没事」的脸。",
      faqs: [
        { q: "为什么不立刻登录？", a: "一次只改一条边。这一镜只让第二份请求出现。写入留给下一镜。" },
      ],
      mapping: [{ code: "import { user } from './session.js'", runtime: "同一份 ref", ui: "两面板同一人" }],
    },
    {
      id: "isolate-s2",
      tick: "S2",
      title: "A 登录，B 也认识 Ada",
      goal: "只在 A 点登录。看 B。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「A 登录 Ada」。请求 B 会？",
        choices: [
          { id: "guest", label: "仍是游客。B 没有点按钮", correct: false, why: "B 读的是同一份 user。写入没有请求边界。" },
          { id: "ada", label: "变成 Ada。下一份请求认识了上一份的人", correct: true, why: "这就是跨请求污染。SSR 里 Ada 的 cookie 会画到别人的 HTML 里。" },
          { id: "err", label: "报错：不能跨面板改 ref", correct: false, why: "合法。也正因为合法，才危险。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": twoShared, "src/session.js": sessionSingleton },
        blocks: [{ id: "login", label: "③ 只让 A 登录（代码未改，观察泄漏）" }],
        narration: "这一镜不改代码。请真的只点 A。B 若跟着变，泄漏就成立了。",
      },
      replay: {
        label: "A 登录",
        steps: [
          { caption: "A 点登录", event: "click", highlight: ["a"] },
          { caption: "模块 user → Ada", highlight: ["mod"], state: { id: "user", from: "游客", to: "Ada" } },
          { caption: "B 也读到 Ada", highlight: ["b"] },
        ],
      },
      observe: {
        state: [{ id: "user", label: "user", value: "Ada（1 份）", symbol: "user" }],
        dom: [{ id: "both", label: "A / B", value: "都是 Ada" }],
        events: [{ id: "click", label: "A 登录", value: "login('Ada')" }],
      },
      nodes: [
        { id: "a", kind: "event", label: "A 登录" },
        { id: "mod", kind: "script", label: "user", symbol: "user" },
        { id: "b", kind: "component", label: "请求 B" },
      ],
      edges: [
        { from: "a", to: "mod", label: "写入" },
        { from: "mod", to: "b", label: "泄漏" },
      ],
      why: {
        question: "和 composable 课把 todos 提到顶层，是同一类图吗？",
        choices: [
          { id: "same", label: "是。都是模块单例。CSR 要共享，SSR 要隔离", correct: true, why: "同一张图，场景换了。标签页里共享是功能；请求之间共享是事故。" },
          { id: "diff", label: "不是。SSR 有特殊的 ref 实现", correct: false, why: "ref 一样。差别是谁在 import 它。" },
          { id: "vue", label: "Vue 会在每次请求结束时清空模块", correct: false, why: "不会。模块活在整个 Node 进程里。" },
        ],
      },
      explanation: {
        headline: "写入没有请求边界",
        body: "A 的登录写进了进程。B 只是另一个读者。真 SSR 里，这会把 Ada 的名字写进 Lin 的 HTML。",
      },
      faqs: [
        { q: "为什么 CSR 很少炸？", a: "一个标签页通常一份应用、一个用户。进程级单例碰巧等于会话。服务器不是。" },
        { q: "Nuxt 怎么防？", a: "useState / 每次请求的 pinia / event 上下文。本质：状态跟请求走，不跟模块走。" },
      ],
      tryThis: "只点「A 登录 Ada」。B 必须也变成 Ada。这是这一镜的正确答案。",
      mapping: [{ code: "login('Ada') 在 A", runtime: "写进模块单例", ui: "B 也是 Ada" }],
    },
    {
      id: "isolate-s3",
      tick: "S3",
      title: "工厂造了一次，仍是单例",
      goal: "createSession 存在。模块顶层仍 export const session = createSession()。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "抽出工厂，却在模块顶层只调用一次。A 登录后 B 会？",
        choices: [
          { id: "iso", label: "隔离。已经是工厂了", correct: false, why: "工厂只是函数。调用一次，仍是一份。" },
          { id: "leak", label: "仍泄漏。单例从 ref 换成了 session 对象", correct: true, why: "composable 课把 ref 挪到函数里才每人一份。这里又在顶层调用了一次。" },
          { id: "err", label: "报错：不能在模块顶层用 ref", correct: false, why: "能。那正是单例。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": twoFactoryOnce, "src/session.js": sessionFactoryOnce },
        blocks: [{ id: "once", label: "④ createSession() 只调用一次" }],
        narration: "API 看起来像工厂。调用次数仍是 1。",
      },
      observe: {
        state: [{ id: "s", label: "session", value: "1 份", symbol: "session" }],
        dom: [{ id: "both", label: "A / B", value: "仍共享" }],
        events: [],
      },
      nodes: [
        { id: "fn", kind: "script", label: "createSession" },
        { id: "once", kind: "script", label: "export const session" },
        { id: "a", kind: "component", label: "A" },
        { id: "b", kind: "component", label: "B" },
      ],
      edges: [
        { from: "fn", to: "once", label: "调用 1 次" },
        { from: "once", to: "a" },
        { from: "once", to: "b" },
      ],
      explanation: {
        headline: "工厂不是隔离，调用次数才是",
        body: "createPinia、createSession、useStore 写在模块顶层，等于又做回单例。SSR 要在每次请求的入口各造一份。",
      },
      faqs: [
        { q: "那 Pinia 的 defineStore 呢？", a: "定义可以在模块顶层。实例必须从这次请求的 pinia 里取。createPinia() 每请求一次。" },
      ],
      tryThis: "A 登录 Ada。B 必须仍跟着变。工厂没救你，因为只开张了一次。",
      mapping: [{ code: "export const session = createSession()", runtime: "仍是一份", ui: "A 登录 = B 登录" }],
    },
    {
      id: "isolate-s4",
      tick: "S4",
      title: "每个请求自己造一份",
      goal: "setup 里 const a = createSession(); const b = createSession()。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "两个面板各调用一次工厂。A 登录 Ada 之后，B 会？",
        choices: [
          { id: "guest", label: "仍是游客", correct: true, why: "两份 ref。写入走 A 那一份。" },
          { id: "ada", label: "仍是 Ada。工厂不能隔离 ref", correct: false, why: "函数每次执行都 new 一份。和 composable 课两次 useTodos 同一张图，只是这次我们要的就是两份。" },
          { id: "err", label: "报错：不能调用两次", correct: false, why: "合法。这就是隔离。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": twoIsolated, "src/session.js": sessionFactory },
        blocks: [{ id: "each", label: "⑤ 每个请求 createSession()" }],
        narration: "只改调用次数。工厂函数本身上一镜就有了。",
      },
      observe: {
        state: [
          { id: "a", label: "A.user", value: "Ada 或游客", symbol: "user" },
          { id: "b", label: "B.user", value: "游客", symbol: "user" },
        ],
        dom: [{ id: "split", label: "A / B", value: "不再跟" }],
        events: [],
      },
      nodes: [
        { id: "fn", kind: "script", label: "createSession" },
        { id: "a", kind: "component", label: "请求 A" },
        { id: "b", kind: "component", label: "请求 B" },
      ],
      edges: [
        { from: "fn", to: "a", label: "一份" },
        { from: "fn", to: "b", label: "另一份" },
      ],
      explanation: {
        headline: "请求是工厂的一次调用",
        body: "Node 进程还是那一个。隔离发生在「每次请求 new 一份状态」，不是「换一台机器」。",
      },
      faqs: [
        { q: "谁在真 SSR 里调用工厂？", a: "入口：每次 request 创建 app、createPinia、createRouter。组件里不要再去碰模块单例。" },
        { q: "provide 呢？", a: "入口 create 之后 provide 给这棵树。下一镜会看：若把同一份对象交给两棵树，仍会漏。" },
      ],
      tryThis: "A 登录 Ada。B 必须仍是游客。再让 B 登录 Lin，A 应仍是 Ada。",
      mapping: [{ code: "const a = createSession(); const b = createSession()", runtime: "两份 ref", ui: "互不影响" }],
    },
    {
      id: "isolate-s5",
      tick: "S5",
      title: "造了两份，却交给同一只",
      goal: "const b = a。看起来两个面板，仍是一份会话。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "b = a。A 登录后 B 会？",
        choices: [
          { id: "guest", label: "游客。变量名不同", correct: false, why: "名字不是边界。引用才是。" },
          { id: "ada", label: "Ada。两只手握着同一份 session", correct: true, why: "和模块单例同一张图，只是单例被你用手递过去。" },
          { id: "copy", label: "B 拿到拷贝，因为是另一个 const", correct: false, why: "const b = a 拷的是引用。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": twoStillSharedFn, "src/session.js": sessionFactory },
        blocks: [{ id: "alias", label: "⑥ const b = a" }],
        narration: "工厂调用了一次。第二份请求拿到的是别名。",
      },
      observe: {
        state: [{ id: "one", label: "session", value: "1 份，两个名字" }],
        dom: [{ id: "both", label: "A / B", value: "又跟了" }],
        events: [],
      },
      nodes: [
        { id: "a", kind: "script", label: "a" },
        { id: "b", kind: "script", label: "b = a" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "a", to: "b", label: "同一引用" },
        { from: "a", to: "dom" },
      ],
      explanation: {
        headline: "隔离看的是引用，不是面板",
        body: "两个 <div>、两个标题、两个按钮，都可以握着同一份状态。SSR 入口若把同一个 pinia 传给两次渲染，泄漏会换一件衣服回来。",
      },
      faqs: [
        { q: "Object.assign 浅拷贝呢？", a: "里面的 ref 还是同一只盒子。要隔离就再调用一次工厂。" },
      ],
      tryThis: "A 登录 Ada。B 必须跟着变。对比上一镜：差别只有 b = a。",
      mapping: [{ code: "const b = a", runtime: "同一引用", ui: "又泄漏" }],
    },
    {
      id: "isolate-s6",
      tick: "S6",
      title: "拆回单例 / 工厂一次 / 别名",
      goal: "三种坏法：模块 ref、顶层调用一次、b = a。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到模块级 user。A 登录后 B 会？",
        choices: [
          { id: "guest", label: "游客", correct: false, why: "S2。" },
          { id: "ada", label: "Ada", correct: true, why: "进程级单例。" },
          { id: "err", label: "报错", correct: false, why: "静默泄漏。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": twoIsolated, "src/session.js": sessionFactory },
        blocks: [{ id: "keep", label: "两份 session 先留着" }],
        narration: "先确认 A 登录不影响 B。再分别缩回模块单例、顶层调用一次、b = a。",
      },
      observe: {
        state: [{ id: "ok", label: "A / B", value: "隔离" }],
        dom: [{ id: "split", label: "脸", value: "互不影响" }],
        events: [],
      },
      nodes: [
        { id: "fn", kind: "script", label: "createSession ×2" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "fn", to: "dom" }],
      ablations: [
        {
          id: "mod",
          prompt: "如果 user 在模块顶层？",
          files: { "src/App.vue": twoShared, "src/session.js": sessionSingleton },
          expected: { kind: "stale", message: "A 登录，B 变成 Ada。进程级单例。" },
          lesson: "模块活过请求。",
        },
        {
          id: "once",
          prompt: "如果工厂只调用一次？",
          files: { "src/App.vue": twoFactoryOnce, "src/session.js": sessionFactoryOnce },
          expected: { kind: "stale", message: "看起来像工厂，仍是一份。" },
          lesson: "调用次数才是边界。",
        },
        {
          id: "alias",
          prompt: "如果 b = a？",
          files: { "src/App.vue": twoStillSharedFn, "src/session.js": sessionFactory },
          expected: { kind: "stale", message: "两块面板，同一引用。" },
          lesson: "名字不是隔离。",
        },
      ],
      explanation: {
        headline: "三种衣服，同一份泄漏",
        body: "顶层 ref、顶层工厂、别名。脸都是：A 一写，B 就读到。SSR 要的是每次请求 new 一份。",
      },
      tryThis: "三种消融都：只让 A 登录，看 B。Ada、Ada、Ada，对上号再恢复。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先模块 ref，再工厂调用一次，再 b = a。一次比一次更像隔离，其实都没有。" },
      ],
    },
    {
      id: "isolate-s7",
      tick: "S7",
      title: "换：购物车",
      goal: "cart 在一个面板里能加东西。两份请求该不该共享？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "若把 cart 提到 cart.js 顶层，并排放 A / B。A 加面包后，B 会？",
        choices: [
          { id: "share", label: "也有面包。和 user 同一张图", correct: true, why: "模块单例不区分会话和购物车。" },
          { id: "own", label: "B 仍只有牛奶。数组会自动拷贝", correct: false, why: "同一份 ref。" },
          { id: "err", label: "报错", correct: false, why: "静默串单。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "cart", label: "换场景：购物车" }],
        narration: "先是一份能加的车。想清楚并排两个请求时，车该有几份。",
      },
      observe: {
        state: [{ id: "cart", label: "cart", value: "牛奶" }],
        dom: [{ id: "p", label: "p", value: "牛奶" }],
        events: [],
      },
      nodes: [
        { id: "cart", kind: "ref", label: "cart" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "cart", to: "dom" }],
      ablations: [
        {
          id: "leak",
          prompt: "提到模块顶层并排 A / B 之后？",
          files: { "src/App.vue": transferShared, "src/cart.js": cartSingleton },
          expected: { kind: "stale", message: "这是事故：A 加面包，B 的车里也有。先看清楚泄漏。" },
          lesson: "同一条边。先承认泄漏，再造两份。",
        },
        {
          id: "fix",
          prompt: "每个请求 createCart() 之后？",
          files: { "src/App.vue": transferIsolated, "src/cart.js": cartFactory },
          expected: { kind: "stale", message: "这是修复：A 的面包进不了 B。B 加鸡蛋也不碰 A。" },
          lesson: "World 7 到这里：第一帧要对齐；每份请求自己的状态。下一课才把数据冻进第一帧。",
        },
      ],
      explanation: {
        headline: "用户、购物车、主题，都跟请求走",
        body: "不是「不要单例」。CSR 标签页里单例常常正好。SSR 的单例是进程。进程会为许多人画画。",
      },
      faqs: [
        { q: "数据库连接可以单例吗？", a: "可以。连接池是基础设施，不是用户状态。分界：这份数据会不会出现在某一个人的 HTML 里。" },
      ],
      tryThis: "先在单面板加面包。再看模块顶层版：A 加，B 跟着有。再打开工厂版：必须互不影响。",
      mapping: [
        { code: "export const cart = ref(...)", runtime: "进程单例", ui: "串车" },
        { code: "createCart() × 请求次数", runtime: "每请求一份", ui: "隔离" },
      ],
    },
  ],
};
