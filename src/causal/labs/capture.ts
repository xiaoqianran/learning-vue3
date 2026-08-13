import type { CausalLab, CounterfactualWorld } from "../types";

const childSafe = `<script setup>
defineProps({ n: { type: Number, required: true } })
</script>
<template>
  <p class="card">子组件还安全 · {{ n }}</p>
</template>
`;

const appSafe = `<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const n = ref(0)
</script>
<template>
  <p class="hint">父还在</p>
  <button @click="n++">加到 {{ n }}</button>
  <Child :n="n" />
</template>
`;

const childBoom = `<script setup>
defineProps({ n: { type: Number, required: true } })
function boom() {
  throw new Error('渲染炸了')
}
</script>
<template>
  <p v-if="n >= 3" class="card">{{ boom() }}</p>
  <p v-else class="card">子组件还安全 · {{ n }}</p>
</template>
`;

const appNoCapture = `<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const n = ref(0)
</script>
<template>
  <p class="hint">父还在</p>
  <button @click="n++">加到 {{ n }}</button>
  <Child :n="n" />
</template>
`;

const appCaptureKeep = `<script setup>
import { ref, onErrorCaptured } from 'vue'
import Child from './Child.vue'

const n = ref(0)
const caught = ref(null)

onErrorCaptured((err) => {
  caught.value = err.message
  return false
})
</script>
<template>
  <p class="hint">父还在</p>
  <p v-if="caught" class="error">捕获：{{ caught }}</p>
  <button @click="n++">加到 {{ n }}</button>
  <Child :n="n" />
</template>
`;

const appFallback = `<script setup>
import { ref, onErrorCaptured } from 'vue'
import Child from './Child.vue'

const n = ref(0)
const caught = ref(null)

onErrorCaptured((err) => {
  caught.value = err.message
  return false
})
</script>
<template>
  <p class="hint">父还在</p>
  <button @click="n++">加到 {{ n }}</button>
  <p v-if="caught" class="error">子组件渲染失败：{{ caught }}</p>
  <Child v-else :n="n" />
</template>
`;

const appPropagate = `<script setup>
import { ref, onErrorCaptured } from 'vue'
import Child from './Child.vue'

const n = ref(0)
const caught = ref(null)

onErrorCaptured((err) => {
  caught.value = err.message
})
</script>
<template>
  <p class="hint">父还在</p>
  <button @click="n++">加到 {{ n }}</button>
  <p v-if="caught" class="error">子组件渲染失败：{{ caught }}</p>
  <Child v-else :n="n" />
</template>
`;

const childClickThrow = `<script setup>
defineProps({ n: { type: Number, required: true } })
function boom() {
  throw new Error('点击炸了')
}
</script>
<template>
  <p class="card">子组件还在 · {{ n }}</p>
  <button @click="boom">点我会扔错</button>
</template>
`;

const appClickCatch = `<script setup>
import { ref, onErrorCaptured } from 'vue'
import Child from './Child.vue'

const n = ref(0)
const caught = ref(null)

onErrorCaptured((err) => {
  caught.value = err.message
  return false
})
</script>
<template>
  <p class="hint">父还在</p>
  <p v-if="caught" class="error">捕获：{{ caught }}</p>
  <button @click="n++">加到 {{ n }}</button>
  <Child :n="n" />
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'

const tab = ref('ok')
function boom() {
  throw new Error('坏页渲染失败')
}
</script>
<template>
  <button :class="{ on: tab === 'ok' }" @click="tab = 'ok'">安全</button>
  <button :class="{ on: tab === 'bad' }" @click="tab = 'bad'">坏页</button>
  <p v-if="tab === 'ok'" class="card">这一页能画。</p>
  <p v-else class="card">{{ boom() }}</p>
</template>
`;

const transferChild = `<script setup>
defineProps({ tab: { type: String, required: true } })
function boom() {
  throw new Error('坏页渲染失败')
}
</script>
<template>
  <p v-if="tab === 'bad'" class="card">{{ boom() }}</p>
  <p v-else class="card">这一页能画。</p>
</template>
`;

