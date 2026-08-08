# Vue 3 实战学习

交互式中文 Vue 3 教程：课程 + 测验 + 进度 + 真实 SFC 编辑器 + 模拟全栈工坊。

**在线访问：** [https://xiaoqianran.github.io/learning-vue3/](https://xiaoqianran.github.io/learning-vue3/)  
**仓库：** [https://github.com/xiaoqianran/learning-vue3](https://github.com/xiaoqianran/learning-vue3)

---

## 这是什么

面向想系统学习 **Vue 3**、并逐步过渡到 **全栈能力** 的同学。内容以「读一点、动手一点、测一点」组织，而不是纯文档站。

你可以：

- 按路径学完 **33 节** 课程（**讲解 + 对应源码 + 交互 Demo + 小测验**，源码与 Demo 一一对应）
- 在 **SFC 编辑器** 里写并运行真实 `.vue` 文件
- 在 **全栈工坊** 里练登录、401、笔记 CRUD（模拟 REST API）
- 用 **速查表** 复习，用 **学习中心 / 错题本 / 结业证明** 跟进度

> 说明：本站本身用 React + TanStack Start 承载教学内容；其中 SFC 编辑器嵌入官方 `@vue/repl`，运行的是真实 Vue 3 编译与预览。

---

## 功能一览

| 模块 | 路径 | 说明 |
|------|------|------|
| 课程 | `/lesson/:slug` | 正文、**对应源码**、Live Demo（可折叠对照）、测验、笔记 |
| 首页大纲 | `/` | 搜索、路径筛选、进度条 |
| SFC 编辑器 | `/playground` | 真实 Vue SFC 在线编译 |
| 全栈工坊 | `/studio` | 模拟 API + 闯关任务 |
| 速查表 | `/cheatsheet` | 一页核心 API 与约定 |
| 学习中心 | `/hub` | 打卡、收藏、路径进度 |
| 练习场 | `/lab` | 综合练习 |
| 错题本 | `/mistakes` | 测验错题回顾 |
| 结业证明 | `/certificate` | 全部完成后解锁 |

### 全栈工坊演示账号

```text
邮箱：demo@vue.dev
密码：password123
```

闯关任务：成功登录 → 触发一次 401 → 创建 / 编辑 / 删除笔记 → 退出。

---

## 学习路径（6 条）

| 路径 | 你学到什么 |
|------|------------|
| **基础** | 模板、响应式、列表/事件/表单、组件、生命周期、composable |
| **进阶** | Router、Pinia、常见坑、从零搭项目 |
| **全栈准备** | Slots、Provide/Inject、异步请求态、路由守卫、表单校验 |
| **全栈实训** | REST/CRUD、Token 会话、Nuxt 地图、毕业作品清单 |
| **工程化** | Vue+TS、API 客户端、测试入门、生产部署 |
| **进阶模式** | Teleport、KeepAlive、自定义指令、性能、面试串讲 |

建议顺序：

```text
基础 → 进阶 → 全栈准备 → 工坊闯关 → 工程化 → 进阶模式 → 自己的作品
```

---

## 版本演进

| 版本 | 内容 |
|------|------|
| v1 | 基础交互课程 |
| v2 | 学习中心、练习场、错题本、结业 |
| v3 | 真实 Vue SFC 在线编辑器（`@vue/repl`） |
| v4 | 全栈准备线（Slots / 异步 / 守卫 / 校验） |
| v5 | 全栈工坊：模拟登录 + 笔记 CRUD |
| v6 | 工坊闯关 + 工程化课 |
| v7 | 进阶模式 + 速查表 |

Release 见：[GitHub Releases](https://github.com/xiaoqianran/learning-vue3/releases)

---

## 本地运行

环境：Node 22+ 推荐。

```bash
git clone https://github.com/xiaoqianran/learning-vue3.git
cd learning-vue3
npm install
npm run dev
```

开发服务默认：`http://127.0.0.1:8080`（绑定 `0.0.0.0:8080`）。

常用脚本：

```bash
npm run dev        # 开发
npm run build      # 生产构建
npm run typecheck  # TypeScript 检查
```

GitHub Pages 静态构建会设置 `GITHUB_PAGES=true`，`base` 为 `/learning-vue3/`。

---

## 技术栈

- **界面与路由：** React 19、TanStack Start / Router、Vite
- **样式：** Tailwind CSS v4
- **状态：** Zustand（学习进度持久化）
- **Vue 教学运行时：** `vue` + `@vue/repl`（SFC 编辑器）
- **部署：** GitHub Actions → GitHub Pages

---

## 目录结构（简要）

```text
src/
  data/lessons.ts          # 全部课程内容
  data/sfc-presets.ts      # SFC 编辑器预设
  components/demos/        # 交互 Demo
  components/VueSfcPlayground.tsx
  lib/mock-api.ts          # 全栈工坊模拟 API
  lib/studio-quests.ts     # 闯关进度
  routes/                  # 页面路由
  store/progress.ts        # 学习进度
.github/workflows/         # Pages 部署
```

---

## 部署

推送到 `main` 后，Actions 工作流 **Deploy to GitHub Pages** 会构建并发布。

- Pages 源：GitHub Actions  
- 站点：`https://xiaoqianran.github.io/learning-vue3/`

---

## 进度与隐私

- 学习进度、笔记、错题、工坊数据保存在 **浏览器 localStorage**
- 不上传到服务器；清站点数据会丢失进度
- 结业证明为本地成就展示，**非正式官方证书**

---

## 许可证与声明

- 教程内容用于学习与演示
- Vue 相关商标归各自所有者
- 欢迎提 Issue / PR 纠错与补充

---

## 相关链接

- 在线课站：[learning-vue3](https://xiaoqianran.github.io/learning-vue3/)
- 仓库：[xiaoqianran/learning-vue3](https://github.com/xiaoqianran/learning-vue3)
- Vue 官方文档：[https://cn.vuejs.org/](https://cn.vuejs.org/)
