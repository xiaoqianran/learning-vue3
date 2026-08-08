export const CTP_FLAVORS = [
  { id: "mocha", label: "Mocha", swatch: "#cba6f7" },
  { id: "macchiato", label: "Macchiato", swatch: "#c6a0f6" },
  { id: "frappe", label: "Frappé", swatch: "#ca9ee6" },
  { id: "latte", label: "Latte", swatch: "#8839ef" },
] as const;

export type CtpFlavor = (typeof CTP_FLAVORS)[number]["id"];

export const CTP_ACCENTS = [
  { id: "green", label: "Green", css: "var(--ctp-green)" },
  { id: "mauve", label: "Mauve", css: "var(--ctp-mauve)" },
  { id: "blue", label: "Blue", css: "var(--ctp-blue)" },
  { id: "lavender", label: "Lavender", css: "var(--ctp-lavender)" },
  { id: "sapphire", label: "Sapphire", css: "var(--ctp-sapphire)" },
  { id: "teal", label: "Teal", css: "var(--ctp-teal)" },
  { id: "peach", label: "Peach", css: "var(--ctp-peach)" },
  { id: "pink", label: "Pink", css: "var(--ctp-pink)" },
] as const;

export type CtpAccent = (typeof CTP_ACCENTS)[number]["id"];

/** Vue 课站独立 storage，避免与其他 learning-* 冲突 */
export const CTP_STORAGE_KEY = "vue3-learn-ctp-flavor";
export const CTP_ACCENT_KEY = "vue3-learn-ctp-accent";
export const DEFAULT_CTP_FLAVOR: CtpFlavor = "mocha";
/** 默认 Green，贴合 Vue 品牌色 */
export const DEFAULT_CTP_ACCENT: CtpAccent = "green";

export function isCtpFlavor(v: string | null | undefined): v is CtpFlavor {
  return CTP_FLAVORS.some((f) => f.id === v);
}

export function isCtpAccent(v: string | null | undefined): v is CtpAccent {
  return CTP_ACCENTS.some((a) => a.id === v);
}

export function readCtpFlavor(): CtpFlavor {
  if (typeof window === "undefined") return DEFAULT_CTP_FLAVOR;
  try {
    const raw = localStorage.getItem(CTP_STORAGE_KEY);
    if (isCtpFlavor(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_CTP_FLAVOR;
}

export function readCtpAccent(): CtpAccent {
  if (typeof window === "undefined") return DEFAULT_CTP_ACCENT;
  try {
    const raw = localStorage.getItem(CTP_ACCENT_KEY);
    if (isCtpAccent(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_CTP_ACCENT;
}

export function applyCtpFlavor(flavor: CtpFlavor) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-ctp-flavor", flavor);
  try {
    localStorage.setItem(CTP_STORAGE_KEY, flavor);
  } catch {
    /* ignore */
  }
}

export function applyCtpAccent(accent: CtpAccent) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-ctp-accent", accent);
  try {
    localStorage.setItem(CTP_ACCENT_KEY, accent);
  } catch {
    /* ignore */
  }
}

export function applyCtpTheme(flavor?: CtpFlavor, accent?: CtpAccent) {
  applyCtpFlavor(flavor ?? readCtpFlavor());
  applyCtpAccent(accent ?? readCtpAccent());
}
