import type { CausalLab } from "../types";

const todosMod = `import { ref } from 'vue'

export const todos = ref([
  { id: 1, title: '买牛奶', done: true },
  { id: 2, title: '学路由', done: false },
])
`;

const onePage = `<script setup>
import { ref } from 'vue'
import { todos } from './todos.js'

const selectedId = ref(null)
const current = () => todos.value.find((t) => t.id === selectedId.value)
</script>

<template>
  <div v-if="!selectedId">
    <p class="hint">清单</p>
    <ul>
      <li v-for="t in todos" :key="t.id">
        <button @click="selectedId = t.id">{{ t.title }}</button>
      </li>
    </ul>
  </div>
  <div v-else>
    <button @click="selectedId = null">返回</button>
    <h3>{{ current()?.title }}</h3>
    <p class="hint">id = {{ selectedId }}</p>
  </div>
</template>
`;

const listComp = `<script setup>
import { todos } from './todos.js'
defineEmits(['open'])
</script>

<template>
  <p class="hint">清单</p>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <button @click="$emit('open', t.id)">{{ t.title }}</button>
    </li>
  </ul>
</template>
`;

const detailComp = `<script setup>
import { computed } from 'vue'
import { todos } from './todos.js'
const props = defineProps({ id: { type: Number, required: true } })
defineEmits(['back'])
const current = computed(() => todos.value.find((t) => t.id === props.id))
</script>

<template>
  <button @click="$emit('back')">返回</button>
  <h3>{{ current?.title }}</h3>
  <p class="hint">id = {{ id }}</p>
</template>
`;

const appPageRef = `<script setup>
import { ref } from 'vue'
import List from './List.vue'
import Detail from './Detail.vue'

const page = ref('list')
const selectedId = ref(1)
</script>

<template>
  <p class="hint">内部页：{{ page }}</p>
  <List v-if="page === 'list'" @open="(id) => { selectedId = id; page = 'detail' }" />
  <Detail v-else :id="selectedId" @back="page = 'list'" />
</template>
`;

const mainRouter = `import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import List from './List.vue'
import Detail from './Detail.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: List },
    { path: '/todo/:id', component: Detail },
  ],
})

createApp(App).use(router).mount('#app')
`;

const mainNoRouter = `import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
`;

const appIgnoreRouter = `<script setup>
import { ref } from 'vue'
import List from './List.vue'
import Detail from './Detail.vue'

const page = ref('list')
const selectedId = ref(1)
</script>

<template>
  <nav class="links">
    <RouterLink to="/">清单</RouterLink>
    <RouterLink to="/todo/2">学路由</RouterLink>
  </nav>
  <p class="hint">内部页仍是：{{ page }}</p>
  <List v-if="page === 'list'" @open="(id) => { selectedId = id; page = 'detail' }" />
  <Detail v-else :id="selectedId" @back="page = 'list'" />
</template>
`;

const appLinksNoView = `<script setup>
</script>

<template>
  <nav class="links">
    <RouterLink to="/">清单</RouterLink>
    <RouterLink to="/todo/2">学路由</RouterLink>
  </nav>
  <p class="hint">地址会变。下面没有 RouterView。</p>
</template>
`;

const appWithView = `<script setup>
</script>

<template>
  <nav class="links">
    <RouterLink to="/">清单</RouterLink>
  </nav>
  <RouterView />
</template>
`;

const listRouted = `<script setup>
import { todos } from './todos.js'
</script>

<template>
  <p class="hint">清单</p>
  <ul>
    <li v-for="t in todos" :key="t.id">
      <RouterLink :to="'/todo/' + t.id">{{ t.title }}</RouterLink>
    </li>
  </ul>
</template>
`;

const detailNoParam = `<script setup>
import { todos } from './todos.js'
const current = todos.value[0]
</script>

<template>
  <RouterLink to="/">返回</RouterLink>
  <h3>{{ current.title }}</h3>
  <p class="hint">写死第一项</p>
</template>
`;

const detailParam = `<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { todos } from './todos.js'

const route = useRoute()
const current = computed(() =>
  todos.value.find((t) => String(t.id) === String(route.params.id)),
)
</script>

<template>
  <RouterLink to="/">返回</RouterLink>
  <h3 v-if="current">{{ current.title }}</h3>
  <p v-else class="hint">没有这项</p>
  <p class="hint">params.id = {{ route.params.id }}</p>
</template>
`;

