import { Outlet, createFileRoute } from "@tanstack/react-router";

/**
 * Layout only. The listing lives in `causal.index.tsx` and the player in
 * `causal.$labId.tsx`. If this file renders the World 1 list instead of
 * `<Outlet />`, `/causal/ref` is swallowed by the parent and never plays.
 */
export const Route = createFileRoute("/causal")({
  component: CausalLayout,
  head: () => ({
    meta: [{ title: "World 1 · Vue Causal Lab" }],
  }),
});

function CausalLayout() {
  return <Outlet />;
}
