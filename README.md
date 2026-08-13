# Vue Causal Lab · See Vue Think

逐步改变代码，实时观察程序为何随之改变。

**不是让用户写代码。不是让 AI 聊天。不是播放「AI 打字动画」。**

而是让学习者反复经历：预测 → 最小因果变更 → 真实 Vue 重编译 → Runtime X-Ray → 消融 / 反事实 → 可迁移的心智模型。

**在线访问：** [https://xiaoqianran.github.io/learning-vue3/](https://xiaoqianran.github.io/learning-vue3/)  
**仓库：** [https://github.com/xiaoqianran/learning-vue3](https://github.com/xiaoqianran/learning-vue3)

---

## 产品定义

> Watch a Vue application evolve one causal change at a time.

训练的不是会不会敲 `computed()`，而是能不能看见 Vue 程序背后的因果结构。

第一版只做三个概念，但体验做完整：

```text
ref  →  computed  →  watch
```

必须同时拥有：程序时间轴、Semantic Diff、真实 Vue 重编译、Prediction、自动交互 Replay、状态/DOM 可视化、因果连线、Code Ablation、Counterfactual。

69 节原课程仍在，降级为 **Reference Library（资料库）**。真正的主路径是程序世界的生命史。

---

## 核心界面：Program Time Machine

一节课不是一篇文章，而是一串可执行的程序状态：

```text
S0 ─── S1 ─── S2 ─── S3 ─── S4 ─── S5
│      │      │      │      │      │
HTML   ref    模板   click  消融   迁移
```

四区固定布局：

| 区 | 作用 |
|----|------|
| ① Code Evolution | 语义 Diff，按块高亮，不是逐字符打字 |
| ② Live Application | 官方 `@vue/repl` 真编译真运行 |
| ③ Runtime X-Ray | 事件 → 状态 → effect → DOM |
| ④ AI Narrative | 预测是唯一强制交互；解释是预制的 |

原则：**One Step = One Causal Change**。核心课程全部 deterministic（预制 patch / 运行结果 / 解释）。LLM 只适合回答「为什么刚才没变化」这类旁边问题——第一版用当前 Scene 的 FAQ 承担。

---

## 学习五层

```text
SEE → PREDICT → EXPLAIN → BREAK → TRANSFER
```

掌握度不再是「看完课 / Quiz 80%」：

```text
Mastery = 预测 + 因果解释 + 反事实判断 + 新场景迁移
```

---

## 路径

| 路径 | 说明 |
|------|------|
| `/causal` | World 1 实验室入口 |
| `/causal/ref` | 一个按钮活起来 |
| `/causal/computed` | 合计是算出来的 |
| `/causal/watch` | 两个世界，同一张脸 |
| `/` | 产品首页 + 资料库 |
| `/lesson/:slug` | 69 节参考课 |
| `/playground` | 真实 Vue SFC 编辑器 |
| `/studio` | 全栈工坊 |
| `/hub` | 掌握度 |

### 全栈工坊演示账号

```text
邮箱：demo@vue.dev
密码：password123
```

---

## 程序世界（课程生命史）

| World | 内容 | 状态 |
|-------|------|------|
| 1 | 一个按钮活起来 · ref / computed / watch | **已开放** |
| 2 | Todo 从 20 行长到 150 行 | 后续 |
| 3 | Todo 成为真正 SPA | 后续 |
| 4 | 接入现实世界 | 后续 |
| 5 | 应用开始复杂 | 后续 |
| 6 | 应用坏掉 | 后续 |
| 7 | 生产环境 | 后续 |

---

## 本地运行

环境：Node 22+ 推荐。

```bash
git clone https://github.com/xiaoqianran/learning-vue3.git
cd learning-vue3
npm install
npm run dev
```

开发服务默认：`http://127.0.0.1:8080`。

```bash
npm run typecheck
npm run test:content
```

GitHub Pages 静态构建会设置 `GITHUB_PAGES=true`，`base` 为 `/learning-vue3/`。

---

## 技术栈

- **界面与路由：** React 19、TanStack Start / Router、Vite
- **样式：** Tailwind CSS v4 · Catppuccin
- **状态：** Zustand（资料库进度 + 因果掌握度，localStorage）
- **课程引擎：** `src/causal` Scene / Patch / Time Travel
- **Vue 运行时：** `vue` + `@vue/repl`

```text
Curriculum Graph (Scene / Patch)
        ↓
Evolution Engine
   ├── SFC Runtime (@vue/repl)
   ├── Runtime X-Ray
   └── Time Travel + Mastery
```

---

## 目录结构（简要）

```text
src/
  causal/                 # Scene 引擎与 World 1 三节实验
  components/causal/      # 四区播放器
  data/lessons.ts         # 资料库 69 节
  components/VueSfcPlayground.tsx
  routes/causal*.tsx
  store/causal.ts         # 掌握度
  store/progress.ts       # 资料库进度
```

---

## 进度与隐私

- 学习进度、笔记、错题、工坊、因果掌握度保存在 **浏览器 localStorage**
- 不上传到服务器
- 结业证明为本地成就展示，**非正式官方证书**

---

## 许可证与声明

- 教程内容用于学习与演示
- Vue 相关商标归各自所有者
- 欢迎提 Issue / PR
