import type { CausalLab, CounterfactualWorld } from "../types";

const padA = `<script>
export default { name: 'PadA' }
</script>
<script setup>
import { ref, onMounted, onActivated } from 'vue'
const n = ref(0)
const born = ref(0)
const woke = ref(0)
onMounted(() => { born.value++ })
onActivated(() => { woke.value++ })
</script>
<template>
  <div class="card">
    <p class="hint">面板 A</p>
    <button @click="n++">A 点了 {{ n }}</button>
    <p class="hint">onMounted {{ born }} · onActivated {{ woke }}</p>
  </div>
</template>
`;

const padB = `<script>
export default { name: 'PadB' }
</script>
<script setup>
import { ref, onMounted } from 'vue'
const n = ref(0)
const born = ref(0)
onMounted(() => { born.value++ })
</script>
<template>
  <div class="card">
    <p class="hint">面板 B</p>
    <button @click="n++">B 点了 {{ n }}</button>
    <p class="hint">onMounted {{ born }}</p>
  </div>
</template>
`;

const padC = `<script>
export default { name: 'PadC' }
</script>
<script setup>
import { ref, onMounted } from 'vue'
const n = ref(0)
const born = ref(0)
onMounted(() => { born.value++ })
</script>
<template>
  <div class="card">
    <p class="hint">面板 C</p>
    <button @click="n++">C 点了 {{ n }}</button>
    <p class="hint">onMounted {{ born }}</p>
  </div>
</template>
`;

const tabsVif = `<script setup>
import { ref } from 'vue'
import PadA from './PadA.vue'
import PadB from './PadB.vue'
const tab = ref('a')
</script>
<template>
  <button :class="{ on: tab === 'a' }" @click="tab = 'a'">A</button>
  <button :class="{ on: tab === 'b' }" @click="tab = 'b'">B</button>
  <p class="hint">当前 {{ tab }}</p>
  <PadA v-if="tab === 'a'" />
  <PadB v-else />
</template>
`;

const wrapDiv = `<script setup>
import { ref } from 'vue'
import PadA from './PadA.vue'
import PadB from './PadB.vue'
const tab = ref('a')
</script>
<template>
  <button :class="{ on: tab === 'a' }" @click="tab = 'a'">A</button>
  <button :class="{ on: tab === 'b' }" @click="tab = 'b'">B</button>
  <p class="hint">KeepAlive 包着一层 div</p>
  <KeepAlive>
    <div>
      <PadA v-if="tab === 'a'" />
      <PadB v-else />
    </div>
  </KeepAlive>
</template>
`;

const wrapIs = `<script setup>
import { ref } from 'vue'
import PadA from './PadA.vue'
import PadB from './PadB.vue'
const tab = ref('a')
</script>
<template>
  <button :class="{ on: tab === 'a' }" @click="tab = 'a'">A</button>
  <button :class="{ on: tab === 'b' }" @click="tab = 'b'">B</button>
  <p class="hint">KeepAlive 直接包 component</p>
  <KeepAlive>
    <component :is="tab === 'a' ? PadA : PadB" />
  </KeepAlive>
</template>
`;

const includeWrong = `<script setup>
import { ref } from 'vue'
import PadA from './PadA.vue'
import PadB from './PadB.vue'
const tab = ref('a')
</script>
<template>
  <button :class="{ on: tab === 'a' }" @click="tab = 'a'">A</button>
  <button :class="{ on: tab === 'b' }" @click="tab = 'b'">B</button>
  <p class="hint">include="PanelA"（名字不对）</p>
  <KeepAlive include="PanelA">
    <component :is="tab === 'a' ? PadA : PadB" />
  </KeepAlive>
</template>
`;

const includeRight = `<script setup>
import { ref } from 'vue'
import PadA from './PadA.vue'
import PadB from './PadB.vue'
const tab = ref('a')
</script>
<template>
  <button :class="{ on: tab === 'a' }" @click="tab = 'a'">A</button>
  <button :class="{ on: tab === 'b' }" @click="tab = 'b'">B</button>
  <p class="hint">include="PadA,PadB"</p>
  <KeepAlive include="PadA,PadB">
    <component :is="tab === 'a' ? PadA : PadB" />
  </KeepAlive>
</template>
`;

