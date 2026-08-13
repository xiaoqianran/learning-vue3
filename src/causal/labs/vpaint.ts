import type { CausalLab, CounterfactualWorld } from "../types";

const applyAll = `function paint(el, binding) {
  el.style.color = ''
  el.style.background = ''
  el.style.outline = ''
  const c = binding.value
  if (binding.modifiers.bg) el.style.background = c
  else if (binding.arg === 'border') el.style.outline = '3px solid ' + c
  else el.style.color = c
}
`;

const vMounted = `${applyAll}
const vPaint = {
  mounted(el, binding) { paint(el, binding) },
}
`;

const vBoth = `${applyAll}
const vPaint = {
  mounted(el, binding) { paint(el, binding) },
  updated(el, binding) { paint(el, binding) },
}
`;

const color = `<script setup>
${vMounted}
</script>
<template>
  <p class="card" v-paint="'#a6e3a1'">这行字</p>
  <p class="hint">默认碰的是 color</p>
</template>
`;

const border = `<script setup>
${vMounted}
</script>
<template>
  <p class="card" v-paint:border="'#a6e3a1'">这行字</p>
  <p class="hint">arg = border</p>
</template>
`;

const bg = `<script setup>
${vMounted}
</script>
<template>
  <p class="card" v-paint.bg="'#a6e3a1'">这行字</p>
  <p class="hint">modifiers.bg = true</p>
</template>
`;

const unknown = `<script setup>
${vMounted}
</script>
<template>
  <p class="card" v-paint:shadow="'#a6e3a1'">这行字</p>
  <p class="hint">arg = shadow，代码没认</p>
</template>
`;

const switchBoth = `<script setup>
import { ref } from 'vue'
${vBoth}
const c = ref('#a6e3a1')
</script>
<template>
  <p class="card" v-paint="c">这行字</p>
  <button @click="c = '#a6e3a1'">绿</button>
  <button @click="c = '#f38ba8'">粉</button>
  <p class="hint">{{ c }}</p>
</template>
`;

const switchMounted = `<script setup>
import { ref } from 'vue'
${vMounted}
const c = ref('#a6e3a1')
</script>
<template>
  <p class="card" v-paint="c">这行字</p>
  <button @click="c = '#a6e3a1'">绿</button>
  <button @click="c = '#f38ba8'">粉</button>
  <p class="hint">{{ c }}</p>
</template>
`;

const transferBefore = `<script setup>
const vPaint = {
  mounted(el, binding) {
    el.style.color = binding.value
  },
}
</script>
<template>
  <p class="card" v-paint:border="'#f38ba8'">售价 36</p>
</template>
`;

const transferFixed = `<script setup>
function paint(el, binding) {
  el.style.color = ''
  el.style.outline = ''
  if (binding.arg === 'border') el.style.outline = '3px solid ' + binding.value
  else el.style.color = binding.value
}
const vPaint = {
  mounted(el, binding) { paint(el, binding) },
}
</script>
<template>
  <p class="card" v-paint:border="'#f38ba8'">售价 36</p>
</template>
`;

const worldColor: CounterfactualWorld = {
  id: "color",
  name: "默认碰文字",
  tagline: "v-paint=\"'#a6e3a1'\"",
  files: { "src/App.vue": color },
  nodes: [
    { id: "val", kind: "script", label: "value" },
    { id: "dom", kind: "dom", label: "字是绿的" },
  ],
  edges: [{ from: "val", to: "dom", label: "color" }],
  note: "没写参数，走默认分支：el.style.color。",
};

const worldBorder: CounterfactualWorld = {
  id: "border",
  name: "参数是 border",
  tagline: "v-paint:border",
  files: { "src/App.vue": border },
  nodes: [
    { id: "arg", kind: "script", label: "arg" },
    { id: "dom", kind: "dom", label: "绿描边" },
  ],
  edges: [{ from: "arg", to: "dom", label: "outline" }],
  note: "同一份值，参数换了，碰的 CSS 字段就换了。",
};

