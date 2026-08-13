import type { CausalLab, CounterfactualWorld } from "../types";

const fieldModel = `<script setup>
const model = defineModel()
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="model" placeholder="写名字" />
    <p class="probe">子：「{{ model }}」</p>
  </div>
</template>
`;

const fieldPropsEmit = `<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input
      :value="modelValue"
      placeholder="写名字"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <p class="probe">子：「{{ modelValue }}」</p>
  </div>
</template>
`;

const fieldLocal = `<script setup>
import { ref } from 'vue'
const model = ref('')
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="model" placeholder="写名字" />
    <p class="probe">子：「{{ model }}」</p>
  </div>
</template>
`;

const fieldWrongEmit = `<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:value'])
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input
      :value="modelValue"
      placeholder="写名字"
      @input="emit('update:value', $event.target.value)"
    />
    <p class="probe">子：「{{ modelValue }}」</p>
  </div>
</template>
`;

const fieldDefault = `<script setup>
const model = defineModel({ default: '游客' })
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="model" placeholder="写名字" />
    <p class="probe">子：「{{ model }}」</p>
  </div>
</template>
`;

const appBound = `<script setup>
import { ref } from 'vue'
import Field from './Field.vue'
const name = ref('Ada')
</script>
<template>
  <p class="card">父：「{{ name }}」</p>
  <p class="probe">JSON：{{ JSON.stringify(name) }}</p>
  <Field v-model="name" />
</template>
`;

const appOneWay = `<script setup>
import { ref } from 'vue'
import Field from './Field.vue'
const name = ref('Ada')
</script>
<template>
  <p class="card">父：「{{ name }}」</p>
  <p class="probe">JSON：{{ JSON.stringify(name) }}</p>
  <Field :model-value="name" />
</template>
`;

const appUnbound = `<script setup>
import { ref } from 'vue'
import Field from './Field.vue'
const name = ref('Ada')
</script>
<template>
  <p class="card">父：「{{ name }}」</p>
  <p class="probe">JSON：{{ JSON.stringify(name) }}</p>
  <Field />
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
import Price from './Price.vue'
const n = ref(3)
</script>
<template>
  <p class="card">父价 {{ n }}</p>
  <p class="probe">typeof：{{ typeof n }}</p>
  <Price />
</template>
`;

const priceLocal = `<script setup>
import { ref } from 'vue'
const model = ref(0)
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="model" />
    <p class="probe">子价 {{ model }}</p>
  </div>
</template>
`;

const priceModel = `<script setup>
const model = defineModel({ default: 0 })
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="model" />
    <p class="probe">子价 {{ model }}</p>
  </div>
</template>
`;

const transferFixed = `<script setup>
import { ref } from 'vue'
import Price from './Price.vue'
const n = ref(3)
</script>
<template>
  <p class="card">父价 {{ n }}</p>
  <p class="probe">typeof：{{ typeof n }}</p>
  <Price v-model="n" />
</template>
`;

const worldBound: CounterfactualWorld = {
  id: "bound",
  name: "v-model 成对",
  tagline: "<Field v-model=\"name\" />",
  files: { "src/App.vue": appBound, "src/Field.vue": fieldModel },
  nodes: [
    { id: "child", kind: "ref", label: "model" },
    { id: "parent", kind: "ref", label: "name" },
    { id: "dom", kind: "dom", label: "同一张脸" },
  ],
  edges: [
    { from: "child", to: "parent", label: "update" },
    { from: "parent", to: "dom" },
  ],
  note: "进和出都接上。子打字，父跟着改。",
};

const worldOneWay: CounterfactualWorld = {
  id: "oneway",
  name: "只有 :model-value",
  tagline: "没有 @update:modelValue",
  files: { "src/App.vue": appOneWay, "src/Field.vue": fieldModel },
  nodes: [
    { id: "child", kind: "ref", label: "model 本地" },
    { id: "parent", kind: "ref", label: "name 冻住" },
    { id: "dom", kind: "dom", label: "两张脸" },
  ],
  edges: [{ from: "child", to: "dom", label: "只改子" }],
  note: "门只开了一半。子能本地改，父仍是 Ada。",
};

