import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

let started: Promise<void> | null = null;

export function startMockApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (started) return started;

  const worker = setupWorker(...handlers);
  const base = import.meta.env.BASE_URL || "/";
  const workerUrl = `${base}mockServiceWorker.js`.replace(/\/{2,}/g, "/").replace(":/", "://");

  started = worker
    .start({
      serviceWorker: { url: workerUrl },
      onUnhandledRequest: "bypass",
      quiet: true,
    })
    .then(() => {
      console.info("[studio] MSW mock API ready — open DevTools → Network to see /api/*");
    })
    .catch((err) => {
      console.error("[studio] MSW failed to start", err);
      started = null;
      throw err;
    });

  return started;
}
