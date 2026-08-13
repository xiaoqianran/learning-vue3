import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { LESSON_SLUGS } from "./src/generated/lesson-manifest";

const isGitHubPages =
  process.env.GITHUB_PAGES === "true" ||
  process.env.NITRO_PRESET === "github_pages";

/** Project Pages site: https://xiaoqianran.github.io/learning-vue3/ */
const base = isGitHubPages ? "/learning-vue3/" : "/";

const lessonPaths = LESSON_SLUGS.map((slug) => ({ path: `/lesson/${slug}` }));

const causalLabs = [
  "ref",
  "computed",
  "watch",
  "list",
  "form",
  "component",
  "slots",
  "composable",
  "pinia",
  "router",
  "fetch",
  "error",
  "race",
  "crud",
  "auth",
  "provide",
  "keepalive",
  "teleport",
  "transition",
  "nexttick",
  "capture",
  "test",
  "hydrate",
  "isolate",
  "payload",
  "typedprops",
  "typedemit",
  "injectkey",
  "definemodel",
  "modelmod",
  "multimodel",
  "shallow",
  "markraw",
  "customref",
  "attrs",
  "inherit",
  "expose",
  "vfocus",
  "vpaint",
  "vclickout",
  "asynccomp",
  "suspense",
  "asyncerr",
];

const staticPages = [
  { path: "/" },
  { path: "/hub" },
  { path: "/lab" },
  { path: "/mistakes" },
  { path: "/certificate" },
  { path: "/playground" },
  { path: "/studio" },
  { path: "/cheatsheet" },
  { path: "/docs" },
  { path: "/causal" },
  ...causalLabs.map((id) => ({ path: `/causal/${id}` })),
  ...lessonPaths,
];

export default defineConfig(({ command }) => ({
  base,
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  resolve: { tsconfigPaths: true },
  optimizeDeps: {
    exclude: ["@vue/repl"],
    include: ["vue"],
  },
  ssr: {
    external: ["@vue/repl"],
    noExternal: [],
  },
  plugins: [
    tailwindcss(),
    tanstackStart(
      isGitHubPages
        ? {
            spa: { enabled: true },
            prerender: {
              enabled: true,
              crawlLinks: true,
              autoStaticPathsDiscovery: true,
              failOnError: false,
            },
            pages: staticPages,
          }
        : undefined,
    ),
    ...(command === "build" && !isGitHubPages
      ? [nitro({ preset: "vercel" })]
      : []),
    viteReact(),
  ],
}));
