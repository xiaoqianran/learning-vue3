import type { CausalLab, CounterfactualWorld } from "../types";

const headerString = `<script setup>
import { inject } from 'vue'
const user = inject('user', '游客')
</script>
<template>
  <p class="who">你好，{{ user }}</p>
</template>
`;

const appString = `<script setup>
import { ref, provide } from 'vue'
import Header from './Header.vue'
const user = ref('Ada')
provide('user', user)
</script>
<template>
  <Header />
  <button @click="user = user === 'Ada' ? 'Lin' : 'Ada'">换人</button>
</template>
`;

const headerTypo = `<script setup>
import { inject } from 'vue'
const user = inject('usr', '游客')
</script>
<template>
  <p class="who">你好，{{ user }}</p>
</template>
`;

const appAnon = `<script setup>
import { ref, provide } from 'vue'
import Header from './Header.vue'
const user = ref('Ada')
provide(Symbol('user'), user)
</script>
<template>
  <Header />
  <button @click="user = user === 'Ada' ? 'Lin' : 'Ada'">换人</button>
</template>
`;

const headerAnon = `<script setup>
import { inject } from 'vue'
const user = inject(Symbol('user'), '游客')
</script>
<template>
  <p class="who">你好，{{ user }}</p>
</template>
`;

const userKey = `import type { InjectionKey, Ref } from 'vue'

export const UserKey: InjectionKey<Ref<string>> = Symbol('user')
`;

const themeKey = `import type { InjectionKey, Ref } from 'vue'

export const ThemeKey: InjectionKey<Ref<string>> = Symbol('theme')
`;

const keysBoth = `import type { InjectionKey, Ref } from 'vue'

export const UserKey: InjectionKey<Ref<string>> = Symbol('user')
export const ThemeKey: InjectionKey<Ref<string>> = Symbol('theme')
`;

const appShared = `<script setup lang="ts">
import { ref, provide } from 'vue'
import { UserKey } from './keys'
import Header from './Header.vue'
const user = ref('Ada')
provide(UserKey, user)
</script>
<template>
  <Header />
  <button @click="user = user === 'Ada' ? 'Lin' : 'Ada'">换人</button>
</template>
`;

const headerShared = `<script setup lang="ts">
import { inject } from 'vue'
import { UserKey } from './keys'
const user = inject(UserKey, '游客' as never)
</script>
<template>
  <p class="who">你好，{{ user }}</p>
</template>
`;

const headerWrongKey = `<script setup lang="ts">
import { inject } from 'vue'
import { ThemeKey } from './keys'
const user = inject(ThemeKey, '游客' as never)
</script>
<template>
  <p class="who">你好，{{ user }}</p>
</template>
`;

const transferBefore = `<script setup>
import { ref, provide } from 'vue'
import Box from './Box.vue'
const theme = ref('mocha')
provide('theme', theme)
</script>
<template>
  <Box />
  <button @click="theme = theme === 'mocha' ? 'latte' : 'mocha'">换皮肤</button>
</template>
`;

const boxTypo = `<script setup>
import { inject } from 'vue'
const theme = inject('thme', '（没有）')
</script>
<template>
  <p class="card">当前皮肤：{{ theme }}</p>
</template>
`;

const transferApp = `<script setup lang="ts">
import { ref, provide } from 'vue'
import { ThemeKey } from './keys'
import Box from './Box.vue'
const theme = ref('mocha')
provide(ThemeKey, theme)
</script>
<template>
  <Box />
  <button @click="theme = theme === 'mocha' ? 'latte' : 'mocha'">换皮肤</button>
</template>
`;

const transferBox = `<script setup lang="ts">
import { inject } from 'vue'
import { ThemeKey } from './keys'
const theme = inject(ThemeKey, '（没有）' as never)
</script>
<template>
  <p class="card">当前皮肤：{{ theme }}</p>
</template>
`;

const worldString: CounterfactualWorld = {
  id: "str",
  name: "同一根字符串",
  tagline: "provide('user') / inject('user')",
  files: { "src/App.vue": appString, "src/Header.vue": headerString },
  nodes: [
    { id: "key", kind: "script", label: "'user'" },
    { id: "dom", kind: "dom", label: "Ada" },
  ],
  edges: [{ from: "key", to: "dom", label: "对得上" }],
  note: "字符串相等就对上。拼错才会丢。",
};

