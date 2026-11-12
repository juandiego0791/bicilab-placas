// Descarga el comprobante de un pedido (solo para el dueño).
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const token = process.env.ADMIN_TOKEN;
  if (!token || req.headers.get("authorization") !== `Bearer ${token}`) return new Response("No autorizado", { status: 401 });
  const id = new URL(req.url).searchParams.get("id") || "";
  const r = await getStore("comprobantes").getWithMetadata(id, { type: "arrayBuffer" });
  if (!r) return new Response("No existe", { status: 404 });
  return new Response(r.data, { headers: { "content-type": r.metadata?.type || "application/octet-stream", "cache-control": "private, no-store" } });
};

export const config = { path: "/api/comprobante" };
