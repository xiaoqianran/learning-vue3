import type { CausalLab, CounterfactualWorld } from "../types";

const fieldBare = `<script setup>
</script>
<template>
  <input />
</template>
`;

const fieldWrap = `<script setup>
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <p class="probe">$attrs：{{ Object.keys($attrs).join(', ') || '（空）' }}</p>
    <input />
  </div>
</template>
`;

const fieldPropUnused = `<script setup>
defineProps({
  placeholder: String,
})
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <p class="probe">$attrs：{{ Object.keys($attrs).join(', ') || '（空）' }}</p>
    <input />
  </div>
</template>
`;

const fieldPropBound = `<script setup>
defineProps({
  placeholder: String,
})
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <p class="probe">$attrs：{{ Object.keys($attrs).join(', ') || '（空）' }}</p>
    <input :placeholder="placeholder" />
  </div>
</template>
`;

const fieldHasClass = `<script setup>
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <p class="probe">根 class 会合并</p>
    <input />
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

const appDisabled = `<script setup>
import Field from './Field.vue'
</script>
<template>
  <p class="card">父写了 disabled</p>
  <Field placeholder="写名字" class="on" disabled />
</template>
`;

const transferBefore = `<script setup>
import Note from './Note.vue'
</script>
<template>
  <p class="card">笔记框</p>
  <Note placeholder="写一句" class="on" />
</template>
`;

const noteWrap = `<script setup>
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <textarea></textarea>
  </div>
</template>
`;

const noteBare = `<script setup>
</script>
<template>
  <textarea></textarea>
