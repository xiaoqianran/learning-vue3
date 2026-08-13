import type { CausalLab, CounterfactualWorld } from "../types";

const clean = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const ticks = ref(0)
watchEffect((onCleanup) => {
  who.value
  ticks.value = 0
  const id = setInterval(() => {
    ticks.value += 1
  }, 700)
  onCleanup(() => clearInterval(id))
})
</script>
<template>
  <p class="hint">换人会清零。旧表会停</p>
  <p class="card">{{ who }}</p>
  <p class="probe">滴答 {{ ticks }}</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
</template>
`;

const leak = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const ticks = ref(0)
watchEffect(() => {
  who.value
  ticks.value = 0
  setInterval(() => {
    ticks.value += 1
  }, 700)
})
</script>
<template>
  <p class="hint">换人会清零。旧表不停</p>
  <p class="card">{{ who }}</p>
  <p class="probe">滴答 {{ ticks }}</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
</template>
`;

const haltClean = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const ticks = ref(0)
const stopWatch = watchEffect((onCleanup) => {
  who.value
  const id = setInterval(() => {
    ticks.value += 1
  }, 700)
  onCleanup(() => clearInterval(id))
})
</script>
<template>
  <p class="hint">停表会喊 onCleanup</p>
  <p class="card">{{ who }}</p>
  <p class="probe">滴答 {{ ticks }}</p>
  <button @click="stopWatch">停表</button>
</template>
`;

const haltLeak = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const ticks = ref(0)
const stopWatch = watchEffect(() => {
  who.value
  setInterval(() => {
    ticks.value += 1
  }, 700)
})
</script>
<template>
  <p class="hint">停表只停订阅。表还在走</p>
  <p class="card">{{ who }}</p>
  <p class="probe">滴答 {{ ticks }}</p>
  <button @click="stopWatch">停表</button>
</template>
`;

const roomClean = `<script setup>
import { ref, watchEffect } from 'vue'
const room = ref('A')
const ticks = ref(0)
watchEffect((onCleanup) => {
  room.value
  ticks.value = 0
  const id = setInterval(() => {
    ticks.value += 1
  }, 700)
  onCleanup(() => clearInterval(id))
})
</script>
<template>
  <p class="hint">换房应只有一只表</p>
  <p class="card">房间 {{ room }}</p>
  <p class="probe">滴答 {{ ticks }}</p>
  <button @click="room = room === 'A' ? 'B' : 'A'">换房</button>
</template>
`;

const roomLeak = `<script setup>
import { ref, watchEffect } from 'vue'
const room = ref('A')
const ticks = ref(0)
watchEffect(() => {
  room.value
  ticks.value = 0
  setInterval(() => {
    ticks.value += 1
  }, 700)
})
</script>
<template>
  <p class="hint">换房会多开一只表</p>
  <p class="card">房间 {{ room }}</p>
  <p class="probe">滴答 {{ ticks }}</p>
  <button @click="room = room === 'A' ? 'B' : 'A'">换房</button>
</template>
`;

const worldClean: CounterfactualWorld = {
  id: "clean",
  name: "换人摘旧表",
  tagline: "速度不变",
  files: { "src/App.vue": clean },
  nodes: [
    { id: "mop", kind: "effect", label: "onCleanup" },
    { id: "t", kind: "ref", label: "滴答" },
  ],
  edges: [{ from: "mop", to: "t", label: "旧表停" }],
  note: "换人先清零。一只表继续加。大约每 0.7 秒 +1。",
};

const worldLeak: CounterfactualWorld = {
  id: "leak",
  name: "旧表还在走",
  tagline: "清零之后跳得更快",
  files: { "src/App.vue": leak },
  nodes: [
    { id: "ghost", kind: "effect", label: "幽灵表" },
    { id: "t", kind: "ref", label: "滴答" },
  ],
  edges: [{ from: "ghost", to: "t", label: "没摘" }],
  note: "换人清零，但旧 interval 还在。两只表一起加，跳得更快。",
};

