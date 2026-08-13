import type { CausalLab } from "../types";

const s0 = `<script setup>
import { ref } from 'vue'

const n = ref(0)
</script>

<template>
  <button @click="n++">点 <span class="count">{{ n }}</span></button>
</template>
`;

const s1 = `<script setup>
import { ref } from 'vue'

const n = ref(0)
const probed = ref('(未探测)')

function inc() {
  n.value++
  probed.value = document.querySelector('.count')?.textContent ?? '(空)'
}
</script>

<template>
  <button @click="inc">点 <span class="count">{{ n }}</span></button>
  <p class="probe">探针：{{ probed }}</p>
</template>
`;

const s2 = `<script setup>
import { ref, nextTick } from 'vue'

const n = ref(0)
const probed = ref('(未探测)')

async function inc() {
  n.value++
  await nextTick()
  probed.value = document.querySelector('.count')?.textContent ?? '(空)'
}
</script>

<template>
  <button @click="inc">点 <span class="count">{{ n }}</span></button>
  <p class="probe">探针：{{ probed }}</p>
</template>
`;

const s3 = `<script setup>
import { ref, nextTick } from 'vue'

const n = ref(0)
const probed = ref('(未探测)')

function inc() {
  n.value++
  nextTick()
  probed.value = document.querySelector('.count')?.textContent ?? '(空)'
}
</script>

<template>
  <button @click="inc">点 <span class="count">{{ n }}</span></button>
  <p class="probe">探针：{{ probed }}</p>
</template>
`;

const s4 = `<script setup>
import { ref, watch } from 'vue'

const n = ref(0)
const probed = ref('(未探测)')

watch(n, () => {
  probed.value = document.querySelector('.count')?.textContent ?? '(空)'
})

function inc() {
  n.value++
}
</script>

<template>
  <button @click="inc">点 <span class="count">{{ n }}</span></button>
  <p class="probe">探针：{{ probed }}</p>
</template>
`;

const s5 = `<script setup>
import { ref, watch } from 'vue'

const n = ref(0)
const probed = ref('(未探测)')

watch(n, () => {
  probed.value = document.querySelector('.count')?.textContent ?? '(空)'
}, { flush: 'post' })

function inc() {
  n.value++
}
</script>

<template>
  <button @click="inc">点 <span class="count">{{ n }}</span></button>
  <p class="probe">探针：{{ probed }}</p>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'

const open = ref(false)
const height = ref('?')

function toggle() {
  open.value = !open.value
  height.value = String(document.querySelector('.panel')?.offsetHeight ?? 0)
}
</script>

<template>
  <button @click="toggle">{{ open ? '收起' : '展开' }}</button>
  <p class="probe">测到高度：{{ height }}</p>
  <div v-if="open" class="panel">
    <h3>面板</h3>
    <p>内容有好几行，应该有高度。</p>
    <p>打开的瞬间去量，DOM 可能还没长出来。</p>
  </div>
</template>
`;

const transferAfter = `<script setup>
import { ref, nextTick } from 'vue'

const open = ref(false)
const height = ref('?')

async function toggle() {
  open.value = !open.value
  await nextTick()
  height.value = String(document.querySelector('.panel')?.offsetHeight ?? 0)
}
</script>

<template>
  <button @click="toggle">{{ open ? '收起' : '展开' }}</button>
  <p class="probe">测到高度：{{ height }}</p>
  <div v-if="open" class="panel">
    <h3>面板</h3>
    <p>内容有好几行，应该有高度。</p>
    <p>nextTick 之后再量，节点已经在。</p>
  </div>
</template>
`;