</template>
`;

const worldBare: CounterfactualWorld = {
  id: "bare",
  name: "单根就是 input",
  tagline: "<input /> 当根",
  files: { "src/App.vue": appPh, "src/Field.vue": fieldBare },
  nodes: [
    { id: "ph", kind: "script", label: "placeholder" },
    { id: "dom", kind: "dom", label: "输入框有提示" },
  ],
  edges: [{ from: "ph", to: "dom", label: "落到根" }],
  note: "根是 input。没声明的属性整包落到它身上。",
};

const worldWrap: CounterfactualWorld = {
  id: "wrap",
  name: "根是盒子",
  tagline: "div.panel 包着 input",
  files: { "src/App.vue": appPh, "src/Field.vue": fieldWrap },
  nodes: [
    { id: "ph", kind: "script", label: "placeholder" },
    { id: "box", kind: "dom", label: "盒子有 .on" },
    { id: "input", kind: "dom", label: "输入框没有提示" },
  ],
  edges: [{ from: "ph", to: "box", label: "落到根" }],
  note: "根换成了盒子。提示词和绿框都贴在盒子上，进不了 input。",
};

export const ATTRS_LAB: CausalLab = {
  id: "attrs",
  world: 11,
  concept: "fallthrough attrs",
  title: "没声明的属性落在根上",
  subtitle: "不是 prop 的东西，会整包贴到子组件的根节点。根不是 input，placeholder 就进不去。",
  promise:
    "一镜一条边：先单根 input 提示词在，再包一层落到盒子上，再声明成 prop 连透传都没了，再绑回 input，再 class 合并，再 disabled 贴到盒子上没用。",
  minutes: 16,
  official: "/guide/components/attrs.html",
  scenes: [
    {
      id: "attrs-s0",
      tick: "S0",
      title: "单根 input，提示词在",
      goal: "Field 的根就是 <input />。父传 placeholder 和 class。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appPh, "src/Field.vue": fieldBare },
        blocks: [{ id: "root", label: "① 根就是 input" }],
        narration: "World 2 把组件拆出来之后，父还会往上贴 class、placeholder。它们不是 props。先看根刚好是 input 的脸。",
      },
      observe: {
        state: [{ id: "ph", label: "placeholder", value: "写名字" }],
        dom: [
          { id: "input", label: "input", value: "有提示词，有绿框" },
        ],
        events: [],
      },
      nodes: [
        { id: "parent", kind: "component", label: "Field" },
        { id: "attrs", kind: "script", label: "$attrs", symbol: "$attrs" },
        { id: "dom", kind: "dom", label: "input" },
      ],
      edges: [
        { from: "parent", to: "attrs" },
        { from: "attrs", to: "dom", label: "落到根" },
      ],
      explanation: {
        headline: "没声明的属性整包贴到根",
        body: "子没写 defineProps。placeholder 和 class 都是透传。根是 input，所以提示词和绿框都在输入框上。下一镜只包一层盒子。",
      },
      tryThis: "输入框里必须看见「写名字」。输入框外必须有绿框。",
      faqs: [
        { q: "class 不是 CSS 吗？", a: "对父来说它是一个属性。Vue 会把 class / style 和根上已有的合并。其它属性直接贴上。" },
      ],
    },
    {
      id: "attrs-s1",
      tick: "S1",
      title: "包一层，落到盒子上",
      goal: "根改成 div.panel，里面再放 input。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "父一行没改。提示词和绿框会？",
        choices: [
          { id: "in", label: "仍在输入框上。Vue 知道该给 input", correct: false, why: "Vue 不猜。整包贴到根。根现在是盒子。" },
          { id: "box", label: "绿框在盒子上，输入框没有提示词", correct: true, why: "placeholder 贴到 div 上毫无意义。class 让盒子发光。" },
          { id: "gone", label: "都消失。多一层就不能透传", correct: false, why: "透传还在，只是贴错人。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPh, "src/Field.vue": fieldWrap },
        blocks: [{ id: "wrap", label: "② 根换成盒子" }],
        narration: "父一行没改。只多了一个包装根。",
      },
      counterfactual: {
        id: "root-who",
        title: "根是谁",
        setup: "父都传 placeholder 和 class。差在子的根是 input 还是盒子。",
        worlds: [worldBare, worldWrap],
        punchline: "透传不认「里面那个输入框」。它只认根。",
      },
      observe: {
        state: [{ id: "keys", label: "$attrs", value: "placeholder, class" }],
        dom: [
          { id: "box", label: ".panel", value: "有绿框" },
          { id: "input", label: "input", value: "没有提示词" },
        ],
        events: [],
      },
      nodes: [
        { id: "attrs", kind: "script", label: "$attrs" },
        { id: "box", kind: "dom", label: "盒子" },
        { id: "input", kind: "dom", label: "input" },
      ],
      edges: [
        { from: "attrs", to: "box", label: "落到根" },
        { from: "box", to: "input", label: "进不去" },
      ],
      explanation: {
        headline: "根换了，贴错人",
        body: "探针仍写着 placeholder、class。它们在 $attrs 里。只是 DOM 贴到了盒子上。下一镜把 placeholder 声明成 prop——它会从 $attrs 里消失。",
      },
      faqs: [
        { q: "为什么盒子会发光？", a: "class=\"on\" 落到根 div 上。预览里 .on 会画绿框。输入框没拿到 class。" },
      ],
      tryThis: "绿框必须在灰色盒子上。输入框必须没有「写名字」。打开反事实对比单根。",
      mapping: [{ code: "<div class=\"panel\">", runtime: "根换了", ui: "提示词进不了 input" }],
    },
    {
      id: "attrs-s2",
      tick: "S2",
      title: "声明成 prop，透传名单里没了",
      goal: "defineProps({ placeholder: String })。仍不绑到 input。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "placeholder 现在是 prop。绿框和提示词会？",
        choices: [
          { id: "same", label: "和上一镜一样。声明只是类型", correct: false, why: "声明过的不再进入 $attrs，也不会落到根上。" },
          { id: "split", label: "绿框还在盒子上；提示词哪都没有；$attrs 只剩 class", correct: true, why: "prop 被吃掉了。子没用它。透传名单里只剩 class。" },
          { id: "in", label: "声明了就会自动绑到里面的 input", correct: false, why: "和 defineModel 一样：声明不是管道。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPh, "src/Field.vue": fieldPropUnused },
        blocks: [{ id: "prop", label: "③ placeholder 变成 prop" }],
        narration: "只多了一行 defineProps。DOM 绑法没变。",
      },
      observe: {
        state: [{ id: "keys", label: "$attrs", value: "class（placeholder 没了）" }],
        dom: [
          { id: "box", label: ".panel", value: "仍有绿框" },
          { id: "input", label: "input", value: "仍无提示词" },
        ],
        events: [],
      },
      nodes: [
        { id: "prop", kind: "script", label: "props.placeholder" },
        { id: "attrs", kind: "script", label: "$attrs" },
        { id: "dom", kind: "dom", label: "input 空着" },
      ],
      edges: [
        { from: "prop", to: "dom", label: "没用" },
        { from: "attrs", to: "dom", label: "只剩 class" },
      ],
      explanation: {
        headline: "声明过的，不会再透传",
        body: "placeholder 进了 props，从 $attrs 除名。你不用它，它就哪也不贴。下一镜把它绑回 input。",
      },
      faqs: [
        { q: "class 为什么还在？", a: "你没把它写成 prop。没声明的才走透传。" },
      ],
      tryThis: "探针必须只剩 class。输入框仍没有提示词。绿框仍在盒子上。",
      mapping: [{ code: "defineProps({ placeholder })", runtime: "从 $attrs 除名", ui: "哪也不贴" }],
    },
    {
      id: "attrs-s3",
      tick: "S3",
      title: "prop 绑回 input",
      goal: "<input :placeholder=\"placeholder\" />。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "现在把 prop 绑上。提示词会？",
        choices: [
          { id: "in", label: "出现在输入框。绿框仍在盒子上", correct: true, why: "placeholder 走 prop 管道。class 仍是透传，贴在根盒子上。" },
          { id: "both", label: "提示词和绿框都进输入框", correct: false, why: "class 还在 $attrs 里，默认仍贴根。" },
          { id: "box", label: "提示词跑到盒子上", correct: false, why: "你绑的是 input。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPh, "src/Field.vue": fieldPropBound },
        blocks: [{ id: "bind", label: "④ :placeholder 绑到 input" }],
        narration: "一条边：把已经声明的值接到真正该用的节点。",
      },
      observe: {
        state: [{ id: "ph", label: "placeholder", value: "写名字" }],
        dom: [
          { id: "input", label: "input", value: "有提示词" },
          { id: "box", label: ".panel", value: "仍有绿框" },
        ],
        events: [],
      },
      nodes: [
        { id: "prop", kind: "script", label: "placeholder" },
        { id: "input", kind: "dom", label: "input" },
        { id: "box", kind: "dom", label: "盒子" },
      ],
      edges: [
        { from: "prop", to: "input" },
        { from: "box", to: "input", label: "class 不进" },
      ],
      explanation: {
        headline: "prop 要自己接；透传仍贴根",
        body: "两条管道。下一镜看 class：子根上已经有 panel，父又给了 on，会合并，不会覆盖。",
      },
      faqs: [
        { q: "能不能让 class 也进 input？", a: "能。下一课 inheritAttrs: false，再 v-bind=\"$attrs\" 到 input。" },
      ],
      tryThis: "输入框必须有「写名字」。绿框必须仍在盒子上，不在输入框上。",
      mapping: [{ code: ":placeholder=\"placeholder\"", runtime: "prop 管道", ui: "提示词回 input" }],
    },
    {
      id: "attrs-s4",
      tick: "S4",
      title: "class 是合并，不是覆盖",
      goal: "根已有 class=\"panel\"。父再给 class=\"on\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "盒子会？",
        choices: [
          { id: "both", label: "同时有 panel 和 on。灰底还在，绿框也在", correct: true, why: "class 和 style 特殊：和根上已有的合并。" },
          { id: "on", label: "只剩 on。父的 class 会覆盖", correct: false, why: "覆盖的是普通属性。class 会并。" },
          { id: "panel", label: "只剩 panel。子的 class 优先", correct: false, why: "两边都留。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPh, "src/Field.vue": fieldHasClass },
        blocks: [{ id: "merge", label: "⑤ class 合并" }],
        narration: "和 S1 几乎同一份。请认清：panel 没被 on 挤掉。",
      },
      observe: {
        state: [{ id: "c", label: "class", value: "panel on" }],
        dom: [{ id: "box", label: ".panel.on", value: "灰底 + 绿框" }],
        events: [],
      },
      nodes: [
        { id: "child", kind: "script", label: "panel" },
        { id: "parent", kind: "script", label: "on" },
        { id: "dom", kind: "dom", label: "根" },
      ],
      edges: [
        { from: "child", to: "dom" },
        { from: "parent", to: "dom", label: "合并" },
      ],
      explanation: {
        headline: "class / style 会并进根",
        body: "其它属性是贴上或覆盖。class 是并集。下一镜贴一个 input 才认识的 disabled，看它落到盒子上有多没用。",
      },
      faqs: [
        { q: "style 呢？", a: "一样合并。普通属性（id、disabled、placeholder）是整份贴到根，后写覆盖先写。" },
      ],
      tryThis: "盒子必须仍是灰色面板，同时有绿框。不是只剩绿框的空壳。",
      mapping: [{ code: "class=\"panel\" + class=\"on\"", runtime: "合并", ui: "灰底 + 绿框" }],
    },
    {
      id: "attrs-s5",
      tick: "S5",
      title: "disabled 贴到盒子上",
      goal: "父加上 disabled。根仍是盒子。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "输入框还能打字吗？",
        choices: [
          { id: "yes", label: "能。disabled 贴在盒子上，input 不认", correct: true, why: "div 的 disabled 不是标准行为。输入框没拿到这个属性。" },
          { id: "no", label: "不能。父写了 disabled 就会禁用里面", correct: false, why: "Vue 不穿透。和 placeholder 同一条缝。" },
          { id: "box", label: "整块都不能点，包括标题", correct: false, why: "div 不会因为 disabled 属性变成 inert。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appDisabled, "src/Field.vue": fieldWrap },
        blocks: [{ id: "dis", label: "⑥ disabled 落到根" }],
        narration: "父以为自己在禁用输入框。根是盒子。",
      },
      observe: {
        state: [{ id: "d", label: "disabled", value: "在盒子上" }],
        dom: [{ id: "input", label: "input", value: "仍能打字" }],
        events: [],
      },
      nodes: [
        { id: "dis", kind: "script", label: "disabled" },
        { id: "box", kind: "dom", label: "div" },
        { id: "input", kind: "dom", label: "input" },
      ],
      edges: [{ from: "dis", to: "box", label: "贴错人" }],
      explanation: {
        headline: "控件属性贴到盒子上等于没贴",
        body: "和提示词同一张图。下一镜拆三种死法：包一层、声明成 prop 不用、单根对照。",
      },
      faqs: [
        { q: "那 disabled 该怎么传？", a: "声明成 prop 再绑到 input，或下一课把 $attrs 整包绑到 input。" },
      ],
      tryThis: "输入框必须仍能打字。探针里 $attrs 应有 disabled。绿框仍在盒子上。",
      mapping: [{ code: "<Field disabled />", runtime: "贴到 div", ui: "input 不禁用" }],
    },
    {
      id: "attrs-s6",
      tick: "S6",
      title: "拆成包一层 / 吃掉不用 / 单根",
      goal: "三种对照：盒子根、prop 不用、单根 input。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到盒子根。提示词会？",
        choices: [
          { id: "gone", label: "输入框没有提示词", correct: true, why: "先确认贴错人。" },
          { id: "in", label: "在输入框上", correct: false, why: "那是单根。" },
          { id: "err", label: "报错", correct: false, why: "能跑。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPh, "src/Field.vue": fieldWrap },
        blocks: [{ id: "keep", label: "盒子根先留着" }],
        narration: "先看输入框空着。再分别：单根、声明成 prop、绑回 input。",
      },
      observe: {
        state: [{ id: "ok", label: "$attrs", value: "贴在根上" }],
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
          id: "bare",
          prompt: "如果根就是 input？",
          files: { "src/App.vue": appPh, "src/Field.vue": fieldBare },
          expected: { kind: "stale", message: "这是对照：提示词和绿框都在输入框上。" },
          lesson: "透传只认根。",
        },
        {
          id: "prop",
          prompt: "如果声明成 prop 却不绑？",
          files: { "src/App.vue": appPh, "src/Field.vue": fieldPropUnused },
          expected: { kind: "stale", message: "$attrs 只剩 class。提示词哪都不贴。" },
          lesson: "声明会从透传名单除名。",
        },
        {
          id: "bind",
          prompt: "如果把 prop 绑回 input？",
          files: { "src/App.vue": appPh, "src/Field.vue": fieldPropBound },
          expected: { kind: "stale", message: "这是修复：提示词回输入框。绿框仍在盒子上。" },
          lesson: "prop 管道和透传管道是两份。",
        },
      ],
      explanation: {
        headline: "贴错人、吃掉、贴对人",
        body: "根是谁、有没有声明、有没有绑。下一课关掉自动贴根，你自己选贴到谁。",
      },
      tryThis: "三种消融：单根全对、prop 哪都没有、绑回提示词。对上号再恢复盒子根。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先单根（对照），再吃掉不用，再绑回去。" },
      ],
    },
    {
      id: "attrs-s7",
      tick: "S7",
      title: "换：笔记框",
      goal: "Note 用盒子包着 textarea。父传 placeholder 和 class。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "textarea 里会看见「写一句」吗？",
        choices: [
          { id: "yes", label: "会。textarea 是控件，总会接到", correct: false, why: "和 input 同一张图。根是盒子。" },
          { id: "no", label: "不会。绿框在盒子上", correct: true, why: "透传贴根。控件属性进不去。" },
          { id: "err", label: "报错", correct: false, why: "能跑。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore, "src/Note.vue": noteWrap },
        blocks: [{ id: "note", label: "换场景：笔记" }],
        narration: "输入框换成 textarea。问的仍是：根是谁。",
      },
      observe: {
        state: [{ id: "ph", label: "placeholder", value: "在盒子上" }],
        dom: [{ id: "ta", label: "textarea", value: "没有提示词" }],
        events: [],
      },
      nodes: [
        { id: "attrs", kind: "script", label: "$attrs" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "attrs", to: "dom" }],
      ablations: [
        {
          id: "bare",
          prompt: "如果根就是 textarea？",
          files: { "src/App.vue": transferBefore, "src/Note.vue": noteBare },
          expected: {
            kind: "stale",
            message: "这是修复：提示词和绿框都在 textarea 上。",
          },
          lesson: "下一课：不想改根的时候，关掉自动贴，自己选节点。",
        },
      ],
      explanation: {
        headline: "控件藏在盒子里，透传到不了",
        body: "input 和 textarea 是同一种根的问题。下一课 inheritAttrs: false，把 $attrs 绑到你指定的那一个节点。",
      },
      faqs: [
        { q: "必须单根才能做表单组件吗？", a: "不必。下一课就是：多一层盒子也可以，只要你自己绑 $attrs。" },
      ],
      tryThis: "textarea 必须没有提示词，盒子有绿框。再打开单根修复：提示词必须出现。",
      mapping: [
        { code: "盒子包 textarea", runtime: "贴到根", ui: "没有提示词" },
        { code: "根就是 textarea", runtime: "贴对人", ui: "有提示词" },
      ],
    },
  ],
};