const maxOne = `<script setup>
import { ref } from 'vue'
import PadA from './PadA.vue'
import PadB from './PadB.vue'
import PadC from './PadC.vue'
const tab = ref('a')
const map = { a: PadA, b: PadB, c: PadC }
</script>
<template>
  <button :class="{ on: tab === 'a' }" @click="tab = 'a'">A</button>
  <button :class="{ on: tab === 'b' }" @click="tab = 'b'">B</button>
  <button :class="{ on: tab === 'c' }" @click="tab = 'c'">C</button>
  <p class="hint">KeepAlive :max="1"</p>
  <KeepAlive :max="1">
    <component :is="map[tab]" />
  </KeepAlive>
</template>
`;

const bustKey = `<script setup>
import { ref } from 'vue'
import PadA from './PadA.vue'
import PadB from './PadB.vue'
const tab = ref('a')
</script>
<template>
  <button :class="{ on: tab === 'a' }" @click="tab = 'a'">A</button>
  <button :class="{ on: tab === 'b' }" @click="tab = 'b'">B</button>
  <KeepAlive>
    <component :is="tab === 'a' ? PadA : PadB" :key="Date.now()" />
  </KeepAlive>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const step = ref(1)
const name = ref('')
</script>
<template>
  <button @click="step = 1">1 名字</button>
  <button @click="step = 2">2 确认</button>
  <div v-if="step === 1" class="card">
    <input v-model="name" placeholder="你的名字" />
  </div>
  <p v-else class="card">确认：{{ name || '（空）' }}</p>
</template>
`;

const stepPad = `<script>
export default { name: 'StepName' }
</script>
<script setup>
import { ref } from 'vue'
const name = ref('')
</script>
<template>
  <div class="card">
    <input v-model="name" placeholder="你的名字" />
  </div>
</template>
`;

const stepOk = `<script>
export default { name: 'StepOk' }
</script>
<script setup>
import { inject } from 'vue'
const name = inject('name', '')
</script>
<template>
  <p class="card">确认页（自己没有输入框）</p>
</template>
`;

const transferAfter = `<script setup>
import { ref } from 'vue'
import StepName from './StepName.vue'
const step = ref(1)
</script>
<template>
  <button @click="step = 1">1 名字</button>
  <button @click="step = 2">2 确认</button>
  <KeepAlive>
    <StepName v-if="step === 1" />
    <p v-else class="card">切回来，输入应还在（组件没死）</p>
  </KeepAlive>
</template>
`;

const worldDie: CounterfactualWorld = {
  id: "die",
  name: "v-if 切走即销毁",
  tagline: "计数归零，onMounted 再跑",
  files: {
    "src/App.vue": tabsVif,
    "src/PadA.vue": padA,
    "src/PadB.vue": padB,
  },
  nodes: [
    { id: "tab", kind: "ref", label: "tab" },
    { id: "a", kind: "component", label: "PadA 销毁" },
    { id: "dom", kind: "dom", label: "n 回到 0" },
  ],
  edges: [{ from: "tab", to: "a", label: "v-if false" }],
  note: "v-if 为假，实例拆掉。ref 一起走。回来是新生儿。",
};

const worldKeep: CounterfactualWorld = {
  id: "keep",
  name: "KeepAlive 缓存实例",
  tagline: "切走是停用，不是死亡",
  files: {
    "src/App.vue": wrapIs,
    "src/PadA.vue": padA,
    "src/PadB.vue": padB,
  },
  nodes: [
    { id: "ka", kind: "component", label: "KeepAlive" },
    { id: "a", kind: "component", label: "PadA 还活着" },
    { id: "dom", kind: "dom", label: "n 还在" },
  ],
  edges: [{ from: "ka", to: "a", label: "停用 / 激活" }],
  note: "DOM 可以卸。实例留在缓存里。onActivated 会再响，onMounted 不会。",
};

const pads = { "src/PadA.vue": padA, "src/PadB.vue": padB };

