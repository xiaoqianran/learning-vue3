import type { CausalLab, CounterfactualWorld } from "../types";

const vMounted = `const vFocus = {
  mounted(el, binding) {
    if (binding.value === false) return
    el.classList.add('on')
    el.focus()
  },
}
`;

const vBoth = `const vFocus = {
  mounted(el, binding) {
    if (binding.value === false) return
    el.classList.add('on')
    el.focus()
  },
  updated(el, binding) {
    if (binding.value) {
      el.classList.add('on')
      el.focus()
    } else {
      el.classList.remove('on')
    }
  },
}
`;

const none = `<script setup>
</script>
<template>
  <p class="card">没有指令</p>
  <p class="hint">绿框 = 指令碰到了这个节点</p>
  <input placeholder="甲" />
  <input placeholder="乙" />
</template>
`;

const oneMounted = `<script setup>
${vMounted}
</script>
<template>
  <p class="card">v-focus 在甲上</p>
  <p class="hint">绿框 = 指令碰到了这个节点</p>
  <input v-focus placeholder="甲" />
  <input placeholder="乙" />
</template>
`;

const vIf = `<script setup>
import { ref } from 'vue'
${vMounted}
const show = ref(false)
</script>
<template>
  <p class="card">先关着，再打开</p>
  <button @click="show = !show">{{ show ? '关掉' : '打开' }}</button>
  <input v-if="show" v-focus placeholder="甲" />
</template>
`;

const switchBoth = `<script setup>
import { ref } from 'vue'
${vBoth}
const who = ref('甲')
</script>
<template>
  <p class="card">当前 {{ who }}</p>
  <button @click="who = '甲'">甲</button>
  <button @click="who = '乙'">乙</button>
  <input v-focus="who === '甲'" placeholder="甲" />
  <input v-focus="who === '乙'" placeholder="乙" />
</template>
`;

const switchMountedOnly = `<script setup>
import { ref } from 'vue'
${vMounted}
const who = ref('甲')
</script>
<template>
  <p class="card">当前 {{ who }}</p>
  <button @click="who = '甲'">甲</button>
  <button @click="who = '乙'">乙</button>
  <input v-focus="who === '甲'" placeholder="甲" />
  <input v-focus="who === '乙'" placeholder="乙" />
</template>
`;

const skipFalse = `<script setup>
${vMounted}
</script>
<template>
  <p class="card">v-focus="false"</p>
  <input v-focus="false" placeholder="甲" />
  <input v-focus placeholder="乙" />
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const q = ref('')
</script>
<template>
  <p class="card">搜索 {{ q || '（空）' }}</p>
  <input v-model="q" placeholder="搜名字" />
</template>
`;

const transferFocus = `<script setup>
import { ref } from 'vue'
const vFocus = {
  mounted(el) {
    el.classList.add('on')
    el.focus()
  },
}
const q = ref('')
</script>
<template>
  <p class="card">搜索 {{ q || '（空）' }}</p>
  <input v-focus v-model="q" placeholder="搜名字" />
</template>
`;

const worldNone: CounterfactualWorld = {
  id: "none",
  name: "没有指令",
  tagline: "两个普通 input",
  files: { "src/App.vue": none },
  nodes: [
    { id: "a", kind: "dom", label: "甲" },
    { id: "b", kind: "dom", label: "乙" },
  ],
  edges: [{ from: "a", to: "b", label: "都没绿框" }],
  note: "指令不在，节点就是普通输入框。",
};

const worldOne: CounterfactualWorld = {
  id: "one",
  name: "mounted 里碰到甲",
  tagline: "v-focus 在甲上",
  files: { "src/App.vue": oneMounted },
  nodes: [
    { id: "dir", kind: "script", label: "mounted" },
    { id: "a", kind: "dom", label: "甲 绿框" },
  ],
  edges: [{ from: "dir", to: "a" }],
  note: "指令拿到的是那颗 DOM 节点。组件边界已经走完，现在是节点本身。",
};

