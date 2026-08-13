import type { CausalLab, CounterfactualWorld } from "../types";

const fieldPlain = `<script setup>
const model = defineModel()
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="model" placeholder="写点什么" />
    <p class="probe">子 JSON：{{ JSON.stringify(model) }}</p>
  </div>
</template>
`;

const fieldTrim = `<script setup>
const [model, mods] = defineModel({
  set(v) {
    return mods.trim ? String(v).trim() : v
  },
})
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="model" placeholder="写点什么" />
    <p class="probe">子 JSON：{{ JSON.stringify(model) }}</p>
    <p class="hint">mods.trim = {{ !!mods.trim }}</p>
  </div>
</template>
`;

const fieldNumber = `<script setup>
const [model, mods] = defineModel({
  set(v) {
    if (!mods.number) return v
    const n = parseFloat(v)
    return Number.isNaN(n) ? v : n
  },
})
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="model" placeholder="数量" />
    <p class="probe">typeof：{{ typeof model }}</p>
    <p class="hint">mods.number = {{ !!mods.number }}</p>
  </div>
</template>
`;

const fieldLazy = `<script setup>
const [model, mods] = defineModel()
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input
      v-if="mods.lazy"
      :value="model"
      placeholder="失焦才写回"
      @change="model = $event.target.value"
    />
    <input v-else v-model="model" placeholder="每个字都写回" />
    <p class="hint">mods.lazy = {{ !!mods.lazy }}</p>
  </div>
</template>
`;

const appSpaces = `<script setup>
import { ref } from 'vue'
import Field from './Field.vue'
const name = ref('  Ada  ')
</script>
<template>
  <p class="card">父：「{{ name }}」</p>
  <p class="probe">JSON：{{ JSON.stringify(name) }}</p>
  <Field v-model="name" />
</template>
`;

const appTrim = `<script setup>
import { ref } from 'vue'
import Field from './Field.vue'
const name = ref('  Ada  ')
</script>
<template>
  <p class="card">父：「{{ name }}」</p>
  <p class="probe">JSON：{{ JSON.stringify(name) }}</p>
  <Field v-model.trim="name" />
</template>
`;

const appNumMod = `<script setup>
import { ref } from 'vue'
import Field from './Field.vue'
const n = ref(0)
</script>
<template>
  <p class="card">n + n = {{ n + n }}</p>
  <p class="probe">typeof n：{{ typeof n }}</p>
  <Field v-model.number="n" />
</template>
`;

const appLazy = `<script setup>
import { ref } from 'vue'
import Field from './Field.vue'
const name = ref('Ada')
</script>
<template>
  <p class="card">父：「{{ name }}」</p>
  <Field v-model.lazy="name" />
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
import Qty from './Qty.vue'
const q = ref(1)
</script>
<template>
  <p class="card">件数 + 件数 = {{ q + q }}</p>
  <p class="probe">typeof：{{ typeof q }}</p>
  <Qty v-model.number="q" />
</template>
`;

const qtyPlain = `<script setup>
const model = defineModel()
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="model" />
    <p class="probe">typeof：{{ typeof model }}</p>
  </div>
</template>
`;

const qtyNumber = `<script setup>
const [model, mods] = defineModel({
  set(v) {
    if (!mods.number) return v
    const n = parseFloat(v)
    return Number.isNaN(n) ? v : n
  },
})
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="model" />
    <p class="probe">typeof：{{ typeof model }} · number 修饰符 {{ !!mods.number }}</p>
  </div>
</template>
`;

const worldNoTrim: CounterfactualWorld = {
  id: "notrim",
  name: "父写了 .trim，子不理",
  tagline: "修饰符只是一面旗",
  files: { "src/App.vue": appTrim, "src/Field.vue": fieldPlain },
  nodes: [
    { id: "flag", kind: "script", label: "mods.trim" },
    { id: "dom", kind: "dom", label: '"  Ada  "' },
  ],
  edges: [{ from: "flag", to: "dom", label: "没人看" }],
  note: "原生 input 的 .trim，Vue 会替你剪。组件上只是一面旗，子不认就没人剪。",
};

const worldTrim: CounterfactualWorld = {
  id: "trim",
  name: "子在 set 里认 trim",
  tagline: "set(v) { return v.trim() }",
  files: { "src/App.vue": appTrim, "src/Field.vue": fieldTrim },
  nodes: [
    { id: "set", kind: "script", label: "set" },
    { id: "dom", kind: "dom", label: '"Ada"' },
  ],
  edges: [{ from: "set", to: "dom", label: "剪掉空格" }],
  note: "旗被读到了。写回父之前先 trim。",
};