const detailWrongParam = `<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { todos } from './todos.js'

const route = useRoute()
const current = computed(() =>
  todos.value.find((t) => String(t.id) === String(route.params.todoId)),
)
</script>

<template>
  <RouterLink to="/">返回</RouterLink>
  <h3 v-if="current">{{ current.title }}</h3>
  <p v-else class="hint">没有这项（读的是 params.todoId）</p>
</template>
`;

const mainHistory = `import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import List from './List.vue'
import Detail from './Detail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: List },
    { path: '/todo/:id', component: Detail },
  ],
})

createApp(App).use(router).mount('#app')
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const tab = ref('profile')
</script>

<template>
  <button :class="{ active: tab === 'profile' }" @click="tab = 'profile'">资料</button>
  <button :class="{ active: tab === 'billing' }" @click="tab = 'billing'">账单</button>
  <p v-if="tab === 'profile'">名字：Ada</p>
  <p v-else>账单：未结清</p>
</template>
`;

const settingsMain = `import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'

const Profile = { template: '<p>名字：Ada</p>' }
const Billing = { template: '<p>账单：未结清</p>' }

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/profile' },
    { path: '/profile', component: Profile },
    { path: '/billing', component: Billing },
  ],
})

createApp(App).use(router).mount('#app')
`;

const settingsApp = `<script setup>
</script>

<template>
  <nav class="links">
    <RouterLink to="/profile">资料</RouterLink>
    <RouterLink to="/billing">账单</RouterLink>
  </nav>
  <RouterView />
</template>
`;

