import type { CausalLab, CounterfactualWorld } from "../types";

const vClean = `const vClickout = {
  mounted(el, binding) {
    const onDoc = (e) => {
      if (el.contains(e.target)) return
      binding.value()
    }
    setTimeout(() => document.addEventListener('click', onDoc))
    el._onDoc = onDoc
  },
  unmounted(el) {
    document.removeEventListener('click', el._onDoc)
  },
}
`;

const vLeak = `const vClickout = {
  mounted(el, binding) {
    const onDoc = (e) => {
      if (el.contains(e.target)) return
      binding.value()
    }
    setTimeout(() => document.addEventListener('click', onDoc))
    el._onDoc = onDoc
  },
}
`;

const always = `<script setup>
import { ref } from 'vue'
${vClean}
const n = ref(0)
</script>
<template>
  <p class="card">窗外 {{ n }}</p>
  <p class="hint">点卡片算窗外，点面板不算</p>
  <div class="panel" v-clickout="() => n++">
    <h3>面板</h3>
    <p>点我内部，次数不应加</p>
  </div>
</template>
`;

const toggleClean = `<script setup>
import { ref } from 'vue'
${vClean}
const show = ref(true)
const n = ref(0)
</script>
<template>
  <p class="card">窗外 {{ n }}</p>
  <button @click="show = !show">{{ show ? '卸掉面板' : '装上面板' }}</button>
  <div v-if="show" class="panel" v-clickout="() => n++">
    <h3>面板</h3>
    <p>点我内部不算窗外</p>
  </div>
</template>
`;

const toggleLeak = `<script setup>
import { ref } from 'vue'
${vLeak}
const show = ref(true)
const n = ref(0)
</script>
<template>
  <p class="card">窗外 {{ n }}</p>
  <button @click="show = !show">{{ show ? '卸掉面板' : '装上面板' }}</button>
  <div v-if="show" class="panel" v-clickout="() => n++">
    <h3>面板</h3>
    <p>点我内部不算窗外</p>
  </div>
</template>
`;

const staleHandler = `<script setup>
import { ref } from 'vue'
const n = ref(0)
const step = ref(1)
function makeBump(s) {
  return () => { n.value += s }
}
const vClickout = {
  mounted(el, binding) {
    const fn = binding.value
    const onDoc = (e) => {
      if (el.contains(e.target)) return
      fn()
    }
    setTimeout(() => document.addEventListener('click', onDoc))
    el._onDoc = onDoc
  },
  unmounted(el) {
    document.removeEventListener('click', el._onDoc)
  },
}
</script>
<template>
  <p class="card">窗外 {{ n }} · 步长 {{ step }}</p>
  <button @click="step = 10">步长改成 10</button>
  <div class="panel" v-clickout="makeBump(step)">
    <h3>面板</h3>
    <p>点窗外应按当前步长加</p>
  </div>
</template>
`;

const freshHandler = `<script setup>
import { ref } from 'vue'
const n = ref(0)
const step = ref(1)
function makeBump(s) {
  return () => { n.value += s }
}
const vClickout = {
  mounted(el, binding) {
    const fn = binding.value
    const onDoc = (e) => {
      if (el.contains(e.target)) return
      fn()
    }
    setTimeout(() => document.addEventListener('click', onDoc))
    el._onDoc = onDoc
  },
  updated(el, binding) {
    document.removeEventListener('click', el._onDoc)
    const fn = binding.value
    const onDoc = (e) => {
      if (el.contains(e.target)) return
      fn()
    }
    document.addEventListener('click', onDoc)
    el._onDoc = onDoc
  },
  unmounted(el) {
    document.removeEventListener('click', el._onDoc)
  },
}
</script>
<template>
  <p class="card">窗外 {{ n }} · 步长 {{ step }}</p>
  <button @click="step = 10">步长改成 10</button>
  <div class="panel" v-clickout="makeBump(step)">
    <h3>面板</h3>
    <p>点窗外应按当前步长加</p>
  </div>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const open = ref(true)
const vClickout = {
  mounted(el, binding) {
    const onDoc = (e) => {
      if (el.contains(e.target)) return
      binding.value()
    }
    setTimeout(() => document.addEventListener('click', onDoc))
  },
}
function close() { open.value = false }
</script>
<template>
  <p class="card">菜单 {{ open ? '开着' : '关着' }}</p>
  <div v-if="open" class="panel" v-clickout="close">
    <h3>菜单</h3>
    <p>点外面应关闭</p>
  </div>
  <p class="hint">关掉之后再点空白处，看卡片会不会自己跳</p>
</template>
`;

