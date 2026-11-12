// Lista los pedidos (solo para el dueño). Requiere el encabezado Authorization: Bearer <ADMIN_TOKEN>.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const token = process.env.ADMIN_TOKEN;
  if (!token || req.headers.get("authorization") !== `Bearer ${token}`) return Response.json({ error: "No autorizado" }, { status: 401 });
  const store = getStore("pedidos");
  const url = new URL(req.url);

  if (req.method === "PATCH") {
    const { id, estado } = await req.json().catch(() => ({}));
    const p = id && await store.get(id, { type: "json" });
    if (!p) return Response.json({ error: "No existe" }, { status: 404 });
    p.estado = String(estado || p.estado).slice(0, 40);
    await store.setJSON(id, p);
    return Response.json({ ok: true });
  }

  const { blobs } = await store.list();
  const items = await Promise.all(blobs.map(b => store.get(b.key, { type: "json" })));
  const out = items.filter(Boolean).sort((a, b) => String(b.recibido).localeCompare(String(a.recibido)));
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "200"), 500);
  return Response.json(out.slice(0, limit));
};

export const config = { path: "/api/pedidos" };
