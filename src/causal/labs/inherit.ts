import type { CausalLab, CounterfactualWorld } from "../types";

const off = `<script setup>
defineOptions({ inheritAttrs: false })
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <p class="probe">$attrs：{{ Object.keys($attrs).join(', ') || '（空）' }}</p>
    <input />
  </div>
</template>
`;

const bindInput = `<script setup>
defineOptions({ inheritAttrs: false })
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <p class="probe">$attrs：{{ Object.keys($attrs).join(', ') || '（空）' }}</p>
    <input v-bind="$attrs" />
  </div>
</template>
`;

const fragment = `<script setup>
</script>
<template>
  <p class="hint">标签</p>
  <input />
</template>
`;

const fragmentBind = `<script setup>
</script>
<template>
  <p class="hint">标签</p>
  <input v-bind="$attrs" />
</template>
`;

const clickAuto = `<script setup>
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <p class="hint">点盒子或输入框</p>
    <input placeholder="里面" />
  </div>
</template>
`;

const clickOff = `<script setup>
defineOptions({ inheritAttrs: false })
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <p class="hint">点盒子或输入框</p>
    <input placeholder="里面" />
  </div>
</template>
`;

const clickBind = `<script setup>
defineOptions({ inheritAttrs: false })
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <p class="hint">只有输入框接了点击</p>
    <input v-bind="$attrs" placeholder="里面" />
  </div>
</template>
`;

const appPh = `<script setup>
import Field from './Field.vue'
</script>
<template>
  <p class="card">父把 placeholder 和 class 交给 Field</p>
  <Field placeholder="写名字" class="on" />
</template>
`;

const appClick = `<script setup>
import { ref } from 'vue'
import Field from './Field.vue'
const n = ref(0)
</script>
<template>
  <p class="card">点到了 {{ n }} 次</p>
  <Field @click="n++" />
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
import Search from './Search.vue'
const n = ref(0)
</script>
<template>
  <p class="card">点到了 {{ n }} 次</p>
  <Search placeholder="搜" class="on" @click="n++" />
</template>
`;

const searchOff = `<script setup>
defineOptions({ inheritAttrs: false })
</script>
<template>
  <div class="panel">
    <h3>搜索</h3>
    <input />
  </div>
</template>
`;

const searchBind = `<script setup>
defineOptions({ inheritAttrs: false })
</script>
<template>
  <div class="panel">
    <h3>搜索</h3>
    <input v-bind="$attrs" />
  </div>
</template>
`;

const worldOff: CounterfactualWorld = {
  id: "off",
  name: "关掉自动贴根",
  tagline: "inheritAttrs: false",
  files: { "src/App.vue": appPh, "src/Field.vue": off },
  nodes: [
    { id: "attrs", kind: "script", label: "$attrs 还在" },
    { id: "dom", kind: "dom", label: "哪都不贴" },
  ],
  edges: [{ from: "attrs", to: "dom", label: "自动关了" }],
  note: "名单还在探针里。DOM 上既没有提示词，也没有绿框。",
};

const worldBind: CounterfactualWorld = {
  id: "bind",
  name: "自己绑到 input",
  tagline: "v-bind=\"$attrs\"",
  files: { "src/App.vue": appPh, "src/Field.vue": bindInput },
  nodes: [
    { id: "attrs", kind: "script", label: "$attrs" },
    { id: "input", kind: "dom", label: "提示词 + 绿框" },
  ],
  edges: [{ from: "attrs", to: "input", label: "你指定" }],
  note: "盒子不再发光。输入框拿到整包。",
};

