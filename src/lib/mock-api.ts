/**
 * Studio HTTP client — 真实 fetch + Authorization。
 * 请求由 MSW Service Worker 拦截（见 src/mocks），DevTools Network 可见。
 */

export type {
  ApiUser,
  ApiNote,
  ApiLog,
} from "@/mocks/db";

export {
  getLogs,
  clearLogs,
  resetMockDb as resetMockApi,
  getDemoCredentials,
} from "@/mocks/db";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function apiPath(path: string) {
  const base = import.meta.env.BASE_URL || "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  const p = path.replace(/^\//, "");
  return `${root}${p}`;
}

async function parseError(res: Response): Promise<ApiError> {
  let message = res.statusText || "请求失败";
  try {
    const data = (await res.json()) as { message?: string };
    if (data.message) message = data.message;
  } catch {
    /* ignore */
  }
  return new ApiError(res.status, message);
}

function authHeaders(token: string | null): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<{ token: string; user: import("@/mocks/db").ApiUser }> {
  const res = await fetch(apiPath("api/auth/login"), {
    method: "POST",
    headers: authHeaders(null),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function apiMe(token: string | null) {
  const res = await fetch(apiPath("api/me"), {
    method: "GET",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<import("@/mocks/db").ApiUser>;
}

export async function apiLogout(token: string | null): Promise<void> {
  const res = await fetch(apiPath("api/auth/logout"), {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok && res.status !== 204) throw await parseError(res);
}

export async function apiListNotes(token: string | null) {
  const res = await fetch(apiPath("api/notes"), {
    method: "GET",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<import("@/mocks/db").ApiNote[]>;
}

export async function apiCreateNote(
  token: string | null,
  input: { title: string; body: string },
) {
  const res = await fetch(apiPath("api/notes"), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<import("@/mocks/db").ApiNote>;
}

export async function apiUpdateNote(
  token: string | null,
  id: string,
  input: { title: string; body: string },
) {
  const res = await fetch(apiPath(`api/notes/${id}`), {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<import("@/mocks/db").ApiNote>;
}

export async function apiDeleteNote(token: string | null, id: string): Promise<void> {
  const res = await fetch(apiPath(`api/notes/${id}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok && res.status !== 204) throw await parseError(res);
}
