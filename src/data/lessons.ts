export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explain: string;
};

export type DemoKind =
  | "counter"
  | "template"
  | "ref-vs-reactive"
  | "computed"
  | "list"
  | "events"
  | "form"
  | "component"
  | "lifecycle"
  | "todo"
  | "router"
  | "pinia"
  | "challenge"
  | "slots"
  | "provide"
  | "async"
  | "guard"
  | "validate"
  | "teleport"
  | "keepalive"
  | "directive"
  | "class-style"
  | "watchers"
  | "template-ref"
  | "component-vmodel"
  | "fallthrough"
  | "async-comp"
  | "transition"
  | "suspense"
  | "plugins"
  | "conditional"
  | "transition-group"
  | "sfc-css"
  | "options-api"
  | "web-components"
  | "animation"
  | "registration"
  | "script-setup"
  | "directives-ref";

export type LessonBlock =
  | { type: "text"; title?: string; body: string }
  | { type: "code"; title?: string; lang?: string; code: string }
  | { type: "tip"; body: string }
  | { type: "demo"; kind: DemoKind; title: string; hint?: string }
  | { type: "quiz"; questions: QuizQuestion[] };

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  level: "入门" | "进阶" | "实战";
  track: "基础" | "进阶" | "全栈准备" | "全栈实训" | "工程化" | "进阶模式" | "官网对齐";
  minutes: number;
  /** 官网路径（相对 cn.vuejs.org），如 /guide/essentials/template-syntax.html */
  official?: string;
  blocks: LessonBlock[];
};

