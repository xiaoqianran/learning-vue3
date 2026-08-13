import type { CausalLab, CounterfactualWorld } from "../types";

const script = `<script setup>
import { ref } from 'vue'
const names = ['甲', '乙', '丙']
const selected = ref('甲')
const paints = { 甲: 0, 乙: 0, 丙: 0 }
function paint(name) {
  paints[name] += 1
  return paints[name]
}
</script>
`;

const allPaint = `${script}<template>
  <p class="hint">点名字选中。绿框 = 选中。数字 = 画了几次</p>
  <p
    v-for="name in names"
    :key="name"
    class="card"
    :class="{ on: name === selected }"
    @click="selected = name"
  >
    {{ name }} · 第 {{ paint(name) }} 次画
  </p>
</template>
`;

const memoSel = `${script}<template>
  <p class="hint">v-memo="[name === selected]"</p>
  <p
    v-for="name in names"
    :key="name"
    v-memo="[name === selected]"
    class="card"
    :class="{ on: name === selected }"
    @click="selected = name"
  >
    {{ name }} · 第 {{ paint(name) }} 次画
  </p>
</template>
`;

const memoEmpty = `${script}<template>
  <p class="hint">每项 v-memo="[]"</p>
  <p
    v-for="name in names"
    :key="name"
    v-memo="[]"
    class="card"
    :class="{ on: name === selected }"
    @click="selected = name"
  >
    {{ name }} · 第 {{ paint(name) }} 次画
  </p>
</template>
`;

const memoWide = `${script}<template>
  <p class="hint">v-memo="[selected]" · 名单太宽</p>
  <p
    v-for="name in names"
    :key="name"
    v-memo="[selected]"
    class="card"
    :class="{ on: name === selected }"
    @click="selected = name"
  >
    {{ name }} · 第 {{ paint(name) }} 次画
  </p>
</template>
`;

const memoName = `${script}<template>
  <p class="hint">v-memo="[name]" · name 永远不变</p>
  <p
    v-for="name in names"
    :key="name"
    v-memo="[name]"
    class="card"
    :class="{ on: name === selected }"
    @click="selected = name"
  >
    {{ name }} · 第 {{ paint(name) }} 次画
  </p>
</template>
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const items = [
  { id: 1, title: '早鸟', price: 36 },
  { id: 2, title: '普通', price: 48 },
  { id: 3, title: '现场', price: 60 },
]
const selected = ref(1)
</script>
<template>
  <p class="hint">点卡片选中。没有 v-memo</p>
  <p
    v-for="it in items"
    :key="it.id"
    class="card"
    :class="{ on: it.id === selected }"
    @click="selected = it.id"
  >
    {{ it.title }} · {{ it.price }} 元
  </p>
</template>
`;

const transferFixed = `<script setup>
import { ref } from 'vue'
const items = [
  { id: 1, title: '早鸟', price: 36 },
  { id: 2, title: '普通', price: 48 },
  { id: 3, title: '现场', price: 60 },
]
const selected = ref(1)
</script>
<template>
  <p class="hint">只有选中状态变了的那几行才重画</p>
  <p
    v-for="it in items"
    :key="it.id"
    v-memo="[it.id === selected]"
    class="card"
    :class="{ on: it.id === selected }"
    @click="selected = it.id"
  >
    {{ it.title }} · {{ it.price }} 元
  </p>
</template>
`;

const worldAll: CounterfactualWorld = {
  id: "all",
  name: "没有 v-memo",
  tagline: "丙也再画",
  files: { "src/App.vue": allPaint },
  nodes: [
    { id: "click", kind: "event", label: "点乙" },
    { id: "c", kind: "dom", label: "丙 第 2 次" },
  ],
  edges: [{ from: "click", to: "c", label: "也画" }],
  note: "选乙和丙无关。没有名单，三行都再画一遍。",
};

const worldMemo: CounterfactualWorld = {
  id: "memo",
  name: "v-memo 选中态",
  tagline: "丙仍第 1 次",
  files: { "src/App.vue": memoSel },
  nodes: [
    { id: "click", kind: "event", label: "点乙" },
    { id: "c", kind: "dom", label: "丙 第 1 次" },
  ],
  edges: [{ from: "click", to: "c", label: "跳过" }],
  note: "丙的 name === selected 还是 false。名单没变，不画。",
};

