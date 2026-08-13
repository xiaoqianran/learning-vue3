import type { CausalLab, CounterfactualWorld } from "../types";

const appInject = `<script setup>
import { inject } from 'vue'
const who = inject('who', '游客')
</script>
<template>
  <p class="hint">inject('who')</p>
  <p class="card">{{ who }}</p>
</template>
`;

const pluginOpt = `export default {
  install(app, options) {
    const name = (options && options.name) || '游客'
    app.provide('who', name)
  },
}
`;

const mainNone = `import { createApp } from 'vue'
import App from './App.vue'
import Who from './who.js'

createApp(App).use(Who).mount('#app')
`;

const mainAda = `import { createApp } from 'vue'
import App from './App.vue'
import Who from './who.js'

createApp(App).use(Who, { name: 'Ada' }).mount('#app')
`;

const mainWrong = `import { createApp } from 'vue'
import App from './App.vue'
import Who from './who.js'

createApp(App).use(Who, { title: 'Ada' }).mount('#app')
`;

const mainEmpty = `import { createApp } from 'vue'
import App from './App.vue'
import Who from './who.js'

createApp(App).use(Who, {}).mount('#app')
`;

const mainString = `import { createApp } from 'vue'
import App from './App.vue'
import Who from './who.js'

createApp(App).use(Who, 'Ada').mount('#app')
`;

const mainLin = `import { createApp } from 'vue'
import App from './App.vue'
import Who from './who.js'

createApp(App).use(Who, { name: 'Lin' }).mount('#app')
`;

const priceApp = `<script setup>
import { inject } from 'vue'
const who = inject('who', '游客')
</script>
<template>
  <p class="hint">价钱也读 who</p>
  <p class="card">{{ who }} · 36 元</p>
</template>
`;

const worldNone: CounterfactualWorld = {
  id: "none",
  name: "没有 options",
  tagline: "游客",
  files: {
    "src/main.js": mainNone,
    "src/App.vue": appInject,
    "src/who.js": pluginOpt,
  },
  nodes: [
    { id: "opt", kind: "script", label: "options" },
    { id: "dom", kind: "dom", label: "游客" },
  ],
  edges: [{ from: "opt", to: "dom", label: "缺席" }],
  note: "use(Who) 的第二个参数是 undefined。插件落到默认游客。",
};

const worldAda: CounterfactualWorld = {
  id: "ada",
  name: "{ name: 'Ada' }",
  tagline: "Ada",
  files: {
    "src/main.js": mainAda,
    "src/App.vue": appInject,
    "src/who.js": pluginOpt,
  },
  nodes: [
    { id: "opt", kind: "script", label: "options.name" },
    { id: "dom", kind: "dom", label: "Ada" },
  ],
  edges: [{ from: "opt", to: "dom" }],
  note: "安装时传入的对象，就是 install 的第二个参数。",
};

