import type { CausalLab, CounterfactualWorld } from "../types";

const live = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const shadow = ref('（还没跑）')
watchEffect(() => {
  shadow.value = who.value
})
</script>
<template>
  <p class="hint">订上了，还没剪</p>
  <p class="card">{{ who }}</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
</template>
`;

const withHalt = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const shadow = ref('（还没跑）')
const stopWatch = watchEffect(() => {
  shadow.value = who.value
})
</script>
<template>
  <p class="hint">先订上。点停订再换人</p>
  <p class="card">{{ who }}</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
  <button @click="stopWatch">停订</button>
</template>
`;

const haltNow = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const shadow = ref('（还没跑）')
const stopWatch = watchEffect(() => {
  shadow.value = who.value
})
stopWatch()
</script>
<template>
  <p class="hint">创建之后立刻 stop()</p>
  <p class="card">{{ who }}</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
</template>
`;

const twoFx = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const shadow = ref('（还没跑）')
const echo = ref('（还没跑）')
const stopShadow = watchEffect(() => {
  shadow.value = who.value
})
watchEffect(() => {
  echo.value = who.value
})
</script>
<template>
  <p class="hint">两份订。停订只剪影子</p>
  <p class="card">{{ who }}</p>
  <p class="probe">影子 {{ shadow }} · 回声 {{ echo }}</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
  <button @click="stopShadow">停影子</button>
</template>
`;

const resume = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const shadow = ref('（还没跑）')
let stopWatch = watchEffect(() => {
  shadow.value = who.value
})
function halt() {
  stopWatch()
}
function again() {
  stopWatch()
  stopWatch = watchEffect(() => {
    shadow.value = who.value
  })
}
</script>
<template>
  <p class="hint">停订之后可以再订一份新的</p>
  <p class="card">{{ who }}</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
  <button @click="halt">停订</button>
  <button @click="again">再订</button>
</template>
`;

const stacked = `<script setup>
import { ref, watchEffect } from 'vue'
const who = ref('Ada')
const stamp = ref(0)
let times = 0
function subscribe() {
  watchEffect(() => {
    who.value
    times += 1
    stamp.value = times
  })
}
subscribe()
</script>
<template>
  <p class="hint">再订一份，旧的也不停</p>
  <p class="card">{{ who }}</p>
  <p class="probe">跑了 {{ stamp }} 次</p>
  <button @click="who = who === 'Ada' ? 'Lin' : 'Ada'">换人</button>
  <button @click="subscribe">再订一份</button>
</template>
`;

const priceLive = `<script setup>
import { ref, watchEffect } from 'vue'
const price = ref(36)
const shadow = ref('（还没跑）')
watchEffect(() => {
  shadow.value = price.value + ' 元'
})
</script>
<template>
  <p class="hint">价钱的影子，还没剪</p>
  <p class="card">{{ price }} 元</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="price++">涨价</button>
</template>
`;

const priceHalt = `<script setup>
import { ref, watchEffect } from 'vue'
const price = ref(36)
const shadow = ref('（还没跑）')
const stopWatch = watchEffect(() => {
  shadow.value = price.value + ' 元'
})
stopWatch()
</script>
<template>
  <p class="hint">第一次报价之后立刻 stop()</p>
  <p class="card">{{ price }} 元</p>
  <p class="probe">影子 {{ shadow }}</p>
  <button @click="price++">涨价</button>
