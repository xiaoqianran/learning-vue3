import type { CausalLab } from "../types";

const s0 = `<template>
  <button>点击</button>
</template>
`;

const s1 = `<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button>点击</button>
</template>
`;

const s2 = `<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button>点击 {{ count }}</button>
</template>
`;

const s3 = `<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">点击 {{ count }}</button>
</template>
`;

const noLine = `<script setup>
import { ref } from 'vue'
</script>

<template>
  <button @click="count++">点击 {{ count }}</button>
</template>
`;

const plainLet = `<script setup>
let count = 0
</script>

<template>
  <button @click="count++">点击 {{ count }}</button>
</template>
`;

const transferBefore = `<script setup>
let liked = false
</script>

<template>
  <button @click="liked = !liked">
    {{ liked ? '已喜欢' : '喜欢' }}
  </button>
</template>
`;

const transferAfter = `<script setup>
import { ref } from 'vue'

const liked = ref(false)
</script>

<template>
  <button @click="liked = !liked">
    {{ liked ? '已喜欢' : '喜欢' }}
  </button>
</template>
`;

export const REF_LAB: CausalLab = {
  id: "ref",
  world: 1,
  concept: "ref",
  title: "一个按钮活起来",
  subtitle: "普通变量为什么动不了界面",
  promise: "亲眼看见：有 ref → 界面跟着变；没有 ref → 值变了界面不知道。",
  minutes: 16,
  official: "/guide/essentials/reactivity-fundamentals.html",
  scenes: [
    {
      id: "ref-s0",
      tick: "S0",
      title: "静态按钮",
      goal: "屏幕上有一个按钮。它现在什么都不会记住。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": s0 },
        blocks: [{ id: "html", label: "① 只有 HTML" }],
        narration: "这只是静态标记。没有状态，没有事件，点击不会留下痕迹。",
      },
      observe: {
        state: [],
        dom: [{ id: "btn", label: "button", value: "点击", symbol: "button" }],
        events: [],
      },
      nodes: [
        { id: "html", kind: "script", label: "template", detail: "静态标记" },
        { id: "dom", kind: "dom", label: "DOM", detail: "点击", symbol: "button" },
      ],
      edges: [{ from: "html", to: "dom", label: "首次渲染" }],
      explanation: {
        headline: "现在还没有程序状态",
        body: "按钮能显示，是因为模板被编译成了 DOM。但程序里没有任何会变化的东西。接下来我们要让它记住一个数字——一次只改一件事。",
      },
      faqs: [
        { q: "这算 Vue 程序吗？", a: "算。它已经是一个 SFC。只是还没有任何响应式数据，所以行为上和静态 HTML 一样。" },
        { q: "为什么不先讲 setup？", a: "因为你还没看见「缺了它会怎样」。先有现象，再引入机制。" },
      ],
    },
    {
      id: "ref-s1",
      tick: "S1",
      title: "加入 count",
      goal: "我想让程序记住一个数字。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "接下来加入 const count = ref(0)。你认为页面会发生什么？",
        choices: [
          { id: "show0", label: "按钮上出现数字 0", correct: false, why: "模板还没有读取 count。脚本里多一个变量，不会自动改 DOM。" },
          { id: "none", label: "页面不发生任何变化", correct: true, why: "对。状态存在了，但没有任何东西订阅它。" },
          { id: "err", label: "页面报错", correct: false, why: "合法语法，只是还没被模板用到。Vue 不会因此报错。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s1 },
        blocks: [
          { id: "import", label: "① import { ref }" },
          { id: "count", label: "② 创建 count" },
        ],
        narration: "count 已经存在于程序里。但模板还没有读取它。",
      },
      observe: {
        state: [{ id: "count", label: "count", value: "0（未被读取）", symbol: "count" }],
        dom: [{ id: "btn", label: "button", value: "点击", symbol: "button" }],
        events: [],
      },
      nodes: [
        { id: "ref", kind: "ref", label: "count", detail: "ref(0)", symbol: "count" },
        { id: "html", kind: "script", label: "template", detail: "还没读 count" },
        { id: "dom", kind: "dom", label: "DOM", detail: "点击", symbol: "button" },
      ],
      edges: [{ from: "html", to: "dom" }],
      why: {
        question: "为什么 count 已经存在，按钮却还是「点击」？",
        choices: [
          { id: "vue-slow", label: "Vue 还没来得及更新", correct: false, why: "不是时机问题。根本没有依赖被建立。" },
          { id: "no-read", label: "模板没有读取 count，所以没有依赖", correct: true, why: "响应式追踪发生在「被读取」的时候。没人读，就没人订阅。" },
          { id: "need-click", label: "必须先点一下才会显示", correct: false, why: "连点击处理都还没有。显示 0 只需要模板读它。" },
        ],
      },
      explanation: {
        headline: "状态 ≠ 界面",
        body: "ref 只是声明了一份可追踪的状态。Vue 不会因为脚本里多了一个变量就改 DOM。界面要变，必须有人读取这份状态。",
      },
      faqs: [
        { q: "为什么刚才页面没变化？", a: "因为模板还没有读取 count。响应式系统只追踪实际发生的读取。" },
        { q: ".value 呢？", a: "在 script 里读写 ref 需要 .value。这一步我们还没读写它，所以先不引入，避免一次改两件事。" },
      ],
      mapping: [
        { code: "const count = ref(0)", runtime: "count: ref → 0", ui: "（尚未出现）" },
      ],
    },
    {
      id: "ref-s2",
      tick: "S2",
      title: "模板读取",
      goal: "让界面看见这个数字。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "把按钮改成「点击 {{ count }}」后，页面会怎样？",
        choices: [
          { id: "show", label: "变成「点击 0」", correct: true, why: "模板读取 count → 建立依赖 → 首次渲染把 0 写进 DOM。" },
          { id: "same", label: "还是「点击」，数字不出现", correct: false, why: "插值会在渲染时读取 count，所以会显示 0。" },
          { id: "err", label: "报错：count 不能出现在模板里", correct: false, why: "模板里的 ref 会自动解包，不需要 .value。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s2 },
        blocks: [{ id: "read", label: "③ 模板读取 count" }],
        narration: "模板读取了 count。第一条「状态 → DOM」的边出现了。",
      },
      observe: {
        state: [{ id: "count", label: "count", value: "0", symbol: "count" }],
        dom: [{ id: "btn", label: "button", value: "点击 0", symbol: "count" }],
        events: [],
      },
      nodes: [
        { id: "ref", kind: "ref", label: "count", detail: "0", symbol: "count" },
        { id: "render", kind: "render", label: "template effect", detail: "{{ count }}" },
        { id: "dom", kind: "dom", label: "DOM", detail: "点击 0", symbol: "count" },
      ],
      edges: [
        { from: "ref", to: "render", label: "读取" },
        { from: "render", to: "dom" },
      ],
      explanation: {
        headline: "读取才会建立依赖",
        body: "渲染函数读到 count.value（模板里写成 count），Vue 记下：这份状态被这个 effect 用过。现在还不能点，因为没有事件。但「状态 → 界面」的管道已经接通。",
      },
      faqs: [
        { q: "为什么模板不需要 .value？", a: "模板会自动解包 ref。script 里是真正的 Ref 对象，所以要 .value；模板里 Vue 帮你拆开。" },
        { q: "现在点击会怎样？", a: "什么都不会发生。按钮还没有 @click。状态存在，也被读取了，但没有人去改它。" },
      ],
      mapping: [
        { code: "{{ count }}", runtime: "template effect 读取 count", ui: "点击 0" },
      ],
    },
    {
      id: "ref-s3",
      tick: "S3",
      title: "绑定点击",
      goal: "点击时，数字应该增加。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加上 @click=\"count++\" 之后，点击会发生什么？",
        choices: [
          { id: "inc", label: "数字会增加：0 → 1 → 2", correct: true, why: "click 改 count → 通知依赖它的渲染 → DOM 更新。这就是响应式。" },
          { id: "mem", label: "内存里变了，页面仍是 0", correct: false, why: "那是普通变量的行为。现在是 ref，而且模板已经订阅了它。" },
          { id: "err", label: "报错：模板里不能 ++", correct: false, why: "模板里的 count 自动解包，count++ 等价于 count.value++。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s3 },
        blocks: [{ id: "click", label: "④ 绑定 @click" }],
        narration: "现在有一条完整的因果链：click → count → render → DOM。",
      },
      replay: {
        label: "自动点击 3 次",
        steps: [
          { caption: "click", event: "click", highlight: ["click"] },
          { caption: "count  0 → 1", highlight: ["ref"], state: { id: "count", from: "0", to: "1" } },
          { caption: "template effect 失效", highlight: ["render"] },
          { caption: "DOM  「点击 0」→「点击 1」", highlight: ["dom"] },
          { caption: "再点：1 → 2", event: "click", highlight: ["click", "ref", "dom"], state: { id: "count", from: "1", to: "2" } },
          { caption: "再点：2 → 3", event: "click", highlight: ["click", "ref", "dom"], state: { id: "count", from: "2", to: "3" } },
        ],
      },
      observe: {
        state: [{ id: "count", label: "count", value: "0 → n", symbol: "count" }],
        dom: [{ id: "btn", label: "button", value: "点击 n", symbol: "count" }],
        events: [{ id: "click", label: "click", value: "count++", symbol: "count" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "click", detail: "count++" },
        { id: "ref", kind: "ref", label: "count", detail: "0 → n", symbol: "count" },
        { id: "render", kind: "render", label: "render", detail: "{{ count }}" },
        { id: "dom", kind: "dom", label: "DOM", detail: "点击 n", symbol: "count" },
      ],
      edges: [
        { from: "click", to: "ref", label: "写入" },
        { from: "ref", to: "render", label: "通知" },
        { from: "render", to: "dom" },
      ],
      why: {
        question: "模板里 count++ 为什么不用 .value？",
        choices: [
          { id: "unwrap", label: "模板自动解包 ref，编译后相当于 count.value++", correct: true, why: "script 里 count 是 Ref 对象。模板里 Vue 帮你拆开。两条世界，一条规则。" },
          { id: "sugar", label: "++ 只能用在模板，script 里会失败", correct: false, why: "script 里写 count.value++ 完全合法，而且是正道。" },
          { id: "same", label: "模板和 script 是同一套作用域，都不需要 .value", correct: false, why: "script 里漏 .value 是最常见的静默/报错之一。" },
        ],
      },
      explanation: {
        headline: "这就是 Vue 响应式",
        body: "不是「数据变了页面就变」这句空话。是：写入 ref → 找到订阅过它的 effect → 重新渲染 → 补丁 DOM。你可以在右侧真点这个按钮验证。",
      },
      faqs: [
        { q: "count++ 为什么能用？", a: "模板自动解包。编译后大致是 count.value++。script 里你必须自己写 .value。" },
        { q: "如果改成 count.value++ 放模板？", a: "模板里不需要，也不推荐。那会把实现细节泄漏进标记。" },
      ],
      tryThis: "在右侧连点按钮三次。数字必须变成 1、2、3。X-Ray 里 count 应跟着走。",
      mapping: [
        { code: '@click="count++"', runtime: "event → count.value++", ui: "点击后数字 +1" },
        { code: "{{ count }}", runtime: "template effect", ui: "按钮文本" },
      ],
    },
    {
      id: "ref-s4",
      tick: "S4",
      title: "如果没有这一行？",
      goal: "不要被告知「ref 很重要」。亲自拆掉它。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "如果把 ref 换成普通 let count = 0，点击后页面会？",
        choices: [
          { id: "ok", label: "照样更新", correct: false, why: "普通变量没有订阅者。Vue 不知道要重渲染。" },
          { id: "stale", label: "数字在内存里变了，页面不动", correct: true, why: "click 仍然执行 count++，但没有人通知 render。" },
          { id: "err", label: "直接报错", correct: false, why: "语法合法。失败是静默的——这比报错更危险。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s3 },
        blocks: [{ id: "same", label: "保持上一镜" }],
        narration: "代码还是能跑的那一版。下面用消融实验对比「删掉」和「换掉」。",
      },
      observe: {
        state: [{ id: "count", label: "count", value: "ref(n)", symbol: "count" }],
        dom: [{ id: "btn", label: "button", value: "点击 n", symbol: "count" }],
        events: [{ id: "click", label: "click", value: "count++" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "click" },
        { id: "ref", kind: "ref", label: "count", symbol: "count" },
        { id: "render", kind: "render", label: "render" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "click", to: "ref" },
        { from: "ref", to: "render" },
        { from: "render", to: "dom" },
      ],
      ablations: [
        {
          id: "delete-line",
          prompt: "如果没有这一行？",
          files: { "src/App.vue": noLine },
          expected: {
            kind: "error",
            message: "count is not defined",
          },
          lesson: "删掉声明，程序连这个名字都不认识。这是「缺失」，不是「不响应」。",
        },
        {
          id: "no-ref",
          prompt: "如果不要 ref？",
          files: { "src/App.vue": plainLet },
          expected: {
            kind: "stale",
            message: "点击时 count 会变，但 DOM 仍是 0。Vue 不知道要更新界面。",
          },
          lesson: "名字还在，值也会变，只是没有通知渲染。这才是 ref 真正补上的那条边。",
        },
      ],
      explanation: {
        headline: "两种坏法，两种因果",
        body: "没有这一行 → 名字不存在 → 报错。不要 ref → 名字存在、值在变、界面不知道。ref 做的不是「声明变量」，而是「让变化可被追踪」。",
      },
      faqs: [
        { q: "为什么 let 不报错？", a: "因为对 JavaScript 来说完全合法。失败发生在 Vue 的更新协议上，不是语法上。" },
        { q: "reactive 可以吗？", a: "对对象可以。对数字/布尔这种原始值，ref 才是对的工具。一次只改一个机制。" },
      ],
      tryThis: "先点按钮确认正确版本会加。再试「如果不要 ref」：内存在变，页面冻在 0。看完点「恢复」。",
    },
    {
      id: "ref-s5",
      tick: "S5",
      title: "换一个程序",
      goal: "喜欢按钮。不要教学口吻——直接判断缺了什么。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "这段程序点击后，文案会在「喜欢 / 已喜欢」之间切换吗？",
        choices: [
          { id: "yes", label: "会。clicked 改变了 liked", correct: false, why: "liked 是普通布尔值。赋值发生了，渲染不会重跑。" },
          { id: "no", label: "不会。liked 不是响应式", correct: true, why: "和 count 同一类因果：有状态、有事件、缺订阅。" },
          { id: "err", label: "会报错", correct: false, why: "能跑，只是界面冻住。静默失败。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "new", label: "换场景：喜欢按钮" }],
        narration: "同一个机制，完全不同的程序。先预测，再补上 ref。",
      },
      observe: {
        state: [{ id: "liked", label: "liked", value: "false（普通变量）", symbol: "liked" }],
        dom: [{ id: "btn", label: "button", value: "喜欢", symbol: "liked" }],
        events: [{ id: "click", label: "click", value: "liked = !liked" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "click" },
        { id: "liked", kind: "script", label: "liked", detail: "let false", symbol: "liked" },
        { id: "dom", kind: "dom", label: "DOM", detail: "喜欢（冻住）" },
      ],
      edges: [
        { from: "click", to: "liked", label: "写入（无通知）" },
      ],
      ablations: [
        {
          id: "fix-ref",
          prompt: "补上 ref 之后？",
          files: { "src/App.vue": transferAfter },
          expected: {
            kind: "stale",
            message: "这不是消融，是修复：liked 变成 ref 后，点击会切换文案。",
          },
          lesson: "迁移成功的标志：你能在新程序里指出「缺的是订阅，不是缺一个 if」。",
        },
      ],
      why: {
        question: "和上一节的 count 相比，缺的是同一类东西吗？",
        choices: [
          { id: "same", label: "是。都是「变化无法通知渲染」", correct: true, why: "表面是喜欢按钮，因果结构仍是：写入普通变量 → 无 effect 订阅。" },
          { id: "diff", label: "不是。布尔值和数字的规则不同", correct: false, why: "原始值都需要 ref。差别只在业务，不在机制。" },
          { id: "event", label: "缺的是 v-on 的另一种写法", correct: false, why: "事件已经绑好了。坏在状态类型。" },
        ],
      },
      explanation: {
        headline: "机制迁移了，才算掌握",
        body: "你会不会写 count++ 不重要。重要的是：换一个程序，你仍能指出「哪一条边断了」。这就是 Causal Vue 要训练的能力。",
      },
      faqs: [
        { q: "这里 React 会怎么写？", a: "useState。setLiked 会触发重渲染。普通 let liked 在 React 里同样不会更新界面——同一条因果。" },
      ],
      tryThis: "先点「喜欢」——文案不应变。再打开「补上 ref」，它应能切换。",
      mapping: [
        { code: "let liked = false", runtime: "普通绑定，无订阅者", ui: "冻在「喜欢」" },
        { code: "const liked = ref(false)", runtime: "ref → template effect", ui: "喜欢 ⇄ 已喜欢" },
      ],
    },
  ],
};
