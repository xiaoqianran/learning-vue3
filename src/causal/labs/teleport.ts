import type { CausalLab, CounterfactualWorld } from "../types";

const styles = `
<style>
.clip{
  position:relative;
  overflow:hidden;
  height:4.6rem;
  border:1px solid #f38ba8;
  border-radius:12px;
  padding:8px;
  background:#181825;
}
.local-modal{
  position:absolute;
  top:8px;
  left:8px;
  right:8px;
  height:10rem;
  background:#1e1e2e;
  border:1px solid #a6e3a1;
  border-radius:12px;
  padding:12px;
}
.scrim{
  position:fixed;
  inset:0;
  background:#11111bcc;
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:20;
}
.modal-card{
  background:#1e1e2e;
  border:1px solid #a6e3a1;
  border-radius:12px;
  padding:16px;
  min-width:12rem;
}
</style>
`;

const clipped = `<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>
<template>
  <p class="hint">粉框 overflow:hidden 且很矮</p>
  <div class="clip">
    <button @click="open = true">打开弹层</button>
    <div v-if="open" class="local-modal">
      <p>我比粉框高。底下被裁掉了吗？</p>
      <button @click="open = false">关闭</button>
    </div>
  </div>
</template>
${styles}
`;

const teleportMissing = `<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>
<template>
  <p class="hint">Teleport to="#no-such"</p>
  <div class="clip">
    <button @click="open = true">打开弹层</button>
    <Teleport to="#no-such">
      <div v-if="open" class="local-modal">
        <p>目标节点不存在</p>
        <button @click="open = false">关闭</button>
      </div>
    </Teleport>
  </div>
</template>
${styles}
`;

const teleportBody = `<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>
<template>
  <p class="hint">Teleport to="body"</p>
  <div class="clip">
    <button @click="open = true">打开弹层</button>
  </div>
  <Teleport to="body">
    <div v-if="open" class="scrim" @click.self="open = false">
      <div class="modal-card">
        <p>我挂在 body 上。粉框裁不到我。</p>
        <button @click="open = false">关闭</button>
      </div>
    </div>
  </Teleport>
</template>
${styles}
`;

const teleportDisabled = `<script setup>
import { ref } from 'vue'
const open = ref(true)
</script>
<template>
  <p class="hint">Teleport :disabled="true"</p>
  <div class="clip">
    <button @click="open = true">打开弹层</button>
    <Teleport to="body" :disabled="true">
      <div v-if="open" class="local-modal">
        <p>disabled 时仍住在粉框里</p>
        <button @click="open = false">关闭</button>
      </div>
    </Teleport>
  </div>
</template>
${styles}
`;

const teleportIntoClip = `<script setup>
import { ref } from 'vue'
const open = ref(true)
</script>
<template>
  <p class="hint">Teleport to=".clip" · 仍进裁剪盒</p>
  <div class="clip">
    <button @click="open = true">打开弹层</button>
  </div>
  <Teleport to=".clip">
    <div v-if="open" class="local-modal">
      <p>目标就是那个 overflow:hidden</p>
      <button @click="open = false">关闭</button>
    </div>
  </Teleport>
</template>
${styles}
`;

const noTeleportOpen = `<script setup>
import { ref } from 'vue'
const open = ref(true)
</script>
<template>
  <p class="hint">没有 Teleport</p>
  <div class="clip">
    <button @click="open = true">打开弹层</button>
    <div v-if="open" class="local-modal">
      <p>我比粉框高。底下被裁掉了吗？</p>
      <button @click="open = false">关闭</button>
    </div>
  </div>
</template>
${styles}
`;

const transferBefore = `<script setup>
import { ref } from 'vue'
const msg = ref('')
function toast() { msg.value = '已保存' }
</script>
<template>
  <div class="clip">
    <button @click="toast">保存</button>
    <p v-if="msg" class="local-modal">{{ msg }}</p>
  </div>
</template>
${styles}
`;

const transferAfter = `<script setup>
import { ref } from 'vue'
const msg = ref('')
function toast() { msg.value = '已保存' }
</script>
<template>
  <div class="clip">
    <button @click="toast">保存</button>
  </div>
  <Teleport to="body">
    <p v-if="msg" class="modal-card" style="position:fixed;right:16px;bottom:16px;z-index:20">
      {{ msg }}
      <button @click="msg = ''">关</button>
    </p>
  </Teleport>
</template>
${styles}
`;