export const LESSONS: Lesson[] = [
  {
    slug: "intro",
    title: "Vue 3 是什么",
    summary: "渐进式框架与组合式 API。",
    level: "入门",
    track: "基础",
    minutes: 6,
    official: "/guide/introduction.html",
    blocks: [
      {
        type: "text",
        title: "Vue 是什么",
        body: "Vue 是渐进式 UI 框架：声明式模板 + 响应式数据。改数据，视图自动更新。Vue 3 推荐 Composition API（setup / ref / reactive）。\n\n学习方法：先看「对应源码」，再点 Demo 验证 — 源码里的 count 就是 Demo 里跳动的数字。",
      },
      {
        type: "code",
        title: "对应源码 · 计数器 · Composition API",
        lang: "vue",
        code: '<script setup>\nimport { ref } from \'vue\'\nconst count = ref(0)\n</script>\n\n<template>\n  <p>点了 {{ count }} 次</p>\n  <button @click="count++">count++</button>\n  <button @click="count = 0">重置</button>\n</template>',
      },
      { type: "demo", kind: "counter", title: "动手：计数器" },
      {
        type: "quiz",
        questions: [
          {
            id: "i1",
            question: "Vue 核心？",
            options: ["手写 DOM", "声明式 + 数据驱动", "仅类组件", "jQuery"],
            answer: 1,
            explain: "声明式与响应式。",
          },
          {
            id: "i2",
            question: "Vue 3 推荐？",
            options: ["仅 Options", "组合式 API", "仅 Class", "仅 JSX"],
            answer: 1,
            explain: "Composition API。",
          },
        ],
      },
    ],
  },
  {
    slug: "template",
    title: "模板语法",
    summary: "插值与指令。",
    level: "入门",
    track: "基础",
    minutes: 8,
    official: "/guide/essentials/template-syntax.html",
    blocks: [
      {
        type: "text",
        title: "模板语法",
        body: "模板里用 {{ }} 插值，用 :attr / v-bind 绑属性，用 v-if / v-show 控制显示。v-html 会插入原始 HTML，注意 XSS。\n\n改 Demo 左侧数据，右侧立刻反映绑定结果。",
      },
      {
        type: "code",
        title: "对应源码 · 模板插值与绑定",
        lang: "vue",
        code: "<script setup>\nimport { ref } from 'vue'\nconst msg = ref('你好，Vue')\nconst isActive = ref(true)\n</script>\n\n<template>\n  <p>{{ msg }}</p>\n  <p :class=\"{ active: isActive }\">\n    :class 绑定 → {{ isActive ? 'active' : 'inactive' }}\n  </p>\n</template>",
      },
      { type: "demo", kind: "template", title: "动手：模板" },
      {
        type: "quiz",
        questions: [
          {
            id: "t1",
            question: "v-bind 简写？",
            options: [":", "@", "#", "."],
            answer: 0,
            explain: ":title",
          },
          {
            id: "t2",
            question: "v-html 风险？",
            options: ["慢", "XSS", "移除", "仅数字"],
            answer: 1,
            explain: "XSS。",
          },
        ],
      },
    ],
  },
  {
    slug: "reactivity",
    title: "响应式：ref 与 reactive",
    summary: ".value 与解构。",
    level: "入门",
    track: "基础",
    minutes: 10,
    official: "/guide/essentials/reactivity-fundamentals.html",
    blocks: [
      {
        type: "text",
        title: "ref 与 reactive",
        body: "ref 适合基本类型，脚本里用 .value；模板自动解包。reactive 适合对象，但不能直接解构（会丢响应式，需 toRefs）。\n\n对照 Demo：左边点 count.value++，右边改 reactive 字段。",
      },
      {
        type: "code",
        title: "对应源码 · ref 与 reactive",
        lang: "vue",
        code: "<script setup>\nimport { ref, reactive } from 'vue'\nconst count = ref(0)\nconst state = reactive({ name: 'Vue', n: 1 })\n// 脚本中读/写 ref 用 .value\n// 解构 reactive 会丢响应式 → 用 toRefs(state)\n</script>\n\n<template>\n  <p>{{ count }}</p>\n  <button @click=\"count++\">count.value++</button>\n  <p>{{ state.name }} / {{ state.n }}</p>\n  <button @click=\"state.n++\">state.n++</button>\n</template>",
      },
      { type: "demo", kind: "ref-vs-reactive", title: "动手：响应式" },
      {
        type: "quiz",
        questions: [
          {
            id: "r1",
            question: "脚本读 ref？",
            options: ["count", "count.value", "count()", "val"],
            answer: 1,
            explain: ".value",
          },
          {
            id: "r2",
            question: "解构 reactive？",
            options: ["更快", "丢响应式", "变 ref", "报错"],
            answer: 1,
            explain: "toRefs。",
          },
        ],
      },
    ],
  },
  {
    slug: "computed",
    title: "计算属性与侦听器",
    summary: "computed / watch。",
    level: "入门",
    track: "基础",
    minutes: 10,
    official: "/guide/essentials/computed.html",
    blocks: [
      {
        type: "text",
        title: "computed 与 watch",
        body: "computed 是有缓存的派生值，依赖不变不重算。watch / watchEffect 做副作用（日志、请求）。不要在 computed 里发请求。",
      },
      {
        type: "code",
        title: "对应源码 · computed + watch",
        lang: "vue",
        code: "<script setup>\nimport { ref, computed, watch } from 'vue'\nconst first = ref('Ada')\nconst last = ref('Lovelace')\nconst full = computed(() => `${first.value} ${last.value}`)\nwatch(full, (v) => console.log('watch →', v))\n</script>\n\n<template>\n  <input v-model=\"first\" />\n  <input v-model=\"last\" />\n  <p>{{ full }}</p>\n</template>",
      },
      { type: "demo", kind: "computed", title: "动手：computed" },
      {
        type: "quiz",
        questions: [
          {
            id: "c1",
            question: "computed？",
            options: ["无缓存", "有缓存", "仅 Options", "无返回"],
            answer: 1,
            explain: "依赖缓存。",
          },
          {
            id: "c2",
            question: "watchEffect？",
            options: ["指定源", "自动追踪", "一次", "不能清"],
            answer: 1,
            explain: "自动依赖。",
          },
        ],
      },
    ],
  },
  {
    slug: "list-render",
    title: "条件与列表渲染",
    summary: "v-if / v-for。",
    level: "入门",
    track: "基础",
    minutes: 9,
    official: "/guide/essentials/list.html",
    blocks: [
      {
        type: "text",
        title: "条件与列表",
        body: "v-if 真正挂载/卸载节点；频繁切换用 v-show。v-for 必须绑稳定 :key（业务 id），避免用会变的 index 当 key。",
      },
      {
        type: "code",
        title: "对应源码 · v-if / v-for + key",
        lang: "vue",
        code: '<script setup>\nimport { ref } from \'vue\'\nconst show = ref(true)\nconst items = ref([\n  { id: 1, text: \'学 ref\' },\n  { id: 2, text: \'学 v-for\' },\n])\nlet nextId = 3\nfunction add(text) {\n  items.value.push({ id: nextId++, text })\n}\nfunction remove(id) {\n  items.value = items.value.filter((x) => x.id !== id)\n}\n</script>\n\n<template>\n  <label><input type="checkbox" v-model="show" /> v-if</label>\n  <ul v-if="show">\n    <li v-for="item in items" :key="item.id">\n      {{ item.text }}\n      <button @click="remove(item.id)">删</button>\n    </li>\n  </ul>\n  <p v-else>已隐藏</p>\n</template>',
      },
      { type: "demo", kind: "list", title: "动手：列表" },
      {
        type: "quiz",
        questions: [
          {
            id: "l1",
            question: "key？",
            options: ["可省", "识别节点", "CSS", "请求"],
            answer: 1,
            explain: "diff。",
          },
          {
            id: "l2",
            question: "频繁显隐？",
            options: ["v-if", "v-show", "v-html", "v-once"],
            answer: 1,
            explain: "v-show。",
          },
        ],
      },
    ],
  },
  {
    slug: "events",
    title: "事件处理",
    summary: "v-on 修饰符。",
    level: "入门",
    track: "基础",
    minutes: 7,
    official: "/guide/essentials/event-handling.html",
    blocks: [
      {
        type: "text",
        title: "事件处理",
        body: "@click 是 v-on:click 简写。修饰符 .prevent / .stop / .once 覆盖常见 DOM 需求。方法里可接收 $event。",
      },
      {
        type: "code",
        title: "对应源码 · 事件与修饰符",
        lang: "vue",
        code: '<script setup>\nimport { ref } from \'vue\'\nconst n = ref(0)\nfunction add(step = 1) { n.value += step }\nfunction onSubmit(e) { /* .prevent 已拦默认提交 */ }\n</script>\n\n<template>\n  <p>{{ n }}</p>\n  <button @click="n++">@click +1</button>\n  <button @click="add(5)">@click="add(5)"</button>\n  <form @submit.prevent="onSubmit">\n    <button type="submit">@submit.prevent</button>\n  </form>\n</template>',
      },
      { type: "demo", kind: "events", title: "动手：事件" },
      {
        type: "quiz",
        questions: [
          {
            id: "e1",
            question: ".prevent？",
            options: ["冒泡", "preventDefault", "一次", "捕获"],
            answer: 1,
            explain: "默认行为。",
          },
        ],
      },
    ],
  },
  {
    slug: "forms",
    title: "表单与 v-model",
    summary: "双向绑定。",
    level: "入门",
    track: "基础",
    minutes: 9,
    official: "/guide/essentials/forms.html",
    blocks: [
      {
        type: "text",
        title: "v-model",
        body: "v-model 是 :value + @input 的语法糖。修饰符 .trim / .number / .lazy 很实用。复选框绑定布尔，select 绑定字符串。",
      },
      {
        type: "code",
        title: "对应源码 · v-model 表单",
        lang: "vue",
        code: '<script setup>\nimport { ref } from \'vue\'\nconst name = ref(\'\')\nconst age = ref(18)\nconst agree = ref(false)\nconst color = ref(\'green\')\n</script>\n\n<template>\n  <input v-model.trim="name" />\n  <input v-model.number="age" type="number" />\n  <input type="checkbox" v-model="agree" />\n  <select v-model="color">\n    <option value="green">绿</option>\n    <option value="blue">蓝</option>\n  </select>\n  <pre>{{ { name, age, agree, color } }}</pre>\n</template>',
      },
      { type: "demo", kind: "form", title: "动手：表单" },
      {
        type: "quiz",
        questions: [
          {
            id: "f1",
            question: ".number？",
            options: ["限长", "转数字", "整数", "禁用"],
            answer: 1,
            explain: "数字。",
          },
        ],
      },
    ],
  },
  {
    slug: "components",
    title: "组件基础",
    summary: "SFC。",
    level: "进阶",
    track: "基础",
    minutes: 10,
    official: "/guide/essentials/component-basics.html",
    blocks: [
      {
        type: "text",
        title: "单文件组件",
        body: "SFC = template + script + style。每个组件实例有独立状态：父组件挂两个 CounterCard，各自的 n 互不影响。",
      },
      {
        type: "code",
        title: "对应源码 · 父子组件实例",
        lang: "vue",
        code: '<!-- CounterCard.vue -->\n<script setup>\nimport { ref } from \'vue\'\ndefineProps<{ label: string }>()\nconst n = ref(0)\n</script>\n<template>\n  <div>\n    <p>{{ label }}</p>\n    <p>{{ n }}</p>\n    <button @click="n++">子组件 +1</button>\n  </div>\n</template>\n\n<!-- Parent.vue -->\n<template>\n  <CounterCard label="#1" />\n  <CounterCard label="#2" />\n</template>',
      },
      { type: "demo", kind: "component", title: "动手：组件" },
      {
        type: "quiz",
        questions: [
          {
            id: "cp1",
            question: "SFC？",
            options: ["服务", "单文件组件", "函数", "样式"],
            answer: 1,
            explain: ".vue",
          },
        ],
      },
    ],
  },
  {
    slug: "props-emits",
    title: "Props 与 Emits",
    summary: "单向数据流。",
    level: "进阶",
    track: "基础",
    minutes: 11,
    official: "/guide/components/props.html",
    blocks: [
      {
        type: "text",
        title: "Props 与 Emits",
        body: "数据父→子用 props（单向）；子→父用 emit 事件。不要在子组件里改 props。Todo 是练习 props/emit 的好场景。",
      },
      {
        type: "code",
        title: "对应源码 · Todo：props / emit 思路",
        lang: "vue",
        code: '<script setup>\nimport { ref } from \'vue\'\nconst items = ref([\n  { id: 1, text: \'读完 Props\', done: false },\n  { id: 2, text: \'完成测验\', done: true },\n])\nconst draft = ref(\'\')\nlet nextId = 3\nfunction add() {\n  const t = draft.value.trim()\n  if (!t) return\n  items.value.push({ id: nextId++, text: t, done: false })\n  draft.value = \'\'\n}\nfunction toggle(id) {\n  const it = items.value.find((x) => x.id === id)\n  if (it) it.done = !it.done\n}\nfunction remove(id) {\n  items.value = items.value.filter((x) => x.id !== id)\n}\n</script>\n\n<template>\n  <input v-model="draft" @keyup.enter="add" />\n  <button @click="add">添加</button>\n  <li v-for="it in items" :key="it.id">\n    <input type="checkbox" :checked="it.done" @change="toggle(it.id)" />\n    <span :class="{ done: it.done }">{{ it.text }}</span>\n    <button @click="remove(it.id)">删</button>\n  </li>\n</template>',
      },
      { type: "demo", kind: "todo", title: "动手：Todo" },
      {
        type: "quiz",
        questions: [
          {
            id: "p1",
            question: "子改父？",
            options: ["改 props", "emit", "window", "v-html"],
            answer: 1,
            explain: "事件。",
          },
        ],
      },
    ],
  },
  {
    slug: "lifecycle",
    title: "生命周期",
    summary: "挂载清理。",
    level: "进阶",
    track: "基础",
    minutes: 8,
    official: "/guide/essentials/lifecycle.html",
    blocks: [
      {
        type: "text",
        title: "生命周期",
        body: "onMounted 适合 DOM 操作与启动定时器/订阅；onUnmounted 必须清理，否则泄漏。组合式 API 用函数注册钩子。",
      },
      {
        type: "code",
        title: "对应源码 · onMounted / onUnmounted",
        lang: "vue",
        code: "<script setup>\nimport { ref, onMounted, onUnmounted } from 'vue'\nconst ticks = ref(0)\nlet id\nonMounted(() => {\n  id = setInterval(() => ticks.value++, 1000)\n})\nonUnmounted(() => clearInterval(id))\n</script>\n\n<template>\n  <p>{{ ticks }}s</p>\n</template>",
      },
      { type: "demo", kind: "lifecycle", title: "动手：生命周期" },
      {
        type: "quiz",
        questions: [
          {
            id: "lf1",
            question: "onMounted？",
            options: ["定义 ref", "DOM/请求", "改 props", "CSS"],
            answer: 1,
            explain: "副作用。",
          },
        ],
      },
    ],
  },
  {
    slug: "composition",
    title: "组合式 API 实践",
    summary: "composable。",
    level: "实战",
    track: "基础",
    minutes: 12,
    official: "/guide/reusability/composables.html",
    blocks: [
      {
        type: "text",
        title: "Composable",
        body: "把可复用逻辑抽成 useXxx()，在多个组件 setup 中调用。命名约定 use 前缀，内部仍用 ref/computed。",
      },
      {
        type: "code",
        title: "对应源码 · 计数器 · Composition API",
        lang: "vue",
        code: '<script setup>\nimport { ref } from \'vue\'\nconst count = ref(0)\n</script>\n\n<template>\n  <p>点了 {{ count }} 次</p>\n  <button @click="count++">count++</button>\n  <button @click="count = 0">重置</button>\n</template>',
      },
      { type: "demo", kind: "counter", title: "useXxx 思路" },
      {
        type: "quiz",
        questions: [
          {
            id: "co1",
            question: "命名？",
            options: ["get", "useXxx", "make", "Svc"],
            answer: 1,
            explain: "use。",
          },
          {
            id: "co2",
            question: "收益？",
            options: ["无 TS", "逻辑复用", "无构建", "无组件"],
            answer: 1,
            explain: "复用。",
          },
        ],
      },
    ],
  },
  {
    slug: "router",
    title: "Vue Router 路由",
    summary: "SPA 导航。",
    level: "进阶",
    track: "进阶",
    minutes: 14,
    official: "/guide/scaling-up/routing.html",
    blocks: [
      {
        type: "text",
        title: "Vue Router",
        body: "RouterLink 做 SPA 导航（不整页刷新），RouterView 渲染匹配组件。useRoute 读参数，useRouter 编程式跳转。",
      },
      {
        type: "code",
        title: "对应源码 · Vue Router 最小结构",
        lang: "vue",
        code: "// router/index.ts\nimport { createRouter, createWebHistory } from 'vue-router'\nconst routes = [\n  { path: '/', component: Home },\n  { path: '/lesson/:slug', component: Lesson },\n  { path: '/about', component: About },\n]\nexport default createRouter({ history: createWebHistory(), routes })\n\n// App.vue\n<template>\n  <RouterLink to=\"/\">/</RouterLink>\n  <RouterLink to=\"/lesson/intro\">/lesson/intro</RouterLink>\n  <RouterView />\n</template>\n\n// 页面里\nimport { useRoute, useRouter } from 'vue-router'\nconst route = useRoute()   // route.params.slug\nconst router = useRouter() // router.push(...)",
      },
      { type: "demo", kind: "router", title: "动手：路由" },
      {
        type: "quiz",
        questions: [
          {
            id: "rt1",
            question: "RouterLink？",
            options: ["仅相对", "SPA 无刷新", "刷新", "无参"],
            answer: 1,
            explain: "客户端。",
          },
          {
            id: "rt2",
            question: "读参数？",
            options: ["useStore", "useRoute", "useAttrs", "css"],
            answer: 1,
            explain: "useRoute。",
          },
        ],
      },
    ],
  },
  {
    slug: "pinia",
    title: "Pinia 状态管理",
    summary: "跨组件 store。",
    level: "进阶",
    track: "进阶",
    minutes: 12,
    official: "/guide/scaling-up/state-management.html",
    blocks: [
      {
        type: "text",
        title: "Pinia",
        body: "官方推荐的全局状态。setup store 写法与组件一致：ref + computed + function。多个组件 useXxxStore() 共享同一份状态。",
      },
      {
        type: "code",
        title: "对应源码 · Pinia setup store",
        lang: "ts",
        code: "// stores/cart.ts\nimport { defineStore } from 'pinia'\nimport { ref, computed } from 'vue'\nexport const useCartStore = defineStore('cart', () => {\n  const items = ref<string[]>(['学 Pinia'])\n  const count = computed(() => items.value.length)\n  function add(text: string) {\n    if (text.trim()) items.value.push(text.trim())\n  }\n  return { items, count, add }\n})\n\n// 任意组件\nconst cart = useCartStore()\ncart.add('新商品')\n// cart.items / cart.count 跨组件共享",
      },
      { type: "demo", kind: "pinia", title: "动手：Pinia" },
      {
        type: "quiz",
        questions: [
          {
            id: "pi1",
            question: "Pinia？",
            options: ["mutations", "轻量 TS", "仅 Options", "单 store"],
            answer: 1,
            explain: "官方推荐。",
          },
          {
            id: "pi2",
            question: "改状态？",
            options: ["commit", "直接改", "dispatch", "仅外"],
            answer: 1,
            explain: "setup store。",
          },
        ],
      },
    ],
  },
  {
    slug: "pitfalls",
    title: "常见坑与性能",
    summary: "响应式陷阱。",
    level: "实战",
    track: "进阶",
    minutes: 11,
    blocks: [
      {
        type: "text",
        title: "常见坑",
        body: "解构 reactive、在 computed 里请求、忘记 key、大列表深度响应式——这些是性能与正确性的高频坑。用 Demo 对照错误/正确写法。",
      },
      {
        type: "code",
        title: "对应源码 · 响应式陷阱（错误 vs 正确）",
        lang: "vue",
        code: "// ❌ 解构 reactive 丢响应\nconst state = reactive({ n: 0 })\nlet { n } = state  // n 不再响应\nn++\n\n// ✅ toRefs\nconst { n } = toRefs(state)\nn.value++\n\n// ❌ computed 里发请求\nconst data = computed(() => fetch('/api')) // 副作用！\n\n// ✅ watch / 事件里请求\nwatch(id, async (v) => { data.value = await api(v) })\n\n// 大对象用 shallowRef，替换整个 .value 才触发",
      },
      { type: "demo", kind: "challenge", title: "挑战：修响应式" },
      {
        type: "quiz",
        questions: [
          {
            id: "pf1",
            question: "shallowRef？",
            options: ["深度", "只替换 value", "不能对象", "reactive"],
            answer: 1,
            explain: "浅层。",
          },
          {
            id: "pf2",
            question: "computed 请求？",
            options: ["好", "不好", "Vue2", "LS"],
            answer: 1,
            explain: "副作用用 watch。",
          },
        ],
      },
    ],
  },
  {
    slug: "project",
    title: "从零搭一个小项目",
    summary: "Vite 起步。",
    level: "实战",
    track: "进阶",
    minutes: 13,
    blocks: [
      {
        type: "text",
        title: "从零小项目",
        body: "Vite 脚手架 create vue@latest；环境变量前缀 VITE_。先跑通 Todo + 路由，再接 API。",
      },
      {
        type: "code",
        title: "对应源码 · Todo：props / emit 思路",
        lang: "vue",
        code: '<script setup>\nimport { ref } from \'vue\'\nconst items = ref([\n  { id: 1, text: \'读完 Props\', done: false },\n  { id: 2, text: \'完成测验\', done: true },\n])\nconst draft = ref(\'\')\nlet nextId = 3\nfunction add() {\n  const t = draft.value.trim()\n  if (!t) return\n  items.value.push({ id: nextId++, text: t, done: false })\n  draft.value = \'\'\n}\nfunction toggle(id) {\n  const it = items.value.find((x) => x.id === id)\n  if (it) it.done = !it.done\n}\nfunction remove(id) {\n  items.value = items.value.filter((x) => x.id !== id)\n}\n</script>\n\n<template>\n  <input v-model="draft" @keyup.enter="add" />\n  <button @click="add">添加</button>\n  <li v-for="it in items" :key="it.id">\n    <input type="checkbox" :checked="it.done" @change="toggle(it.id)" />\n    <span :class="{ done: it.done }">{{ it.text }}</span>\n    <button @click="remove(it.id)">删</button>\n  </li>\n</template>',
      },
      { type: "demo", kind: "todo", title: "综合 Todo" },
      {
        type: "tip",
        body: "v7：进阶模式 + 速查表。完成工坊闯关与全部路径可解锁结业证明。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "pj1",
            question: "Vite 前缀？",
            options: ["REACT_APP_", "VITE_", "NEXT_", "PUBLIC_"],
            answer: 1,
            explain: "VITE_。",
          },
          {
            id: "pj2",
            question: "脚手架？",
            options: ["create vue@latest", "vue create", "CRA", "next"],
            answer: 0,
            explain: "官方。",
          },
        ],
      },
    ],
  },
  {
    slug: "slots",
    title: "插槽 Slots",
    summary: "组合 UI。",
    level: "进阶",
    track: "全栈准备",
    minutes: 12,
    official: "/guide/components/slots.html",
    blocks: [
      {
        type: "text",
        title: "插槽",
        body: "slot 让父组件填充子组件的「洞」。#header 是具名插槽；作用域插槽让父用上子暴露的数据。",
      },
      {
        type: "code",
        title: "对应源码 · 默认 / 具名 / 作用域插槽",
        lang: "vue",
        code: '<!-- Card.vue -->\n<template>\n  <header><slot name="header">默认标题</slot></header>\n  <main><slot /></main>\n  <footer>\n    <slot name="footer" :count="3">默认脚</slot>\n  </footer>\n</template>\n\n<!-- 使用 -->\n<Card>\n  <template #header>自定义头</template>\n  默认插槽内容\n  <template #footer="{ count }">共 {{ count }} 项</template>\n</Card>',
      },
      { type: "demo", kind: "slots", title: "动手：插槽" },
      {
        type: "quiz",
        questions: [
          {
            id: "sl1",
            question: "具名简写？",
            options: ["@", "#", ":", "."],
            answer: 1,
            explain: "#",
          },
          {
            id: "sl2",
            question: "作用域插槽？",
            options: ["穿透", "父用子数据", "替代 props", "SSR"],
            answer: 1,
            explain: "slot props。",
          },
        ],
      },
    ],
  },
  {
    slug: "provide-inject",
    title: "Provide / Inject",
    summary: "跨层注入。",
    level: "进阶",
    track: "全栈准备",
    minutes: 11,
    official: "/guide/components/provide-inject.html",
    blocks: [
      {
        type: "text",
        title: "Provide / Inject",
        body: "跨多层传值不必层层 props。树内共享用 provide/inject；全局复杂状态用 Pinia。TS 用 InjectionKey。",
      },
      {
        type: "code",
        title: "对应源码 · provide / inject",
        lang: "vue",
        code: "// keys.ts\nimport type { InjectionKey, Ref } from 'vue'\nexport const themeKey: InjectionKey<Ref<'dark'|'light'>> = Symbol('theme')\n\n// Ancestor.vue\nimport { provide, ref } from 'vue'\nimport { themeKey } from './keys'\nconst theme = ref<'dark'|'light'>('dark')\nprovide(themeKey, theme)\n\n// DeepChild.vue\nimport { inject } from 'vue'\nimport { themeKey } from './keys'\nconst theme = inject(themeKey)!\n// theme.value",
      },
      { type: "demo", kind: "provide", title: "动手：注入" },
      {
        type: "quiz",
        questions: [
          {
            id: "pr1",
            question: "vs Pinia？",
            options: ["替代", "树内 vs 全局", "字符串", "Options"],
            answer: 1,
            explain: "职责不同。",
          },
          {
            id: "pr2",
            question: "InjectionKey？",
            options: ["快", "类型+唯一", "必须", "体积"],
            answer: 1,
            explain: "TS。",
          },
        ],
      },
    ],
  },
  {
    slug: "async-data",
    title: "异步数据与请求态",
    summary: "loading / error。",
    level: "实战",
    track: "全栈准备",
    minutes: 14,
    blocks: [
      {
        type: "text",
        title: "异步三态",
        body: "每个请求至少处理 loading / error / success。离开页面用 AbortController 取消，避免卸载后仍更新状态。",
      },
      {
        type: "code",
        title: "对应源码 · 请求三态 loading / error / data",
        lang: "vue",
        code: "<script setup>\nimport { ref } from 'vue'\nconst status = ref('idle') // idle | loading | ok | error\nconst items = ref([])\nasync function load(ok = true) {\n  status.value = 'loading'\n  items.value = []\n  try {\n    await new Promise((r) => setTimeout(r, 700))\n    if (!ok) throw new Error('fail')\n    items.value = ['学 fetch', '处理 loading', '处理 error']\n    status.value = 'ok'\n  } catch {\n    status.value = 'error'\n  }\n}\n// 离开页面：AbortController.abort()\n</script>\n\n<template>\n  <button @click=\"load(true)\">成功</button>\n  <button @click=\"load(false)\">失败</button>\n  <p v-if=\"status==='loading'\">loading…</p>\n  <p v-else-if=\"status==='error'\">error</p>\n  <ul v-else-if=\"status==='ok'\">\n    <li v-for=\"t in items\" :key=\"t\">{{ t }}</li>\n  </ul>\n</template>",
      },
      { type: "demo", kind: "async", title: "动手：三态" },
      {
        type: "quiz",
        questions: [
          {
            id: "as1",
            question: "离开页？",
            options: ["忽略", "Abort", "锁按钮", "window"],
            answer: 1,
            explain: "取消。",
          },
          {
            id: "as2",
            question: "最少状态？",
            options: ["成功", "loading/error/成功", "error", "skeleton"],
            answer: 1,
            explain: "三态。",
          },
        ],
      },
    ],
  },
  {
    slug: "route-guards",
    title: "路由守卫与鉴权心智",
    summary: "beforeEach。",
    level: "实战",
    track: "全栈准备",
    minutes: 13,
    blocks: [
      {
        type: "text",
        title: "路由守卫",
        body: "beforeEach 可做登录门禁，未登录带 redirect 回跳。前端守卫只改善体验，真正安全靠服务端验 token。",
      },
      {
        type: "code",
        title: "对应源码 · 路由守卫门禁",
        lang: "ts",
        code: "// router/index.ts\nrouter.beforeEach((to) => {\n  const token = localStorage.getItem('token')\n  if (to.meta.requiresAuth && !token) {\n    return { path: '/login', query: { redirect: to.fullPath } }\n  }\n})\n\n// 路由表\n{ path: '/dashboard', component: Dash, meta: { requiresAuth: true } }\n\n// 登录成功后\nrouter.push((route.query.redirect as string) || '/dashboard')\n\n// 注意：前端守卫 ≠ 安全，服务端必须再验 token",
      },
      { type: "demo", kind: "guard", title: "动手：门禁" },
      {
        type: "quiz",
        questions: [
          {
            id: "gd1",
            question: "前端守卫=安全？",
            options: ["是", "否", "CSRF", "CORS"],
            answer: 1,
            explain: "服务端必验。",
          },
          {
            id: "gd2",
            question: "回跳？",
            options: ["写死", "redirect", "reload", "back"],
            answer: 1,
            explain: "query。",
          },
        ],
      },
    ],
  },
  {
    slug: "form-validate",
    title: "表单校验",
    summary: "字段错误。",
    level: "实战",
    track: "全栈准备",
    minutes: 12,
    blocks: [
      {
        type: "text",
        title: "表单校验",
        body: "字段级错误信息比笼统 toast 更可修正。前端校验提升 UX，后端仍须校验。",
      },
      {
        type: "code",
        title: "对应源码 · 字段级表单校验",
        lang: "vue",
        code: "<script setup>\nimport { reactive, ref } from 'vue'\nconst form = reactive({ email: '', password: '' })\nconst errors = reactive({ email: '', password: '' })\nconst ok = ref(false)\nfunction submit() {\n  errors.email = /@/.test(form.email) ? '' : '邮箱格式不对'\n  errors.password = form.password.length >= 6 ? '' : '至少 6 位'\n  ok.value = !errors.email && !errors.password\n}\n</script>\n\n<template>\n  <input v-model=\"form.email\" />\n  <p v-if=\"errors.email\">{{ errors.email }}</p>\n  <input v-model=\"form.password\" type=\"password\" />\n  <p v-if=\"errors.password\">{{ errors.password }}</p>\n  <button @click=\"submit\">提交</button>\n  <p v-if=\"ok\">校验通过</p>\n</template>",
      },
      { type: "demo", kind: "validate", title: "动手：校验" },
      {
        type: "quiz",
        questions: [
          {
            id: "fv1",
            question: "前端校验=安全？",
            options: ["是", "否", "HTTPS", "Zod"],
            answer: 1,
            explain: "后端也要。",
          },
          {
            id: "fv2",
            question: "字段错误？",
            options: ["酷", "可知哪错", "少代码", "无 label"],
            answer: 1,
            explain: "可修正。",
          },
        ],
      },
    ],
  },
  {
    slug: "rest-api",
    title: "REST API 与 CRUD",
    summary: "资源与状态码。",
    level: "实战",
    track: "全栈实训",
    minutes: 14,
    blocks: [
      {
        type: "tip",
        body: "去全栈工坊完成 6 关闯关，对照请求日志。",
      },
      {
        type: "text",
        title: "REST / CRUD",
        body: "资源用名词路径；POST 创建、GET 读、PATCH/PUT 改、DELETE 删。401 未认证、403 无权限、404 不存在。",
      },
      {
        type: "code",
        title: "对应源码 · 请求三态 loading / error / data",
        lang: "vue",
        code: "<script setup>\nimport { ref } from 'vue'\nconst status = ref('idle') // idle | loading | ok | error\nconst items = ref([])\nasync function load(ok = true) {\n  status.value = 'loading'\n  items.value = []\n  try {\n    await new Promise((r) => setTimeout(r, 700))\n    if (!ok) throw new Error('fail')\n    items.value = ['学 fetch', '处理 loading', '处理 error']\n    status.value = 'ok'\n  } catch {\n    status.value = 'error'\n  }\n}\n// 离开页面：AbortController.abort()\n</script>\n\n<template>\n  <button @click=\"load(true)\">成功</button>\n  <button @click=\"load(false)\">失败</button>\n  <p v-if=\"status==='loading'\">loading…</p>\n  <p v-else-if=\"status==='error'\">error</p>\n  <ul v-else-if=\"status==='ok'\">\n    <li v-for=\"t in items\" :key=\"t\">{{ t }}</li>\n  </ul>\n</template>",
      },
      { type: "demo", kind: "async", title: "复习：请求态" },
      {
        type: "quiz",
        questions: [
          {
            id: "rs1",
            question: "创建？",
            options: ["GET", "POST", "DELETE", "HEAD"],
            answer: 1,
            explain: "POST。",
          },
          {
            id: "rs2",
            question: "401？",
            options: ["成功", "未认证", "500", "301"],
            answer: 1,
            explain: "Unauthorized。",
          },
        ],
      },
    ],
  },
  {
    slug: "auth-token",
    title: "Token 登录与会话",
    summary: "Bearer 与 401。",
    level: "实战",
    track: "全栈实训",
    minutes: 13,
    blocks: [
      {
        type: "text",
        title: "Token 会话",
        body: "登录后带 Authorization: Bearer <token>。HttpOnly Cookie 可降低 XSS 偷 token 风险。401 时清会话并跳登录。",
      },
      {
        type: "code",
        title: "对应源码 · 路由守卫门禁",
        lang: "ts",
        code: "// router/index.ts\nrouter.beforeEach((to) => {\n  const token = localStorage.getItem('token')\n  if (to.meta.requiresAuth && !token) {\n    return { path: '/login', query: { redirect: to.fullPath } }\n  }\n})\n\n// 路由表\n{ path: '/dashboard', component: Dash, meta: { requiresAuth: true } }\n\n// 登录成功后\nrouter.push((route.query.redirect as string) || '/dashboard')\n\n// 注意：前端守卫 ≠ 安全，服务端必须再验 token",
      },
      { type: "demo", kind: "guard", title: "复习：门禁" },
      {
        type: "quiz",
        questions: [
          {
            id: "at1",
            question: "Bearer？",
            options: ["URL", "Authorization", "CSS", "不发"],
            answer: 1,
            explain: "请求头。",
          },
          {
            id: "at2",
            question: "HttpOnly？",
            options: ["快", "防 JS 偷 token", "免 HTTPS", "免 CSRF"],
            answer: 1,
            explain: "XSS 防护。",
          },
        ],
      },
    ],
  },
  {
    slug: "nuxt-map",
    title: "Nuxt 全栈地图",
    summary: "pages + server/api。",
    level: "实战",
    track: "全栈实训",
    minutes: 15,
    blocks: [
      {
        type: "text",
        title: "Nuxt 地图",
        body: "pages/ 文件系统路由；server/api/*.ts 是 Nitro 服务端接口；useFetch 对 SSR 友好。",
      },
      {
        type: "code",
        title: "结构",
        lang: "text",
        code: `pages/\nserver/api/notes.get.ts\ncomposables/`,
      },
      {
        type: "quiz",
        questions: [
          {
            id: "nx1",
            question: "notes.get.ts？",
            options: ["静态", "GET /api/notes", "仅客户端", "Pinia"],
            answer: 1,
            explain: "Nitro。",
          },
          {
            id: "nx2",
            question: "useFetch？",
            options: ["无差", "SSR 友好", "无 TS", "仅 POST"],
            answer: 1,
            explain: "集成数据获取。",
          },
        ],
      },
    ],
  },
  {
    slug: "capstone",
    title: "毕业作品清单",
    summary: "可演示产品。",
    level: "实战",
    track: "全栈实训",
    minutes: 10,
    blocks: [
      {
        type: "code",
        title: "验收",
        lang: "text",
        code: `[ ] 登录退出\n[ ] CRUD\n[ ] 校验\n[ ] 部署`,
      },
      {
        type: "text",
        title: "毕业作品",
        body: "可演示的最小全栈：登录退出 + CRUD + 校验 + 部署链接 + README 演示账号。",
      },
      { type: "demo", kind: "todo", title: "热身" },
      {
        type: "quiz",
        questions: [
          {
            id: "cap1",
            question: "作品最少？",
            options: ["静态", "鉴权+CRUD", "CSS", "动画"],
            answer: 1,
            explain: "全栈协作。",
          },
          {
            id: "cap2",
            question: "演示账号？",
            options: ["不写", "README", "口口", "CSS"],
            answer: 1,
            explain: "可评审。",
          },
        ],
      },
    ],
  },
  {
    slug: "vue-ts",
    title: "Vue 与 TypeScript",
    summary: "类型化 props/API。",
    level: "实战",
    track: "工程化",
    minutes: 14,
    official: "/guide/typescript/composition-api.html",
    blocks: [
      {
        type: "code",
        title: "defineProps",
        lang: "ts",
        code: `defineProps<{ title: string; count?: number }>()\ndefineEmits<{ save: [id: string] }>()`,
      },
      {
        type: "text",
        title: "Vue + TS",
        body: "defineProps / defineEmits 泛型让模板与脚本同类型。API 响应定义 interface，禁止 any 甩锅。",
      },
      { type: "demo", kind: "form", title: "表单也要类型" },
      {
        type: "quiz",
        questions: [
          {
            id: "ts1",
            question: "props 类型？",
            options: ["无", "defineProps<{}>()", "PropTypes", "any"],
            answer: 1,
            explain: "泛型 props。",
          },
          {
            id: "ts2",
            question: "API JSON？",
            options: ["any", "定义类型+错误", "忽略", "string"],
            answer: 1,
            explain: "类型与分支。",
          },
        ],
      },
    ],
  },
  {
    slug: "api-client",
    title: "封装 API 客户端",
    summary: "统一 token 与错误。",
    level: "实战",
    track: "工程化",
    minutes: 13,
    blocks: [
      {
        type: "tip",
        body: "组件不直接 fetch；走 notesApi.list(token)。",
      },
      {
        type: "text",
        title: "API 客户端",
        body: "统一封装 baseURL、token、错误映射。组件只调 notesApi.list()，不直接 fetch。",
      },
      {
        type: "code",
        title: "对应源码 · 请求三态 loading / error / data",
        lang: "vue",
        code: "<script setup>\nimport { ref } from 'vue'\nconst status = ref('idle') // idle | loading | ok | error\nconst items = ref([])\nasync function load(ok = true) {\n  status.value = 'loading'\n  items.value = []\n  try {\n    await new Promise((r) => setTimeout(r, 700))\n    if (!ok) throw new Error('fail')\n    items.value = ['学 fetch', '处理 loading', '处理 error']\n    status.value = 'ok'\n  } catch {\n    status.value = 'error'\n  }\n}\n// 离开页面：AbortController.abort()\n</script>\n\n<template>\n  <button @click=\"load(true)\">成功</button>\n  <button @click=\"load(false)\">失败</button>\n  <p v-if=\"status==='loading'\">loading…</p>\n  <p v-else-if=\"status==='error'\">error</p>\n  <ul v-else-if=\"status==='ok'\">\n    <li v-for=\"t in items\" :key=\"t\">{{ t }}</li>\n  </ul>\n</template>",
      },
      { type: "demo", kind: "async", title: "client 与三态" },
      {
        type: "quiz",
        questions: [
          {
            id: "ac1",
            question: "封装目的？",
            options: ["变长", "统一鉴权错误", "替代组件", "去 TS"],
            answer: 1,
            explain: "横切关注点。",
          },
          {
            id: "ac2",
            question: "401？",
            options: ["忽略", "抛错由上层清会话", "log", "删库"],
            answer: 1,
            explain: "统一处理。",
          },
        ],
      },
    ],
  },
  {
    slug: "testing-vue",
    title: "测试入门",
    summary: "Vitest / VTU / E2E。",
    level: "实战",
    track: "工程化",
    minutes: 12,
    official: "/guide/scaling-up/testing.html",
    blocks: [
      {
        type: "text",
        title: "测试分层",
        body: "Vitest 单测逻辑；Vue Test Utils 测组件；Playwright/Cypress 做 E2E。先测纯函数与 composable。",
      },
      {
        type: "code",
        title: "VTU 示例",
        lang: "ts",
        code: "import { mount } from '@vue/test-utils'\nimport Counter from './Counter.vue'\n\ntest('increments', async () => {\n  const w = mount(Counter)\n  await w.get('button').trigger('click')\n  expect(w.text()).toContain('1')\n})",
      },
      {
        type: "tip",
        body: "工坊 6 关 ≈ E2E 用例清单。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "te1",
            question: "单测栈？",
            options: ["JUnit", "Vitest + VTU", "PS", "ESLint"],
            answer: 1,
            explain: "社区主流。",
          },
          {
            id: "te2",
            question: "E2E？",
            options: ["每个私有函数", "主路径", "替代单测", "像素"],
            answer: 1,
            explain: "用户路径。",
          },
        ],
      },
    ],
  },
  {
    slug: "deploy-prod",
    title: "生产部署清单",
    summary: "环境、CORS、fallback。",
    level: "实战",
    track: "工程化",
    minutes: 11,
    official: "/guide/best-practices/production-deployment.html",
    blocks: [
      {
        type: "text",
        title: "生产部署",
        body: "npm run build → 静态资源上 CDN/Pages；配好 base 路径与环境变量；检查路由 history 回退。",
      },
      {
        type: "code",
        title: "检查",
        lang: "text",
        code: `[ ] VITE_API_BASE\n[ ] CORS\n[ ] SPA fallback\n[ ] 密钥不进仓库`,
      },
      {
        type: "quiz",
        questions: [
          {
            id: "dp1",
            question: "刷新 404？",
            options: ["Vue 坏", "无 fallback", "必须 hash", "Pinia"],
            answer: 1,
            explain: "history 需服务器。",
          },
          {
            id: "dp2",
            question: "密钥？",
            options: ["git", "服务端 env", "前端常量", "CSS"],
            answer: 1,
            explain: "服务端。",
          },
        ],
      },
    ],
  },

  // ——— v7 进阶模式 ———
  {
    slug: "teleport",
    title: "Teleport 传送门",
    summary: "把弹层挂到 body，摆脱父级 overflow。",
    level: "进阶",
    track: "进阶模式",
    minutes: 11,
    official: "/guide/built-ins/teleport.html",
    blocks: [
      {
        type: "text",
        title: "为什么需要 Teleport",
        body: "Modal、Toast、全屏遮罩若渲染在深层组件内，容易被 overflow:hidden 或 stacking context 裁切。Teleport 把 DOM 挂到 body（或指定节点），逻辑仍在当前组件。",
      },
      {
        type: "code",
        title: "Modal 示例",
        lang: "vue",
        code: `<script setup lang="ts">
import { ref } from 'vue'
const open = ref(false)
</script>
<template>
  <button @click="open = true">打开</button>
  <Teleport to="body">
    <div v-if="open" class="modal-mask" @click.self="open = false">
      <div class="modal" role="dialog" aria-modal="true">
        <p>内容</p>
        <button @click="open = false">关闭</button>
      </div>
    </div>
  </Teleport>
</template>`,
      },
      {
        type: "demo",
        kind: "teleport",
        title: "动手：遮罩弹层",
        hint: "打开弹层，理解「UI 逻辑在组件内，DOM 可挂到外层」。",
      },
      {
        type: "tip",
        body: "配合 transition + focus trap 才是生产级 Dialog。可参考速查表「弹层」。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "tp1",
            question: "Teleport 主要解决？",
            options: ["替代路由", "DOM 挂载位置与组件逻辑解耦", "替代 Pinia", "服务端鉴权"],
            answer: 1,
            explain: "挂到 body 等目标。",
          },
          {
            id: "tp2",
            question: "to 属性？",
            options: ["只能 #app", "CSS 选择器或元素，如 body", "只能 string 数字", "仅 iframe"],
            answer: 1,
            explain: '常见 to="body"。',
          },
        ],
      },
    ],
  },
  {
    slug: "keep-alive",
    title: "KeepAlive 缓存",
    summary: "缓存动态组件状态，避免反复销毁。",
    level: "进阶",
    track: "进阶模式",
    minutes: 12,
    official: "/guide/built-ins/keep-alive.html",
    blocks: [
      {
        type: "text",
        title: "何时用",
        body: "Tab 切换、多步表单、列表↔详情返回时希望保留输入与滚动。KeepAlive 缓存组件实例；配合 include/exclude 与 onActivated / onDeactivated。",
      },
      {
        type: "code",
        title: "动态组件",
        lang: "vue",
        code: `<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import TabA from './TabA.vue'
import TabB from './TabB.vue'
const tabs = { A: TabA, B: TabB }
const current = ref<'A' | 'B'>('A')
</script>
<template>
  <button @click="current = 'A'">A</button>
  <button @click="current = 'B'">B</button>
  <KeepAlive>
    <component :is="tabs[current]" />
  </KeepAlive>
</template>`,
      },
      {
        type: "demo",
        kind: "keepalive",
        title: "动手：Tab 缓存",
        hint: "在 A 输入文字，切到 B 再回 A，看是否保留。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "ka1",
            question: "KeepAlive 作用？",
            options: ["永久内存泄漏", "缓存组件实例避免反复销毁", "替代 v-if", "只缓存 CSS"],
            answer: 1,
            explain: "缓存实例。",
          },
          {
            id: "ka2",
            question: "再次显示时钩子？",
            options: ["onMounted only", "onActivated", "onServerPrefetch", "onErrorCaptured"],
            answer: 1,
            explain: "onActivated / onDeactivated。",
          },
        ],
      },
    ],
  },
  {
    slug: "custom-directive",
    title: "自定义指令",
    summary: "v-focus 等 DOM 级复用。",
    level: "进阶",
    track: "进阶模式",
    minutes: 10,
    official: "/guide/reusability/custom-directives.html",
    blocks: [
      {
        type: "text",
        title: "指令 vs 组件",
        body: "组件管结构与状态；指令适合「给已有元素加一点 DOM 行为」：自动聚焦、点击外关闭、懒加载图。能组件就别滥用指令。",
      },
      {
        type: "code",
        title: "v-focus",
        lang: "ts",
        code: `// directives/focus.ts
import type { Directive } from 'vue'
export const vFocus: Directive<HTMLElement> = {
  mounted(el) {
    el.focus()
  },
}

// main.ts
app.directive('focus', vFocus)

// 模板
<input v-focus />`,
      },
      {
        type: "demo",
        kind: "directive",
        title: "动手：自动聚焦",
        hint: "切换面板时输入框自动 focus（模拟 v-focus）。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "cd1",
            question: "自定义指令更适合？",
            options: ["整页业务状态", "底层 DOM 行为复用", "替代 Router", "替代数据库"],
            answer: 1,
            explain: "DOM 级横切。",
          },
          {
            id: "cd2",
            question: "mounted 钩子时机？",
            options: ["创建前", "元素挂载到文档后", "卸载后", "仅 SSR"],
            answer: 1,
            explain: "可安全操作 DOM。",
          },
        ],
      },
    ],
  },
  {
    slug: "perf-patterns",
    title: "性能模式",
    summary: "shallowRef、列表优化、异步组件。",
    level: "实战",
    track: "进阶模式",
    minutes: 12,
    official: "/guide/best-practices/performance.html",
    blocks: [
      {
        type: "text",
        title: "先量再优",
        body: "瓶颈多在：过大响应式对象、错误 key、无虚拟化的超长列表、同步大计算。Vue 提供 shallowRef、v-once、v-memo、defineAsyncComponent。",
      },
      {
        type: "code",
        title: "常用手段",
        lang: "ts",
        code: `import { shallowRef, defineAsyncComponent } from 'vue'

// 大表格数据：只关心替换整表
const rows = shallowRef<Row[]>([])
rows.value = await fetchRows() // 触发更新

// 路由级拆包
const Admin = defineAsyncComponent(() => import('./Admin.vue'))`,
      },
      {
        type: "demo",
        kind: "challenge",
        title: "复习：响应式正确性优先",
        hint: "正确再谈快。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "pfp1",
            question: "shallowRef 适合？",
            options: ["每个字段都要细粒度更新", "大体量数据整表替换", "替代 computed", "仅字符串"],
            answer: 1,
            explain: "减少深度代理成本。",
          },
          {
            id: "pfp2",
            question: "defineAsyncComponent？",
            options: ["SSR 禁用一切", "按需加载组件代码拆包", "自动写测试", "替代 props"],
            answer: 1,
            explain: "代码分割。",
          },
        ],
      },
    ],
  },
  {
    slug: "interview-vue",
    title: "面试高频串讲",
    summary: "用一页把响应式、diff、组合式说清楚。",
    level: "实战",
    track: "进阶模式",
    minutes: 14,
    blocks: [
      {
        type: "text",
        title: "怎么答「Vue 响应式原理」",
        body: "Vue 3 用 Proxy 拦截对象读写：get 时 track 依赖，set 时 trigger 副作用。ref 对基本类型包一层 .value 对象。组件更新默认异步批量，nextTick 等 DOM 更新后。",
      },
      {
        type: "text",
        title: "怎么答「key 的作用」",
        body: "diff 时用 key 识别 vnode 身份。稳定业务 id 优于 index；列表会重排/插入删除时 index 当 key 易错位复用。",
      },
      {
        type: "text",
        title: "怎么答「Composition 好处」",
        body: "按功能聚合状态与方法，抽 composable 跨组件复用；对 TS 更友好；逻辑不再被 data/methods/watch 拆散。",
      },
      {
        type: "tip",
        body: "开口顺序：场景 → 原理一句话 → 代码点 → 坑。可配合速查表背骨架。",
      },
      {
        type: "code",
        title: "对应源码 · ref 与 reactive",
        lang: "vue",
        code: "<script setup>\nimport { ref, reactive } from 'vue'\nconst count = ref(0)\nconst state = reactive({ name: 'Vue', n: 1 })\n// 脚本中读/写 ref 用 .value\n// 解构 reactive 会丢响应式 → 用 toRefs(state)\n</script>\n\n<template>\n  <p>{{ count }}</p>\n  <button @click=\"count++\">count.value++</button>\n  <p>{{ state.name }} / {{ state.n }}</p>\n  <button @click=\"state.n++\">state.n++</button>\n</template>",
      },
      {
        type: "demo",
        kind: "ref-vs-reactive",
        title: "口述时配合此 Demo",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "iv1",
            question: "Vue 3 响应式核心？",
            options: ["Object.defineProperty only", "Proxy", "脏检查", "setInterval"],
            answer: 1,
            explain: "Proxy。",
          },
          {
            id: "iv2",
            question: "列表 key 优先？",
            options: ["随机数每次", "稳定业务 id", "永远 index", "不要 key"],
            answer: 1,
            explain: "稳定身份。",
          },
        ],
      },
    ],
  },

  // ========== 官网对齐补强（对照 vuejs.org/llms.txt）==========
  {
    slug: "class-style",
    title: "Class 与 Style 绑定",
    summary: "对象/数组语法绑定 class 与 style，对应官网 essentials/class-and-style。",
    level: "入门",
    track: "官网对齐",
    minutes: 10,
    official: "/guide/essentials/class-and-style.html",
    blocks: [
      {
        type: "text",
        title: "和 HTML 的差别",
        body: "Vue 用 :class / :style 做动态绑定。class 支持对象（条件开关）与数组（列表合并）；style 支持对象（CSS 属性驼峰或短横线）与数组合并。绑定对象/数组时，Vue 会智能合并到元素的 class/style，而不是整段覆盖静态 class。",
      },
      {
        type: "code",
        title: "对应源码 · class / style",
        lang: "vue",
        code: `<script setup>
import { ref, reactive } from 'vue'
const isActive = ref(true)
const hasError = ref(false)
const styleObj = reactive({ color: 'tomato', fontSize: '18px' })
</script>

<template>
  <div
    class="static"
    :class="{ active: isActive, 'text-danger': hasError }"
  >
    对象 class
  </div>
  <div :class="[isActive ? 'active' : '', 'rounded']">数组 class</div>
  <p :style="styleObj">对象 style</p>
</template>`,
      },
      {
        type: "demo",
        kind: "class-style",
        title: "动手：切换 class / style",
        hint: "对照官网：对象语法适合布尔开关，数组适合多来源合并。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "cs1",
            question: ":class 对象语法的值通常是？",
            options: ["仅字符串", "布尔条件", "只能数字", "禁止静态 class"],
            answer: 1,
            explain: "真值时加入该类名。",
          },
          {
            id: "cs2",
            question: "静态 class 与 :class 同时写？",
            options: ["冲突必丢静态", "会合并", "必须二选一", "仅 SSR 生效"],
            answer: 1,
            explain: "Vue 会合并。",
          },
        ],
      },
    ],
  },
  {
    slug: "watchers",
    title: "侦听器 Watchers",
    summary: "watch / watchEffect / 清理副作用，对应官网 essentials/watchers。",
    level: "入门",
    track: "官网对齐",
    minutes: 12,
    official: "/guide/essentials/watchers.html",
    blocks: [
      {
        type: "text",
        title: "何时用 watch",
        body: "派生展示数据优先 computed。需要「状态变了去做点事」（请求、日志、同步 storage）再用 watch。watch 可指定源；watchEffect 自动追踪依赖。异步时务必返回/调用清理函数，避免竞态。",
      },
      {
        type: "code",
        title: "对应源码 · watch",
        lang: "vue",
        code: `<script setup>
import { ref, watch, watchEffect } from 'vue'
const id = ref(1)
const log = ref([])
watch(id, async (n, o, onCleanup) => {
  let cancelled = false
  onCleanup(() => { cancelled = true })
  // await fetch...
  if (!cancelled) log.value.push(\`id: \${o} → \${n}\`)
})
watchEffect(() => {
  console.log('effect id=', id.value)
})
</script>`,
      },
      {
        type: "demo",
        kind: "watchers",
        title: "动手：改源看日志",
        hint: "快速连点会触发多次；真实项目用 onCleanup 取消上一次请求。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "w1",
            question: "展示派生文本优先？",
            options: ["watch", "computed", "onMounted 循环", "v-html"],
            answer: 1,
            explain: "computed 有缓存、声明式。",
          },
          {
            id: "w2",
            question: "watch 异步请求要？",
            options: ["忽略旧请求", "onCleanup / Abort 取消", "只能同步", "禁止 watch"],
            answer: 1,
            explain: "防竞态。",
          },
        ],
      },
    ],
  },
  {
    slug: "template-refs",
    title: "模板引用 Template Refs",
    summary: "ref 拿到 DOM / 子组件实例，对应官网 essentials/template-refs。",
    level: "入门",
    track: "官网对齐",
    minutes: 10,
    official: "/guide/essentials/template-refs.html",
    blocks: [
      {
        type: "text",
        title: "什么时候需要 ref",
        body: '优先声明式数据驱动。仅在必须操作 DOM（聚焦、测宽、接入非 Vue 库）时用模板 ref。script setup 中：const el = ref(null)，模板写 ref="el"。注意挂载前 el.value 为 null；v-for 上的 ref 是数组。',
      },
      {
        type: "code",
        title: "对应源码 · 聚焦输入框",
        lang: "vue",
        code: `<script setup>
import { ref, onMounted } from 'vue'
const input = ref(null)
onMounted(() => input.value?.focus())
function focus() { input.value?.focus() }
</script>

<template>
  <input ref="input" />
  <button @click="focus">聚焦</button>
</template>`,
      },
      {
        type: "demo",
        kind: "template-ref",
        title: "动手：DOM 聚焦与读值",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "tr1",
            question: "挂载前 ref.value？",
            options: ["元素", "null", "window", "永远有值"],
            answer: 1,
            explain: "需 onMounted 或用户事件后再用。",
          },
          {
            id: "tr2",
            question: "能替代状态驱动吗？",
            options: ["应该优先 ref 改 DOM", "多数 UI 仍应用状态", "禁止使用", "仅 Options"],
            answer: 1,
            explain: "声明式优先。",
          },
        ],
      },
    ],
  },
  {
    slug: "component-vmodel",
    title: "组件上的 v-model",
    summary: "modelValue + update:modelValue，对应官网 components/v-model。",
    level: "进阶",
    track: "官网对齐",
    minutes: 12,
    official: "/guide/components/v-model.html",
    blocks: [
      {
        type: "text",
        title: "约定",
        body: '父级 <Child v-model="x" /> 等价于 :modelValue="x" @update:modelValue="x = $event"。子组件 defineProps([\'modelValue\']) + defineEmits([\'update:modelValue\'])。Vue 3.4+ 可用 defineModel() 简化。多 v-model 用参数：v-model:title。',
      },
      {
        type: "code",
        title: "对应源码 · 自定义输入",
        lang: "vue",
        code: `<!-- CustomInput.vue -->
<script setup>
const model = defineModel({ type: String })
</script>
<template>
  <input :value="model" @input="model = $event.target.value" />
</template>

<!-- 父 -->
<CustomInput v-model="text" />`,
      },
      {
        type: "demo",
        kind: "component-vmodel",
        title: "动手：父子双向同步",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "vm1",
            question: "默认 v-model prop 名？",
            options: ["value", "modelValue", "vModel", "bind"],
            answer: 1,
            explain: "Vue 3 默认 modelValue。",
          },
          {
            id: "vm2",
            question: "子更新父应？",
            options: ["直接改 props", "emit update:modelValue", "window 全局", "仅 inject"],
            answer: 1,
            explain: "保持单向数据流。",
          },
        ],
      },
    ],
  },
  {
    slug: "fallthrough-attrs",
    title: "透传 Attributes",
    summary: 'class/监听器自动落入根元素；inheritAttrs 与 v-bind="$attrs"。',
    level: "进阶",
    track: "官网对齐",
    minutes: 11,
    official: "/guide/components/attrs.html",
    blocks: [
      {
        type: "text",
        title: "Fallthrough",
        body: '父传到子、但子未声明为 props/emits 的 attribute（含 class、style、原生事件）会自动落到子组件的单根节点。多根节点或要落到内部 input 时：set inheritAttrs: false，并在目标上 v-bind="$attrs"。',
      },
      {
        type: "code",
        title: "对应源码 · 落到内部 input",
        lang: "vue",
        code: `<script setup>
defineOptions({ inheritAttrs: false })
defineProps<{ label: string }>()
</script>
<template>
  <label>
    {{ label }}
    <input v-bind="$attrs" />
  </label>
</template>

<!-- 父：class / placeholder 落到 input -->
<BaseInput label="名" class="w-full" placeholder="Ada" />`,
      },
      {
        type: "demo",
        kind: "fallthrough",
        title: "动手：attrs 落点",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "fa1",
            question: "未声明的 class 默认？",
            options: ["丢弃", "落到子根元素", "变成 prop", "仅 SSR"],
            answer: 1,
            explain: "fallthrough。",
          },
          {
            id: "fa2",
            question: "想落到内部 input？",
            options: [
              "无法",
              "inheritAttrs:false + v-bind=$attrs",
              "只能用 provide",
              "改 Vue 源码",
            ],
            answer: 1,
            explain: "官网推荐写法。",
          },
        ],
      },
    ],
  },
  {
    slug: "async-components",
    title: "异步组件",
    summary: "defineAsyncComponent 分包与加载态，对应 components/async。",
    level: "进阶",
    track: "官网对齐",
    minutes: 11,
    official: "/guide/components/async.html",
    blocks: [
      {
        type: "text",
        title: "用途",
        body: "大组件按需加载，减小首包。defineAsyncComponent(() => import('./Heavy.vue'))。可配置 loadingComponent、errorComponent、delay、timeout。结合 Suspense 可在树级等待。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "ts",
        code: `import { defineAsyncComponent } from 'vue'

const HeavyChart = defineAsyncComponent({
  loader: () => import('./HeavyChart.vue'),
  loadingComponent: Spinner,
  errorComponent: ErrorCard,
  delay: 200,
  timeout: 10000,
})`,
      },
      {
        type: "demo",
        kind: "async-comp",
        title: "动手：模拟异步加载",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "ac1",
            question: "异步组件主要收益？",
            options: ["更少代码", "代码分割/按需加载", "替代路由", "去掉打包"],
            answer: 1,
            explain: "减小首屏。",
          },
        ],
      },
    ],
  },
  {
    slug: "plugins",
    title: "插件 Plugins",
    summary: "app.use 安装全局能力，对应 reusability/plugins。",
    level: "进阶",
    track: "官网对齐",
    minutes: 10,
    official: "/guide/reusability/plugins.html",
    blocks: [
      {
        type: "text",
        title: "插件形态",
        body: "插件是带 install(app, options) 的对象或函数，用于注册全局组件/指令、挂载全局属性、提供 provide 等。Router、Pinia 都是插件。自己写插件时避免污染过多全局。",
      },
      {
        type: "code",
        title: "对应源码 · 简易 i18n 插件",
        lang: "ts",
        code: `export default {
  install(app, options) {
    app.config.globalProperties.$translate = (key) =>
      options.messages[key] ?? key
    app.provide('i18n', options)
  },
}
// main.ts
app.use(i18nPlugin, { messages: { hello: '你好' } })`,
      },
      {
        type: "demo",
        kind: "plugins",
        title: "动手：安装插件前后",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "pl1",
            question: "安装插件 API？",
            options: ["app.mount", "app.use", "app.component only", "import 即可自动"],
            answer: 1,
            explain: "app.use(plugin, options?)。",
          },
        ],
      },
    ],
  },
  {
    slug: "transition",
    title: "Transition 过渡",
    summary: "内置 Transition / TransitionGroup，对应 built-ins/transition。",
    level: "进阶",
    track: "官网对齐",
    minutes: 12,
    official: "/guide/built-ins/transition.html",
    blocks: [
      {
        type: "text",
        title: "原理",
        body: "Transition 在元素插入/移除时自动挂 CSS 类名（v-enter-from 等）或跑 JS 钩子。只应包裹单个元素/组件。列表用 TransitionGroup 并给子项 key。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "vue",
        code: `<script setup>
import { ref } from 'vue'
const show = ref(true)
</script>
<template>
  <button @click="show = !show">toggle</button>
  <Transition name="fade">
    <p v-if="show">Hello</p>
  </Transition>
</template>
<style>
.fade-enter-active, .fade-leave-active { transition: opacity .3s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>`,
      },
      {
        type: "demo",
        kind: "transition",
        title: "动手：显隐过渡",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "tr1",
            question: "列表动画用？",
            options: ["Transition", "TransitionGroup", "仅 CSS", "Teleport"],
            answer: 1,
            explain: "TransitionGroup。",
          },
        ],
      },
    ],
  },
  {
    slug: "suspense",
    title: "Suspense",
    summary: "等待异步依赖的实验性内置组件，对应 built-ins/suspense。",
    level: "进阶",
    track: "官网对齐",
    minutes: 11,
    official: "/guide/built-ins/suspense.html",
    blocks: [
      {
        type: "text",
        title: "注意",
        body: "Suspense 仍标为 experimental，API 可能变。它协调异步组件 / async setup，在 default 与 fallback 插槽间切换。生产关键路径请做好兼容与加载态设计。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "vue",
        code: `<Suspense>
  <template #default>
    <AsyncPage />
  </template>
  <template #fallback>
    <div>Loading...</div>
  </template>
</Suspense>`,
      },
      {
        type: "demo",
        kind: "suspense",
        title: "动手：fallback ↔ content",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "su1",
            question: "Suspense 状态？",
            options: ["稳定 final", "experimental 需谨慎", "仅 Vue2", "替代 Router"],
            answer: 1,
            explain: "官网标注 experimental。",
          },
        ],
      },
    ],
  },
  {
    slug: "a11y-security",
    title: "无障碍与安全",
    summary: "a11y + XSS/敏感数据，对应 best-practices/accessibility & security。",
    level: "实战",
    track: "官网对齐",
    minutes: 14,
    official: "/guide/best-practices/security.html",
    blocks: [
      {
        type: "text",
        title: "两条底线",
        body: "无障碍：语义标签、键盘可达、label、对比度、不要用 div 冒充按钮。安全：永不信任用户 HTML——v-html 可导致 XSS；前端密钥等于公开；鉴权以后端为准；用户生成内容要消毒。",
      },
      {
        type: "code",
        title: "危险 vs 安全",
        lang: "vue",
        code: `<!-- ❌ 危险：直接渲染用户 HTML -->
<div v-html="userHtml"></div>

<!-- ✅ 默认插值会转义 -->
<p>{{ userText }}</p>

<!-- ✅ 交互用 button，并绑键盘 -->
<button type="button" @click="save">保存</button>`,
      },
      {
        type: "demo",
        kind: "challenge",
        title: "挑战：找出不安全写法",
        hint: "结合速查表：v-html、token 存放、a11y 语义。",
      },
      {
        type: "tip",
        body: "官网安全篇：https://cn.vuejs.org/guide/best-practices/security.html ；无障碍：.../accessibility.html",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "as1",
            question: "用户富文本应用？",
            options: ["直接 v-html", "消毒/白名单后再渲染", "eval", "innerHTML 全局"],
            answer: 1,
            explain: "防 XSS。",
          },
          {
            id: "as2",
            question: "前端存永久密钥？",
            options: ["可以", "等于公开，禁止", "仅 ref 安全", "Pinia 加密即可"],
            answer: 1,
            explain: "任何前端包都可被拆。",
          },
        ],
      },
    ],
  },
  {
    slug: "reactivity-depth",
    title: "深入响应式",
    summary: "Proxy、依赖收集、shallow / readonly，对应 extras/reactivity-in-depth。",
    level: "进阶",
    track: "官网对齐",
    minutes: 14,
    official: "/guide/extras/reactivity-in-depth.html",
    blocks: [
      {
        type: "text",
        title: "心智模型",
        body: "Vue 3 用 Proxy 拦截读写：读时 track 依赖，写时 trigger 副作用。reactive 仅对对象；ref 对任意值（对象会深层转换）。markRaw 跳过代理；shallowRef 只追踪 .value 替换。理解这些才能解释「解构丢失」和性能取舍。",
      },
      {
        type: "code",
        title: "对应源码 · 工具 API",
        lang: "ts",
        code: `import { ref, shallowRef, readonly, markRaw } from 'vue'

const deep = ref({ nested: { n: 1 } }) // 深层
const shallow = shallowRef({ nested: { n: 1 } })
// 改 shallow.value.nested.n 不触发；替换 shallow.value = {...} 才触发

const state = readonly({ x: 1 }) // 写会警告
const raw = markRaw({ huge: true }) // 永不变成代理`,
      },
      {
        type: "demo",
        kind: "ref-vs-reactive",
        title: "复习：响应式边界",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "rd1",
            question: "Vue3 响应式核心？",
            options: ["脏检查", "Proxy", "Object.observe", "setInterval"],
            answer: 1,
            explain: "Proxy。",
          },
          {
            id: "rd2",
            question: "大列表性能优化常见？",
            options: ["全部 deep reactive", "shallowRef + 不可变替换", "去掉 key", "禁用编译"],
            answer: 1,
            explain: "减少深层代理成本。",
          },
        ],
      },
    ],
  },
  {
    slug: "render-jsx",
    title: "渲染函数与 JSX",
    summary: "h() / JSX 场景，对应 extras/render-function。",
    level: "进阶",
    track: "官网对齐",
    minutes: 12,
    official: "/guide/extras/render-function.html",
    blocks: [
      {
        type: "text",
        title: "何时离开模板",
        body: "模板覆盖 95% 场景。高度动态的标签/子节点结构可用 render 函数或 JSX。h('div', { class: 'x' }, children)。注意：render 里没有模板的自动解包便利，VNode 要稳定 key。",
      },
      {
        type: "code",
        title: "对应源码 · h()",
        lang: "ts",
        code: `import { h, ref } from 'vue'
export default {
  setup() {
    const ok = ref(true)
    return () =>
      h('button', { onClick: () => (ok.value = !ok.value) }, ok.value ? 'ON' : 'OFF')
  },
}`,
      },
      {
        type: "demo",
        kind: "component",
        title: "对照：模板组件仍是默认选择",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "rj1",
            question: "默认推荐？",
            options: ["全站 JSX", "模板 / SFC", "必须 render", "仅 Options"],
            answer: 1,
            explain: "模板是一等公民。",
          },
        ],
      },
    ],
  },
  {
    slug: "ssr-basics",
    title: "SSR 基础",
    summary: "同构、水合、数据获取边界，对应 scaling-up/ssr。",
    level: "实战",
    track: "官网对齐",
    minutes: 13,
    official: "/guide/scaling-up/ssr.html",
    blocks: [
      {
        type: "text",
        title: "SSR 解决什么",
        body: "服务端先出 HTML，利于首屏与 SEO，再在浏览器 hydrate。约束：组件需在服务端可运行（无直接 window）；每请求创建新 app 实例；跨请求状态不能共享。实践中多用 Nuxt 等更高层方案。",
      },
      {
        type: "code",
        title: "概念伪码",
        lang: "ts",
        code: `// server
const app = createSSRApp(App)
const html = await renderToString(app)

// client
const app = createSSRApp(App)
app.mount('#app') // hydrate`,
      },
      {
        type: "tip",
        body: "课站 nuxt-map 课讲文件系统路由与 server/api；本课补 SSR 心智。完整工程请跟 Nuxt 文档。",
      },
      {
        type: "demo",
        kind: "async",
        title: "类比：等待数据再呈现",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "ss1",
            question: "SSR 组件能否直接读 window？",
            options: ["可以任意", "服务端无 window，需防护", "只有 Safari", "仅 Options"],
            answer: 1,
            explain: "同构约束。",
          },
        ],
      },
    ],
  },
  {
    slug: "style-guide",
    title: "风格指南精要",
    summary: "Priority A/B 规则压缩版，对应 style-guide。",
    level: "进阶",
    track: "官网对齐",
    minutes: 10,
    official: "/style-guide/",
    blocks: [
      {
        type: "text",
        title: "必守（Priority A 思路）",
        body: "组件名多词；key 必备；data/状态用函数返回新对象（Options）；prop 定义尽量详细；v-for 与 v-if 不要同元素（Vue 3 中 v-if 优先，行为易踩坑）。强推荐：组件文件名 PascalCase 或 kebab-close 一致；基础组件前缀；指令缩写保持团队统一。",
      },
      {
        type: "code",
        title: "示例",
        lang: "vue",
        code: `<!-- ✅ 多词组件名 -->
<script setup lang="ts">
// TodoItem.vue
defineProps<{ id: string; done: boolean }>()
</script>

<!-- ❌ 避免 -->
<div v-for="item in list" v-if="item.ok" :key="item.id">`,
      },
      {
        type: "demo",
        kind: "challenge",
        title: "挑战：挑出违规点",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "sg1",
            question: "组件名建议？",
            options: ["单词 Item", "多词 TodoItem", "随意", "仅中文"],
            answer: 1,
            explain: "避免与 HTML 冲突。",
          },
        ],
      },
    ],
  },

  // ========== 官网迁移补全（Guide 全覆盖）==========
  {
    slug: "quick-start",
    title: "快速开始",
    summary: "CDN / create-vue / 在线演练场，对应官网 quick-start。",
    level: "入门",
    track: "官网对齐",
    minutes: 10,
    official: "/guide/quick-start.html",
    blocks: [
      {
        type: "text",
        title: "三种上手方式",
        body: "1) 构建工具：npm create vue@latest（推荐真实项目）。2) CDN：页面引入 vue.global.js 快速试验。3) 演练场：play.vuejs.org。课站另提供 SFC 编辑器路径 /playground。",
      },
      {
        type: "code",
        title: "对应源码 · CDN 最小例",
        lang: "html",
        code: `<div id="app">{{ message }}</div>
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
  const { createApp, ref } = Vue
  createApp({
    setup() {
      const message = ref('Hello Vue!')
      return { message }
    }
  }).mount('#app')
</script>`,
      },
      {
        type: "demo",
        kind: "counter",
        title: "对照：最小响应式",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "qs1",
            question: "正式项目更推荐？",
            options: ["只贴 CDN", "create-vue / Vite 工程", "一个 HTML 永远够", "禁止 SFC"],
            answer: 1,
            explain: "工程化与 SFC 工具链。",
          },
        ],
      },
    ],
  },
  {
    slug: "create-app",
    title: "创建应用 createApp",
    summary: "应用实例、挂载与多应用，对应 essentials/application。",
    level: "入门",
    track: "官网对齐",
    minutes: 10,
    official: "/guide/essentials/application.html",
    blocks: [
      {
        type: "text",
        title: "应用实例",
        body: "每个 createApp 返回独立应用实例，有自己的配置、组件、指令。mount('#app') 把根组件挂到容器。不要复用同一 app 多次 mount；SSR/测试里常见「每请求/每测例新建 app」。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "ts",
        code: `import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.config.errorHandler = (err) => console.error(err)
app.mount('#app')
// app.unmount()`,
      },
      {
        type: "demo",
        kind: "plugins",
        title: "对照：use 插件再挂载",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "ca1",
            question: "createApp 的作用？",
            options: ["创建 DOM", "创建独立 Vue 应用实例", "仅路由", "编译 SFC"],
            answer: 1,
            explain: "隔离配置与全局注册。",
          },
        ],
      },
    ],
  },
  {
    slug: "conditional",
    title: "条件渲染",
    summary: "v-if 家族与 v-show，对应 essentials/conditional。",
    level: "入门",
    track: "官网对齐",
    minutes: 10,
    official: "/guide/essentials/conditional.html",
    blocks: [
      {
        type: "text",
        title: "v-if vs v-show",
        body: "v-if 真正创建/销毁节点（可配 v-else-if/v-else），切换成本高、初始可惰性。v-show 只切 CSS display，初始必渲染，适合频繁切换。template 上可用 v-if 包裹多元素。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "vue",
        code: `<script setup>
import { ref } from 'vue'
const type = ref('A')
const show = ref(true)
</script>
<template>
  <div v-if="type === 'A'">A</div>
  <div v-else-if="type === 'B'">B</div>
  <div v-else>Other</div>
  <p v-show="show">频繁切换用 show</p>
</template>`,
      },
      { type: "demo", kind: "conditional", title: "动手：条件分支" },
      {
        type: "quiz",
        questions: [
          {
            id: "cd1",
            question: "频繁显隐更合适？",
            options: ["v-if", "v-show", "v-html", "v-pre"],
            answer: 1,
            explain: "避免反复卸载。",
          },
        ],
      },
    ],
  },
  {
    slug: "component-registration",
    title: "组件注册",
    summary: "局部 vs 全局注册，对应 components/registration。",
    level: "进阶",
    track: "官网对齐",
    minutes: 10,
    official: "/guide/components/registration.html",
    blocks: [
      {
        type: "text",
        title: "推荐局部",
        body: "script setup 里 import 的组件自动局部可用。全局 app.component 适合极基础的展示组件或递归便利，但会妨碍 tree-shaking、让依赖变隐式。命名：PascalCase 多词。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "vue",
        code: `<script setup>
import TodoItem from './TodoItem.vue'
</script>
<template>
  <TodoItem />
</template>

// 全局
// app.component('TodoItem', TodoItem)`,
      },
      { type: "demo", kind: "registration", title: "动手：局部 / 全局" },
      {
        type: "quiz",
        questions: [
          {
            id: "rg1",
            question: "默认更推荐？",
            options: ["全部全局", "局部注册", "字符串模板仅", "禁止 import"],
            answer: 1,
            explain: "清晰依赖与 tree-shaking。",
          },
        ],
      },
    ],
  },
  {
    slug: "component-events",
    title: "组件事件",
    summary: "defineEmits、校验与 once，对应 components/events。",
    level: "进阶",
    track: "官网对齐",
    minutes: 11,
    official: "/guide/components/events.html",
    blocks: [
      {
        type: "text",
        title: "声明式事件",
        body: "子组件通过 emit 通知父组件。defineEmits(['change']) 或类型版 defineEmits<{ change: [id: string] }>()。事件名推荐 camelCase 声明、模板可 kebab-case 监听。不要用 $on（Vue 3 实例事件总线已移除）。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "vue",
        code: `<script setup lang="ts">
const emit = defineEmits<{
  change: [value: string]
  close: []
}>()
function onInput(e: Event) {
  emit('change', (e.target as HTMLInputElement).value)
}
</script>
<template>
  <input @input="onInput" />
  <button @click="emit('close')">关</button>
</template>`,
      },
      { type: "demo", kind: "component-vmodel", title: "对照：事件向上同步" },
      {
        type: "quiz",
        questions: [
          {
            id: "ce1",
            question: "Vue3 推荐跨组件通信？",
            options: ["this.$on 总线", "props/emit 或状态库", "改子 props", "直接 DOM"],
            answer: 1,
            explain: "实例事件 API 已移除。",
          },
        ],
      },
    ],
  },
  {
    slug: "transition-group",
    title: "TransitionGroup",
    summary: "列表过渡与 FLIP 移动，对应 built-ins/transition-group。",
    level: "进阶",
    track: "官网对齐",
    minutes: 11,
    official: "/guide/built-ins/transition-group.html",
    blocks: [
      {
        type: "text",
        title: "和 Transition 的差别",
        body: "TransitionGroup 渲染真实列表元素（可设 tag），每个子项必须有唯一 key。支持进入/离开/位置移动（FLIP）。不要把 mode 属性当成 Transition 同款使用场景。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "vue",
        code: `<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item.id">
    {{ item.text }}
  </li>
</TransitionGroup>`,
      },
      { type: "demo", kind: "transition-group", title: "动手：打乱列表" },
      {
        type: "quiz",
        questions: [
          {
            id: "tg1",
            question: "TransitionGroup 子节点？",
            options: ["可无 key", "必须稳定 key", "只能一个子", "禁止 tag"],
            answer: 1,
            explain: "定位与复用依赖 key。",
          },
        ],
      },
    ],
  },
  {
    slug: "sfc",
    title: "单文件组件 SFC",
    summary: "结构、工具链与优势，对应 scaling-up/sfc。",
    level: "入门",
    track: "官网对齐",
    minutes: 11,
    official: "/guide/scaling-up/sfc.html",
    blocks: [
      {
        type: "text",
        title: "为什么是 SFC",
        body: ".vue = template + script + style 内聚。配合 Vite：编译模板、scoped CSS、TS、热更新。官方推荐用 SFC + Composition API 作为默认开发模型。",
      },
      {
        type: "code",
        title: "对应源码 · 结构",
        lang: "vue",
        code: `<script setup lang="ts">
import { ref } from 'vue'
const msg = ref('SFC')
</script>

<template>
  <h1>{{ msg }}</h1>
</template>

<style scoped>
h1 { color: #42b883; }
</style>`,
      },
      { type: "demo", kind: "component", title: "对照：组件实例" },
      {
        type: "tip",
        body: "课站 /playground 可运行真实 SFC（@vue/repl）。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "sf1",
            question: "SFC 扩展名？",
            options: [".jsx", ".vue", ".svx", ".v"],
            answer: 1,
            explain: ".vue",
          },
        ],
      },
    ],
  },
  {
    slug: "script-setup",
    title: "script setup 详解",
    summary: "编译期语法糖与宏，对应 api/sfc-script-setup。",
    level: "进阶",
    track: "官网对齐",
    minutes: 12,
    official: "/api/sfc-script-setup.html",
    blocks: [
      {
        type: "text",
        title: "宏",
        body: "defineProps、defineEmits、defineExpose、defineModel、defineOptions 是编译器宏，无需 import。顶层绑定自动暴露给模板。与普通 script 可共存（普通 script 跑模块副作用/导出）。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "vue",
        code: `<script setup lang="ts">
const props = defineProps<{ title: string }>()
const emit = defineEmits<{ save: [id: string] }>()
const model = defineModel<string>()
defineExpose({ focus })
function focus() {}
</script>`,
      },
      { type: "demo", kind: "script-setup", title: "动手：顶层绑定" },
      {
        type: "quiz",
        questions: [
          {
            id: "ss1",
            question: "defineProps 需要 import 吗？",
            options: ["必须", "编译器宏，无需 import", "仅 CDN 需要", "已废弃"],
            answer: 1,
            explain: "宏。",
          },
        ],
      },
    ],
  },
  {
    slug: "sfc-css",
    title: "SFC CSS 特性",
    summary: "scoped、:deep、v-bind(css)、modules，对应 api/sfc-css-features。",
    level: "进阶",
    track: "官网对齐",
    minutes: 12,
    official: "/api/sfc-css-features.html",
    blocks: [
      {
        type: "text",
        title: "样式封装",
        body: "scoped 给选择器加唯一属性，避免泄漏。子组件内部要用 :deep()。CSS 中 v-bind(color) 可绑定脚本状态。module 开启 CSS Modules。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "vue",
        code: `<script setup>
import { ref } from 'vue'
const color = ref('tomato')
</script>
<template>
  <p class="text">hi</p>
</template>
<style scoped>
.text { color: v-bind(color); }
:deep(a) { text-decoration: underline; }
</style>`,
      },
      { type: "demo", kind: "sfc-css", title: "动手：v-bind in CSS" },
      {
        type: "quiz",
        questions: [
          {
            id: "sc1",
            question: "穿透子组件样式？",
            options: [":deep()", "！important 即可", "禁止", "仅 inline"],
            answer: 0,
            explain: ":deep / ::v-deep。",
          },
        ],
      },
    ],
  },
  {
    slug: "tooling",
    title: "工具链 Tooling",
    summary: "Vite、Volar、DevTools、ESLint，对应 scaling-up/tooling。",
    level: "实战",
    track: "官网对齐",
    minutes: 12,
    official: "/guide/scaling-up/tooling.html",
    blocks: [
      {
        type: "text",
        title: "官方推荐栈",
        body: "创建：create-vue（Vite）。IDE：VS Code + Vue - Official (Volar)。调试：Vue DevTools。质量：ESLint + oxlint/prettier 生态。浏览器内原型可用演练场；课站 playground 同类。",
      },
      {
        type: "code",
        title: "常用命令",
        lang: "bash",
        code: `npm create vue@latest
npm install
npm run dev
npm run build
npm run test:unit`,
      },
      { type: "demo", kind: "challenge", title: "自检：本地工具是否就绪" },
      {
        type: "quiz",
        questions: [
          {
            id: "tl1",
            question: "Vue3 官方脚手架底层？",
            options: ["webpack only", "Vite", "Parcel only", "Browserify"],
            answer: 1,
            explain: "create-vue → Vite。",
          },
        ],
      },
    ],
  },
  {
    slug: "options-api",
    title: "Options API 对照",
    summary: "data/methods/computed 与 Composition 映射，对应 typescript/options-api 与 FAQ。",
    level: "进阶",
    track: "官网对齐",
    minutes: 13,
    official: "/guide/extras/composition-api-faq.html",
    blocks: [
      {
        type: "text",
        title: "还要学 Options 吗",
        body: "新项目推荐 Composition + script setup。Options 仍大量存在于旧代码与部分教程。映射：data→ref/reactive，computed→computed()，methods→function，生命周期钩子→onXxx，watch→watch。this 在 Options 指向实例；Composition 无此依赖。",
      },
      {
        type: "code",
        title: "对应源码 · Options",
        lang: "vue",
        code: `export default {
  data: () => ({ count: 0 }),
  computed: {
    double() { return this.count * 2 },
  },
  methods: {
    inc() { this.count++ },
  },
  mounted() { /* ... */ },
}`,
      },
      { type: "demo", kind: "options-api", title: "动手：Options 行为" },
      {
        type: "quiz",
        questions: [
          {
            id: "oa1",
            question: "Options data 必须？",
            options: ["对象字面量共享", "函数返回新对象", "全局变量", "仅字符串"],
            answer: 1,
            explain: "避免实例间共享状态。",
          },
        ],
      },
    ],
  },
  {
    slug: "rendering-mechanism",
    title: "渲染机制",
    summary: "虚拟 DOM、编译优化与 patch，对应 extras/rendering-mechanism。",
    level: "进阶",
    track: "官网对齐",
    minutes: 13,
    official: "/guide/extras/rendering-mechanism.html",
    blocks: [
      {
        type: "text",
        title: "编译器 + 运行时",
        body: "模板被编译成渲染函数，生成 VNode 树。更新时与旧树 diff/patch。Vue 3 编译器做静态提升、补丁标记（PatchFlags）、树结构打平，减少运行时工作。理解 key 与稳定结构对 diff 极重要。",
      },
      {
        type: "code",
        title: "心智模型",
        lang: "text",
        code: `template
  → compile
  → render() → VNode
  → mount / patch
  → 真实 DOM`,
      },
      { type: "demo", kind: "list", title: "对照：key 对复用的影响" },
      {
        type: "quiz",
        questions: [
          {
            id: "rm1",
            question: "Vue 模板最终会变成？",
            options: ["字符串 HTML only", "渲染函数 / VNode", "jQuery", "WASM 必须"],
            answer: 1,
            explain: "编译为渲染函数。",
          },
        ],
      },
    ],
  },
  {
    slug: "web-components",
    title: "Vue 与 Web Components",
    summary: "自定义元素互操作，对应 extras/web-components。",
    level: "进阶",
    track: "官网对齐",
    minutes: 12,
    official: "/guide/extras/web-components.html",
    blocks: [
      {
        type: "text",
        title: "两个方向",
        body: "1) 在 Vue 里使用已有 CE：配置 isCustomElement，避免当 Vue 组件解析。2) 把 Vue 组件导出为 CE：defineCustomElement，便于跨框架嵌入。注意 props/事件/插槽在 CE 边界上的限制。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "ts",
        code: `app.config.compilerOptions.isCustomElement = (tag) =>
  tag.includes('-')

import { defineCustomElement } from 'vue'
import Widget from './Widget.ce.vue'
customElements.define('my-widget', defineCustomElement(Widget))`,
      },
      { type: "demo", kind: "web-components", title: "动手：自定义标签" },
      {
        type: "quiz",
        questions: [
          {
            id: "wc1",
            question: "避免把 CE 当 Vue 组件解析？",
            options: ["isCustomElement", "v-pre", "markRaw", "Teleport"],
            answer: 0,
            explain: "compilerOptions.isCustomElement。",
          },
        ],
      },
    ],
  },
  {
    slug: "animation",
    title: "动画技巧",
    summary: "class 驱动、Transition、FLIP、与 GSAP 协作，对应 extras/animation。",
    level: "进阶",
    track: "官网对齐",
    minutes: 11,
    official: "/guide/extras/animation.html",
    blocks: [
      {
        type: "text",
        title: "层次",
        body: "1) 状态 class + CSS transition/animation。2) 内置 Transition / TransitionGroup。3) 监听钩子里调用 Web Animations API 或 GSAP。保持动画可中断、不破坏可访问性（注意 prefers-reduced-motion）。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "vue",
        code: `<script setup>
import { ref } from 'vue'
const on = ref(false)
</script>
<template>
  <div class="box" :class="{ big: on }" @click="on = !on" />
</template>
<style>
.box { transition: all .3s; width: 48px; height: 48px; }
.box.big { width: 96px; height: 96px; }
</style>`,
      },
      { type: "demo", kind: "animation", title: "动手：状态动画" },
      {
        type: "quiz",
        questions: [
          {
            id: "an1",
            question: "列表位移动画优先？",
            options: ["Transition", "TransitionGroup", "v-html", "v-once"],
            answer: 1,
            explain: "FLIP 列表。",
          },
        ],
      },
    ],
  },
  {
    slug: "ways-of-using-vue",
    title: "使用 Vue 的多种方式",
    summary: "渐进式：增强 HTML → SPA → Web Components，对应 extras/ways-of-using-vue。",
    level: "入门",
    track: "官网对齐",
    minutes: 9,
    official: "/guide/extras/ways-of-using-vue.html",
    blocks: [
      {
        type: "text",
        title: "渐进式",
        body: "Vue 不必一上来就上全家桶：可在多页里渐进增强；可做完整 SPA；可编译为自定义元素嵌入别的系统。按团队与产品边界选型，而不是追最重架构。",
      },
      {
        type: "code",
        title: "光谱",
        lang: "text",
        code: `CDN 增强一小块 UI
  → Vite SPA + Router + Pinia
  → Nuxt 全栈 / SSR
  → defineCustomElement 嵌入`,
      },
      { type: "demo", kind: "counter", title: "最小增强示例" },
      {
        type: "quiz",
        questions: [
          {
            id: "wu1",
            question: "Vue 定位？",
            options: ["只能大型 SPA", "渐进式框架", "只能 CDN", "只能小程序"],
            answer: 1,
            explain: "Progressive。",
          },
        ],
      },
    ],
  },
  {
    slug: "built-in-directives",
    title: "内置指令参考",
    summary: "v-if/v-for/v-model/v-memo… 对应 api/built-in-directives。",
    level: "入门",
    track: "官网对齐",
    minutes: 12,
    official: "/api/built-in-directives.html",
    blocks: [
      {
        type: "text",
        title: "指令清单",
        body: "v-text、v-html、v-show、v-if、v-else、v-else-if、v-for、v-on、v-bind、v-model、v-slot、v-pre、v-once、v-memo、v-cloak。v-memo 可跳过子树更新；v-once 只渲染一次。细节与参数以官网 API 为准。",
      },
      {
        type: "code",
        title: "对应源码 · v-memo",
        lang: "vue",
        code: `<div v-for="item in list" :key="item.id" v-memo="[item.id === selected]">
  <!-- 仅当选中态相关变化时更新该项 -->
  <Heavy :item="item" />
</div>`,
      },
      { type: "demo", kind: "directives-ref", title: "速览：常用指令" },
      {
        type: "quiz",
        questions: [
          {
            id: "bd1",
            question: "跳过更新优化？",
            options: ["v-pre", "v-memo", "v-cloak", "v-html"],
            answer: 1,
            explain: "v-memo。",
          },
        ],
      },
    ],
  },
  {
    slug: "special-elements",
    title: "内置特殊元素与属性",
    summary: "component / slot / template 与 key/ref/is，对应 built-in specials。",
    level: "进阶",
    track: "官网对齐",
    minutes: 11,
    official: "/api/built-in-special-elements.html",
    blocks: [
      {
        type: "text",
        title: "特殊点",
        body: '<component :is="..."> 动态组件；<slot> 出口；<template> 不渲染的包裹。特殊属性：key（diff 身份）、ref（模板引用）、is（原生/自定义元素场景）。',
      },
      {
        type: "code",
        title: "对应源码",
        lang: "vue",
        code: `<script setup>
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import { ref } from 'vue'
const view = ref('Foo')
const map = { Foo, Bar }
</script>
<template>
  <button @click="view = view === 'Foo' ? 'Bar' : 'Foo'">切</button>
  <component :is="map[view]" />
</template>`,
      },
      { type: "demo", kind: "keepalive", title: "对照：动态组件 + KeepAlive" },
      {
        type: "quiz",
        questions: [
          {
            id: "se1",
            question: "动态组件标签？",
            options: ["<dynamic>", "<component :is>", "<switch>", "<view>"],
            answer: 1,
            explain: "component :is。",
          },
        ],
      },
    ],
  },
  {
    slug: "reactivity-utilities",
    title: "响应式工具 API",
    summary: "isRef、toValue、toRaw、unref… 对应 api/reactivity-utilities。",
    level: "进阶",
    track: "官网对齐",
    minutes: 12,
    official: "/api/reactivity-utilities.html",
    blocks: [
      {
        type: "text",
        title: "常用工具",
        body: "isRef / unref / toValue（Vue 3.3+，兼容 ref 与 getter）、toRefs、toRef、isProxy、isReactive、isReadonly、toRaw、markRaw。写库/composable 时 toValue 特别好用。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "ts",
        code: `import { ref, toValue, toRaw, isRef } from 'vue'

function useTitle(src: MaybeRefOrGetter<string>) {
  watchEffect(() => {
    document.title = toValue(src)
  })
}

const state = reactive({ n: 1 })
console.log(toRaw(state) === state) // 取原始对象`,
      },
      { type: "demo", kind: "ref-vs-reactive", title: "复习：ref/reactive 边界" },
      {
        type: "quiz",
        questions: [
          {
            id: "ru1",
            question: "统一读取 ref 或 getter？",
            options: ["toValue", "toRaw", "markRaw", "reactive"],
            answer: 0,
            explain: "toValue。",
          },
        ],
      },
    ],
  },
  {
    slug: "app-config",
    title: "应用配置与全局 API",
    summary: "errorHandler、globalProperties、provide，对应 api/application。",
    level: "进阶",
    track: "官网对齐",
    minutes: 11,
    official: "/api/application.html",
    blocks: [
      {
        type: "text",
        title: "app 级能力",
        body: "app.config.errorHandler 捕获渲染错误；warnHandler 开发警告；globalProperties 挂全局（慎用）；app.provide 根提供；app.component / directive 全局注册；app.use 插件。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "ts",
        code: `const app = createApp(App)
app.config.errorHandler = (err, instance, info) => {
  // 上报
}
app.provide('apiBase', '/api')
app.config.globalProperties.$http = fetch
app.mount('#app')`,
      },
      { type: "demo", kind: "plugins", title: "对照：全局扩展" },
      {
        type: "quiz",
        questions: [
          {
            id: "ap1",
            question: "捕获组件渲染错误？",
            options: ["window.onerror only", "app.config.errorHandler", "v-memo", "key"],
            answer: 1,
            explain: "应用配置。",
          },
        ],
      },
    ],
  },
  {
    slug: "security",
    title: "安全",
    summary: "XSS、敏感数据与规则，对应 best-practices/security。",
    level: "实战",
    track: "官网对齐",
    minutes: 12,
    official: "/guide/best-practices/security.html",
    blocks: [
      {
        type: "text",
        title: "官网安全底线",
        body: "模板插值默认转义。v-html / 动态 :href=javascript: / 用户样式都可能成为 XSS 面。永远别把私钥、长期 token 明文塞进前端包。鉴权与授权在服务端强制执行。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "vue",
        code: `<!-- ✅ 默认安全 -->
<p>{{ userProvidedText }}</p>

<!-- ❌ 危险 -->
<div v-html="userProvidedHtml"></div>
<a :href="userUrl">链接</a> <!-- 需校验协议 -->`,
      },
      { type: "demo", kind: "challenge", title: "挑战：标出危险写法" },
      {
        type: "quiz",
        questions: [
          {
            id: "sec1",
            question: "插值 {{ }} 默认？",
            options: ["执行脚本", "转义文本", "等于 v-html", "禁用中文"],
            answer: 1,
            explain: "防 XSS 基础。",
          },
        ],
      },
    ],
  },
  {
    slug: "accessibility",
    title: "无障碍 Accessibility",
    summary: "语义、键盘、焦点与表单，对应 best-practices/accessibility。",
    level: "实战",
    track: "官网对齐",
    minutes: 12,
    official: "/guide/best-practices/accessibility.html",
    blocks: [
      {
        type: "text",
        title: "基础清单",
        body: "用 button/a 而不是 div 点击；表单控件绑定 label；管理焦点（对话框打开聚焦、关闭归还）；颜色对比；为图标按钮提供 aria-label；路由切换可考虑焦点重置。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "vue",
        code: `<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>
<template>
  <button type="button" @click="open = true">打开</button>
  <div v-if="open" role="dialog" aria-modal="true" aria-labelledby="t">
    <h2 id="t">标题</h2>
    <button type="button" @click="open = false">关闭</button>
  </div>
</template>`,
      },
      { type: "demo", kind: "template-ref", title: "对照：焦点管理用 ref" },
      {
        type: "quiz",
        questions: [
          {
            id: "a11y1",
            question: "可点击交互优先？",
            options: ["div+onclick", "button/a 语义元素", "span", "p"],
            answer: 1,
            explain: "键盘与读屏友好。",
          },
        ],
      },
    ],
  },
  {
    slug: "ts-overview",
    title: "TypeScript 概览",
    summary: "官方 TS 使用方式，对应 typescript/overview。",
    level: "实战",
    track: "官网对齐",
    minutes: 11,
    official: "/guide/typescript/overview.html",
    blocks: [
      {
        type: "text",
        title: "官方立场",
        body: "Vue 对 TS 一等支持。用 create-vue 勾选 TS；Volar 接管 .vue。API 优先 defineComponent 或 script setup + 泛型宏。避免 any 穿透 props/API 边界。",
      },
      {
        type: "code",
        title: "对应源码",
        lang: "vue",
        code: `<script setup lang="ts">
import { ref } from 'vue'
const count = ref<number>(0)
defineProps<{ msg: string }>()
</script>`,
      },
      { type: "demo", kind: "form", title: "对照：表单也要类型" },
      {
        type: "quiz",
        questions: [
          {
            id: "to1",
            question: ".vue 里 TS 推荐插件？",
            options: ["仅 ESLint", "Volar (Vue Official)", "jQuery", "Babel only"],
            answer: 1,
            explain: "官方 IDE 支持。",
          },
        ],
      },
    ],
  },
];

