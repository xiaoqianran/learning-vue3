import type { CausalLab, CounterfactualWorld } from "../types";

const appInject = `<script setup>
import { inject } from 'vue'
const who = inject('who', '游客')
</script>
<template>
  <p class="hint">inject('who')，缺席是游客</p>
  <p class="card">{{ who }}</p>
</template>
`;

const pluginAda = `export default {
  install(app) {
    app.provide('who', 'Ada')
  },
}
`;

const pluginEmpty = `export default {
  install() {},
}
`;

const pluginLin = `export default {
  install(app) {
    app.provide('who', 'Lin')
  },
}
`;

const mainNoUse = `import { createApp } from 'vue'
import App from './App.vue'
import Who from './who.js'

createApp(App).mount('#app')
`;

const mainUse = `import { createApp } from 'vue'
import App from './App.vue'
import Who from './who.js'

createApp(App).use(Who).mount('#app')
`;

const mainUseLin = `import { createApp } from 'vue'
import App from './App.vue'
import Who from './who.js'

createApp(App).use(Who).mount('#app')
`;

const priceApp = `<script setup>
import { inject } from 'vue'
const who = inject('who', '游客')
</script>
<template>
  <p class="hint">价钱也要知道我是谁</p>
  <p class="card">{{ who }} · 36 元</p>
</template>
`;

const worldNoUse: CounterfactualWorld = {
  id: "nouse",
  name: "没有 app.use",
  tagline: "游客",
  files: {
    "src/main.js": mainNoUse,
    "src/App.vue": appInject,
    "src/who.js": pluginAda,
  },
  nodes: [
    { id: "plug", kind: "script", label: "provide Ada" },
    { id: "dom", kind: "dom", label: "游客" },
  ],
  edges: [{ from: "plug", to: "dom", label: "没接通" }],
  note: "install 没被调用。provide 停在插件文件里。",
};

const worldUse: CounterfactualWorld = {
  id: "use",
  name: "app.use(Who)",
  tagline: "Ada",
  files: {
    "src/main.js": mainUse,
    "src/App.vue": appInject,
    "src/who.js": pluginAda,
  },
  nodes: [
    { id: "use", kind: "script", label: "app.use", symbol: "app.use" },
    { id: "dom", kind: "dom", label: "Ada" },
  ],
  edges: [{ from: "use", to: "dom" }],
  note: "use 调用 install。provide 挂到应用上。inject 才能接到。",
};