export const VFOCUS_LAB: CausalLab = {
  id: "vfocus",
  world: 12,
  concept: "custom directives",
  title: "指令碰到了那颗节点",
  subtitle: "自定义指令拿到的是 DOM。mounted 时碰到一次。值变了，要靠 updated 再碰。",
  promise:
    "一镜一条边：先没有指令都无绿框，再 mounted 只碰甲，再 v-if 挂载才碰，再 updated 能换人，再没有 updated 绿框粘住，再 false 跳过。",
  minutes: 16,
  official: "/guide/reusability/custom-directives.html",
  scenes: [
    {
      id: "vfocus-s0",
      tick: "S0",
      title: "没有指令，都没有绿框",
      goal: "两个普通 input。没有 v-focus。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": none },
        blocks: [{ id: "none", label: "① 普通输入框" }],
        narration: "World 11 的父调用子 focus()。这一课不再经过组件实例：指令直接拿到 DOM。先看没有指令的脸。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "没有绿框" },
          { id: "b", label: "乙", value: "没有绿框" },
        ],
        events: [],
      },
      nodes: [
        { id: "a", kind: "dom", label: "甲" },
        { id: "b", kind: "dom", label: "乙" },
      ],
      edges: [{ from: "a", to: "b" }],
      explanation: {
        headline: "绿框是指令的指纹",
        body: "后面每一镜用 class=\"on\" 表示「这颗节点被指令碰到了」。没有指令，就没有指纹。下一镜只在甲上写 v-focus。",
      },
      tryThis: "甲和乙都必须没有绿框。点一下输入框才可能有浏览器自己的焦点环，那不是指令。",
      faqs: [
        { q: "为什么不用光标当证据？", a: "预览在 iframe 里，浏览器常常不让自动 focus。绿框是指令自己画的，靠得住。" },
      ],
    },
    {
      id: "vfocus-s1",
      tick: "S1",
      title: "mounted 碰到甲",
      goal: "const vFocus = { mounted(el) { el.classList.add('on') } }。甲上 v-focus。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开页面。谁会有绿框？",
        choices: [
          { id: "a", label: "只有甲。指令绑在谁身上就碰谁", correct: true, why: "mounted 的第一个参数是那颗 DOM 节点。" },
          { id: "both", label: "甲和乙。指令是全局的", correct: false, why: "局部 vFocus 只作用于写了 v-focus 的节点。" },
          { id: "none", label: "都没有。还要父来调用 focus", correct: false, why: "指令自己碰 DOM。不经过 defineExpose。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": oneMounted },
        blocks: [{ id: "mount", label: "② mounted 碰甲" }],
        narration: "script setup 里叫 vFocus，模板里写 v-focus。约定：v + 大写。",
      },
      counterfactual: {
        id: "dir-or-not",
        title: "有没有指令",
        setup: "两个输入框。差在甲上有没有 v-focus。",
        worlds: [worldNone, worldOne],
        punchline: "指令不是组件。它没有实例，只有钩子和那颗节点。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "绿框" },
          { id: "b", label: "乙", value: "没有" },
        ],
        events: [],
      },
      nodes: [
        { id: "hook", kind: "effect", label: "mounted", symbol: "mounted" },
        { id: "a", kind: "dom", label: "甲" },
      ],
      edges: [{ from: "hook", to: "a" }],
      explanation: {
        headline: "钩子的第一个参数就是节点",
        body: "el.classList、el.focus()，都是 DOM API。下一镜先把甲藏起来：没有挂载，就没有 mounted。",
      },
      faqs: [
        { q: "为什么不用 app.directive？", a: "教学里局部指令更短。全局注册是同一份对象，只是挂在 app 上。" },
      ],
      tryThis: "甲必须有绿框。乙必须没有。打开反事实。",
      mapping: [{ code: "mounted(el)", runtime: "节点进文档之后", ui: "甲发光" }],
    },
    {
      id: "vfocus-s2",
      tick: "S2",
      title: "没挂载，就没有 mounted",
      goal: "v-if=\"show\"。开始是 false。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开页面时，输入框会？点打开之后会？",
        choices: [
          { id: "late", label: "开始没有节点。点打开才出现并发光", correct: true, why: "v-if 为 false 时节点不在。打开那一刻才 mounted。" },
          { id: "now", label: "一打开页面就发光。指令会提前跑", correct: false, why: "没有节点，钩子无处可跑。" },
          { id: "never", label: "v-if 和指令不能一起用", correct: false, why: "很常见：弹层打开才聚焦。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": vIf },
        blocks: [{ id: "vif", label: "③ v-if 控制挂载" }],
        narration: "指令还是那份 mounted。变的是节点什么时候存在。",
      },
      observe: {
        state: [{ id: "s", label: "show", value: "false → true" }],
        dom: [{ id: "a", label: "input", value: "打开后才有绿框" }],
        events: [],
      },
      nodes: [
        { id: "vif", kind: "script", label: "v-if" },
        { id: "hook", kind: "effect", label: "mounted" },
        { id: "dom", kind: "dom", label: "甲" },
      ],
      edges: [
        { from: "vif", to: "hook", label: "出现" },
        { from: "hook", to: "dom" },
      ],
      explanation: {
        headline: "指令的寿命跟着节点",
        body: "关掉再打开，会再跑一次 mounted。下一镜节点一直在，变的是指令的值。",
      },
      faqs: [
        { q: "v-show 呢？", a: "v-show 不卸节点，mounted 只跑一次。显示/隐藏不会再聚焦，除非你写 updated。" },
      ],
      tryThis: "打开页面必须看不到输入框。点打开，必须出现并且有绿框。关掉再开，再发光一次。",
      mapping: [{ code: "v-if + v-focus", runtime: "出现才 mounted", ui: "打开才绿框" }],
    },
    {
      id: "vfocus-s3",
      tick: "S3",
      title: "值变了，updated 再碰一次",
      goal: "两个输入框。v-focus=\"who === '甲'\"。有 updated。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点乙。绿框会？",
        choices: [
          { id: "move", label: "从甲移到乙。updated 会摘掉再戴上", correct: true, why: "值变成 false 的那个 remove。变成 true 的那个 add。" },
          { id: "both", label: "两个都亮。mounted 不会撤销", correct: false, why: "这一镜写了 updated。" },
          { id: "stay", label: "仍在甲。指令只在 mounted 跑", correct: false, why: "那是下一镜。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": switchBoth },
        blocks: [{ id: "upd", label: "④ mounted + updated" }],
        narration: "节点一直在。指令的值在 true/false 之间切。",
      },
      observe: {
        state: [{ id: "w", label: "who", value: "甲 → 乙" }],
        dom: [{ id: "b", label: "乙", value: "绿框" }],
        events: [],
      },
      nodes: [
        { id: "val", kind: "ref", label: "who" },
        { id: "upd", kind: "effect", label: "updated" },
        { id: "dom", kind: "dom", label: "乙" },
      ],
      edges: [
        { from: "val", to: "upd" },
        { from: "upd", to: "dom" },
      ],
      explanation: {
        headline: "updated 是值变化的钩子",
        body: "和组件 updated 一样：节点还在，绑定变了。下一镜删掉 updated，看绿框粘住。",
      },
      faqs: [
        { q: "binding.value 是什么？", a: "v-focus=\"who === '甲'\" 里那份布尔值。没写等号的 v-focus 相当于 true。" },
      ],
      tryThis: "开始甲必须亮。点乙，必须只有乙亮。再点甲，绿框回来。",
      mapping: [{ code: "updated(el, binding)", runtime: "值变了再跑", ui: "绿框换人" }],
    },
    {
      id: "vfocus-s4",
      tick: "S4",
      title: "没有 updated，绿框粘住",
      goal: "同一套切换。vFocus 只剩 mounted。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点乙。绿框会？",
        choices: [
          { id: "stick", label: "甲仍亮，乙不亮。值变了没人再碰节点", correct: true, why: "乙 mounted 时 who 是甲，binding.value 是 false，跳过了。后来变 true 也没 updated。" },
          { id: "move", label: "仍会换到乙。Vue 会自动补 updated", correct: false, why: "钩子要自己写。" },
          { id: "both", label: "两个都亮", correct: false, why: "乙从来没被碰到。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": switchMountedOnly },
        blocks: [{ id: "stuck", label: "⑤ 只有 mounted" }],
        narration: "按钮和模板没改。只删了 updated。",
      },
      observe: {
        state: [{ id: "w", label: "who", value: "乙（画面仍是甲）" }],
        dom: [{ id: "a", label: "甲", value: "绿框粘住" }],
        events: [],
      },
      nodes: [
        { id: "val", kind: "ref", label: "who" },
        { id: "a", kind: "dom", label: "甲 粘住" },
      ],
      edges: [{ from: "val", to: "a", label: "没人听" }],
      explanation: {
        headline: "mounted 只跑一次",
        body: "和 shallowRef 内部突变同一类冻脸：值变了，订阅那一层不在。下一镜 mounted 时值就是 false，连第一次都不碰。",
      },
      faqs: [
        { q: "为什么乙不亮？", a: "乙挂载时 who 是甲，v-focus=\"false\" 被 if 跳过。之后没有 updated 再给一次机会。" },
      ],
      tryThis: "开始甲亮。点乙，甲必须仍亮，乙必须不亮。卡片已经写着乙。",
      mapping: [{ code: "只有 mounted", runtime: "值变了不跑", ui: "绿框粘在甲" }],
    },
    {
      id: "vfocus-s5",
      tick: "S5",
      title: "false 连第一次也不碰",
      goal: "甲 v-focus=\"false\"。乙 v-focus。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开页面。谁亮？",
        choices: [
          { id: "b", label: "只有乙。false 被跳过", correct: true, why: "mounted 里 if (binding.value === false) return。" },
          { id: "a", label: "甲也亮。写了 v-focus 就会碰", correct: false, why: "有值的时候，值说了算。" },
          { id: "none", label: "都不亮。false 会关掉整份指令", correct: false, why: "两份指令互不影响。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": skipFalse },
        blocks: [{ id: "false", label: "⑥ v-focus=\"false\"" }],
        narration: "乙仍是裸 v-focus（相当于 true）。甲明确拒绝。",
      },
      observe: {
        state: [],
        dom: [
          { id: "a", label: "甲", value: "没有绿框" },
          { id: "b", label: "乙", value: "绿框" },
        ],
        events: [],
      },
      nodes: [
        { id: "f", kind: "script", label: "false" },
        { id: "a", kind: "dom", label: "甲" },
        { id: "b", kind: "dom", label: "乙" },
      ],
      edges: [
        { from: "f", to: "a", label: "跳过" },
        { from: "b", to: "a", label: "乙被碰到" },
      ],
      explanation: {
        headline: "值可以拒绝这一次",
        body: "下一镜拆三种死法：没有指令、只有 mounted 粘住、false 跳过。",
      },
      faqs: [
        { q: "v-focus=\"0\" 呢？", a: "0 是 falsy。取决于你怎么写 if。这一镜用 === false，0 仍会碰。自己改改看。" },
      ],
      tryThis: "甲必须没有绿框。乙必须有。",
      mapping: [{ code: "v-focus=\"false\"", runtime: "mounted 直接 return", ui: "甲不亮" }],
    },
    {
      id: "vfocus-s6",
      tick: "S6",
      title: "拆成没有 / 粘住 / 能换人",
      goal: "三种对照：无指令、只有 mounted、有 updated。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到有 updated 的切换。点乙会？",
        choices: [
          { id: "move", label: "绿框到乙", correct: true, why: "先确认好的脸。" },
          { id: "stick", label: "粘在甲", correct: false, why: "那是没有 updated。" },
          { id: "none", label: "都没有", correct: false, why: "那是没有指令。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": switchBoth },
        blocks: [{ id: "keep", label: "能换人的版本先留着" }],
        narration: "先点乙确认换人。再分别：没有指令、只有 mounted、false 跳过。",
      },
      observe: {
        state: [{ id: "ok", label: "who", value: "能换人" }],
        dom: [{ id: "b", label: "乙", value: "绿框" }],
        events: [],
      },
      nodes: [
        { id: "upd", kind: "effect", label: "updated" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "upd", to: "dom" }],
      ablations: [
        {
          id: "none",
          prompt: "如果去掉指令？",
          files: { "src/App.vue": none },
          expected: { kind: "stale", message: "两个都没有绿框。" },
          lesson: "指纹来自钩子，不是来自 input。",
        },
        {
          id: "stuck",
          prompt: "如果只留 mounted？",
          files: { "src/App.vue": switchMountedOnly },
          expected: { kind: "stale", message: "点乙，绿框粘在甲。乙从未被碰到。" },
          lesson: "值变了要 updated。",
        },
        {
          id: "false",
          prompt: "如果甲是 v-focus=\"false\"？",
          files: { "src/App.vue": skipFalse },
          expected: { kind: "stale", message: "甲跳过，乙发光。" },
          lesson: "值可以拒绝。",
        },
      ],
      explanation: {
        headline: "碰到、粘住、拒绝",
        body: "下一课指令还有参数和修饰符：v-paint:border.bg。同一份钩子，binding.arg / modifiers 不同。",
      },
      tryThis: "三种消融：都无绿框、粘在甲、甲跳过乙亮。对上号再恢复换人。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先去掉，再粘住，再 false。一次比一次更像「写了却没碰对」。" },
      ],
    },
    {
      id: "vfocus-s7",
      tick: "S7",
      title: "换：搜索框",
      goal: "搜索 input 没有 v-focus。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "打开页面。搜索框会？",
        choices: [
          { id: "on", label: "有绿框。搜索框总会自动聚焦", correct: false, why: "没有指令就没有指纹。" },
          { id: "off", label: "没有绿框。和甲乙那一课同一张图", correct: true, why: "换了场景，边还是「钩子碰到节点」。" },
          { id: "err", label: "报错", correct: false, why: "能跑。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "q", label: "换场景：搜索" }],
        narration: "甲换成搜索。问的仍是：有没有钩子去碰这颗节点。",
      },
      observe: {
        state: [],
        dom: [{ id: "q", label: "input", value: "没有绿框" }],
        events: [],
      },
      nodes: [
        { id: "none", kind: "script", label: "没有 v-focus" },
        { id: "q", kind: "dom", label: "搜索框" },
      ],
      edges: [{ from: "none", to: "q" }],
      ablations: [
        {
          id: "fix",
          prompt: "加上 v-focus 之后？",
          files: { "src/App.vue": transferFocus },
          expected: {
            kind: "stale",
            message: "这是修复：搜索框有绿框。指令碰到了它。",
          },
          lesson: "下一课：同一份指令，参数和修饰符决定碰的是颜色、边框还是背景。",
        },
      ],
      explanation: {
        headline: "指令是 DOM 级的复用",
        body: "组件复用的是模板和状态。指令复用的是碰到节点的那几行。下一课给碰的方式起名字：arg 和 modifiers。",
      },
      faqs: [
        { q: "autofocus 属性不够吗？", a: "静态 HTML 可以。弹层打开、路由切进来，通常要指令或在 mounted 里 focus。" },
      ],
      tryThis: "先确认没有绿框。再打开修复：必须有绿框。",
      mapping: [
        { code: "普通 input", runtime: "没有钩子", ui: "无绿框" },
        { code: "v-focus", runtime: "mounted 碰到", ui: "绿框" },
      ],
    },
  ],
};
