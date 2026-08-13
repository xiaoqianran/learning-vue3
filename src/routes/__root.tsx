import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
  useRouterState,
} from "@tanstack/react-router";
import { Atom, Play } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import appCss from "@/styles.css?url";
import { CatppuccinSwitcher } from "@/components/CatppuccinSwitcher";
import { applyCtpAccent, applyCtpFlavor, readCtpAccent, readCtpFlavor } from "@/lib/catppuccin";
import { CAUSAL_LABS, labsForWorld } from "@/causal/labs";
import { labMastery, useCausal } from "@/store/causal";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Vue Causal Lab · See Vue Think",
      },
      {
        name: "description",
        content: "逐步改变代码，实时观察程序为何随之改变。一次一个因果变更。",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <AppShell>
        <Outlet />
      </AppShell>
    </RootDocument>
  );
}

const CTP_BOOT =
  "(function(){try{var f=localStorage.getItem('vue3-learn-ctp-flavor');var a=localStorage.getItem('vue3-learn-ctp-accent');var okF=['mocha','macchiato','frappe','latte'];var okA=['green','mauve','blue','lavender','sapphire','teal','peach','pink'];if(okF.indexOf(f)<0)f='mocha';if(okA.indexOf(a)<0)a='green';document.documentElement.setAttribute('data-ctp-flavor',f);document.documentElement.setAttribute('data-ctp-accent',a);}catch(e){document.documentElement.setAttribute('data-ctp-flavor','mocha');document.documentElement.setAttribute('data-ctp-accent','green');}})();";

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" data-ctp-flavor="mocha" data-ctp-accent="green">
      <head>
        <script dangerouslySetInnerHTML={{ __html: CTP_BOOT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });
  const isCausalPlayer = /\/causal\/[^/]+/.test(pathname);
  const playerLabId = isCausalPlayer
    ? pathname.split("/").filter(Boolean).at(-1)
    : undefined;
  const playerLab = playerLabId
    ? CAUSAL_LABS.find((lab) => lab.id === playerLabId)
    : undefined;
  const navLabs = labsForWorld(playerLab?.world ?? 1);
  const labs = useCausal((s) => s.labs);

  useEffect(() => {
    applyCtpFlavor(readCtpFlavor());
    applyCtpAccent(readCtpAccent());
    void useCausal.persist.rehydrate();
  }, []);

  return (
    <div
      className={cn(
        "text-fg",
        isCausalPlayer ? "flex h-dvh flex-col overflow-hidden bg-bg" : "min-h-dvh",
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-40 shrink-0 border-b border-border/80 bg-bg/80 backdrop-blur-md",
          isCausalPlayer && "bg-bg/95",
        )}
      >
        <div
          className={cn(
            "mx-auto flex items-center gap-3 px-4 sm:px-6",
            isCausalPlayer ? "h-12 max-w-none" : "h-14 max-w-3xl",
          )}
        >
          <Link to="/" className="flex min-w-0 items-center gap-2.5 no-underline">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary transition-transform duration-200 hover:scale-105">
              <Atom className="h-4 w-4" />
            </span>
            <span className="truncate font-display text-sm font-semibold tracking-tight text-fg">
              {isCausalPlayer && playerLab ? playerLab.title : "Vue Causal Lab"}
            </span>
          </Link>

          {isCausalPlayer ? (
            <nav className="ml-1 hidden items-center gap-0.5 sm:flex">
              {navLabs.map((lab) => (
                <Link
                  key={lab.id}
                  to="/causal/$labId"
                  params={{ labId: lab.id }}
                  className="rounded-full px-2.5 py-1 font-mono text-xs text-muted no-underline transition-[background-color,color] duration-200 hover:bg-surface-2 hover:text-fg [&.active]:bg-primary-soft [&.active]:text-primary"
                  activeProps={{ className: "active" }}
                >
                  {lab.concept}
                  <span className="ml-1 text-[10px] tabular-nums text-subtle">{labMastery(lab.id, labs)}%</span>
                </Link>
              ))}
            </nav>
          ) : null}

          <div className="ml-auto flex items-center gap-2">
            {isCausalPlayer ? (
              <Link
                to="/causal"
                className="text-xs text-muted no-underline transition-colors duration-200 hover:text-fg"
              >
                World {playerLab?.world ?? 1}
              </Link>
            ) : (
              <Link
                to="/causal/$labId"
                params={{ labId: "ref" }}
                className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-fg no-underline transition-opacity duration-200 hover:opacity-90"
              >
                <Play className="h-3 w-3" />
                打开时间机器
              </Link>
            )}
            <CatppuccinSwitcher mode="popover" />
          </div>
        </div>
      </header>

      <main
        className={cn(
          isCausalPlayer
            ? "causal-player flex min-h-0 flex-1 flex-col overflow-hidden bg-bg"
            : "mx-auto max-w-3xl px-4 py-8 sm:px-6",
        )}
      >
        {children}
      </main>
    </div>
  );
}
