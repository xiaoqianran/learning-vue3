import type { CausalLab, CounterfactualWorld } from "../types";

const badge = `<template>
  <p class="card">会员</p>
</template>
`;

const appLocal = `<script setup>
import Badge from './Badge.vue'
</script>
<template>
  <p class="hint">本地 import Badge</p>
  <Badge />
</template>
`;

const appBare = `<script setup>
</script>
<template>
  <p class="hint">模板里写了 Badge，没有 import</p>
  <Badge />
</template>
`;

const pluginReg = `import Badge from './Badge.vue'
export default {
  install(app) {
    app.component('Badge', Badge)
  },
}
`;

const pluginEmpty = `export default {
  install() {},
}
`;

const pluginTag = `import Badge from './Badge.vue'
export default {
  install(app) {
    app.component('Tag', Badge)
  },
}
`;

const mainNoUse = `import { createApp } from 'vue'
import App from './App.vue'
import Badges from './badges.js'

createApp(App).mount('#app')
`;

const mainUse = `import { createApp } from 'vue'
import App from './App.vue'
import Badges from './badges.js'

createApp(App).use(Badges).mount('#app')
`;

const priceBadge = `<template>
  <p class="card">36 元</p>
</template>
`;

const appPrice = `<script setup>
</script>
<template>
  <p class="hint">模板里写了 Price，没有 import</p>
  <Price />
</template>
`;

const pluginPrice = `import Price from './Price.vue'
export default {
  install(app) {
    app.component('Price', Price)
  },
}
`;

const worldBare: CounterfactualWorld = {
  id: "bare",
  name: "没有注册",
  tagline: "没有会员",
  files: { "src/App.vue": appBare },
  nodes: [
    { id: "tag", kind: "component", label: "Badge" },
    { id: "dom", kind: "dom", label: "空白" },
  ],
  edges: [{ from: "tag", to: "dom", label: "认不到" }],
  note: "模板里的 Badge 不是 HTML。没有注册，Vue 画不出这张脸。",
};

const worldReg: CounterfactualWorld = {
  id: "reg",
  name: "插件注册",
  tagline: "会员",
  files: {
    "src/main.js": mainUse,
    "src/App.vue": appBare,
    "src/badges.js": pluginReg,
    "src/Badge.vue": badge,
  },
  nodes: [
    { id: "reg", kind: "script", label: "app.component", symbol: "app.component" },
    { id: "dom", kind: "dom", label: "会员" },
  ],
  edges: [{ from: "reg", to: "dom" }],
  note: "use 调用 install。install 里 app.component。模板不用 import。",
};

