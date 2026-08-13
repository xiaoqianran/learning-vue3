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
      h('p', { class: 'hint' }, '没有 template。h() 画出卡片'),
      h('p', { class: 'card' }, who.value),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const forgotValue = `<script>
import { h, ref } from 'vue'
export default {
  setup() {
    const who = ref('Ada')
    function toggle() {
      who.value = who.value === 'Ada' ? 'Lin' : 'Ada'
    }
    return () => h('div', [
      h('p', { class: 'hint' }, 'h() 的 children 传了 who，没有 .value'),
      h('p', { class: 'card' }, who),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const noClass = `<script>
import { h, ref } from 'vue'
export default {
  setup() {
    const who = ref('Ada')
    function toggle() {
      who.value = who.value === 'Ada' ? 'Lin' : 'Ada'
    }
    return () => h('div', [
      h('p', { class: 'hint' }, '第二参是字符串，被当成 children'),
      h('p', who.value),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const escaped = `<script>
import { h, ref } from 'vue'
export default {
  setup() {
    const who = ref('<b>Ada</b>')
    function toggle() {
      who.value = who.value.includes('Ada') ? '<b>Lin</b>' : '<b>Ada</b>'
    }
    return () => h('div', [
      h('p', { class: 'hint' }, 'children 是字符串，会转义'),
      h('p', { class: 'card' }, who.value),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const innerHtml = `<script>
import { h, ref } from 'vue'
export default {
  setup() {
    const who = ref('<b>Ada</b>')
    function toggle() {
      who.value = who.value.includes('Ada') ? '<b>Lin</b>' : '<b>Ada</b>'
    }
    return () => h('div', [
      h('p', { class: 'hint' }, 'innerHTML 是另一根管子'),
      h('p', { class: 'card', innerHTML: who.value }),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const clickAssign = `<script>
import { h, ref } from 'vue'
export default {
  setup() {
    const who = ref('Ada')
    return () => h('div', [
      h('p', { class: 'hint' }, 'onClick 写成了赋值'),
      h('p', { class: 'card' }, who.value),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: (who.value = 'Lin') }, '换人')
    ])
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
      h('p', { class: 'hint' }, '价钱的卡片'),
      h('p', { class: 'card' }, price.value + ' 元'),
      h('p', { class: 'probe' }, '影子 ' + price.value + ' 元'),
      h('button', { onClick: () => { price.value += 1 } }, '涨价')
    ])
  }
}
</script>
`;

const priceForgot = `<script>
import { h, ref } from 'vue'
export default {
  setup() {
    const price = ref(36)
    return () => h('div', [
      h('p', { class: 'hint' }, 'children 传了 price，没有 .value'),
      h('p', { class: 'card' }, price),
      h('p', { class: 'probe' }, '影子 ' + price.value + ' 元'),
      h('button', { onClick: () => { price.value += 1 } }, '涨价')
    ])
  }
}
</script>
`;

const worldValue: CounterfactualWorld = {
  id: "value",
  name: "传了 .value",
  tagline: "卡片 Ada",
  files: { "src/App.vue": live },
  nodes: [
    { id: "h", kind: "render", label: "h('p', props, who.value)" },
    { id: "dom", kind: "dom", label: "卡片 Ada" },
  ],
  edges: [{ from: "h", to: "dom", label: "字符串" }],
  note: "模板会拆 ref。h() 的 children 要你自己写成字符串。",
};

const worldRef: CounterfactualWorld = {
  id: "ref",
  name: "传了 who 本身",
  tagline: "空框",
  files: { "src/App.vue": forgotValue },
  nodes: [
    { id: "h", kind: "render", label: "h('p', props, who)" },
    { id: "dom", kind: "dom", label: "空卡片" },
  ],
  edges: [{ from: "h", to: "dom", label: "不是文本" }],
  note: "children 接到一份 ref 对象。h() 不会像 {{ who }} 那样拆开。",
};

export const HNODE_LAB: CausalLab = {
  id: "hnode",
  world: 18,
  concept: "h()",
  title: "没有模板，h() 也能画出那张脸",
  subtitle: "模板编译之后，就是 h(type, props, children)。children 必须是文本或节点。传 ref 本身，框是空的。",
  promise:
    "一镜一条边：先看见 h() 画出 Ada，再忘了 .value 变成空框，再第二参当成 children 丢掉卡片框，再字符串会被转义，再 onClick 写成赋值打开已是 Lin。",
  minutes: 16,
  official: "/guide/extras/render-function.html#creating-vnodes",
  scenes: [
    {
      id: "hnode-s0",
      tick: "S0",
      title: "h() 画出卡片",
      goal: "setup 返回一个函数。函数里 h('p', { class: 'card' }, who.value)。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": live },
        blocks: [{ id: "h", label: "① h() 画出" }],
        narration: "World 16 决定谁不必再画。这一课看真正画出来的那颗节点。没有 template。",
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
        { id: "h", kind: "render", label: "h()", symbol: "h" },
        { id: "dom", kind: "dom", label: "卡片 Ada" },
      ],
      edges: [{ from: "h", to: "dom" }],
      explanation: {
        headline: "模板是糖，底下是这颗节点",
        body: "setup 返回函数，就是渲染函数。每次谁变了，这个函数再跑，再 h() 一次。下一镜 children 传 who，不传 who.value。",
      },
      tryThis: "打开是带框的 Ada。点换人，卡片和影子必须一起变成 Lin。",
      faqs: [
        { q: "h 是什么意思？", a: "hyperscript：用 JS 产出 HTML。官方也可以叫 createVNode。短，是因为要写很多次。" },
        { q: "为什么不用 script setup？", a: "setup 要返回渲染函数。script setup 的返回值不走这条路，它是留给模板的。" },
      ],
    },
    {
      id: "hnode-s1",
      tick: "S1",
      title: "传 who，不传 who.value",
      goal: "h('p', { class: 'card' }, who)。探针仍用 who.value。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开时卡片会？",
        choices: [
          { id: "empty", label: "空框。h() 不会像模板那样拆 ref", correct: true, why: "children 接到的是对象。不是字符串，就不是文本节点。" },
          { id: "ada", label: "Ada。谁在 setup 里，h() 都会拆", correct: false, why: "那是模板 {{ who }}。h() 没有这层糖。" },
          { id: "obj", label: "写出 [object Object]", correct: false, why: "Vue 不会把 ref 对象当字符串拼进去。它被丢掉，框是空的。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": forgotValue },
        blocks: [{ id: "ref", label: "② 忘了 .value" }],
        narration: "探针还在用字符串。卡片那一格换成了 who 本身。",
      },
      counterfactual: {
        id: "value-vs-ref",
        title: ".value vs 整份 ref",
        setup: "都打开。只看卡片里有没有 Ada。",
        worlds: [worldValue, worldRef],
        punchline: "模板拆 ref。h() 的 children 要你交文本。",
      },
      observe: {
        state: [
          { id: "who", label: "who", value: "Ada" },
          { id: "card", label: "卡片", value: "空" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 Ada" }],
        events: [],
      },
      nodes: [
        { id: "who", kind: "ref", label: "who" },
        { id: "dom", kind: "dom", label: "空卡片" },
      ],
      edges: [{ from: "who", to: "dom", label: "没拆" }],
      explanation: {
        headline: "h() 不拆 ref",
        body: "下一镜第二参不传 props，直接传 who.value。Ada 还在，卡片框没了。",
      },
      faqs: [
        { q: "探针为什么还有 Ada？", a: "'影子 ' + who.value 先拼成字符串，再交给 h()。卡片那一行把对象塞进去了。" },
      ],
      tryThis: "打开：卡片必须是空框，影子必须是 Ada。打开反事实。",
      mapping: [{ code: "h('p', props, who)", runtime: "children 不是文本", ui: "空框" }],
    },
    {
      id: "hnode-s2",
      tick: "S2",
      title: "第二参是字符串，框就没了",
      goal: "h('p', who.value)。没有 props 对象。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开时 Ada 会？",
        choices: [
          { id: "plain", label: "还在，但是普通文字。第二参被当成 children", correct: true, why: "h(type, children) 合法。没有 { class: 'card' }，就没有卡片框。" },
          { id: "box", label: "仍在卡片框里。class 会自己补上", correct: false, why: "没传的 props，不会出现。" },
          { id: "empty", label: "空的。没有 props 就画不出文本", correct: false, why: "字符串第二参就是 children。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": noClass },
        blocks: [{ id: "args", label: "③ 第二参是文本" }],
        narration: "h() 很灵活：第二参可以是 props，也可以是 children。看错格，框就丢了。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "Ada" }],
        dom: [
          { id: "p", label: "Ada 那一行", value: "没有 .card" },
          { id: "probe", label: ".probe", value: "影子 Ada" },
        ],
        events: [],
      },
      nodes: [
        { id: "h", kind: "render", label: "h('p', who.value)" },
        { id: "dom", kind: "dom", label: "裸文本 Ada" },
      ],
      edges: [{ from: "h", to: "dom", label: "当 children" }],
      explanation: {
        headline: "三个格子：类型、props、孩子",
        body: "下一镜 children 里放 '<b>Ada</b>'。问它会不会变成粗体。",
      },
      faqs: [
        { q: "什么时候可以省略 props？", a: "孩子不是插槽对象的时候。字符串、数组都可以直接放第二格。插槽对象必须放第三格，第二格写 null。" },
      ],
      tryThis: "打开：Ada 必须看得到，但没有卡片那种边框。影子仍是 Ada。点换人，字会变成 Lin。",
      mapping: [{ code: "h('p', who.value)", runtime: "第二格当 children", ui: "有字，没框" }],
    },
    {
      id: "hnode-s3",
      tick: "S3",
      title: "字符串会转义，不会变粗体",
      goal: "who 是 '<b>Ada</b>'。当作 children 传进去。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开时卡片会？",
        choices: [
          { id: "esc", label: "看见 <b>Ada</b> 这些字符。和 {{ }} 一样转义", correct: true, why: "h() 的 children 是文本节点。尖括号不会当标签。" },
          { id: "bold", label: "粗体 Ada。字符串里有标签就会解析", correct: false, why: "那是 innerHTML / v-html 那根管子。" },
          { id: "empty", label: "空框。标签不合法", correct: false, why: "当文本照样画。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": escaped },
        blocks: [{ id: "esc", label: "④ 当文本转义" }],
        narration: "模板里的 {{ who }} 不会把字符串变成 HTML。h() 的 children 同一根管子。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "<b>Ada</b>" }],
        dom: [{ id: "card", label: ".card", value: "可见的 <b>Ada</b>" }],
        events: [],
      },
      nodes: [
        { id: "h", kind: "render", label: "children 文本" },
        { id: "dom", kind: "dom", label: "转义后的字" },
      ],
      edges: [{ from: "h", to: "dom", label: "当文本" }],
      explanation: {
        headline: "children 像 {{ }}，不像 v-html",
        body: "下一镜 onClick 不写函数，写成 who.value = 'Lin'。问打开时是谁。",
      },
      faqs: [
        { q: "想真的插入 HTML 呢？", a: "props 里 innerHTML。那是另一根管子，也是 XSS 的门。消融里可以看一眼，日常仍用文本。" },
      ],
      tryThis: "卡片里必须能看见尖括号和 b，不能是粗体 Ada。",
      mapping: [{ code: "h('p', props, '<b>Ada</b>')", runtime: "文本节点", ui: "看见标签字符" }],
    },
    {
      id: "hnode-s4",
      tick: "S4",
      title: "onClick 写成赋值，打开已是 Lin",
      goal: "h('button', { onClick: (who.value = 'Lin') }, '换人')。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开时卡片会？",
        choices: [
          { id: "lin", label: "Lin。赋值在渲染时就跑了，onClick 拿到的是字符串", correct: true, why: "对象字面量会先算 who.value = 'Lin'。渲染被自己叫醒一次，脸停在 Lin。点击再也不会换。" },
          { id: "ada", label: "Ada。赋值要等点击", correct: false, why: "没包成 () =>。括号里的东西现在就执行。" },
          { id: "err", label: "报错，页面空白", correct: false, why: "常常不报错。onClick 只是拿到了 'Lin' 这个字符串。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": clickAssign },
        blocks: [{ id: "click", label: "⑤ 赋值当 onClick" }],
        narration: "模板里 @click=\"who = 'Lin'\" 是编译器帮你包成函数。h() 没有这层糖。",
      },
      observe: {
        state: [
          { id: "who", label: "who", value: "Lin" },
          { id: "handler", label: "onClick", value: "字符串 Lin" },
        ],
        dom: [{ id: "card", label: ".card", value: "Lin" }],
        events: [],
      },
      nodes: [
        { id: "render", kind: "render", label: "渲染时赋值" },
        { id: "who", kind: "ref", label: "who Lin" },
      ],
      edges: [{ from: "render", to: "who", label: "现在就写" }],
      explanation: {
        headline: "onXxx 必须是函数",
        body: "下一镜把几种错格放一起：空框、没框、打开已是 Lin。",
      },
      faqs: [
        { q: "写成 onClick: toggle() 呢？", a: "更糟。每次渲染都调用 toggle，Ada / Lin 会来回踢，预览可能转个不停。" },
      ],
      tryThis: "打开必须是 Lin。再点换人，必须仍是 Lin。",
      mapping: [{ code: "onClick: (who.value = 'Lin')", runtime: "渲染时写 who", ui: "打开已是 Lin" }],
    },
    {
      id: "hnode-s5",
      tick: "S5",
      title: "innerHTML 才是那根会解析的管子",
      goal: "同一份 '<b>Ada</b>'。改走 props.innerHTML。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开时卡片会？",
        choices: [
          { id: "bold", label: "粗体 Ada。innerHTML 当 HTML 解析", correct: true, why: "这是另一根管子。和 v-html 同一张脸。" },
          { id: "esc", label: "仍看见尖括号。h() 永远转义", correct: false, why: "children 才转义。innerHTML 不走 children。" },
          { id: "empty", label: "空框", correct: false, why: "innerHTML 会把标签写进 DOM。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": innerHtml },
        blocks: [{ id: "html", label: "⑥ innerHTML" }],
        narration: "不是让你去用。只为了把两根管子拆开。",
      },
      observe: {
        state: [{ id: "who", label: "who", value: "<b>Ada</b>" }],
        dom: [{ id: "card", label: ".card", value: "粗体 Ada" }],
        events: [],
      },
      nodes: [
        { id: "prop", kind: "script", label: "innerHTML" },
        { id: "dom", kind: "dom", label: "真标签" },
      ],
      edges: [{ from: "prop", to: "dom", label: "当 HTML" }],
      explanation: {
        headline: "两根管子，两种脸",
        body: "日常用 children 文本。下一镜把空框、没框、打开是 Lin 放在一起。",
      },
      faqs: [
        { q: "生产环境用 innerHTML 吗？", a: "谁的字符串你不能完全信任，就不要。h() 默认转义，是保护。" },
      ],
      tryThis: "卡片必须是粗体 Ada，不能看见尖括号。记住：这不是 children 的脸。",
      mapping: [{ code: "{ innerHTML: who.value }", runtime: "当 HTML", ui: "粗体" }],
    },
    {
      id: "hnode-s6",
      tick: "S6",
      title: "拆成空框 / 没框 / 打开是 Lin",
      goal: "三种对照：忘了 .value、第二参当 children、onClick 赋值。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到传了 who.value 的世界。打开会？",
        choices: [
          { id: "ada", label: "卡片框里是 Ada", correct: true, why: "先确认好的脸。" },
          { id: "empty", label: "空框", correct: false, why: "那是传了 who 本身。" },
          { id: "lin", label: "Lin", correct: false, why: "那是 onClick 赋值。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": live },
        blocks: [{ id: "keep", label: "好的版本先留着" }],
        narration: "先确认带框的 Ada。再分别看三种错格。",
      },
      observe: {
        state: [{ id: "card", label: "卡片", value: "Ada" }],
        dom: [{ id: "probe", label: ".probe", value: "影子 Ada" }],
        events: [],
      },
      nodes: [
        { id: "h", kind: "render", label: "h(type, props, children)" },
        { id: "dom", kind: "dom", label: "卡片" },
      ],
      edges: [{ from: "h", to: "dom" }],
      ablations: [
        {
          id: "ref",
          prompt: "如果 children 传 who，不传 who.value？",
          files: { "src/App.vue": forgotValue },
          expected: { kind: "stale", message: "空框。影子仍是 Ada。" },
          lesson: "h() 不拆 ref。",
        },
        {
          id: "args",
          prompt: "如果第二参直接传 who.value？",
          files: { "src/App.vue": noClass },
          expected: { kind: "stale", message: "有 Ada，没有卡片框。" },
          lesson: "第二格被当成 children。",
        },
        {
          id: "click",
          prompt: "如果 onClick 写成赋值？",
          files: { "src/App.vue": clickAssign },
          expected: { kind: "stale", message: "打开已是 Lin。点击不再换。" },
          lesson: "onXxx 必须是函数。",
        },
      ],
      explanation: {
        headline: "空框、没框、打开是 Lin",
        body: "下一课：h() 在何时调用。setup 里画一次，得到的是快照。",
      },
      tryThis: "三种消融：空框、没框、打开 Lin。对上号再恢复：带框 Ada，换人 Lin。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先忘 .value，再丢 class，再 onClick 赋值。" },
      ],
    },
    {
      id: "hnode-s7",
      tick: "S7",
      title: "换：价钱",
      goal: "卡片抄价钱。children 传 price，没有 .value。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "打开时卡片会？",
        choices: [
          { id: "empty", label: "空框。和 who 那一课同一张没拆", correct: true, why: "换了文案，h() 不拆 ref 的边还在。" },
          { id: "36", label: "36 元。价钱是数字，会自己变字", correct: false, why: "传进去的仍是 ref 对象。" },
          { id: "obj", label: "[object Object]", correct: false, why: "和 who 一样，对象不会被写成文本。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": priceForgot },
        blocks: [{ id: "price", label: "换场景：价钱" }],
        narration: "人换成价钱。问的仍是：children 接到的是不是文本。",
      },
      observe: {
        state: [
          { id: "p", label: "price", value: "36" },
          { id: "card", label: "卡片", value: "空" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 36 元" }],
        events: [],
      },
      nodes: [
        { id: "p", kind: "ref", label: "price" },
        { id: "dom", kind: "dom", label: "空卡片" },
      ],
      edges: [{ from: "p", to: "dom", label: "没拆" }],
      ablations: [
        {
          id: "fix",
          prompt: "改成 price.value + ' 元' 之后？",
          files: { "src/App.vue": priceLive },
          expected: {
            kind: "stale",
            message: "这是修复：打开 36 元。涨价后卡片 37 元。",
          },
          lesson: "下一课：这颗节点何时创建。setup 里 h() 一次，得到快照。",
        },
      ],
      explanation: {
        headline: "h() 要你交文本",
        body: "模板替你拆 .value。自己画的时候，格子里必须已经是字符串或子节点。下一课问：这颗节点是每次渲染现画，还是 setup 里冻住的。",
      },
      faqs: [
        { q: "涨价后空框会不会突然出现数字？", a: "不会。每次仍把同一类对象塞进 children。" },
      ],
      tryThis: "打开：空框，影子 36 元。再打开修复：卡片必须是 36 元，涨价变成 37 元。",
      mapping: [
        { code: "h('p', props, price)", runtime: "不是文本", ui: "空框" },
        { code: "price.value + ' 元'", runtime: "字符串", ui: "36 元" },
      ],
    },
  ],
};
