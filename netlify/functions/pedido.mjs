// Guarda un pedido (JSON) y su comprobante de pago en Netlify Blobs.
import { getStore } from "@netlify/blobs";

const MAX_FILE = 10 * 1024 * 1024; // 10 MB
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

export default async (req) => {
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405 });
  let form;
  try { form = await req.formData(); } catch { return Response.json({ error: "Formulario inválido" }, { status: 400 }); }

  let pedido;
  try { pedido = JSON.parse(String(form.get("pedido") || "")); } catch { return Response.json({ error: "Pedido inválido" }, { status: 400 }); }
  const id = String(pedido.id || "").replace(/[^A-Z0-9-]/gi, "").slice(0, 20);
  if (!id || !pedido.contacto || !pedido.vehiculo) return Response.json({ error: "Faltan datos" }, { status: 400 });

  const pedidos = getStore("pedidos");
  if (await pedidos.get(id)) return Response.json({ error: "Pedido repetido" }, { status: 409 });

  const file = form.get("comprobante");
  let comprobante = null;
  if (file && typeof file === "object" && file.size) {
    if (file.size > MAX_FILE) return Response.json({ error: "Comprobante muy grande (máx. 10 MB)" }, { status: 413 });
    const type = OK_TYPES.includes(file.type) ? file.type : "application/octet-stream";
    await getStore("comprobantes").set(id, await file.arrayBuffer(), { metadata: { type, name: String(file.name || "comprobante").slice(0, 80) } });
    comprobante = { type, name: file.name || "comprobante" };
  }

  const registro = { ...pedido, id, comprobante, recibido: new Date().toISOString(), ip: req.headers.get("x-nf-client-connection-ip") || null };
  await pedidos.setJSON(id, registro);
  return Response.json({ ok: true, id });
};

export const config = { path: "/api/pedido" };