export const INHERIT_LAB: CausalLab = {
  id: "inherit",
  world: 11,
  concept: "inheritAttrs",
  title: "关掉自动贴，自己选节点",
  subtitle: "inheritAttrs: false 不删除 $attrs。它只停止贴到根。你用 v-bind=\"$attrs\" 选人。",
  promise:
    "一镜一条边：先关掉后哪都不贴，再绑到 input，再多根节点自动停止，再给多根手动绑，再点击透传到盒子，再关掉后点击消失。",
  minutes: 16,
  official: "/guide/components/attrs.html#disabling-attribute-inheritance",
  scenes: [
    {
      id: "inherit-s0",
      tick: "S0",
      title: "关掉之后，哪都不贴",
      goal: "defineOptions({ inheritAttrs: false })。父仍传 placeholder 和 class。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appPh, "src/Field.vue": off },
        blocks: [{ id: "off", label: "① inheritAttrs: false" }],
        narration: "上一课属性贴到了盒子上。这一课先把自动贴关掉。名单还在，手停了。",
      },
      observe: {
        state: [{ id: "keys", label: "$attrs", value: "placeholder, class（还在）", symbol: "$attrs" }],
        dom: [
          { id: "box", label: ".panel", value: "没有绿框" },
          { id: "input", label: "input", value: "没有提示词" },
        ],
        events: [],
      },
      nodes: [
        { id: "opt", kind: "script", label: "inheritAttrs: false", symbol: "inheritAttrs" },
        { id: "attrs", kind: "script", label: "$attrs" },
        { id: "dom", kind: "dom", label: "哪都不贴" },
      ],
      edges: [{ from: "opt", to: "dom", label: "停手" }],
      explanation: {
        headline: "关掉的是自动贴，不是名单",
        body: "探针仍列着 placeholder、class。DOM 上盒子也不发光，输入框也没有提示词。下一镜你自己选绑到谁。",
      },
      tryThis: "探针必须仍有 placeholder 和 class。盒子必须没有绿框。输入框必须没有提示词。",
      faqs: [
        { q: "defineOptions 是什么？", a: "在 script setup 里写组件选项。inheritAttrs 不能靠宏推断，要显式关掉。" },
      ],
    },
    {
      id: "inherit-s1",
      tick: "S1",
      title: "整包绑到 input",
      goal: "<input v-bind=\"$attrs\" />。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "绑上之后。提示词和绿框会？",
        choices: [
          { id: "in", label: "都到输入框。盒子不再发光", correct: true, why: "你指定了节点。整包（class、placeholder）贴到 input。" },
          { id: "both", label: "盒子和输入框都发光。绑了会复制一份", correct: false, why: "自动贴已经关了。只有你绑的那一处。" },
          { id: "ph", label: "只有提示词进去，class 仍在盒子上", correct: false, why: "v-bind=\"$attrs\" 是整包。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPh, "src/Field.vue": bindInput },
        blocks: [{ id: "bind", label: "② v-bind=\"$attrs\"" }],
        narration: "自动贴仍关着。只多了一行绑到 input。",
      },
      counterfactual: {
        id: "off-vs-bind",
        title: "关掉 vs 自己绑",
        setup: "都 inheritAttrs: false。差在有没有 v-bind=\"$attrs\"。",
        worlds: [worldOff, worldBind],
        punchline: "名单一直在。贴到谁，由你选。",
      },
      observe: {
        state: [{ id: "keys", label: "$attrs", value: "placeholder, class" }],
        dom: [
          { id: "input", label: "input", value: "有提示词，有绿框" },
          { id: "box", label: ".panel", value: "没有绿框" },
        ],
        events: [],
      },
      nodes: [
        { id: "attrs", kind: "script", label: "$attrs" },
        { id: "input", kind: "dom", label: "input" },
        { id: "box", kind: "dom", label: "盒子" },
      ],
      edges: [
        { from: "attrs", to: "input" },
        { from: "box", to: "input", label: "不贴" },
      ],
      explanation: {
        headline: "你指定的节点才是新的根",
        body: "表单组件几乎总是这样：外面要盒子，属性要给里面的控件。下一镜连单根都没有——模板两段根。",
      },
      faqs: [
        { q: "class 会和 input 自己的 class 合并吗？", a: "会。绑到谁，谁就按那一节点的规则合并 class / style。" },
      ],
      tryThis: "输入框必须有「写名字」和绿框。盒子必须不再发光。打开反事实。",
      mapping: [{ code: "v-bind=\"$attrs\"", runtime: "整包贴到指定节点", ui: "input 发光" }],
    },
    {
      id: "inherit-s2",
      tick: "S2",
      title: "两个根，自动贴会停",
      goal: "模板里 <p> 和 <input> 并列。没有 inheritAttrs: false。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "没有单一根。提示词和绿框会？",
        choices: [
          { id: "first", label: "贴到第一段。p 会发光", correct: false, why: "多根时 Vue 不猜。自动透传停止。" },
          { id: "none", label: "哪都不贴。输入框没有提示词", correct: true, why: "没有单一根可以贴。控制台会警告。DOM 上属性消失。" },
          { id: "in", label: "贴到 input。Vue 认得控件", correct: false, why: "不猜。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPh, "src/Field.vue": fragment },
        blocks: [{ id: "frag", label: "③ 两个根" }],
        narration: "这一镜没关 inheritAttrs。是根的数量变成了两个。",
      },
      observe: {
        state: [{ id: "keys", label: "$attrs", value: "仍在名单里" }],
        dom: [
          { id: "p", label: "p", value: "没有绿框" },
          { id: "input", label: "input", value: "没有提示词" },
        ],
        events: [],
      },
      nodes: [
        { id: "a", kind: "dom", label: "p" },
        { id: "b", kind: "dom", label: "input" },
        { id: "attrs", kind: "script", label: "$attrs" },
      ],
      edges: [{ from: "attrs", to: "a", label: "无处可贴" }],
      explanation: {
        headline: "多根 = 自动贴停止",
        body: "和 inheritAttrs: false 同一张「哪都不贴」的脸，原因不同：一个是你关的，一个是没单一根。下一镜手动绑到 input。",
      },
      faqs: [
        { q: "控制台会怎样？", a: "开发模式会警告 Extraneous non-props attributes。预览里你用脸核对：提示词不在。" },
      ],
      tryThis: "标签「标签」和输入框都必须没有绿框。输入框必须没有提示词。",
      mapping: [{ code: "<p/> + <input/>", runtime: "没有单一根", ui: "哪都不贴" }],
    },
    {
      id: "inherit-s3",
      tick: "S3",
      title: "多根也自己选",
      goal: "两个根。input 上 v-bind=\"$attrs\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "绑到 input 之后会？",
        choices: [
          { id: "in", label: "输入框有提示词和绿框。p 没有", correct: true, why: "多根只是停掉自动。手动绑仍然有效。" },
          { id: "none", label: "仍哪都不贴。多根不能绑 $attrs", correct: false, why: "能绑。这正是官方做法。" },
          { id: "both", label: "两段根都会拿到", correct: false, why: "你只绑了一处。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPh, "src/Field.vue": fragmentBind },
        blocks: [{ id: "pick", label: "④ 多根绑到 input" }],
        narration: "根的数量没变。只指定了人。",
      },
      observe: {
        state: [{ id: "keys", label: "$attrs", value: "绑到 input" }],
        dom: [{ id: "input", label: "input", value: "有提示词，有绿框" }],
        events: [],
      },
      nodes: [
        { id: "attrs", kind: "script", label: "$attrs" },
        { id: "input", kind: "dom", label: "input" },
      ],
      edges: [{ from: "attrs", to: "input" }],
      explanation: {
        headline: "多根时必须自己选",
        body: "下一镜换一种透传：事件。父在组件上写 @click，没声明 emit 时，原生 click 会落到根。",
      },
      faqs: [
        { q: "还要不要 inheritAttrs: false？", a: "多根本来就不会自动贴。false 是为了单根时别贴到盒子上。两种可以一起用。" },
      ],
      tryThis: "输入框必须有「写名字」和绿框。上面的「标签」必须没有绿框。",
      mapping: [{ code: "<input v-bind=\"$attrs\">", runtime: "手动选根", ui: "控件拿到属性" }],
    },
    {
      id: "inherit-s4",
      tick: "S4",
      title: "点击也会落到根",
      goal: "父 <Field @click=\"n++\" />。子没声明 emit。根是盒子。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点灰色盒子（不是必须点输入框）。次数会？",
        choices: [
          { id: "one", label: "+1。原生 click 透传到根盒子", correct: true, why: "没声明的监听和没声明的属性一样，落到根。" },
          { id: "zero", label: "不动。@click 在组件上只听 emit", correct: false, why: "没声明 click 时，它当原生监听透传。" },
          { id: "input", label: "只有点输入框才 +1", correct: false, why: "监听贴在盒子上。冒泡也会到盒子，但点盒子本身就够。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appClick, "src/Field.vue": clickAuto },
        blocks: [{ id: "click", label: "⑤ @click 透传" }],
        narration: "属性换成事件。同一条边：没声明，就贴到根。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "点盒子就 +1" }],
        dom: [{ id: "card", label: ".card", value: "次数增加" }],
        events: [{ id: "click", label: "click", value: "落到根" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "@click" },
        { id: "box", kind: "dom", label: "盒子" },
        { id: "n", kind: "ref", label: "n" },
      ],
      edges: [
        { from: "click", to: "box", label: "透传" },
        { from: "box", to: "n" },
      ],
      explanation: {
        headline: "没声明的监听也是 $attrs",
        body: "它会变成根上的原生 onClick。下一镜关掉自动贴：点盒子不应再 +1。",
      },
      faqs: [
        { q: "如果 defineEmits(['click']) 呢？", a: "click 从透传除名。父的 @click 只听子 emit('click')。不 emit 就不动。和 placeholder 声明成 prop 同一条规则。" },
      ],
      tryThis: "点盒子的空白处。次数必须增加。再点输入框，次数也增加（冒泡到根）。",
      mapping: [{ code: "<Field @click=\"n++\" />", runtime: "原生监听贴到根", ui: "点盒子 +1" }],
    },
    {
      id: "inherit-s5",
      tick: "S5",
      title: "关掉后，点盒子不再算",
      goal: "inheritAttrs: false。父仍 @click=\"n++\"。不绑 $attrs。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "再点灰色盒子。次数会？",
        choices: [
          { id: "zero", label: "不动。监听没贴到任何人", correct: true, why: "和 placeholder 哪都不贴同一张脸。" },
          { id: "one", label: "仍 +1。事件总是冒泡到父", correct: false, why: "父听的是组件上的监听。没贴上去，就没人调 n++。" },
          { id: "err", label: "报错：多余的监听", correct: false, why: "静默无效。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appClick, "src/Field.vue": clickOff },
        blocks: [{ id: "off", label: "⑥ 点击也不自动贴" }],
        narration: "自动贴关掉。事件和属性同一条缝。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "0" }],
        dom: [{ id: "card", label: ".card", value: "0" }],
        events: [],
      },
      nodes: [
        { id: "click", kind: "event", label: "@click" },
        { id: "box", kind: "dom", label: "盒子" },
        { id: "n", kind: "ref", label: "n" },
      ],
      edges: [{ from: "click", to: "n", label: "没贴上" }],
      explanation: {
        headline: "事件也要你选节点",
        body: "下一镜把 $attrs 绑到 input：只有点输入框才 +1，点盒子不算。",
      },
      faqs: [
        { q: "点输入框呢？", a: "这一镜也没绑，所以也不 +1。下一镜绑上之后，点输入框才算。" },
      ],
      tryThis: "点盒子、点输入框，次数必须一直是 0。",
      mapping: [{ code: "inheritAttrs: false", runtime: "监听不贴根", ui: "点了也不 +1" }],
    },
    {
      id: "inherit-s6",
      tick: "S6",
      title: "拆成哪都不贴 / 绑到 input / 点盒子",
      goal: "三种对照：关掉、绑到 input、点击透传。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到绑到 input 的世界。提示词会？",
        choices: [
          { id: "in", label: "在输入框上", correct: true, why: "先确认好的脸。" },
          { id: "box", label: "在盒子上", correct: false, why: "自动贴关了。" },
          { id: "none", label: "哪都没有", correct: false, why: "那是只关不绑。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPh, "src/Field.vue": bindInput },
        blocks: [{ id: "keep", label: "绑到 input 先留着" }],
        narration: "先看输入框发光。再分别：只关不绑、多根停贴、点击绑到 input。",
      },
      observe: {
        state: [{ id: "ok", label: "$attrs", value: "在 input 上" }],
        dom: [{ id: "input", label: "input", value: "有提示词" }],
        events: [],
      },
      nodes: [
        { id: "attrs", kind: "script", label: "$attrs" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "attrs", to: "dom" }],
      ablations: [
        {
          id: "off",
          prompt: "如果只关不绑？",
          files: { "src/App.vue": appPh, "src/Field.vue": off },
          expected: { kind: "stale", message: "名单还在。哪都不贴。" },
          lesson: "关掉只是停手。",
        },
        {
          id: "frag",
          prompt: "如果两个根还不绑？",
          files: { "src/App.vue": appPh, "src/Field.vue": fragment },
          expected: { kind: "stale", message: "自动贴停止。哪都没有提示词。" },
          lesson: "多根和 false 同一张脸，原因不同。",
        },
        {
          id: "click",
          prompt: "如果点击绑到 input？",
          files: { "src/App.vue": appClick, "src/Field.vue": clickBind },
          expected: { kind: "stale", message: "点输入框 +1。点盒子不算。" },
          lesson: "事件也是 $attrs 的一部分。",
        },
      ],
      explanation: {
        headline: "停手、没根、自己选",
        body: "属性落在哪一层 DOM，由根、开关、你绑的那一行决定。下一课父不只贴属性：它想调用子的方法。",
      },
      tryThis: "三种消融：哪都不贴、多根也没有、点输入框才计数。对上号再恢复。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先只关不绑，再多根，再事件绑到 input。" },
      ],
    },
    {
      id: "inherit-s7",
      tick: "S7",
      title: "换：搜索条",
      goal: "Search 关了自动贴，没绑 $attrs。父传 placeholder、class、@click。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "输入框有「搜」吗？点盒子次数会加吗？",
        choices: [
          { id: "both", label: "有提示词，点盒子 +1", correct: false, why: "自动贴关了，又没绑。" },
          { id: "none", label: "没有提示词，点了也不 +1，盒子也不发光", correct: true, why: "和 Field 那一课同一张图。换了名字。" },
          { id: "err", label: "报错", correct: false, why: "能跑。静默无效。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore, "src/Search.vue": searchOff },
        blocks: [{ id: "search", label: "换场景：搜索条" }],
        narration: "Field 换成 Search。问的仍是：关掉之后有没有自己绑。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "0" }],
        dom: [{ id: "input", label: "input", value: "没有提示词" }],
        events: [],
      },
      nodes: [
        { id: "attrs", kind: "script", label: "$attrs" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "attrs", to: "dom" }],
      ablations: [
        {
          id: "bind",
          prompt: "绑到 input 之后？",
          files: { "src/App.vue": transferBefore, "src/Search.vue": searchBind },
          expected: {
            kind: "stale",
            message: "这是修复：有「搜」、绿框在输入框、点输入框才 +1。",
          },
          lesson: "下一课：父还想调用子的方法。script setup 默认不暴露任何东西。",
        },
      ],
      explanation: {
        headline: "表单外壳和控件不是同一个节点",
        body: "关掉自动贴，再绑到控件。World 11 还剩一扇门：父手里的 ref 能调用什么。",
      },
      faqs: [
        { q: "class 为什么要给 input？", a: "焦点环、校验红框通常在控件上。盒子发光常常是贴错人。" },
      ],
      tryThis: "先确认没有提示词、点盒子次数不变。再打开修复：必须有「搜」，点输入框次数才加。",
      mapping: [
        { code: "inheritAttrs: false", runtime: "停手", ui: "哪都不贴" },
        { code: "v-bind=\"$attrs\"", runtime: "选 input", ui: "提示词和点击都对" },
      ],
    },
  ],
};
