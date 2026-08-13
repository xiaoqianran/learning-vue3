import type { CausalLab, CounterfactualWorld } from "../types";

const copyRead = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const shadow = ref('（还没跑）')
watchEffect(() => {
  shadow.value = who.value
})
</script>
<template>
  <p class="hint">watchEffect 里读了 who</p>
  <p class="card">{{ who }}</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
</template>
`;

const noRead = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const shadow = ref('（还没跑）')
watchEffect(() => {
  shadow.value = 'Ada'
})
</script>
<template>
  <p class="hint">副作用里没有读 who</p>
  <p class="card">{{ who }}</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
</template>
`;

const extraN = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const n = ref(0)
const shadow = ref('')
let times = 0
watchEffect(() => {
  const w = who.value
  const x = n.value
  times += 1
  shadow.value = w + ' · 第 ' + times + ' 次'
})
</script>
<template>
  <p class="hint">副作用读了 who 和 n</p>
  <p class="card">{{ who }} / n {{ n }}</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
  <button @click="n++">n+1</button>
</template>
`;

const onlyWho = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const n = ref(0)
const shadow = ref('')
let times = 0
watchEffect(() => {
  const w = who.value
  times += 1
  shadow.value = w + ' · 第 ' + times + ' 次'
})
</script>
<template>
  <p class="hint">副作用只读了 who</p>
  <p class="card">{{ who }} / n {{ n }}</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
  <button @click="n++">n+1</button>
</template>
`;

const watchWho = `<script setup>
import { ref, watch } from 'vue'
const who = ref('Ada')
const n = ref(0)
const shadow = ref('')
let times = 0
watch(who, (w) => {
  times += 1
  shadow.value = w + ' · 第 ' + times + ' 次'
})
</script>
<template>
  <p class="hint">watch(who) · 名单写死</p>
  <p class="card">{{ who }} / n {{ n }}</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
  <button @click="n++">n+1</button>
</template>
`;

const watchImmediate = `<script setup>
import { ref, watch } from 'vue'
const who = ref('Ada')
const n = ref(0)
const shadow = ref('')
let times = 0
watch(who, (w) => {
  times += 1
  shadow.value = w + ' · 第 ' + times + ' 次'
}, { immediate: true })
</script>
<template>
  <p class="hint">watch(who, { immediate: true })</p>
  <p class="card">{{ who }} / n {{ n }}</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
  <button @click="n++">n+1</button>
</template>
`;

const priceCopy = `<script setup>
import { ref, watchEffect } from 'vue'
const price = ref(36)
const shadow = ref('（还没跑）')
watchEffect(() => {
  shadow.value = price.value + ' 元'
})
</script>
<template>
  <p class="hint">价钱的影子</p>
  <p class="card">{{ price }} 元</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="price++">涨价</button>
</template>
`;

const priceNoRead = `<script setup>
import { ref, watchEffect } from 'vue'
const price = ref(36)
const shadow = ref('（还没跑）')
watchEffect(() => {
  shadow.value = '36 元'
})
</script>
<template>
  <p class="hint">副作用里写死了 36</p>
  <p class="card">{{ price }} 元</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="price++">涨价</button>
</template>
`;

const worldRead: CounterfactualWorld = {
  id: "read",
  name: "读了 who",
  tagline: "影子跟着走",
  files: { "src/App.vue": copyRead },
  nodes: [
    { id: "who", kind: "ref", label: "who" },
    { id: "sh", kind: "ref", label: "影子" },
  ],
  edges: [{ from: "who", to: "sh", label: "读到了" }],
  note: "创建时跑一次，读到 who。换人会再跑。",
};

const worldBlind: CounterfactualWorld = {
  id: "blind",
  name: "没读 who",
  tagline: "影子停在 Ada",
  files: { "src/App.vue": noRead },
  nodes: [
    { id: "who", kind: "ref", label: "who" },
    { id: "sh", kind: "ref", label: "影子 Ada" },
  ],
  edges: [{ from: "who", to: "sh", label: "没订" }],
  note: "创建时跑了一次，但没读 who。换人叫醒不了它。",
};

