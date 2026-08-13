import type { CausalLab, CounterfactualWorld } from "../types";

const instant = `<script setup>
import { ref } from 'vue'
const on = ref(true)
</script>
<template>
  <button @click="on = !on">切换</button>
  <p v-if="on" class="card">卡片在</p>
</template>
`;

const wrapNoCss = `<script setup>
import { ref } from 'vue'
const on = ref(true)
</script>
<template>
  <button @click="on = !on">切换</button>
  <Transition>
    <p v-if="on" class="card">卡片在</p>
  </Transition>
</template>
`;

const fadeCss = `<style>
.v-enter-active,.v-leave-active{transition:opacity .45s ease}
.v-enter-from,.v-leave-to{opacity:0}
</style>
`;

const wrapDefaultCss = `<script setup>
import { ref } from 'vue'
const on = ref(true)
</script>
<template>
  <button @click="on = !on">切换</button>
  <Transition>
    <p v-if="on" class="card">卡片在</p>
  </Transition>
</template>
${fadeCss}
`;

const nameNoCss = `<script setup>
import { ref } from 'vue'
const on = ref(true)
</script>
<template>
  <button @click="on = !on">切换</button>
  <Transition name="fade">
    <p v-if="on" class="card">卡片在</p>
  </Transition>
</template>
${fadeCss}
`;

const fadeNamedCss = `<style>
.fade-enter-active,.fade-leave-active{transition:opacity .45s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>
`;

const wrapNamed = `<script setup>
import { ref } from 'vue'
const on = ref(true)
</script>
<template>
  <button @click="on = !on">切换</button>
  <Transition name="fade">
    <p v-if="on" class="card">卡片在</p>
  </Transition>
</template>
${fadeNamedCss}
`;

const twoNoMode = `<script setup>
import { ref } from 'vue'
const tab = ref('a')
</script>
<template>
  <button @click="tab = 'a'">A</button>
  <button @click="tab = 'b'">B</button>
  <Transition name="fade">
    <p v-if="tab === 'a'" class="card" key="a">面板 A</p>
    <p v-else class="card" key="b">面板 B</p>
  </Transition>
</template>
${fadeNamedCss}
`;

const twoOutIn = `<script setup>
import { ref } from 'vue'
const tab = ref('a')
</script>
<template>
  <button @click="tab = 'a'">A</button>
  <button @click="tab = 'b'">B</button>
  <Transition name="fade" mode="out-in">
    <p v-if="tab === 'a'" class="card" key="a">面板 A</p>
    <p v-else class="card" key="b">面板 B</p>
  </Transition>
</template>
${fadeNamedCss}
`;

const appear = `<script setup>
import { ref } from 'vue'
const on = ref(true)
</script>
<template>
  <button @click="on = !on">切换</button>
  <Transition name="fade" appear>
    <p v-if="on" class="card">第一帧也会淡入</p>
  </Transition>
</template>
${fadeNamedCss}
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>
<template>
  <button @click="open = !open">{{ open ? '收起' : '展开' }}</button>
  <p v-if="open" class="card">答案：Teleport 换 DOM 父亲。</p>
</template>
`;

const transferAfter = `<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>
<template>
  <button @click="open = !open">{{ open ? '收起' : '展开' }}</button>
  <Transition name="fade">
    <p v-if="open" class="card">答案：Teleport 换 DOM 父亲。</p>
  </Transition>
</template>
${fadeNamedCss}
`;

const worldSnap: CounterfactualWorld = {
  id: "snap",
  name: "瞬间出现 / 消失",
  tagline: "v-if 一变，DOM 立刻有或无",
  files: { "src/App.vue": instant },
  nodes: [
    { id: "on", kind: "ref", label: "on" },
    { id: "dom", kind: "dom", label: "瞬间" },
  ],
  edges: [{ from: "on", to: "dom", label: "v-if" }],
  note: "没有离开的时间。像素要么在要么不在。",
};

