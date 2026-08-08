/** Shared mock REST state (localStorage). Used by MSW handlers. */

export type ApiUser = {
  id: string;
  email: string;
  name: string;
};

export type ApiNote = {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
};

export type ApiLog = {
  id: string;
  at: number;
  method: string;
  path: string;
  status: number;
  detail?: string;
};

type Db = {
  users: Array<ApiUser & { password: string }>;
  notes: Record<string, ApiNote[]>;
  sessions: Record<string, string>;
};

export const DB_KEY = "vue3-learn-mock-api-v1";
export const LOG_KEY = "vue3-learn-mock-api-logs-v1";

export const DEMO_USER = {
  id: "u_demo",
  email: "demo@vue.dev",
  name: "Vue 学员",
  password: "password123",
};

export function loadDb(): Db {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    /* ignore */
  }
  const seed: Db = {
    users: [DEMO_USER],
    notes: {
      [DEMO_USER.id]: [
        {
          id: "n1",
          title: "欢迎来到全栈实训",
          body: "这是模拟后端返回的第一条笔记。打开 DevTools → Network 可看到真实 HTTP。",
          updatedAt: Date.now(),
        },
      ],
    },
    sessions: {},
  };
  saveDb(seed);
  return seed;
}

export function saveDb(db: Db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getLogs(): ApiLog[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (raw) return JSON.parse(raw) as ApiLog[];
  } catch {
    /* ignore */
  }
  return [];
}

export function pushLog(entry: Omit<ApiLog, "id" | "at">) {
  const logs = getLogs();
  const next: ApiLog[] = [
    {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      at: Date.now(),
      ...entry,
    },
    ...logs,
  ].slice(0, 40);
  localStorage.setItem(LOG_KEY, JSON.stringify(next));
  return next;
}

export function clearLogs() {
  localStorage.removeItem(LOG_KEY);
}

export function resetMockDb() {
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem(LOG_KEY);
  loadDb();
}

export function userFromToken(token: string | null): ApiUser | null {
  if (!token) return null;
  const db = loadDb();
  const userId = db.sessions[token];
  if (!userId) return null;
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  const { password: _, ...safe } = user;
  return safe;
}

export function getDemoCredentials() {
  return { email: DEMO_USER.email, password: DEMO_USER.password };
}
