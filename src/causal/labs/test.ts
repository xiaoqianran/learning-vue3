import type { CausalLab } from "../types";

const inline = `<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, title: '买牛奶', done: true },
])
const title = ref('')

function add() {
  const t = title.value.trim()
  if (!t) return
  items.value = items.value.concat({
    id: items.value.length + 1,
    title: t,
    done: false,
  })
  title.value = ''
}
</script>

<template>
  <form @submit.prevent="add">
    <input v-model="title" placeholder="新待办" />
    <button>添加</button>
  </form>
  <ul>
    <li v-for="t in items" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const itemsOk = `export function addItem(list, title) {
  const t = String(title).trim()
  if (!t) return list
  return list.concat({
    id: list.length + 1,
    title: t,
    done: false,
  })
}
`;

const appExtracted = `<script setup>
import { ref } from 'vue'
import { addItem } from './items.js'

const items = ref([
  { id: 1, title: '买牛奶', done: true },
])
const title = ref('')

function add() {
  items.value = addItem(items.value, title.value)
  if (title.value.trim()) title.value = ''
}
</script>

<template>
  <form @submit.prevent="add">
    <input v-model="title" placeholder="新待办" />
    <button>添加</button>
  </form>
  <ul>
    <li v-for="t in items" :key="t.id">{{ t.title }}</li>
  </ul>
</template>
`;

const specBlock = `
const specs = computed(() => [
  {
    name: '空标题不添加',
    pass: addItem([], '  ').length === 0,
  },
  {
    name: '有字会添加一条，标题保留',
    pass:
      addItem([], '学测试').length === 1 &&
      addItem([], '学测试')[0].title === '学测试',
  },
])
`;

const appSpecs = `<script setup>
import { ref, computed } from 'vue'
import { addItem } from './items.js'

const items = ref([
  { id: 1, title: '买牛奶', done: true },
])
const title = ref('')

function add() {
  items.value = addItem(items.value, title.value)
  if (title.value.trim()) title.value = ''
}
${specBlock}
</script>

<template>
  <form @submit.prevent="add">
    <input v-model="title" placeholder="新待办" />
    <button>添加</button>
  </form>
  <ul>
    <li v-for="t in items" :key="t.id">{{ t.title }}</li>
  </ul>
  <ul class="specs">
    <li v-for="s in specs" :key="s.name" :class="s.pass ? 'pass' : 'fail'">
      {{ s.pass ? '✓' : '✗' }} {{ s.name }}
    </li>
  </ul>
</template>
`;

const itemsEmptyAllowed = `export function addItem(list, title) {
  return list.concat({
    id: list.length + 1,
    title: String(title),
    done: false,
  })
}
`;

const specAlwaysTrue = `
const specs = computed(() => [
  { name: '空标题不添加', pass: true },
  { name: '有字会添加一条，标题保留', pass: true },
])
`;

const appLie = `<script setup>
import { ref, computed } from 'vue'
import { addItem } from './items.js'

const items = ref([
  { id: 1, title: '买牛奶', done: true },
])
const title = ref('')

function add() {
  items.value = addItem(items.value, title.value)
  if (title.value.trim()) title.value = ''
}
${specAlwaysTrue}
</script>

<template>
  <form @submit.prevent="add">
    <input v-model="title" placeholder="新待办" />
    <button>添加</button>
  </form>
  <ul>
    <li v-for="t in items" :key="t.id">{{ t.title }}</li>
  </ul>
  <ul class="specs">
    <li v-for="s in specs" :key="s.name" :class="s.pass ? 'pass' : 'fail'">
      {{ s.pass ? '✓' : '✗' }} {{ s.name }}
    </li>
  </ul>
</template>
`;

const specIdFormula = `
const specs = computed(() => [
  {
    name: '空标题不添加',
    pass: addItem([], '  ').length === 0,
  },
  {
    name: '新项 id 必须是 length+1',
    pass: addItem([{ id: 7, title: '旧', done: false }], '新')[1].id === 2,
  },
])
`;

const appSpecId = `<script setup>
import { ref, computed } from 'vue'
import { addItem } from './items.js'

const items = ref([
  { id: 1, title: '买牛奶', done: true },
])
const title = ref('')

function add() {
  items.value = addItem(items.value, title.value)
  if (title.value.trim()) title.value = ''
}
${specIdFormula}
</script>