export const WATCHCLEAN_LAB: CausalLab = {
  id: "watchclean",
  world: 17,
  concept: "onCleanup",
  title: "再跑之前，先把旧的摘掉",
  subtitle: "watchEffect 再跑或 stop 时，会先喊 onCleanup。定时器不摘，就会变成第二只表。",
  promise:
    "一镜一条边：先一只表慢慢加，再换人清零仍一只，再忘记摘变成两只，再停表表也停，再停订阅表还走，再连换两次叠成三只。",
  minutes: 16,
  official: "/guide/essentials/watchers.html#side-effect-cleanup",
  scenes: [
    {
      id: "watchclean-s0",
      tick: "S0",
      title: "一只表，慢慢加",
      goal: "watchEffect 里 setInterval。onCleanup 里 clearInterval。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": clean },
        blocks: [{ id: "one", label: "① 一只表" }],
        narration: "上一课剪订阅。这一课副作用里开了表。先看干净的脸：只有一只。",
      },
      observe: {
        state: [{ id: "t", label: "滴答", value: "每 0.7 秒 +1" }],
        dom: [{ id: "probe", label: ".probe", value: "滴答 n" }],
        events: [],
      },
      nodes: [
        { id: "fx", kind: "effect", label: "watchEffect" },
        { id: "clock", kind: "effect", label: "setInterval" },
        { id: "t", kind: "ref", label: "滴答" },
      ],
      edges: [
        { from: "fx", to: "clock" },
        { from: "clock", to: "t" },
      ],
      explanation: {
        headline: "表是副作用开的，不是 Vue 开的",
        body: "下一镜点换人。谁变了，副作用再跑。再跑之前应先摘旧表。",
      },
      tryThis: "别点换人。等大约两秒，滴答必须慢慢变成 2 或 3。记住这速度。",
      faqs: [
        { q: "为什么副作用里不读 ticks？", a: "读了又写，会自己叫醒自己。interval 只负责写。名单上只有 who。" },
        { q: "这和 World 4 的 abort 是一回事吗？", a: "挂钩一样：再跑之前先清理。脸不同。那一课摘的是 fetch，这一课摘的是 setInterval。" },
      ],
    },
    {
      id: "watchclean-s1",
      tick: "S1",
      title: "换人清零，仍是一只表",
      goal: "点换人。onCleanup 先 clear 旧的，再开新的。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "等滴答到 2 以上，点换人。次数会？",
        choices: [
          { id: "reset", label: "先回 0，再按原来的速度加。旧表停了", correct: true, why: "再跑之前 onCleanup 摘掉旧 interval。新的一只从 0 开始。" },
          { id: "fast", label: "回 0 之后跳得更快。旧表还在", correct: false, why: "那是下一镜忘记 onCleanup 的脸。" },
          { id: "keep", label: "接着 3、4、5 往上加，不清零", correct: false, why: "这一版每次跑都会把 ticks 写成 0。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": clean },
        blocks: [{ id: "mop", label: "② 换人先摘" }],
        narration: "who 一变，旧跑结束。结束前先扫地。",
      },
      counterfactual: {
        id: "clean-vs-leak",
        title: "摘了 vs 没摘",
        setup: "都等两秒，再点换人，再等两秒。看谁跳得更快。",
        worlds: [worldClean, worldLeak],
        punchline: "清零只是脸上的 0。速度才告诉你桌上还有几只表。",
      },
      observe: {
        state: [{ id: "t", label: "滴答", value: "回 0 后仍每 0.7 秒 +1" }],
        dom: [{ id: "probe", label: ".probe", value: "速度不变" }],
        events: [],
      },
      nodes: [
        { id: "who", kind: "ref", label: "who" },
        { id: "mop", kind: "effect", label: "onCleanup", symbol: "onCleanup" },
        { id: "t", kind: "ref", label: "滴答" },
      ],
      edges: [
        { from: "who", to: "mop", label: "再跑之前" },
        { from: "mop", to: "t", label: "旧表停" },
      ],
      explanation: {
        headline: "再跑之前先扫地",
        body: "下一镜删掉 onCleanup。换人仍清零，但旧表还在加。",
      },
      faqs: [
        { q: "onCleanup 什么时候跑？", a: "下一次副作用开始之前，以及 stop() / 组件卸掉时。正好用来 clearInterval。" },
      ],
      tryThis: "等滴答 ≥ 2。点换人，必须先回 0。再等两秒，大约仍是 2 或 3，不能明显翻倍。打开反事实。",
      mapping: [{ code: "onCleanup(() => clearInterval(id))", runtime: "旧表停", ui: "速度不变" }],
    },
    {
      id: "watchclean-s2",
      tick: "S2",
      title: "忘记摘，旧表变成幽灵",
      goal: "同一套换人。没有 onCleanup。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "等滴答到 2 以上，点换人。次数会？",
        choices: [
          { id: "fast", label: "先回 0，然后跳得更快。旧表没停", correct: true, why: "新 interval 开了，旧的还在写 ticks。两只表抢一支笔。" },
          { id: "reset", label: "回 0 后仍慢慢加。换人会自动停表", correct: false, why: "Vue 只停副作用函数。setInterval 是浏览器的，不摘就还在。" },
          { id: "stop", label: "停在 0", correct: false, why: "至少还有一只新表。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": leak },
        blocks: [{ id: "leak", label: "③ 没有 onCleanup" }],
        narration: "换人那一行没改。只少了扫地那一行。",
      },
      observe: {
        state: [{ id: "t", label: "滴答", value: "清零后大约快一倍" }],
        dom: [{ id: "probe", label: ".probe", value: "跳得更快" }],
        events: [],
      },
      nodes: [
        { id: "old", kind: "effect", label: "旧 interval" },
        { id: "neu", kind: "effect", label: "新 interval" },
        { id: "t", kind: "ref", label: "滴答" },
      ],
      edges: [
        { from: "old", to: "t", label: "没摘" },
        { from: "neu", to: "t" },
      ],
      explanation: {
        headline: "节点式的幽灵，换成了表",
        body: "World 12 卸面板后 click 还在加。这里换人后旧表还在加。下一镜 stop() 会不会顺便停表。",
      },
      faqs: [
        { q: "ticks 写成 0 为什么旧表还能加？", a: "0 只是这一瞬间的脸。旧 interval 还握着同一份 ticks，下一拍继续 +1。" },
      ],
      tryThis: "等 ≥ 2，换人回 0。再等两秒，必须明显快过 S0 那只表。记住这张脸。",
      mapping: [{ code: "只 setInterval", runtime: "旧表还在", ui: "清零后翻倍" }],
    },
    {
      id: "watchclean-s3",
      tick: "S3",
      title: "停表，onCleanup 会摘掉",
      goal: "有 onCleanup。点停表。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "等滴答到 2 以上，点停表。次数会？",
        choices: [
          { id: "freeze", label: "冻住。stop 会喊 onCleanup", correct: true, why: "stop() 结束这份副作用，先跑清理。interval 被 clear。" },
          { id: "go", label: "还在加。stop 只停订阅", correct: false, why: "有 onCleanup 时，停订阅会顺便扫地。" },
          { id: "zero", label: "变回 0", correct: false, why: "清理清的是表，不是把 ticks 擦掉。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": haltClean },
        blocks: [{ id: "halt", label: "④ 停表也扫地" }],
        narration: "上一课的剪刀。这一次剪的时候会喊扫地的人。",
      },
      observe: {
        state: [{ id: "t", label: "滴答", value: "停住" }],
        dom: [{ id: "probe", label: ".probe", value: "不再增加" }],
        events: [],
      },
      nodes: [
        { id: "stop", kind: "effect", label: "stop()", symbol: "stop" },
        { id: "mop", kind: "effect", label: "onCleanup" },
        { id: "t", kind: "ref", label: "滴答冻住" },
      ],
      edges: [
        { from: "stop", to: "mop" },
        { from: "mop", to: "t", label: "clear" },
      ],
      explanation: {
        headline: "stop 会喊上一轮的清理",
        body: "下一镜没有 onCleanup。停订阅之后，表还在走。",
      },
      faqs: [
        { q: "组件 v-if 卸掉呢？", a: "setup 里的 watchEffect 随 scope 停，同样会跑 onCleanup。显式 stop 是同一条边，只是你提前剪。" },
      ],
      tryThis: "等 ≥ 2，点停表。再等两秒，滴答必须冻住。",
      mapping: [{ code: "stop()", runtime: "onCleanup → clearInterval", ui: "滴答冻住" }],
    },
    {
      id: "watchclean-s4",
      tick: "S4",
      title: "停了订阅，表还在走",
      goal: "没有 onCleanup。点停表。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "等滴答到 2 以上，点停表。次数会？",
        choices: [
          { id: "go", label: "还在加。剪刀剪的是订阅，不是 interval", correct: true, why: "stop 让 watchEffect 不再因 who 再跑。已经开出去的表，没人 clear。" },
          { id: "freeze", label: "冻住。stop 会关掉所有定时器", correct: false, why: "浏览器不管你的 stop。要自己 clear。" },
          { id: "zero", label: "变回 0", correct: false, why: "谁也没去写 0。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": haltLeak },
        blocks: [{ id: "ghost", label: "⑤ 停订不停表" }],
        narration: "边剪了。桌上的表没人关。",
      },
      observe: {
        state: [{ id: "t", label: "滴答", value: "仍每 0.7 秒 +1" }],
        dom: [{ id: "probe", label: ".probe", value: "还在跳" }],
        events: [],
      },
      nodes: [
        { id: "stop", kind: "effect", label: "stop()" },
        { id: "clock", kind: "effect", label: "幽灵表" },
        { id: "t", kind: "ref", label: "滴答" },
      ],
      edges: [{ from: "clock", to: "t", label: "没摘" }],
      explanation: {
        headline: "订阅停了，表可以还活着",
        body: "下一镜泄漏版连换两次人。桌上会有三只表。",
      },
      faqs: [
        { q: "那 stop 还有什么用？", a: "它保证 who 再变也不会新开第四只。已经开出去的，仍要 onCleanup。" },
      ],
      tryThis: "等 ≥ 2，点停表。再等两秒，滴答必须仍在增加。和上一镜对照。",
      mapping: [{ code: "stop() 且无 onCleanup", runtime: "不再新开，旧表还在", ui: "继续跳" }],
    },
    {
      id: "watchclean-s5",
      tick: "S5",
      title: "连换两次，叠成三只",
      goal: "泄漏版。打开一只。换人两次。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开后换人，再换人。之后的速度大约？",
        choices: [
          { id: "three", label: "三只表。每次换人都新开一只，旧的都不停", correct: true, why: "1 → 2 → 3。清零只是瞬间，速度会越来越快。" },
          { id: "one", label: "仍是一只。换人会顶掉旧的", correct: false, why: "没人 clear。" },
          { id: "two", label: "最多两只。旧的会被第二次换人盖掉", correct: false, why: "盖掉要靠 onCleanup。这里没有。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": leak },
        blocks: [{ id: "stack", label: "⑥ 叠三只" }],
        narration: "和叠订同一类：只开不关。次数翻倍就是证据。",
      },
      observe: {
        state: [{ id: "t", label: "滴答", value: "换两次后大约快三倍" }],
        dom: [{ id: "probe", label: ".probe", value: "明显乱跳" }],
        events: [],
      },
      nodes: [
        { id: "a", kind: "effect", label: "表 1" },
        { id: "b", kind: "effect", label: "表 2" },
        { id: "c", kind: "effect", label: "表 3" },
        { id: "t", kind: "ref", label: "滴答" },
      ],
      edges: [
        { from: "a", to: "t" },
        { from: "b", to: "t" },
        { from: "c", to: "t" },
      ],
      explanation: {
        headline: "漏摘的脸是越来越快",
        body: "下一镜把干净换人、幽灵换人、停表冻住放在一起。",
      },
      faqs: [
        { q: "怎么数有几只表？", a: "看两秒加了多少。一只大约 +2 或 +3。三只会明显翻倍再翻倍。" },
      ],
      tryThis: "换人、再换人。等两秒，必须比 S2 那两只更快。然后打开消融里的干净版对照。",
      mapping: [{ code: "换人两次，无 onCleanup", runtime: "三只 interval", ui: "乱跳" }],
    },
    {
      id: "watchclean-s6",
      tick: "S6",
      title: "拆成一只 / 两只 / 停住",
      goal: "三种对照：换人摘掉、换人泄漏、停表也摘。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到有 onCleanup 的世界。换人之后速度会？",
        choices: [
          { id: "one", label: "仍是一只。先回 0 再慢慢加", correct: true, why: "先确认好的脸。" },
          { id: "fast", label: "变快", correct: false, why: "那是没摘。" },
          { id: "freeze", label: "冻住", correct: false, why: "那是停表。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": clean },
        blocks: [{ id: "keep", label: "一只表的版本先留着" }],
        narration: "先换人确认速度不变。再分别：泄漏、停表。",
      },
      observe: {
        state: [{ id: "t", label: "滴答", value: "一只表的速度" }],
        dom: [{ id: "probe", label: ".probe", value: "慢慢加" }],
        events: [],
      },
      nodes: [
        { id: "mop", kind: "effect", label: "onCleanup" },
        { id: "t", kind: "ref", label: "滴答" },
      ],
      edges: [{ from: "mop", to: "t", label: "一只" }],
      ablations: [
        {
          id: "leak",
          prompt: "如果忘记 onCleanup？",
          files: { "src/App.vue": leak },
          expected: { kind: "stale", message: "换人清零后跳得更快。旧表还在。" },
          lesson: "Vue 不管浏览器的 interval。",
        },
        {
          id: "halt",
          prompt: "如果有 onCleanup 再点停表？",
          files: { "src/App.vue": haltClean },
          expected: { kind: "stale", message: "停表后滴答冻住。" },
          lesson: "stop 会喊清理。",
        },
        {
          id: "ghost",
          prompt: "如果没 onCleanup 只点停表？",
          files: { "src/App.vue": haltLeak },
          expected: { kind: "stale", message: "停订之后滴答还在加。" },
          lesson: "剪刀剪订阅，不关已经开出去的表。",
        },
      ],
      explanation: {
        headline: "一只、两只、冻住",
        body: "World 17 收束：读到才订，订了能剪，再跑之前先摘旧的。",
      },
      tryThis: "三种消融：换人变快、停表冻住、停订仍跳。对上号再恢复：换人清零，速度不变。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先泄漏换人，再停表冻住，再停订仍跳。" },
      ],
    },
    {
      id: "watchclean-s7",
      tick: "S7",
      title: "换：房间",
      goal: "房间 A / B。换房开表。没有 onCleanup。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "等两秒，点换房。滴答会？",
        choices: [
          { id: "fast", label: "先回 0，然后更快。旧房间的表没关", correct: true, why: "换了文案，漏摘那条边还在。" },
          { id: "one", label: "回 0 后仍慢慢加。换房会自动关表", correct: false, why: "这一镜还没写 onCleanup。" },
          { id: "keep", label: "接着往上加，房间不该清零", correct: false, why: "代码每次跑都写成 0。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": roomLeak },
        blocks: [{ id: "room", label: "换场景：房间" }],
        narration: "人换成房间。问的仍是：再跑之前有没有摘旧表。",
      },
      observe: {
        state: [{ id: "t", label: "滴答", value: "清零后更快" }],
        dom: [{ id: "probe", label: ".probe", value: "两只表" }],
        events: [],
      },
      nodes: [
        { id: "room", kind: "ref", label: "room" },
        { id: "t", kind: "ref", label: "滴答" },
      ],
      edges: [{ from: "room", to: "t", label: "没摘" }],
      ablations: [
        {
          id: "fix",
          prompt: "加上 onCleanup 之后？",
          files: { "src/App.vue": roomClean },
          expected: {
            kind: "stale",
            message: "这是修复：换房清零，速度仍是一只表。",
          },
          lesson: "World 17 收束：读到才订，订了能剪，再跑之前先摘旧的。下一课：真正画出来的是 h() 这颗节点。",
        },
      ],
      explanation: {
        headline: "开出去的东西，要自己收回来",
        body: "没有 onCleanup，换房也会清零，只是旧表还在加。加上之后，脸可以相同（都回 0），边更少。World 17 停在「摘掉」。下一课把糖剥开：模板底下是 h()。",
      },
      faqs: [
        { q: "和 World 4 的竞态怎么记？", a: "同一只挂钩。那边 abort 过期请求，这边 clear 过期的表。别混成一件 API。" },
        { q: "下一课是什么？", a: "h()。副作用订的是读到的 ref。渲染函数交出的是一颗节点。模板是这颗节点的糖。" },
      ],
      tryThis: "先换房看清零后变快。再打开修复：清零后必须仍是一只表的速度。",
      mapping: [
        { code: "只 setInterval", runtime: "旧表还在", ui: "变快" },
        { code: "onCleanup clear", runtime: "一只表", ui: "慢慢加" },
      ],
    },
  ],
};