export const PLUGIN_LAB: CausalLab = {
  id: "plugin",
  world: 15,
  concept: "app.use",
  title: "安装才接通",
  subtitle: "插件的 install 在组件树外面。app.use 才会调用它。provide 从应用接到 inject，不经过中间层。",
  promise:
    "一镜一条边：先缺席是游客，再插件写了 provide 但没 use 仍是游客，再 app.use 变成 Ada，再 install 空着仍是游客，再换一份插件变成 Lin。",
  minutes: 16,
  official: "/guide/reusability/plugins.html",
  scenes: [
    {
      id: "plugin-s0",
      tick: "S0",
      title: "没人 provide，缺席是游客",
      goal: "inject('who', '游客')。没有插件，没有 main.js。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appInject },
        blocks: [{ id: "none", label: "① 缺席" }],
        narration: "World 5 的 provide 写在祖先里。这一课 provide 写在树外面。先看没人给的脸。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "游客" }],
        dom: [{ id: "card", label: ".card", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "inj", kind: "script", label: "inject", symbol: "inject" },
        { id: "dom", kind: "dom", label: "游客" },
      ],
      edges: [{ from: "inj", to: "dom", label: "缺席" }],
      explanation: {
        headline: "缺席是一张脸，不是报错",
        body: "下一镜插件里 provide('who', 'Ada')，但 main.js 不调用 use。看它会不会自己接通。",
      },
      tryThis: "卡片必须写「游客」。",
      faqs: [
        { q: "和 World 5 的 inject 默认值一样吗？", a: "一样的缺席脸。下一镜的边不同：东西在插件里，不在祖先里。" },
      ],
    },
    {
      id: "plugin-s1",
      tick: "S1",
      title: "插件写了，没有 use",
      goal: "who.js 里 app.provide('who', 'Ada')。main.js 不写 .use。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "插件文件里是 Ada。画面会？",
        choices: [
          { id: "guest", label: "仍是游客。install 没人调用", correct: true, why: "import 插件不等于安装。use 才调用 install。" },
          { id: "ada", label: "Ada。文件在就会 provide", correct: false, why: "那是下一镜 app.use 的脸。" },
          { id: "err", label: "报错。import 了却没用", correct: false, why: "能跑。只是边没接通。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainNoUse,
          "src/App.vue": appInject,
          "src/who.js": pluginAda,
        },
        blocks: [{ id: "idle", label: "② 没接通" }],
        narration: "Ada 写在树外面。没有 use，install 不会跑。",
      },
      counterfactual: {
        id: "nouse-vs-use",
        title: "没 use vs use",
        setup: "同一份插件 provide Ada。差在 main.js 有没有 .use(Who)。",
        worlds: [worldNoUse, worldUse],
        punchline: "插件不是 import 完就活。use 才是那条边。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "游客" }],
        dom: [{ id: "card", label: ".card", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "plug", kind: "script", label: "provide Ada" },
        { id: "dom", kind: "dom", label: "游客" },
      ],
      edges: [{ from: "plug", to: "dom", label: "没接通" }],
      explanation: {
        headline: "import 不是安装",
        body: "和 World 3 忘了 app.use(pinia) 同一张图。下一镜只补 .use(Who)。",
      },
      faqs: [
        { q: "main.js 里 import Who 干什么？", a: "这一镜故意 import 却不用，证明 import 不够。下一镜同一行 import，加上 .use。" },
      ],
      tryThis: "卡片必须仍是「游客」。打开反事实。",
      mapping: [{ code: "import Who 且无 .use", runtime: "install 没跑", ui: "游客" }],
    },
    {
      id: "plugin-s2",
      tick: "S2",
      title: "app.use 调用 install",
      goal: "createApp(App).use(Who).mount('#app')。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加上 .use(Who) 之后。卡片会？",
        choices: [
          { id: "ada", label: "Ada。install 里的 provide 接到 inject", correct: true, why: "use 调用 install(app)。provide 挂在应用上。" },
          { id: "guest", label: "仍是游客。provide 必须写在 App 里", correct: false, why: "应用级 provide 和祖先 provide 都能被 inject 接到。" },
          { id: "err", label: "报错。插件不能 provide", correct: false, why: "这是插件最常见的一种边。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainUse,
          "src/App.vue": appInject,
          "src/who.js": pluginAda,
        },
        blocks: [{ id: "use", label: "③ app.use" }],
        narration: "插件一行没改。只多了 .use(Who)。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "Ada" }],
        dom: [{ id: "card", label: ".card", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "use", kind: "script", label: "app.use", symbol: "app.use" },
        { id: "p", kind: "script", label: "provide" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [
        { from: "use", to: "p" },
        { from: "p", to: "dom" },
      ],
      explanation: {
        headline: "use 才是接通",
        body: "下一镜 install 变成空函数。use 还在，provide 不在。",
      },
      faqs: [
        { q: "为什么不写在 App 里 provide？", a: "可以。插件把这条边抽到树外面，好让很多应用共用同一份安装。" },
      ],
      tryThis: "卡片必须写「Ada」。不要游客。",
      mapping: [{ code: "app.use(Who)", runtime: "install → provide", ui: "Ada" }],
    },
    {
      id: "plugin-s3",
      tick: "S3",
      title: "use 了，install 是空的",
      goal: "who.js 的 install 什么都不做。main.js 仍 .use。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "安装了空插件。卡片会？",
        choices: [
          { id: "guest", label: "游客。use 只保证调用，不保证 provide", correct: true, why: "边是 install 里面那一行。空函数没有 provide。" },
          { id: "ada", label: "Ada。文件名还叫 who", correct: false, why: "名字不是边。" },
          { id: "err", label: "报错。空 install 不合法", correct: false, why: "合法。只是什么都没挂。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainUse,
          "src/App.vue": appInject,
          "src/who.js": pluginEmpty,
        },
        blocks: [{ id: "empty", label: "④ 空 install" }],
        narration: "use 还在。里面的 provide 被掏空。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "游客" }],
        dom: [{ id: "card", label: ".card", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "use", kind: "script", label: "app.use" },
        { id: "dom", kind: "dom", label: "游客" },
      ],
      edges: [{ from: "use", to: "dom", label: "空 install" }],
      explanation: {
        headline: "接通的是空壳",
        body: "S1 是没调用。这一镜是调用了但没挂。看起来都是游客，原因不同。下一镜换一份会 provide Lin 的插件。",
      },
      faqs: [
        { q: "和忘了 .use 怎么区分？", a: "脸一样。打开插件文件看 install 里有没有 provide。那才是边。" },
      ],
      tryThis: "卡片必须是「游客」。这一镜有 .use，只是 install 是空的。",
      mapping: [{ code: "install() {}", runtime: "没 provide", ui: "游客" }],
    },
    {
      id: "plugin-s4",
      tick: "S4",
      title: "换一份插件，谁变成 Lin",
      goal: "who.js provide('who', 'Lin')。仍 app.use。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "插件改成 Lin。卡片会？",
        choices: [
          { id: "lin", label: "Lin。同一条边，值换了", correct: true, why: "use 还是那次。provide 的值写在插件里。" },
          { id: "ada", label: "仍是 Ada。use 会缓存第一次", correct: false, why: "这一镜文件里已经是 Lin。" },
          { id: "guest", label: "游客。换插件要换钥匙", correct: false, why: "钥匙还是 who。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainUseLin,
          "src/App.vue": appInject,
          "src/who.js": pluginLin,
        },
        blocks: [{ id: "lin", label: "⑤ 值在插件里" }],
        narration: "main.js 一行没改。Ada 换成 Lin。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "Lin" }],
        dom: [{ id: "card", label: ".card", value: "Lin" }],
        events: [],
      },
      nodes: [
        { id: "p", kind: "script", label: "provide Lin" },
        { id: "dom", kind: "dom", label: "Lin" },
      ],
      edges: [{ from: "p", to: "dom" }],
      explanation: {
        headline: "值住在插件里",
        body: "下一镜拆三种：没 use、空 install、接到 Lin。",
      },
      faqs: [
        { q: "options 呢？", a: "app.use(Who, { name: 'Ada' })。下一课把名字从插件里拿出来，变成安装时传入。" },
      ],
      tryThis: "卡片必须写「Lin」。不要 Ada，不要游客。",
      mapping: [{ code: "provide('who', 'Lin')", runtime: "应用级 provide", ui: "Lin" }],
    },
    {
      id: "plugin-s5",
      tick: "S5",
      title: "钥匙写错，仍是游客",
      goal: "插件 provide('name', 'Ada')。App 仍 inject('who')。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "钥匙对不上。卡片会？",
        choices: [
          { id: "guest", label: "游客。挂了，但钥匙不是 who", correct: true, why: "和 World 5 伸错手同一张脸。插件也会写错钥匙。" },
          { id: "ada", label: "Ada。use 过就会注入所有 provide", correct: false, why: "inject 只认自己那把钥匙。" },
          { id: "err", label: "报错。钥匙必须同名", correct: false, why: "缺席走默认值。不报错。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainUse,
          "src/App.vue": appInject,
          "src/who.js": `export default {
  install(app) {
    app.provide('name', 'Ada')
  },
}
`,
        },
        blocks: [{ id: "key", label: "⑥ 钥匙错了" }],
        narration: "install 跑了。挂的是 name。App 伸手 who。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "游客" }],
        dom: [{ id: "card", label: ".card", value: "游客" }],
        events: [],
      },
      nodes: [
        { id: "p", kind: "script", label: "provide name" },
        { id: "i", kind: "script", label: "inject who" },
      ],
      edges: [{ from: "p", to: "i", label: "对不上" }],
      explanation: {
        headline: "接通了，钥匙不对",
        body: "三种游客：没 use、空 install、钥匙错。下一镜把它们拆开。",
      },
      faqs: [
        { q: "InjectionKey 呢？", a: "World 8 那把类型钥匙。这一课先把运行时的边看清：字符串也对得上、也对不上。" },
      ],
      tryThis: "卡片必须是「游客」。插件文件里其实写了 Ada。",
      mapping: [{ code: "provide('name') / inject('who')", runtime: "对不上", ui: "游客" }],
    },
    {
      id: "plugin-s6",
      tick: "S6",
      title: "拆成没 use / 空壳 / 钥匙错",
      goal: "对照：不调用 use、空 install、provide 的钥匙写错。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到 app.use 且 provide who=Ada。卡片会？",
        choices: [
          { id: "ada", label: "Ada", correct: true, why: "先确认好的脸。" },
          { id: "guest", label: "游客", correct: false, why: "那是三种坏法。" },
          { id: "lin", label: "Lin", correct: false, why: "那是换了值。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainUse,
          "src/App.vue": appInject,
          "src/who.js": pluginAda,
        },
        blocks: [{ id: "keep", label: "Ada 先留着" }],
        narration: "先看见 Ada。再分别：没 use、空 install、钥匙错。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "Ada" }],
        dom: [{ id: "card", label: ".card", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "use", kind: "script", label: "app.use" },
        { id: "dom", kind: "dom", label: "Ada" },
      ],
      edges: [{ from: "use", to: "dom" }],
      ablations: [
        {
          id: "nouse",
          prompt: "如果 main.js 不写 .use？",
          files: {
            "src/main.js": mainNoUse,
            "src/App.vue": appInject,
            "src/who.js": pluginAda,
          },
          expected: { kind: "stale", message: "游客。install 没跑。" },
          lesson: "import 不是安装。",
        },
        {
          id: "empty",
          prompt: "如果 install 是空的？",
          files: {
            "src/main.js": mainUse,
            "src/App.vue": appInject,
            "src/who.js": pluginEmpty,
          },
          expected: { kind: "stale", message: "游客。调用了，但没挂。" },
          lesson: "接通的是空壳。",
        },
        {
          id: "key",
          prompt: "如果 provide 的钥匙是 name？",
          files: {
            "src/main.js": mainUse,
            "src/App.vue": appInject,
            "src/who.js": `export default {
  install(app) {
    app.provide('name', 'Ada')
  },
}
`,
          },
          expected: { kind: "stale", message: "游客。挂了，钥匙对不上。" },
          lesson: "接通了，钥匙不对。",
        },
      ],
      explanation: {
        headline: "没调用、空壳、钥匙错",
        body: "三张游客，三种原因。下一课插件不只 provide：还可以注册全局组件。",
      },
      tryThis: "三种消融都是游客。对上号再恢复 Ada。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先没 use，再空 install，再钥匙错。" },
      ],
    },
    {
      id: "plugin-s7",
      tick: "S7",
      title: "换：价钱",
      goal: "卡片写 who · 36 元。插件 provide Ada。main.js 没有 .use。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "打开之后。卡片会？",
        choices: [
          { id: "guest", label: "游客 · 36 元。和 who 那一课同一张没接通", correct: true, why: "换了文案，use 边还在。" },
          { id: "ada", label: "Ada · 36 元。价钱很轻", correct: false, why: "install 没跑。" },
          { id: "err", label: "报错", correct: false, why: "能跑。缺席是游客。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainNoUse,
          "src/App.vue": priceApp,
          "src/who.js": pluginAda,
        },
        blocks: [{ id: "price", label: "换场景：价钱" }],
        narration: "人名换成价钱。问的仍是：插件安装了没有。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "游客" }],
        dom: [{ id: "card", label: ".card", value: "游客 · 36 元" }],
        events: [],
      },
      nodes: [
        { id: "plug", kind: "script", label: "provide Ada" },
        { id: "dom", kind: "dom", label: "游客" },
      ],
      edges: [{ from: "plug", to: "dom", label: "没接通" }],
      ablations: [
        {
          id: "fix",
          prompt: "加上 .use(Who) 之后？",
          files: {
            "src/main.js": mainUse,
            "src/App.vue": priceApp,
            "src/who.js": pluginAda,
          },
          expected: {
            kind: "stale",
            message: "这是修复：Ada · 36 元。",
          },
          lesson: "下一课：插件还能 app.component，让模板里直接写标签。",
        },
      ],
      explanation: {
        headline: "树外面的 provide，要 use 来接",
        body: "缺席是游客。写了不等于安装。下一课注册全局组件：连 import 都不需要，但同样要 use。",
      },
      faqs: [
        { q: "和 Pinia 的 app.use 是同一条边吗？", a: "同一张接通图。Pinia 的 install 挂 store。这一课 install 挂 provide。你自己写的是后面那种。" },
      ],
      tryThis: "先看「游客 · 36 元」。再打开修复：必须变成「Ada · 36 元」。",
      mapping: [
        { code: "无 .use", runtime: "install 没跑", ui: "游客" },
        { code: "app.use(Who)", runtime: "provide 接通", ui: "Ada" },
      ],
    },
  ],
};
