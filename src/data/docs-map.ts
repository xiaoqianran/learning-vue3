/** 对照 vuejs.org/llms.txt 结构 · 左侧官网 / 右侧本站课 */

export type DocLink = {
  title: string;
  official: string;
  lessonSlug?: string;
  note?: string;
};

export type DocSection = {
  title: string;
  items: DocLink[];
};

const CN = "https://cn.vuejs.org";
const EN = "https://vuejs.org";

export const DOC_SECTIONS: DocSection[] = [
  {
    title: "Getting Started",
    items: [
      {
        title: "Introduction",
        official: `${CN}/guide/introduction.html`,
        lessonSlug: "intro",
      },
      {
        title: "Quick Start",
        official: `${CN}/guide/quick-start.html`,
        lessonSlug: "quick-start",
      },
    ],
  },
  {
    title: "Essentials",
    items: [
      {
        title: "Creating a Vue Application",
        official: `${CN}/guide/essentials/application.html`,
        lessonSlug: "create-app",
      },
      {
        title: "Template Syntax",
        official: `${CN}/guide/essentials/template-syntax.html`,
        lessonSlug: "template",
      },
      {
        title: "Reactivity Fundamentals",
        official: `${CN}/guide/essentials/reactivity-fundamentals.html`,
        lessonSlug: "reactivity",
      },
      {
        title: "Computed Properties",
        official: `${CN}/guide/essentials/computed.html`,
        lessonSlug: "computed",
      },
      {
        title: "Class and Style Bindings",
        official: `${CN}/guide/essentials/class-and-style.html`,
        lessonSlug: "class-style",
      },
      {
        title: "Conditional Rendering",
        official: `${CN}/guide/essentials/conditional.html`,
        lessonSlug: "conditional",
      },
      {
        title: "List Rendering",
        official: `${CN}/guide/essentials/list.html`,
        lessonSlug: "list-render",
      },
      {
        title: "Event Handling",
        official: `${CN}/guide/essentials/event-handling.html`,
        lessonSlug: "events",
      },
      {
        title: "Form Input Bindings",
        official: `${CN}/guide/essentials/forms.html`,
        lessonSlug: "forms",
      },
      {
        title: "Watchers",
        official: `${CN}/guide/essentials/watchers.html`,
        lessonSlug: "watchers",
      },
      {
        title: "Template Refs",
        official: `${CN}/guide/essentials/template-refs.html`,
        lessonSlug: "template-refs",
      },
      {
        title: "Components Basics",
        official: `${CN}/guide/essentials/component-basics.html`,
        lessonSlug: "components",
      },
      {
        title: "Lifecycle Hooks",
        official: `${CN}/guide/essentials/lifecycle.html`,
        lessonSlug: "lifecycle",
      },
    ],
  },
  {
    title: "Components In-Depth",
    items: [
      {
        title: "Component Registration",
        official: `${CN}/guide/components/registration.html`,
        lessonSlug: "component-registration",
      },
      {
        title: "Props",
        official: `${CN}/guide/components/props.html`,
        lessonSlug: "props-emits",
      },
      {
        title: "Component Events",
        official: `${CN}/guide/components/events.html`,
        lessonSlug: "component-events",
      },
      {
        title: "Component v-model",
        official: `${CN}/guide/components/v-model.html`,
        lessonSlug: "component-vmodel",
      },
      {
        title: "Fallthrough Attributes",
        official: `${CN}/guide/components/attrs.html`,
        lessonSlug: "fallthrough-attrs",
      },
      {
        title: "Slots",
        official: `${CN}/guide/components/slots.html`,
        lessonSlug: "slots",
      },
      {
        title: "Provide / Inject",
        official: `${CN}/guide/components/provide-inject.html`,
        lessonSlug: "provide-inject",
      },
      {
        title: "Async Components",
        official: `${CN}/guide/components/async.html`,
        lessonSlug: "async-components",
      },
    ],
  },
  {
    title: "Reusability",
    items: [
      {
        title: "Composables",
        official: `${CN}/guide/reusability/composables.html`,
        lessonSlug: "composition",
      },
      {
        title: "Custom Directives",
        official: `${CN}/guide/reusability/custom-directives.html`,
        lessonSlug: "custom-directive",
      },
      {
        title: "Plugins",
        official: `${CN}/guide/reusability/plugins.html`,
        lessonSlug: "plugins",
      },
    ],
  },
  {
    title: "Built-in Components",
    items: [
      {
        title: "Transition",
        official: `${CN}/guide/built-ins/transition.html`,
        lessonSlug: "transition",
      },
      {
        title: "TransitionGroup",
        official: `${CN}/guide/built-ins/transition-group.html`,
        lessonSlug: "transition-group",
      },
      {
        title: "KeepAlive",
        official: `${CN}/guide/built-ins/keep-alive.html`,
        lessonSlug: "keep-alive",
      },
      {
        title: "Teleport",
        official: `${CN}/guide/built-ins/teleport.html`,
        lessonSlug: "teleport",
      },
      {
        title: "Suspense",
        official: `${CN}/guide/built-ins/suspense.html`,
        lessonSlug: "suspense",
      },
    ],
  },
  {
    title: "Scaling Up",
    items: [
      {
        title: "Single-File Components",
        official: `${CN}/guide/scaling-up/sfc.html`,
        lessonSlug: "sfc",
      },
      {
        title: "Tooling",
        official: `${CN}/guide/scaling-up/tooling.html`,
        lessonSlug: "tooling",
      },
      {
        title: "Routing",
        official: `${CN}/guide/scaling-up/routing.html`,
        lessonSlug: "router",
      },
      {
        title: "State Management",
        official: `${CN}/guide/scaling-up/state-management.html`,
        lessonSlug: "pinia",
      },
      {
        title: "Testing",
        official: `${CN}/guide/scaling-up/testing.html`,
        lessonSlug: "testing-vue",
      },
      {
        title: "Server-Side Rendering (SSR)",
        official: `${CN}/guide/scaling-up/ssr.html`,
        lessonSlug: "ssr-basics",
      },
    ],
  },
  {
    title: "Best Practices",
    items: [
      {
        title: "Production Deployment",
        official: `${CN}/guide/best-practices/production-deployment.html`,
        lessonSlug: "deploy-prod",
      },
      {
        title: "Performance",
        official: `${CN}/guide/best-practices/performance.html`,
        lessonSlug: "perf-patterns",
      },
      {
        title: "Accessibility",
        official: `${CN}/guide/best-practices/accessibility.html`,
        lessonSlug: "accessibility",
      },
      {
        title: "Security",
        official: `${CN}/guide/best-practices/security.html`,
        lessonSlug: "security",
      },
    ],
  },
  {
    title: "TypeScript",
    items: [
      {
        title: "Using Vue with TypeScript",
        official: `${CN}/guide/typescript/overview.html`,
        lessonSlug: "ts-overview",
      },
      {
        title: "TypeScript with Composition API",
        official: `${CN}/guide/typescript/composition-api.html`,
        lessonSlug: "vue-ts",
      },
      {
        title: "TypeScript with Options API",
        official: `${CN}/guide/typescript/options-api.html`,
        lessonSlug: "options-api",
      },
    ],
  },
  {
    title: "Extra Topics",
    items: [
      {
        title: "Ways of Using Vue",
        official: `${CN}/guide/extras/ways-of-using-vue.html`,
        lessonSlug: "ways-of-using-vue",
      },
      {
        title: "Composition API FAQ",
        official: `${CN}/guide/extras/composition-api-faq.html`,
        lessonSlug: "options-api",
        note: "与 Options 对照课合并讲解",
      },
      {
        title: "Reactivity in Depth",
        official: `${CN}/guide/extras/reactivity-in-depth.html`,
        lessonSlug: "reactivity-depth",
      },
      {
        title: "Rendering Mechanism",
        official: `${CN}/guide/extras/rendering-mechanism.html`,
        lessonSlug: "rendering-mechanism",
      },
      {
        title: "Render Functions & JSX",
        official: `${CN}/guide/extras/render-function.html`,
        lessonSlug: "render-jsx",
      },
      {
        title: "Vue and Web Components",
        official: `${CN}/guide/extras/web-components.html`,
        lessonSlug: "web-components",
      },
      {
        title: "Animation Techniques",
        official: `${CN}/guide/extras/animation.html`,
        lessonSlug: "animation",
      },
    ],
  },
  {
    title: "API Reference（精选 + 外链）",
    items: [
      {
        title: "Application API",
        official: `${CN}/api/application.html`,
        lessonSlug: "app-config",
      },
      {
        title: "Reactivity: Core",
        official: `${CN}/api/reactivity-core.html`,
        lessonSlug: "reactivity",
      },
      {
        title: "Reactivity: Utilities",
        official: `${CN}/api/reactivity-utilities.html`,
        lessonSlug: "reactivity-utilities",
      },
      {
        title: "Reactivity: Advanced",
        official: `${CN}/api/reactivity-advanced.html`,
        lessonSlug: "reactivity-depth",
        note: "shallow / readonly / customRef 等",
      },
      {
        title: "Composition API: setup()",
        official: `${CN}/api/composition-api-setup.html`,
        lessonSlug: "script-setup",
      },
      {
        title: "Lifecycle Hooks",
        official: `${CN}/api/composition-api-lifecycle.html`,
        lessonSlug: "lifecycle",
      },
      {
        title: "Dependency Injection",
        official: `${CN}/api/composition-api-dependency-injection.html`,
        lessonSlug: "provide-inject",
      },
      {
        title: "Built-in Directives",
        official: `${CN}/api/built-in-directives.html`,
        lessonSlug: "built-in-directives",
      },
      {
        title: "Built-in Components",
        official: `${CN}/api/built-in-components.html`,
        lessonSlug: "transition",
        note: "Transition / KeepAlive / Teleport / Suspense 等见对应课",
      },
      {
        title: "Special Elements",
        official: `${CN}/api/built-in-special-elements.html`,
        lessonSlug: "special-elements",
      },
      {
        title: "Special Attributes",
        official: `${CN}/api/built-in-special-attributes.html`,
        lessonSlug: "special-elements",
      },
      {
        title: "SFC Spec",
        official: `${CN}/api/sfc-spec.html`,
        lessonSlug: "sfc",
      },
      {
        title: "script setup",
        official: `${CN}/api/sfc-script-setup.html`,
        lessonSlug: "script-setup",
      },
      {
        title: "SFC CSS Features",
        official: `${CN}/api/sfc-css-features.html`,
        lessonSlug: "sfc-css",
      },
      {
        title: "Options API 全表",
        official: `${CN}/api/options-state.html`,
        lessonSlug: "options-api",
        note: "状态 / 渲染 / 生命周期等以官网为准",
      },
      {
        title: "Render Function API",
        official: `${CN}/api/render-function.html`,
        lessonSlug: "render-jsx",
      },
      {
        title: "SSR API",
        official: `${CN}/api/ssr.html`,
        lessonSlug: "ssr-basics",
      },
      {
        title: "API 首页（完整索引）",
        official: `${CN}/api/`,
        note: "以官网为准",
      },
    ],
  },
  {
    title: "Style Guide",
    items: [
      {
        title: "Style Guide Overview",
        official: `${CN}/style-guide/`,
        lessonSlug: "style-guide",
      },
      {
        title: "Priority A · Essential",
        official: `${CN}/style-guide/rules-essential.html`,
        lessonSlug: "style-guide",
      },
      {
        title: "Priority B · Strongly Recommended",
        official: `${CN}/style-guide/rules-strongly-recommended.html`,
        lessonSlug: "style-guide",
        note: "细节以官网为准",
      },
      {
        title: "Priority C / D",
        official: `${CN}/style-guide/rules-recommended.html`,
        note: "以官网为准",
      },
    ],
  },
  {
    title: "AI / LLM 官方资源",
    items: [
      {
        title: "vuejs.org/llms.txt",
        official: `${EN}/llms.txt`,
        note: "官方目录索引",
      },
      {
        title: "vuejs.org/llms-full.txt",
        official: `${EN}/llms-full.txt`,
        note: "官方全文上下文",
      },
      {
        title: "cn.vuejs.org/llms.txt",
        official: `${CN}/llms.txt`,
        note: "中文目录",
      },
      {
        title: "cn.vuejs.org/llms-full.txt",
        official: `${CN}/llms-full.txt`,
        note: "中文全文",
      },
    ],
  },
  {
    title: "本站特色（官网无对照课）",
    items: [
      {
        title: "全栈工坊 · 模拟 REST",
        official: `${CN}/guide/scaling-up/routing.html`,
        lessonSlug: "rest-api",
        note: "本站互动闯关 /studio",
      },
      {
        title: "Token 会话",
        official: `${CN}/guide/best-practices/security.html`,
        lessonSlug: "auth-token",
      },
      {
        title: "异步请求三态",
        official: `${CN}/guide/essentials/watchers.html`,
        lessonSlug: "async-data",
      },
      {
        title: "路由守卫心智",
        official: `${CN}/guide/scaling-up/routing.html`,
        lessonSlug: "route-guards",
      },
      {
        title: "表单校验",
        official: `${CN}/guide/essentials/forms.html`,
        lessonSlug: "form-validate",
      },
      {
        title: "API 客户端封装",
        official: `${CN}/guide/scaling-up/tooling.html`,
        lessonSlug: "api-client",
      },
      {
        title: "Nuxt 全栈地图",
        official: `${CN}/guide/scaling-up/ssr.html`,
        lessonSlug: "nuxt-map",
      },
      {
        title: "常见坑与性能挑战",
        official: `${CN}/guide/best-practices/performance.html`,
        lessonSlug: "pitfalls",
      },
      {
        title: "从零小项目",
        official: `${CN}/guide/quick-start.html`,
        lessonSlug: "project",
      },
      {
        title: "毕业作品清单",
        official: `${CN}/guide/introduction.html`,
        lessonSlug: "capstone",
      },
      {
        title: "面试串讲",
        official: `${CN}/guide/introduction.html`,
        lessonSlug: "interview-vue",
      },
      {
        title: "SFC 在线编辑器",
        official: `${CN}/guide/scaling-up/sfc.html`,
        note: "本站 /playground",
      },
    ],
  },
];

export function getDocsCoverage() {
  let total = 0;
  let linked = 0;
  for (const sec of DOC_SECTIONS) {
    for (const it of sec.items) {
      total += 1;
      if (it.lessonSlug) linked += 1;
    }
  }
  return {
    total,
    linked,
    percent: total === 0 ? 0 : Math.round((linked / total) * 100),
  };
}