export const WATCHEFFECT_LAB: CausalLab = {
  id: "watcheffect",
  world: 17,
  concept: "watchEffect",
  title: "读到的，才会订",
  subtitle: "watchEffect 创建时就跑。它订阅的是这次跑里读到的 ref。没读到的，换了也不会再跑。",
  promise:
    "一镜一条边：先读了 who 影子跟着走，再没读 who 影子钉在 Ada，再多读一个 n，n+1 也会跑，再只读 who 时 n+1 不跑，再换成 watch(who) 第一帧没有影子。",
  minutes: 16,
  official: "/guide/essentials/watchers.html#watcheffect",
  scenes: [
    {
      id: "watcheffect-s0",
      tick: "S0",
      title: "读了 who，影子一开始就在",
      goal: "watchEffect 里 shadow = who。打开就是 Ada / Ada。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": copyRead },
        blocks: [{ id: "read", label: "① 读到了" }],
        narration: "World 1 的 watch 要自己点名源。这一课副作用自己去读。先看读了 who 的脸。",
      },
      observe: {
        state: [
          { id: "who", label: "who", value: "Ada" },
          { id: "sh", label: "影子", value: "Ada" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 Ada" }],
        events: [],
      },
      nodes: [
        { id: "fx", kind: "effect", label: "watchEffect", symbol: "watchEffect" },
        { id: "sh", kind: "ref", label: "影子 Ada" },
      ],
      edges: [{ from: "fx", to: "sh", label: "创建时跑" }],
      explanation: {
        headline: "创建时就跑，顺手订上",
        body: "下一镜副作用里写成 shadow = 'Ada'，不读 who。换人看影子还跟不跟。",
      },
      tryThis: "打开必须是 Ada / 影子 Ada。点换人，两边都必须变成 Lin。",
      faqs: [
        { q: "和 computed 有什么不同？", a: "computed 是派生值，给别人读。watchEffect 是副作用：它去改另一份东西。这一课改的是影子。" },
      ],
    },
    {
      id: "watcheffect-s1",
      tick: "S1",
      title: "没读 who，换人叫不醒",
      goal: "watchEffect 里写死 shadow = 'Ada'。不读 who。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点换人。影子会？",
        choices: [
          { id: "stay", label: "仍是 Ada。没读到的，不会订", correct: true, why: "创建时跑了一次。那一次没碰 who。who 换了，没有订阅者。" },
          { id: "lin", label: "变成 Lin。watchEffect 会盯所有 ref", correct: false, why: "只订读到的。不是所有 ref。" },
          { id: "empty", label: "变回（还没跑）", correct: false, why: "已经跑过一次，影子是 Ada。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": noRead },
        blocks: [{ id: "blind", label: "② 没读到" }],
        narration: "who 在变。副作用看不见它。",
      },
      counterfactual: {
        id: "read-vs-blind",
        title: "读了 vs 没读",
        setup: "都点换人。差在副作用里有没有 who.value。",
        worlds: [worldRead, worldBlind],
        punchline: "订阅不是声明出来的。是跑的时候踩到的。",
      },
      observe: {
        state: [
          { id: "who", label: "who", value: "Lin" },
          { id: "sh", label: "影子", value: "Ada" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 Ada" }],
        events: [],
      },
      nodes: [
        { id: "who", kind: "ref", label: "who Lin" },
        { id: "sh", kind: "ref", label: "影子 Ada" },
      ],
      edges: [{ from: "who", to: "sh", label: "没订" }],
      explanation: {
        headline: "没踩到，就没订",
        body: "下一镜副作用同时读 who 和 n。n+1 也会让它再跑。",
      },
      faqs: [
        { q: "打开时影子为什么是 Ada？", a: "创建时跑了一次。那一次把影子写成 Ada。只是以后 who 变了它不知道。" },
      ],
      tryThis: "打开是 Ada / Ada。点换人：卡片 Lin，影子必须仍是 Ada。打开反事实。",
      mapping: [{ code: "不读 who.value", runtime: "没有订阅", ui: "影子钉在 Ada" }],
    },
    {
      id: "watcheffect-s2",
      tick: "S2",
      title: "多踩一个 n，n+1 也会跑",
      goal: "watchEffect 读 who 和 n。影子带次数。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "只点 n+1。影子会？",
        choices: [
          { id: "run", label: "次数 +1。读到了 n，n 就能叫醒它", correct: true, why: "这一次跑踩到了 n。n 变了必须再跑。" },
          { id: "stay", label: "次数不动。谁没换", correct: false, why: "订的是读到的所有 ref，不只是 who。" },
          { id: "lin", label: "人变成 Lin", correct: false, why: "没点换人。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": extraN },
        blocks: [{ id: "n", label: "③ 多踩一个" }],
        narration: "人没换。n 换了。副作用仍会起床。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "1" }],
        dom: [{ id: "probe", label: ".probe", value: "Ada · 第 2 次" }],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n" },
        { id: "fx", kind: "effect", label: "watchEffect" },
      ],
      edges: [{ from: "n", to: "fx", label: "踩到了" }],
      explanation: {
        headline: "踩到的都能叫醒",
        body: "下一镜把 n.value 从副作用里拿掉。n+1 就不跑了。",
      },
      faqs: [
        { q: "打开时为什么已经是第 1 次？", a: "创建时跑了一次。点 n+1 是第 2 次。" },
      ],
      tryThis: "打开是 Ada · 第 1 次。只点 n+1。必须变成 Ada · 第 2 次。人仍是 Ada。",
      mapping: [{ code: "读 n.value", runtime: "订上 n", ui: "n+1 次数加" }],
    },
    {
      id: "watcheffect-s3",
      tick: "S3",
      title: "不踩 n，n+1 叫不醒",
      goal: "watchEffect 只读 who。模板仍显示 n。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "只点 n+1。影子次数会？",
        choices: [
          { id: "stay", label: "仍是第 1 次。副作用没踩 n", correct: true, why: "模板读 n 会重画卡片。副作用没读 n，不跑。" },
          { id: "two", label: "第 2 次。卡片重画就会重跑副作用", correct: false, why: "渲染和副作用是两条边。画了不等于 watchEffect 再跑。" },
          { id: "zero", label: "清零", correct: false, why: "不跑就停在旧影子。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": onlyWho },
        blocks: [{ id: "who", label: "④ 只踩 who" }],
        narration: "卡片上的 n 会变。影子的次数不会。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "1" }],
        dom: [
          { id: "card", label: ".card", value: "Ada / n 1" },
          { id: "probe", label: ".probe", value: "Ada · 第 1 次" },
        ],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n" },
        { id: "fx", kind: "effect", label: "watchEffect" },
      ],
      edges: [{ from: "n", to: "fx", label: "没踩到" }],
      explanation: {
        headline: "画面更新，不等于副作用再跑",
        body: "下一镜换成 watch(who)。不写 immediate。打开时影子是空的。",
      },
      faqs: [
        { q: "这和 v-memo 的名单像吗？", a: "像「谁能叫醒」。v-memo 的名单是你写的。watchEffect 的名单是你踩到的。" },
      ],
      tryThis: "只点 n+1。卡片 n 必须是 1，影子必须仍是第 1 次。",
      mapping: [{ code: "不读 n.value", runtime: "没订 n", ui: "次数不动" }],
    },
    {
      id: "watcheffect-s4",
      tick: "S4",
      title: "换成 watch(who)，第一帧没有影子",
      goal: "watch(who, ...) 没有 immediate。影子初始是空串。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开这一镜。影子会？",
        choices: [
          { id: "empty", label: "空白。watch 默认等下一次变化", correct: true, why: "World 1 见过：没有 immediate，第一帧不跑。这里不重复讲 immediate，只对照：watchEffect 会先跑。" },
          { id: "ada", label: "Ada · 第 1 次。watch 也会立刻订", correct: false, why: "那是 watchEffect，或 watch 加了 immediate。" },
          { id: "err", label: "报错", correct: false, why: "合法。静默的空影子。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": watchWho },
        blocks: [{ id: "watch", label: "⑤ 换成 watch" }],
        narration: "源写死在 who 上。第一帧它选择不跑。",
      },
      observe: {
        state: [{ id: "sh", label: "影子", value: "空" }],
        dom: [{ id: "probe", label: ".probe", value: "影子" }],
        events: [],
      },
      nodes: [
        { id: "w", kind: "watch", label: "watch(who)" },
        { id: "sh", kind: "ref", label: "空影子" },
      ],
      edges: [{ from: "w", to: "sh", label: "等下次" }],
      explanation: {
        headline: "watch 点名源，默认不先跑",
        body: "下一镜给这份 watch 加上 immediate。第一帧就会有 Ada · 第 1 次。n+1 仍叫不醒——源还是只有 who。",
      },
      faqs: [
        { q: "这不是 World 1 的 immediate 吗？", a: "脸熟。这一镜只拿它当对照：watchEffect 没有这面旗，因为它靠第一次跑来收集订阅。" },
      ],
      tryThis: "打开时影子必须是空的。点换人，才出现 Lin · 第 1 次。点 n+1，次数不动。",
      mapping: [{ code: "watch(who) 无 immediate", runtime: "第一帧不跑", ui: "影子空" }],
    },
    {
      id: "watcheffect-s5",
      tick: "S5",
      title: "immediate 补上第一帧，仍不订 n",
      goal: "watch(who, { immediate: true })。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开。再只点 n+1。影子会？",
        choices: [
          { id: "stay", label: "仍是 Ada · 第 1 次。immediate 不订 n", correct: true, why: "immediate 只让第一帧跑。源仍是 who。n 不在名单里。" },
          { id: "two", label: "第 2 次。immediate 会变成 watchEffect", correct: false, why: "immediate 不是自动收集。源还是你点的名。" },
          { id: "empty", label: "又变空", correct: false, why: "第一帧已经写成 Ada。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": watchImmediate },
        blocks: [{ id: "imm", label: "⑥ immediate" }],
        narration: "第一帧借来了。订阅名单仍是手写的 who。",
      },
      observe: {
        state: [{ id: "sh", label: "影子", value: "Ada · 第 1 次" }],
        dom: [{ id: "card", label: ".card", value: "Ada / n 1" }],
        events: [],
      },
      nodes: [
        { id: "w", kind: "watch", label: "watch who" },
        { id: "n", kind: "ref", label: "n" },
      ],
      edges: [{ from: "n", to: "w", label: "不在名单" }],
      explanation: {
        headline: "先跑 ≠ 自动收集",
        body: "下一镜拆三种：没读 who、多踩 n、换成不先跑的 watch。",
      },
      faqs: [
        { q: "什么时候用 watch，什么时候用 watchEffect？", a: "源很清楚、还要旧值：watch。随手读几个 ref、马上要跑：watchEffect。派生值仍用 computed。" },
      ],
      tryThis: "打开是 Ada · 第 1 次。只点 n+1：卡片 n 是 1，影子次数必须不动。",
      mapping: [{ code: "watch(who, { immediate: true })", runtime: "先跑，源仍是 who", ui: "n+1 不叫醒" }],
    },
    {
      id: "watcheffect-s6",
      tick: "S6",
      title: "拆成没读 / 多踩 / 不先跑",
      goal: "对照：不读 who、读了 n、watch 无 immediate。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到读了 who 的 watchEffect。点换人会？",
        choices: [
          { id: "lin", label: "影子变成 Lin", correct: true, why: "先确认好的脸。" },
          { id: "ada", label: "影子仍 Ada", correct: false, why: "那是没读。" },
          { id: "empty", label: "影子空", correct: false, why: "那是 watch 不先跑。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": copyRead },
        blocks: [{ id: "keep", label: "读了 who 先留着" }],
        narration: "先换人看见影子跟着。再分别：没读、多踩 n、换成 watch。",
      },
      observe: {
        state: [],
        dom: [{ id: "probe", label: ".probe", value: "影子 Ada" }],
        events: [],
      },
      nodes: [
        { id: "fx", kind: "effect", label: "watchEffect" },
        { id: "sh", kind: "ref", label: "影子" },
      ],
      edges: [{ from: "fx", to: "sh" }],
      ablations: [
        {
          id: "blind",
          prompt: "如果副作用不读 who？",
          files: { "src/App.vue": noRead },
          expected: { kind: "stale", message: "换人后影子仍是 Ada。" },
          lesson: "没踩到，就没订。",
        },
        {
          id: "n",
          prompt: "如果还读了 n？",
          files: { "src/App.vue": extraN },
          expected: { kind: "stale", message: "点 n+1，影子次数变成 2。" },
          lesson: "踩到的都能叫醒。",
        },
        {
          id: "watch",
          prompt: "如果换成 watch(who) 且没有 immediate？",
          files: { "src/App.vue": watchWho },
          expected: { kind: "stale", message: "打开时影子是空的。点换人才出现。" },
          lesson: "watch 点名源，默认不先跑。",
        },
      ],
      explanation: {
        headline: "没踩、多踩、不先跑",
        body: "三张脸，三种订阅。下一课订上了也能停：stop()。",
      },
      tryThis: "三种消融：影子钉住、n+1 加次数、打开是空影子。对上号再恢复：换人影子跟着走。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先没读，再多踩 n，再换成 watch。" },
      ],
    },
    {
      id: "watcheffect-s7",
      tick: "S7",
      title: "换：价钱",
      goal: "影子抄价钱。副作用里写死 36 元。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "点涨价。影子会？",
        choices: [
          { id: "stay", label: "仍是 36 元。没读 price，和 who 那一课同一张没订", correct: true, why: "换了文案，踩到才订的边还在。" },
          { id: "up", label: "变成 37 元。价钱很轻", correct: false, why: "写死了字符串，没踩 price。" },
          { id: "empty", label: "变回（还没跑）", correct: false, why: "创建时已经跑过。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": priceNoRead },
        blocks: [{ id: "price", label: "换场景：价钱" }],
        narration: "人换成价钱。问的仍是：这次跑有没有踩到源。",
      },
      observe: {
        state: [
          { id: "p", label: "price", value: "37" },
          { id: "sh", label: "影子", value: "36 元" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 36 元" }],
        events: [],
      },
      nodes: [
        { id: "p", kind: "ref", label: "price" },
        { id: "sh", kind: "ref", label: "36 元" },
      ],
      edges: [{ from: "p", to: "sh", label: "没订" }],
      ablations: [
        {
          id: "fix",
          prompt: "改成读 price.value 之后？",
          files: { "src/App.vue": priceCopy },
          expected: {
            kind: "stale",
            message: "这是修复：打开就是 36 元。涨价后影子 37 元。",
          },
          lesson: "下一课：订上了也能停。stop() 切断订阅。",
        },
      ],
      explanation: {
        headline: "副作用的名单，是跑的时候踩出来的",
        body: "写死就订不上。读到才会订。下一课把这条订阅剪断。",
      },
      faqs: [
        { q: "和 World 16 的名单有什么不同？", a: "v-memo 的名单你写在指令上。watchEffect 的名单写在这次函数读了谁。" },
      ],
      tryThis: "先涨价看影子仍 36 元。再打开修复：影子必须跟着 37 元。",
      mapping: [
        { code: "写死 '36 元'", runtime: "没订 price", ui: "影子冻住" },
        { code: "读 price.value", runtime: "订上", ui: "37 元" },
      ],
    },
  ],
};
