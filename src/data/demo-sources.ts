import type { DemoKind } from "@/data/lessons";

export type DemoSource = {
  lang: string;
  title: string;
  code: string;
};

/** 每个交互 Demo 对应的「官方示例源码」——页面讲解与 live 区共用，保证一一对应 */
export const DEMO_SOURCES: Record<DemoKind, DemoSource> = {
  counter: {
    lang: "vue",
    title: "计数器 · Composition API",
    code: `<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <p>点了 {{ count }} 次</p>
  <button @click="count++">count++</button>
  <button @click="count = 0">重置</button>
</template>`,
  },
  template: {
    lang: "vue",
    title: "模板插值与绑定",
    code: `<script setup>
import { ref } from 'vue'
const msg = ref('你好，Vue')
const isActive = ref(true)
</script>

<template>
  <p>{{ msg }}</p>
  <p :class="{ active: isActive }">
    :class 绑定 → {{ isActive ? 'active' : 'inactive' }}
  </p>
</template>`,
  },
  "ref-vs-reactive": {
    lang: "vue",
    title: "ref 与 reactive",
    code: `<script setup>
import { ref, reactive } from 'vue'
const count = ref(0)
const state = reactive({ name: 'Vue', n: 1 })
// 脚本中读/写 ref 用 .value
// 解构 reactive 会丢响应式 → 用 toRefs(state)
</script>

<template>
  <p>{{ count }}</p>
  <button @click="count++">count.value++</button>
  <p>{{ state.name }} / {{ state.n }}</p>
  <button @click="state.n++">state.n++</button>
</template>`,
  },
  computed: {
    lang: "vue",
    title: "computed + watch",
    code: `<script setup>
import { ref, computed, watch } from 'vue'
const first = ref('Ada')
const last = ref('Lovelace')
const full = computed(() => \`\${first.value} \${last.value}\`)
watch(full, (v) => console.log('watch →', v))
</script>

<template>
  <input v-model="first" />
  <input v-model="last" />
  <p>{{ full }}</p>
</template>`,
  },
  list: {
    lang: "vue",
    title: "v-if / v-for + key",
    code: `<script setup>
import { ref } from 'vue'
const show = ref(true)
const items = ref([
  { id: 1, text: '学 ref' },
  { id: 2, text: '学 v-for' },
])
let nextId = 3
function add(text) {
  items.value.push({ id: nextId++, text })
}
function remove(id) {
  items.value = items.value.filter((x) => x.id !== id)
}
</script>

<template>
  <label><input type="checkbox" v-model="show" /> v-if</label>
  <ul v-if="show">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
      <button @click="remove(item.id)">删</button>
    </li>
  </ul>
  <p v-else>已隐藏</p>
</template>`,
  },
  events: {
    lang: "vue",
    title: "事件与修饰符",
    code: `<script setup>
import { ref } from 'vue'
const n = ref(0)
function add(step = 1) { n.value += step }
function onSubmit(e) { /* .prevent 已拦默认提交 */ }
</script>

<template>
  <p>{{ n }}</p>
  <button @click="n++">@click +1</button>
  <button @click="add(5)">@click="add(5)"</button>
  <form @submit.prevent="onSubmit">
    <button type="submit">@submit.prevent</button>
  </form>
</template>`,
  },
  form: {
    lang: "vue",
    title: "v-model 表单",
    code: `<script setup>
import { ref } from 'vue'
const name = ref('')
const age = ref(18)
const agree = ref(false)
const color = ref('green')
</script>

<template>
  <input v-model.trim="name" />
  <input v-model.number="age" type="number" />
  <input type="checkbox" v-model="agree" />
  <select v-model="color">
    <option value="green">绿</option>
    <option value="blue">蓝</option>
  </select>
  <pre>{{ { name, age, agree, color } }}</pre>
</template>`,
  },
  component: {
    lang: "vue",
    title: "父子组件实例",
    code: `<!-- CounterCard.vue -->
<script setup>
import { ref } from 'vue'
defineProps<{ label: string }>()
const n = ref(0)
</script>
<template>
  <div>
    <p>{{ label }}</p>
    <p>{{ n }}</p>
    <button @click="n++">子组件 +1</button>
  </div>
</template>

<!-- Parent.vue -->
<template>
  <CounterCard label="#1" />
  <CounterCard label="#2" />
</template>`,
  },
  lifecycle: {
    lang: "vue",
    title: "onMounted / onUnmounted",
    code: `<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const ticks = ref(0)
let id
onMounted(() => {
  id = setInterval(() => ticks.value++, 1000)
})
onUnmounted(() => clearInterval(id))
</script>

<template>
  <p>{{ ticks }}s</p>
</template>`,
  },
  todo: {
    lang: "vue",
    title: "Todo：props / emit 思路",
    code: `<script setup>
import { ref } from 'vue'
const items = ref([
  { id: 1, text: '读完 Props', done: false },
  { id: 2, text: '完成测验', done: true },
])
const draft = ref('')
let nextId = 3
function add() {
  const t = draft.value.trim()
  if (!t) return
  items.value.push({ id: nextId++, text: t, done: false })
  draft.value = ''
}
function toggle(id) {
  const it = items.value.find((x) => x.id === id)
  if (it) it.done = !it.done
}
function remove(id) {
  items.value = items.value.filter((x) => x.id !== id)
}
</script>

<template>
  <input v-model="draft" @keyup.enter="add" />
  <button @click="add">添加</button>
  <li v-for="it in items" :key="it.id">
    <input type="checkbox" :checked="it.done" @change="toggle(it.id)" />
    <span :class="{ done: it.done }">{{ it.text }}</span>
    <button @click="remove(it.id)">删</button>
  </li>
</template>`,
  },
  router: {
    lang: "vue",
    title: "Vue Router 最小结构",
    code: `// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  { path: '/', component: Home },
  { path: '/lesson/:slug', component: Lesson },
  { path: '/about', component: About },
]
export default createRouter({ history: createWebHistory(), routes })

// App.vue
<template>
  <RouterLink to="/">/</RouterLink>
  <RouterLink to="/lesson/intro">/lesson/intro</RouterLink>
  <RouterView />
</template>

// 页面里
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()   // route.params.slug
const router = useRouter() // router.push(...)`,
  },
  pinia: {
    lang: "ts",
    title: "Pinia setup store",
    code: `// stores/cart.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
export const useCartStore = defineStore('cart', () => {
  const items = ref<string[]>(['学 Pinia'])
  const count = computed(() => items.value.length)
  function add(text: string) {
    if (text.trim()) items.value.push(text.trim())
  }
  return { items, count, add }
})

// 任意组件
const cart = useCartStore()
cart.add('新商品')
// cart.items / cart.count 跨组件共享`,
  },
  challenge: {
    lang: "vue",
    title: "响应式陷阱（错误 vs 正确）",
    code: `// ❌ 解构 reactive 丢响应
const state = reactive({ n: 0 })
let { n } = state  // n 不再响应
n++

// ✅ toRefs
const { n } = toRefs(state)
n.value++

// ❌ computed 里发请求
const data = computed(() => fetch('/api')) // 副作用！

// ✅ watch / 事件里请求
watch(id, async (v) => { data.value = await api(v) })

// 大对象用 shallowRef，替换整个 .value 才触发`,
  },
  slots: {
    lang: "vue",
    title: "默认 / 具名 / 作用域插槽",
    code: `<!-- Card.vue -->
<template>
  <header><slot name="header">默认标题</slot></header>
  <main><slot /></main>
  <footer>
    <slot name="footer" :count="3">默认脚</slot>
  </footer>
</template>

<!-- 使用 -->
<Card>
  <template #header>自定义头</template>
  默认插槽内容
  <template #footer="{ count }">共 {{ count }} 项</template>
</Card>`,
  },
  provide: {
    lang: "vue",
    title: "provide / inject",
    code: `// keys.ts
import type { InjectionKey, Ref } from 'vue'
export const themeKey: InjectionKey<Ref<'dark'|'light'>> = Symbol('theme')

// Ancestor.vue
import { provide, ref } from 'vue'
import { themeKey } from './keys'
const theme = ref<'dark'|'light'>('dark')
provide(themeKey, theme)

// DeepChild.vue
import { inject } from 'vue'
import { themeKey } from './keys'
const theme = inject(themeKey)!
// theme.value`,
  },
  async: {
    lang: "vue",
    title: "请求三态 loading / error / data",
    code: `<script setup>
import { ref } from 'vue'
const status = ref('idle') // idle | loading | ok | error
const items = ref([])
async function load(ok = true) {
  status.value = 'loading'
  items.value = []
  try {
    await new Promise((r) => setTimeout(r, 700))
    if (!ok) throw new Error('fail')
    items.value = ['学 fetch', '处理 loading', '处理 error']
    status.value = 'ok'
  } catch {
    status.value = 'error'
  }
}
// 离开页面：AbortController.abort()
</script>

<template>
  <button @click="load(true)">成功</button>
  <button @click="load(false)">失败</button>
  <p v-if="status==='loading'">loading…</p>
  <p v-else-if="status==='error'">error</p>
  <ul v-else-if="status==='ok'">
    <li v-for="t in items" :key="t">{{ t }}</li>
  </ul>
</template>`,
  },
  guard: {
    lang: "ts",
    title: "路由守卫门禁",
    code: `// router/index.ts
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

// 路由表
{ path: '/dashboard', component: Dash, meta: { requiresAuth: true } }

// 登录成功后
router.push((route.query.redirect as string) || '/dashboard')

// 注意：前端守卫 ≠ 安全，服务端必须再验 token`,
  },
  validate: {
    lang: "vue",
    title: "字段级表单校验",
    code: `<script setup>
import { reactive, ref } from 'vue'
const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const ok = ref(false)
function submit() {
  errors.email = /@/.test(form.email) ? '' : '邮箱格式不对'
  errors.password = form.password.length >= 6 ? '' : '至少 6 位'
  ok.value = !errors.email && !errors.password
}
</script>

<template>
  <input v-model="form.email" />
  <p v-if="errors.email">{{ errors.email }}</p>
  <input v-model="form.password" type="password" />
  <p v-if="errors.password">{{ errors.password }}</p>
  <button @click="submit">提交</button>
  <p v-if="ok">校验通过</p>
</template>`,
  },
  teleport: {
    lang: "vue",
    title: "Teleport 到 body",
    code: `<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>

<template>
  <button @click="open = true">打开弹层</button>
  <Teleport to="body">
    <div v-if="open" class="modal-mask" @click.self="open = false">
      <div class="modal">
        <p>我在 body 下，不被父级 overflow 裁剪</p>
        <button @click="open = false">关闭</button>
      </div>
    </div>
  </Teleport>
</template>`,
  },
  keepalive: {
    lang: "vue",
    title: "KeepAlive 缓存实例",
    code: `<script setup>
import { ref } from 'vue'
const tab = ref('A')
</script>

<template>
  <button @click="tab = 'A'">A</button>
  <button @click="tab = 'B'">B</button>
  <KeepAlive>
    <component :is="tab === 'A' ? CompA : CompB" :key="tab" />
  </KeepAlive>
  <!-- 切走再回来：输入框状态保留 -->
</template>`,
  },
  directive: {
    lang: "vue",
    title: "自定义指令",
    code: `// directives/focus.ts
export const vFocus = {
  mounted: (el: HTMLElement) => el.focus(),
}

// 使用
<input v-focus />

// 带参数
const vColor = {
  mounted(el, binding) {
    el.style.color = binding.value
  },
  updated(el, binding) {
    el.style.color = binding.value
  },
}
// <p v-color="'tomato'">高亮</p>`,
  },
  "class-style": {
    lang: "vue",
    title: "Class 与 Style 绑定",
    code: `<script setup>
import { ref, reactive } from 'vue'
const isActive = ref(true)
const hasError = ref(false)
const styleObj = reactive({ color: 'tomato', fontSize: '18px' })
</script>

<template>
  <div class="static" :class="{ active: isActive, 'text-danger': hasError }">对象 class</div>
  <div :class="[isActive ? 'active' : '', 'rounded']">数组 class</div>
  <p :style="styleObj">对象 style</p>
</template>`,
  },
  watchers: {
    lang: "vue",
    title: "watch / watchEffect",
    code: `<script setup>
import { ref, watch } from 'vue'
const id = ref(1)
const log = ref([])
watch(id, (n, o, onCleanup) => {
  let cancelled = false
  onCleanup(() => { cancelled = true })
  if (!cancelled) log.value.push(\`\${o} → \${n}\`)
})
</script>`,
  },
  "template-ref": {
    lang: "vue",
    title: "模板 ref",
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
  "component-vmodel": {
    lang: "vue",
    title: "组件 v-model",
    code: `<script setup>
const model = defineModel({ type: String })
</script>
<template>
  <input :value="model" @input="model = $event.target.value" />
</template>
<!-- 父：<CustomInput v-model="text" /> -->`,
  },
  fallthrough: {
    lang: "vue",
    title: "透传 attrs",
    code: `<script setup>
defineOptions({ inheritAttrs: false })
defineProps<{ label: string }>()
</script>
<template>
  <label>
    {{ label }}
    <input v-bind="$attrs" />
  </label>
</template>`,
  },
  "async-comp": {
    lang: "ts",
    title: "defineAsyncComponent",
    code: `import { defineAsyncComponent } from 'vue'
const Heavy = defineAsyncComponent({
  loader: () => import('./Heavy.vue'),
  loadingComponent: Spinner,
  delay: 200,
})`,
  },
  transition: {
    lang: "vue",
    title: "Transition",
    code: `<script setup>
import { ref } from 'vue'
const show = ref(true)
</script>
<template>
  <button @click="show = !show">toggle</button>
  <Transition name="fade">
    <p v-if="show">Hello</p>
  </Transition>
</template>`,
  },
  suspense: {
    lang: "vue",
    title: "Suspense",
    code: `<Suspense>
  <template #default><AsyncPage /></template>
  <template #fallback><div>Loading...</div></template>
</Suspense>`,
  },
  plugins: {
    lang: "ts",
    title: "app.use 插件",
    code: `export default {
  install(app, options) {
    app.config.globalProperties.$translate = (key) =>
      options.messages[key] ?? key
  },
}
app.use(plugin, { messages: { hello: '你好' } })`,
  },
};

export function getDemoSource(kind: DemoKind): DemoSource {
  return DEMO_SOURCES[kind];
}