export const PLUGOPT_LAB: CausalLab = {
  id: "plugopt",
  world: 15,
  concept: "plugin options",
  title: "安装时才说名字",
  subtitle: "app.use(plugin, options) 的第二份，进 install 的第二个参数。插件默认值，安装时可以改。",
  promise:
    "一镜一条边：先不传 options 是游客，再传入 name: Ada，再写错成 title，再传空对象，再传入字符串对不上 name。",
  minutes: 16,
  official: "/guide/reusability/plugins.html#writing-a-plugin",
  scenes: [
    {
      id: "plugopt-s0",
      tick: "S0",
      title: "不传 options，默认游客",
      goal: "app.use(Who)。install 里 options.name || '游客'。",
      layer: "see",
      fading: 1,
      mutation: {
        files: {
          "src/main.js": mainNone,
          "src/App.vue": appInject,
          "src/who.js": pluginOpt,
        },
        blocks: [{ id: "def", label: "① 默认" }],
        narration: "上一课值写死在插件里。这一课值在安装那一行。先看没传的脸。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "游客" }],
        dom: [{ id: "card", label: ".card", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "opt", kind: "script", label: "options" },
        { id: "dom", kind: "dom", label: "游客" },
      ],
      edges: [{ from: "opt", to: "dom", label: "缺席" }],
      explanation: {
        headline: "插件自己准备缺席",
        body: "下一镜 use(Who, { name: 'Ada' })。同一份插件，安装时改名。",
      },
      tryThis: "卡片必须写「游客」。",
      faqs: [
        { q: "和 inject 的默认游客是同一张脸吗？", a: "看起来是。这一镜其实已经 provide 了，值就是游客。inject 的默认值没派上用场。" },
      ],
    },
    {
      id: "plugopt-s1",
      tick: "S1",
      title: "安装时传入 Ada",
      goal: "app.use(Who, { name: 'Ada' })。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加上第二份参数。卡片会？",
        choices: [
          { id: "ada", label: "Ada。options.name 进了 install", correct: true, why: "use 的第二份就是 install 的第二份。" },
          { id: "guest", label: "仍是游客。插件不认外部对象", correct: false, why: "这正是 options 的边。" },
          { id: "err", label: "报错。只能 use(plugin)", correct: false, why: "第二份是合法的。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainAda,
          "src/App.vue": appInject,
          "src/who.js": pluginOpt,
        },
        blocks: [{ id: "ada", label: "② options.name" }],
        narration: "插件一行没改。只在 use 上多了一个对象。",
      },
      counterfactual: {
        id: "none-vs-ada",
        title: "缺席 vs Ada",
        setup: "同一份插件。差在 use 的第二份有没有 name。",
        worlds: [worldNone, worldAda],
        punchline: "值不必写死在插件里。安装那一行也能说。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "Ada" }],
        dom: [{ id: "card", label: ".card", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "opt", kind: "script", label: "options.name" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [{ from: "opt", to: "dom" }],
      explanation: {
        headline: "第二份参数就是 options",
        body: "下一镜对象里写成 title: 'Ada'。钥匙错了。",
      },
      faqs: [
        { q: "能传三个参数吗？", a: "use 只把第二份交给 install。要更多，塞进这一个对象。" },
      ],
      tryThis: "卡片必须写「Ada」。打开反事实。",
      mapping: [{ code: "app.use(Who, { name: 'Ada' })", runtime: "options.name", ui: "Ada" }],
    },
    {
      id: "plugopt-s2",
      tick: "S2",
      title: "写成 title，对不上 name",
      goal: "app.use(Who, { title: 'Ada' })。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "对象里是 title。卡片会？",
        choices: [
          { id: "guest", label: "游客。插件读的是 options.name", correct: true, why: "和钥匙错同一张图。字段名是边。" },
          { id: "ada", label: "Ada。对象里有 Ada 就行", correct: false, why: "值在 title 上，代码读 name。" },
          { id: "err", label: "报错。options 形状不对", correct: false, why: "缺席落到默认游客。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainWrong,
          "src/App.vue": appInject,
          "src/who.js": pluginOpt,
        },
        blocks: [{ id: "title", label: "③ 字段错了" }],
        narration: "Ada 在对象里。门牌写 title。插件伸手 name。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "游客" }],
        dom: [{ id: "card", label: ".card", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "opt", kind: "script", label: "options.title" },
        { id: "read", kind: "script", label: "options.name" },
      ],
      edges: [{ from: "opt", to: "read", label: "对不上" }],
      explanation: {
        headline: "传了，字段不对",
        body: "下一镜传空对象 {}。name 仍是缺席。",
      },
      faqs: [
        { q: "和 provide('name') 有什么不同？", a: "那一课错的是 provide 钥匙。这一课错的是 options 字段。都是对不上。" },
      ],
      tryThis: "卡片必须是「游客」。对象里其实写了 Ada。",
      mapping: [{ code: "{ title: 'Ada' }", runtime: "options.name 缺席", ui: "游客" }],
    },
    {
      id: "plugopt-s3",
      tick: "S3",
      title: "空对象也是缺席",
      goal: "app.use(Who, {})。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "传了 {}。卡片会？",
        choices: [
          { id: "guest", label: "游客。对象在，name 不在", correct: true, why: "options 是真的。options.name 是 undefined。" },
          { id: "ada", label: "Ada。传了对象就算安装成功", correct: false, why: "成功安装不等于有名字。" },
          { id: "blank", label: "空白。空对象会拆掉插件", correct: false, why: "落到默认游客。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainEmpty,
          "src/App.vue": appInject,
          "src/who.js": pluginOpt,
        },
        blocks: [{ id: "empty", label: "④ 空对象" }],
        narration: "第二份在。里面是空的。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "游客" }],
        dom: [{ id: "card", label: ".card", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "opt", kind: "script", label: "{}" },
        { id: "dom", kind: "dom", label: "游客" },
      ],
      edges: [{ from: "opt", to: "dom", label: "name 缺席" }],
      explanation: {
        headline: "有对象，没有字段",
        body: "S0 是第二份 undefined。这一镜是 {}。脸一样，options 已经是对象。下一镜传入字符串 'Ada'。",
      },
      faqs: [
        { q: "为什么还要传 {}？", a: "有人会先写 use(Who, {}) 再补字段。空对象不是「没安装」。" },
      ],
      tryThis: "卡片必须是「游客」。main.js 里确实有第二个参数。",
      mapping: [{ code: "use(Who, {})", runtime: "options.name 仍缺", ui: "游客" }],
    },
    {
      id: "plugopt-s4",
      tick: "S4",
      title: "传入字符串，没有 .name",
      goal: "app.use(Who, 'Ada')。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "第二份是字符串 Ada。卡片会？",
        choices: [
          { id: "guest", label: "游客。字符串没有 .name", correct: true, why: "options && options.name：字符串的 name 是 undefined。" },
          { id: "ada", label: "Ada。插件会把字符串当名字", correct: false, why: "代码没这么写。它只读 .name。" },
          { id: "err", label: "报错。第二份必须是对象", correct: false, why: "Vue 允许任何第二份。怎么读是插件的事。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainString,
          "src/App.vue": appInject,
          "src/who.js": pluginOpt,
        },
        blocks: [{ id: "str", label: "⑤ 字符串" }],
        narration: "Ada 就在第二份上。插件却去点 .name。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "游客" }],
        dom: [{ id: "card", label: ".card", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "opt", kind: "script", label: "'Ada'" },
        { id: "read", kind: "script", label: "options.name" },
      ],
      edges: [{ from: "opt", to: "read", label: "没有字段" }],
      explanation: {
        headline: "值在，形状不对",
        body: "下一镜把同一份插件改成 { name: 'Lin' }。形状对了，人换了。",
      },
      faqs: [
        { q: "插件能不能认字符串？", a: "能。typeof options === 'string' ? options : options.name。这一课没写，所以游客。" },
      ],
      tryThis: "卡片必须是「游客」。第二份明明是 'Ada'。",
      mapping: [{ code: "use(Who, 'Ada')", runtime: "'Ada'.name 缺席", ui: "游客" }],
    },
    {
      id: "plugopt-s5",
      tick: "S5",
      title: "形状对了，人换成 Lin",
      goal: "app.use(Who, { name: 'Lin' })。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "name 是 Lin。卡片会？",
        choices: [
          { id: "lin", label: "Lin。同一条边，值换了", correct: true, why: "字段对了。值住在安装那一行。" },
          { id: "ada", label: "Ada。插件会记住上一镜", correct: false, why: "这一镜文件里已经是 Lin。" },
          { id: "guest", label: "游客。换人要换插件", correct: false, why: "options 就是为了不用换插件。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainLin,
          "src/App.vue": appInject,
          "src/who.js": pluginOpt,
        },
        blocks: [{ id: "lin", label: "⑥ 换人" }],
        narration: "插件一行没改。安装那一行换了人。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "Lin" }],
        dom: [{ id: "card", label: ".card", value: "Lin" }],
        events: [],
      },
      nodes: [
        { id: "opt", kind: "script", label: "name: Lin" },
        { id: "dom", kind: "dom", label: "Lin" },
      ],
      edges: [{ from: "opt", to: "dom" }],
      explanation: {
        headline: "插件是插座，options 是插头",
        body: "下一镜拆三种：title 错、空对象、字符串。",
      },
      faqs: [
        { q: "同一插件 use 两次？", a: "对象插件默认只安装一次。第二次会被跳过。要换人，改第一次的 options。" },
      ],
      tryThis: "卡片必须写「Lin」。",
      mapping: [{ code: "{ name: 'Lin' }", runtime: "options.name", ui: "Lin" }],
    },
    {
      id: "plugopt-s6",
      tick: "S6",
      title: "拆成字段错 / 空对象 / 字符串",
      goal: "对照：title、{}、'Ada'。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到 { name: 'Ada' }。卡片会？",
        choices: [
          { id: "ada", label: "Ada", correct: true, why: "先确认好的脸。" },
          { id: "guest", label: "游客", correct: false, why: "那是三种坏法。" },
          { id: "lin", label: "Lin", correct: false, why: "那是换人。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainAda,
          "src/App.vue": appInject,
          "src/who.js": pluginOpt,
        },
        blocks: [{ id: "keep", label: "Ada 先留着" }],
        narration: "先看见 Ada。再分别：title、空对象、字符串。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "Ada" }],
        dom: [{ id: "card", label: ".card", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "opt", kind: "script", label: "options.name" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [{ from: "opt", to: "dom" }],
      ablations: [
        {
          id: "title",
          prompt: "如果写成 { title: 'Ada' }？",
          files: {
            "src/main.js": mainWrong,
            "src/App.vue": appInject,
            "src/who.js": pluginOpt,
          },
          expected: { kind: "stale", message: "游客。字段对不上。" },
          lesson: "传了，字段不对。",
        },
        {
          id: "empty",
          prompt: "如果传 {}？",
          files: {
            "src/main.js": mainEmpty,
            "src/App.vue": appInject,
            "src/who.js": pluginOpt,
          },
          expected: { kind: "stale", message: "游客。有对象，没有 name。" },
          lesson: "空对象也是缺席。",
        },
        {
          id: "str",
          prompt: "如果传字符串 'Ada'？",
          files: {
            "src/main.js": mainString,
            "src/App.vue": appInject,
            "src/who.js": pluginOpt,
          },
          expected: { kind: "stale", message: "游客。字符串没有 .name。" },
          lesson: "值在，形状不对。",
        },
      ],
      explanation: {
        headline: "字段错、空对象、字符串",
        body: "三张游客，三种形状。World 15 收束：插件在树外面。use 才接通。options 是安装时说的话。",
      },
      tryThis: "三种消融都是游客。对上号再恢复 Ada。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先 title，再空对象，再字符串。" },
      ],
    },
    {
      id: "plugopt-s7",
      tick: "S7",
      title: "换：价钱",
      goal: "卡片 who · 36 元。use(Who) 没有第二份。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "打开之后。卡片会？",
        choices: [
          { id: "guest", label: "游客 · 36 元。没传 name", correct: true, why: "换了文案，options 边还在。" },
          { id: "ada", label: "Ada · 36 元。价钱很轻", correct: false, why: "这一镜没有第二份。" },
          { id: "err", label: "报错", correct: false, why: "能跑。默认游客。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainNone,
          "src/App.vue": priceApp,
          "src/who.js": pluginOpt,
        },
        blocks: [{ id: "price", label: "换场景：价钱" }],
        narration: "人名换成价钱。问的仍是：安装时有没有把名字说出来。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "游客" }],
        dom: [{ id: "card", label: ".card", value: "游客 · 36 元" }],
        events: [],
      },
      nodes: [
        { id: "opt", kind: "script", label: "options" },
        { id: "dom", kind: "dom", label: "游客" },
      ],
      edges: [{ from: "opt", to: "dom", label: "缺席" }],
      ablations: [
        {
          id: "fix",
          prompt: "加上 { name: 'Ada' } 之后？",
          files: {
            "src/main.js": mainAda,
            "src/App.vue": priceApp,
            "src/who.js": pluginOpt,
          },
          expected: {
            kind: "stale",
            message: "这是修复：Ada · 36 元。",
          },
          lesson: "World 15 收束：树外面的边，要 use 接通；名字可以留到安装时再说。下一课：有些节点不必再画。",
        },
      ],
      explanation: {
        headline: "安装时说的话",
        body: "同一份插件，不同应用传入不同 options。World 15 停在树外面的安装。下一课：有些节点不必再画。",
      },
      faqs: [
        { q: "Pinia 的 options 呢？", a: "createPinia() 自己就是那份配置。app.use(pinia) 往往不再传第二份。你自己的插件更常在 use 上说话。" },
      ],
      tryThis: "先看「游客 · 36 元」。再打开修复：必须变成「Ada · 36 元」。",
      mapping: [
        { code: "use(Who)", runtime: "默认游客", ui: "游客 · 36 元" },
        { code: "use(Who, { name: 'Ada' })", runtime: "options.name", ui: "Ada · 36 元" },
      ],
    },
  ],
};