const transferAfter = `<script setup>
import { ref, onErrorCaptured } from 'vue'
import Page from './Page.vue'

const tab = ref('ok')
const caught = ref(null)

onErrorCaptured((err) => {
  caught.value = err.message
  return false
})

function go(next) {
  caught.value = null
  tab.value = next
}
</script>
<template>
  <button :class="{ on: tab === 'ok' }" @click="go('ok')">安全</button>
  <button :class="{ on: tab === 'bad' }" @click="go('bad')">坏页</button>
  <p v-if="caught" class="error">这一页画不出来：{{ caught }}</p>
  <Page v-else :tab="tab" />
</template>
`;

const worldRender: CounterfactualWorld = {
  id: "render",
  name: "渲染里扔",
  tagline: "树正在画，画到一半炸了",
  files: { "src/App.vue": appNoCapture, "src/Child.vue": childBoom },
  nodes: [
    { id: "child", kind: "component", label: "Child render" },
    { id: "dom", kind: "dom", label: "整棵树" },
  ],
  edges: [{ from: "child", to: "dom", label: "未捕获 → 翻车" }],
  note: "渲染是 Vue 自己跑的。没人接住，组件会被卸掉。",
};

const worldClick: CounterfactualWorld = {
  id: "click",
  name: "点击里扔",
  tagline: "事件已经离开渲染",
  files: { "src/App.vue": appClickCatch, "src/Child.vue": childClickThrow },
  nodes: [
    { id: "click", kind: "event", label: "click throw" },
    { id: "child", kind: "component", label: "Child" },
    { id: "dom", kind: "dom", label: "还在" },
  ],
  edges: [
    { from: "click", to: "child", label: "捕获" },
    { from: "child", to: "dom", label: "树还在" },
  ],
  note: "事件处理失败，不等于这一帧画不出来。红字可以出现，卡片还在。",
};