const transferFixed = `<script setup>
import { ref } from 'vue'
const open = ref(true)
const vClickout = {
  mounted(el, binding) {
    const onDoc = (e) => {
      if (el.contains(e.target)) return
      binding.value()
    }
    setTimeout(() => document.addEventListener('click', onDoc))
    el._onDoc = onDoc
  },
  unmounted(el) {
    document.removeEventListener('click', el._onDoc)
  },
}
function close() { open.value = false }
</script>
<template>
  <p class="card">菜单 {{ open ? '开着' : '关着' }}</p>
  <div v-if="open" class="panel" v-clickout="close">
    <h3>菜单</h3>
    <p>点外面应关闭</p>
  </div>
  <p class="hint">关掉之后再点空白处，卡片应保持关着</p>
</template>
`;

const worldClean: CounterfactualWorld = {
  id: "clean",
  name: "卸掉时摘监听",
  tagline: "unmounted 里 removeEventListener",
  files: { "src/App.vue": toggleClean },
  nodes: [
    { id: "off", kind: "effect", label: "unmounted" },
    { id: "doc", kind: "event", label: "document click" },
  ],
  edges: [{ from: "off", to: "doc", label: "摘掉" }],
  note: "面板没了，监听也没了。再点空白，次数不再加。",
};

const worldLeak: CounterfactualWorld = {
  id: "leak",
  name: "节点没了，监听还在",
  tagline: "没有 unmounted",
  files: { "src/App.vue": toggleLeak },
  nodes: [
    { id: "ghost", kind: "event", label: "幽灵监听" },
    { id: "n", kind: "ref", label: "n 还在加" },
  ],
  edges: [{ from: "ghost", to: "n" }],
  note: "v-if 卸掉了面板。document 上的 click 还在喊那份旧回调。",
};