export const DEFINEMODEL_LAB: CausalLab = {
  id: "definemodel",
  world: 9,
  concept: "defineModel",
  title: "组件上的那扇门",
  subtitle: "v-model 落到组件上，就是一对 props + emit。defineModel 把这对边收成一个 ref。",
  promise:
    "一镜一条边：先双向通，再拆成 props+emit 同一张脸，再只留入口父冻住，再子用本地 ref 父永远不知道，再默认值填洞，再父的值压过默认。",
  minutes: 16,
  official: "/guide/components/v-model.html",
  scenes: [
    {
      id: "definemodel-s0",
      tick: "S0",
      title: "一扇门，两头都写",
      goal: "子 defineModel()。父 <Field v-model=\"name\" />。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appBound, "src/Field.vue": fieldModel },
        blocks: [{ id: "door", label: "① defineModel + v-model" }],
        narration: "World 2 的 v-model 绑在原生 input 上。现在 input 藏在子组件里。门要开在组件边界上。",
      },
      observe: {
        state: [{ id: "n", label: "name", value: "Ada → 你打的字", symbol: "name" }],
        dom: [{ id: "card", label: ".card", value: "跟着输入变" }],
        events: [{ id: "input", label: "input", value: "update:modelValue", symbol: "defineModel" }],
      },
      nodes: [
        { id: "input", kind: "event", label: "input" },
        { id: "model", kind: "ref", label: "model", symbol: "defineModel" },
        { id: "name", kind: "ref", label: "name", symbol: "name" },
        { id: "dom", kind: "dom", label: "父卡片" },
      ],
      edges: [
        { from: "input", to: "model" },
        { from: "model", to: "name", label: "update" },
        { from: "name", to: "dom" },
      ],
      explanation: {
        headline: "defineModel 是一扇双向门",
        body: "子拿到的 model 是 ref。读它，等于读父的 name。写它，等于 emit('update:modelValue')。下一镜把糖拆开，脸必须一样。",
      },
      tryThis: "在子的输入框把 Ada 改成 Lin。父卡片必须变成「Lin」。",
      faqs: [
        { q: "为什么子不用 defineProps？", a: "defineModel 会代你声明 modelValue 和 update:modelValue。下一镜亲手写这对边。" },
      ],
    },
    {
      id: "definemodel-s1",
      tick: "S1",
      title: "拆开仍是同一张脸",
      goal: "子改成 props.modelValue + emit('update:modelValue')。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "糖拆开了。在子里改字。父会？",
        choices: [
          { id: "same", label: "仍跟着变。糖里就是这对边", correct: true, why: "v-model 在组件上 = :modelValue + @update:modelValue。defineModel 只是少写一遍。" },
          { id: "break", label: "父冻住。必须用 defineModel 才双向", correct: false, why: "defineModel 是糖。运行时仍是 props 和 emit。" },
          { id: "err", label: "预览不懂 modelValue，输入框没了", correct: false, why: "这是 Vue 3 一开始就有的约定。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appBound, "src/Field.vue": fieldPropsEmit },
        blocks: [{ id: "pair", label: "② modelValue + update" }],
        narration: "父一行没改。只把子的糖拆成你在 World 2、World 8 见过的那对边。",
      },
      observe: {
        state: [{ id: "n", label: "name", value: "仍会跟着变", symbol: "name" }],
        dom: [{ id: "card", label: ".card", value: "同一张脸" }],
        events: [{ id: "input", label: "input", value: "emit update:modelValue" }],
      },
      nodes: [
        { id: "prop", kind: "script", label: "modelValue", symbol: "modelValue" },
        { id: "emit", kind: "event", label: "update:modelValue" },
        { id: "dom", kind: "dom", label: "父" },
      ],
      edges: [
        { from: "prop", to: "dom", label: "读" },
        { from: "emit", to: "dom", label: "写" },
      ],
      explanation: {
        headline: "糖不发明第三条边",
        body: "和 World 2 原生 input 的 :value + @input 同一张图，只是名字换成了组件约定。下一镜只留入口，把写回砍掉。",
      },
      faqs: [
        { q: "为什么事件叫 update:modelValue？", a: "v-model 默认通道。具名 v-model:title 才会变成 update:title。第三课专门拆通道名。" },
      ],
      tryThis: "再改几个字。父必须仍跟着走。打开代码，认一认 emit 那一行。",
      mapping: [
        { code: "defineModel()", runtime: "props + emit 的糖", ui: "同一张脸" },
        { code: "emit('update:modelValue')", runtime: "写回父", ui: "父跟着变" },
      ],
    },
    {
      id: "definemodel-s2",
      tick: "S2",
      title: "只留入口",
      goal: "父改成 :model-value=\"name\"。没有 @update。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "在子里把 Ada 改成 Lin。父卡片会？",
        choices: [
          { id: "follow", label: "变成 Lin。有 model-value 就会回写", correct: false, why: "那只是往下传。没有人听 update，父的 name 不动。" },
          { id: "split", label: "父仍是 Ada，子变成 Lin。两张脸", correct: true, why: "defineModel 发现父没接写回，就改本地。门只开了一半。" },
          { id: "snap", label: "子也会弹回 Ada。受控了", correct: false, why: "没有监听者时，defineModel 允许本地值。弹回是下一处错 emit 的脸。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appOneWay, "src/Field.vue": fieldModel },
        blocks: [{ id: "half", label: "③ 只有 :model-value" }],
        narration: "子回到 defineModel。父只往下传，不听写回。",
      },
      counterfactual: {
        id: "door-half",
        title: "成对 vs 只进不出",
        setup: "同一子组件。差在父有没有 v-model。",
        worlds: [worldBound, worldOneWay],
        punchline: "v-model 是两扇合页。少一扇，子和父就各活各的。",
      },
      observe: {
        state: [
          { id: "p", label: "name", value: "Ada（冻住）", symbol: "name" },
          { id: "c", label: "model", value: "你打的字（本地）", symbol: "defineModel" },
        ],
        dom: [{ id: "card", label: ".card", value: "Ada" }],
        events: [{ id: "input", label: "input", value: "emit 了，没人听" }],
      },
      nodes: [
        { id: "child", kind: "ref", label: "model 本地" },
        { id: "parent", kind: "ref", label: "name", symbol: "name" },
        { id: "dom", kind: "dom", label: "父仍 Ada" },
      ],
      edges: [
        { from: "child", to: "dom", label: "到不了" },
        { from: "parent", to: "dom" },
      ],
      why: {
        question: "emit 还在发生。为什么父不动？",
        choices: [
          { id: "listen", label: "没有 @update:modelValue。频道空了", correct: true, why: "和 World 8 喊错名字同一条缝：票送出去了，没人接。" },
          { id: "macro", label: "defineModel 在单向时会吞掉 emit", correct: false, why: "仍会 emit。父只是没听。" },
          { id: "value", label: ":model-value 是只读的，写会报错", correct: false, why: "不报错。静默裂成两张脸。" },
        ],
      },
      explanation: {
        headline: "少一扇合页，就裂成两份状态",
        body: "父冻在 Ada。子本地走到 Lin。这不是 Vue 坏了，是门没装全。下一镜更绝：子根本不走这扇门，自己另起一份 ref。",
      },
      faqs: [
        { q: "和 World 2 只写 :value 不写 @input 一样吗？", a: "一样。原生控件会把字吞掉或弹回。组件上 defineModel 选择本地留下，父不知道。" },
      ],
      tryThis: "改成 Lin。父必须仍是 Ada，子探针必须是 Lin。打开反事实对比成对的世界。",
      mapping: [{ code: ":model-value=\"name\"", runtime: "只读进子", ui: "父 Ada / 子 Lin" }],
    },
    {
      id: "definemodel-s3",
      tick: "S3",
      title: "子另起一份 ref",
      goal: "子不用 defineModel，改成本地 ref('')。父仍 v-model。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "父写了 v-model=\"name\"。子却绑着自己的 ref。打字会？",
        choices: [
          { id: "follow", label: "父跟着变。v-model 会穿透", correct: false, why: "v-model 只会写子声明的那扇门。子没有这扇门。" },
          { id: "split", label: "子变，父仍是 Ada。门没装", correct: true, why: "父在对空气说话。子的 input 绑的是另一份状态。" },
          { id: "err", label: "报错：多余的 v-model", correct: false, why: "多余的 v-model 会落到 attrs。常常不报错，只是没人用。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appBound, "src/Field.vue": fieldLocal },
        blocks: [{ id: "local", label: "④ 子用本地 ref" }],
        narration: "父以为门在。子把门拆了，自己在院子里放了个桶。",
      },
      observe: {
        state: [
          { id: "p", label: "name", value: "Ada" },
          { id: "c", label: "model", value: "从空字符串长出来" },
        ],
        dom: [{ id: "card", label: ".card", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "local", kind: "ref", label: "子 ref" },
        { id: "name", kind: "ref", label: "name" },
        { id: "dom", kind: "dom", label: "父 Ada" },
      ],
      edges: [{ from: "local", to: "dom", label: "过不去" }],
      explanation: {
        headline: "父的 v-model 不是魔法穿透",
        body: "没有 defineModel / modelValue，父写的 v-model 无处可去。下一镜把门装上，但父不传值——看默认值怎么填洞。",
      },
      faqs: [
        { q: "子初始是空的，不是 Ada？", a: "对。本地 ref('') 不知道父是 Ada。上一镜至少还读过父。这一镜连读边都没了。" },
      ],
      tryThis: "打几个字。父必须一直是 Ada。子从空白长出你打的字。",
      mapping: [{ code: "const model = ref('')", runtime: "另一份状态", ui: "父不知道" }],
    },
    {
      id: "definemodel-s4",
      tick: "S4",
      title: "父不传，默认值上场",
      goal: "defineModel({ default: '游客' })。父 <Field />，没有 v-model。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开页面。子输入框会？",
        choices: [
          { id: "guest", label: "游客。洞用默认值填", correct: true, why: "父没传 modelValue。default 就是这份本地初值。" },
          { id: "ada", label: "Ada。父卡片上写着 Ada", correct: false, why: "父没有 v-model。Ada 在父自己的 ref 里，没过门。" },
          { id: "empty", label: "空。没有 v-model 就没有值", correct: false, why: "default 就是为这种情况准备的。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appUnbound, "src/Field.vue": fieldDefault },
        blocks: [{ id: "def", label: "⑤ default: '游客'" }],
        narration: "父卡片仍写 Ada，但没把门打开。子自己填洞。",
      },
      observe: {
        state: [
          { id: "p", label: "name", value: "Ada（没过门）" },
          { id: "c", label: "model", value: "游客", symbol: "defineModel" },
        ],
        dom: [
          { id: "card", label: ".card", value: "Ada" },
          { id: "child", label: "子探针", value: "游客" },
        ],
        events: [],
      },
      nodes: [
        { id: "def", kind: "script", label: "default" },
        { id: "child", kind: "ref", label: "model" },
        { id: "parent", kind: "ref", label: "name" },
      ],
      edges: [
        { from: "def", to: "child" },
        { from: "parent", to: "child", label: "没接" },
      ],
      explanation: {
        headline: "默认值只在门没接上时说话",
        body: "和 withDefaults 同一类洞。下一镜把门接上：父的 Ada 必须压过游客。",
      },
      faqs: [
        { q: "在子里改游客，父会变吗？", a: "不会。没有 v-model，emit 没人听。和 S2 同一张裂脸，只是初值换成了默认值。" },
      ],
      tryThis: "页面打开时子必须是游客，父必须仍是 Ada。再打字，父仍不动。",
      mapping: [{ code: "default: '游客'", runtime: "父没传时的初值", ui: "子游客 / 父 Ada" }],
    },
    {
      id: "definemodel-s5",
      tick: "S5",
      title: "父的值压过默认",
      goal: "仍是 default: '游客'。父重新 v-model=\"name\"，name 是 Ada。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "门接上了。打开页面，子会？",
        choices: [
          { id: "ada", label: "Ada。父是源", correct: true, why: "有 v-model 时，父的值压过 default。default 只填缺席。" },
          { id: "guest", label: "游客。写了 default 就永远是游客", correct: false, why: "和 withDefaults 一样：有传入就用传入的。" },
          { id: "join", label: "Ada游客。两份会拼起来", correct: false, why: "不会拼。一份源。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appBound, "src/Field.vue": fieldDefault },
        blocks: [{ id: "win", label: "⑥ 父 Ada 压过默认" }],
        narration: "同一份 default。只把门重新装上。",
      },
      observe: {
        state: [{ id: "n", label: "name", value: "Ada", symbol: "name" }],
        dom: [
          { id: "card", label: ".card", value: "Ada" },
          { id: "child", label: "子探针", value: "Ada" },
        ],
        events: [],
      },
      nodes: [
        { id: "parent", kind: "ref", label: "name" },
        { id: "def", kind: "script", label: "default" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [
        { from: "parent", to: "dom", label: "压过" },
        { from: "def", to: "dom", label: "让路" },
      ],
      explanation: {
        headline: "有源就听源，没源才填洞",
        body: "和 World 8 withDefaults 同一张图，方向是双向门。下一镜拆三种死法：只进不出、本地桶、喊错频道。",
      },
      faqs: [
        { q: "父的 name 是 undefined 呢？", a: "有 v-model 仍算接上了。undefined 会进来，default 不救。缺席和传入 undefined 不是一回事。" },
      ],
      tryThis: "打开就必须两边都是 Ada。改成 Lin，两边一起走。",
      mapping: [{ code: "v-model=\"name\"", runtime: "父压过 default", ui: "Ada" }],
    },
    {
      id: "definemodel-s6",
      tick: "S6",
      title: "拆成一半门 / 本地桶 / 错频道",
      goal: "三种坏法：只进不出、子本地 ref、emit('update:value')。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到成对的门。先改成 Lin。父会？",
        choices: [
          { id: "lin", label: "Lin", correct: true, why: "先确认好的脸。再分别拆。" },
          { id: "ada", label: "Ada", correct: false, why: "那是拆掉之后。" },
          { id: "guest", label: "游客", correct: false, why: "那是没接门时的默认值。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appBound, "src/Field.vue": fieldModel },
        blocks: [{ id: "keep", label: "成对的门先留着" }],
        narration: "先改成 Lin。再分别：只进不出、本地桶、喊错频道。",
      },
      observe: {
        state: [{ id: "ok", label: "name", value: "跟子走" }],
        dom: [{ id: "card", label: ".card", value: "Lin" }],
        events: [],
      },
      nodes: [
        { id: "model", kind: "ref", label: "defineModel" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "model", to: "dom" }],
      ablations: [
        {
          id: "half",
          prompt: "如果父只写 :model-value？",
          files: { "src/App.vue": appOneWay, "src/Field.vue": fieldModel },
          expected: { kind: "stale", message: "父冻在 Ada。子本地能改。门缺合页。" },
          lesson: "v-model 是读写一对。少写回，就裂脸。",
        },
        {
          id: "bucket",
          prompt: "如果子改成本地 ref？",
          files: { "src/App.vue": appBound, "src/Field.vue": fieldLocal },
          expected: { kind: "stale", message: "父仍 Ada。子从空白另起一份。" },
          lesson: "父的 v-model 不会穿透进随便一个 input。",
        },
        {
          id: "wrong",
          prompt: "如果 emit 喊 update:value？",
          files: { "src/App.vue": appBound, "src/Field.vue": fieldWrongEmit },
          expected: { kind: "stale", message: "输入会弹回 Ada。受控却写错频道。" },
          lesson: "频道名是精确匹配。value 不是 modelValue。",
        },
      ],
      explanation: {
        headline: "双向门的三种死法",
        body: "缺写回、门不在、频道错。第三种最像「坏了」：:value 受控，字被父按回去。defineModel 在缺写回时选择本地留下——脸不同，缝是同一条。",
      },
      tryThis: "三种消融都打一次字：裂脸、父不知道、弹回。对上号再恢复。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先一半门（裂脸），再本地桶（父完全不知道），再错频道（弹回）。一次比一次更像 bug。" },
      ],
    },
    {
      id: "definemodel-s7",
      tick: "S7",
      title: "换：价钱",
      goal: "Price 用本地 ref。父 <Price />，没有 v-model。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "父价是 3。子输入框改成 9。父卡片会？",
        choices: [
          { id: "nine", label: "9。价钱组件总会写回", correct: false, why: "和名字那一课的本地桶同一张图。" },
          { id: "three", label: "仍是 3。门没装", correct: true, why: "子在自己的桶里改。父的 n 没过门。" },
          { id: "err", label: "报错", correct: false, why: "能跑。句子骗人。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore, "src/Price.vue": priceLocal },
        blocks: [{ id: "price", label: "换场景：价钱" }],
        narration: "名字换成价钱。问的仍是：子的输入框绑的是哪一份状态。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "3（冻住）" }],
        dom: [{ id: "card", label: ".card", value: "3" }],
        events: [],
      },
      nodes: [
        { id: "local", kind: "ref", label: "子 ref" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "local", to: "dom" }],
      ablations: [
        {
          id: "fix",
          prompt: "改成 defineModel 并接上 v-model 之后？",
          files: { "src/App.vue": transferFixed, "src/Price.vue": priceModel },
          expected: {
            kind: "stale",
            message: "这是修复：改子，父价跟着走。门装上了。",
          },
          lesson: "下一课：.trim / .number 不会自动穿过这扇门。子要自己认修饰符。",
        },
      ],
      explanation: {
        headline: "组件 v-model 不是原生控件的赠品",
        body: "原生 input 的 v-model，Vue 替你接好。组件上的那扇门，要 defineModel 或自己写 props+emit。下一课往门上加锁：修饰符。",
      },
      faqs: [
        { q: "价钱框里其实是字符串 \"9\"？", a: "对。下一课 .number 才把种类扳回来。你已经在 World 8 见过 33。" },
      ],
      tryThis: "先改成 9，父必须仍是 3。再打开修复：父必须变成 9。",
      mapping: [
        { code: "<Price />", runtime: "门没装", ui: "父 3" },
        { code: "<Price v-model=\"n\" />", runtime: "defineModel 接通", ui: "父跟着走" },
      ],
    },
  ],
};
