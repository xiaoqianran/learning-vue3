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
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <CausalLab lab={lab} />
      <p className="sr-only">
        <Link to="/causal">返回 World 1</Link>
      </p>
    </div>
  );
}