</template>
`;

const worldLive: CounterfactualWorld = {
  id: "live",
  name: "还没剪",
  tagline: "影子跟着走",
  files: { "src/App.vue": live },
  nodes: [
    { id: "who", kind: "ref", label: "who" },
    { id: "sh", kind: "ref", label: "影子" },
  ],
  edges: [{ from: "who", to: "sh", label: "订着" }],
  note: "stop() 没喊。换人影子跟着走。",
};

const worldHalt: CounterfactualWorld = {
  id: "halt",
  name: "剪断了",
  tagline: "影子冻在 Ada",
  files: { "src/App.vue": haltNow },
  nodes: [
    { id: "who", kind: "ref", label: "who" },
    { id: "sh", kind: "ref", label: "影子 Ada" },
  ],
  edges: [{ from: "who", to: "sh", label: "已停" }],
  note: "创建时跑过一次，影子已是 Ada。之后的换人叫不醒。",
};

export const WATCHESTOP_LAB: CausalLab = {
  id: "watchestop",
  world: 17,
  concept: "stop()",
  title: "订上了，也能剪断",
  subtitle: "watchEffect 返回 stop。喊它，订阅就断。第一跑写下的脸还在，只是以后不再跟。",
  promise:
    "一镜一条边：先跟着走，再停订后冻住，再立刻 stop 第一帧已是 Ada，再两份订只停一份，再停了还能再订，再叠两份一次加两次。",
  minutes: 16,
  official: "/guide/essentials/watchers.html#stopping-a-watcher",
  scenes: [
    {
      id: "watchestop-s0",
      tick: "S0",
      title: "订着，换人影子跟着走",
      goal: "watchEffect 读 who。没有 stop。打开 Ada / Ada。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": live },
        blocks: [{ id: "live", label: "① 还没剪" }],
        narration: "上一课订上了。这一课要学会剪。先看没剪的脸。",
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
      edges: [{ from: "fx", to: "sh" }],
      explanation: {
        headline: "订阅还活着",
        body: "下一镜多一个按钮：停订。剪断之后再换人。",
      },
      tryThis: "点换人，影子必须变成 Lin。记住这张跟着走的脸。",
      faqs: [
        { q: "stop 从哪来？", a: "watchEffect(...) 的返回值。喊一次，这份订阅就停。" },
      ],
    },
    {
      id: "watchestop-s1",
      tick: "S1",
      title: "停订之后，换人叫不醒",
      goal: "先点停订，再点换人。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点停订，再点换人。影子会？",
        choices: [
          { id: "stay", label: "仍是 Ada。订阅已经剪断", correct: true, why: "stop() 把边剪了。who 还在变，这份副作用不再听。" },
          { id: "lin", label: "变成 Lin。停订只停下一次", correct: false, why: "停了就是停了。不会自己长回来。" },
          { id: "empty", label: "变回（还没跑）", correct: false, why: "stop 不擦掉已经写下的影子。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": withHalt },
        blocks: [{ id: "halt", label: "② 停订" }],
        narration: "边还是那条。只是你亲手剪。",
      },
      counterfactual: {
        id: "live-vs-halt",
        title: "还订着 vs 剪断了",
        setup: "一边直接换人。一边先停再换。",
        worlds: [worldLive, worldHalt],
        punchline: "stop 剪的是以后。已经写下的脸还在。",
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
        { id: "stop", kind: "effect", label: "stop()", symbol: "stop" },
        { id: "sh", kind: "ref", label: "影子 Ada" },
      ],
      edges: [{ from: "stop", to: "sh", label: "剪断" }],
      explanation: {
        headline: "剪的是订阅，不是那张脸",
        body: "下一镜创建完立刻 stop。问：第一跑还来不来得及写 Ada。",
      },
      faqs: [
        { q: "和没读 who 那张脸像吗？", a: "像：换人影子都不动。不像：这里曾经订过，是你剪的。上一课是从来没订上。" },
      ],
      tryThis: "先点停订，再点换人：卡片 Lin，影子必须仍是 Ada。打开反事实。",
      mapping: [{ code: "stop()", runtime: "订阅断", ui: "影子冻住" }],
    },
    {
      id: "watchestop-s2",
      tick: "S2",
      title: "立刻 stop，第一帧已经是 Ada",
      goal: "watchEffect 下一行就 stop()。没有按钮。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开时影子是？",
        choices: [
          { id: "ada", label: "Ada。创建时已经跑过，stop 来不及拦第一跑", correct: true, why: "watchEffect 同步跑第一次。返回 stop 时，影子已经写好。" },
          { id: "empty", label: "（还没跑）。stop 会取消第一跑", correct: false, why: "第一跑在 stop 之前就结束了。" },
          { id: "lin", label: "Lin", correct: false, why: "who 还是 Ada。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": haltNow },
        blocks: [{ id: "now", label: "③ 立刻停" }],
        narration: "stop 很快。第一跑更快。",
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
        { id: "fx", kind: "effect", label: "第一跑" },
        { id: "stop", kind: "effect", label: "stop()" },
        { id: "sh", kind: "ref", label: "Ada" },
      ],
      edges: [
        { from: "fx", to: "sh", label: "写下" },
        { from: "stop", to: "fx", label: "以后别跑" },
      ],
      explanation: {
        headline: "stop 不撤回第一跑",
        body: "打开已是 Ada。再换人不动。下一镜两份订，只停一份。",
      },
      faqs: [
        { q: "想让第一跑也不发生？", a: "那就别创建这份 watchEffect。stop 是「订过了，现在停」。" },
      ],
      tryThis: "打开必须是 Ada / Ada。点换人：影子必须仍是 Ada。",
      mapping: [{ code: "watchEffect(); stop()", runtime: "第一跑已写完", ui: "Ada，然后冻住" }],
    },
    {
      id: "watchestop-s3",
      tick: "S3",
      title: "两份订，只停影子",
      goal: "影子和回声都抄 who。停订只剪影子那份。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点停影子，再点换人。回声会？",
        choices: [
          { id: "follow", label: "变成 Lin。停的是另一份", correct: true, why: "每份 watchEffect 有自己的 stop。剪一条，另一条还订着。" },
          { id: "stay", label: "仍是 Ada。stop 会停掉所有副作用", correct: false, why: "stop 只停返回它的那一份。" },
          { id: "empty", label: "变回（还没跑）", correct: false, why: "回声已经跑过，而且没被停。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": twoFx },
        blocks: [{ id: "two", label: "④ 两份订" }],
        narration: "一张脸两份订阅。剪哪条，哪条停。",
      },
      observe: {
        state: [
          { id: "sh", label: "影子", value: "Ada" },
          { id: "echo", label: "回声", value: "Lin" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 Ada · 回声 Lin" }],
        events: [],
      },
      nodes: [
        { id: "a", kind: "effect", label: "影子 已停" },
        { id: "b", kind: "effect", label: "回声 还订" },
        { id: "who", kind: "ref", label: "who" },
      ],
      edges: [
        { from: "who", to: "a", label: "已剪" },
        { from: "who", to: "b", label: "还订" },
      ],
      explanation: {
        headline: "stop 是这一份的剪刀",
        body: "下一镜停了之后再订一份新的。旧的不复活，新的会跟。",
      },
      faqs: [
        { q: "组件卸掉呢？", a: "setup 里创建的 watchEffect，会随组件 scope 一起停。显式 stop 是你提前剪。" },
      ],
      tryThis: "打开 Ada / Ada / Ada。点停影子，再换人：影子 Ada，回声必须是 Lin。",
      mapping: [{ code: "stopShadow()", runtime: "只剪影子", ui: "回声仍跟着走" }],
    },
    {
      id: "watchestop-s4",
      tick: "S4",
      title: "停了，还能再订一份新的",
      goal: "停订剪旧的。再订创建新的。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "先停订再换人（影子冻住），然后点再订。影子会？",
        choices: [
          { id: "now", label: "立刻变成现在的人。新的创建时就跑", correct: true, why: "再订是一份新的 watchEffect。创建时同步跑，抄当前的 who。" },
          { id: "stay", label: "仍是 Ada。停过就不能再订", correct: false, why: "旧的停了。新的是另一份。" },
          { id: "wait", label: "要再点一次换人才抄", correct: false, why: "那是 watch 没有 immediate 的脸。watchEffect 会先跑。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": resume },
        blocks: [{ id: "again", label: "⑤ 再订" }],
        narration: "旧剪刀剪旧边。新边是新订出来的。",
      },
      observe: {
        state: [{ id: "sh", label: "影子", value: "当前的 who" }],
        dom: [{ id: "probe", label: ".probe", value: "再订后立刻对齐" }],
        events: [],
      },
      nodes: [
        { id: "old", kind: "effect", label: "旧订 已停" },
        { id: "neu", kind: "effect", label: "新订" },
        { id: "sh", kind: "ref", label: "影子" },
      ],
      edges: [{ from: "neu", to: "sh", label: "第一跑" }],
      explanation: {
        headline: "再订不是复活，是新建",
        body: "下一镜再订时不剪旧的。两份一起跑，一次换人加两次。",
      },
      faqs: [
        { q: "再订里为什么先 stop 再创建？", a: "免得旧的还活着。那是下一镜的叠订。" },
      ],
      tryThis: "停订、换人，影子必须冻住。再订，影子必须立刻变成当前的人。再换人，必须跟着走。",
      mapping: [{ code: "stop(); watchEffect(...)", runtime: "新订阅", ui: "立刻对齐，然后跟着走" }],
    },
    {
      id: "watchestop-s5",
      tick: "S5",
      title: "再订一份，旧的也不停",
      goal: "打开已有一份。点再订一份，不剪旧的。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开是第 1 次。点再订一份，再点换人。次数变成？",
        choices: [
          { id: "four", label: "第 4 次。再订立刻 +1，换人两份各 +1", correct: true, why: "新的创建时就跑（2）。换人叫醒两份（3 和 4）。" },
          { id: "two", label: "第 2 次。旧的会被新的顶掉", correct: false, why: "没人替你 stop 旧的。" },
          { id: "three", label: "第 3 次。再订不先跑", correct: false, why: "watchEffect 创建时必跑。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": stacked },
        blocks: [{ id: "stack", label: "⑥ 叠订" }],
        narration: "和指令叠监听同一张脸：只加不摘。",
      },
      observe: {
        state: [{ id: "n", label: "次数", value: "4" }],
        dom: [{ id: "probe", label: ".probe", value: "跑了 4 次" }],
        events: [],
      },
      nodes: [
        { id: "a", kind: "effect", label: "旧订" },
        { id: "b", kind: "effect", label: "新订" },
        { id: "who", kind: "ref", label: "who" },
      ],
      edges: [
        { from: "who", to: "a" },
        { from: "who", to: "b" },
      ],
      explanation: {
        headline: "叠订的脸是加倍",
        body: "下一镜把三种脸放一起：还订着、立刻停、叠两份。",
      },
      faqs: [
        { q: "次数为什么不用 ref++？", a: "副作用里如果读了又写同一份次数，会自己叫醒自己。普通变量 times 只记账，stamp 只写不读。" },
      ],
      tryThis: "打开第 1 次。点再订一份，必须立刻第 2 次。再换人，必须第 4 次。",
      mapping: [{ code: "subscribe() 两次", runtime: "两份都订 who", ui: "换人 +2" }],
    },
    {
      id: "watchestop-s6",
      tick: "S6",
      title: "拆成跟着走 / 冻住 / 加倍",
      goal: "三种对照：没停、立刻停、叠订。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到还没剪的世界。点换人会？",
        choices: [
          { id: "lin", label: "影子 Lin。边还在", correct: true, why: "先确认好的脸。" },
          { id: "ada", label: "影子 Ada", correct: false, why: "那是停过的脸。" },
          { id: "four", label: "次数跳到 4", correct: false, why: "那是叠订。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": live },
        blocks: [{ id: "keep", label: "跟着走的版本先留着" }],
        narration: "先换人确认跟着走。再分别：立刻停、叠订。",
      },
      observe: {
        state: [{ id: "sh", label: "影子", value: "跟着 who" }],
        dom: [{ id: "probe", label: ".probe", value: "影子 Lin" }],
        events: [],
      },
      nodes: [
        { id: "fx", kind: "effect", label: "还订着" },
        { id: "sh", kind: "ref", label: "影子" },
      ],
      edges: [{ from: "fx", to: "sh" }],
      ablations: [
        {
          id: "halt",
          prompt: "如果创建完立刻 stop()？",
          files: { "src/App.vue": haltNow },
          expected: { kind: "stale", message: "打开已是 Ada。换人影子仍是 Ada。" },
          lesson: "第一跑写下了。以后剪断了。",
        },
        {
          id: "stack",
          prompt: "如果再订一份还不剪旧的？",
          files: { "src/App.vue": stacked },
          expected: { kind: "stale", message: "再订一份后换人，次数一次 +2。" },
          lesson: "只加不摘，换人加倍。",
        },
        {
          id: "two",
          prompt: "如果两份订只停影子？",
          files: { "src/App.vue": twoFx },
          expected: { kind: "stale", message: "停影子再换人：影子 Ada，回声 Lin。" },
          lesson: "剪刀只剪这一份。",
        },
      ],
      explanation: {
        headline: "跟着走、冻住、加倍",
        body: "三张脸，一把剪刀。下一课订还在时，定时器也要摘：onCleanup。",
      },
      tryThis: "三种消融：冻在 Ada、一次 +2、影子冻回声走。对上号再恢复：换人影子跟着走。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先立刻停，再叠订，再只停一份。" },
      ],
    },
    {
      id: "watchestop-s7",
      tick: "S7",
      title: "换：价钱",
      goal: "影子抄价钱。创建后立刻 stop()。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "点涨价。影子会？",
        choices: [
          { id: "stay", label: "仍是 36 元。第一跑写过，订阅已剪", correct: true, why: "换了文案，stop 那条边还在。" },
          { id: "up", label: "变成 37 元。价钱很轻", correct: false, why: "已经 stop。谁轻都叫不醒。" },
          { id: "empty", label: "变回（还没跑）", correct: false, why: "第一跑已经写成 36 元。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": priceHalt },
        blocks: [{ id: "price", label: "换场景：价钱" }],
        narration: "人换成价钱。问的仍是：剪断之后还会不会跟。",
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
      edges: [{ from: "p", to: "sh", label: "已停" }],
      ablations: [
        {
          id: "fix",
          prompt: "拿掉 stop() 之后？",
          files: { "src/App.vue": priceLive },
          expected: {
            kind: "stale",
            message: "这是对照：涨价后影子 37 元。边还在。",
          },
          lesson: "下一课：订还活着时，换人会再跑。再跑之前要把旧定时器摘掉。onCleanup。",
        },
      ],
      explanation: {
        headline: "剪刀剪的是以后",
        body: "第一报价还在。以后的涨价听不见。下一课副作用里如果开了表，停订不够，表也要停。",
      },
      faqs: [
        { q: "和没读 price 怎么区分？", a: "没读：从来没订上。stop：订过，剪了。两张脸都冻住，边的来历不同。" },
      ],
      tryThis: "打开 36 / 36 元。涨价：卡片 37，影子必须仍是 36 元。再打开对照：影子跟着 37。",
      mapping: [
        { code: "立刻 stop()", runtime: "订阅断", ui: "36 元冻住" },
        { code: "不 stop", runtime: "还订着", ui: "37 元" },
      ],
    },
  ],
};
