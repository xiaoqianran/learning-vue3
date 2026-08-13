import type { CausalLab, CounterfactualWorld } from "../types";

const nameFirstOnly = `<script setup>
const model = defineModel()
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="model" placeholder="名" />
    <p class="probe">名：「{{ model }}」</p>
  </div>
</template>
`;

const nameBoth = `<script setup>
const first = defineModel()
const last = defineModel('last')
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="first" placeholder="名" />
    <input v-model="last" placeholder="姓" />
    <p class="probe">名：「{{ first }}」 姓：「{{ last }}」</p>
  </div>
</template>
`;

const nameFamily = `<script setup>
const first = defineModel()
const last = defineModel('family')
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="first" placeholder="名" />
    <input v-model="last" placeholder="姓" />
    <p class="probe">名：「{{ first }}」 姓：「{{ last }}」</p>
  </div>
</template>
`;

const nameDuplicate = `<script setup>
const a = defineModel()
const b = defineModel()
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="a" placeholder="A" />
    <input v-model="b" placeholder="B" />
  </div>
</template>
`;

const appFirst = `<script setup>
import { ref } from 'vue'
import Name from './Name.vue'
const first = ref('Ada')
const last = ref('Lovelace')
</script>
<template>
  <p class="card">{{ first }} {{ last }}</p>
  <Name v-model="first" />
</template>
`;

const appLastBound = `<script setup>
import { ref } from 'vue'
import Name from './Name.vue'
const first = ref('Ada')
const last = ref('Lovelace')
</script>
<template>
  <p class="card">{{ first }} {{ last }}</p>
  <Name v-model="first" v-model:last="last" />
</template>
`;

const appSwapped = `<script setup>
import { ref } from 'vue'
import Name from './Name.vue'
const first = ref('Ada')
const last = ref('Lovelace')
</script>
<template>
  <p class="card">{{ first }} {{ last }}</p>
  <p class="hint">把姓绑到了默认通道</p>
  <Name v-model="last" v-model:last="first" />
</template>
`;

const appWrongName = `<script setup>
import { ref } from 'vue'
import Name from './Name.vue'
const first = ref('Ada')
const last = ref('Lovelace')
</script>
<template>
  <p class="card">{{ first }} {{ last }}</p>
  <Name v-model="first" v-model:last="last" />
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
import Post from './Post.vue'
const title = ref('无题')
const body = ref('……')
</script>
<template>
  <p class="card">{{ title }}</p>
  <p class="hint">{{ body }}</p>
  <Post v-model="title" />
</template>
`;

const postLocalBody = `<script setup>
const title = defineModel()
const body = defineModel('body')
</script>
<template>
  <div class="panel">
    <h3>子</h3>
    <input v-model="title" placeholder="标题" />
    <input v-model="body" placeholder="正文" />
  </div>
</template>
`;

const transferFixed = `<script setup>
import { ref } from 'vue'
import Post from './Post.vue'
const title = ref('无题')
const body = ref('……')
</script>
<template>
  <p class="card">{{ title }}</p>
  <p class="hint">{{ body }}</p>
  <Post v-model="title" v-model:body="body" />
</template>
`;

const worldDefault: CounterfactualWorld = {
  id: "one",
  name: "只接默认通道",
  tagline: "v-model=\"first\"",
  files: { "src/App.vue": appFirst, "src/Name.vue": nameBoth },
  nodes: [
    { id: "first", kind: "ref", label: "first" },
    { id: "last", kind: "ref", label: "last 冻住" },
    { id: "dom", kind: "dom", label: "Ada Lovelace" },
  ],
  edges: [{ from: "first", to: "dom" }],
  note: "改名，卡片左边走。改姓，父的 Lovelace 不动。",
};

const worldNamed: CounterfactualWorld = {
  id: "two",
  name: "两条通道都接上",
  tagline: "v-model + v-model:last",
  files: { "src/App.vue": appLastBound, "src/Name.vue": nameBoth },
  nodes: [
    { id: "first", kind: "ref", label: "first" },
    { id: "last", kind: "ref", label: "last" },
    { id: "dom", kind: "dom", label: "两头都走" },
  ],
  edges: [
    { from: "first", to: "dom" },
    { from: "last", to: "dom" },
  ],
  note: "默认通道是名。名叫 last 的通道是姓。",
};

