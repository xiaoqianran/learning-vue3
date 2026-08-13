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
import { CAUSAL_LABS } from "@/causal/labs";
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
  const isCausalPlayer = useRouterState({
    select: (s) => /\/causal\/[^/]+/.test(s.location.pathname),
  });
  const labs = useCausal((s) => s.labs);

  useEffect(() => {
    applyCtpFlavor(readCtpFlavor());
    applyCtpAccent(readCtpAccent());
    void useCausal.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-dvh text-fg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
        <div
          className={cn(
            "mx-auto flex h-14 items-center gap-3 px-4 sm:px-6",
            isCausalPlayer ? "max-w-none" : "max-w-3xl",
          )}
        >
          <Link to="/" className="flex min-w-0 items-center gap-2.5 no-underline">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Atom className="h-4 w-4" />
            </span>
            <span className="truncate font-display text-sm font-semibold tracking-tight text-fg">
              Vue Causal Lab
            </span>
          </Link>

          <nav className="ml-1 hidden items-center gap-0.5 sm:flex">
            {CAUSAL_LABS.map((lab) => (
              <Link
                key={lab.id}
                to="/causal/$labId"
                params={{ labId: lab.id }}
                className="rounded-md px-2.5 py-1.5 font-mono text-xs text-muted no-underline hover:bg-surface-2 hover:text-fg [&.active]:bg-primary-soft [&.active]:text-primary"
                activeProps={{ className: "active" }}
              >
                {lab.concept}
                <span className="ml-1 text-[10px] text-subtle">{labMastery(lab.id, labs)}%</span>
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/causal/$labId"
              params={{ labId: "ref" }}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-fg no-underline hover:opacity-90"
            >
              <Play className="h-3 w-3" />
              打开时间机器
            </Link>
            <CatppuccinSwitcher mode="popover" />
          </div>
        </div>
      </header>

      <main
        className={cn(
          isCausalPlayer
            ? "flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-hidden"
            : "mx-auto max-w-3xl px-4 py-8 sm:px-6",
        )}
      >
        {children}
      </main>
    </div>
  );
}