export const VPAINT_LAB: CausalLab = {
  id: "vpaint",
  world: 12,
  concept: "directive args",
  title: "同一份指令，参数换轨道",
  subtitle: "binding.value 是值。binding.arg 是冒号后面。binding.modifiers 是点后面。",
  promise:
    "一镜一条边：先默认改文字颜色，再 :border 改描边，再 .bg 改背景，再认不出的 arg 落到默认，再值变了要 updated，再没有 updated 颜色粘住。",
  minutes: 16,
  official: "/guide/reusability/custom-directives.html#directive-hooks",
  scenes: [
    {
      id: "vpaint-s0",
      tick: "S0",
      title: "默认碰的是文字颜色",
      goal: "v-paint=\"'#a6e3a1'\"。paint 里 el.style.color = value。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": color },
        blocks: [{ id: "color", label: "① 默认 color" }],
        narration: "上一课碰的是聚焦。这一课碰的是样式。先看没写参数的脸。",
      },
      observe: {
        state: [{ id: "v", label: "value", value: "#a6e3a1" }],
        dom: [{ id: "card", label: ".card", value: "字是绿的" }],
        events: [],
      },
      nodes: [
        { id: "val", kind: "script", label: "binding.value" },
        { id: "dom", kind: "dom", label: "color" },
      ],
      edges: [{ from: "val", to: "dom" }],
      explanation: {
        headline: "值是颜料，默认轨道是 color",
        body: "下一镜只加 :border。值不变，轨道变。",
      },
      tryThis: "卡片上的字必须是绿色。背景仍是深色，没有描边。",
      faqs: [
        { q: "为什么不用 CSS class？", a: "能用 class 就用 class。指令适合「值来自脚本、还要碰 DOM API」的那一层。" },
      ],
    },
    {
      id: "vpaint-s1",
      tick: "S1",
      title: "冒号后面是参数",
      goal: "v-paint:border=\"'#a6e3a1'\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "值还是那团绿。卡片会？",
        choices: [
          { id: "outline", label: "字恢复原色，出现绿描边", correct: true, why: "arg === 'border' 走 outline 分支。color 被清空。" },
          { id: "both", label: "字也绿，描边也绿", correct: false, why: "paint 先清空再走一条轨道。" },
          { id: "text", label: "仍只是字绿。参数只是注释", correct: false, why: "binding.arg 就是冒号后面那个词。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": border },
        blocks: [{ id: "arg", label: "② :border" }],
        narration: "值一行没改。只多了 :border。",
      },
      counterfactual: {
        id: "arg-vs-default",
        title: "默认 vs border",
        setup: "同一团绿。差在有没有 :border。",
        worlds: [worldColor, worldBorder],
        punchline: "参数不是第二种值。它是同一份指令里的另一条轨道。",
      },
      observe: {
        state: [{ id: "a", label: "arg", value: "border" }],
        dom: [{ id: "card", label: ".card", value: "绿描边" }],
        events: [],
      },
      nodes: [
        { id: "arg", kind: "script", label: "binding.arg" },
        { id: "dom", kind: "dom", label: "outline" },
      ],
      edges: [{ from: "arg", to: "dom" }],
      explanation: {
        headline: "v-paint:border 的 border 是 arg",
        body: "和 v-slot:header、v-on:click 同一份语法。下一镜换成点号：修饰符。",
      },
      faqs: [
        { q: "arg 可以动态吗？", a: "可以。[arg] 动态参数。这一课先用写死的 border。" },
      ],
      tryThis: "字必须不是绿的。卡片周围必须有绿描边。打开反事实。",
      mapping: [{ code: "v-paint:border", runtime: "binding.arg === 'border'", ui: "描边" }],
    },
    {
      id: "vpaint-s2",
      tick: "S2",
      title: "点后面是修饰符",
      goal: "v-paint.bg=\"'#a6e3a1'\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "没有 arg，有 .bg。卡片会？",
        choices: [
          { id: "bg", label: "背景变绿，字恢复原色", correct: true, why: "modifiers.bg 优先。背景是另一条轨道。" },
          { id: "text", label: "字绿。点号只是好看", correct: false, why: "binding.modifiers.bg === true。" },
          { id: "border", label: "变成描边。bg 是 border 的别名", correct: false, why: "代码里 .bg 走 background。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": bg },
        blocks: [{ id: "mod", label: "③ .bg" }],
        narration: "冒号换成点。名单从 arg 换成 modifiers。",
      },
      observe: {
        state: [{ id: "m", label: "modifiers.bg", value: "true" }],
        dom: [{ id: "card", label: ".card", value: "绿背景" }],
        events: [],
      },
      nodes: [
        { id: "mod", kind: "script", label: "modifiers.bg" },
        { id: "dom", kind: "dom", label: "background" },
      ],
      edges: [{ from: "mod", to: "dom" }],
      explanation: {
        headline: "修饰符是一面旗",
        body: "和组件 v-model.trim 同一类旗。指令自己读 binding.modifiers。下一镜写一个代码不认的参数。",
      },
      faqs: [
        { q: "可以 .bg.border 一起写吗？", a: "能写。要你在 paint 里决定优先级。这一镜 if/else 让 .bg 先于 :border。" },
      ],
      tryThis: "卡片背景必须是绿的。字不是绿的，也没有描边。",
      mapping: [{ code: "v-paint.bg", runtime: "modifiers.bg", ui: "背景" }],
    },
    {
      id: "vpaint-s3",
      tick: "S3",
      title: "认不出的参数，掉回默认",
      goal: "v-paint:shadow。paint 不认识 shadow。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "arg 是 shadow。卡片会？",
        choices: [
          { id: "text", label: "字变绿。else 走默认 color", correct: true, why: "不是 bg，也不是 border，落到 else。" },
          { id: "none", label: "什么都不碰。未知参数会被忽略", correct: false, why: "你的 else 把未知当默认。" },
          { id: "err", label: "报错：没有 shadow 轨道", correct: false, why: "不会报错。静默走 else。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": unknown },
        blocks: [{ id: "unk", label: "④ :shadow" }],
        narration: "看起来像第三条轨道。代码里没有它。",
      },
      observe: {
        state: [{ id: "a", label: "arg", value: "shadow" }],
        dom: [{ id: "card", label: ".card", value: "字是绿的" }],
        events: [],
      },
      nodes: [
        { id: "arg", kind: "script", label: "shadow" },
        { id: "dom", kind: "dom", label: "color（默认）" },
      ],
      edges: [{ from: "arg", to: "dom", label: "掉回 else" }],
      explanation: {
        headline: "未知参数不会自己报错",
        body: "和 emit('plus') 没人听同一类静默。下一镜值会变：绿换成粉。要 updated 才再跑 paint。",
      },
      faqs: [
        { q: "怎么让未知参数什么都不做？", a: "else 改成空。或者先白名单校验。这一镜故意用 else 露出掉回去的脸。" },
      ],
      tryThis: "字必须是绿的。没有描边，背景不是绿的。hint 写着 arg = shadow。",
      mapping: [{ code: "v-paint:shadow", runtime: "arg 不在分支里", ui: "默认文字绿" }],
    },
    {
      id: "vpaint-s4",
      tick: "S4",
      title: "值变了，updated 再涂一次",
      goal: "c 在绿/粉之间切。vPaint 有 updated。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「粉」。字会？",
        choices: [
          { id: "pink", label: "变成粉。updated 用新 value 再跑 paint", correct: true, why: "和 v-focus 换人同一张图，碰的是颜色。" },
          { id: "green", label: "仍是绿。mounted 只涂一次", correct: false, why: "这一镜写了 updated。" },
          { id: "both", label: "绿粉叠在一起", correct: false, why: "paint 先清空再涂。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": switchBoth },
        blocks: [{ id: "upd", label: "⑤ updated 再涂" }],
        narration: "轨道仍是默认 color。变的是 value。",
      },
      observe: {
        state: [{ id: "c", label: "c", value: "#f38ba8" }],
        dom: [{ id: "card", label: ".card", value: "字是粉的" }],
        events: [],
      },
      nodes: [
        { id: "c", kind: "ref", label: "c" },
        { id: "upd", kind: "effect", label: "updated" },
        { id: "dom", kind: "dom", label: "color" },
      ],
      edges: [
        { from: "c", to: "upd" },
        { from: "upd", to: "dom" },
      ],
      explanation: {
        headline: "颜料换了，要再碰一次",
        body: "下一镜删掉 updated。按钮会改 hint 里的色值，字却粘在绿色。",
      },
      faqs: [
        { q: "为什么 paint 开头要清空？", a: "从 :border 切回默认时，描边不会自己消失。先擦再画，轨道才干净。" },
      ],
      tryThis: "点粉，字必须变粉。点绿，变回绿。",
      mapping: [{ code: "updated + paint", runtime: "新 value", ui: "字换色" }],
    },
    {
      id: "vpaint-s5",
      tick: "S5",
      title: "没有 updated，颜色粘住",
      goal: "同一套按钮。vPaint 只剩 mounted。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点「粉」。hint 已经是粉的色值。字会？",
        choices: [
          { id: "stick", label: "仍是绿。DOM 样式没人再涂", correct: true, why: "和绿框粘在甲上同一条缝。" },
          { id: "pink", label: "跟着变粉。style 绑了响应式", correct: false, why: "el.style 是命令式的。没人再跑，就停在那。" },
          { id: "err", label: "报错", correct: false, why: "能跑。句子骗人。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": switchMounted },
        blocks: [{ id: "stuck", label: "⑥ 只有 mounted" }],
        narration: "hint 会变，因为那是 Vue 的文本绑定。字的颜色是指令涂的。",
      },
      observe: {
        state: [{ id: "c", label: "c", value: "粉（字仍绿）" }],
        dom: [{ id: "card", label: ".card", value: "字仍绿" }],
        events: [],
      },
      nodes: [
        { id: "c", kind: "ref", label: "c" },
        { id: "dom", kind: "dom", label: "粘住的绿" },
      ],
      edges: [{ from: "c", to: "dom", label: "没再涂" }],
      explanation: {
        headline: "命令式 DOM 不会自己对账",
        body: ":style 是声明式，值变了 Vue 会改。el.style.color = 是你亲手涂的，要自己再涂。下一镜拆三种轨道和粘住。",
      },
      faqs: [
        { q: "那为什么还用指令改样式？", a: "教学用颜色当指纹。真项目里能 :class / :style 解决的，别写指令。" },
      ],
      tryThis: "点粉。hint 必须变色值，字必须仍绿。",
      mapping: [{ code: "只有 mounted", runtime: "style 停在第一次", ui: "字粘绿" }],
    },
    {
      id: "vpaint-s6",
      tick: "S6",
      title: "拆成描边 / 背景 / 粘住",
      goal: "三种对照：:border、.bg、没有 updated。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到会换色的世界。点粉会？",
        choices: [
          { id: "pink", label: "字变粉", correct: true, why: "先确认好的脸。" },
          { id: "stick", label: "粘绿", correct: false, why: "那是没有 updated。" },
          { id: "bg", label: "背景变粉", correct: false, why: "那是 .bg。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": switchBoth },
        blocks: [{ id: "keep", label: "会换色的版本先留着" }],
        narration: "先点粉确认字会换。再分别：描边、背景、粘住。",
      },
      observe: {
        state: [{ id: "ok", label: "c", value: "能换" }],
        dom: [{ id: "card", label: ".card", value: "字换色" }],
        events: [],
      },
      nodes: [
        { id: "paint", kind: "effect", label: "paint" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "paint", to: "dom" }],
      ablations: [
        {
          id: "border",
          prompt: "如果改成 :border？",
          files: { "src/App.vue": border },
          expected: { kind: "stale", message: "绿描边。字不是绿的。" },
          lesson: "arg 换轨道。",
        },
        {
          id: "bg",
          prompt: "如果改成 .bg？",
          files: { "src/App.vue": bg },
          expected: { kind: "stale", message: "绿背景。" },
          lesson: "修饰符是旗。",
        },
        {
          id: "stuck",
          prompt: "如果只留 mounted？",
          files: { "src/App.vue": switchMounted },
          expected: { kind: "stale", message: "点粉，字仍绿。hint 已经是粉色值。" },
          lesson: "命令式涂色要 updated。",
        },
      ],
      explanation: {
        headline: "轨道、旗、再涂一次",
        body: "下一课指令会在 document 上挂监听。节点卸掉时，监听必须摘掉。",
      },
      tryThis: "三种消融：描边、背景、粘绿。对上号再恢复换色。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先 arg，再修饰符，再粘住。前两张是轨道，第三张是寿命。" },
      ],
    },
    {
      id: "vpaint-s7",
      tick: "S7",
      title: "换：售价描边",
      goal: "v-paint:border，但 mounted 只写了 el.style.color。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "父要描边。指令却只涂 color。卡片会？",
        choices: [
          { id: "text", label: "字变粉。参数被忽略", correct: true, why: "和 :shadow 掉回默认同一张图。代码根本没读 arg。" },
          { id: "border", label: "粉描边。写了 :border 就会描", correct: false, why: "参数不会自己生效。" },
          { id: "err", label: "报错：实现了 color 就不能写 border", correct: false, why: "能跑。轨道没接上。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "price", label: "换场景：售价" }],
        narration: "颜色换成售价。问的仍是：arg 有没有人读。",
      },
      observe: {
        state: [{ id: "a", label: "arg", value: "border（没人读）" }],
        dom: [{ id: "card", label: ".card", value: "字是粉的" }],
        events: [],
      },
      nodes: [
        { id: "arg", kind: "script", label: ":border" },
        { id: "dom", kind: "dom", label: "color" },
      ],
      edges: [{ from: "arg", to: "dom", label: "没接上" }],
      ablations: [
        {
          id: "fix",
          prompt: "paint 里认 arg === 'border' 之后？",
          files: { "src/App.vue": transferFixed },
          expected: {
            kind: "stale",
            message: "这是修复：粉描边，字不是粉的。",
          },
          lesson: "下一课：监听挂在 document 上时，节点卸掉必须把监听摘掉。",
        },
      ],
      explanation: {
        headline: "参数只是一张字条",
        body: "你不读 binding.arg，它就只是模板上的装饰。和组件修饰符那面旗一样。",
      },
      faqs: [
        { q: "售价不该用指令吧？", a: "对。真项目用 class。这里用描边当你能看见的轨道。" },
      ],
      tryThis: "先看字是粉的、没有描边。再打开修复：必须是粉描边。",
      mapping: [
        { code: "只涂 color", runtime: "arg 被忽略", ui: "字粉" },
        { code: "认 border", runtime: "换轨道", ui: "描边" },
      ],
    },
  ],
};
