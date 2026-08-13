import type { CausalLab, CounterfactualWorld } from "../types";

const live = `<script>
import { h, ref } from 'vue'
export default {
  setup() {
    const who = ref('Ada')
    function toggle() {
      who.value = who.value === 'Ada' ? 'Lin' : 'Ada'
    }
    return () => h('div', [
      h('p', { class: 'hint' }, '每次渲染都现画卡片'),
      h('p', { class: 'card' }, who.value),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const frozen = `<script>
import { h, ref } from 'vue'
export default {
  setup() {
    const who = ref('Ada')
    const card = h('p', { class: 'card' }, who.value)
    function toggle() {
      who.value = who.value === 'Ada' ? 'Lin' : 'Ada'
    }
    return () => h('div', [
      h('p', { class: 'hint' }, '卡片在 setup 里画过一次'),
      card,
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const twoLive = `<script>
import { h, ref } from 'vue'
export default {
  setup() {
    const who = ref('Ada')
    function toggle() {
      who.value = who.value === 'Ada' ? 'Lin' : 'Ada'
    }
    return () => h('div', [
      h('p', { class: 'hint' }, '两张都在渲染函数里画'),
      h('p', { class: 'card' }, who.value),
      h('p', { class: 'card' }, who.value),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const ternaryNull = `<script>
import { h, ref } from 'vue'
export default {
  setup() {
    const n = ref(1)
    return () => h('div', [
      h('p', { class: 'hint' }, 'n 是 0 就返回 null'),
      n.value ? h('p', { class: 'card' }, 'n ' + n.value) : null,
      h('p', { class: 'probe' }, 'n ' + n.value),
      h('button', { onClick: () => { n.value += 1 } }, '+1'),
      h('button', { onClick: () => { n.value = 0 } }, '卸掉')
    ])
  }
}
</script>
`;

const andZero = `<script>
import { h, ref } from 'vue'
export default {
  setup() {
    const n = ref(1)
    return () => h('div', [
      h('p', { class: 'hint' }, 'n && h(...)，n 是 0 时'),
      n.value && h('p', { class: 'card' }, 'n ' + n.value),
      h('p', { class: 'probe' }, 'n ' + n.value),
      h('button', { onClick: () => { n.value += 1 } }, '+1'),
      h('button', { onClick: () => { n.value = 0 } }, '卸掉')
    ])
  }
}
</script>
`;

const returnString = `<script>
import { ref } from 'vue'
export default {
  setup() {
    const who = ref('Ada')
    return () => who.value
  }
}
</script>
`;

const priceLive = `<script>
import { h, ref } from 'vue'
export default {
  setup() {
    const price = ref(36)
    return () => h('div', [
      h('p', { class: 'hint' }, '每次渲染现画价钱'),
      h('p', { class: 'card' }, price.value + ' 元'),
      h('p', { class: 'probe' }, '影子 ' + price.value + ' 元'),
      h('button', { onClick: () => { price.value += 1 } }, '涨价')
    ])
  }
}
</script>
`;

const priceFrozen = `<script>
import { h, ref } from 'vue'
export default {
  setup() {
    const price = ref(36)
    const card = h('p', { class: 'card' }, price.value + ' 元')
    return () => h('div', [
      h('p', { class: 'hint' }, '报价在 setup 里画过一次'),
      card,
      h('p', { class: 'probe' }, '影子 ' + price.value + ' 元'),
      h('button', { onClick: () => { price.value += 1 } }, '涨价')
    ])
  }
}
</script>
`;

const worldLive: CounterfactualWorld = {
  id: "live",
  name: "每次现画",
  tagline: "卡片跟着走",
  files: { "src/App.vue": live },
  nodes: [
    { id: "h", kind: "render", label: "return () => h(...)" },
    { id: "dom", kind: "dom", label: "卡片" },
  ],
  edges: [{ from: "h", to: "dom", label: "现画" }],
  note: "换人时渲染函数再跑。新的 h() 带上现在的 who。",
};

const worldFrozen: CounterfactualWorld = {
  id: "frozen",
  name: "setup 里画一次",
  tagline: "卡片冻在 Ada",
  files: { "src/App.vue": frozen },
  nodes: [
    { id: "snap", kind: "render", label: "setup 里的 vnode" },
    { id: "dom", kind: "dom", label: "卡片 Ada" },
  ],
  edges: [{ from: "snap", to: "dom", label: "快照" }],
  note: "children 在创建时已是字符串 Ada。渲染再跑也只是把这颗旧节点贴回去。",
};

export const HSNAP_LAB: CausalLab = {
  id: "hsnap",
  world: 18,
  concept: "vnode snapshot",
  title: "setup 里画一次，得到的是快照",
  subtitle: "h() 当时读到的字符串，会写进那颗节点。渲染再跑，若仍贴这颗旧的，卡片不会跟。",
  promise:
    "一镜一条边：先每次现画，再 setup 里冻住卡片，再两张都现画，再三元运算返回 null，再 n && h() 画出 0，再渲染函数只返回字符串。",
  minutes: 16,
  official: "/guide/extras/render-function.html#declaring-render-functions",
  scenes: [
    {
      id: "hsnap-s0",
      tick: "S0",
      title: "每次渲染，现画一颗",
      goal: "h() 写在 return () => 里面。打开 Ada / Ada。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": live },
        blocks: [{ id: "live", label: "① 现画" }],
        narration: "上一课格子里要放文本。这一课问这颗节点何时创建。先看每次现画的脸。",
      },
      observe: {
        state: [
          { id: "who", label: "who", value: "Ada" },
          { id: "card", label: "卡片", value: "Ada" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 Ada" }],
        events: [],
      },
      nodes: [
        { id: "render", kind: "render", label: "渲染函数" },
        { id: "h", kind: "render", label: "h()", symbol: "h" },
        { id: "dom", kind: "dom", label: "卡片" },
      ],
      edges: [
        { from: "render", to: "h" },
        { from: "h", to: "dom" },
      ],
      explanation: {
        headline: "渲染函数再跑，h() 再调用",
        body: "下一镜把 h() 挪到 setup 里，只调用一次。探针仍在渲染函数里读 who。",
      },
      tryThis: "点换人，卡片和影子必须一起变成 Lin。记住这张两头都活的脸。",
      faqs: [
        { q: "和 v-once 像吗？", a: "不像。这里两头都活。v-once 是画过之后跳过更新。下一镜才冻。" },
      ],
    },
    {
      id: "hsnap-s1",
      tick: "S1",
      title: "setup 里画的卡片，换人叫不醒",
      goal: "const card = h('p', { class: 'card' }, who.value) 写在 setup。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点换人。卡片会？",
        choices: [
          { id: "stay", label: "仍是 Ada。探针变成 Lin。这颗节点是快照", correct: true, why: "创建时 children 已是字符串 Ada。渲染再跑只是把旧节点贴回去。" },
          { id: "both", label: "两头都 Lin。渲染再跑就会重画", correct: false, why: "重跑不等于重调用 h()。贴回去的是同一颗。" },
          { id: "empty", label: "卡片变空", correct: false, why: "快照还在，上面写着 Ada。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": frozen },
        blocks: [{ id: "snap", label: "② 快照" }],
        narration: "探针每次现拼。卡片只在 setup 里 h() 过一次。",
      },
      counterfactual: {
        id: "live-vs-frozen",
        title: "现画 vs 快照",
        setup: "都点换人。只看卡片跟不跟。",
        worlds: [worldLive, worldFrozen],
        punchline: "渲染再跑，不够。要再 h() 一次，才是新脸。",
      },
      observe: {
        state: [
          { id: "who", label: "who", value: "Lin" },
          { id: "card", label: "卡片", value: "Ada" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 Lin" }],
        events: [],
      },
      nodes: [
        { id: "snap", kind: "render", label: "setup 的 vnode" },
        { id: "who", kind: "ref", label: "who Lin" },
        { id: "dom", kind: "dom", label: "卡片 Ada" },
      ],
      edges: [
        { from: "snap", to: "dom", label: "冻住" },
        { from: "who", to: "dom", label: "没订这颗" },
      ],
      explanation: {
        headline: "vnode 里的文本是当时拍下的",
        body: "和 v-once 脸熟：一冻一活。边不同。v-once 跳过 patch；这里根本没有新的卡片节点。下一镜两张都在渲染函数里画。",
      },
      faqs: [
        { q: "和 v-once 怎么分？", a: "v-once：节点存在，更新被跳过。快照：节点在创建时就把字符串写死了。探针能活，是因为它每次重新 h()。" },
        { q: "setup 里读 who.value 会订阅吗？", a: "setup 不是渲染函数，这次读不会让卡片跟着走。订阅发生在 return () => 每次跑到的那些读。" },
      ],
      tryThis: "点换人：卡片必须仍是 Ada，影子必须是 Lin。打开反事实。",
      mapping: [{ code: "setup 里 h(..., who.value)", runtime: "字符串写进 vnode", ui: "卡片冻住" }],
    },
    {
      id: "hsnap-s2",
      tick: "S2",
      title: "两张都现画，换人都跟",
      goal: "两个 h('p', { class: 'card' }, who.value) 都写在渲染函数里。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点换人。两张卡片会？",
        choices: [
          { id: "both", label: "都变成 Lin。每张都是这次新画的", correct: true, why: "两行 h() 都在 return () 里。谁变了，两颗都是新的。" },
          { id: "one", label: "只有第一张跟。第二张是同一颗节点", correct: false, why: "调了两次 h()，是两颗。官方说不能把同一颗贴两次；这里没有复用。" },
          { id: "stay", label: "都仍是 Ada", correct: false, why: "没有快照。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": twoLive },
        blocks: [{ id: "two", label: "③ 两张现画" }],
        narration: "对照上一镜。冻住的原因不是「有两张」，是「h() 只跑过一次」。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "Lin" }],
        dom: [
          { id: "a", label: "上卡片", value: "Lin" },
          { id: "b", label: "下卡片", value: "Lin" },
        ],
        events: [],
      },
      nodes: [
        { id: "a", kind: "render", label: "h() 上" },
        { id: "b", kind: "render", label: "h() 下" },
        { id: "who", kind: "ref", label: "who" },
      ],
      edges: [
        { from: "who", to: "a" },
        { from: "who", to: "b" },
      ],
      explanation: {
        headline: "一颗节点不能复用，但可以再画一颗",
        body: "下一镜换成 n。n 是 0 时，三元运算返回 null。问卡片还在不在。",
      },
      faqs: [
        { q: "官方说 vnode 必须唯一，是什么意思？", a: "不要 const p = h('p', 'Ada') 然后 [p, p]。同一颗不能贴两处。正确是 h() 两次，或 map 出新数组。" },
      ],
      tryThis: "打开两张 Ada。点换人，两张和影子都必须是 Lin。",
      mapping: [{ code: "两次 h(..., who.value)", runtime: "两颗新节点", ui: "都跟" }],
    },
    {
      id: "hsnap-s3",
      tick: "S3",
      title: "返回 null，卡片不画",
      goal: "n.value ? h('p', { class: 'card' }, ...) : null。打开 n 是 1。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点卸掉（n = 0）。卡片会？",
        choices: [
          { id: "gone", label: "消失。null 就是不画这颗。探针还在，是 0", correct: true, why: "和 v-if=false 同一张脸。h() 这边用 null。" },
          { id: "zero", label: "卡片变成 0", correct: false, why: "那是下一镜 n && h() 的脸。" },
          { id: "stay", label: "仍是 n 1。null 只跳过更新", correct: false, why: "这次渲染根本没交出卡片节点。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": ternaryNull },
        blocks: [{ id: "null", label: "④ 返回 null" }],
        narration: "World 16 是画过之后跳过。这里是这一帧不交出这颗节点。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "0" }],
        dom: [
          { id: "card", label: "卡片", value: "没有" },
          { id: "probe", label: ".probe", value: "n 0" },
        ],
        events: [],
      },
      nodes: [
        { id: "n", kind: "ref", label: "n 0" },
        { id: "h", kind: "render", label: "null" },
        { id: "dom", kind: "dom", label: "不画" },
      ],
      edges: [{ from: "n", to: "h", label: "不交节点" }],
      explanation: {
        headline: "null 是「这一帧没有这颗」",
        body: "下一镜写成 n && h(...)。n 是 0 时，&& 的结果是 0，不是 null。",
      },
      faqs: [
        { q: "undefined / false 呢？", a: "当孩子时也不画。0 和 '0' 会画出来。这就是下一镜。" },
      ],
      tryThis: "打开有卡片 n 1。点卸掉：卡片必须消失，探针必须是 n 0。点 +1，卡片回来。",
      mapping: [{ code: "n ? h(...) : null", runtime: "不交 vnode", ui: "卡片消失" }],
    },
    {
      id: "hsnap-s4",
      tick: "S4",
      title: "n && h()，卸掉会画出 0",
      goal: "同一套按钮。孩子写成 n.value && h(...)。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点卸掉。屏幕会？",
        choices: [
          { id: "zero", label: "多出一个 0。0 是假值，也是合法孩子", correct: true, why: "模板 v-if=\"n\" 在 n=0 时什么都不画。h() 这边 && 交出了数字 0。" },
          { id: "gone", label: "卡片消失，和 null 一样干净", correct: false, why: "&& 在左边是 0 时，结果就是 0，不是 null。" },
          { id: "stay", label: "卡片还在，n 1", correct: false, why: "卸掉已经写成 0。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": andZero },
        blocks: [{ id: "and", label: "⑤ && 交出 0" }],
        narration: "从模板抄 v-if 的习惯，到 h() 会走样。0 不是「没有」。",
      },
      observe: {
        state: [{ id: "n", label: "n", value: "0" }],
        dom: [
          { id: "zero", label: "卡片的位置", value: "文本 0" },
          { id: "probe", label: ".probe", value: "n 0" },
        ],
        events: [],
      },
      nodes: [
        { id: "and", kind: "script", label: "n && h()" },
        { id: "dom", kind: "dom", label: "文本 0" },
      ],
      edges: [{ from: "and", to: "dom", label: "0 当孩子" }],
      explanation: {
        headline: "0 会画出来",
        body: "下一镜渲染函数直接 return who.value。连卡片框、按钮都没有。",
      },
      faqs: [
        { q: "模板里 v-if=\"n\" 也会画出 0 吗？", a: "不会。v-if 假值就是不生成这颗。h() 没有指令，你交什么孩子就画什么。" },
      ],
      tryThis: "打开有卡片 n 1。点卸掉：必须能看见一个 0，不能只是空白。对照上一镜。",
      mapping: [{ code: "n && h(...)", runtime: "孩子是 0", ui: "画出 0" }],
    },
    {
      id: "hsnap-s5",
      tick: "S5",
      title: "渲染函数可以只返回字符串",
      goal: "return () => who.value。没有 h()，没有按钮。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开时会看见？",
        choices: [
          { id: "text", label: "只有 Ada 这几个字。没有卡片框，也没有按钮", correct: true, why: "渲染函数可以返回字符串。那就是整棵树。" },
          { id: "card", label: "仍有卡片框。浏览器会补", correct: false, why: "没有 h('p', { class: 'card' })。" },
          { id: "empty", label: "空白。必须返回 vnode", correct: false, why: "官方允许返回字符串或数组。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": returnString },
        blocks: [{ id: "str", label: "⑥ 只返回字符串" }],
        narration: "没有 h()，仍是一次渲染。只是交出的不是元素节点。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "Ada" }],
        dom: [{ id: "root", label: "#app", value: "Ada" }],
        events: [],
      },
      nodes: [
        { id: "render", kind: "render", label: "return who.value" },
        { id: "dom", kind: "dom", label: "裸文本" },
      ],
      edges: [{ from: "render", to: "dom" }],
      explanation: {
        headline: "可以交 vnode，也可以交文本",
        body: "没有按钮就换不了人。下一镜把快照、画出 0、只返回字符串放在一起。",
      },
      faqs: [
        { q: "那还怎么换人？", a: "不能。这一镜就是让你看见：渲染函数交出什么，树上就有什么。按钮也是 h() 画的。" },
      ],
      tryThis: "打开必须只有 Ada 几个字。没有框，没有换人按钮。",
      mapping: [{ code: "return () => who.value", runtime: "根是文本", ui: "裸 Ada" }],
    },
    {
      id: "hsnap-s6",
      tick: "S6",
      title: "拆成冻住 / 画出 0 / 裸文本",
      goal: "三种对照：setup 快照、n && h()、只返回字符串。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到每次现画的世界。点换人会？",
        choices: [
          { id: "lin", label: "卡片 Lin。这颗是现画的", correct: true, why: "先确认好的脸。" },
          { id: "ada", label: "卡片 Ada", correct: false, why: "那是快照。" },
          { id: "zero", label: "出现 0", correct: false, why: "那是 &&。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": live },
        blocks: [{ id: "keep", label: "现画的版本先留着" }],
        narration: "先换人确认跟着走。再分别：快照、画出 0、裸文本。",
      },
      observe: {
        state: [{ id: "card", label: "卡片", value: "跟着 who" }],
        dom: [{ id: "probe", label: ".probe", value: "影子 Lin" }],
        events: [],
      },
      nodes: [
        { id: "h", kind: "render", label: "现画" },
        { id: "dom", kind: "dom", label: "卡片" },
      ],
      edges: [{ from: "h", to: "dom" }],
      ablations: [
        {
          id: "snap",
          prompt: "如果卡片在 setup 里 h() 一次？",
          files: { "src/App.vue": frozen },
          expected: { kind: "stale", message: "换人后卡片仍是 Ada，影子是 Lin。" },
          lesson: "贴回去的是快照。",
        },
        {
          id: "and",
          prompt: "如果写成 n && h(...) 再卸掉？",
          files: { "src/App.vue": andZero },
          expected: { kind: "stale", message: "卸掉后屏幕上多一个 0。" },
          lesson: "0 是合法孩子。",
        },
        {
          id: "str",
          prompt: "如果渲染函数只返回 who.value？",
          files: { "src/App.vue": returnString },
          expected: { kind: "stale", message: "只有 Ada 几个字，没有框也没有按钮。" },
          lesson: "交什么，树上就有什么。",
        },
      ],
      explanation: {
        headline: "冻住、画出 0、只剩字",
        body: "下一课 h() 的第一格可以是组件。第二格是 props，第三格的插槽必须是函数。",
      },
      tryThis: "三种消融：卡片冻 Ada、卸掉出 0、裸 Ada。对上号再恢复：换人卡片跟着走。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先快照，再 && 的 0，再只返回字符串。" },
      ],
    },
    {
      id: "hsnap-s7",
      tick: "S7",
      title: "换：价钱",
      goal: "报价卡片在 setup 里 h() 一次。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "点涨价。卡片会？",
        choices: [
          { id: "stay", label: "仍是 36 元。探针 37 元。和 who 那一课同一张快照", correct: true, why: "换了文案，setup 里拍下的字符串还在。" },
          { id: "up", label: "变成 37 元。价钱很轻", correct: false, why: "这颗节点没有再 h()。" },
          { id: "empty", label: "变空", correct: false, why: "快照还写着 36 元。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": priceFrozen },
        blocks: [{ id: "price", label: "换场景：价钱" }],
        narration: "人换成价钱。问的仍是：这颗节点是现画的，还是拍下来的。",
      },
      observe: {
        state: [
          { id: "p", label: "price", value: "37" },
          { id: "card", label: "卡片", value: "36 元" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 37 元" }],
        events: [],
      },
      nodes: [
        { id: "snap", kind: "render", label: "setup 的报价" },
        { id: "dom", kind: "dom", label: "36 元" },
      ],
      edges: [{ from: "snap", to: "dom", label: "快照" }],
      ablations: [
        {
          id: "fix",
          prompt: "把 h() 挪进渲染函数之后？",
          files: { "src/App.vue": priceLive },
          expected: {
            kind: "stale",
            message: "这是修复：涨价后卡片 37 元。",
          },
          lesson: "下一课：第一格可以是组件。插槽要交函数。",
        },
      ],
      explanation: {
        headline: "何时 h()，决定这颗还活不活",
        body: "现画才跟。拍下来就冻。下一课把第一格换成组件，问 props 和插槽分别走哪一格。",
      },
      faqs: [
        { q: "和忘了 .value 怎么分？", a: "忘了 .value：打开就是空框。快照：打开是对的，后来才冻住。" },
      ],
      tryThis: "打开 36 / 36 元。涨价：卡片必须仍是 36 元，影子 37 元。再打开修复：卡片跟着 37。",
      mapping: [
        { code: "setup 里 h(..., 36 元)", runtime: "快照", ui: "冻住" },
        { code: "渲染里 h(...)", runtime: "现画", ui: "37 元" },
      ],
    },
  ],
};
