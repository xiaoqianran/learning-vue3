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
  | "directive";

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
  track: "基础" | "进阶" | "全栈准备" | "全栈实训" | "工程化" | "进阶模式";
  minutes: number;
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
];

export const TRACKS = ["基础", "进阶", "全栈准备", "全栈实训", "工程化", "进阶模式"] as const;

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
  const out: Array<QuizQuestion & { lessonSlug: string; lessonTitle: string }> = [];
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