<template>
  <form @submit.prevent="add">
    <input v-model="title" placeholder="新待办" />
    <button>添加</button>
  </form>
  <ul>
    <li v-for="t in items" :key="t.id">{{ t.title }}</li>
  </ul>
  <ul class="specs">
    <li v-for="s in specs" :key="s.name" :class="s.pass ? 'pass' : 'fail'">
      {{ s.pass ? '✓' : '✗' }} {{ s.name }}
    </li>
  </ul>
</template>
`;

const itemsMaxId = `export function addItem(list, title) {
  const t = String(title).trim()
  if (!t) return list
  const max = list.reduce((m, x) => Math.max(m, x.id), 0)
  return list.concat({
    id: max + 1,
    title: t,
    done: false,
  })
}
`;

const transferBefore = `<script setup>
import { ref } from 'vue'

const liked = ref(false)

function toggle() {
  liked.value = !liked.value
}
</script>

<template>
  <button @click="toggle">{{ liked ? '已喜欢' : '喜欢' }}</button>
</template>
`;

const likeFn = `export function nextLiked(liked) {
  return !liked
}
`;

const transferAfter = `<script setup>
import { ref, computed } from 'vue'
import { nextLiked } from './like.js'

const liked = ref(false)

function toggle() {
  liked.value = nextLiked(liked.value)
}

const specs = computed(() => [
  { name: 'false → true', pass: nextLiked(false) === true },
  { name: 'true → false', pass: nextLiked(true) === false },
])
</script>

<template>
  <button @click="toggle">{{ liked ? '已喜欢' : '喜欢' }}</button>
  <ul class="specs">
    <li v-for="s in specs" :key="s.name" :class="s.pass ? 'pass' : 'fail'">
      {{ s.pass ? '✓' : '✗' }} {{ s.name }}
    </li>
  </ul>