export const CAPTURE_LAB: CausalLab = {
  id: "capture",
  world: 6,
  concept: "onErrorCaptured",
  title: "渲染炸了，树还在吗",
  subtitle: "onErrorCaptured 是父接子的网。接住之后还要停画那个子。",
  promise:
    "一镜一条边：先让子在 n≥3 时渲染抛错，再捕获却继续画它，再换成后备，再忘记 return false，再看点击抛错为什么不卸树。",
  minutes: 16,
  official: "/api/composition-api-lifecycle.html#onerrorcaptured",
  scenes: [
    {
      id: "capture-s0",
      tick: "S0",
      title: "父子都还安全",
      goal: "Child 只显示 n。加到多少都不会炸。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": appSafe, "src/Child.vue": childSafe },
        blocks: [{ id: "safe", label: "① 安全的子组件" }],
        narration: "父有按钮，子只是把 n 画出来。下一镜子会在 n≥3 时自己扔掉。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "0", symbol: "n" }],
        dom: [{ id: "child", label: "Child", value: "还安全" }],
        events: [],
      },
      nodes: [
        { id: "app", kind: "component", label: "App" },
        { id: "child", kind: "component", label: "Child" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "app", to: "child", label: "props n" },
        { from: "child", to: "dom" },
      ],
      explanation: {
        headline: "现在没有人扔错",
        body: "World 4 的错误是 Promise 拒绝。这一课的错误发生在渲染函数里——Vue 正在画，画到一半炸了。先记住这张能加的脸。",
      },
      tryThis: "加到 4、5。卡片应仍说「还安全」。下一镜 ≥3 就会炸。",
      faqs: [
        { q: "和 fetch 失败有什么不同？", a: "那是异步状态机：loading / error / 数据。这是同步的渲染异常：这一帧画不出来。" },
        { q: "为什么要拆成子组件？", a: "onErrorCaptured 接的是后代。自己 throw 在自己的 render 里，要靠 app.config.errorHandler。先看父子这张网。" },
      ],
    },
    {
      id: "capture-s1",
      tick: "S1",
      title: "子在渲染里扔掉",
      goal: "n≥3 时 Child 调用 boom()。没有捕获。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "加到 3。子组件渲染抛错，又没有 onErrorCaptured。预览会？",
        choices: [
          { id: "child", label: "只有子空白，父的按钮还在", correct: false, why: "没人接住时，错误沿树往上走。整棵应用常常一起卸掉。" },
          { id: "crash", label: "整棵树翻车。父那句「父还在」也保不住", correct: true, why: "渲染错误默认不是局部的。没有网，火往上烧。" },
          { id: "ok", label: "红字提示一下，数字停在 3", correct: false, why: "那需要捕获加后备。这一镜两样都没有。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appNoCapture, "src/Child.vue": childBoom },
        blocks: [{ id: "boom", label: "② Child 在 n≥3 时 throw" }],
        narration: "只改子。父还当什么都没发生。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "加到 3 即炸", symbol: "n" }],
        dom: [{ id: "app", label: "App", value: "可能被卸掉" }],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n" },
        { id: "child", kind: "component", label: "Child render" },
        { id: "dom", kind: "dom", label: "DOM", detail: "翻车" },
      ],
      edges: [{ from: "child", to: "dom", label: "未捕获" }],
      why: {
        question: "为什么父自己没有 throw，也会消失？",
        choices: [
          { id: "up", label: "渲染错误默认向上传播。没人接，祖先一起卸", correct: true, why: "和没人 catch 的 Promise 会变成未处理拒绝同一类：火要有人接。" },
          { id: "props", label: "n 传下去就把父也绑进了子的错误", correct: false, why: "props 只是数据。传播的是异常，不是数字。" },
          { id: "repl", label: "只有教学预览会这样，真应用不会", correct: false, why: "真应用一样：未处理的渲染错误会拆掉那棵子树，常常是整页。" },
        ],
      },
      explanation: {
        headline: "渲染是 Vue 自己在跑",
        body: "点击函数里的 throw，至少事件已经结束。渲染中的 throw 发生在 Vue 画树的中途。没有网，它不知道这一帧该怎么收场——于是把树拆掉。",
      },
      faqs: [
        { q: "控制台会有什么？", a: "Uncaught error during render，以及组件栈。先读栈：它告诉你哪一个子在哪一次渲染扔的。" },
        { q: "ErrorBoundary 呢？", a: "React 的名字。Vue 里就是祖先的 onErrorCaptured，外加你自己的后备 UI。" },
      ],
      tryThis: "加到 3。预览应翻车或整页空白。父那句「父还在」保不住。这是这一镜的正确答案。",
      mapping: [{ code: "n >= 3 → throw", runtime: "render 中未捕获", ui: "整棵树卸掉" }],
    },
    {
      id: "capture-s2",
      tick: "S2",
      title: "接住了，还在画它",
      goal: "onErrorCaptured 写下 caught。Child 仍挂着。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "父捕获了错误，却继续渲染 <Child :n=\"n\" />。加到 3 会？",
        choices: [
          { id: "ok", label: "红字出现，子不再炸，因为已经捕获", correct: false, why: "捕获不等于卸载。下一帧渲染还会再跑 boom()。" },
          { id: "loop", label: "捕获也许闪一下，子仍在炸。网接着，火还在烧", correct: true, why: "return false 只挡住向上传播。你还在邀请那个会扔的子画画。" },
          { id: "parent", label: "父自己被卸掉", correct: false, why: "return false 后祖先可以活。活着不等于子被换掉。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appCaptureKeep, "src/Child.vue": childBoom },
        blocks: [{ id: "cap", label: "③ onErrorCaptured，仍挂 Child" }],
        narration: "网铺上了。着火的那个组件还在树上。",
      },
      observe: {
        state: [{ id: "caught", label: "caught", value: "可能闪一下", symbol: "caught" }],
        dom: [{ id: "child", label: "Child", value: "仍在渲染里扔" }],
        events: [],
      },
      nodes: [
        { id: "child", kind: "component", label: "Child" },
        { id: "cap", kind: "effect", label: "onErrorCaptured" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "child", to: "cap", label: "扔" },
        { from: "cap", to: "child", label: "仍去画" },
      ],
      explanation: {
        headline: "接住 ≠ 停画",
        body: "onErrorCaptured 是通知。v-if 才是停火。你记下了 message，却继续让那个会扔的子参与这一帧——它会再扔。",
      },
      faqs: [
        { q: "return false 干什么？", a: "挡住继续往上走。不写的话，app 级 errorHandler 和更上面的祖先仍会收到。下一镜先换后备，再单独看漏写 return。" },
        { q: "为什么不在子里 try/catch？", a: "模板表达式不好包。render 里的 throw 正是祖先网要接的。" },
      ],
      tryThis: "加到 3。不要指望它稳定住。红字若闪现，子仍可能把预览搞乱。下一镜才摘掉 Child。",
      mapping: [{ code: "onErrorCaptured + <Child>", runtime: "接住又送回去", ui: "仍炸" }],
    },
    {
      id: "capture-s3",
      tick: "S3",
      title: "换成后备",
      goal: "caught 一旦有值，不再渲染 Child。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "v-if=\"caught\" 显示红字，v-else 才挂 Child。加到 3 会？",
        choices: [
          { id: "fb", label: "父还在。子被换成「渲染失败」", correct: true, why: "捕获写下 caught → 下一拍不再邀请 Child → 火灭了。" },
          { id: "crash", label: "仍整页翻车", correct: false, why: "return false 加上不再渲染肇事者，树可以活。" },
          { id: "three", label: "数字停在 2，因为 3 被拦住了", correct: false, why: "n 已经是 3。拦的是 Child 的渲染，不是加法。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appFallback, "src/Child.vue": childBoom },
        blocks: [{ id: "fb", label: "④ caught 时摘掉 Child" }],
        narration: "只改一处：肇事者离开树。网还是那张网。",
      },
      observe: {
        state: [{ id: "caught", label: "caught", value: "渲染炸了", symbol: "caught" }],
        dom: [{ id: "fb", label: "后备", value: "子组件渲染失败" }],
        events: [],
      },
      nodes: [
        { id: "child", kind: "component", label: "Child" },
        { id: "cap", kind: "effect", label: "onErrorCaptured" },
        { id: "fb", kind: "render", label: "后备" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "child", to: "cap", label: "扔" },
        { from: "cap", to: "fb", label: "停画 Child" },
        { from: "fb", to: "dom" },
      ],
      explanation: {
        headline: "网加上停火，才是边界",
        body: "记下来，把着火的子换成一块红字。父的按钮还在。这就是 Vue 的错误边界：不是魔法组件，是捕获 + 不再渲染它。",
      },
      faqs: [
        { q: "怎样重试？", a: "把 caught 置回 null，Child 会再挂上。若 n 仍 ≥3，它会再炸。重试前要先把源状态改回安全区。" },
        { q: "多个子呢？", a: "一张网接整棵后代。要隔离就把网铺在更近的祖先，让别的兄弟继续画。" },
      ],
      tryThis: "加到 3。必须看见红字「子组件渲染失败」，上方「父还在」和按钮都还在。",
      mapping: [
        { code: "onErrorCaptured → caught", runtime: "记下错误", ui: "—" },
        { code: "v-if=\"caught\" 后备", runtime: "Child 离开树", ui: "红字，父还在" },
      ],
    },
    {
      id: "capture-s4",
      tick: "S4",
      title: "忘记 return false",
      goal: "后备还在。捕获函数没有 return false。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "记下 caught 并摘掉 Child，但不 return false。加到 3 会？",
        choices: [
          { id: "same", label: "和上一镜一样稳定。return 只是风格", correct: false, why: "不返回 false，错误继续向上。预览的 errorHandler 仍可能翻车。" },
          { id: "up", label: "后备也许出现，火仍往上烧", correct: true, why: "你做了局部善后，但没说「到此为止」。祖先和运行时仍当它未处理。" },
          { id: "err", label: "语法错误：必须有返回值", correct: false, why: "合法。undefined 表示继续传播。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appPropagate, "src/Child.vue": childBoom },
        blocks: [{ id: "prop", label: "⑤ 捕获却继续传播" }],
        narration: "局部善后还在。到此为止那句话被删了。",
      },
      observe: {
        state: [{ id: "caught", label: "caught", value: "有值，仍传播" }],
        dom: [{ id: "maybe", label: "预览", value: "可能仍翻车" }],
        events: [],
      },
      nodes: [
        { id: "cap", kind: "effect", label: "onErrorCaptured", detail: "无 return false" },
        { id: "up", kind: "effect", label: "向上" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "cap", to: "up", label: "继续" },
        { from: "up", to: "dom", label: "运行时仍看到" },
      ],
      explanation: {
        headline: "接住还要说停",
        body: "return false 是契约：这张网负责。不说这句话，Vue 认为错误仍未处理。后备和翻车可能叠在一起。",
      },
      faqs: [
        { q: "什么时候故意不 return false？", a: "你想记日志，但让更外层的网决定要不要卸树。两张网可以接力。这一镜只有一张，所以要停。" },
        { q: "app.config.errorHandler 呢？", a: "最后兜底，拿来打日志、上报。它不会自动给你后备 UI。UI 仍要自己画。" },
      ],
      tryThis: "加到 3。对比上一镜：红字也许在，预览却可能仍报未处理。看完回到有 return false 的版本。",
      mapping: [{ code: "onErrorCaptured 无 return false", runtime: "继续向上", ui: "善后和翻车叠上" }],
    },
    {
      id: "capture-s5",
      tick: "S5",
      title: "点击里扔，树还在",
      goal: "Child 不再在渲染里扔。按钮 click 才 throw。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "子组件点「点我会扔错」。父有捕获和 return false。画面会？",
        choices: [
          { id: "crash", label: "整棵树卸掉，和渲染抛错一样", correct: false, why: "事件处理已经离开渲染。树这一帧是完整的。" },
          { id: "stay", label: "红字出现，卡片和父按钮都还在", correct: true, why: "捕获仍会接到。失败的是一次点击，不是一次绘制。" },
          { id: "silent", label: "什么都不发生，click 里的 throw 进不了 Vue", correct: false, why: "Vue 3 会把监听器里的错误交给同一张网。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appClickCatch, "src/Child.vue": childClickThrow },
        blocks: [{ id: "click", label: "⑥ throw 挪到 click" }],
        narration: "同一张网。扔的地方换了。脸会完全不同。",
      },
      counterfactual: {
        id: "render-vs-click",
        title: "渲染里扔 vs 点击里扔",
        setup: "都有错误。问的是树还在不在。",
        worlds: [worldRender, worldClick],
        punchline: "同样是 throw。渲染中途炸了要卸树；点击炸了只是一次事件失败。不要用同一张脸去猜。",
      },
      observe: {
        state: [{ id: "caught", label: "caught", value: "点击炸了", symbol: "caught" }],
        dom: [{ id: "card", label: "Child", value: "还在" }],
        events: [{ id: "click", label: "click", value: "boom()" }],
      },
      nodes: [
        { id: "click", kind: "event", label: "click throw" },
        { id: "cap", kind: "effect", label: "onErrorCaptured" },
        { id: "dom", kind: "dom", label: "DOM", detail: "还在" },
      ],
      edges: [
        { from: "click", to: "cap" },
        { from: "cap", to: "dom", label: "不卸树" },
      ],
      explanation: {
        headline: "两张嘴，一种 throw",
        body: "渲染错误：这一帧画不出来。事件错误：这一帧已经画完，动作失败。网都可以接。卸不卸树，取决于扔的地方。",
      },
      faqs: [
        { q: "为什么渲染更致命？", a: "因为 Vue 正拿着那棵树的半成品。事件处理只是你的函数，树已经在。" },
        { q: "click 里还要不要后备？", a: "要红字，但不必卸 Child。卸不卸取决于它下一次渲染还会不会炸。" },
      ],
      tryThis: "先加几次确认卡片还在。再点「点我会扔错」。红字出现，卡片必须还在。打开反事实对比渲染里扔。",
      mapping: [{ code: "@click=\"boom\"", runtime: "事件错误", ui: "树还在 + 红字" }],
    },
    {
      id: "capture-s6",
      tick: "S6",
      title: "拆掉网 / 不停画 / 继续传播",
      goal: "三种坏法：没网、有网仍画、有后备却往上送。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到「没有 onErrorCaptured」。加到 3 会？",
        choices: [
          { id: "fb", label: "子自己变成空白", correct: false, why: "S1：没网，火往上烧。" },
          { id: "crash", label: "整棵树翻车", correct: true, why: "边界不在时，没有局部失败这回事。" },
          { id: "ok", label: "n≥3 被 Vue 拦住", correct: false, why: "没有这种保护。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": appFallback, "src/Child.vue": childBoom },
        blocks: [{ id: "keep", label: "后备版本先留着" }],
        narration: "先加到 3 确认红字、父还在。再拆网、继续画 Child、拿掉 return false。",
      },
      observe: {
        state: [{ id: "ok", label: "边界", value: "完整" }],
        dom: [{ id: "fb", label: "后备", value: "父还在" }],
        events: [],
      },
      nodes: [
        { id: "cap", kind: "effect", label: "onErrorCaptured" },
        { id: "fb", kind: "render", label: "后备" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [
        { from: "cap", to: "fb" },
        { from: "fb", to: "dom" },
      ],
      ablations: [
        {
          id: "none",
          prompt: "如果没有捕获？",
          files: { "src/App.vue": appNoCapture, "src/Child.vue": childBoom },
          expected: {
            kind: "crash",
            message: "加到 3，整棵树翻车。没有网。",
          },
          lesson: "局部失败需要一张网。否则只有全局失败。",
        },
        {
          id: "keep",
          prompt: "如果捕获了仍画 Child？",
          files: { "src/App.vue": appCaptureKeep, "src/Child.vue": childBoom },
          expected: {
            kind: "crash",
            message: "接住又送回去。子继续在渲染里扔。",
          },
          lesson: "通知不是停火。",
        },
        {
          id: "prop",
          prompt: "如果忘记 return false？",
          files: { "src/App.vue": appPropagate, "src/Child.vue": childBoom },
          expected: {
            kind: "error",
            message: "局部红字可能出现，错误仍向上，运行时当未处理。",
          },
          lesson: "接住还要说停。",
        },
      ],
      explanation: {
        headline: "边界是三件事",
        body: "有人接、把肇事者摘掉、告诉 Vue 到此为止。少一件，脸就不一样：整页空白、反复炸、善后和翻车叠上。",
      },
      tryThis: "三种消融都加到 3。翻车、再炸、未处理，对上号再恢复。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先没网（全局失败），再有网仍画（停不了火），再漏 return false（局部和全局叠上）。" },
      ],
    },
    {
      id: "capture-s7",
      tick: "S7",
      title: "换：会炸的一页",
      goal: "两个 Tab。坏页在渲染时扔掉。先没有网。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "切到「坏页」时，同一组件的模板调用 boom()。会？",
        choices: [
          { id: "stay", label: "红字出现，安全页的按钮还在", correct: false, why: "现在还是同一个组件在画。渲染扔了，按钮和页面一起走。" },
          { id: "crash", label: "整页翻车。没有边界", correct: true, why: "和 Child 同一张图。要一张网，还要把坏页摘掉。" },
          { id: "ok", label: "v-else 会自己挡住 throw", correct: false, why: "v-else 只是另一段模板。跑到它时仍会 boom()。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "tabs", label: "换场景：两个 Tab" }],
        narration: "先看没有边界的坏页。想清楚切过去时谁该活。",
      },
      observe: {
        state: [{ id: "tab", label: "tab", value: "ok", symbol: "tab" }],
        dom: [{ id: "page", label: "p", value: "能画" }],
        events: [],
      },
      nodes: [
        { id: "tab", kind: "ref", label: "tab", symbol: "tab" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "tab", to: "dom" }],
      ablations: [
        {
          id: "bound",
          prompt: "拆成 Page + 捕获 + 后备之后？",
          files: { "src/App.vue": transferAfter, "src/Page.vue": transferChild },
          expected: {
            kind: "stale",
            message: "这是修复：坏页出红字，安全按钮还在。切回安全页应清掉 caught 再画。",
          },
          lesson: "迁移成功：你指出的是「渲染边界」，不是「再写一个 if」。",
        },
      ],
      explanation: {
        headline: "坏掉的一页不该带走整座应用",
        body: "诊断课收到这里：问早了会读到旧 DOM；渲染中途扔了要有网。下一课把「它坏了」变成一条可以绿、可以红的断言。",
      },
      faqs: [
        { q: "切回安全页为什么要清 caught？", a: "caught 还在就会一直显示后备，Page 挂不回去。复位是边界的第四件事。" },
        { q: "KeepAlive 坏页呢？", a: "缓存的是实例。它炸过一次，未复位前不要把它当活的。边界仍要铺在外面。" },
      ],
      tryThis: "先切坏页看翻车。再打开修复：坏页红字，安全按钮还在；切回安全应能画。",
      mapping: [
        { code: "同一组件里 throw", runtime: "无边界", ui: "整页卸掉" },
        { code: "Page + onErrorCaptured", runtime: "局部网", ui: "坏页红字，壳还在" },
      ],
    },
  ],
};