export const TRACKS = [
  "基础",
  "进阶",
  "全栈准备",
  "全栈实训",
  "工程化",
  "进阶模式",
  "官网对齐",
] as const;

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getLessonIndex(slug: string): number {
  return LESSONS.findIndex((l) => l.slug === slug);
}

export function getAdjacent(slug: string): {
  prev?: Lesson;
  next?: Lesson;
} {
  const i = getLessonIndex(slug);
  if (i < 0) return {};
  return {
    prev: i > 0 ? LESSONS[i - 1] : undefined,
    next: i < LESSONS.length - 1 ? LESSONS[i + 1] : undefined,
  };
}

export function getLessonsByTrack(track: Lesson["track"]) {
  return LESSONS.filter((l) => l.track === track);
}

export function getAllQuizQuestions(): Array<
  QuizQuestion & { lessonSlug: string; lessonTitle: string }
> {
  const out: Array<
    QuizQuestion & { lessonSlug: string; lessonTitle: string }
  > = [];
  for (const lesson of LESSONS) {
    for (const block of lesson.blocks) {
      if (block.type === "quiz") {
        for (const q of block.questions) {
          out.push({
            ...q,
            lessonSlug: lesson.slug,
            lessonTitle: lesson.title,
          });
        }
      }
    }
  }
  return out;
}