const worldClip: CounterfactualWorld = {
  id: "clip",
  name: "弹层住在裁剪盒里",
  tagline: "组件树在哪，DOM 就在哪",
  files: { "src/App.vue": noTeleportOpen },
  nodes: [
    { id: "clip", kind: "dom", label: "overflow:hidden" },
    { id: "modal", kind: "component", label: "弹层" },
  ],
  edges: [{ from: "clip", to: "modal", label: "裁切" }],
  note: "逻辑属于这个面板。DOM 也属于这个面板。overflow 会裁它。",
};

const worldBody: CounterfactualWorld = {
  id: "body",
  name: "逻辑在这，DOM 在 body",
  tagline: "组件树和 DOM 树可以分手",
  files: { "src/App.vue": teleportBody },
  nodes: [
    { id: "app", kind: "component", label: "open 仍在 App" },
    { id: "body", kind: "dom", label: "body" },
    { id: "modal", kind: "component", label: "弹层" },
  ],
  edges: [
    { from: "app", to: "modal", label: "状态" },
    { from: "body", to: "modal", label: "挂载" },
  ],
  note: "open 还是 App 的 ref。DOM 挂到 body。裁剪盒够不着。",
};

export const TELEPORT_LAB: CausalLab = {
  id: "teleport",
  world: 5,
  concept: "teleport",
  title: "组件在这，DOM 可以在那",
  subtitle: "overflow 裁的是 DOM 祖先。Teleport 让挂载点和组件树分手。",
  promise:
    "一镜一条边：先看被裁掉的弹层，再传到不存在的节点，再传到 body，再 disabled 缩回去，再传到裁剪盒自己。",
  minutes: 14,
  official: "/guide/built-ins/teleport.html",
  scenes: [
    {
      id: "teleport-s0",
      tick: "S0",
      title: "弹层住在很矮的盒子里",
      goal: "粉框 overflow:hidden。弹层比它高。",
      layer: "see",
      fading: 1,
      mutation: {
        files: { "src/App.vue": clipped },
        blocks: [{ id: "clip", label: "① 弹层是 .clip 的孩子" }],
        narration: "点「打开弹层」。看绿卡片的下半截还在不在。",
      },
      observe: {
        state: [{ id: "open", label: "open", value: "true", symbol: "open" }],
        dom: [{ id: "clip", label: ".clip", value: "裁掉下半截" }],
        events: [],
      },
      nodes: [
        { id: "open", kind: "ref", label: "open", symbol: "open" },
        { id: "clip", kind: "dom", label: "overflow:hidden" },
        { id: "modal", kind: "component", label: "弹层" },
      ],
      edges: [
        { from: "open", to: "modal" },
        { from: "clip", to: "modal", label: "裁切" },
      ],
      explanation: {
        headline: "DOM 祖先说了算",
        body: "组件逻辑在 App。DOM 却是粉框的子孙。overflow 不看你的 script，只看树。",
      },
      tryThis: "打开弹层。关闭按钮若看不见，就是被裁了。这是这一镜要你看见的。",
    },
    {
      id: "teleport-s1",
      tick: "S1",
      title: "确认：不是 z-index，是裁剪",
      goal: "同一份结构。问你缺的是哪条边。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "弹层被裁，最该补的是？",
        choices: [
          { id: "z", label: "把 z-index 调到 9999", correct: false, why: "z-index 管叠放，不管 overflow 裁切。被裁掉的像素再高也出不来。" },
          { id: "tp", label: "把 DOM 挂到裁剪盒外面", correct: true, why: "Teleport 就是这条边。逻辑仍用 App 的 open。" },
          { id: "vif", label: "改成 v-show", correct: false, why: "v-show 还在同一个父节点里。照裁。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": noTeleportOpen },
        blocks: [{ id: "ask", label: "② 默认打开，看裁切" }],
        narration: "这一镜默认是打开的。看绿卡片是不是缺了一截。",
      },
      observe: {
        state: [{ id: "open", label: "open", value: "true", symbol: "open" }],
        dom: [{ id: "clip", label: ".clip", value: "裁切中" }],
        events: [],
      },
      nodes: [
        { id: "clip", kind: "dom", label: ".clip" },
        { id: "modal", kind: "component", label: "弹层" },
      ],
      edges: [{ from: "clip", to: "modal" }],
      why: {
        question: "为什么 position:absolute 逃不出粉框？",
        choices: [
          { id: "abs", label: "absolute 相对最近的 position:relative 祖先。那正是 .clip", correct: true, why: "所以它被当成盒子内部的高卡片。overflow 一剪，下半截没了。" },
          { id: "vue", label: "Vue 把弹层渲染进了 shadow DOM", correct: false, why: "就是普通 DOM 子孙。" },
          { id: "btn", label: "按钮挡住了", correct: false, why: "是 overflow，不是遮挡。" },
        ],
      },
      explanation: {
        headline: "要换的是挂载点",
        body: "下一镜套上 Teleport，目标写成一个不存在的 id。传送失败时，弹层会消失或报警告。",
      },
      tryThis: "看默认打开的弹层。下半截和关闭按钮应被粉框吃掉。",
    },
    {
      id: "teleport-s2",
      tick: "S2",
      title: "传到不存在的节点",
      goal: "Teleport to=\"#no-such\"。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "目标节点不在文档里。打开弹层会？",
        choices: [
          { id: "body", label: "自动退回 body", correct: false, why: "不会猜。找不到目标就挂不上。" },
          { id: "gone", label: "弹层不见了，或控制台警告无法传送", correct: true, why: "和 RouterView 没有出口同一类：声明了传送，目的地是空的。" },
          { id: "clip", label: "仍在粉框里，当 Teleport 不存在", correct: false, why: "内容不再作为 .clip 的孩子渲染。它在等一个不存在的家。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": teleportMissing },
        blocks: [{ id: "miss", label: "③ to=\"#no-such\"" }],
        narration: "请打开弹层。粉框里应是空的。弹层也未必出现在外面。",
      },
      observe: {
        state: [{ id: "open", label: "open", value: "true", symbol: "open" }],
        dom: [{ id: "ui", label: "UI", value: "无处可挂" }],
        events: [],
      },
      nodes: [
        { id: "tp", kind: "component", label: "Teleport", symbol: "Teleport" },
        { id: "dom", kind: "dom", label: "目标缺失" },
      ],
      edges: [],
      explanation: {
        headline: "传送要有目的地",
        body: "to 是选择器。下一镜写成 body——预览 iframe 自己的 body，一定存在。",
      },
      tryThis: "点打开。弹层不应再待在粉框里，外面也找不到完整卡片。",
    },
    {
      id: "teleport-s3",
      tick: "S3",
      title: "传到 body",
      goal: "Teleport to=\"body\"。遮罩 position:fixed。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "传到 body 之后，弹层会？",
        choices: [
          { id: "ok", label: "盖住整页。粉框裁不到它。关闭仍改 App 的 open", correct: true, why: "DOM 在 body。状态还在 App。两条树分手了。" },
          { id: "clip", label: "仍被裁。Teleport 只是别名", correct: false, why: "它真的搬家。祖先不再是 .clip。" },
          { id: "lose", label: "关闭按钮失灵，因为离开了组件", correct: false, why: "事件仍在组件作用域。@click 还是改 open。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": teleportBody },
        blocks: [{ id: "body", label: "④ to=\"body\"" }],
        narration: "请打开。应出现全屏遮罩和完整卡片。点遮罩或关闭，open 仍由 App 掌管。",
      },
      observe: {
        state: [{ id: "open", label: "open", value: "在 App", symbol: "open" }],
        dom: [{ id: "body", label: "body", value: "挂着遮罩" }],
        events: [],
      },
      nodes: [
        { id: "open", kind: "ref", label: "open", symbol: "open" },
        { id: "tp", kind: "component", label: "Teleport", symbol: "Teleport" },
        { id: "dom", kind: "dom", label: "body" },
      ],
      edges: [
        { from: "open", to: "tp", label: "逻辑" },
        { from: "tp", to: "dom", label: "挂载" },
      ],
      counterfactual: {
        id: "clip-vs-body",
        title: "住在盒子里 vs 挂到 body",
        setup: "同一份 open。差在 DOM 祖先。",
        worlds: [worldClip, worldBody],
        punchline: "按钮两边都在粉框里。弹层一张被裁，一张自由。搬家的是 DOM，不是状态。",
      },
      explanation: {
        headline: "状态留下，DOM 搬家",
        body: "这和 provide 相反：provide 让数据跳过中间层。Teleport 让 DOM 跳过中间层。下一镜 :disabled=\"true\"——传送机关上，又缩回盒子。",
      },
      tryThis: "打开、关闭。打开反事实对比被裁的世界。",
      mapping: [{ code: '<Teleport to="body">', runtime: "DOM 挂到 body", ui: "不被裁" }],
    },
    {
      id: "teleport-s4",
      tick: "S4",
      title: "disabled：传送机关上",
      goal: "to 仍是 body。disabled 为 true。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "disabled 之后弹层会？",
        choices: [
          { id: "body", label: "仍在 body。disabled 只关动画", correct: false, why: "disabled 让内容作为 Teleport 在原处的孩子渲染。" },
          { id: "clip", label: "缩回粉框，再次被裁", correct: true, why: "同一份 Teleport 组件。开关决定走哪条挂载边。" },
          { id: "gone", label: "两边都不出现", correct: false, why: "它回到组件树原位。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": teleportDisabled },
        blocks: [{ id: "off", label: "⑤ :disabled=\"true\"" }],
        narration: "默认开着。看弹层是不是又缺了一截。",
      },
      observe: {
        state: [{ id: "open", label: "open", value: "true", symbol: "open" }],
        dom: [{ id: "clip", label: ".clip", value: "又裁上了" }],
        events: [],
      },
      nodes: [
        { id: "tp", kind: "component", label: "Teleport disabled" },
        { id: "clip", kind: "dom", label: ".clip" },
        { id: "modal", kind: "component", label: "弹层" },
      ],
      edges: [{ from: "clip", to: "modal" }],
      explanation: {
        headline: "disabled 切回原位",
        body: "SSR 或移动端有时需要关掉传送。下一镜 to=\".clip\"：目的地选对了语法，选错了地方。",
      },
      tryThis: "确认又被裁。disabled 不是注释掉 Teleport，是把挂载点拨回去。",
    },
    {
      id: "teleport-s5",
      tick: "S5",
      title: "传到裁剪盒自己",
      goal: "to=\".clip\"。选择器是对的，祖先仍会裁。",
      layer: "predict",
      fading: 2,
      prediction: {
        question: "传到 .clip 之后会？",
        choices: [
          { id: "ok", label: "逃出去了。只要用了 Teleport 就不裁", correct: false, why: "你把它送进了裁剪盒。搬家搬错了家。" },
          { id: "clip", label: "仍被裁。目标就是那个 overflow:hidden", correct: true, why: "Teleport 不解除 overflow。它只换父节点。父节点若仍是盒子，照裁。" },
          { id: "err", label: "不能传到 class", correct: false, why: "to 是 querySelector。class 合法。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": teleportIntoClip },
        blocks: [{ id: "into", label: "⑥ to=\".clip\"" }],
        narration: "默认打开。弹层应再次缺一截——这次它是粉框的孩子，只是从 Teleport 送进去的。",
      },
      observe: {
        state: [{ id: "open", label: "open", value: "true", symbol: "open" }],
        dom: [{ id: "clip", label: ".clip", value: "既是目标又是裁剪" }],
        events: [],
      },
      nodes: [
        { id: "tp", kind: "component", label: "Teleport" },
        { id: "clip", kind: "dom", label: ".clip" },
        { id: "modal", kind: "component", label: "弹层" },
      ],
      edges: [
        { from: "tp", to: "clip", label: "to" },
        { from: "clip", to: "modal", label: "裁切" },
      ],
      explanation: {
        headline: "目的地也是 DOM 祖先",
        body: "选 body / #modal-root 是因为它们在裁剪盒外面。选错目标，Teleport 只是换了种方式住进同一间牢房。",
      },
      tryThis: "看缺一截的卡片。to 不是魔法，是新的父节点。",
    },
    {
      id: "teleport-s6",
      tick: "S6",
      title: "拆掉目的地 / 关掉传送 / 送回盒子",
      goal: "三种坏法：无处可挂、disabled、目标就是裁剪盒。",
      layer: "break",
      fading: 3,
      prediction: {
        question: "回到 to=\"body\" 且不 disabled。弹层会？",
        choices: [
          { id: "ok", label: "完整出现在遮罩里", correct: true, why: "这是修复。你已经见过另外三张失败的脸。" },
          { id: "clip", label: "仍被裁，因为按钮在粉框里", correct: false, why: "按钮可以留在盒子里。搬家的是弹层。" },
          { id: "dup", label: "出现两份，一份裁一份不裁", correct: false, why: "一份 vnode 只挂一次。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": teleportBody },
        blocks: [{ id: "keep", label: "正确版本先留着" }],
        narration: "先打开看完整弹层。再分别传到虚空、disabled、送回 .clip。",
      },
      observe: {
        state: [{ id: "ok", label: "open", value: "App 持有" }],
        dom: [{ id: "body", label: "body", value: "完整遮罩" }],
        events: [],
      },
      nodes: [
        { id: "tp", kind: "component", label: "Teleport" },
        { id: "dom", kind: "dom", label: "body" },
      ],
      edges: [{ from: "tp", to: "dom" }],
      ablations: [
        {
          id: "miss",
          prompt: "如果目标不存在？",
          files: { "src/App.vue": teleportMissing },
          expected: { kind: "stale", message: "弹层无处可挂。粉框空，外面也没有完整卡片。" },
          lesson: "to 必须能 querySelector 到活节点。",
        },
        {
          id: "off",
          prompt: "如果 disabled？",
          files: { "src/App.vue": teleportDisabled },
          expected: { kind: "stale", message: "缩回粉框，再次被裁。" },
          lesson: "disabled 把挂载点拨回组件原位。",
        },
        {
          id: "into",
          prompt: "如果传到 .clip？",
          files: { "src/App.vue": teleportIntoClip },
          expected: { kind: "stale", message: "选择器对了，祖先仍会裁。搬错了家。" },
          lesson: "目的地要在裁剪盒外面。",
        },
      ],
      explanation: {
        headline: "换父节点，不要换错",
        body: "虚空、原位、错误祖先，三张脸。下一课出现和消失也可以不是瞬间——Transition 给 DOM 一段寿命。",
      },
      tryThis: "三种消融都打开一次。消失、被裁、被裁，对上号再恢复。",
    },
    {
      id: "teleport-s7",
      tick: "S7",
      title: "换：保存成功的提示",
      goal: "提示写在矮盒子里。它该不该被裁？",
      layer: "transfer",
      fading: 5,
      prediction: {
        question: "现在提示是粉框里的卡片。改成 toast 挂到 body 后会？",
        choices: [
          { id: "clip", label: "仍被裁。提示逻辑属于这个面板", correct: false, why: "逻辑可以属于面板。DOM 可以属于页面。" },
          { id: "ok", label: "完整出现在角落。保存按钮仍在盒子里", correct: true, why: "和弹层同一张图。Toast 几乎总该挂 body。" },
          { id: "err", label: "离开组件后点关会报错", correct: false, why: "msg 仍是 App 的 ref。" },
        ],
      },
      mutation: {
        files: { "src/App.vue": transferBefore },
        blocks: [{ id: "toast", label: "换场景：提示" }],
        narration: "先点保存，看提示是不是缺一截。",
      },
      observe: {
        state: [{ id: "msg", label: "msg", value: "已保存", symbol: "msg" }],
        dom: [{ id: "clip", label: ".clip", value: "可能裁切" }],
        events: [],
      },
      nodes: [
        { id: "msg", kind: "ref", label: "msg", symbol: "msg" },
        { id: "dom", kind: "dom", label: "DOM" },
      ],
      edges: [{ from: "msg", to: "dom" }],
      ablations: [
        {
          id: "body",
          prompt: "Teleport 到 body 当 toast 之后？",
          files: { "src/App.vue": transferAfter },
          expected: {
            kind: "stale",
            message: "这是修复：提示完整地停在右下角。按钮仍在粉框里。",
          },
          lesson: "弹层和 toast 都是「逻辑在组件，DOM 在页面」。下一课让出现/消失耗一点时间。",
        },
      ],
      explanation: {
        headline: "Teleport 的身份是换 DOM 父亲",
        body: "组件树管状态和事件。DOM 树管裁剪、层叠、固定定位。两棵树可以不对齐。",
      },
      tryThis: "先保存看被裁的提示。再打开 toast 版。",
    },
  ],
};