export const VMEMOLIST_LAB: CausalLab = {
  id: "vmemolist",
  world: 16,
  concept: "v-memo + v-for",
  title: "列表里，只有被叫醒的行才画",
  subtitle: "v-for 每一项都可以有自己的 v-memo。名单写成「我是不是选中」，没变的行就跳过。",
  promise:
    "一镜一条边：先点乙三行都再画，再只盯选中态时丙跳过，再空名单绿框粘住，再名单太宽三行又都画，再只盯 name 也粘住。",
  minutes: 16,
  official: "/api/built-in-directives.html#v-memo",
  scenes: [
    {
      id: "vmemolist-s0",
      tick: "S0",
      title: "点乙，三行都再画",
      goal: "甲乙丙。点选中。没有 v-memo。paint() 记次数。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": allPaint },
        blocks: [{ id: "all", label: "① 全都画" }],
        narration: "模板每画一次，那一行的数字 +1。先看没有名单时，点乙连丙也加。",
      },
      observe: {
        state: [{ id: "s", label: "selected", value: "乙" }],
        dom: [
          { id: "a", label: "甲", value: "第 2 次" },
          { id: "b", label: "乙", value: "第 2 次" },
          { id: "c", label: "丙", value: "第 2 次" },
        ],
        events: [{ id: "click", label: "点乙", value: "selected = 乙" }],
      },
      nodes: [
        { id: "s", kind: "ref", label: "selected" },
        { id: "c", kind: "dom", label: "丙" },
      ],
      edges: [{ from: "s", to: "c", label: "也画" }],
      explanation: {
        headline: "列表默认整表更新",
        body: "丙和这次点击无关，也被画了。下一镜给每一项加上 v-memo=\"[name === selected]\"。",
      },
      tryThis: "打开时三行都是第 1 次，甲有绿框。点乙。三行都必须变成第 2 次，绿框到乙。",
      faqs: [
        { q: "paint 写在模板里合法吗？", a: "副作用。这一课故意用它当「画了一次」的脸。正经代码别这么干。" },
      ],
    },
    {
      id: "vmemolist-s1",
      tick: "S1",
      title: "只盯选中态，丙跳过",
      goal: "v-memo=\"[name === selected]\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点乙。丙的次数会？",
        choices: [
          { id: "one", label: "仍是第 1 次。丙的选中态还是 false", correct: true, why: "甲从 true→false，乙从 false→true，这两行名单变了。丙一直是 false。" },
          { id: "two", label: "第 2 次。v-for 一变全画", correct: false, why: "那是没有 v-memo 的脸。" },
          { id: "zero", label: "回到 0。跳过会清零", correct: false, why: "不画就停在旧数字。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": memoSel },
        blocks: [{ id: "sel", label: "② 盯选中态" }],
        narration: "叫醒的是「我是不是选中」变了的那几行。",
      },
      counterfactual: {
        id: "all-vs-sel",
        title: "全画 vs 只画被叫醒的",
        setup: "都点乙。差在有没有 v-memo=\"[name === selected]\"。",
        worlds: [worldAll, worldMemo],
        punchline: "丙不必知道这次换人。名单没变，就让它睡。",
      },
      observe: {
        state: [{ id: "s", label: "selected", value: "乙" }],
        dom: [
          { id: "a", label: "甲", value: "第 2 次（丢掉绿框）" },
          { id: "b", label: "乙", value: "第 2 次（拿到绿框）" },
          { id: "c", label: "丙", value: "第 1 次" },
        ],
        events: [],
      },
      nodes: [
        { id: "memo", kind: "script", label: "v-memo 选中态", symbol: "v-memo" },
        { id: "c", kind: "dom", label: "丙 第 1 次" },
      ],
      edges: [{ from: "memo", to: "c", label: "跳过" }],
      explanation: {
        headline: "每一行自己的名单",
        body: "下一镜改成 v-memo=\"[]\"。绿框会粘在甲上——连选中态都不让更新。",
      },
      faqs: [
        { q: "为什么甲也要再画？", a: "甲从选中变成没选中。它的名单变了。绿框要摘掉，必须画。" },
      ],
      tryThis: "点乙。甲乙必须是第 2 次，丙必须仍是第 1 次。打开反事实。",
      mapping: [{ code: "v-memo=\"[name === selected]\"", runtime: "选中态没变则跳过", ui: "丙不画" }],
    },
    {
      id: "vmemolist-s2",
      tick: "S2",
      title: "空名单，绿框粘住",
      goal: "每项 v-memo=\"[]\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点乙。绿框会？",
        choices: [
          { id: "stick", label: "仍在甲上。三行都不再画", correct: true, why: "空名单永远相同。:class 的绿框也更新不了。" },
          { id: "move", label: "移到乙。class 不受 v-memo 管", correct: false, why: "class 也在这棵子树里。" },
          { id: "both", label: "甲乙都绿。跳过会叠上", correct: false, why: "不画就停在旧脸。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": memoEmpty },
        blocks: [{ id: "empty", label: "③ 空名单" }],
        narration: "selected 已经是乙。画面不知道。",
      },
      observe: {
        state: [{ id: "s", label: "selected", value: "乙（画面仍甲）" }],
        dom: [
          { id: "a", label: "甲", value: "绿框还在 · 第 1 次" },
          { id: "b", label: "乙", value: "没有绿框 · 第 1 次" },
        ],
        events: [],
      },
      nodes: [
        { id: "memo", kind: "script", label: "v-memo []" },
        { id: "a", kind: "dom", label: "绿框粘住" },
      ],
      edges: [{ from: "memo", to: "a", label: "不摘" }],
      explanation: {
        headline: "不画，绿框也冻住",
        body: "下一镜 v-memo=\"[selected]\"。selected 一变，三行名单都变，又全画。",
      },
      faqs: [
        { q: "次数还是 1？", a: "对。打开时画了一次。之后空名单拦住。点了也不加。" },
      ],
      tryThis: "点乙。绿框必须仍在甲上。三行都必须仍是第 1 次。",
      mapping: [{ code: "v-memo=\"[]\"", runtime: "每项都像 v-once", ui: "绿框粘住" }],
    },
    {
      id: "vmemolist-s3",
      tick: "S3",
      title: "名单太宽，三行又都画",
      goal: "v-memo=\"[selected]\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点乙。丙的次数会？",
        choices: [
          { id: "two", label: "第 2 次。每行都盯同一份 selected", correct: true, why: "selected 一变，三行的名单都变。等于没写 v-memo。" },
          { id: "one", label: "仍第 1 次。丙不是选中的", correct: false, why: "名单写的是 selected 本身，不是「我是否选中」。" },
          { id: "stick", label: "绿框粘住", correct: false, why: "那是空名单。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": memoWide },
        blocks: [{ id: "wide", label: "④ 太宽" }],
        narration: "通行证上写了全局的 selected。一人换，全员起床。",
      },
      observe: {
        state: [{ id: "s", label: "selected", value: "乙" }],
        dom: [{ id: "c", label: "丙", value: "第 2 次" }],
        events: [],
      },
      nodes: [
        { id: "memo", kind: "script", label: "[selected]" },
        { id: "c", kind: "dom", label: "丙 第 2 次" },
      ],
      edges: [{ from: "memo", to: "c", label: "放行" }],
      explanation: {
        headline: "名单太宽，等于没有",
        body: "下一镜另一极端：v-memo=\"[name]\"。name 对每一行是常量，谁也叫不醒。",
      },
      faqs: [
        { q: "那正确的名单是什么？", a: "这一项的选中态：name === selected。它只在「我被选上 / 我被丢掉」时变。" },
      ],
      tryThis: "点乙。三行都必须是第 2 次，绿框在乙。",
      mapping: [{ code: "v-memo=\"[selected]\"", runtime: "全员名单都变", ui: "丙也画" }],
    },
    {
      id: "vmemolist-s4",
      tick: "S4",
      title: "只盯 name，也粘住",
      goal: "v-memo=\"[name]\"。name 对每一行不会变。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点乙。绿框会？",
        choices: [
          { id: "stick", label: "仍在甲上。name 从没变过", correct: true, why: "甲还是甲。名单每次相同。和空名单同一张粘脸。" },
          { id: "move", label: "移到乙。name 在名单里就能换选中", correct: false, why: "name 是行的身份，不是选中态。" },
          { id: "two", label: "三行第 2 次", correct: false, why: "那是名单太宽。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": memoName },
        blocks: [{ id: "name", label: "⑤ 只盯身份" }],
        narration: "盯错了东西。身份没变，选中变了也不画。",
      },
      observe: {
        state: [{ id: "s", label: "selected", value: "乙（画面仍甲）" }],
        dom: [{ id: "a", label: "甲", value: "绿框还在" }],
        events: [],
      },
      nodes: [
        { id: "memo", kind: "script", label: "[name]" },
        { id: "a", kind: "dom", label: "绿框粘住" },
      ],
      edges: [{ from: "memo", to: "a", label: "身份没变" }],
      explanation: {
        headline: "盯身份，盯不到选中",
        body: "空名单和 [name] 脸一样粘。原因：一个什么都不盯，一个盯了不会变的。下一镜两张卡对照。",
      },
      faqs: [
        { q: "key 不就是 name 吗？", a: "key 让 Vue 认是同一行。v-memo 决定这一行还要不要画。两把钥匙。" },
      ],
      tryThis: "点乙。绿框必须仍在甲上。",
      mapping: [{ code: "v-memo=\"[name]\"", runtime: "常量名单", ui: "绿框粘住" }],
    },
    {
      id: "vmemolist-s5",
      tick: "S5",
      title: "甲→乙→丙，只有被叫醒的加次数",
      goal: "回到正确名单。连点乙，再点丙。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "先点乙，再点丙。甲的次数会？",
        choices: [
          { id: "two", label: "第 2 次。甲只在丢掉绿框那一帧被叫醒", correct: true, why: "甲→乙 时甲变 false。乙→丙 时甲一直是 false，不再画。" },
          { id: "three", label: "第 3 次。点两次，甲也陪两次", correct: false, why: "第二次甲的选中态没变。" },
          { id: "one", label: "仍第 1 次。甲后来没人理", correct: false, why: "丢掉绿框那一次必须画。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": memoSel },
        blocks: [{ id: "seq", label: "⑥ 连点" }],
        narration: "每一次点击，只叫醒「选中态翻转」的那两行。",
      },
      observe: {
        state: [{ id: "s", label: "selected", value: "丙" }],
        dom: [
          { id: "a", label: "甲", value: "第 2 次" },
          { id: "b", label: "乙", value: "第 3 次（选上又丢掉）" },
          { id: "c", label: "丙", value: "第 2 次" },
        ],
        events: [],
      },
      nodes: [
        { id: "a", kind: "dom", label: "甲 2" },
        { id: "b", kind: "dom", label: "乙 3" },
        { id: "c", kind: "dom", label: "丙 2" },
      ],
      edges: [{ from: "b", to: "c", label: "乙叫醒丙" }],
      explanation: {
        headline: "谁翻转，谁起床",
        body: "下一镜拆三种：全画、空名单粘住、名单太宽。",
      },
      faqs: [
        { q: "乙为什么是 3？", a: "打开第 1；点乙选上第 2；点丙丢掉第 3。两次翻转。" },
      ],
      tryThis: "点乙，再点丙。甲第 2，乙第 3，丙第 2。绿框在丙。",
      mapping: [{ code: "两次切换", runtime: "每行只在翻转时画", ui: "甲 2 / 乙 3 / 丙 2" }],
    },
    {
      id: "vmemolist-s6",
      tick: "S6",
      title: "拆成全画 / 粘住 / 太宽",
      goal: "对照：没有 v-memo、空名单、[selected]。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到正确名单。点乙，丙会？",
        choices: [
          { id: "one", label: "仍第 1 次", correct: true, why: "先确认好的脸。" },
          { id: "two", label: "第 2 次", correct: false, why: "那是全画或太宽。" },
          { id: "stick", label: "绿框粘在甲", correct: false, why: "那是空名单或 [name]。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": memoSel },
        blocks: [{ id: "keep", label: "正确名单先留着" }],
        narration: "先点乙看见丙不画。再分别：拿掉 v-memo、空名单、名单太宽。",
      },
      observe: {
        state: [],
        dom: [{ id: "c", label: "丙", value: "第 1 次" }],
        events: [],
      },
      nodes: [
        { id: "memo", kind: "script", label: "选中态" },
        { id: "c", kind: "dom", label: "丙" },
      ],
      edges: [{ from: "memo", to: "c" }],
      ablations: [
        {
          id: "all",
          prompt: "如果去掉 v-memo？",
          files: { "src/App.vue": allPaint },
          expected: { kind: "stale", message: "点乙，丙也是第 2 次。" },
          lesson: "没有名单，整表更新。",
        },
        {
          id: "empty",
          prompt: "如果每项 v-memo=\"[]\"？",
          files: { "src/App.vue": memoEmpty },
          expected: { kind: "stale", message: "点乙，绿框粘在甲上。" },
          lesson: "空名单连绿框也不让摘。",
        },
        {
          id: "wide",
          prompt: "如果 v-memo=\"[selected]\"？",
          files: { "src/App.vue": memoWide },
          expected: { kind: "stale", message: "点乙，丙也是第 2 次。名单太宽。" },
          lesson: "盯全局，等于没跳过。",
        },
      ],
      explanation: {
        headline: "全画、粘住、太宽",
        body: "三张错脸，三种名单。World 16 收束：有些节点不必再画。v-once 永远钉，v-memo 看名单，列表只叫醒翻转的行。",
      },
      tryThis: "三种消融：丙第 2、绿框粘住、丙第 2。对上号再恢复：丙第 1。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先拿掉，再空名单，再太宽。" },
      ],
    },
    {
      id: "vmemolist-s7",
      tick: "S7",
      title: "换：票种",
      goal: "早鸟 / 普通 / 现场。点选中。没有 v-memo。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "点「普通」。绿框会？",
        choices: [
          { id: "move", label: "移到普通。没有钉子，三行都更新", correct: true, why: "换了文案，默认整表画。绿框会走。" },
          { id: "stick", label: "粘在早鸟。票种该冻", correct: false, why: "这一镜还没写 v-memo。" },
          { id: "err", label: "报错", correct: false, why: "能跑。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "tix", label: "换场景：票种" }],
        narration: "甲乙丙换成票种。问的仍是：谁该被这次点击叫醒。",
      },
      observe: {
        state: [{ id: "s", label: "selected", value: "2" }],
        dom: [{ id: "b", label: "普通", value: "绿框" }],
        events: [],
      },
      nodes: [
        { id: "s", kind: "ref", label: "selected" },
        { id: "b", kind: "dom", label: "普通" },
      ],
      edges: [{ from: "s", to: "b" }],
      ablations: [
        {
          id: "fix",
          prompt: "加上 v-memo=\"[it.id === selected]\" 之后？",
          files: { "src/App.vue": transferFixed },
          expected: {
            kind: "stale",
            message: "这是修复：绿框仍会移到普通。现场那一行不必重画。脸看起来一样，边少了一条。",
          },
          lesson: "World 16 收束：永远钉、按名单钉、列表只叫醒翻转的行。下一课：读到的才会订。",
        },
      ],
      explanation: {
        headline: "列表的钉子写在每一行上",
        body: "没有 v-memo，绿框也会走，只是丙那种无关的行多画了。加上之后，脸可以相同，边更少。World 16 停在「不必再画」。下一课副作用自己去读：watchEffect。名单不是你写的，是踩出来的。",
      },
      faqs: [
        { q: "短列表也要 v-memo 吗？", a: "不必。先让脸是对的。行很多、每一行很贵，再写名单。名单写错就是粘绿框。" },
        { q: "下一课是什么？", a: "watchEffect。v-memo 的名单写在指令上。副作用的名单，是这次函数读了谁。" },
      ],
      tryThis: "先点普通看绿框走过去。再打开修复：绿框同样会走，那是对的；记住现场那一行现在可以不画。",
      mapping: [
        { code: "没有 v-memo", runtime: "整表更新", ui: "绿框走，三行都画" },
        { code: "v-memo 选中态", runtime: "只叫醒翻转的行", ui: "绿框走，无关行睡" },
      ],
    },
  ],
};
