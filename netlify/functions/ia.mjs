// Asistente con IA: recibe el prompt (y fotos opcionales) y devuelve el JSON que sugiere Claude.
// Variables de entorno: ANTHROPIC_API_KEY (obligatoria), ANTHROPIC_MODEL (opcional).
const MAX_IMAGES = 3;
const MAX_IMAGE_B64 = 7_000_000; // ~5 MB por imagen

export default async (req) => {
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405 });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "Falta ANTHROPIC_API_KEY" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "JSON inválido" }, { status: 400 }); }
  const prompt = String(body.prompt || "").slice(0, 8000);
  if (!prompt) return Response.json({ error: "Falta el prompt" }, { status: 400 });
  const images = Array.isArray(body.images) ? body.images.slice(0, MAX_IMAGES) : [];
  const okTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const content = [];
  for (const im of images) {
    if (!okTypes.includes(im.media_type) || typeof im.data !== "string" || im.data.length > MAX_IMAGE_B64) continue;
    content.push({ type: "image", source: { type: "base64", media_type: im.media_type, data: im.data } });
  }
  content.push({ type: "text", text: prompt + "\n\nResponde únicamente con el objeto JSON, sin texto adicional." });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 1500,
      messages: [{ role: "user", content }]
    })
  });
  if (r.status === 429) return Response.json({ error: "rate_limited" }, { status: 429 });
  if (!r.ok) return Response.json({ error: "Error de la IA", detail: (await r.text()).slice(0, 300) }, { status: 502 });

  const data = await r.json();
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return Response.json({ error: "Respuesta sin JSON" }, { status: 502 });
  try { return Response.json(JSON.parse(m[0])); }
  catch { return Response.json({ error: "JSON inválido de la IA" }, { status: 502 }); }
};

export const config = { path: "/api/ia" };
