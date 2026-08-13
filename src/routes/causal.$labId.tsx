import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCausalLab } from "@/causal/labs";
import { CausalLab } from "@/components/causal/CausalLab";

export const Route = createFileRoute("/causal/$labId")({
  component: CausalLabPage,
});

function CausalLabPage() {
  const { labId } = Route.useParams();
  const lab = getCausalLab(labId);
  if (!lab) throw notFound();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <CausalLab lab={lab} />
      <p className="sr-only">
        <Link to="/causal">返回目录</Link>
      </p>
    </div>
  );
}