export const KEEPALIVE_LAB: CausalLab = {
  id: "keepalive",
  world: 5,
  concept: "keep-alive",
  title: "切走不等于拆掉",
  subtitle: "v-if 会杀死实例。KeepAlive 把死亡改成停用。包错孩子，缓存的就不是你要的人。",
  promise:
    "一镜一条边：先 v-if 切走归零，再 KeepAlive 包一层 div（无效），再直接包 component，再 include 写错名字，再 max=1 挤掉最老的。",
  minutes: 16,
  official: "/guide/built-ins/keep-alive.html",
  scenes: [
    {
      id: "keepalive-s0",
      tick: "S0",
      title: "两个面板，v-if 切换",
      goal: "A / B 每次只有一个在树里。先在 A 上点几下。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": tabsVif, ...pads },
        blocks: [{ id: "vif", label: "① v-if 切换 PadA / PadB" }],
        narration: "点 A 的按钮几次。onMounted 是 1。下一镜才切到 B 再回来——看数字还在不在。",
      },
      observe: {
        state: [{ id: "n", label: "A.n", value: "你点的次数", symbol: "n" }],
        dom: [{ id: "a", label: "PadA", value: "活着" }],
        events: [],
      },
      nodes: [
        { id: "tab", kind: "ref", label: "tab", symbol: "tab" },
        { id: "a", kind: "component", label: "PadA" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "tab", to: "a", label: "v-if" }],
      explanation: {
        headline: "不在树里的组件是死的",
        body: "v-if 为假时，实例、ref、副作用全部拆掉。切回来是一次全新的 onMounted。",
      },
      tryThis: "只在 A 上点到 3。先别切 B。记住 3 和 onMounted 1。",
    },
    {
      id: "keepalive-s1",
      tick: "S1",
      title: "切到 B 再回来",
      goal: "同一份 v-if。请真的切走再切回。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "A 点到 3，切到 B，再回 A。计数会？",
        choices: [
          { id: "keep", label: "还是 3。面板只是藏起来", correct: false, why: "那是 v-show 或 KeepAlive。v-if 拆掉了实例。" },
          { id: "zero", label: "回到 0，onMounted 变成 2", correct: true, why: "回来的是新实例。旧的 n 已经随销毁走了。" },
          { id: "err", label: "报错：不能重复挂载", correct: false, why: "完全合法。只是状态丢了。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": tabsVif, ...pads },
        blocks: [{ id: "die", label: "② 切走 = 销毁" }],
        narration: "请：A 点几下 → B → A。计数必须归零。onMounted 应变成 2。",
      },
      replay: {
        label: "A → B → A",
        steps: [
          { caption: "PadA 还活着，n=3", highlight: ["a"] },
          { caption: "tab=b，PadA 销毁", event: "click", highlight: ["a"] },
          { caption: "tab=a，新的 PadA，n=0", highlight: ["dom"] },
        ],
      },
      observe: {
        state: [{ id: "born", label: "onMounted", value: "2", symbol: "born" }],
        dom: [{ id: "n", label: "A 点了", value: "0" }],
        events: [],
      },
      nodes: [
        { id: "tab", kind: "ref", label: "tab" },
        { id: "a", kind: "component", label: "PadA 销毁" },
        { id: "dom", kind: "dom", label: "n=0" },
      ],
      edges: [{ from: "tab", to: "a", label: "杀死" }],
      why: {
        question: "为什么草稿和计数都丢了？",
        choices: [
          { id: "life", label: "组件寿命结束。ref 住在实例里，实例没了值就没了", correct: true, why: "和退出登录拷贝还在相反：这里连拷贝的房子都拆了。" },
          { id: "vue", label: "Vue 3 的 v-if 会重置所有 ref", correct: false, why: "不是重置。是销毁后再创建。" },
          { id: "key", label: "缺了 :key", correct: false, why: "没有 key 也会销毁。key 是另一条边。" },
        ],
      },
      explanation: {
        headline: "切走是一次死亡",
        body: "下一镜套上 KeepAlive——先故意包一层永远存在的 div。缓存会作用在 div 上，A/B 照死。",
      },
      tryThis: "A 点到 3 → B → A。必须回到 0，onMounted 为 2。",
      mapping: [{ code: "<PadA v-if>", runtime: "假 → 销毁实例", ui: "计数归零" }],
    },
    {
      id: "keepalive-s2",
      tick: "S2",
      title: "KeepAlive 包着一层 div",
      goal: "KeepAlive 的孩子是 div。A/B 仍在 div 里 v-if。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "有 KeepAlive 了。A 点到 3，切 B 再回来。会？",
        choices: [
          { id: "keep", label: "还是 3。已经包了 KeepAlive", correct: false, why: "缓存的是那层不会死的 div。div 里的 v-if 仍在杀 PadA。" },
          { id: "zero", label: "仍归零。包错了孩子", correct: true, why: "KeepAlive 只认直接那个动态孩子。包稳定节点等于没包。" },
          { id: "err", label: "报错：KeepAlive 只能有一个子节点", correct: false, why: "一个 div 正好一个子节点。合法且无效。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": wrapDiv, ...pads },
        blocks: [{ id: "div", label: "③ KeepAlive > div > v-if" }],
        narration: "请再走 A→B→A。计数仍应归零。打开模板，看 KeepAlive 抱着谁。",
      },
      observe: {
        state: [{ id: "n", label: "A.n", value: "仍归零", symbol: "n" }],
        dom: [{ id: "ui", label: "UI", value: "像没包一样" }],
        events: [],
      },
      nodes: [
        { id: "ka", kind: "component", label: "KeepAlive", symbol: "KeepAlive" },
        { id: "div", kind: "script", label: "div（稳定）" },
        { id: "a", kind: "component", label: "PadA 仍死" },
      ],
      edges: [{ from: "ka", to: "div", label: "缓存了错的人" }],
      explanation: {
        headline: "缓存作用在直接孩子上",
        body: "下一镜去掉 div，让 KeepAlive 直接抱着 <component :is>。那才是会换身份的那个节点。",
      },
      tryThis: "再丢一次计数。确认 hint 写着「包着一层 div」。",
      faqs: [
        { q: "v-show 要 KeepAlive 吗？", a: "不必。v-show 只藏 DOM，实例一直活着。KeepAlive 是给 v-if / 动态 component 用的。" },
      ],
    },
    {
      id: "keepalive-s3",
      tick: "S3",
      title: "直接包 <component :is>",
      goal: "KeepAlive 的孩子就是会换的那一个。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "A 点到 3，切 B 再回 A。会？",
        choices: [
          { id: "keep", label: "还是 3。onMounted 仍是 1，onActivated 增加", correct: true, why: "实例停用，不销毁。DOM 可以卸。回来走 onActivated。" },
          { id: "zero", label: "仍归零。动态 component 不能缓存", correct: false, why: "这正是 KeepAlive 的本职。" },
          { id: "both", label: "计数还在，但 onMounted 变成 2", correct: false, why: "onMounted 只在创建时跑。缓存命中不创建。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": wrapIs, ...pads },
        blocks: [{ id: "is", label: "④ KeepAlive > component :is" }],
        narration: "请再走 A→B→A。计数应还在。看 onMounted 停在 1，onActivated 在增加。",
      },
      observe: {
        state: [
          { id: "n", label: "A.n", value: "还在", symbol: "n" },
          { id: "born", label: "onMounted", value: "1", symbol: "born" },
        ],
        dom: [{ id: "ui", label: "UI", value: "A 还是 3" }],
        events: [],
      },
      nodes: [
        { id: "ka", kind: "component", label: "KeepAlive", symbol: "KeepAlive" },
        { id: "a", kind: "component", label: "PadA 缓存" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "ka", to: "a", label: "停用" },
        { from: "a", to: "dom" },
      ],
      counterfactual: {
        id: "die-vs-keep",
        title: "销毁 vs 停用",
        setup: "同一对面板。差在 KeepAlive 抱的是不是动态孩子。",
        worlds: [worldDie, worldKeep],
        punchline: "切走两边都看不见 A。回来一张脸归零，一张脸还在。寿命不同。",
      },
      explanation: {
        headline: "停用不是死亡",
        body: "onMounted 不重跑。onActivated / onDeactivated 才是缓存寿命的钩子。下一镜 include 写成 PanelA——名字对不上，等于没缓存。",
      },
      tryThis: "A 点到 3 → B → A。必须还是 3。打开反事实对比。",
      mapping: [{ code: "<KeepAlive><component :is /></KeepAlive>", runtime: "实例进缓存", ui: "计数还在" }],
    },
    {
      id: "keepalive-s4",
      tick: "S4",
      title: "include 写错名字",
      goal: "include=\"PanelA\"。组件 name 是 PadA。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "include 对不上。A 点到 3 再切走回来。会？",
        choices: [
          { id: "keep", label: "还是 3。有 KeepAlive 就够", correct: false, why: "include 是白名单。不在名单里的，切走照死。" },
          { id: "zero", label: "归零。名字契约没对上", correct: true, why: "和 inject('usr')、params.todoId 同一类：名字写错等于没接上。" },
          { id: "err", label: "报错：未知的 include", correct: false, why: "静默。不匹配就当普通 v-if。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": includeWrong, ...pads },
        blocks: [{ id: "inc", label: "⑤ include=\"PanelA\"" }],
        narration: "请再丢一次。打开 PadA.vue 第一行 name，和 include 对比。",
      },
      observe: {
        state: [{ id: "n", label: "A.n", value: "归零", symbol: "n" }],
        dom: [{ id: "ui", label: "UI", value: "像没缓存" }],
        events: [],
      },
      nodes: [
        { id: "inc", kind: "script", label: "include PanelA" },
        { id: "a", kind: "component", label: "name: PadA" },
      ],
      edges: [],
      explanation: {
        headline: "include 认的是 name",
        body: "script setup 不会自动有名字。要 export default { name } 或 defineOptions。下一镜写对 PadA,PadB。",
      },
      tryThis: "确认归零。对比 include 和 name。",
      faqs: [
        { q: "不写 include 呢？", a: "默认缓存所有直接孩子。include / exclude 是白名单 / 黑名单。" },
      ],
    },
    {
      id: "keepalive-s5",
      tick: "S5",
      title: "max=1，最老的被挤掉",
      goal: "三个面板。缓存只能留一个。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "A 点到 3，切 B，再切 C，再回 A。A 会？",
        choices: [
          { id: "keep", label: "还是 3。A 是第一个", correct: false, why: "max=1。切到 B 时 A 被挤出缓存，销毁。C 再挤掉 B。" },
          { id: "zero", label: "归零。A 早已被挤出缓存", correct: true, why: "缓存是有限队列。最久未用的先走。和 max=1 的 LRU 一样。" },
          { id: "b", label: "只有 B 会丢，A 是根不会丢", correct: false, why: "没有特权。谁不在那一个名额里谁死。" },
        ],
      },
      mutation: {
        files: {
          "src/App.vue": maxOne,
          "src/PadA.vue": padA,
          "src/PadB.vue": padB,
          "src/PadC.vue": padC,
        },
        blocks: [{ id: "max", label: "⑥ KeepAlive :max=\"1\"" }],
        narration: "请严格：A 点几下 → B → C → A。A 必须归零。若只 A→B→A，B 会挤掉 A，同样归零。",
      },
      observe: {
        state: [{ id: "n", label: "A.n", value: "被挤掉后归零", symbol: "n" }],
        dom: [{ id: "ui", label: "UI", value: "新生儿 A" }],
        events: [],
      },
      nodes: [
        { id: "ka", kind: "component", label: "max=1" },
        { id: "a", kind: "component", label: "PadA 挤出" },
      ],
      edges: [{ from: "ka", to: "a", label: "LRU 销毁" }],
      explanation: {
        headline: "缓存有名额",
        body: "KeepAlive 不是无限永生。max 一满，最老的实例会真正销毁——onMounted 会再跑。",
      },
      tryThis: "A 点到 3 → B → C → 回 A。必须是 0。再试 A→B→A，同样丢。",
    },
    {
      id: "keepalive-s6",
      tick: "S6",
      title: "拆掉直接孩子 / 写错 include / 用会变的 key",
      goal: "三种坏法：包 div、名字不对、:key=\"Date.now()\" 每次都是新人。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "KeepAlive 里写 :key=\"Date.now()\"。每次切换会？",
        choices: [
          { id: "keep", label: "仍缓存。key 只给列表用", correct: false, why: "KeepAlive 用 type+key 当缓存键。key 每次不同，永远找不到旧实例。" },
          { id: "miss", label: "次次未命中。和没包一样归零", correct: true, why: "你亲手把身份证打成一次性的。" },
          { id: "err", label: "报错", correct: false, why: "静默。只是缓存永远空。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": wrapIs, ...pads },
        blocks: [{ id: "keep", label: "正确版本先留着" }],
        narration: "先确认 A→B→A 计数还在。再包 div、写错 include、打上 Date.now() key。",
      },
      observe: {
        state: [{ id: "ok", label: "缓存", value: "命中" }],
        dom: [{ id: "ui", label: "UI", value: "计数还在" }],
        events: [],
      },
      nodes: [
        { id: "ka", kind: "component", label: "KeepAlive" },
        { id: "a", kind: "component", label: "PadA" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "ka", to: "a" },
        { from: "a", to: "dom" },
      ],
      ablations: [
        {
          id: "div",
          prompt: "如果包一层 div？",
          files: { "src/App.vue": wrapDiv, ...pads },
          expected: { kind: "stale", message: "A→B→A 归零。缓存的是 div。" },
          lesson: "直接孩子必须是那个会换身份的节点。",
        },
        {
          id: "name",
          prompt: "如果 include 写成 PanelA？",
          files: { "src/App.vue": includeWrong, ...pads },
          expected: { kind: "stale", message: "名字不对，白名单为空，照死。" },
          lesson: "include 认 name。写错等于没缓存。",
        },
        {
          id: "key",
          prompt: "如果 :key=\"Date.now()\"？",
          files: { "src/App.vue": bustKey, ...pads },
          expected: { kind: "stale", message: "每次都是新 key，缓存永远 miss。" },
          lesson: "稳定的 type 才是身份证。一次性 key 会拆掉缓存。",
        },
      ],
      explanation: {
        headline: "缓存认直接孩子、认名字、认稳定 key",
        body: "包错、写错、key 乱动，脸都是归零。下一课 DOM 挂的位置也可以和组件树分开——Teleport。",
      },
      tryThis: "三种消融都走 A→B→A。归零对上号再恢复。",
    },
    {
      id: "keepalive-s7",
      tick: "S7",
      title: "换：两步表单",
      goal: "名字写在第 1 步。切到确认再回来，字还在吗？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "现在 name 住在父级。若把输入放进 StepName 组件并用 v-if 切换、不 KeepAlive，回来会？",
        choices: [
          { id: "keep", label: "还在。输入过就永远在", correct: false, why: "字住在子组件的 ref 里。v-if 杀死子组件。" },
          { id: "gone", label: "空了。步骤组件被拆掉", correct: true, why: "和 PadA 同一张图。要么把 name 抬到父级，要么 KeepAlive 住步骤。" },
          { id: "err", label: "报错", correct: false, why: "静默丢草稿。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "form", label: "换场景：两步表单" }],
        narration: "这一版 name 在父级，切走还在。想清楚字若搬进子组件，寿命就变成子组件的寿命。",
      },
      observe: {
        state: [{ id: "name", label: "name", value: "在父级", symbol: "name" }],
        dom: [{ id: "in", label: "input", value: "切走仍在" }],
        events: [],
      },
      nodes: [
        { id: "name", kind: "ref", label: "name（父）", symbol: "name" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "name", to: "dom" }],
      ablations: [
        {
          id: "ka",
          prompt: "输入搬进 StepName + KeepAlive 之后？",
          files: {
            "src/App.vue": transferAfter,
            "src/StepName.vue": stepPad,
            "src/StepOk.vue": stepOk,
          },
          expected: {
            kind: "stale",
            message: "这是另一条合法边：草稿住在步骤组件里，KeepAlive 让它切走不停用成死亡。抬到父级也行——看状态该住哪一层。",
          },
          lesson: "状态寿命 = 持有它的实例寿命。KeepAlive 延长实例寿命。下一课：实例还在这，DOM 可以挂到别处。",
        },
      ],
      explanation: {
        headline: "草稿的房子是哪一个实例",
        body: "父级 ref 活过切页。子组件 ref 死于 v-if。KeepAlive 把子组件的死改成睡。",
      },
      tryThis: "先在父级版输入再切页。再打开 KeepAlive 版：在步骤里输入，切走回来。",
    },
  ],
};