export const ROUTER_LAB: CausalLab = {
  id: "router",
  world: 3,
  concept: "vue-router",
  title: "屏幕上这一页，地址也该知道",
  subtitle: "page ref 能切视图。刷新、分享、后退，要靠 URL。",
  promise:
    "一镜一条边：先页内 v-if，再拆页面组件，再安装路由却仍听 page ref，再挂链接不挂出口，再 RouterView，再 params。看见地址变了、视图没变。",
  minutes: 20,
  official: "/guide/scaling-up/routing.html",
  scenes: [
    {
      id: "router-s0",
      tick: "S0",
      title: "同一页里的清单和详情",
      goal: "selectedId 决定画哪一块。还没有「页面」这个词。",
      layer: "see",
      fading: 1,
      mutation: {
        files: {
          "src/App.vue": onePage,
          "src/todos.js": todosMod,
        },
        blocks: [{ id: "vif", label: "① v-if selectedId" }],
        narration: "点标题进详情，点返回回清单。状态是一个 ref。地址栏什么都没发生。",
      },
      observe: {
        state: [{ id: "sel", label: "selectedId", value: "null | id", symbol: "selectedId" }],
        dom: [{ id: "view", label: "view", value: "清单或详情" }],
        events: [],
      },
      nodes: [
        { id: "sel", kind: "ref", label: "selectedId", symbol: "selectedId" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "sel", to: "dom", label: "v-if" }],
      explanation: {
        headline: "切视图还不是导航",
        body: "v-if 能换一块 UI。刷新会回到清单。你无法把「学路由」这一项发给别人。下一镜先把两块 UI 剪成组件，仍然用 page ref 切换。",
      },
      tryThis: "点「学路由」看详情，再返回。刷新预览，应回到清单。",
      faqs: [
        { q: "这和 Tab 有什么区别？", a: "没有。都是组件内状态。路由要多的那条边是：URL 成为这份状态的源。" },
      ],
    },
    {
      id: "router-s1",
      tick: "S1",
      title: "拆成两个页面组件",
      goal: "List / Detail 上场。App 用 page ref 切换。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "拆成组件后，用 page = 'list' | 'detail' 切换。刷新预览会？",
        choices: [
          { id: "keep", label: "停在刚才的详情", correct: false, why: "page 是内存里的 ref。刷新重建应用，回到 'list'。" },
          { id: "list", label: "回到清单。page 不是 URL", correct: true, why: "组件边界不是导航。缺的仍是地址。" },
          { id: "err", label: "报错：不能这样切组件", correct: false, why: "完全合法。只是还不是路由。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appPageRef,
          "src/List.vue": listComp,
          "src/Detail.vue": detailComp,
          "src/todos.js": todosMod,
        },
        blocks: [
          { id: "pages", label: "② List.vue / Detail.vue" },
          { id: "page", label: "③ page ref 切换" },
        ],
        narration: "页面是组件了。切换协议仍是父级的一个字符串。请再进详情、刷新。",
      },
      observe: {
        state: [{ id: "page", label: "page", value: "'list'", symbol: "page" }],
        dom: [{ id: "view", label: "view", value: "List 或 Detail" }],
        events: [],
      },
      nodes: [
        { id: "page", kind: "ref", label: "page", symbol: "page" },
        { id: "list", kind: "component", label: "List" },
        { id: "detail", kind: "component", label: "Detail" },
      ],
      edges: [
        { from: "page", to: "list", label: "v-if" },
        { from: "page", to: "detail", label: "v-else" },
      ],
      explanation: {
        headline: "组件是页面的形状，不是导航",
        body: "下一镜安装 vue-router，但 App 仍听 page ref。你会看见：链接可以存在，视图仍不跟地址走。",
      },
      tryThis: "点进详情。看「内部页：detail」。刷新，应回到 list。",
    },
    {
      id: "router-s2",
      tick: "S2",
      title: "路由装上了，视图仍听 page",
      goal: "main.js 创建 router 并 use。App 仍 v-if page。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点导航里的 RouterLink「学路由」。中间那块 UI 会？",
        choices: [
          { id: "detail", label: "换成详情，因为路由已经装上", correct: false, why: "App 画什么仍由 page ref 决定。RouterLink 只改 hash。没人读这个 hash。" },
          { id: "stay", label: "清单还在。内部页仍是 list", correct: true, why: "安装 ≠ 出口。和有 store 文件却不调用同一类。" },
          { id: "err", label: "报错：不能同时有 page 和 router", correct: false, why: "合法。只是两份真相。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainRouter,
          "src/App.vue": appIgnoreRouter,
          "src/List.vue": listComp,
          "src/Detail.vue": detailComp,
          "src/todos.js": todosMod,
        },
        blocks: [
          { id: "main", label: "④ createRouter + app.use" },
          { id: "link", label: "⑤ RouterLink（视图仍 v-if）" },
        ],
        narration: "请点「学路由」。地址（hash）可能变了。内部页那一行应仍是 list。",
      },
      observe: {
        state: [
          { id: "page", label: "page", value: "'list'", symbol: "page" },
          { id: "hash", label: "hash", value: "可能已是 #/todo/2" },
        ],
        dom: [{ id: "view", label: "view", value: "仍是 List" }],
        events: [],
      },
      nodes: [
        { id: "router", kind: "route", label: "vue-router", symbol: "RouterLink" },
        { id: "page", kind: "ref", label: "page", symbol: "page" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "page", to: "dom", label: "仍说了算" },
        { from: "router", to: "dom", label: "只改了地址" },
      ],
      why: {
        question: "为什么装了路由，点链接视图不变？",
        choices: [
          { id: "out", label: "没有 RouterView。也没有人把 route 写回 page", correct: true, why: "路由改的是 URL 状态。模板还在读另一份 page。" },
          { id: "hash", label: "iframe 里 hash 无效", correct: false, why: "hash 可以变。变了也不自动改你的 v-if。" },
          { id: "name", label: "组件必须叫 index 才能当首页", correct: false, why: "routes 已经把 / 指到 List。缺的是出口。" },
        ],
      },
      explanation: {
        headline: "路由状态和页面 ref 是两份真相",
        body: "下一镜把 v-if 拆掉，只留导航链接，仍不放 RouterView。地址会变，身体真空——和插槽开洞不填同一张脸。",
      },
      tryThis: "点「学路由」。看内部页是不是仍是 list。再点列表按钮，那才会切到 detail。",
      faqs: [
        { q: "为什么用 HashHistory？", a: "预览在 iframe 里。hash 不需要服务器配合。createWebHistory 在这种沙箱里常会 404 或抢父页面地址。" },
      ],
    },
    {
      id: "router-s3",
      tick: "S3",
      title: "有链接，没有出口",
      goal: "删掉 page / List / Detail 的 v-if。只留 RouterLink。不放 RouterView。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「学路由」之后会看到详情吗？",
        choices: [
          { id: "yes", label: "会。路由表已经指向 Detail", correct: false, why: "匹配发生了。没有 RouterView，匹配结果没地方投影。" },
          { id: "empty", label: "导航在，身体是空的", correct: true, why: "和 <slot /> 开了却不填一样：出口不在。" },
          { id: "err", label: "报错：缺少 RouterView", correct: false, why: "常常不报错。静默空白。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainRouter,
          "src/App.vue": appLinksNoView,
          "src/List.vue": listRouted,
          "src/Detail.vue": detailParam,
          "src/todos.js": todosMod,
        },
        blocks: [{ id: "empty", label: "⑥ 只留 RouterLink，无 RouterView" }],
        narration: "请点链接。匹配在进行。屏幕上没有页面。这是故意的空洞。",
      },
      observe: {
        state: [{ id: "route", label: "route", value: "已匹配", symbol: "RouterView" }],
        dom: [{ id: "body", label: "body", value: "空" }],
        events: [],
      },
      nodes: [
        { id: "router", kind: "route", label: "matched route" },
        { id: "dom", kind: "dom", label: "DOM", detail: "无出口" },
      ],
      edges: [],
      explanation: {
        headline: "匹配 ≠ 渲染",
        body: "RouterView 是洞。路由表决定洞里放谁。下一镜只补这一个组件。",
      },
      tryThis: "点「清单」和「学路由」。身体应一直空。导航高亮可能会变。",
      mapping: [{ code: "RouterLink", runtime: "改 URL / 匹配", ui: "没有页面" }],
    },
    {
      id: "router-s4",
      tick: "S4",
      title: "补上 RouterView",
      goal: "App 增加 <RouterView />。List 用 RouterLink 进详情。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "有了 RouterView，点清单里的「学路由」会？",
        choices: [
          { id: "ok", label: "详情出现。params.id 是 2", correct: true, why: "出口在了。/todo/:id 把 2 填进 params。Detail 读 useRoute()。" },
          { id: "list", label: "还是清单，因为没改 page ref", correct: false, why: "page ref 已经不在了。说了算的是 route。" },
          { id: "first", label: "总会显示买牛奶，因为 Detail 写死第一项", correct: false, why: "这一版 Detail 读 params。写死是消融。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainRouter,
          "src/App.vue": appWithView,
          "src/List.vue": listRouted,
          "src/Detail.vue": detailParam,
          "src/todos.js": todosMod,
        },
        blocks: [{ id: "view", label: "⑦ <RouterView />" }],
        narration: "请从清单点进两项详情，再点返回。地址和视图必须一起走。",
      },
      replay: {
        label: "打开第二项",
        steps: [
          { caption: "RouterLink → #/todo/2", event: "click", highlight: ["router"] },
          { caption: "匹配 /todo/:id", highlight: ["router"] },
          { caption: "RouterView 投影 Detail", highlight: ["dom"] },
        ],
      },
      observe: {
        state: [{ id: "id", label: "params.id", value: "2", symbol: "RouterView" }],
        dom: [{ id: "h3", label: "h3", value: "学路由" }],
        events: [{ id: "click", label: "click", value: "RouterLink" }],
      },
      nodes: [
        { id: "link", kind: "event", label: "RouterLink" },
        { id: "router", kind: "route", label: "route", symbol: "RouterView" },
        { id: "view", kind: "render", label: "RouterView" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "link", to: "router", label: "push" },
        { from: "router", to: "view", label: "匹配" },
        { from: "view", to: "dom" },
      ],
      why: {
        question: "详情怎么知道是第 2 项，而不是第 1 项？",
        choices: [
          { id: "param", label: "路径里的 :id 变成 route.params.id", correct: true, why: "路由表写 /todo/:id。链接写 /todo/2。组件读 params。" },
          { id: "emit", label: "List emit 了 id 给 Detail", correct: false, why: "它们不是父子。中间是 URL。" },
          { id: "store", label: "必须靠 Pinia 才能传 id", correct: false, why: "id 走地址。清单数据才走 store / composable。" },
        ],
      },
      explanation: {
        headline: "URL 是这一页的源",
        body: "链接写入地址。路由表匹配。RouterView 投影。params 把路径里的变量交给页面。下一镜看读错参数名、拆掉出口、换成 History 模式。",
      },
      tryThis: "点「买牛奶」和「学路由」。看 params.id。点返回回到清单。刷新应尽量停在当前 hash。",
      faqs: [
        { q: "RouterLink 和 a href 有何不同？", a: "<a href=\"/todo/2\"> 会让浏览器整页去拉那个路径。RouterLink 拦截点击，只改路由状态。" },
        { q: "List 和 Detail 还通信吗？", a: "不直接通信。它们读同一份 todos 模块，读不同的 URL。这是页面之间的协议。" },
      ],
      mapping: [
        { code: "<RouterView />", runtime: "当前匹配组件的出口", ui: "清单或详情" },
        { code: "route.params.id", runtime: "路径变量", ui: "哪一项" },
      ],
    },
    {
      id: "router-s5",
      tick: "S5",
      title: "详情写死第一项",
      goal: "对照：有出口，但不读 params。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "Detail 改成永远读 todos[0]。点「学路由」会看到？",
        choices: [
          { id: "two", label: "学路由", correct: false, why: "地址是 /todo/2，组件不读它。" },
          { id: "milk", label: "买牛奶。地址对了，人错了", correct: true, why: "和列表缺 key 认错人同一类：匹配对了，投影用错了源。" },
          { id: "err", label: "报错", correct: false, why: "静默显示错项。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainRouter,
          "src/App.vue": appWithView,
          "src/List.vue": listRouted,
          "src/Detail.vue": detailNoParam,
          "src/todos.js": todosMod,
        },
        blocks: [{ id: "hard", label: "⑧ Detail 写死 todos[0]" }],
        narration: "请点第二项。地址应是 #/todo/2，标题却是买牛奶。然后用消融对比读错参数名。",
      },
      observe: {
        state: [{ id: "id", label: "params.id", value: "2（未被读取）" }],
        dom: [{ id: "h3", label: "h3", value: "买牛奶" }],
        events: [],
      },
      nodes: [
        { id: "router", kind: "route", label: "params.id = 2" },
        { id: "detail", kind: "component", label: "Detail 读 [0]" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "detail", to: "dom" }],
      ablations: [
        {
          id: "wrong-param",
          prompt: "如果读 params.todoId？",
          files: {
            "src/main.js": mainRouter,
            "src/App.vue": appWithView,
            "src/List.vue": listRouted,
            "src/Detail.vue": detailWrongParam,
            "src/todos.js": todosMod,
          },
          expected: {
            kind: "stale",
            message: "路由表写的是 :id。组件读 todoId，是 undefined。详情变成「没有这项」。",
          },
          lesson: "params 的名字是路由表契约。写错字段和没读一样静默。",
        },
        {
          id: "fix",
          prompt: "读回 params.id 之后？",
          files: {
            "src/main.js": mainRouter,
            "src/App.vue": appWithView,
            "src/List.vue": listRouted,
            "src/Detail.vue": detailParam,
            "src/todos.js": todosMod,
          },
          expected: {
            kind: "stale",
            message: "这是修复：点哪一项，详情就是哪一项。",
          },
          lesson: "地址里的变量必须被页面读取，导航才算闭合。",
        },
      ],
      explanation: {
        headline: "路径变量也是源",
        body: "和模板不读 count 一样：params 在，没人读，界面就用错数据。下一镜拆出口、拆插件、换成 History。",
      },
      tryThis: "点「学路由」，确认标题是买牛奶。再试「读 params.todoId」和修复。",
    },
    {
      id: "router-s6",
      tick: "S6",
      title: "拆掉出口 / 插件 / Hash",
      goal: "三种坏法：匹配无处投影、根本没路由、History 在沙箱里翻车。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "去掉 RouterView，只留链接。点「学路由」会？",
        choices: [
          { id: "ok", label: "详情仍出现", correct: false, why: "没有洞，匹配结果进不去。" },
          { id: "empty", label: "导航在，身体空", correct: true, why: "S3 已经见过。现在你知道这是拆掉出口。" },
          { id: "err", label: "强制报错", correct: false, why: "静默空白。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainRouter,
          "src/App.vue": appWithView,
          "src/List.vue": listRouted,
          "src/Detail.vue": detailParam,
          "src/todos.js": todosMod,
        },
        blocks: [{ id: "keep", label: "正确版本先留着" }],
        narration: "先能从清单点进详情。再分别拆 RouterView、拆 app.use(router)、换成 createWebHistory。",
      },
      observe: {
        state: [{ id: "ok", label: "route", value: "工作中" }],
        dom: [{ id: "ui", label: "UI", value: "清单 ↔ 详情" }],
        events: [],
      },
      nodes: [
        { id: "router", kind: "route", label: "router" },
        { id: "view", kind: "render", label: "RouterView" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "router", to: "view" },
        { from: "view", to: "dom" },
      ],
      ablations: [
        {
          id: "no-view",
          prompt: "如果没有 RouterView？",
          files: {
            "src/main.js": mainRouter,
            "src/App.vue": appLinksNoView,
            "src/List.vue": listRouted,
            "src/Detail.vue": detailParam,
            "src/todos.js": todosMod,
          },
          expected: {
            kind: "stale",
            message: "地址会变。身体真空。匹配没有出口。",
          },
          lesson: "RouterLink 改 URL。RouterView 投影。两条边。",
        },
        {
          id: "no-plugin",
          prompt: "如果没有 app.use(router)？",
          files: {
            "src/main.js": mainNoRouter,
            "src/App.vue": appWithView,
            "src/List.vue": listRouted,
            "src/Detail.vue": detailParam,
            "src/todos.js": todosMod,
          },
          expected: {
            kind: "error",
            message: "RouterLink / RouterView / useRoute 找不到注入的 router。和 Pinia 没安装同一类。",
          },
          lesson: "路由也是插件。组件只是消费者。",
        },
        {
          id: "history",
          prompt: "如果换成 createWebHistory？",
          files: {
            "src/main.js": mainHistory,
            "src/App.vue": appWithView,
            "src/List.vue": listRouted,
            "src/Detail.vue": detailParam,
            "src/todos.js": todosMod,
          },
          expected: {
            kind: "crash",
            message: "沙箱 iframe 没有配合的服务器路径。History 模式会把预览导航到不存在的路径，或打到父页面。Hash 才是这种预览的正确历史。",
          },
          lesson: "History 需要服务器把所有路径指回 index.html。教学预览用 Hash。",
        },
      ],
      explanation: {
        headline: "导航有三道缝",
        body: "插件把 router 注入应用。匹配把 URL 变成记录。RouterView 把记录变成组件。params 把路径变成页面输入。拆哪一道，失败的脸不同。",
      },
      tryThis: "三种消融都点一次「学路由」。空白、报错、预览翻车，对上号再恢复。",
    },
    {
      id: "router-s7",
      tick: "S7",
      title: "换：设置里的两个 Tab",
      goal: "资料 / 账单。刷新后还该停在账单吗？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "这段程序用 tab ref 切「资料 / 账单」。刷新后会？",
        choices: [
          { id: "bill", label: "若刚才在账单，刷新还在账单", correct: false, why: "tab 是内存。刷新回到 'profile'。" },
          { id: "reset", label: "回到资料。tab 不是 URL", correct: true, why: "和 selectedId 同一张图。该走两条路由，而不是一个 ref。" },
          { id: "err", label: "报错", correct: false, why: "能跑。只是不可分享、不可后退。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "tabs", label: "换场景：设置 Tab" }],
        narration: "待办详情换成设置。问的仍是：这份「现在哪一页」该不该进地址。",
      },
      observe: {
        state: [{ id: "tab", label: "tab", value: "'profile'", symbol: "tab" }],
        dom: [{ id: "p", label: "p", value: "名字：Ada" }],
        events: [],
      },
      nodes: [
        { id: "tab", kind: "ref", label: "tab", symbol: "tab" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "tab", to: "dom" }],
      ablations: [
        {
          id: "routes",
          prompt: "拆成 /profile 和 /billing 之后？",
          files: {
            "src/main.js": settingsMain,
            "src/App.vue": settingsApp,
          },
          expected: {
            kind: "stale",
            message: "这是修复：两个 Tab 是两条路由。刷新、后退、分享都认地址。",
          },
          lesson: "World 3 收束：composable 决定状态份数，Pinia 给应用级单例身份，路由让 URL 成为当前页的源。",
        },
      ],
      explanation: {
        headline: "Todo 已经是一个小 SPA",
        body: "列表、表单、组件、插槽、共享状态、仓库、页面。下一世界会让这份应用去请求——loading、错误、竞态。机制已经可以迁移。",
      },
      tryThis: "先切到账单再想刷新会怎样。再打开「拆成两条路由」，用链接切换。",
    },
  ],
};