const worldFade: CounterfactualWorld = {
  id: "fade",
  name: "有一段离开的寿命",
  tagline: "类名在，CSS 才把寿命画出来",
  files: { "src/App.vue": wrapNamed },
  nodes: [
    { id: "on", kind: "ref", label: "on" },
    { id: "tr", kind: "component", label: "Transition" },
    { id: "dom", kind: "dom", label: "淡入淡出" },
  ],
  edges: [
    { from: "on", to: "tr" },
    { from: "tr", to: "dom", label: "类名 + CSS" },
  ],
  note: "Vue 只打类名。过渡是 CSS 的边。",
};

export const TRANSITION_LAB: CausalLab = {
  id: "transition",
  world: 5,
  concept: "transition",
  title: "出现和消失也可以有寿命",
  subtitle: "Transition 只负责打类名。没有匹配的 CSS，切换仍是瞬间。",
  promise:
    "一镜一条边：先瞬间 v-if，再包 Transition 没有 CSS，再补上默认类名，再 name=\"fade\" 却还用 .v- 前缀，再写成 .fade-，再 mode=\"out-in\"。",
  minutes: 14,
  official: "/guide/built-ins/transition.html",
  scenes: [
    {
      id: "transition-s0",
      tick: "S0",
      title: "v-if 是瞬间的",
      goal: "卡片要么在要么不在。没有中间帧。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": instant },
        blocks: [{ id: "vif", label: "① v-if 切换" }],
        narration: "点切换几次。卡片是砸出来、砸回去的。",
      },
      observe: {
        state: [{ id: "on", label: "on", value: "true/false", symbol: "on" }],
        dom: [{ id: "p", label: "p", value: "瞬间" }],
        events: [],
      },
      nodes: [
        { id: "on", kind: "ref", label: "on", symbol: "on" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "on", to: "dom", label: "v-if" }],
      explanation: {
        headline: "真假之间没有时间",
        body: "v-if 改变的是「在不在树里」。动画要的是「正在进来 / 正在离开」。那是另一条边。",
      },
      tryThis: "连点切换。记住这种没有淡出的脸。",
    },
    {
      id: "transition-s1",
      tick: "S1",
      title: "包了 Transition，没有 CSS",
      goal: "只包组件。样式表是空的。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "包上 <Transition> 之后，切换会？",
        choices: [
          { id: "fade", label: "自动淡入淡出", correct: false, why: "Vue 不会自带视觉。它只在进场离场时打类名。" },
          { id: "snap", label: "仍是瞬间。类名没有对应的 CSS", correct: true, why: "和 loading 存在但不画同一条规则：声明 ≠ 接入。" },
          { id: "err", label: "报错：缺少 CSS", correct: false, why: "合法。静默瞬间。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": wrapNoCss },
        blocks: [{ id: "wrap", label: "② <Transition> 无样式" }],
        narration: "再点几次。应和上一镜一样砸。打开开发者工具会看到一闪而过的 v-enter-from。",
      },
      observe: {
        state: [{ id: "on", label: "on", value: "在变", symbol: "on" }],
        dom: [{ id: "p", label: "p", value: "仍瞬间" }],
        events: [],
      },
      nodes: [
        { id: "tr", kind: "component", label: "Transition", symbol: "Transition" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "tr", to: "dom", label: "类名无处依附" }],
      explanation: {
        headline: "Vue 打类，CSS 画寿命",
        body: "默认前缀是 v-。下一镜补上 .v-enter-active 和 .v-enter-from。只补 CSS，模板不动。",
      },
      tryThis: "切换。必须仍是瞬间。这是这一镜的正确答案。",
      mapping: [{ code: "<Transition>", runtime: "进场离场打类名", ui: "看不见" }],
    },
    {
      id: "transition-s2",
      tick: "S2",
      title: "补上默认 v- 类名",
      goal: "只加 CSS。.v-enter-from { opacity:0 }。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "有了匹配的 CSS。切换会？",
        choices: [
          { id: "fade", label: "大约半秒淡入 / 淡出", correct: true, why: "类名对上了。transition:opacity .45s 把离开的寿命画出来。" },
          { id: "snap", label: "仍瞬间。还要 name", correct: false, why: "不写 name 时前缀就是 v-。这一镜对得上。" },
          { id: "stay", label: "淡入后卡在透明", correct: false, why: "active 类会摘掉。动画结束节点才真正移除。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": wrapDefaultCss },
        blocks: [{ id: "css", label: "③ .v-enter-from / .v-leave-to" }],
        narration: "请慢一点切换。卡片应淡，而不是砸。",
      },
      observe: {
        state: [{ id: "on", label: "on", value: "在变", symbol: "on" }],
        dom: [{ id: "p", label: "p", value: "有寿命" }],
        events: [],
      },
      nodes: [
        { id: "tr", kind: "component", label: "Transition", symbol: "Transition" },
        { id: "css", kind: "script", label: ".v-*" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "tr", to: "css", label: "类名" },
        { from: "css", to: "dom" },
      ],
      explanation: {
        headline: "类名契约是 v-",
        body: "下一镜给 Transition 起名 fade。CSS 若仍写 .v-，契约又断了。",
      },
      tryThis: "切换两次。必须看见淡出。打开 style，看前缀是 v-。",
      mapping: [{ code: ".v-enter-from { opacity:0 }", runtime: "类名有人画", ui: "淡" }],
    },
    {
      id: "transition-s3",
      tick: "S3",
      title: "起了名，CSS 还在用 v-",
      goal: "name=\"fade\"。样式仍是 .v-enter-from。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "改了 name。切换会？",
        choices: [
          { id: "fade", label: "仍会淡。v- 是别名", correct: false, why: "name 会改前缀。Vue 现在打的是 fade-enter-from。" },
          { id: "snap", label: "变回瞬间。类名对不上了", correct: true, why: "和 include=\"PanelA\"、inject('usr') 同一类：契约改了，另一边没改。" },
          { id: "err", label: "报错：未知的 name", correct: false, why: "静默瞬间。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": nameNoCss },
        blocks: [{ id: "name", label: "④ name=\"fade\"，CSS 仍是 .v-" }],
        narration: "再切换。淡出应消失。打开 style：还在等一个已经不打的类名。",
      },
      observe: {
        state: [{ id: "on", label: "on", value: "在变", symbol: "on" }],
        dom: [{ id: "p", label: "p", value: "瞬间" }],
        events: [],
      },
      nodes: [
        { id: "tr", kind: "component", label: "name=fade" },
        { id: "css", kind: "script", label: ".v-*（没人打）" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [],
      why: {
        question: "为什么加了名字反而没动画了？",
        choices: [
          { id: "prefix", label: "name 把类名前缀从 v- 换成 fade-。旧 CSS 成了死代码", correct: true, why: "两边要一起改。只改一边，边就断。" },
          { id: "bug", label: "fade 是保留字", correct: false, why: "任意字符串都行。" },
          { id: "order", label: "style 必须写在 template 上面", correct: false, why: "SFC 顺序无所谓。选择器要对。" },
        ],
      },
      explanation: {
        headline: "name 是前缀契约",
        body: "下一镜只把 CSS 改成 .fade-enter-from。模板已经叫 fade。",
      },
      tryThis: "切换。必须变回瞬间。这是这一镜要你看见的退步。",
    },
    {
      id: "transition-s4",
      tick: "S4",
      title: "CSS 跟上 fade- 前缀",
      goal: "只改选择器。name 已经是 fade。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "选择器改成 .fade-enter-from。切换会？",
        choices: [
          { id: "fade", label: "淡回来", correct: true, why: "类名再次对上。" },
          { id: "snap", label: "仍瞬间，还要 appear", correct: false, why: "appear 管第一帧。切换已经会打 enter/leave。" },
          { id: "both", label: "只有进场有，离场没有", correct: false, why: "leave 类也写了。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": wrapNamed },
        blocks: [{ id: "ok", label: "⑤ .fade-enter-from" }],
        narration: "请再淡一次。打开反事实，对比瞬间的世界。",
      },
      observe: {
        state: [{ id: "on", label: "on", value: "在变", symbol: "on" }],
        dom: [{ id: "p", label: "p", value: "淡" }],
        events: [],
      },
      nodes: [
        { id: "tr", kind: "component", label: "Transition", symbol: "Transition" },
        { id: "css", kind: "script", label: ".fade-*" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "tr", to: "css" },
        { from: "css", to: "dom" },
      ],
      counterfactual: {
        id: "snap-vs-fade",
        title: "瞬间 vs 有寿命",
        setup: "同一份 v-if。差在类名有没有人画。",
        worlds: [worldSnap, worldFade],
        punchline: "按钮两边一样。一张砸，一张淡。Transition 不是装饰，是离开的那几百毫秒。",
      },
      explanation: {
        headline: "进场离场是对称的类名",
        body: "下一镜两块面板共用一个 Transition。默认会叠在一起进进出出。mode=\"out-in\" 让旧的先走完。",
      },
      tryThis: "切换看淡。打开反事实。",
      mapping: [{ code: 'name="fade" + .fade-enter-from', runtime: "前缀对齐", ui: "淡" }],
    },
    {
      id: "transition-s5",
      tick: "S5",
      title: "两块面板，先一起叠着变",
      goal: "同一个 Transition 里 A / B。先不写 mode。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点 B。A 离开、B 进入会？",
        choices: [
          { id: "stack", label: "短暂叠在一起：一个淡出、一个淡入", correct: true, why: "默认 mode 是同时。两份 DOM 在同一位置活过几百毫秒。" },
          { id: "wait", label: "A 先完全消失，B 再出现", correct: false, why: "那是 out-in。下一镜才加。" },
          { id: "snap", label: "瞬间替换，因为有两个孩子", correct: false, why: "key 让它们被当成两个不同 vnode。都会走过渡。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": twoNoMode },
        blocks: [{ id: "two", label: "⑥ 两个孩子，无 mode" }],
        narration: "慢一点点 A / B。看两张卡片会不会在同一瞬间都在。",
      },
      observe: {
        state: [{ id: "tab", label: "tab", value: "a/b", symbol: "tab" }],
        dom: [{ id: "p", label: "p", value: "可能重叠" }],
        events: [],
      },
      nodes: [
        { id: "tr", kind: "component", label: "Transition" },
        { id: "a", kind: "dom", label: "A 离开" },
        { id: "b", kind: "dom", label: "B 进入" },
      ],
      edges: [
        { from: "tr", to: "a" },
        { from: "tr", to: "b" },
      ],
      explanation: {
        headline: "同时，是默认的寿命重叠",
        body: "列表高度会跳。弹层会闪两张。下一镜 mode=\"out-in\"：旧的走完，新的才进。",
      },
      tryThis: "来回点 A/B。看有没有一帧两张卡片叠着。",
    },
    {
      id: "transition-s6",
      tick: "S6",
      title: "out-in / 拆掉 CSS / 拆掉 name 对齐",
      goal: "先看排队走。再拆成瞬间、错前缀。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "mode=\"out-in\" 之后点 B。会？",
        choices: [
          { id: "wait", label: "A 淡出结束，B 才淡入。中间可以空一拍", correct: true, why: "两条寿命串起来。不再叠。" },
          { id: "stack", label: "仍会叠。mode 只是提示", correct: false, why: "mode 改调度。out-in / in-out 是两条边。" },
          { id: "snap", label: "变成瞬间", correct: false, why: "CSS 还在。只是顺序变了。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": twoOutIn },
        blocks: [{ id: "mode", label: "⑦ mode=\"out-in\"" }],
        narration: "先来回切，确认不再叠。再拆 CSS、拆前缀对齐、看 appear 第一帧。",
      },
      observe: {
        state: [{ id: "tab", label: "tab", value: "排队" }],
        dom: [{ id: "p", label: "p", value: "先出后进" }],
        events: [],
      },
      nodes: [
        { id: "tr", kind: "component", label: "out-in" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "tr", to: "dom", label: "串行" }],
      ablations: [
        {
          id: "css",
          prompt: "如果去掉 CSS？",
          files: { "src/App.vue": wrapNoCss },
          expected: { kind: "stale", message: "瞬间砸。类名还在打，没人画。" },
          lesson: "Transition 不是动画库。CSS 才是。",
        },
        {
          id: "prefix",
          prompt: "如果 name=fade 仍用 .v-？",
          files: { "src/App.vue": nameNoCss },
          expected: { kind: "stale", message: "又变瞬间。前缀契约断了。" },
          lesson: "name 和选择器必须一起改。",
        },
        {
          id: "appear",
          prompt: "加上 appear 之后第一帧？",
          files: { "src/App.vue": appear },
          expected: { kind: "stale", message: "这是修复向的演示：刷新后卡片也会先淡入。appear 把第一次挂载也当成进场。" },
          lesson: "默认第一帧是砸出来的。appear 给第一帧寿命。",
        },
      ],
      explanation: {
        headline: "寿命要调度，类名要人画",
        body: "没 CSS、错前缀、第一帧、重叠，都是边没接上。World 5 到此：数据跨树、实例寿命、DOM 父亲、出现寿命。TS / 测试 / 上线还在后面。",
      },
      tryThis: "先感受 out-in 的空拍。三种消融各切两次。",
    },
    {
      id: "transition-s7",
      tick: "S7",
      title: "换：展开答案",
      goal: "FAQ 展开。要不要给这一下寿命？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "现在展开是瞬间的。包上 name=\"fade\" 且 CSS 对齐后会？",
        choices: [
          { id: "fade", label: "答案淡入淡出", correct: true, why: "和卡片同一张图。v-if 仍是在不在，Transition 借一段离开的时间。" },
          { id: "h", label: "高度会自动动画", correct: false, why: "你写的是 opacity。高度要另写 max-height 或 JS hook。" },
          { id: "keep", label: "KeepAlive 才会动画", correct: false, why: "KeepAlive 管实例死活。Transition 管 DOM 进离场。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "faq", label: "换场景：展开" }],
        narration: "先瞬间展开。想清楚淡的是透明度，不是高度。",
      },
      observe: {
        state: [{ id: "open", label: "open", value: "false", symbol: "open" }],
        dom: [{ id: "p", label: "p", value: "瞬间" }],
        events: [],
      },
      nodes: [
        { id: "open", kind: "ref", label: "open", symbol: "open" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "open", to: "dom" }],
      ablations: [
        {
          id: "fade",
          prompt: "包上 fade Transition 之后？",
          files: { "src/App.vue": transferAfter },
          expected: {
            kind: "stale",
            message: "这是修复：展开/收起会淡。高度仍可能跳动——那是另一条 CSS 边。",
          },
          lesson: "World 5 收束：provide 跨树，KeepAlive 延寿，Teleport 搬家，Transition 给进离场一段时间。",
        },
      ],
      explanation: {
        headline: "Transition 的身份是进离场的寿命",
        body: "它不保存状态（那是 KeepAlive），不换父节点（那是 Teleport）。它只请求：在销毁或插入的前后，请给我几帧。下一世界会问：你读 DOM 是不是太早，以及渲染炸了树还在不在。",
      },
      tryThis: "先瞬间展开。再打开淡入版，慢一点点。",
    },
  ],
};