export const MODELMOD_LAB: CausalLab = {
  id: "modelmod",
  world: 9,
  concept: "v-model modifiers",
  title: "门上的锁：trim / number / lazy",
  subtitle: "原生控件的修饰符，Vue 会替你做。落到组件上，只是一面旗。子要自己认。",
  promise:
    "一镜一条边：先空格还在，再父加上 .trim 仍在，再子认 trim 才剪掉，再 .number 被忽略变成 33，再认了才是 6，再 .lazy 被忽略每个字都写回。",
  minutes: 16,
  official: "/guide/components/v-model.html#handling-v-model-modifiers",
  scenes: [
    {
      id: "modelmod-s0",
      tick: "S0",
      title: "空格是值的一部分",
      goal: "父 v-model=\"name\"。初值 '  Ada  '。子不处理修饰符。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appSpaces, "src/Field.vue": fieldPlain },
        blocks: [{ id: "space", label: "① JSON 里的空格" }],
        narration: "卡片看起来像 Ada。JSON 才把两边的空格露出来。先认这张脸。",
      },
      observe: {
        state: [{ id: "n", label: "name", value: '"  Ada  "', symbol: "name" }],
        dom: [{ id: "probe", label: ".probe", value: '"  Ada  "' }],
        events: [],
      },
      nodes: [
        { id: "name", kind: "ref", label: "name", symbol: "name" },
        { id: "dom", kind: "dom", label: "JSON" },
      ],
      edges: [{ from: "name", to: "dom" }],
      explanation: {
        headline: "空格看不见，JSON 看得见",
        body: "trim 要剪的就是这份值，不是卡片上的观感。下一镜父加上 .trim——很多人以为这就够了。",
      },
      tryThis: "看 JSON 必须带空格。在输入框两端再加空格，JSON 必须变长。",
      faqs: [
        { q: "为什么不用卡片判断？", a: "HTML 会把连续空格折叠。JSON.stringify 才是值的脸。" },
      ],
    },
    {
      id: "modelmod-s1",
      tick: "S1",
      title: "父加了 .trim，空格还在",
      goal: "父改成 v-model.trim。子仍是裸 defineModel()。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "在输入框里改一个字再打空格。JSON 会？",
        choices: [
          { id: "clip", label: "空格被剪掉。父写了 .trim", correct: false, why: "原生 input 才会被 Vue 剪。组件上的 .trim 只是传给子的一面旗。" },
          { id: "stay", label: "空格还在。子没人读这面旗", correct: true, why: "defineModel() 不拆修饰符，就不会 trim。" },
          { id: "err", label: "报错：组件不支持 .trim", correct: false, why: "不会报错。静默无效。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appTrim, "src/Field.vue": fieldPlain },
        blocks: [{ id: "flag", label: "② v-model.trim，子不理" }],
        narration: "只改父。子一行没动。",
      },
      counterfactual: {
        id: "trim-flag",
        title: "旗 vs 认旗",
        setup: "父都写了 .trim。差在子有没有 set。",
        worlds: [worldNoTrim, worldTrim],
        punchline: "修饰符不是管道。它是一面旗。没人看，就等于没写。",
      },
      observe: {
        state: [{ id: "n", label: "name", value: "仍带空格" }],
        dom: [{ id: "probe", label: ".probe", value: "空格还在" }],
        events: [],
      },
      nodes: [
        { id: "trim", kind: "script", label: ".trim" },
        { id: "child", kind: "component", label: "Field" },
        { id: "dom", kind: "dom", label: "空格" },
      ],
      edges: [{ from: "trim", to: "dom", label: "没穿过" }],
      explanation: {
        headline: "组件上的 .trim 不会自己剪",
        body: "和 World 8 的 type: Number 同一类误会：登记不是管道。下一镜子在 set 里读 mods.trim。",
      },
      faqs: [
        { q: "那面旗在哪？", a: "默认通道叫 modelModifiers。defineModel 可以拆成 const [model, mods] = defineModel()。" },
      ],
      tryThis: "打字、加空格。JSON 必须仍带空格。打开反事实对比认了 trim 的世界。",
      mapping: [{ code: "v-model.trim", runtime: "只传 mods.trim=true", ui: "空格还在" }],
    },
    {
      id: "modelmod-s2",
      tick: "S2",
      title: "子在 set 里剪掉",
      goal: "const [model, mods] = defineModel({ set })。trim 时 String(v).trim()。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "现在子认旗了。改一个字。JSON 会？",
        choices: [
          { id: "clip", label: "变成不带两端空格的字符串", correct: true, why: "set 在写回父之前跑。trim 过的值才 emit。" },
          { id: "stay", label: "仍带空格。set 只改子，不改父", correct: false, why: "defineModel 的 set 决定 emit 出去的值，也决定本地拿到的值。" },
          { id: "empty", label: "变成空。trim 会把字也剪掉", correct: false, why: "trim 只剪两端空白。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appTrim, "src/Field.vue": fieldTrim },
        blocks: [{ id: "set", label: "③ set 里认 mods.trim" }],
        narration: "父一行没改。子第一次把旗读出来。",
      },
      observe: {
        state: [{ id: "n", label: "name", value: '"Ada"', symbol: "name" }],
        dom: [{ id: "probe", label: ".probe", value: '"Ada"' }],
        events: [],
      },
      nodes: [
        { id: "mods", kind: "script", label: "mods.trim" },
        { id: "set", kind: "script", label: "set" },
        { id: "name", kind: "ref", label: "name" },
      ],
      edges: [
        { from: "mods", to: "set" },
        { from: "set", to: "name", label: "trim" },
      ],
      explanation: {
        headline: "set 是写回之前的关卡",
        body: "get/set 是 defineModel 的变压器。修饰符只告诉你要不要开。下一镜换一面旗：.number。脸你见过——33。",
      },
      faqs: [
        { q: "输入时中间能打空格吗？", a: "能。trim 只剪两端。每击键都会剪，所以开头的空格会当场消失——和原生 v-model.trim 一样。" },
      ],
      tryThis: "改一个字。JSON 必须变成 \"Ada\"，两端空格消失。子面板应显示 mods.trim = true。",
      mapping: [{ code: "mods.trim ? v.trim() : v", runtime: "emit 前剪掉", ui: '"Ada"' }],
    },
    {
      id: "modelmod-s3",
      tick: "S3",
      title: ".number 被忽略，又见 33",
      goal: "父 v-model.number=\"n\"。子仍是裸 defineModel()。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "把 0 改成 3。n + n 会？",
        choices: [
          { id: "six", label: "6。父写了 .number", correct: false, why: "又是那面没人看的旗。input 交出的是字符串 '3'。" },
          { id: "join", label: "33。字符串加法", correct: true, why: "和 World 8 的 n=\"3\" 同一张脸。种类没过门。" },
          { id: "nan", label: "NaN", correct: false, why: "那是 Number(undefined)。现在是 '3'+'3'。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appNumMod, "src/Field.vue": fieldPlain },
        blocks: [{ id: "num", label: "④ v-model.number，子不理" }],
        narration: "空格换成种类。World 8 从入口进来的 33，现在从双向门进来。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "'3'", symbol: "n" }],
        dom: [{ id: "card", label: ".card", value: "33" }],
        events: [],
      },
      nodes: [
        { id: "flag", kind: "script", label: ".number" },
        { id: "n", kind: "ref", label: "n" },
        { id: "dom", kind: "dom", label: "33" },
      ],
      edges: [{ from: "flag", to: "dom", label: "没转换" }],
      why: {
        question: "和 typedprops 那一课 n=\"3\" 是同一张图吗？",
        choices: [
          { id: "same", label: "是。都是种类没过边界，加法先露馅", correct: true, why: "上一课错在父写成字符串属性。这一课错在子没把字符串扳成数字。" },
          { id: "diff", label: "不是。.number 总会转", correct: false, why: "原生 input 才会。组件要自己转。" },
          { id: "vue", label: "Vue 3.5 开始组件也会自动转", correct: false, why: "不会。仍是一面旗。" },
        ],
      },
      explanation: {
        headline: "33 又来了，缝在门上",
        body: "父以为自己要了数字。子交出字符串。+= 和 + 仍是那面镜子。下一镜子在 set 里 parseFloat。",
      },
      faqs: [
        { q: "typeof 探针是什么？", a: "必须是 string。卡片 33 只是结果。种类才是原因。" },
      ],
      tryThis: "输入 3。卡片必须是 33，探针必须是 string。",
      mapping: [{ code: "v-model.number", runtime: "只传 mods.number=true", ui: "33" }],
    },
    {
      id: "modelmod-s4",
      tick: "S4",
      title: "子认 .number，变成 6",
      goal: "set 里 mods.number 时 parseFloat。NaN 则原样留下。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "再输入 3。n + n 会？",
        choices: [
          { id: "six", label: "6。种类对了", correct: true, why: "parseFloat('3') 是数字 3。3+3=6。" },
          { id: "join", label: "仍是 33。set 改不了父的种类", correct: false, why: "emit 出去的就是 set 的返回值。" },
          { id: "nan", label: "NaN。parseFloat 会把空串变成 NaN", correct: false, why: "这一镜输入的是 3。空串那条留给你自己试。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appNumMod, "src/Field.vue": fieldNumber },
        blocks: [{ id: "parse", label: "⑤ set 里 parseFloat" }],
        narration: "父一行没改。子第一次把 .number 当真。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "3", symbol: "n" }],
        dom: [{ id: "card", label: ".card", value: "6" }],
        events: [],
      },
      nodes: [
        { id: "set", kind: "script", label: "parseFloat" },
        { id: "n", kind: "ref", label: "n" },
        { id: "dom", kind: "dom", label: "6" },
      ],
      edges: [
        { from: "set", to: "n", label: "number" },
        { from: "n", to: "dom" },
      ],
      explanation: {
        headline: "转换发生在 emit 之前",
        body: "和 World 8 泛型不同：这一次运行时真的换了种类。下一镜换时间：.lazy 该什么时候写回。",
      },
      faqs: [
        { q: "为什么用 parseFloat 不用 Number？", a: "和 Vue 自己的 .number 一样。Number('') 是 0，parseFloat('') 是 NaN，然后原样留下空串——空输入不会悄悄变 0。" },
        { q: "输入 3px 呢？", a: "parseFloat('3px') 是 3。Number('3px') 是 NaN。这是原生修饰符的选择。" },
      ],
      tryThis: "输入 3。卡片必须是 6，探针必须是 number。mods.number 必须是 true。",
      mapping: [{ code: "parseFloat(v)", runtime: "字符串 → 数字", ui: "6" }],
    },
    {
      id: "modelmod-s5",
      tick: "S5",
      title: ".lazy 被忽略，每个字都写回",
      goal: "父 v-model.lazy。子仍用 input 上的 v-model（每个字都写）。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "在子里慢慢打 Lin，还没失焦。父卡片会？",
        choices: [
          { id: "wait", label: "仍是 Ada。lazy 要等 change", correct: false, why: "子没认这面旗。内部仍是 @input。" },
          { id: "live", label: "每个字都变成 L、Li、Lin", correct: true, why: "组件上的 .lazy 不会自动把事件换成 change。" },
          { id: "err", label: "报错：组件不支持 lazy", correct: false, why: "静默无效。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appLazy, "src/Field.vue": fieldPlain },
        blocks: [{ id: "lazy", label: "⑥ v-model.lazy，子仍是 input" }],
        narration: "trim 剪值，number 换种类，lazy 换时机。这一镜旗在，时机没换。",
      },
      observe: {
        state: [{ id: "n", label: "name", value: "每个字都变" }],
        dom: [{ id: "card", label: ".card", value: "跟着击键" }],
        events: [{ id: "input", label: "input", value: "立刻 emit" }],
      },
      nodes: [
        { id: "lazy", kind: "script", label: ".lazy" },
        { id: "input", kind: "event", label: "input" },
        { id: "dom", kind: "dom", label: "父" },
      ],
      edges: [{ from: "input", to: "dom", label: "不等失焦" }],
      explanation: {
        headline: "lazy 是换事件，不是换 Vue",
        body: "原生 input 的 .lazy = 听 change 不听 input。组件要自己换。下一镜把三种旗一起拆：不理 trim、不理 number、认了 lazy。",
      },
      faqs: [
        { q: "正确的 lazy 怎么写？", a: "mods.lazy 时用 :value + @change 写回；否则用 v-model。修复在消融里。" },
      ],
      tryThis: "逐字打 Lin，不要点别处。父必须跟着每个字变。这就是「lazy 没生效」。",
      mapping: [{ code: "v-model.lazy", runtime: "只传 mods.lazy=true", ui: "仍每个字都写回" }],
    },
    {
      id: "modelmod-s6",
      tick: "S6",
      title: "拆成不理 trim / 不理 number / 认 lazy",
      goal: "三种对照：空格还在、33、失焦才写回。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到认了 trim 的世界。改一个字。JSON 会？",
        choices: [
          { id: "clip", label: "两端空格消失", correct: true, why: "先确认好的脸。" },
          { id: "stay", label: "空格还在", correct: false, why: "那是不理旗。" },
          { id: "six", label: "6", correct: false, why: "那是 number。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appTrim, "src/Field.vue": fieldTrim },
        blocks: [{ id: "keep", label: "认 trim 的版本先留着" }],
        narration: "先看见 Ada 被剪干净。再分别：不理 trim、不理 number、认 lazy。",
      },
      observe: {
        state: [{ id: "ok", label: "name", value: "trim 过" }],
        dom: [{ id: "probe", label: ".probe", value: '"Ada"' }],
        events: [],
      },
      nodes: [
        { id: "set", kind: "script", label: "set" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "set", to: "dom" }],
      ablations: [
        {
          id: "notrim",
          prompt: "如果子不理 .trim？",
          files: { "src/App.vue": appTrim, "src/Field.vue": fieldPlain },
          expected: { kind: "stale", message: "JSON 仍带空格。旗在，没人看。" },
          lesson: ".trim 不是管道。",
        },
        {
          id: "nonum",
          prompt: "如果父要 .number，子不理？",
          files: { "src/App.vue": appNumMod, "src/Field.vue": fieldPlain },
          expected: { kind: "stale", message: "输入 3 得到 33。种类没过门。" },
          lesson: "和 n=\"3\" 同一张脸。",
        },
        {
          id: "lazy",
          prompt: "如果子认了 .lazy？",
          files: { "src/App.vue": appLazy, "src/Field.vue": fieldLazy },
          expected: { kind: "stale", message: "这是修复：打字时父不动，失焦才变成新字。" },
          lesson: "lazy 换的是事件，不是宏。",
        },
      ],
      explanation: {
        headline: "三面旗，三种脸",
        body: "值、种类、时机。原生控件 Vue 都替你做。组件上你都要自己认。下一课一门变两门：v-model:title。",
      },
      tryThis: "前两个消融应看到空格和 33。第三个：打字时父不动，点别处才变。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先 trim（值），再 number（种类），再 lazy（时机）。和门上三把锁一样。" },
      ],
    },
    {
      id: "modelmod-s7",
      tick: "S7",
      title: "换：件数",
      goal: "Qty 不认 .number。父 v-model.number=\"q\"。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "把 1 改成 2。件数 + 件数会？",
        choices: [
          { id: "four", label: "4", correct: false, why: "子没转种类。" },
          { id: "join", label: "22。又是字符串", correct: true, why: "和 33 同一张图。换了字段名，种类边还在。" },
          { id: "err", label: "报错", correct: false, why: "能跑。句子骗人。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore, "src/Qty.vue": qtyPlain },
        blocks: [{ id: "qty", label: "换场景：件数" }],
        narration: "名字换成件数。父已经要了 .number。问的仍是：子认不认旗。",
      },
      observe: {
        state: [{ id: "q", label: "q", value: "将变成 '2'" }],
        dom: [{ id: "card", label: ".card", value: "22" }],
        events: [],
      },
      nodes: [
        { id: "flag", kind: "script", label: ".number" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "flag", to: "dom" }],
      ablations: [
        {
          id: "fix",
          prompt: "子在 set 里 parseFloat 之后？",
          files: { "src/App.vue": transferBefore, "src/Qty.vue": qtyNumber },
          expected: {
            kind: "stale",
            message: "这是修复：输入 2 得到 4。种类过门了。",
          },
          lesson: "下一课：一扇门不够时，通道要起名字。",
        },
      ],
      explanation: {
        headline: "修饰符是契约的运行时半边",
        body: "World 8 的类型在 IDE 里红。这一课的旗在运行时换脸。下一课一门变两门：名和姓走两条通道。",
      },
      faqs: [
        { q: "父自己 Number(q) 行吗？", a: "能修脸。但把子的谎言吞了。转换应该写在门上，也就是 set。" },
      ],
      tryThis: "先输入 2，卡片必须是 22。再打开修复：必须是 4。",
      mapping: [
        { code: "v-model.number", runtime: "旗在，子不理", ui: "22" },
        { code: "parseFloat 的 set", runtime: "种类过门", ui: "4" },
      ],
    },
  ],
};