export const VCLICKOUT_LAB: CausalLab = {
  id: "vclickout",
  world: 12,
  concept: "directive cleanup",
  title: "节点卸掉，监听必须摘掉",
  subtitle: "指令可以在 document 上挂东西。unmounted 不摘，回调就成了幽灵。",
  promise:
    "一镜一条边：先点窗外会加、点面板不加，再卸掉后干净，再忘记 unmounted 变成幽灵，再回调把旧步长关上，再 updated 换新回调。",
  minutes: 16,
  official: "/guide/reusability/custom-directives.html#hook-arguments",
  scenes: [
    {
      id: "vclickout-s0",
      tick: "S0",
      title: "点窗外加一，点面板不加",
      goal: "v-clickout 在 document 上听 click。contains 则忽略。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": always },
        blocks: [{ id: "doc", label: "① document 监听" }],
        narration: "指令碰到的是面板这颗节点，监听却挂在 document 上。先分清里面和窗外。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "点卡片 +1" }],
        dom: [{ id: "card", label: ".card", value: "窗外 n" }],
        events: [{ id: "click", label: "click", value: "document" }],
      },
      nodes: [
        { id: "doc", kind: "event", label: "document" },
        { id: "el", kind: "dom", label: "面板" },
        { id: "n", kind: "ref", label: "n" },
      ],
      edges: [
        { from: "doc", to: "el", label: "contains?" },
        { from: "doc", to: "n", label: "窗外" },
      ],
      explanation: {
        headline: "监听可以挂在节点外面",
        body: "mounted 里 setTimeout 再 addEventListener，是为了躲开「刚刚点开」那一次冒泡。下一镜把面板用 v-if 卸掉。",
      },
      tryThis: "点面板内部，次数必须不动。点卡片「窗外 n」，必须 +1。",
      faqs: [
        { q: "为什么用 setTimeout？", a: "同一轮 click 可能先挂上监听再冒泡到 document，会立刻误触。推迟到下一宏任务再听。" },
      ],
    },
    {
      id: "vclickout-s1",
      tick: "S1",
      title: "卸掉之后，再点不再加",
      goal: "v-if 卸面板。unmounted 里 removeEventListener。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「卸掉面板」，再点空白处。次数会？",
        choices: [
          { id: "stay", label: "不再加。监听已经摘掉", correct: true, why: "节点卸掉时钩子跑 unmounted。" },
          { id: "add", label: "还在加。document 的监听是全局的", correct: false, why: "那是下一镜忘记摘掉的脸。" },
          { id: "err", label: "报错：节点没了还 contains", correct: false, why: "先摘掉就不会再进回调。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": toggleClean },
        blocks: [{ id: "off", label: "② unmounted 摘掉" }],
        narration: "寿命和 v-focus 的 v-if 一样。差别是：这回在 document 上留了东西。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "卸掉后冻住" }],
        dom: [{ id: "card", label: ".card", value: "不再增加" }],
        events: [],
      },
      nodes: [
        { id: "vif", kind: "script", label: "v-if false" },
        { id: "un", kind: "effect", label: "unmounted" },
        { id: "n", kind: "ref", label: "n" },
      ],
      edges: [
        { from: "vif", to: "un" },
        { from: "un", to: "n", label: "停手" },
      ],
      explanation: {
        headline: "谁挂上，谁摘掉",
        body: "下一镜删掉 unmounted。面板没了，点击还在加——幽灵。",
      },
      faqs: [
        { q: "beforeUnmount 行吗？", a: "行。那时候节点还在文档里。unmounted 时已经离开。摘监听两种都行。" },
      ],
      tryThis: "先点窗外一次确认会加。再卸掉面板，连点空白，次数必须冻住。",
      mapping: [{ code: "unmounted: removeEventListener", runtime: "摘掉", ui: "不再 +1" }],
    },
    {
      id: "vclickout-s2",
      tick: "S2",
      title: "忘记摘掉，变成幽灵",
      goal: "同一套开关。vClickout 没有 unmounted。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "卸掉面板后再点空白。次数会？",
        choices: [
          { id: "ghost", label: "还在加。回调还在 document 上", correct: true, why: "节点没了，监听还在。el.contains 对已卸节点仍能跑，点击必是「窗外」。" },
          { id: "stay", label: "不再加。v-if 会自动清监听", correct: false, why: "Vue 只卸节点。document 上的不是它挂的，它不管。" },
          { id: "err", label: "报错", correct: false, why: "常常不报错。这才可怕。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": toggleLeak },
        blocks: [{ id: "leak", label: "③ 没有 unmounted" }],
        narration: "按钮一行没改。只少了摘掉那一行。",
      },
      counterfactual: {
        id: "ghost-vs-clean",
        title: "幽灵 vs 摘掉",
        setup: "都卸掉面板。差在有没有 unmounted。",
        worlds: [worldClean, worldLeak],
        punchline: "指令可以在节点外面留东西。卸节点 ≠ 卸那些东西。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "幽灵还在加" }],
        dom: [{ id: "card", label: ".card", value: "面板没了，数字还跳" }],
        events: [{ id: "click", label: "click", value: "旧回调" }],
      },
      nodes: [
        { id: "ghost", kind: "event", label: "幽灵监听" },
        { id: "n", kind: "ref", label: "n" },
      ],
      edges: [{ from: "ghost", to: "n" }],
      why: {
        question: "和 keep-alive 里没清定时器，是同一张图吗？",
        choices: [
          { id: "same", label: "是。都是寿命结束时没收拾外面的东西", correct: true, why: "World 5 缓存的是实例。这一课卸掉的是节点。外面的订阅都要自己摘。" },
          { id: "diff", label: "不是。事件监听会随节点自动死", correct: false, why: "节点上的监听会。document 上的不会。" },
          { id: "vue", label: "Vue 3.5 会自动追踪 addEventListener", correct: false, why: "不会。" },
        ],
      },
      explanation: {
        headline: "幽灵加一，是漏掉的 unmounted",
        body: "下一镜不卸节点：回调关上了旧的 step。点「步长改成 10」之后，窗外仍按 1 加。",
      },
      faqs: [
        { q: "为什么要 el._onDoc？", a: "摘掉时必须是同一份函数引用。挂在节点上，unmounted 才能找到它。" },
      ],
      tryThis: "卸掉面板后点空白，次数必须继续加。打开反事实对比摘掉的世界。",
      mapping: [{ code: "没有 unmounted", runtime: "document 上仍有监听", ui: "幽灵 +1" }],
    },
    {
      id: "vclickout-s3",
      tick: "S3",
      title: "回调把旧步长关上了",
      goal: "v-clickout=\"() => n += step\"。mounted 时 step 是 1。没有 updated。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「步长改成 10」，再点窗外。n 会？",
        choices: [
          { id: "one", label: "+1。mounted 把第一次的 makeBump(1) 关上了", correct: true, why: "makeBump(step) 每次渲染都是新函数，关上当时的数字。指令只在 mounted 拿了第一份。" },
          { id: "ten", label: "+10。step 是 ref，回调总会读新值", correct: false, why: "关上的是数字 1，不是 ref。" },
          { id: "err", label: "报错", correct: false, why: "能跑。加错数。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": staleHandler },
        blocks: [{ id: "stale", label: "④ 旧回调" }],
        narration: "节点一直在。变的是你交给指令的那份函数。",
      },
      observe: {
        state: [
          { id: "s", label: "step", value: "10" },
          { id: "n", label: "n", value: "仍按 1 加" },
        ],
        dom: [{ id: "card", label: ".card", value: "步长 10，加的是 1" }],
        events: [],
      },
      nodes: [
        { id: "fn", kind: "script", label: "旧箭头函数" },
        { id: "n", kind: "ref", label: "n" },
      ],
      edges: [{ from: "fn", to: "n", label: "关上 step=1" }],
      explanation: {
        headline: "binding.value 也会过期",
        body: "和没有 updated 的绿框同一条缝。下一镜在 updated 里摘掉旧监听、换上新回调。",
      },
      faqs: [
        { q: "模板里为什么用 makeBump(step)？", a: "每次渲染交出一个关上当前数字的函数。指令如果只在 mounted 拿一次，就会一直加 1。" },
      ],
      tryThis: "先点窗外确认 +1。再改步长为 10，再点窗外，必须仍 +1，卡片写着步长 10。",
      mapping: [{ code: "makeBump(step) 只在 mounted 拿一次", runtime: "关上数字 1", ui: "加 1 不是 10" }],
    },
    {
      id: "vclickout-s4",
      tick: "S4",
      title: "updated 换上新回调",
      goal: "updated 里先摘掉再按新的 binding.value 挂上。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "再点「步长改成 10」，然后点窗外。n 会？",
        choices: [
          { id: "ten", label: "+10。新函数读到新步长", correct: true, why: "updated 换了监听。新箭头函数关上 step=10。" },
          { id: "one", label: "仍 +1。document 监听换不了", correct: false, why: "能换。先 remove 再 add。" },
          { id: "eleven", label: "+11。新旧监听叠在一起", correct: false, why: "先摘掉旧的，所以不会叠。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": freshHandler },
        blocks: [{ id: "upd", label: "⑤ updated 换回调" }],
        narration: "和涂色那一课一样：值变了要再碰一次。这次碰的是监听。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "按 10 加" }],
        dom: [{ id: "card", label: ".card", value: "步长 10，加 10" }],
        events: [],
      },
      nodes: [
        { id: "upd", kind: "effect", label: "updated" },
        { id: "fn", kind: "script", label: "新回调" },
        { id: "n", kind: "ref", label: "n" },
      ],
      edges: [
        { from: "upd", to: "fn" },
        { from: "fn", to: "n" },
      ],
      explanation: {
        headline: "换回调之前先摘旧的",
        body: "不摘就叠：一次点击加两次。下一镜看叠监听的脸。",
      },
      faqs: [
        { q: "能不能在回调里读 binding.value()？", a: "如果 binding 是同一份可变对象，有时能。稳妥做法是 updated 换监听，或让回调只调一个永远稳定的函数。" },
      ],
      tryThis: "改步长为 10，点窗外，必须一次 +10。",
      mapping: [{ code: "updated 里换监听", runtime: "新 binding.value", ui: "+10" }],
    },
    {
      id: "vclickout-s5",
      tick: "S5",
      title: "updated 如果只加不摘",
      goal: "想象成每次 updated 又 addEventListener 一次。用泄漏版对照：卸掉后点两下。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "回到幽灵版。卸掉前先点窗外 1 次，卸掉后再点 1 次。次数大约？",
        choices: [
          { id: "two", label: "至少 2。卸掉后那一下仍在", correct: true, why: "确认幽灵还在。叠监听是同一类「没摘」。" },
          { id: "one", label: "只有 1。卸掉会停", correct: false, why: "这一镜没有 unmounted。" },
          { id: "zero", label: "变回 0。v-if 会重置", correct: false, why: "n 在父级，不会随面板卸掉清零。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": toggleLeak },
        blocks: [{ id: "stack", label: "⑥ 再看一遍幽灵" }],
        narration: "updated 只加不摘，会让一次点击加两次。幽灵是「卸了还不摘」。都是同一行 remove 的责任。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "卸掉后仍加" }],
        dom: [{ id: "card", label: ".card", value: "继续跳" }],
        events: [],
      },
      nodes: [
        { id: "add", kind: "effect", label: "addEventListener" },
        { id: "n", kind: "ref", label: "n" },
      ],
      edges: [{ from: "add", to: "n", label: "没摘" }],
      explanation: {
        headline: "漏摘只有一张脸：多出来的次数",
        body: "下一镜把三种漏法放在一起：卸了还在、旧步长、干净对照。",
      },
      faqs: [
        { q: "怎么发现叠监听？", a: "一次点击加了 2、4、8。翻倍就是叠了。这一课用卸掉后仍加，更好认。" },
      ],
      tryThis: "卸掉后再点空白，次数必须仍增加。记住这张脸，去消融里对比干净版。",
      mapping: [{ code: "只 add 不 remove", runtime: "监听还在", ui: "多出来的 +1" }],
    },
    {
      id: "vclickout-s6",
      tick: "S6",
      title: "拆成干净 / 幽灵 / 旧步长",
      goal: "三种对照：unmounted 摘掉、忘记摘、旧回调。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到会换步长的世界。改成 10 再点窗外会？",
        choices: [
          { id: "ten", label: "+10", correct: true, why: "先确认好的脸。" },
          { id: "one", label: "+1", correct: false, why: "那是旧回调。" },
          { id: "ghost", label: "卸掉后还加", correct: false, why: "那是幽灵。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": freshHandler },
        blocks: [{ id: "keep", label: "换回调的版本先留着" }],
        narration: "先改步长确认 +10。再分别：干净卸掉、幽灵、旧步长。",
      },
      observe: {
        state: [{ id: "ok", label: "n", value: "按新步长" }],
        dom: [{ id: "card", label: ".card", value: "+10" }],
        events: [],
      },
      nodes: [
        { id: "upd", kind: "effect", label: "updated + unmounted" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "upd", to: "dom" }],
      ablations: [
        {
          id: "clean",
          prompt: "如果卸掉时有 unmounted？",
          files: { "src/App.vue": toggleClean },
          expected: { kind: "stale", message: "这是干净：卸掉后再点，次数冻住。" },
          lesson: "谁挂上谁摘掉。",
        },
        {
          id: "leak",
          prompt: "如果忘记 unmounted？",
          files: { "src/App.vue": toggleLeak },
          expected: { kind: "stale", message: "幽灵：面板没了，次数还跳。" },
          lesson: "document 不管你的 v-if。",
        },
        {
          id: "stale",
          prompt: "如果回调不换？",
          files: { "src/App.vue": staleHandler },
          expected: { kind: "stale", message: "步长 10，加的仍是 1。" },
          lesson: "binding.value 也会过期。",
        },
      ],
      explanation: {
        headline: "挂在外面的，都要自己收",
        body: "World 12 收束：钩子碰到节点、参数换轨道、卸掉时摘掉外面的东西。能用组件就用组件；指令只留给 DOM 这一层。下一课：组件还没到。",
      },
      tryThis: "三种消融：冻住、幽灵加一、加 1 不是 10。对上号再恢复 +10。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先干净（对照），再幽灵（忘了摘），再旧步长（忘了换）。" },
      ],
    },
    {
      id: "vclickout-s7",
      tick: "S7",
      title: "换：下拉菜单",
      goal: "点窗外 close()。没有 unmounted。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "点窗外关掉菜单。再点空白处，卡片会？",
        choices: [
          { id: "stay", label: "保持关着。关了就没了", correct: false, why: "监听还在。close() 仍会跑。open 已经是 false，看起来像没事——去看你有没有漏。" },
          { id: "ghost", label: "看起来仍关着，但回调还在跑", correct: true, why: "open 已经是 false，再调 close 看不出数字。这张脸比计数更阴：静默泄漏。" },
          { id: "open", label: "会自己打开", correct: false, why: "close 不会打开。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "menu", label: "换场景：菜单" }],
        narration: "计数换成开关。幽灵不一定改画面——它只是没摘。用 hint 提醒你再点一次。",
      },
      observe: {
        state: [{ id: "o", label: "open", value: "false，监听还在" }],
        dom: [{ id: "card", label: ".card", value: "关着" }],
        events: [],
      },
      nodes: [
        { id: "ghost", kind: "event", label: "幽灵" },
        { id: "open", kind: "ref", label: "open" },
      ],
      edges: [{ from: "ghost", to: "open" }],
      ablations: [
        {
          id: "fix",
          prompt: "补上 unmounted 之后？",
          files: { "src/App.vue": transferFixed },
          expected: {
            kind: "stale",
            message: "这是修复：关掉后监听摘掉。再点空白，仍然关着，而且没有幽灵。",
          },
          lesson: "World 12 收束：指令碰 DOM。挂到 document 上的，卸节点时必须摘。下一课：组件自己还在路上。",
        },
      ],
      explanation: {
        headline: "有些泄漏不改画面",
        body: "计数那一课看得见幽灵。菜单这一课画面已经是关着。不摘仍然是错。能用组件和 props 讲清的，别先上指令。",
      },
      faqs: [
        { q: "怎么证明菜单那只幽灵还在？", a: "在 close 里给 n++。卸掉后 n 还会加。修复那一镜就是把摘掉补上。" },
      ],
      tryThis: "先点窗外关掉。再打开修复。两镜看起来都是关着，差在有没有 unmounted。",
      mapping: [
        { code: "没有 unmounted", runtime: "close 还在 document 上", ui: "关着，但泄漏" },
        { code: "unmounted 摘掉", runtime: "干净", ui: "关着，且停手" },
      ],
    },
  ],
};