const worldAnon: CounterfactualWorld = {
  id: "anon",
  name: "两次 Symbol('user')",
  tagline: "看起来像同一把钥匙",
  files: { "src/App.vue": appAnon, "src/Header.vue": headerAnon },
  nodes: [
    { id: "a", kind: "script", label: "Symbol() 一次" },
    { id: "b", kind: "script", label: "Symbol() 又一次" },
    { id: "dom", kind: "dom", label: "游客" },
  ],
  edges: [{ from: "b", to: "dom", label: "对不上" }],
  note: "每次 Symbol() 都是新身份。描述文字相同，钥匙不同。",
};

export const INJECTKEY_LAB: CausalLab = {
  id: "injectkey",
  world: 8,
  concept: "InjectionKey",
  title: "钥匙也可以不是字符串",
  subtitle: "provide/inject 靠同一份引用对上。InjectionKey 让这份引用带着类型。",
  promise:
    "一镜一条边：先字符串钥匙能通，再拼错变成游客，再两次匿名 Symbol 对不上，再导出同一把钥匙，再写成 InjectionKey，再拿成另一把。",
  minutes: 16,
  official: "/guide/typescript/composition-api.html#typing-provide-inject",
  scenes: [
    {
      id: "injectkey-s0",
      tick: "S0",
      title: "字符串钥匙能通",
      goal: "provide('user', user)。inject('user')。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appString, "src/Header.vue": headerString },
        blocks: [{ id: "str", label: "① 同一根字符串" }],
        narration: "World 5 已经见过。这一课问的是：这根字符串够不够当契约。",
      },
      observe: {
        state: [{ id: "user", label: "user", value: "Ada", symbol: "user" }],
        dom: [{ id: "who", label: ".who", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "provide", kind: "script", label: "provide('user')" },
        { id: "inject", kind: "script", label: "inject('user')" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "provide", to: "inject", label: "字符串相等" },
        { from: "inject", to: "dom" },
      ],
      explanation: {
        headline: "字符串能通，是因为两次写一样",
        body: "没有编译器帮你对。下一镜只改一个字母。",
      },
      tryThis: "应看见你好，Ada。点换人应变 Lin。记住这把能通的钥匙。",
      faqs: [
        { q: "为什么默认值是游客？", a: "inject 找不到钥匙时的退路。下一镜会用上它。" },
      ],
    },
    {
      id: "injectkey-s1",
      tick: "S1",
      title: "少一个字母",
      goal: "inject('usr')。provide 仍是 'user'。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "钥匙差一个字母。Header 会？",
        choices: [
          { id: "ada", label: "仍是 Ada。差不多就算对", correct: false, why: "字符串精确匹配。" },
          { id: "guest", label: "游客。找不到，走默认值", correct: true, why: "World 5 同一张脸。字符串钥匙没有类型帮忙。" },
          { id: "err", label: "报错：未知的 inject", correct: false, why: "静默落到默认值。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appString, "src/Header.vue": headerTypo },
        blocks: [{ id: "typo", label: "② inject('usr')" }],
        narration: "只改钥匙上的一个字母。值还在树上，没人用对的名字去取。",
      },
      observe: {
        state: [{ id: "user", label: "user", value: "Ada（树上）" }],
        dom: [{ id: "who", label: ".who", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "provide", kind: "script", label: "'user'" },
        { id: "inject", kind: "script", label: "'usr'" },
        { id: "dom", kind: "dom", label: "游客" },
      ],
      edges: [{ from: "inject", to: "dom", label: "默认值" }],
      why: {
        question: "TypeScript 能发现 'usr' 写错了吗？",
        choices: [
          { id: "no", label: "不能。两根普通字符串，没有共同的类型名字", correct: true, why: "这就是 InjectionKey 要解决的：钥匙必须是同一份导出，而不是两处手写。" },
          { id: "yes", label: "能。同名函数都会被检查", correct: false, why: "provide/inject 的字符串参数是普通 string。" },
          { id: "vue", label: "Vue 会扫描祖先的 provide 列表来补全", correct: false, why: "IDE 插件做不到跨文件猜字符串。" },
        ],
      },
      explanation: {
        headline: "两处手写，没有同一份名字",
        body: "字符串钥匙的契约是「请你自己拼对」。下一镜看起来更像钥匙的 Symbol，两次现场 new，会更糟。",
      },
      faqs: [
        { q: "和 props 漏传一样吗？", a: "脸都是默认值/空。props 缺的是属性。inject 缺的是钥匙对不上。" },
      ],
      tryThis: "必须看见游客。点换人也不该变成 Lin。",
      mapping: [{ code: "inject('usr')", runtime: "找不到", ui: "游客" }],
    },
    {
      id: "injectkey-s2",
      tick: "S2",
      title: "两次 Symbol('user')",
      goal: "provide(Symbol('user'))。inject(Symbol('user'))。描述相同。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "两边都写 Symbol('user')。会？",
        choices: [
          { id: "ada", label: "Ada。描述文字相同就是同一把", correct: false, why: "每次调用 Symbol() 都得到新身份。描述只是调试标签。" },
          { id: "guest", label: "游客。两把钥匙，对不上", correct: true, why: "引用相等，不是标签相等。这是 Symbol 的本意。" },
          { id: "err", label: "报错：不能用 Symbol 当钥匙", correct: false, why: "合法。Vue 允许对象/Symbol 当 key。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appAnon, "src/Header.vue": headerAnon },
        blocks: [{ id: "anon", label: "③ 各 new 一次 Symbol" }],
        narration: "看起来比字符串更像钥匙。其实你造了两把。",
      },
      counterfactual: {
        id: "string-vs-anon",
        title: "字符串 vs 两次 Symbol",
        setup: "同一句你好。差在钥匙是不是同一份引用。",
        worlds: [worldString, worldAnon],
        punchline: "钥匙看的是身份，不是铭牌上刻了 user。",
      },
      observe: {
        state: [{ id: "k", label: "key", value: "两份 Symbol" }],
        dom: [{ id: "who", label: ".who", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "a", kind: "script", label: "Symbol() 提供" },
        { id: "b", kind: "script", label: "Symbol() 注入" },
        { id: "dom", kind: "dom", label: "游客" },
      ],
      edges: [{ from: "b", to: "dom", label: "对不上" }],
      explanation: {
        headline: "铭牌不是身份",
        body: "Symbol('user') 的 'user' 只出现在控制台。真正的钥匙是那一次调用返回的引用。下一镜把这把钥匙导出成一份。",
      },
      faqs: [
        { q: "Symbol.for('user') 呢？", a: "全局登记，同描述会拿到同一把。能通。但没有类型，也容易撞名。教学里用模块导出的那一份。" },
      ],
      tryThis: "必须是游客。打开反事实对比字符串能通的世界。",
      mapping: [{ code: "Symbol('user') × 2", runtime: "两个身份", ui: "游客" }],
    },
    {
      id: "injectkey-s3",
      tick: "S3",
      title: "导出同一把钥匙",
      goal: "keys.ts 里一份 UserKey。两边都 import。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "provide(UserKey) 和 inject(UserKey) 用同一份导出。会？",
        choices: [
          { id: "ada", label: "Ada。引用是同一份", correct: true, why: "模块只求值一次。两处 import 握着同一把 Symbol。" },
          { id: "guest", label: "仍是游客。import 会复制一份", correct: false, why: "ESM 导出的是同一引用。和 isolate 课「模块单例」同一张图，这次我们要的就是同一份。" },
          { id: "err", label: "报错：不能跨文件用 Symbol", correct: false, why: "这正是正确用法。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appShared,
          "src/Header.vue": headerShared,
          "src/keys.ts": userKey,
        },
        blocks: [{ id: "one", label: "④ 一份 UserKey" }],
        narration: "只改调用次数：Symbol 被 new 了一次，然后到处 import。",
      },
      observe: {
        state: [{ id: "user", label: "user", value: "Ada", symbol: "user" }],
        dom: [{ id: "who", label: ".who", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "key", kind: "script", label: "UserKey" },
        { id: "provide", kind: "script", label: "provide" },
        { id: "inject", kind: "script", label: "inject" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "key", to: "provide" },
        { from: "key", to: "inject" },
        { from: "inject", to: "dom" },
      ],
      explanation: {
        headline: "钥匙是一份导出",
        body: "和 Pinia 的 defineStore 同一纪律：定义可以在模块顶层，引用必须是同一份。下一镜只给这把钥匙加上类型，运行时不变。",
      },
      faqs: [
        { q: "为什么不直接写在组件里？", a: "写在组件里，每个文件各 new 一次，就是 S2。导出才能保证同一份引用。" },
      ],
      tryThis: "你好，Ada。换人应变 Lin。和 S0 同一张脸，钥匙不再是两处手写。",
      mapping: [{ code: "export const UserKey = Symbol('user')", runtime: "一份引用", ui: "Ada" }],
    },
    {
      id: "injectkey-s4",
      tick: "S4",
      title: "钥匙带上类型",
      goal: "UserKey: InjectionKey<Ref<string>>。provide / inject 仍用它。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加上 InjectionKey 类型。预览里会？",
        choices: [
          { id: "ada", label: "仍是 Ada。类型不改运行时", correct: true, why: "InjectionKey 是编译期品牌。浏览器里它还是那把 Symbol。" },
          { id: "strict", label: "变成只能注入字符串，ref 会拆开", correct: false, why: "你标注的是 Ref<string>。运行时仍是那只盒子。" },
          { id: "err", label: "InjectionKey 在预览里不存在", correct: false, why: "它只是个类型别名，会被擦掉。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appShared,
          "src/Header.vue": headerShared,
          "src/keys.ts": userKey,
        },
        blocks: [{ id: "type", label: "⑤ InjectionKey<Ref<string>>" }],
        narration: "运行时没变。契约写进了钥匙本身：inject 的返回值不再是 any。",
      },
      observe: {
        state: [{ id: "user", label: "user", value: "Ada", symbol: "user" }],
        dom: [{ id: "who", label: ".who", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "key", kind: "script", label: "InjectionKey" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [{ from: "key", to: "dom", label: "同一把" }],
      explanation: {
        headline: "类型住在钥匙上，不在字符串里",
        body: "inject(UserKey) 的返回类型跟着钥匙走。写错钥匙会在编译期红，也会在运行时落到默认值。下一镜故意拿另一把。",
      },
      faqs: [
        { q: "为什么默认值写了 as never？", a: "默认值是字符串「游客」，钥匙却说是 Ref<string>。真项目里默认值也该是 ref('游客')，种类才能对齐。" },
        { q: "不写 InjectionKey 只导出 Symbol 呢？", a: "运行时一样能通。inject 的返回值是 any。类型要的就是不再 any。" },
      ],
      tryThis: "脸仍是 Ada。这一镜要对的是：类型写在钥匙上，不是写在两处字符串上。",
      mapping: [{ code: "InjectionKey<Ref<string>>", runtime: "仍是 Symbol", ui: "Ada" }],
    },
    {
      id: "injectkey-s5",
      tick: "S5",
      title: "拿成另一把",
      goal: "Header inject(ThemeKey)。App 仍 provide(UserKey)。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "两把都从 keys 导出。Header 拿了 ThemeKey。会？",
        choices: [
          { id: "ada", label: "Ada。都在同一个文件里", correct: false, why: "文件不是身份。UserKey 和 ThemeKey 是两把 Symbol。" },
          { id: "guest", label: "游客。钥匙对不上", correct: true, why: "和 usr 同一张脸，但这回拼写没错——你拿错了那一把。" },
          { id: "err", label: "TS 会让页面起不来", correct: false, why: "类型会红。预览仍落到默认值。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appShared,
          "src/Header.vue": headerWrongKey,
          "src/keys.ts": keysBoth,
        },
        blocks: [{ id: "other", label: "⑥ inject(ThemeKey)" }],
        narration: "不再拼错字母。你拿的是另一份导出。",
      },
      observe: {
        state: [{ id: "k", label: "钥匙", value: "ThemeKey ≠ UserKey" }],
        dom: [{ id: "who", label: ".who", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "user", kind: "script", label: "UserKey" },
        { id: "theme", kind: "script", label: "ThemeKey" },
        { id: "dom", kind: "dom", label: "游客" },
      ],
      edges: [{ from: "theme", to: "dom", label: "拿错" }],
      explanation: {
        headline: "导出有几把，树上就有几条频道",
        body: "字符串时代靠拼写。钥匙时代靠你 import 哪一份。拿错仍是游客。",
      },
      faqs: [
        { q: "provide 字符串、inject Symbol 呢？", a: "对不上。两边必须是同一份引用，或同一根字符串。" },
      ],
      tryThis: "必须是游客。对比上一镜：差别只有 Header 的 import。",
      mapping: [{ code: "inject(ThemeKey)", runtime: "另一把 Symbol", ui: "游客" }],
    },
    {
      id: "injectkey-s6",
      tick: "S6",
      title: "拆成拼写 / 两次 Symbol / 拿错钥匙",
      goal: "三种坏法：usr、匿名 Symbol、ThemeKey。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到 inject('usr')。会？",
        choices: [
          { id: "ada", label: "Ada", correct: false, why: "S1。" },
          { id: "guest", label: "游客", correct: true, why: "字符串对不上。" },
          { id: "err", label: "报错", correct: false, why: "默认值。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": appShared,
          "src/Header.vue": headerShared,
          "src/keys.ts": userKey,
        },
        blocks: [{ id: "keep", label: "同一把 UserKey 先留着" }],
        narration: "先确认 Ada 能换人。再分别：拼错、两次匿名 Symbol、拿成 ThemeKey。",
      },
      observe: {
        state: [{ id: "ok", label: "user", value: "Ada" }],
        dom: [{ id: "who", label: ".who", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "key", kind: "script", label: "UserKey" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "key", to: "dom" }],
      ablations: [
        {
          id: "typo",
          prompt: "如果 inject('usr')？",
          files: { "src/App.vue": appString, "src/Header.vue": headerTypo },
          expected: { kind: "stale", message: "游客。字符串拼错。" },
          lesson: "手写字符串没有同一份名字。",
        },
        {
          id: "anon",
          prompt: "如果两边各 Symbol() 一次？",
          files: { "src/App.vue": appAnon, "src/Header.vue": headerAnon },
          expected: { kind: "stale", message: "游客。铭牌相同，身份不同。" },
          lesson: "钥匙是引用。",
        },
        {
          id: "other",
          prompt: "如果 inject(ThemeKey)？",
          files: {
            "src/App.vue": appShared,
            "src/Header.vue": headerWrongKey,
            "src/keys.ts": keysBoth,
          },
          expected: { kind: "stale", message: "游客。拿错了那一份导出。" },
          lesson: "文件里可以有很多把钥匙。你要拿对的那把。",
        },
      ],
      explanation: {
        headline: "三种对不上",
        body: "拼写、两次现场 new、拿错导出。InjectionKey 让后两件在编译期也红。脸都是游客。",
      },
      tryThis: "三种消融都是游客。对上号再恢复，换人必须仍能到 Lin。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先拼写，再匿名 Symbol，再拿错导出。一次比一次更像「我有钥匙」。" },
      ],
    },
    {
      id: "injectkey-s7",
      tick: "S7",
      title: "换：皮肤",
      goal: "theme 用字符串钥匙。Box 写成 'thme'。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "provide('theme')，inject('thme')。卡片会？",
        choices: [
          { id: "mocha", label: "mocha。差一个字母没关系", correct: false, why: "和 user / usr 同一张图。" },
          { id: "none", label: "（没有）。钥匙对不上", correct: true, why: "默认值上场。换皮肤按钮也推不动这张脸。" },
          { id: "err", label: "报错", correct: false, why: "静默默认值。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore, "src/Box.vue": boxTypo },
        blocks: [{ id: "theme", label: "换场景：皮肤" }],
        narration: "用户换成皮肤。问的仍是：两处手写够不够当契约。",
      },
      observe: {
        state: [{ id: "t", label: "theme", value: "mocha（树上）" }],
        dom: [{ id: "card", label: ".card", value: "（没有）" }],
        events: [],
      },
      nodes: [
        { id: "key", kind: "script", label: "'thme'" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "key", to: "dom" }],
      ablations: [
        {
          id: "fix",
          prompt: "改成同一份 ThemeKey 之后？",
          files: {
            "src/App.vue": transferApp,
            "src/Box.vue": transferBox,
            "src/keys.ts": themeKey,
          },
          expected: {
            kind: "stale",
            message: "这是修复：mocha，换皮肤能到 latte。钥匙是一份导出。",
          },
          lesson: "World 8 收束：进来的值、出去的票、树上的钥匙，都要说出形状。",
        },
      ],
      explanation: {
        headline: "类型是已经见过的那些脸的契约",
        body: "33、01、游客。你都见过了。defineProps、defineEmits、InjectionKey 不发明新运行时。它们让下一处写错时，IDE 先红。",
      },
      faqs: [
        { q: "还要不要学 tsconfig？", a: "要，但不在这一课。strict 打开，这些红线才在。预览里你用脸核对。" },
        { q: "还有下一世界吗？", a: "机制从按钮走到了类型。工程化（构建配置、monorepo）不再改这张图。" },
      ],
      tryThis: "先看见（没有）。再打开钥匙版：必须是 mocha，换皮肤必须动。",
      mapping: [
        { code: "inject('thme')", runtime: "对不上", ui: "（没有）" },
        { code: "ThemeKey 一份导出", runtime: "同一引用", ui: "mocha → latte" },
      ],
    },
  ],
};