</template>
`;

export const TEST_LAB: CausalLab = {
  id: "test",
  world: 6,
  concept: "testing",
  title: "断言是另一双眼睛",
  subtitle: "测试不是另一套 Vue。它是对纯函数的订阅：绿是契约还在，红是边断了。",
  promise:
    "一镜一条边：先抽出 addItem，再挂上两条断言，再让实现放空标题（测试红、开心路径仍绿），再把断言改成永远 true，再断言内部 id 公式（重构就误报）。",
  minutes: 16,
  official: "/guide/scaling-up/testing.html",
  scenes: [
    {
      id: "test-s0",
      tick: "S0",
      title: "能添加，没有眼睛",
      goal: "表单能加待办。空标题会被拦。没有断言。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": inline },
        blocks: [{ id: "ui", label: "① 只有 UI" }],
        narration: "你不输入空标题，就看不见那条保护。下一镜先把函数搬出去——页面可以不变。",
      },
      observe: {
        state: [{ id: "items", label: "items", value: "1", symbol: "items" }],
        dom: [{ id: "list", label: "ul", value: "买牛奶" }],
        events: [],
      },
      nodes: [
        { id: "items", kind: "ref", label: "items", symbol: "items" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "items", to: "dom" }],
      explanation: {
        headline: "开心路径会撒谎",
        body: "你输入「学测试」，列表变长，像是对的。空标题那条边，只有你故意去踩才会露馅。断言要替你去踩。",
      },
      tryThis: "添加「学测试」。列表应变长。还不要提交空的——这一镜没有红绿眼睛。",
      faqs: [
        { q: "为什么不在这里跑 Vitest？", a: "预览里没有测试运行器。我们用同一份纯函数，把断言画成绿/红。机制和 Vitest 相同：给输入，看输出。" },
        { q: "组件测试呢？", a: "Vue Test Utils 去 mount、点按钮、看 DOM。那是后一步。先保证规则本身可调用、可断言。" },
      ],
    },
    {
      id: "test-s1",
      tick: "S1",
      title: "规则搬出去",
      goal: "addItem 成为普通函数。App 调用它。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "把添加规则搬到 items.js。页面会？",
        choices: [
          { id: "same", label: "看起来一样。只是搬家", correct: true, why: "UI 仍调用同一份规则。抽出来是为了能不经过按钮就调用它。" },
          { id: "break", label: "空标题保护会丢，因为离开了组件", correct: false, why: "trim 还在函数里。搬家不是删逻辑。" },
          { id: "err", label: "报错：不能在 js 里碰列表", correct: false, why: "它甚至不碰 ref。输入数组，输出新数组。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appExtracted, "src/items.js": itemsOk },
        blocks: [{ id: "extract", label: "② addItem() 纯函数" }],
        narration: "规则离开了按钮。它现在可以被另一双眼睛调用，不必经过输入框。",
      },
      observe: {
        state: [{ id: "fn", label: "addItem", value: "可单独调用", symbol: "addItem" }],
        dom: [{ id: "list", label: "ul", value: "仍是一项" }],
        events: [],
      },
      nodes: [
        { id: "fn", kind: "script", label: "addItem", symbol: "addItem" },
        { id: "app", kind: "component", label: "App" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "fn", to: "app", label: "调用" },
        { from: "app", to: "dom" },
      ],
      explanation: {
        headline: "可测，是因为可调用",
        body: "困在 @click 里的规则，只能用手指测。纯函数接受列表和标题，返回新列表。测试不过是另一次调用。",
      },
      faqs: [
        { q: "为什么返回新数组，不 push？", a: "输入输出清楚，断言才好写。原地改也能测，但你得先准备可变的一份，还要小心测到了共享引用。" },
        { q: "composable 也能测吗？", a: "可以。useXxx() 返回的 ref / 函数就是输入输出。先测函数，再测「点了按钮 DOM 变了」。" },
      ],
      tryThis: "确认列表仍是「买牛奶」。打开 items.js：trim 和 concat 都在函数里。",
      mapping: [{ code: "addItem(list, title)", runtime: "纯函数", ui: "App 仍能添加" }],
    },
    {
      id: "test-s2",
      tick: "S2",
      title: "挂上两只眼睛",
      goal: "specs 调用 addItem。空标题、有字各一条。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "页面上多出两条断言，都不经过输入框。首次渲染会？",
        choices: [
          { id: "green", label: "两条都绿。函数现在是对的", correct: true, why: "断言在 setup 时就调用 addItem。和按钮无关。" },
          { id: "wait", label: "要先点添加才会变绿", correct: false, why: "那就把测试又绑回了 UI。纯函数随时可调用。" },
          { id: "red", label: "红，因为列表里已有买牛奶", correct: false, why: "断言用的是 []，不是页面上那一份。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appSpecs, "src/items.js": itemsOk },
        blocks: [{ id: "spec", label: "③ specs 调用 addItem" }],
        narration: "两双眼睛：按钮看开心路径；断言去踩空标题。",
      },
      observe: {
        state: [{ id: "specs", label: "specs", value: "2 绿", symbol: "specs" }],
        dom: [{ id: "specs", label: ".specs", value: "✓ ✓" }],
        events: [],
      },
      nodes: [
        { id: "fn", kind: "script", label: "addItem", symbol: "addItem" },
        { id: "specs", kind: "computed", label: "specs", symbol: "specs" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "fn", to: "specs", label: "断言" },
        { from: "specs", to: "dom", label: "绿" },
      ],
      explanation: {
        headline: "断言是另一份订阅",
        body: "UI 订阅 addItem 的某一次调用。specs 订阅另两次：空字符串、有字。函数一变，两双眼睛都可以红。",
      },
      faqs: [
        { q: "这就是单元测试吗？", a: "是同一件事。Vitest 里是 expect(addItem([], '  ')).toEqual([])。这里把 pass 画成绿色。差别是运行器，不是因果。" },
        { q: "为什么用 computed？", a: "items.js 一改，specs 重算。和 total 跟着 quantity 走同一张图：派生。" },
      ],
      tryThis: "看两条都必须是绿。再添加「学测试」确认列表仍工作。还不要提交空的——下一镜会让空标题溜进去。",
      mapping: [
        { code: "addItem([], '  ')", runtime: "length === 0", ui: "✓ 空标题不添加" },
        { code: "addItem([], '学测试')", runtime: "一条，标题保留", ui: "✓" },
      ],
    },
    {
      id: "test-s3",
      tick: "S3",
      title: "实现放进空标题",
      goal: "addItem 不再 trim、不再拒绝空。UI 的开心路径仍能加。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "删掉空标题保护。不碰 specs。页面会？",
        choices: [
          { id: "both", label: "列表和断言一起坏", correct: false, why: "你若不提交空的，列表看起来仍对。断言已经替你提交了空的。" },
          { id: "red", label: "列表看起来还对，空标题那条变红", correct: true, why: "这就是测试存在的理由：失败不必经过你的手指。" },
          { id: "green", label: "仍全绿，因为断言读的是旧函数", correct: false, why: "同一份 import。函数改了，断言立刻重算。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appSpecs, "src/items.js": itemsEmptyAllowed },
        blocks: [{ id: "bug", label: "④ addItem 不再拒绝空" }],
        narration: "只改规则。眼睛没改。开心路径可以继续装对。",
      },
      observe: {
        state: [{ id: "specs", label: "specs", value: "空标题那条红", symbol: "specs" }],
        dom: [
          { id: "list", label: "ul", value: "仍是买牛奶" },
          { id: "fail", label: ".fail", value: "✗ 空标题不添加" },
        ],
        events: [],
      },
      nodes: [
        { id: "fn", kind: "script", label: "addItem", detail: "接受空" },
        { id: "specs", kind: "computed", label: "specs" },
        { id: "ui", kind: "dom", label: "列表", detail: "看起来对" },
      ],
      edges: [
        { from: "fn", to: "specs", label: "红" },
        { from: "fn", to: "ui", label: "未踩到" },
      ],
      why: {
        question: "为什么列表还是一项，测试却红了？",
        choices: [
          { id: "eyes", label: "断言自己调用了空标题。UI 没调用", correct: true, why: "两双眼睛，两次调用。红的那次你没在界面上做。" },
          { id: "import", label: "items.js 改了但 App 还缓存着旧函数", correct: false, why: "没有这种缓存。UI 和断言用的是同一份。" },
          { id: "trim", label: "输入框的 trim 在 App 里，所以 UI 仍安全", correct: false, why: "这一版 App 把原始 title 交给 addItem。空保护已经不在了。你只是还没点。" },
        ],
      },
      explanation: {
        headline: "红，是因为眼睛去踩了",
        body: "bug 可以躲在你没点过的路径里。断言的工作就是自动去走那些路径。绿不是「页面好看」，是「契约还在」。",
      },
      faqs: [
        { q: "我提交一个空格试试？", a: "列表会多出一项空白。那是 UI 终于踩到断言已经踩过的坑。先看红，再决定要不要用手指证实。" },
        { q: "有字那条为什么可能还绿？", a: "那条只问「学测试」能不能加上。实现仍能加有字的。一边红一边绿，正好指出断的是哪一条边。" },
      ],
      tryThis: "先看「空标题不添加」必须是红。列表仍是买牛奶。再故意添加空格，空白项会出现。",
      mapping: [{ code: "addItem 不再拒绝空", runtime: "空标题断言失败", ui: "开心路径仍可装对" }],
    },
    {
      id: "test-s4",
      tick: "S4",
      title: "把眼睛挖掉",
      goal: "实现仍接受空标题。断言改成 pass: true。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "两条断言都写成 pass: true。实现仍接受空。会？",
        choices: [
          { id: "green", label: "全绿。测试不再能抓住空标题", correct: true, why: "眼睛被挖掉了。绿变成了装饰。" },
          { id: "red", label: "仍红，因为函数还是坏的", correct: false, why: "断言不再调用函数。函数坏不坏，眼睛看不见。" },
          { id: "err", label: "报错：pass 必须是表达式", correct: false, why: "合法。这是最危险的绿。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appLie, "src/items.js": itemsEmptyAllowed },
        blocks: [{ id: "lie", label: "⑤ pass: true" }],
        narration: "修的是报告，不是规则。绿回来了，边还断着。",
      },
      observe: {
        state: [{ id: "specs", label: "specs", value: "假绿", symbol: "specs" }],
        dom: [{ id: "specs", label: ".specs", value: "✓ ✓ 撒谎" }],
        events: [],
      },
      nodes: [
        { id: "fn", kind: "script", label: "addItem", detail: "仍接受空" },
        { id: "specs", kind: "computed", label: "specs", detail: "pass: true" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "specs", to: "dom", label: "假绿" }],
      explanation: {
        headline: "绿必须经过函数",
        body: "断言不调用 addItem，就不再订阅那条边。改测试让它通过，和删掉测试是同一类失败——只是看起来更体面。",
      },
      faqs: [
        { q: "toEqual 写成 toBeTruthy 算挖眼睛吗？", a: "如果你不再检查真正在乎的那件事，算。断言要锁住行为，不是锁住「有一个值」。" },
        { q: ".skip 和 pass: true 呢？", a: "skip 至少承认没看。永远 true 是假装看过。" },
      ],
      tryThis: "两条都必须绿。再添加空格：空白项仍会进去。绿和正确不是同一张脸。",
      mapping: [{ code: "pass: true", runtime: "不再调用 addItem", ui: "假绿" }],
    },
    {
      id: "test-s5",
      tick: "S5",
      title: "断言内部公式",
      goal: "实现是对的。第二条断言要求 id === length+1。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "现有列表 id 是 7。addItem 用 length+1 得到 id 2。断言要求 id===2。若改成「max(id)+1」（结果是 8），行为仍对。测试会？",
        choices: [
          { id: "red", label: "红。它锁的是公式，不是「能加进去」", correct: true, why: "重构换了身份证发号，行为（有一条新待办、空的仍拒绝）没坏。测试误报。" },
          { id: "green", label: "仍绿，因为还是添加成功", correct: false, why: "断言没问成功。它问 id 是不是 2。" },
          { id: "both", label: "两条都红", correct: false, why: "空标题那条仍绿。红的是发号公式。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appSpecId, "src/items.js": itemsOk },
        blocks: [{ id: "id", label: "⑥ 断言 id === length+1" }],
        narration: "先看现在：length+1，断言绿。下一拍会换成 max+1——行为对，这条会红。",
      },
      ablations: [
        {
          id: "max",
          prompt: "id 改成 max+1 之后？",
          files: { "src/App.vue": appSpecId, "src/items.js": itemsMaxId },
          expected: {
            kind: "stale",
            message: "空标题仍绿。id 那条变红。列表添加仍正确。测试锁错了东西。",
          },
          lesson: "测「能不能加、空的拒不拒绝」。不要测今天碰巧的发号公式。",
        },
      ],
      observe: {
        state: [{ id: "specs", label: "specs", value: "公式绿" }],
        dom: [{ id: "specs", label: ".specs", value: "锁着 length+1" }],
        events: [],
      },
      nodes: [
        { id: "fn", kind: "script", label: "addItem" },
        { id: "specs", kind: "computed", label: "id 公式" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "fn", to: "specs", label: "锁内部" }],
      why: {
        question: "什么样的断言重构时不该红？",
        choices: [
          { id: "beh", label: "锁行为：拒绝空、标题保留、会多一条", correct: true, why: "发号从 length+1 换成 max+1，这些仍然成立。" },
          { id: "id", label: "锁 id 必须是 length+1，这样才严格", correct: false, why: "严格锁错了地方。重构被惩罚，用户没得到保护。" },
          { id: "dom", label: "必须锁 DOM 结构，函数测了也不算", correct: false, why: "纯函数的行为测试最便宜。DOM 测试留给真正的交互。" },
        ],
      },
      explanation: {
        headline: "锁行为，别锁今天的实现",
        body: "length+1 和 max+1 对用户是同一件事：新行有一个不重复的 id。断言若问公式，重构就会被冤枉。问「空的进不去、有字的标题还在」，才是那条边。",
      },
      faqs: [
        { q: "永远不能测 id 吗？", a: "可以测「是新的、不重复」。不要测「必须等于 length+1」。差别是行为 vs 公式。" },
        { q: "快照测试呢？", a: "整段 HTML 一变就红。适合真的在乎标记。不适合锁一份碰巧的内部形状。" },
      ],
      tryThis: "先看两条绿。再打开「id 改成 max+1」：空标题仍绿，公式那条红，列表仍能加。",
      mapping: [
        { code: "id === list.length + 1", runtime: "锁公式", ui: "重构误报" },
        { code: "空拒绝 / 标题保留", runtime: "锁行为", ui: "重构仍绿" },
      ],
    },
    {
      id: "test-s6",
      tick: "S6",
      title: "拆掉函数 / 挖眼 / 锁公式",
      goal: "三种坏法：测不到、假装绿、锁错东西。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "如果添加逻辑写回 @click 里、不再有 addItem。断言会？",
        choices: [
          { id: "ui", label: "仍能测，因为页面还能添加", correct: false, why: "断言调用的是 addItem。函数不在，眼睛没东西可看。更糟的是规则又困回按钮。" },
          { id: "gone", label: "眼睛失去对象。规则只能用手指测", correct: true, why: "可测性来自可调用。缩回模板，断言先挂，然后你失去空标题那双眼睛。" },
          { id: "auto", label: "Vue 会从模板抽出函数给测试", correct: false, why: "没有这种魔法。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appSpecs, "src/items.js": itemsOk },
        blocks: [{ id: "keep", label: "正确版本先留着" }],
        narration: "先确认两条绿、空格添加不进去。再分别：缩回内联、pass: true、锁 id 公式。",
      },
      observe: {
        state: [{ id: "ok", label: "specs", value: "行为绿" }],
        dom: [{ id: "specs", label: ".specs", value: "✓ ✓" }],
        events: [],
      },
      nodes: [
        { id: "fn", kind: "script", label: "addItem" },
        { id: "specs", kind: "computed", label: "specs" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "fn", to: "specs" },
        { from: "specs", to: "dom" },
      ],
      ablations: [
        {
          id: "inline",
          prompt: "如果规则缩回按钮里？",
          files: { "src/App.vue": inline },
          expected: {
            kind: "stale",
            message: "断言消失。空标题只能再用手指踩。",
          },
          lesson: "可测性是可调用。困回 @click，眼睛就没了。",
        },
        {
          id: "lie",
          prompt: "如果 pass: true？",
          files: { "src/App.vue": appLie, "src/items.js": itemsEmptyAllowed },
          expected: {
            kind: "stale",
            message: "假绿。空标题仍进得去。",
          },
          lesson: "绿必须经过函数。",
        },
        {
          id: "formula",
          prompt: "如果断言锁 id 公式，实现改 max+1？",
          files: { "src/App.vue": appSpecId, "src/items.js": itemsMaxId },
          expected: {
            kind: "stale",
            message: "行为对，公式红。冤枉了一次重构。",
          },
          lesson: "锁行为，别锁今天的发号。",
        },
      ],
      explanation: {
        headline: "三种假测试",
        body: "测不到、假装绿、锁错边。真测试是：规则可调用，断言走行为，失败时指出那一条契约。",
      },
      tryThis: "三种消融分开看。没眼睛、假绿、误报，对上号再恢复。",
      faqs: [
        { q: "Vitest 里对应什么？", a: "缩回按钮 ≈ 没法 import。pass: true ≈ expect(true)。锁公式 ≈ 断言私有字段。三种都是真项目里的坏测试。" },
      ],
    },
    {
      id: "test-s7",
      tick: "S7",
      title: "换：喜欢切换",
      goal: "toggle 困在按钮里。指出该抽出什么、断言什么。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "喜欢按钮要测「能切换」。最该抽出并断言的是？",
        choices: [
          { id: "fn", label: "nextLiked(false)===true 和反过来", correct: true, why: "纯函数，两次调用，不经过 DOM。和 addItem 同一张图。" },
          { id: "btn", label: "只能测按钮文案，不能抽函数", correct: false, why: "文案测试更贵。规则本身是 !liked。" },
          { id: "true", label: "expect(true)，先让它绿", correct: false, why: "S4 已经拆过。绿必须经过函数。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "like", label: "换场景：喜欢" }],
        narration: "待办换成喜欢。先是内联 toggling。判断该抽出什么。",
      },
      observe: {
        state: [{ id: "liked", label: "liked", value: "false", symbol: "liked" }],
        dom: [{ id: "btn", label: "button", value: "喜欢" }],
        events: [],
      },
      nodes: [
        { id: "liked", kind: "ref", label: "liked", symbol: "liked" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "liked", to: "dom" }],
      ablations: [
        {
          id: "extract",
          prompt: "抽出 nextLiked 并挂上断言之后？",
          files: { "src/App.vue": transferAfter, "src/like.js": likeFn },
          expected: {
            kind: "stale",
            message: "这是修复：按钮仍能切，两条断言绿。规则可调用。",
          },
          lesson: "World 6 收束：问早了会读到旧 DOM；渲染扔了要有网；行为要有另一双不经过手指的眼睛。",
        },
      ],
      explanation: {
        headline: "会判断测什么，才算会测",
        body: "addItem 和 nextLiked 是同一张图：抽出规则，断言行为。World 7 才会问打包、SSR、上线。机制已经可以迁移。",
      },
      faqs: [
        { q: "组件还要不要测？", a: "要。那是「点按钮，文案变成已喜欢」。更贵，也更接近用户。先保住便宜的纯函数。" },
        { q: "E2E 呢？", a: "Playwright 走真实浏览器。更贵。用来锁关键路径，不是用来代替 addItem 这种断言。" },
      ],
      tryThis: "先点按钮确认能切。再打开抽出版：两条断言应绿，按钮仍能切。",
      mapping: [
        { code: "liked = !liked 困在 click", runtime: "只能用手指", ui: "能切，测不到" },
        { code: "nextLiked(false) === true", runtime: "纯函数断言", ui: "✓ 与按钮无关" },
      ],
    },
  ],
};