export const GLOBCOMP_LAB: CausalLab = {
  id: "globcomp",
  world: 15,
  concept: "app.component",
  title: "标签不用 import",
  subtitle: "插件可以 app.component 注册全局组件。模板里直接写标签。没注册，就没有这张脸。",
  promise:
    "一镜一条边：先本地 import 有会员，再去掉 import 空白，再插件注册出现会员，再 use 了但没注册仍空白，再注册成 Tag 对不上 Badge。",
  minutes: 16,
  official: "/guide/reusability/plugins.html#writing-a-plugin",
  scenes: [
    {
      id: "globcomp-s0",
      tick: "S0",
      title: "本地 import，有会员",
      goal: "import Badge from './Badge.vue'。<Badge />。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appLocal, "src/Badge.vue": badge },
        blocks: [{ id: "local", label: "① 本地 import" }],
        narration: "上一课插件 provide 名字。这一课插件注册组件。先看平时的本地 import。",
      },
      observe: {
        state: [],
        dom: [{ id: "card", label: ".card", value: "会员" }],
        events: [],
      },
      nodes: [
        { id: "imp", kind: "script", label: "import" },
        { id: "dom", kind: "dom", label: "会员" },
      ],
      edges: [{ from: "imp", to: "dom" }],
      explanation: {
        headline: "本地 import 是一条边",
        body: "下一镜把 import 拿掉，模板里仍写 <Badge />。",
      },
      tryThis: "必须看见「会员」。",
      faqs: [
        { q: "这不就是 World 2 的组件吗？", a: "是。下一镜问：没有 import，这张脸还在不在。" },
      ],
    },
    {
      id: "globcomp-s1",
      tick: "S1",
      title: "没有 import，也没有注册",
      goal: "模板 <Badge />。没有 import，没有插件。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "去掉 import 之后。画面会？",
        choices: [
          { id: "blank", label: "没有「会员」。Vue 认不到这个标签", correct: true, why: "Badge 不是 HTML。没注册就画不出组件。" },
          { id: "keep", label: "仍有会员。标签名够了", correct: false, why: "标签要对应一份组件。" },
          { id: "html", label: "出现一个空的 <badge> 原生标签", correct: false, why: "Vue 会警告认不到。预览里通常什么都不画。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appBare },
        blocks: [{ id: "miss", label: "② 认不到" }],
        narration: "标签还在。人走了。",
      },
      counterfactual: {
        id: "bare-vs-reg",
        title: "没注册 vs 插件注册",
        setup: "模板都写 <Badge />。差在有没有 app.component。",
        worlds: [worldBare, worldReg],
        punchline: "全局注册不是少写一行 import。它是安装时挂上的一张脸。",
      },
      observe: {
        state: [],
        dom: [{ id: "app", label: "#app", value: "没有会员" }],
        events: [],
      },
      nodes: [
        { id: "tag", kind: "component", label: "Badge" },
        { id: "dom", kind: "dom", label: "空白" },
      ],
      edges: [{ from: "tag", to: "dom", label: "认不到" }],
      explanation: {
        headline: "标签不是组件",
        body: "下一镜插件里 app.component('Badge', Badge)，再 app.use。",
      },
      faqs: [
        { q: "控制台会警告吗？", a: "会：Failed to resolve component: Badge。画面上常常什么都没有。" },
      ],
      tryThis: "必须没有「会员」四个字。打开反事实。",
      mapping: [{ code: "<Badge /> 且无注册", runtime: "认不到", ui: "空白" }],
    },
    {
      id: "globcomp-s2",
      tick: "S2",
      title: "插件替你注册",
      goal: "badges.js：app.component('Badge', Badge)。main.js：app.use。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "App 仍没有 import。会？",
        choices: [
          { id: "ok", label: "出现会员。全局注册过，模板直接写", correct: true, why: "install 里挂上的组件，整棵树都能用。" },
          { id: "blank", label: "仍空白。模板必须 import", correct: false, why: "本地 import 不是唯一的边。" },
          { id: "err", label: "报错。插件不能注册组件", correct: false, why: "这是插件第二种常见的边。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainUse,
          "src/App.vue": appBare,
          "src/badges.js": pluginReg,
          "src/Badge.vue": badge,
        },
        blocks: [{ id: "reg", label: "③ app.component" }],
        narration: "App 一行没改。注册发生在树外面。",
      },
      observe: {
        state: [],
        dom: [{ id: "card", label: ".card", value: "会员" }],
        events: [],
      },
      nodes: [
        { id: "use", kind: "script", label: "app.use" },
        { id: "reg", kind: "script", label: "app.component", symbol: "app.component" },
        { id: "dom", kind: "dom", label: "会员" },
      ],
      edges: [
        { from: "use", to: "reg" },
        { from: "reg", to: "dom" },
      ],
      explanation: {
        headline: "注册也要先安装",
        body: "下一镜 use 还在，install 变成空的：标签又认不到。",
      },
      faqs: [
        { q: "能同时 import 吗？", a: "能。本地的同名组件会盖过全局。这一课先看只有全局的脸。" },
      ],
      tryThis: "必须看见「会员」。App.vue 里不要有 import。",
      mapping: [{ code: "app.component('Badge', Badge)", runtime: "全局注册", ui: "会员" }],
    },
    {
      id: "globcomp-s3",
      tick: "S3",
      title: "use 了，没有注册",
      goal: "badges.js 的 install 是空的。main.js 仍 .use。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "安装了空插件。会？",
        choices: [
          { id: "blank", label: "没有会员。use 不自动注册文件名", correct: true, why: "边是 app.component 那一行。" },
          { id: "ok", label: "仍有会员。Badge.vue 还在", correct: false, why: "文件在不等于注册。" },
          { id: "err", label: "报错。空插件不合法", correct: false, why: "合法。只是没挂组件。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainUse,
          "src/App.vue": appBare,
          "src/badges.js": pluginEmpty,
          "src/Badge.vue": badge,
        },
        blocks: [{ id: "empty", label: "④ 空 install" }],
        narration: "Badge.vue 还在项目里。没有人把它挂上。",
      },
      observe: {
        state: [],
        dom: [{ id: "app", label: "#app", value: "没有会员" }],
        events: [],
      },
      nodes: [
        { id: "use", kind: "script", label: "app.use" },
        { id: "dom", kind: "dom", label: "空白" },
      ],
      edges: [{ from: "use", to: "dom", label: "没注册" }],
      explanation: {
        headline: "文件在，不等于挂上",
        body: "下一镜注册成 Tag，模板仍写 Badge。",
      },
      faqs: [
        { q: "和没 use 怎么区分？", a: "脸一样空白。打开插件看有没有 app.component。" },
      ],
      tryThis: "必须没有「会员」。这一镜有 .use，只是没注册。",
      mapping: [{ code: "install() {}", runtime: "没 app.component", ui: "空白" }],
    },
    {
      id: "globcomp-s4",
      tick: "S4",
      title: "挂成 Tag，模板写 Badge",
      goal: "app.component('Tag', Badge)。模板仍 <Badge />。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "名字对不上。会？",
        choices: [
          { id: "blank", label: "没有会员。注册名和标签名是同一把钥匙", correct: true, why: "和 provide/inject 钥匙错同一张图。" },
          { id: "ok", label: "仍有会员。文件叫 Badge.vue", correct: false, why: "全局名是第一个参数，不是文件名。" },
          { id: "tag", label: "出现 Tag 字样", correct: false, why: "模板没写 <Tag />。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainUse,
          "src/App.vue": appBare,
          "src/badges.js": pluginTag,
          "src/Badge.vue": badge,
        },
        blocks: [{ id: "name", label: "⑤ 名字错了" }],
        narration: "组件挂上了。门牌写 Tag。模板喊 Badge。",
      },
      observe: {
        state: [],
        dom: [{ id: "app", label: "#app", value: "没有会员" }],
        events: [],
      },
      nodes: [
        { id: "reg", kind: "script", label: "component Tag" },
        { id: "tag", kind: "component", label: "<Badge />" },
      ],
      edges: [{ from: "reg", to: "tag", label: "对不上" }],
      explanation: {
        headline: "挂了，名字不对",
        body: "三种空白：没注册、空 install、名字错。下一镜拆开。",
      },
      faqs: [
        { q: "PascalCase 和 kebab-case？", a: "<Badge /> 和 <badge /> 是同一个。Tag 和 Badge 不是。" },
      ],
      tryThis: "必须没有「会员」。插件里其实挂了组件。",
      mapping: [{ code: "component('Tag') / <Badge />", runtime: "对不上", ui: "空白" }],
    },
    {
      id: "globcomp-s5",
      tick: "S5",
      title: "本地 import 盖过全局",
      goal: "插件注册 Badge=会员。App 又 import 一份写成「本地」。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "两份 Badge。画面会？",
        choices: [
          { id: "local", label: "本地。同名时，这一层的 import 赢", correct: true, why: "局部组件盖过全局。和 provide 近的赢同一张图。" },
          { id: "glob", label: "会员。插件后注册，盖过 import", correct: false, why: "模板先看本地。" },
          { id: "both", label: "两张卡。会叠起来", correct: false, why: "一个标签一份组件。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainUse,
          "src/App.vue": `<script setup>
import Badge from './Local.vue'
</script>
<template>
  <p class="hint">本地和全局都叫 Badge</p>
  <Badge />
</template>
`,
          "src/badges.js": pluginReg,
          "src/Badge.vue": badge,
          "src/Local.vue": `<template>
  <p class="card">本地</p>
</template>
`,
        },
        blocks: [{ id: "cover", label: "⑥ 本地盖过" }],
        narration: "全局挂了会员。这一层又引进「本地」。近的赢。",
      },
      observe: {
        state: [],
        dom: [{ id: "card", label: ".card", value: "本地" }],
        events: [],
      },
      nodes: [
        { id: "loc", kind: "component", label: "本地 import" },
        { id: "glob", kind: "component", label: "全局会员" },
        { id: "dom", kind: "dom", label: "本地" },
      ],
      edges: [{ from: "loc", to: "dom", label: "盖过" }],
      explanation: {
        headline: "近的盖过远的",
        body: "下一镜拆三种：没注册、空 install、名字错。",
      },
      faqs: [
        { q: "能让全局赢吗？", a: "去掉这一层的 import。全局是远的后备，不是盖子。" },
      ],
      tryThis: "必须看见「本地」，不要「会员」。",
      mapping: [{ code: "本地 import 同名", runtime: "局部盖过全局", ui: "本地" }],
    },
    {
      id: "globcomp-s6",
      tick: "S6",
      title: "拆成没注册 / 空壳 / 名字错",
      goal: "对照：没有插件、空 install、挂成 Tag。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到插件注册 Badge。会？",
        choices: [
          { id: "ok", label: "会员", correct: true, why: "先确认好的脸。" },
          { id: "blank", label: "空白", correct: false, why: "那是三种坏法。" },
          { id: "local", label: "本地", correct: false, why: "那是盖过。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainUse,
          "src/App.vue": appBare,
          "src/badges.js": pluginReg,
          "src/Badge.vue": badge,
        },
        blocks: [{ id: "keep", label: "会员先留着" }],
        narration: "先看见会员。再分别：没注册、空 install、名字错。",
      },
      observe: {
        state: [],
        dom: [{ id: "card", label: ".card", value: "会员" }],
        events: [],
      },
      nodes: [
        { id: "reg", kind: "script", label: "app.component" },
        { id: "dom", kind: "dom", label: "会员" },
      ],
      edges: [{ from: "reg", to: "dom" }],
      ablations: [
        {
          id: "bare",
          prompt: "如果没有插件？",
          files: { "src/App.vue": appBare },
          expected: { kind: "stale", message: "没有会员。标签认不到。" },
          lesson: "标签不是组件。",
        },
        {
          id: "empty",
          prompt: "如果 install 是空的？",
          files: {
            "src/main.js": mainUse,
            "src/App.vue": appBare,
            "src/badges.js": pluginEmpty,
            "src/Badge.vue": badge,
          },
          expected: { kind: "stale", message: "没有会员。use 了但没注册。" },
          lesson: "文件在，不等于挂上。",
        },
        {
          id: "tag",
          prompt: "如果挂成 Tag？",
          files: {
            "src/main.js": mainUse,
            "src/App.vue": appBare,
            "src/badges.js": pluginTag,
            "src/Badge.vue": badge,
          },
          expected: { kind: "stale", message: "没有会员。名字对不上。" },
          lesson: "挂了，名字不对。",
        },
      ],
      explanation: {
        headline: "认不到、空壳、名字错",
        body: "三张空白，三种原因。下一课把名字从插件里拿出来：安装时传入 options。",
      },
      tryThis: "三种消融都没有会员。对上号再恢复会员。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先没插件，再空 install，再名字错。" },
      ],
    },
    {
      id: "globcomp-s7",
      tick: "S7",
      title: "换：价钱",
      goal: "模板 <Price />。插件会注册 Price。main.js 没有 .use。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "打开之后。价钱会？",
        choices: [
          { id: "blank", label: "没有。和 Badge 那一课同一张没接通", correct: true, why: "换了组件，use 边还在。" },
          { id: "ok", label: "立刻 36 元。价钱很轻", correct: false, why: "install 没跑，没注册。" },
          { id: "err", label: "报错", correct: false, why: "能跑。只是认不到标签。" },
        ],
      },
      mutation: {
        files: {
          "src/main.js": mainNoUse,
          "src/App.vue": appPrice,
          "src/badges.js": pluginPrice,
          "src/Price.vue": priceBadge,
        },
        blocks: [{ id: "price", label: "换场景：价钱" }],
        narration: "会员换成价钱。问的仍是：注册有没有被安装。",
      },
      observe: {
        state: [],
        dom: [{ id: "app", label: "#app", value: "没有 36 元" }],
        events: [],
      },
      nodes: [
        { id: "reg", kind: "script", label: "component Price" },
        { id: "dom", kind: "dom", label: "空白" },
      ],
      edges: [{ from: "reg", to: "dom", label: "没接通" }],
      ablations: [
        {
          id: "fix",
          prompt: "加上 .use(Badges) 之后？",
          files: {
            "src/main.js": `import { createApp } from 'vue'
import App from './App.vue'
import Badges from './badges.js'

createApp(App).use(Badges).mount('#app')
`,
            "src/App.vue": appPrice,
            "src/badges.js": pluginPrice,
            "src/Price.vue": priceBadge,
          },
          expected: {
            kind: "stale",
            message: "这是修复：36 元出现。",
          },
          lesson: "下一课：install 的第二个参数，把值从插件里拿到安装那一行。",
        },
      ],
      explanation: {
        headline: "全局标签，也要先安装",
        body: "少写 import 不是魔法。安装时挂上的。下一课 options：同一份插件，安装时才说名字。",
      },
      faqs: [
        { q: "所有组件都该全局注册吗？", a: "不该。全局是「整棵树都会用」的那几个。其余用 import，边界更清楚。" },
      ],
      tryThis: "先看没有 36 元。再打开修复：必须出现 36 元。",
      mapping: [
        { code: "无 .use", runtime: "没注册", ui: "空白" },
        { code: "app.use + app.component", runtime: "全局挂上", ui: "36 元" },
      ],
    },
  ],
};
