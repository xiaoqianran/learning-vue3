import { createFileRoute, Link } from "@tanstack/react-router";
import { useCausal } from "@/store/causal";
import { Button } from "@/components/ui/button";
import { LoopSteps, WorldCatalog } from "@/components/causal/LabCard";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const labs = useCausal((s) => s.labs);

  return (
    <div className="causal-pane-in pb-16">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">See Vue Think</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-fg sm:text-4xl">
        Vue — 从一个按钮生长成完整应用
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        不是 69 节课。不是敲代码。一次只改一个因果，然后立刻看见程序为什么变了。
      </p>

      <div className="mt-7">
        <Link to="/causal/$labId" params={{ labId: "ref" }} className="no-underline">
          <Button size="lg">
            从 S0 开始 · ref
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <LoopSteps />
      <WorldCatalog progress={labs} />

      <p className="mt-8 text-xs leading-relaxed text-subtle">
        World 1 是响应式。World 2 是 Todo 长成组件。World 3 是共享状态和页面。World 4 是异步、写回和身份。World 5 是跨树、寿命和传送。World 6 是诊断和测试。World 7 是水合、请求隔离和首屏数据。World 8 是入口、出口和钥匙上的契约。World 9 是组件上的那扇双向门。World 10 是追踪停在哪一层。World 11 是贴到哪一层 DOM，开哪一扇窗。World 12 是指令碰到了那颗节点。World 13 是还没到的组件。World 14 是样式也有边界。World 15 是安装才接通。World 16 是有些节点不必再画。World 17 是读到的才会订。World 18 是真正画出来的那颗节点。
      </p>
    </div>
  );
}
