import type { CausalLab, CounterfactualWorld } from "../types";

const card = `<script setup>
defineProps({ who: String })
</script>
<template>
  <section class="panel">
    <h3>{{ who || '（没有 who）' }}</h3>
    <p class="card"><slot>插槽空着</slot></p>
  </section>
</template>
`;

const viaProp = `<script>
import { h, ref } from 'vue'
import Card from './Card.vue'
export default {
  setup() {
    const who = ref('Ada')
    function toggle() {
      who.value = who.value === 'Ada' ? 'Lin' : 'Ada'
    }
    return () => h('div', [
      h('p', { class: 'hint' }, '第二格是 props'),
      h(Card, { who: who.value }),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const viaSlot = `<script>
import { h, ref } from 'vue'
import Card from './Card.vue'
export default {
  setup() {
    const who = ref('Ada')
    function toggle() {
      who.value = who.value === 'Ada' ? 'Lin' : 'Ada'
    }
    return () => h('div', [
      h('p', { class: 'hint' }, '第三格是插槽函数'),
      h(Card, null, { default: () => who.value }),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const slotAsProps = `<script>
import { h, ref } from 'vue'
import Card from './Card.vue'
export default {
  setup() {
    const who = ref('Ada')
    function toggle() {
      who.value = who.value === 'Ada' ? 'Lin' : 'Ada'
    }
    return () => h('div', [
      h('p', { class: 'hint' }, '插槽对象放进了第二格'),
      h(Card, { default: () => who.value }),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const bothPipes = `<script>
import { h, ref } from 'vue'
import Card from './Card.vue'
export default {
  setup() {
    const who = ref('Ada')
    function toggle() {
      who.value = who.value === 'Ada' ? 'Lin' : 'Ada'
    }
    return () => h('div', [
      h('p', { class: 'hint' }, 'props 走 who，插槽写死你好'),
      h(Card, { who: who.value }, { default: () => '你好' }),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const bakedSlot = `<script>
import { h, ref } from 'vue'
import Card from './Card.vue'
export default {
  setup() {
    const who = ref('Ada')
    const baked = who.value
    function toggle() {
      who.value = who.value === 'Ada' ? 'Lin' : 'Ada'
    }
    return () => h('div', [
      h('p', { class: 'hint' }, '插槽函数交出去的是旧字符串'),
      h(Card, null, { default: () => baked }),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const bothLive = `<script>
import { h, ref } from 'vue'
import Card from './Card.vue'
export default {
  setup() {
    const who = ref('Ada')
    function toggle() {
      who.value = who.value === 'Ada' ? 'Lin' : 'Ada'
    }
    return () => h('div', [
      h('p', { class: 'hint' }, '两根管子都读 who'),
      h(Card, { who: who.value }, { default: () => who.value }),
      h('p', { class: 'probe' }, '影子 ' + who.value),
      h('button', { onClick: toggle }, '换人')
    ])
  }
}
</script>
`;

const priceSlot = `<script>
import { h, ref } from 'vue'
import Card from './Card.vue'
export default {
  setup() {
    const price = ref(36)
    return () => h('div', [
      h('p', { class: 'hint' }, '插槽对象放进了第二格'),
      h(Card, { default: () => price.value + ' 元' }),
      h('p', { class: 'probe' }, '影子 ' + price.value + ' 元'),
      h('button', { onClick: () => { price.value += 1 } }, '涨价')
    ])
  }
}
</script>
`;

const priceFixed = `<script>
import { h, ref } from 'vue'
import Card from './Card.vue'
export default {
  setup() {
    const price = ref(36)
    return () => h('div', [
      h('p', { class: 'hint' }, '价钱走插槽函数'),
      h(Card, null, { default: () => price.value + ' 元' }),
      h('p', { class: 'probe' }, '影子 ' + price.value + ' 元'),
      h('button', { onClick: () => { price.value += 1 } }, '涨价')
    ])
  }
}
</script>
`;

function files(app: string) {
  return { "src/App.vue": app, "src/Card.vue": card };
}

const worldProp: CounterfactualWorld = {
  id: "prop",
  name: "走 props",
  tagline: "标题 Ada，卡片空着",
  files: files(viaProp),
  nodes: [
    { id: "prop", kind: "component", label: "props.who" },
    { id: "slot", kind: "dom", label: "插槽空着" },
  ],
  edges: [{ from: "prop", to: "slot", label: "没走插槽" }],
  note: "第二格是 props。标题有 Ada。默认插槽没人填，还是后备文字。",
};

const worldSlot: CounterfactualWorld = {
  id: "slot",
  name: "走插槽函数",
  tagline: "标题空，卡片 Ada",
  files: files(viaSlot),
  nodes: [
    { id: "prop", kind: "component", label: "没有 who" },
    { id: "slot", kind: "render", label: "default()" },
  ],
  edges: [{ from: "slot", to: "prop", label: "第三格" }],
  note: "第二格 null，第三格 { default: () => who.value }。标题走后备，卡片里是 Ada。",
};

export const HSLOT_LAB: CausalLab = {
  id: "hslot",
  world: 18,
  concept: "h() slots",
  title: "第二格是 props，第三格才是插槽函数",
  subtitle: "h(组件) 和 h('p') 不同。孩子必须是函数，而且不能放进 props 那一格。放错格，两头都空。",
  promise:
    "一镜一条边：先只走 props 标题有人插槽空，再只走插槽函数反过来，再插槽对象放进 props 两头空，再两根管子只有标题跟着走，再插槽闭包冻在 Ada。",
  minutes: 16,
  official: "/guide/extras/render-function.html#passing-slots",
  scenes: [
    {
      id: "hslot-s0",
      tick: "S0",
      title: "第二格是 props，插槽空着",
      goal: "h(Card, { who: who.value })。Card 仍是带洞的模板。",
      layer: "see",
      fading: 1,
      mutation: {
        files: files(viaProp),
        blocks: [{ id: "prop", label: "① 走 props" }],
        narration: "World 2 从模板往洞里填。这一课父组件自己 h()。先只走 props 那一根。",
      },
      observe: {
        state: [
          { id: "who", label: "who", value: "Ada" },
          { id: "title", label: "标题", value: "Ada" },
        ],
        dom: [{ id: "slot", label: ".card", value: "插槽空着" }],
        events: [],
      },
      nodes: [
        { id: "h", kind: "render", label: "h(Card, props)", symbol: "h" },
        { id: "title", kind: "dom", label: "标题 Ada" },
        { id: "slot", kind: "dom", label: "插槽空着" },
      ],
      edges: [{ from: "h", to: "title", label: "who" }],
      explanation: {
        headline: "props 填的是标题，不是洞",
        body: "Card 的 <slot> 没人填，就显示后备「插槽空着」。下一镜第三格交一个 default 函数。",
      },
      tryThis: "打开：标题 Ada，卡片里必须是「插槽空着」。点换人，只有标题变成 Lin。",
      faqs: [
        { q: "这不是 World 2 的 props 吗？", a: "管子一样。写法不同。模板 :who=\"who\"，h() 是第二格对象。" },
      ],
    },
    {
      id: "hslot-s1",
      tick: "S1",
      title: "第三格是函数，洞里才有人",
      goal: "h(Card, null, { default: () => who.value })。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开时会？",
        choices: [
          { id: "slot", label: "标题（没有 who），卡片里是 Ada", correct: true, why: "没传 props。default 函数在子组件渲染时才跑，读到 who。" },
          { id: "prop", label: "标题 Ada，卡片空着。和上一镜一样", correct: false, why: "who 不在第二格。" },
          { id: "both", label: "两头都是 Ada。h() 会两边都填", correct: false, why: "你交哪根管子，哪根才有。" },
        ],
      },
      mutation: {
        files: files(viaSlot),
        blocks: [{ id: "slot", label: "② 走插槽" }],
        narration: "第二格必须是 null。否则下一镜那种对象会被当成 props。",
      },
      counterfactual: {
        id: "prop-vs-slot",
        title: "props vs 插槽函数",
        setup: "都打开。看标题和卡片各写着谁。",
        worlds: [worldProp, worldSlot],
        punchline: "两根管子。h() 不会因为你写了 who 就两边都填。",
      },
      observe: {
        state: [
          { id: "title", label: "标题", value: "（没有 who）" },
          { id: "slot", label: "插槽", value: "Ada" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 Ada" }],
        events: [],
      },
      nodes: [
        { id: "fn", kind: "render", label: "default()" },
        { id: "slot", kind: "dom", label: "卡片 Ada" },
      ],
      edges: [{ from: "fn", to: "slot" }],
      explanation: {
        headline: "插槽是函数，为了晚一点再读",
        body: "函数让子组件渲染时才取 who。下一镜把这个对象放进第二格。",
      },
      faqs: [
        { q: "h(Card, () => who.value) 行吗？", a: "行。只有默认插槽时，第二格可以直接是函数。有具名插槽，必须对象，并且第二格写 null。" },
        { q: "为什么一定要函数？", a: "晚一点执行，依赖算在子组件头上。父组件交一份现成 vnode，更新会钝。" },
      ],
      tryThis: "打开：标题必须是（没有 who），卡片里必须是 Ada。点换人，卡片变成 Lin。打开反事实。",
      mapping: [{ code: "h(Card, null, { default: () => who.value })", runtime: "子组件调插槽", ui: "洞里是 Ada" }],
    },
    {
      id: "hslot-s2",
      tick: "S2",
      title: "插槽对象放进 props，两头都空",
      goal: "h(Card, { default: () => who.value })。没有 null，没有第三格。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "打开时会？",
        choices: [
          { id: "empty", label: "标题（没有 who），卡片插槽空着。函数被当成了 prop", correct: true, why: "第二格永远是 props。Card 没声明 default 这个 prop，插槽也没收到函数。" },
          { id: "slot", label: "卡片里是 Ada。对象长得像插槽就会当插槽", correct: false, why: "那是第三格的待遇。官方专门警告：要写 null。" },
          { id: "err", label: "报错", correct: false, why: "常常一声不响。两头空。" },
        ],
      },
      mutation: {
        files: files(slotAsProps),
        blocks: [{ id: "wrong", label: "③ 放错格" }],
        narration: "只挪了一格。函数还在，管子错了。",
      },
      observe: {
        state: [
          { id: "title", label: "标题", value: "（没有 who）" },
          { id: "slot", label: "插槽", value: "插槽空着" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 Ada" }],
        events: [],
      },
      nodes: [
        { id: "props", kind: "script", label: "props.default" },
        { id: "title", kind: "dom", label: "没有 who" },
        { id: "slot", kind: "dom", label: "插槽空着" },
      ],
      edges: [{ from: "props", to: "slot", label: "没接到" }],
      explanation: {
        headline: "放错格，两头空",
        body: "下一镜两根管子一起交：who 走 props，插槽写死「你好」。",
      },
      faqs: [
        { q: "探针为什么还是 Ada？", a: "父组件的影子自己拼。Card 两头都没接到 who。" },
      ],
      tryThis: "打开：标题（没有 who），卡片必须仍是「插槽空着」。换人只改影子。",
      mapping: [{ code: "h(Card, { default: fn })", runtime: "当 prop 丢掉", ui: "两头空" }],
    },
    {
      id: "hslot-s3",
      tick: "S3",
      title: "两根管子，只有标题跟着走",
      goal: "h(Card, { who: who.value }, { default: () => '你好' })。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点换人。会？",
        choices: [
          { id: "title", label: "标题 Lin，卡片仍是你好。插槽写死了", correct: true, why: "两根管子独立。props 读 who，default 返回常量。" },
          { id: "both", label: "两头都 Lin。谁变了洞里也会变", correct: false, why: "洞里是字符串你好，没读 who。" },
          { id: "slot", label: "标题不动，卡片变成 Lin", correct: false, why: "who 在第二格，不在插槽函数里。" },
        ],
      },
      mutation: {
        files: files(bothPipes),
        blocks: [{ id: "both", label: "④ 两根管子" }],
        narration: "同一份 who，只订了 props 那一根。",
      },
      observe: {
        state: [
          { id: "title", label: "标题", value: "Lin" },
          { id: "slot", label: "插槽", value: "你好" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 Lin" }],
        events: [],
      },
      nodes: [
        { id: "who", kind: "ref", label: "who" },
        { id: "title", kind: "dom", label: "标题" },
        { id: "slot", kind: "dom", label: "你好" },
      ],
      edges: [
        { from: "who", to: "title", label: "props" },
        { from: "who", to: "slot", label: "没订" },
      ],
      explanation: {
        headline: "填哪根，哪根才跟",
        body: "下一镜插槽函数交出去的是 setup 里拍下的字符串 baked。",
      },
      faqs: [
        { q: "模板里可以同时 props 和插槽吗？", a: "可以。h() 也能。只是两根管子要分别交。" },
      ],
      tryThis: "打开：标题 Ada，卡片你好。点换人：标题 Lin，卡片必须仍是你好。",
      mapping: [{ code: "{ who }, { default: () => '你好' }", runtime: "只订 props", ui: "标题跟，洞不跟" }],
    },
    {
      id: "hslot-s4",
      tick: "S4",
      title: "插槽函数交旧字符串，洞也冻住",
      goal: "const baked = who.value 写在 setup。default: () => baked。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点换人。卡片里的插槽会？",
        choices: [
          { id: "stay", label: "仍是 Ada。函数每次都交同一份旧字符串", correct: true, why: "和上一课快照同一类边。h(Card) 每次都有，洞里的字是闭包里的 Ada。" },
          { id: "lin", label: "变成 Lin。插槽函数每次都会再读 who", correct: false, why: "它读的是 baked，不是 who.value。" },
          { id: "empty", label: "变回插槽空着", correct: false, why: "函数还在，交的是旧字。" },
        ],
      },
      mutation: {
        files: files(bakedSlot),
        blocks: [{ id: "bake", label: "⑤ 闭包快照" }],
        narration: "上一课冻的是整颗 vnode。这一课 h(Card) 是新的，冻的是插槽交出去的那句话。",
      },
      observe: {
        state: [
          { id: "slot", label: "插槽", value: "Ada" },
          { id: "who", label: "who", value: "Lin" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 Lin" }],
        events: [],
      },
      nodes: [
        { id: "baked", kind: "script", label: "baked Ada" },
        { id: "slot", kind: "dom", label: "洞 Ada" },
      ],
      edges: [{ from: "baked", to: "slot", label: "闭包" }],
      explanation: {
        headline: "函数还在，字是旧的",
        body: "下一镜两根管子都读 who.value。换人，标题和洞一起走。",
      },
      faqs: [
        { q: "和 setup 里 h('p', who.value) 怎么分？", a: "那边整颗卡片节点是旧的。这边每次都新 h(Card)，只是 default 闭包里握着旧字符串。" },
      ],
      tryThis: "打开标题空、卡片 Ada。点换人：卡片必须仍是 Ada，影子 Lin。",
      mapping: [{ code: "() => baked", runtime: "闭包里的旧字", ui: "洞冻住" }],
    },
    {
      id: "hslot-s5",
      tick: "S5",
      title: "两根管子都读 who，一起走",
      goal: "h(Card, { who: who.value }, { default: () => who.value })。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "点换人。会？",
        choices: [
          { id: "both", label: "标题 Lin，卡片 Lin。两根都读了", correct: true, why: "props 现取 .value。插槽函数现取 .value。没有快照。" },
          { id: "title", label: "只有标题 Lin。插槽函数不会订 who", correct: false, why: "函数里读了 who.value，子组件渲染时会订。" },
          { id: "slot", label: "只有卡片 Lin", correct: false, why: "第二格也传了 who。" },
        ],
      },
      mutation: {
        files: files(bothLive),
        blocks: [{ id: "live", label: "⑥ 两根都活" }],
        narration: "对照前两镜：写死你好、交 baked。这次两根都现读。",
      },
      observe: {
        state: [
          { id: "title", label: "标题", value: "Lin" },
          { id: "slot", label: "插槽", value: "Lin" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 Lin" }],
        events: [],
      },
      nodes: [
        { id: "who", kind: "ref", label: "who" },
        { id: "title", kind: "dom", label: "标题" },
        { id: "slot", kind: "dom", label: "洞" },
      ],
      edges: [
        { from: "who", to: "title", label: "props" },
        { from: "who", to: "slot", label: "default()" },
      ],
      explanation: {
        headline: "交谁，谁才活",
        body: "下一镜把放错格、写死你好、闭包冻住放在一起。",
      },
      faqs: [
        { q: "两根都填同样的 who，重复吗？", a: "这一镜只为对照。真实代码：标题走 props，内容走插槽，各管各的。" },
      ],
      tryThis: "打开两头 Ada。点换人，标题、卡片、影子必须都是 Lin。",
      mapping: [{ code: "{ who }, { default: () => who.value }", runtime: "两根都现读", ui: "一起走" }],
    },
    {
      id: "hslot-s6",
      tick: "S6",
      title: "拆成两头空 / 洞冻住 / 只有标题跟",
      goal: "三种对照：放错格、闭包快照、插槽写死你好。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到只走插槽函数的世界。打开会？",
        choices: [
          { id: "slot", label: "标题空，卡片 Ada", correct: true, why: "先确认好的脸。" },
          { id: "empty", label: "两头都空", correct: false, why: "那是放错格。" },
          { id: "prop", label: "标题 Ada，卡片空着", correct: false, why: "那是只走 props。" },
        ],
      },
      mutation: {
        files: files(viaSlot),
        blocks: [{ id: "keep", label: "插槽函数的版本先留着" }],
        narration: "先确认洞里是 Ada。再分别：放错格、闭包、写死你好。",
      },
      observe: {
        state: [{ id: "slot", label: "插槽", value: "Ada" }],
        dom: [{ id: "title", label: "标题", value: "（没有 who）" }],
        events: [],
      },
      nodes: [
        { id: "fn", kind: "render", label: "default()" },
        { id: "slot", kind: "dom", label: "Ada" },
      ],
      edges: [{ from: "fn", to: "slot" }],
      ablations: [
        {
          id: "wrong",
          prompt: "如果插槽对象放进第二格？",
          files: files(slotAsProps),
          expected: { kind: "stale", message: "标题（没有 who），卡片插槽空着。" },
          lesson: "第二格是 props。要写 null。",
        },
        {
          id: "bake",
          prompt: "如果插槽函数交 baked？",
          files: files(bakedSlot),
          expected: { kind: "stale", message: "换人后卡片仍是 Ada，影子是 Lin。" },
          lesson: "函数还在，字是旧的。",
        },
        {
          id: "static",
          prompt: "如果 props 走 who，插槽写死你好？",
          files: files(bothPipes),
          expected: { kind: "stale", message: "换人后标题 Lin，卡片仍是你好。" },
          lesson: "两根管子独立。",
        },
      ],
      explanation: {
        headline: "两头空、洞冻住、只有标题跟",
        body: "World 18 收束：h() 画出节点，何时画决定活不活，组件还要分清两根管子。",
      },
      tryThis: "三种消融：两头空、洞冻 Ada、标题跟洞不跟。对上号再恢复：洞里 Ada，换人 Lin。",
      faqs: [
        { q: "三种按什么顺序看？", a: "先放错格，再闭包，再写死你好。" },
      ],
    },
    {
      id: "hslot-s7",
      tick: "S7",
      title: "换：价钱",
      goal: "价钱想走插槽。对象放进了第二格。",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "打开时会？",
        choices: [
          { id: "empty", label: "标题（没有 who），卡片插槽空着。和放错格同一张脸", correct: true, why: "换了文案，第二格当 props 的边还在。" },
          { id: "36", label: "卡片里 36 元。价钱很轻，会自己找到洞", correct: false, why: "函数在 props 里，洞接不到。" },
          { id: "title", label: "标题 36 元", correct: false, why: "Card 的 prop 叫 who，不叫 default。" },
        ],
      },
      mutation: {
        files: files(priceSlot),
        blocks: [{ id: "price", label: "换场景：价钱" }],
        narration: "人换成价钱。问的仍是：插槽对象放在第几格。",
      },
      observe: {
        state: [
          { id: "title", label: "标题", value: "（没有 who）" },
          { id: "slot", label: "插槽", value: "插槽空着" },
        ],
        dom: [{ id: "probe", label: ".probe", value: "影子 36 元" }],
        events: [],
      },
      nodes: [
        { id: "props", kind: "script", label: "第二格" },
        { id: "slot", kind: "dom", label: "空着" },
      ],
      edges: [{ from: "props", to: "slot", label: "没接到" }],
      ablations: [
        {
          id: "fix",
          prompt: "改成 h(Card, null, { default: () => price.value + ' 元' }) 之后？",
          files: files(priceFixed),
          expected: {
            kind: "stale",
            message: "这是修复：卡片里 36 元。涨价后 37 元。",
          },
          lesson: "World 18 收束：格子里放文本，每次现画才活，组件的插槽是函数而且在第三格。",
        },
      ],
      explanation: {
        headline: "组件的孩子，必须是函数，而且在第三格",
        body: "放错格，脸可以很安静：两头都空。挪到第三格并写上 null，洞才接通。World 18 停在「这颗节点」。",
      },
      faqs: [
        { q: "和 World 2 的 slot 怎么并？", a: "模板 <Card>{{ price }} 元</Card> 编译完就是第三格那个函数。h() 把糖剥掉了。" },
      ],
      tryThis: "先看两头空。再打开修复：卡片必须是 36 元，涨价变成 37 元。",
      mapping: [
        { code: "h(Card, { default: fn })", runtime: "当 prop", ui: "两头空" },
        { code: "h(Card, null, { default: fn })", runtime: "插槽接通", ui: "36 元" },
      ],
    },
  ],
};
