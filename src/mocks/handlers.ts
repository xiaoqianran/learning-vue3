import { http, HttpResponse, delay } from "msw";
import {
  loadDb,
  saveDb,
  pushLog,
  userFromToken,
  type ApiNote,
} from "./db";

function bearer(req: Request): string | null {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

/** Match /api/... regardless of GitHub Pages base path prefix */
const api = (path: string) => {
  const escaped = path.replace(/\//g, "\\/");
  return new RegExp(`(?:^|\\/)${escaped.replace(/^\//, "")}$`);
};

export const handlers = [
  http.post(api("api/auth/login"), async ({ request }) => {
    await delay(280);
    const body = (await request.json()) as { email?: string; password?: string };
    const db = loadDb();
    const user = db.users.find(
      (u) => u.email === (body.email ?? "").trim() && u.password === body.password,
    );
    if (!user) {
      pushLog({
        method: "POST",
        path: "/api/auth/login",
        status: 401,
        detail: "邮箱或密码错误",
      });
      return HttpResponse.json({ message: "邮箱或密码错误" }, { status: 401 });
    }
    const token = `tok_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    db.sessions[token] = user.id;
    saveDb(db);
    const { password: _, ...safe } = user;
    pushLog({
      method: "POST",
      path: "/api/auth/login",
      status: 200,
      detail: `user=${safe.email}`,
    });
    return HttpResponse.json({ token, user: safe }, { status: 200 });
  }),

  http.post(api("api/auth/logout"), async ({ request }) => {
    await delay(120);
    const token = bearer(request);
    if (token) {
      const db = loadDb();
      delete db.sessions[token];
      saveDb(db);
    }
    pushLog({ method: "POST", path: "/api/auth/logout", status: 204 });
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(api("api/me"), async ({ request }) => {
    await delay(160);
    const user = userFromToken(bearer(request));
    if (!user) {
      pushLog({ method: "GET", path: "/api/me", status: 401, detail: "未登录" });
      return HttpResponse.json({ message: "未登录" }, { status: 401 });
    }
    pushLog({ method: "GET", path: "/api/me", status: 200 });
    return HttpResponse.json(user);
  }),

  http.get(api("api/notes"), async ({ request }) => {
    await delay(220);
    const user = userFromToken(bearer(request));
    if (!user) {
      pushLog({ method: "GET", path: "/api/notes", status: 401 });
      return HttpResponse.json({ message: "未登录" }, { status: 401 });
    }
    const db = loadDb();
    const list = [...(db.notes[user.id] ?? [])].sort(
      (a, b) => b.updatedAt - a.updatedAt,
    );
    pushLog({
      method: "GET",
      path: "/api/notes",
      status: 200,
      detail: `${list.length} items`,
    });
    return HttpResponse.json(list);
  }),

  http.post(api("api/notes"), async ({ request }) => {
    await delay(240);
    const user = userFromToken(bearer(request));
    if (!user) {
      pushLog({ method: "POST", path: "/api/notes", status: 401 });
      return HttpResponse.json({ message: "未登录" }, { status: 401 });
    }
    const body = (await request.json()) as { title?: string; body?: string };
    const title = (body.title ?? "").trim();
    if (!title) {
      pushLog({ method: "POST", path: "/api/notes", status: 400, detail: "标题不能为空" });
      return HttpResponse.json({ message: "标题不能为空" }, { status: 400 });
    }
    const note: ApiNote = {
      id: `n_${Date.now().toString(36)}`,
      title,
      body: (body.body ?? "").trim(),
      updatedAt: Date.now(),
    };
    const db = loadDb();
    db.notes[user.id] = [note, ...(db.notes[user.id] ?? [])];
    saveDb(db);
    pushLog({ method: "POST", path: "/api/notes", status: 201, detail: note.id });
    return HttpResponse.json(note, { status: 201 });
  }),

  http.put(api("api/notes/:id"), async ({ request, params }) => {
    await delay(220);
    const user = userFromToken(bearer(request));
    if (!user) {
      pushLog({ method: "PUT", path: `/api/notes/${params.id}`, status: 401 });
      return HttpResponse.json({ message: "未登录" }, { status: 401 });
    }
    const body = (await request.json()) as { title?: string; body?: string };
    const title = (body.title ?? "").trim();
    if (!title) {
      pushLog({ method: "PUT", path: `/api/notes/${params.id}`, status: 400 });
      return HttpResponse.json({ message: "标题不能为空" }, { status: 400 });
    }
    const db = loadDb();
    const list = db.notes[user.id] ?? [];
    const idx = list.findIndex((n) => n.id === params.id);
    if (idx < 0) {
      pushLog({ method: "PUT", path: `/api/notes/${params.id}`, status: 404 });
      return HttpResponse.json({ message: "笔记不存在" }, { status: 404 });
    }
    const next: ApiNote = {
      ...list[idx]!,
      title,
      body: (body.body ?? "").trim(),
      updatedAt: Date.now(),
    };
    list[idx] = next;
    db.notes[user.id] = list;
    saveDb(db);
    pushLog({ method: "PUT", path: `/api/notes/${params.id}`, status: 200 });
    return HttpResponse.json(next);
  }),

  http.delete(api("api/notes/:id"), async ({ request, params }) => {
    await delay(180);
    const user = userFromToken(bearer(request));
    if (!user) {
      pushLog({ method: "DELETE", path: `/api/notes/${params.id}`, status: 401 });
      return HttpResponse.json({ message: "未登录" }, { status: 401 });
    }
    const db = loadDb();
    const list = db.notes[user.id] ?? [];
    if (!list.some((n) => n.id === params.id)) {
      pushLog({ method: "DELETE", path: `/api/notes/${params.id}`, status: 404 });
      return HttpResponse.json({ message: "笔记不存在" }, { status: 404 });
    }
    db.notes[user.id] = list.filter((n) => n.id !== params.id);
    saveDb(db);
    pushLog({ method: "DELETE", path: `/api/notes/${params.id}`, status: 204 });
    return new HttpResponse(null, { status: 204 });
  }),
];