export const NEXTTICK_LAB: CausalLab = {
  id: "nexttick",
  world: 6,
  concept: "nextTick",
  title: "DOM 还没补上",
  subtitle: "写入发生在现在。补丁发生在 handler 返回之后。",
  promise:
    "一镜一条边：先同步去读 DOM（读到旧的），再 await nextTick，再调用却不等待，再看 watch 默认 flush 也是补丁前，再改成 flush post。",
  minutes: 16,
  official: "/api/general.html#nexttick",
  scenes: [
    {
      id: "nexttick-s0",
      tick: "S0",
      title: "数字会走",
      goal: "按钮上的数字跟着点。还没有探针。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": s0 },
        blocks: [{ id: "base", label: "① 只有 n" }],
        narration: "模板读 n。你看见的永远是已经补过的 DOM。下一镜在点击函数里亲手去量它。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "0 → n", symbol: "n" }],
        dom: [{ id: "btn", label: "button", value: "点 n", symbol: "n" }],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n", symbol: "n" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "n", to: "dom", label: "渲染后" }],
      explanation: {
        headline: "你一直在看补丁之后的世界",
        body: "点一下，数字变了。那是渲染 effect 跑完的结果。事件处理函数里的某一行，不一定已经站在那一帧上。",
      },
      tryThis: "连点三次。按钮应是 1、2、3。记住：这是补丁之后的脸。",
      faqs: [
        { q: "这不就是 ref 那一课吗？", a: "那一课问「界面会不会更新」。这一课问「更新发生在哪一毫秒」。DevTools 和 querySelector 读的是 DOM，不是 ref。" },
        { q: "为什么要量 DOM？不能读 n 吗？", a: "量高度、焦点、滚动位置，只能问 DOM。下一镜用最便宜的 textContent 当探针，让你看见时机。" },
      ],
    },
    {
      id: "nexttick-s1",
      tick: "S1",
      title: "同一拍去读 DOM",
      goal: "n++ 之后立刻 querySelector。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "inc 里 n.value++ 紧接着读 .count 的 textContent。第一次点击后探针是？",
        choices: [
          { id: "one", label: "「1」。赋值立刻改了 DOM", correct: false, why: "赋值改的是 ref。DOM 补丁被排到当前 handler 之后。" },
          { id: "zero", label: "仍是「0」。补丁还没打", correct: true, why: "你读到的是上一帧。数字按钮随后会变成 1，探针停在 0。" },
          { id: "err", label: "找不到节点，报错", correct: false, why: "节点一直在。错的是时机，不是缺失。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s1 },
        blocks: [{ id: "probe", label: "② 写入后立刻量 DOM" }],
        narration: "只多了一根探针。它问的是 DOM，不是 n。",
      },
      replay: {
        label: "点一次并对齐两张脸",
        steps: [
          { caption: "click → n  0 → 1", event: "click", highlight: ["n"], state: { id: "n", from: "0", to: "1" } },
          { caption: "querySelector 仍读到 0", highlight: ["probe"] },
          { caption: "handler 返回，渲染补丁", highlight: ["render"] },
          { caption: "按钮变成 1，探针停在 0", highlight: ["dom"] },
        ],
      },
      observe: {
        state: [
          { id: "n", label: "n", value: "1", symbol: "n" },
          { id: "probed", label: "probed", value: "0（旧 DOM）", symbol: "probed" },
        ],
        dom: [
          { id: "btn", label: ".count", value: "1（补丁后）" },
          { id: "probe", label: ".probe", value: "0" },
        ],
        events: [{ id: "click", label: "click", value: "inc()" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "click" },
        { id: "n", kind: "ref", label: "n", symbol: "n" },
        { id: "probe", kind: "script", label: "querySelector", detail: "还是旧 DOM" },
        { id: "render", kind: "render", label: "render", detail: "handler 之后" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "click", to: "n", label: "写入" },
        { from: "click", to: "probe", label: "同步读取" },
        { from: "n", to: "render", label: "调度" },
        { from: "render", to: "dom" },
      ],
      why: {
        question: "为什么按钮最后是 1，探针却是 0？",
        choices: [
          { id: "order", label: "探针在补丁之前跑。两张脸来自两个时刻", correct: true, why: "不是 Vue 慢。是你问早了。" },
          { id: "bug", label: "querySelector 在 Vue 里不能用", correct: false, why: "能用。只是它读的是已经画出来的节点。" },
          { id: "ref", label: "应该读 n.value，DOM 永远不可信", correct: false, why: "量尺寸只能问 DOM。要等补丁，不是放弃 DOM。" },
        ],
      },
      explanation: {
        headline: "写入 ≠ 已经画完",
        body: "ref 变了，渲染 effect 被标脏，等当前调用栈结束才跑。handler 里立刻 querySelector，问到的是上一帧。这不是响应式坏了。是探针插错了拍。",
      },
      faqs: [
        { q: "Vue 2 也这样吗？", a: "一样。更新是异步排队的。nextTick 就是「等这一批补丁打完」。" },
        { q: "DevTools 为什么总是对的？", a: "你打开它时，补丁早就打完了。它看的是稳定后的状态。X-Ray 也是。" },
      ],
      tryThis: "点一次。按钮必须是 1，探针必须仍是 0。两张脸对不上，就是这一镜。",
      mapping: [
        { code: "n.value++", runtime: "标脏，尚未补丁", ui: "随后变成 1" },
        { code: "querySelector('.count')", runtime: "读当前 DOM", ui: "探针 0" },
      ],
    },
    {
      id: "nexttick-s2",
      tick: "S2",
      title: "等补丁",
      goal: "await nextTick() 之后再量。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "n.value++ 之后 await nextTick()，再读 textContent。探针会？",
        choices: [
          { id: "match", label: "跟上按钮，变成 1", correct: true, why: "nextTick 在本批 DOM 更新之后才继续。探针和模板同一帧。" },
          { id: "old", label: "仍是 0，nextTick 只等微任务，不等渲染", correct: false, why: "Vue 的 nextTick 专门等的就是这批渲染。" },
          { id: "err", label: "报错：inc 不能是 async", correct: false, why: "@click 可以等 Promise。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s2 },
        blocks: [{ id: "await", label: "③ await nextTick()" }],
        narration: "只插入一次等待。读取还是那句 querySelector。",
      },
      observe: {
        state: [
          { id: "n", label: "n", value: "与探针对齐", symbol: "n" },
          { id: "probed", label: "probed", value: "新 DOM", symbol: "probed" },
        ],
        dom: [{ id: "both", label: "两张脸", value: "同一帧" }],
        events: [{ id: "click", label: "click", value: "inc()" }],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n", symbol: "n" },
        { id: "tick", kind: "effect", label: "nextTick", symbol: "nextTick" },
        { id: "render", kind: "render", label: "render" },
        { id: "probe", kind: "script", label: "querySelector" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "n", to: "render" },
        { from: "render", to: "dom" },
        { from: "tick", to: "probe", label: "补丁后" },
        { from: "dom", to: "probe" },
      ],
      explanation: {
        headline: "nextTick 是等渲染，不是 sleep",
        body: "它不是「等一会儿」。它是「等这批被标脏的 effect 跑完」。跑完再量，探针和界面才是同一张脸。",
      },
      faqs: [
        { q: "setTimeout(0) 可以代替吗？", a: "偶尔碰巧可以，但那是宏任务，中间可能夹进别的事。nextTick 跟的是 Vue 自己的队列。" },
        { q: "模板为什么从不需要 nextTick？", a: "模板就是那个被等待的 effect。它不读 DOM，它写 DOM。" },
      ],
      tryThis: "点一次。按钮和探针必须都是 1。再点，必须一起走。",
      mapping: [{ code: "await nextTick()", runtime: "等本批 render", ui: "探针追上按钮" }],
    },
    {
      id: "nexttick-s3",
      tick: "S3",
      title: "调用了，但没等",
      goal: "nextTick() 返回 Promise。丢掉它，等于没等。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "写成 nextTick() 但不 await、也不传入回调。探针会？",
        choices: [
          { id: "match", label: "仍跟上，因为调用了就排队", correct: false, why: "排队的是那个 Promise。你没等它，下一行照旧读旧 DOM。" },
          { id: "old", label: "仍是旧的。调用 ≠ 等待", correct: true, why: "和 fetch() 不 await 同一类：火点着了，人没停。" },
          { id: "err", label: "报错：必须 await", correct: false, why: "合法。静默读到旧值。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s3 },
        blocks: [{ id: "drop", label: "④ nextTick() 不等待" }],
        narration: "API 在。等待不在。这是 nextTick 最常见的假修复。",
      },
      observe: {
        state: [{ id: "probed", label: "probed", value: "仍是旧 DOM", symbol: "probed" }],
        dom: [{ id: "split", label: "脸", value: "按钮新，探针旧" }],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n" },
        { id: "tick", kind: "effect", label: "nextTick()", detail: "Promise 被丢掉" },
        { id: "probe", kind: "script", label: "querySelector", detail: "仍同步" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "n", to: "tick", label: "未等待" },
        { from: "probe", to: "dom", label: "读早了" },
      ],
      why: {
        question: "和上一镜的差别在哪一条边上？",
        choices: [
          { id: "await", label: "缺的是等待。调用本身不移动读取的时刻", correct: true, why: "nextTick() 只是一张票。await 或回调才是入场。" },
          { id: "async", label: "缺 async 关键字，和 await 无关", correct: false, why: "没有 await，async 也改变不了下一行的时机。" },
          { id: "api", label: "必须写成 Vue.nextTick，不能从 vue 里 import", correct: false, why: "import { nextTick } 就是正道。" },
        ],
      },
      explanation: {
        headline: "门票不是入场",
        body: "fetch、nextTick、requestAnimationFrame，同一类因果：你得停下来等结果。写了函数名却继续往下走，探针永远停在上一帧。",
      },
      faqs: [
        { q: "回调写法呢？", a: "nextTick(() => { 再量 }) 和 await 等价。两种都是等待。光 nextTick() 不是。" },
        { q: "为什么不报错？", a: "Promise 被丢掉在 JavaScript 里合法。失败是静默的错数。" },
      ],
      tryThis: "点一次。按钮是 1，探针必须仍是 0。对比上一镜：差别只有一个 await。",
      mapping: [{ code: "nextTick()", runtime: "Promise 被丢弃", ui: "探针仍是旧 DOM" }],
    },
    {
      id: "nexttick-s4",
      tick: "S4",
      title: "watch 默认也在补丁前",
      goal: "把探测挪进 watch(n)。不写 flush。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "watch(n, () => 读 .count)。默认 flush。点一次后探针是？",
        choices: [
          { id: "new", label: "新值。watch 一定在画面更新后", correct: false, why: "默认 flush 是 pre：组件更新之前。DOM 还是旧的。" },
          { id: "old", label: "旧值。watch 默认发生在补丁前", correct: true, why: "和 handler 里同步读取同一拍。只是换了个房间。" },
          { id: "imm", label: "首次就是 0，因为没写 immediate", correct: false, why: "第一次点击才会跑。跑的时候仍是 pre。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s4 },
        blocks: [{ id: "watch", label: "⑤ watch(n) 里量 DOM" }],
        narration: "探测换了地方。默认时机没换。仍是补丁前。",
      },
      observe: {
        state: [{ id: "probed", label: "probed", value: "旧 DOM", symbol: "probed" }],
        dom: [{ id: "split", label: "脸", value: "按钮新，探针旧" }],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n" },
        { id: "watch", kind: "watch", label: "watch", detail: "flush: pre" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "n", to: "watch", label: "pre" },
        { from: "n", to: "dom", label: "随后补丁" },
      ],
      explanation: {
        headline: "换房间，同一拍",
        body: "watch 默认要在渲染前看到「将要变成什么」，方便你根据新状态去改另一份状态。它不是「画面已经好了」的钩子。量 DOM 要 post，或者 nextTick。",
      },
      faqs: [
        { q: "那 watch 用来干什么？", a: "同步另一份状态、发请求、写 title。那些不需要 DOM 节点已经存在。量尺寸需要。" },
        { q: "onUpdated 呢？", a: "组件更新之后。和 flush: 'post' 更像。下一镜只改 flush，不换 API。" },
      ],
      tryThis: "点一次。按钮 1，探针 0。和 S1 同一张裂开的脸，只是探测写在 watch 里。",
      mapping: [{ code: "watch(n, probe)", runtime: "默认 pre", ui: "探针旧" }],
    },
    {
      id: "nexttick-s5",
      tick: "S5",
      title: "flush 改成 post",
      goal: "只加 { flush: 'post' }。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "同一句 watch，加上 flush: 'post'。探针会？",
        choices: [
          { id: "match", label: "追上按钮", correct: true, why: "post 排在 DOM 更新之后。和 nextTick 同一扇门。" },
          { id: "old", label: "仍是旧的，watch 永远在渲染前", correct: false, why: "默认才是 pre。post 是你显式改拍。" },
          { id: "sync", label: "变成同步，n++ 的下一行就能读到", correct: false, why: "flush: 'sync' 才是同步。post 仍是排队，只是排在补丁后。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s5 },
        blocks: [{ id: "post", label: "⑥ flush: 'post'" }],
        narration: "只改排队位置。回调函数一个字没动。",
      },
      observe: {
        state: [{ id: "probed", label: "probed", value: "新 DOM", symbol: "probed" }],
        dom: [{ id: "both", label: "脸", value: "对齐" }],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n" },
        { id: "watch", kind: "watch", label: "watch", detail: "flush: post" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "n", to: "dom", label: "补丁" },
        { from: "dom", to: "watch", label: "post" },
      ],
      explanation: {
        headline: "同一扇门，两种进法",
        body: "await nextTick() 是一次性等这批。watch flush post 是以后每次 n 变都在补丁后再跑。量一次用 nextTick；跟着状态反复量，用 post。",
      },
      faqs: [
        { q: "flush: 'sync' 呢？", a: "依赖一变立刻跑，可能在当前渲染中间。量 DOM 仍可能太早，还容易打乱批次。量尺寸不要用它。" },
        { q: "和 watch 课的 immediate 是一回事吗？", a: "不是。immediate 问「现在先跑一次吗」。flush 问「相对渲染排在哪」。" },
      ],
      tryThis: "点一次。按钮和探针必须一起是 1。对比上一镜：只多了 flush post。",
      mapping: [{ code: "{ flush: 'post' }", runtime: "DOM 更新后再跑", ui: "探针对齐" }],
    },
    {
      id: "nexttick-s6",
      tick: "S6",
      title: "拆掉等待 / 丢掉 Promise / 退回 pre",
      goal: "三种坏法：不等、假等、排错队。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到「调用 nextTick() 但不等待」。探针会？",
        choices: [
          { id: "ok", label: "对齐。反正写了 nextTick", correct: false, why: "S3 已经见过：门票不是入场。" },
          { id: "old", label: "仍是旧 DOM", correct: true, why: "读取还在 Promise 兑现之前。" },
          { id: "err", label: "报错", correct: false, why: "静默错数。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": s2 },
        blocks: [{ id: "keep", label: "await 版本先留着" }],
        narration: "先点一次确认探针对齐。再分别拆掉等待、丢掉 Promise、把 watch 退回默认。",
      },
      observe: {
        state: [{ id: "ok", label: "probed", value: "对齐" }],
        dom: [{ id: "both", label: "脸", value: "同一帧" }],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n" },
        { id: "tick", kind: "effect", label: "nextTick" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "n", to: "tick" },
        { from: "tick", to: "dom" },
      ],
      ablations: [
        {
          id: "sync",
          prompt: "如果写入后立刻量？",
          files: { "src/App.vue": s1 },
          expected: {
            kind: "stale",
            message: "按钮新，探针旧。没有等待。",
          },
          lesson: "缺的是拍，不是 querySelector。",
        },
        {
          id: "drop",
          prompt: "如果 nextTick() 不等待？",
          files: { "src/App.vue": s3 },
          expected: {
            kind: "stale",
            message: "写了 API，没入场。探针仍旧。",
          },
          lesson: "调用 ≠ 等待。和 fetch() 不 await 同一类。",
        },
        {
          id: "pre",
          prompt: "如果 watch 不写 flush post？",
          files: { "src/App.vue": s4 },
          expected: {
            kind: "stale",
            message: "换了房间，仍是补丁前。探针旧。",
          },
          lesson: "默认 pre。量 DOM 要显式 post。",
        },
      ],
      explanation: {
        headline: "三种脸，都是问早了",
        body: "立刻量、假等待、watch 默认，读到的都是上一帧。nextTick 和 flush post 做的是同一件事：把探针插到补丁后面。",
      },
      tryThis: "三种消融都点一次。按钮新、探针旧，对上号再恢复。",
      faqs: [
        { q: "三种要按什么顺序看？", a: "先立刻量（没有等待），再假等待（有 API 没入场），再 watch 默认（换房间同一拍）。" },
      ],
    },
    {
      id: "nexttick-s7",
      tick: "S7",
      title: "换：展开后量高度",
      goal: "v-if 打开面板，立刻读 offsetHeight。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "点「展开」时，open 已是 true，立刻读 .panel 的高度。会？",
        choices: [
          { id: "full", label: "读到真实高度，因为 v-if 已经是 true", correct: false, why: "true 写在 ref 上。节点要等补丁才进文档。" },
          { id: "zero", label: "0。面板这一帧还不在文档里", correct: true, why: "和 count 探针同一条边。缺的是 nextTick，不是缺 CSS。" },
          { id: "err", label: "报错：找不到 .panel", correct: false, why: "querySelector 得到 null，代码写成了 0。静默。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "panel", label: "换场景：展开面板" }],
        narration: "数字换成了高度。问的仍是：节点在不在文档里。",
      },
      observe: {
        state: [
          { id: "open", label: "open", value: "false", symbol: "open" },
          { id: "height", label: "height", value: "?", symbol: "height" },
        ],
        dom: [{ id: "panel", label: ".panel", value: "未展开" }],
        events: [],
      },
      nodes: [
        { id: "open", kind: "ref", label: "open", symbol: "open" },
        { id: "dom", kind: "dom", label: "DOM", detail: "v-if 尚未补丁" },
      ],
      edges: [{ from: "open", to: "dom", label: "还没打" }],
      ablations: [
        {
          id: "wait",
          prompt: "await nextTick 再量之后？",
          files: { "src/App.vue": transferAfter },
          expected: {
            kind: "stale",
            message: "这是修复：展开后高度不再是 0。收起时面板离开，高度回到 0。",
          },
          lesson: "迁移成功：你指出的是「节点还没进文档」，不是「高度算错」。",
        },
      ],
      why: {
        question: "和按钮上的数字探针是同一类问题吗？",
        choices: [
          { id: "same", label: "是。都是补丁前去问 DOM", correct: true, why: "一个读 textContent，一个读 offsetHeight。拍相同。" },
          { id: "css", label: "不是。这是 CSS 没算完", correct: false, why: "连节点都还没有。CSS 是下一层，这一镜还没轮到。" },
          { id: "vif", label: "应该换成 v-show，因为 v-if 不能量", correct: false, why: "v-show 一直有节点，立刻量可能有高度。那是另一条边。这里要你会等。" },
        ],
      },
      explanation: {
        headline: "量得到的世界，在补丁之后",
        body: "数字、高度、焦点、滚动。凡是问 DOM 的，都要站在渲染后面。下一课会问：渲染自己炸了，树还在不在。",
      },
      faqs: [
        { q: "收起时高度为什么是 0？", a: "修复版在补丁后量。v-if 已经把节点拿走，querySelector 得到 null，写成 0。这是对的。" },
        { q: "这里 React 会怎么写？", a: "useLayoutEffect 或 flushSync。同样是「等画完再量」。" },
      ],
      tryThis: "先展开：高度应是 0。再打开「await nextTick 再量」：展开应有真实高度。",
      mapping: [
        { code: "open = true; el.offsetHeight", runtime: "节点未进入", ui: "0" },
        { code: "await nextTick(); offsetHeight", runtime: "补丁后", ui: "真实高度" },
      ],
    },
  ],
};