export const MULTIMODEL_LAB: CausalLab = {
  id: "multimodel",
  world: 9,
  concept: "named v-model",
  title: "一门不够就起名字",
  subtitle: "默认通道叫 modelValue。v-model:last 是另一扇门。名字对不上，就各活各的。",
  promise:
    "一镜一条边：先只通名，再子声明姓但父不接，再两条都接上，再把通道绑反，再子把门叫做 family，再两个默认 defineModel 撞车。",
  minutes: 16,
  official: "/guide/components/v-model.html#multiple-v-model-bindings",
  scenes: [
    {
      id: "multimodel-s0",
      tick: "S0",
      title: "默认通道只通「名」",
      goal: "子 defineModel()。父 v-model=\"first\"。姓在父卡片上，但没过门。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appFirst, "src/Name.vue": nameFirstOnly },
        blocks: [{ id: "one", label: "① 一扇默认的门" }],
        narration: "卡片写着 Ada Lovelace。子只有一个输入框。先认：这一扇门通的是名。",
      },
      observe: {
        state: [
          { id: "f", label: "first", value: "Ada", symbol: "first" },
          { id: "l", label: "last", value: "Lovelace（没过门）", symbol: "last" },
        ],
        dom: [{ id: "card", label: ".card", value: "Ada Lovelace" }],
        events: [],
      },
      nodes: [
        { id: "first", kind: "ref", label: "first", symbol: "first" },
        { id: "last", kind: "ref", label: "last" },
        { id: "dom", kind: "dom", label: "卡片" },
      ],
      edges: [
        { from: "first", to: "dom" },
        { from: "last", to: "dom", label: "没过门" },
      ],
      explanation: {
        headline: "v-model 默认只开一扇门",
        body: "这扇门的名字是 modelValue。姓 Lovelace 只是父自己的另一份 ref。下一镜子声明第二扇门，父先故意不接。",
      },
      tryThis: "改名。卡片左边必须跟着变，Lovelace 必须不动。",
      faqs: [
        { q: "父的 last 为什么在卡片上？", a: "好让你看见「有值」和「过了门」不是一回事。和 token 在内存、请求不带同一条缝。" },
      ],
    },
    {
      id: "multimodel-s1",
      tick: "S1",
      title: "子开了姓的门，父不接",
      goal: "子 defineModel('last')。父仍只有 v-model=\"first\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "在子的姓框把 Lovelace 改成 Byron。父卡片会？",
        choices: [
          { id: "byron", label: "Ada Byron。第二扇门会自己接上", correct: false, why: "父没有 v-model:last。emit('update:last') 没人听。" },
          { id: "stay", label: "仍是 Ada Lovelace。姓只改了子本地", correct: true, why: "和第一课只留入口同一张裂脸。通道名是 last，父没接。" },
          { id: "ada", label: "Byron Lovelace。改到了默认通道", correct: false, why: "默认通道仍是名。姓是另一扇门。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appFirst, "src/Name.vue": nameBoth },
        blocks: [{ id: "half", label: "② 子有 last，父没绑" }],
        narration: "子多了一扇门。父还只握着默认那一扇。",
      },
      observe: {
        state: [
          { id: "f", label: "first", value: "Ada" },
          { id: "l", label: "last", value: "Lovelace（冻住）" },
        ],
        dom: [{ id: "card", label: ".card", value: "Ada Lovelace" }],
        events: [],
      },
      nodes: [
        { id: "child", kind: "ref", label: "子 last 本地" },
        { id: "parent", kind: "ref", label: "父 last" },
        { id: "dom", kind: "dom", label: "Lovelace" },
      ],
      edges: [{ from: "child", to: "dom", label: "过不去" }],
      explanation: {
        headline: "声明一扇门，不等于父握住了它",
        body: "defineModel('last') 只在子这边开通道。父要写 v-model:last 才接上。下一镜补上。",
      },
      faqs: [
        { q: "改名还通吗？", a: "通。默认通道还在。裂的只是姓。" },
      ],
      tryThis: "改姓。子探针变成 Byron，父卡片必须仍是 Lovelace。再改名，左边仍走。",
      mapping: [{ code: "defineModel('last')", runtime: "子开了通道", ui: "父不接就裂脸" }],
    },
    {
      id: "multimodel-s2",
      tick: "S2",
      title: "两条通道都接上",
      goal: "父补上 v-model:last=\"last\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "现在改姓。父卡片会？",
        choices: [
          { id: "follow", label: "跟着变。第二扇门握住了", correct: true, why: "v-model:last 就是 :last + @update:last。" },
          { id: "stay", label: "仍冻住。具名 v-model 只是语法糖不能写", correct: false, why: "这正是官方写法。" },
          { id: "first", label: "名和姓会串到同一份状态", correct: false, why: "两扇门、两份 ref。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appLastBound, "src/Name.vue": nameBoth },
        blocks: [{ id: "two", label: "③ v-model:last" }],
        narration: "子一行没改。父把第二扇合页装上。",
      },
      counterfactual: {
        id: "named-door",
        title: "一扇 vs 两扇",
        setup: "子都声明了 last。差在父有没有 v-model:last。",
        worlds: [worldDefault, worldNamed],
        punchline: "通道要两边都叫同一个名字。子声明、父握住。",
      },
      observe: {
        state: [
          { id: "f", label: "first", value: "跟着名走" },
          { id: "l", label: "last", value: "跟着姓走", symbol: "last" },
        ],
        dom: [{ id: "card", label: ".card", value: "两头都走" }],
        events: [],
      },
      nodes: [
        { id: "first", kind: "ref", label: "modelValue" },
        { id: "last", kind: "ref", label: "last" },
        { id: "dom", kind: "dom", label: "卡片" },
      ],
      edges: [
        { from: "first", to: "dom", label: "默认" },
        { from: "last", to: "dom", label: "具名" },
      ],
      explanation: {
        headline: "具名 v-model 就是第二扇门",
        body: "默认：modelValue / update:modelValue。具名 last：last / update:last。下一镜故意把线插反。",
      },
      faqs: [
        { q: "能开第三扇吗？", a: "能。defineModel('title')、defineModel('count')，父用 v-model:title、v-model:count。" },
      ],
      tryThis: "改名、改姓。卡片两边都必须跟着走。打开反事实对比只接一扇的世界。",
      mapping: [{ code: "v-model:last=\"last\"", runtime: "last ↔ update:last", ui: "姓跟着走" }],
    },
    {
      id: "multimodel-s3",
      tick: "S3",
      title: "把线插反",
      goal: "父写成 v-model=\"last\" v-model:last=\"first\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "在「名」那个输入框打字。卡片会？",
        choices: [
          { id: "first", label: "左边的名变。输入框写着名", correct: false, why: "默认通道被绑到了 last 这份状态。名的框改的是姓。" },
          { id: "swap", label: "右边的姓变。通道绑反了", correct: true, why: "标签是给人看的。通道认的是 v-model 还是 v-model:last。" },
          { id: "both", label: "两边一起变", correct: false, why: "两份状态仍分开，只是插错线。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appSwapped, "src/Name.vue": nameBoth },
        blocks: [{ id: "swap", label: "④ 默认通道绑到 last" }],
        narration: "门都在。线插反了。",
      },
      observe: {
        state: [
          { id: "f", label: "first", value: "被姓的框改" },
          { id: "l", label: "last", value: "被名的框改" },
        ],
        dom: [{ id: "card", label: ".card", value: "左右对调着走" }],
        events: [],
      },
      nodes: [
        { id: "box", kind: "dom", label: "名的框" },
        { id: "last", kind: "ref", label: "last" },
        { id: "card", kind: "dom", label: "卡片右边" },
      ],
      edges: [{ from: "box", to: "last", label: "插反" }],
      why: {
        question: "为什么输入框的 placeholder 不能救命？",
        choices: [
          { id: "ui", label: "placeholder 是标签。通道是 v-model 的名字", correct: true, why: "和 World 8 事件名 plus 不是 add 同一条规则：标签不是契约。" },
          { id: "vue", label: "Vue 会按 placeholder 猜通道", correct: false, why: "不会猜。" },
          { id: "order", label: "两个 v-model 按书写顺序配对", correct: false, why: "按通道名配对，不按顺序。" },
        ],
      },
      explanation: {
        headline: "通道认名字，不认标签",
        body: "名的框走默认通道。你把默认通道接到了 last。于是改「名」动的是卡片右边。下一镜子把姓这扇门叫做 family，父仍喊 last。",
      },
      faqs: [
        { q: "这和 emit('plus') 有什么关系？", a: "都是名字精确匹配。看起来像，对不上。" },
      ],
      tryThis: "在名的框打字，卡片右边必须变。在姓的框打字，卡片左边必须变。",
      mapping: [{ code: "v-model=\"last\"", runtime: "默认通道 → last", ui: "名的框改姓" }],
    },
    {
      id: "multimodel-s4",
      tick: "S4",
      title: "子叫 family，父喊 last",
      goal: "defineModel('family')。父仍 v-model:last。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "改姓。父卡片会？",
        choices: [
          { id: "follow", label: "跟着变。意思一样", correct: false, why: "family 不是 last。两把钥匙。" },
          { id: "split", label: "父冻住。子本地能改", correct: true, why: "和 usr / user、plus / add 同一张图。" },
          { id: "err", label: "报错：未知的 v-model:last", correct: false, why: "多余的 v-model:last 落到 attrs。常常不报错。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appWrongName, "src/Name.vue": nameFamily },
        blocks: [{ id: "name", label: "⑤ family vs last" }],
        narration: "父以为姓叫 last。子把门命名成 family。",
      },
      observe: {
        state: [{ id: "l", label: "last", value: "Lovelace（冻住）" }],
        dom: [{ id: "card", label: ".card", value: "Ada Lovelace" }],
        events: [],
      },
      nodes: [
        { id: "family", kind: "script", label: "family" },
        { id: "last", kind: "script", label: "last" },
        { id: "dom", kind: "dom", label: "冻住" },
      ],
      edges: [{ from: "family", to: "dom", label: "对不上" }],
      explanation: {
        headline: "通道名是精确匹配",
        body: "InjectionKey 那一课拼错变成游客。这一课拼错变成裂脸。下一镜看更硬的错：两个默认 defineModel() 撞车。",
      },
      faqs: [
        { q: "v-model:family 就能修好？", a: "能。或者子改回 defineModel('last')。两边同一个词。" },
      ],
      tryThis: "改姓。子探针变，父卡片必须仍是 Lovelace。改名仍通。",
      mapping: [{ code: "defineModel('family')", runtime: "update:family", ui: "父听 last，对不上" }],
    },
    {
      id: "multimodel-s5",
      tick: "S5",
      title: "两个默认 defineModel 撞车",
      goal: "子写两次 defineModel()，都想占 modelValue。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "预览会？",
        choices: [
          { id: "two", label: "两个输入框都能用，自动叫 modelValue2", correct: false, why: "不会自动改名。" },
          { id: "err", label: "编译失败：duplicate model name \"modelValue\"", correct: true, why: "默认通道只有一条。第二扇门必须起名字。" },
          { id: "last", label: "后写的覆盖先写的，只剩一个框", correct: false, why: "编译期就拦住。不是运行时覆盖。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appLastBound, "src/Name.vue": nameDuplicate },
        blocks: [{ id: "dup", label: "⑥ 两次 defineModel()" }],
        narration: "不想起名字。两条默认通道抢同一扇门。",
      },
      observe: {
        state: [{ id: "err", label: "编译", value: "duplicate model name" }],
        dom: [{ id: "app", label: "#app", value: "预览起不来" }],
        events: [],
      },
      nodes: [
        { id: "a", kind: "script", label: "defineModel()" },
        { id: "b", kind: "script", label: "defineModel()" },
        { id: "dom", kind: "dom", label: "错误" },
      ],
      edges: [{ from: "b", to: "dom", label: "撞车" }],
      explanation: {
        headline: "默认通道只有一条",
        body: "要第二扇门，必须 defineModel('某个名字')。这是编译期红线，不是运行时裂脸。下一镜把三种坏法放在一起。",
      },
      faqs: [
        { q: "defineModel() 和 defineModel('modelValue') 呢？", a: "同一个名字，一样撞车。" },
      ],
      tryThis: "预览应报 duplicate model name。这是少数「直接红」的脸，不是静默裂脸。",
      mapping: [{ code: "defineModel() × 2", runtime: "编译失败", ui: "起不来" }],
    },
    {
      id: "multimodel-s6",
      tick: "S6",
      title: "拆成不接 / 插反 / 撞车",
      goal: "三种坏法：父不接 last、线插反、两个默认模型。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到两扇门都接上。改姓。卡片会？",
        choices: [
          { id: "ok", label: "跟着变", correct: true, why: "先确认好的脸。" },
          { id: "stay", label: "冻住", correct: false, why: "那是不接。" },
          { id: "err", label: "报错", correct: false, why: "那是撞车。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appLastBound, "src/Name.vue": nameBoth },
        blocks: [{ id: "keep", label: "两扇门先留着" }],
        narration: "先改姓确认通。再分别：不接、插反、撞车。",
      },
      observe: {
        state: [{ id: "ok", label: "first / last", value: "都走" }],
        dom: [{ id: "card", label: ".card", value: "两头都走" }],
        events: [],
      },
      nodes: [
        { id: "first", kind: "ref", label: "first" },
        { id: "last", kind: "ref", label: "last" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "first", to: "dom" },
        { from: "last", to: "dom" },
      ],
      ablations: [
        {
          id: "half",
          prompt: "如果父不写 v-model:last？",
          files: { "src/App.vue": appFirst, "src/Name.vue": nameBoth },
          expected: { kind: "stale", message: "改姓只改子。父 Lovelace 冻住。" },
          lesson: "声明不是握住。",
        },
        {
          id: "swap",
          prompt: "如果把线插反？",
          files: { "src/App.vue": appSwapped, "src/Name.vue": nameBoth },
          expected: { kind: "stale", message: "名的框改姓。标签骗了你。" },
          lesson: "通道认名字。",
        },
        {
          id: "dup",
          prompt: "如果两次 defineModel()？",
          files: { "src/App.vue": appLastBound, "src/Name.vue": nameDuplicate },
          expected: { kind: "error", message: "duplicate model name \"modelValue\"。" },
          lesson: "第二扇门必须起名字。",
        },
      ],
      explanation: {
        headline: "具名通道的三种死法",
        body: "不接、插反、撞车。前两张是静默裂脸。第三张编译期就红。World 9 收束：组件上的 v-model 是门，修饰符是锁，名字是通道。",
      },
      tryThis: "三种消融都走一遍：冻住、左右对调、预览报错。对上号再恢复。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先不接（裂脸），再插反（看起来通、其实反），再撞车（直接红）。" },
      ],
    },
    {
      id: "multimodel-s7",
      tick: "S7",
      title: "换：帖子",
      goal: "Post 有 title 和 body 两扇门。父只 v-model=\"title\"。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "在正文框把 …… 改成 你好。父下方提示会？",
        choices: [
          { id: "hi", label: "你好。第二扇门会自己接", correct: false, why: "和姓那一课同一张图。" },
          { id: "stay", label: "仍是 ……。父没握 body", correct: true, why: "v-model 只接通了标题。正文是另一条通道。" },
          { id: "title", label: "标题变成你好", correct: false, why: "正文走的是 body 通道，不是默认通道。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore, "src/Post.vue": postLocalBody },
        blocks: [{ id: "post", label: "换场景：帖子" }],
        narration: "姓名换成标题和正文。问的仍是：第二扇门，父握住了没有。",
      },
      observe: {
        state: [{ id: "b", label: "body", value: "……（冻住）" }],
        dom: [{ id: "hint", label: ".hint", value: "……" }],
        events: [],
      },
      nodes: [
        { id: "body", kind: "ref", label: "body" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "body", to: "dom" }],
      ablations: [
        {
          id: "fix",
          prompt: "补上 v-model:body 之后？",
          files: { "src/App.vue": transferFixed, "src/Post.vue": postLocalBody },
          expected: {
            kind: "stale",
            message: "这是修复：改正文，父的提示跟着走。第二扇门握住了。",
          },
          lesson: "World 9 收束：一扇门、门上的锁、门的名字。下一处写组件表单时，先数有几扇门。",
        },
      ],
      explanation: {
        headline: "表单组件常常不止一扇门",
        body: "标题走默认通道，正文走 body。你已经会：不接就裂，插反就对调，撞车就红。类型、修饰符、通道名，都是同一张图上的契约。",
      },
      faqs: [
        { q: "默认通道能不能叫 title？", a: "能。defineModel('title')，父写 v-model:title。没有匿名门时，每一扇都起名字更不容易插反。" },
      ],
      tryThis: "先改正文，父必须仍是 ……。再打开修复：必须变成你好。标题那一扇始终通。",
      mapping: [
        { code: "v-model=\"title\"", runtime: "只通默认门", ui: "正文冻住" },
        { code: "v-model:body", runtime: "第二扇门", ui: "正文跟着走" },
      ],
    },
  ],
};
