# Placa VELMPU · Bici-LAB — versión para tu propio dominio

Esta carpeta es la misma página que tienes en Claude, lista para publicarse en internet con tu dominio (por ejemplo `bicilab.co`). En esta versión **todo funciona para cualquier cliente**, sin cuenta de Claude:

- El asistente con IA usa tu propia clave de la API de Anthropic (Claude).
- Los pedidos y los comprobantes de pago se guardan en tu cuenta de Netlify.
- Tú ves los pedidos en `tudominio.co/admin.html` con una clave que solo tú conoces.

## Qué hay en la carpeta

| Archivo | Para qué sirve |
|---|---|
| `public/index.html` | La página de venta. Los precios, horarios, cuentas y tiempos se editan en el bloque `CONFIG` al inicio del script. |
| `public/terminos.html`, `public/privacidad.html` | Términos y condiciones y política de datos. |
| `public/admin.html` | Tu panel de pedidos (pide la clave de administrador). |
| `public/img/` | Logo, fotos reales, QR de Bre-B, imagen para compartir. |
| `netlify/functions/ia.mjs` | Conecta el asistente con IA de la página con la API de Claude. |
| `netlify/functions/pedido.mjs` | Recibe el pedido y el comprobante y los guarda. |
| `netlify/functions/pedidos.mjs` | Lista los pedidos y cambia su estado (solo con tu clave). |
| `netlify/functions/comprobante.mjs` | Abre el comprobante de un pedido (solo con tu clave). |

## Paso a paso (unos 30 minutos)

### 1. Crea las cuentas
1. **Netlify** (gratis): <https://app.netlify.com/signup>
2. **Clave de la API de Claude**: entra a <https://console.anthropic.com>, carga saldo y crea una clave (*API key*). Cada consulta del asistente cuesta unos pocos pesos; puedes poner un límite de gasto mensual en la consola.

### 2. Sube el sitio a Netlify
> Ojo: arrastrar la carpeta a Netlify **no** sube las funciones. Usa una de estas dos opciones.

**Opción A — con GitHub (recomendada):**
1. Crea un repositorio en GitHub y sube esta carpeta tal cual.
2. En Netlify: *Add new site → Import an existing project → GitHub* y elige el repositorio. Netlify lee `netlify.toml` solo; no hay que configurar nada más.

**Opción B — desde tu computador:**
1. Instala Node.js (versión 18 o más nueva): <https://nodejs.org>
2. Abre una terminal en esta carpeta y ejecuta:
   ```bash
   npm install
   npx netlify-cli login
   npx netlify-cli deploy --prod
   ```
   La primera vez te pregunta si quieres crear un sitio nuevo: di que sí.

### 3. Configura las claves secretas
En Netlify: *Site configuration → Environment variables → Add a variable*:

| Variable | Valor |
|---|---|
| `ANTHROPIC_API_KEY` | La clave que creaste en console.anthropic.com |
| `ADMIN_TOKEN` | Una clave larga que solo tú sepas (la usas para entrar a `/admin.html`) |
| `ANTHROPIC_MODEL` | Opcional. Por defecto usa `claude-sonnet-5-5`. |

Después de agregarlas, vuelve a publicar (*Deploys → Trigger deploy*).

### 4. Conecta tu dominio
1. Compra el dominio (por ejemplo en Netlify, GoDaddy o cualquier registrador de `.co`).
2. En Netlify: *Domain management → Add a domain* y sigue las instrucciones. Netlify activa el candado de seguridad (HTTPS) solo.

### 5. Ajusta la imagen para compartir
WhatsApp e Instagram necesitan la dirección completa de la imagen. En `public/index.html`, cambia:
```html
<meta property="og:image" content="img/og.jpg">
```
por tu dominio, por ejemplo:
```html
<meta property="og:image" content="https://bicilab.co/img/og.jpg">
```

### 6. Prueba todo antes de anunciarla
- [ ] Haz un pedido de prueba desde el celular, con un pantallazo cualquiera como comprobante.
- [ ] Entra a `tudominio.co/admin.html`, escribe tu `ADMIN_TOKEN` y verifica que aparezca el pedido y se abra el comprobante.
- [ ] Prueba el asistente con IA con una marca y modelo reales, y con una foto de una etiqueta.
- [ ] Escanea el QR de Bre-B con la app de tu banco.
- [ ] Revisa que el botón de WhatsApp abra el chat con el 301 513 1223.

## Cómo editar cosas comunes
Todo está en el bloque `CONFIG` al inicio del script de `public/index.html`:
- **Precio de la placa:** `precios.placa`
- **Tiempo de grabado:** `tiempos.produccion`
- **WhatsApp, dirección, horario, Instagram, Maps:** `tienda`
- **Cuentas de pago:** `pagos`
- **Domicilio por localidad:** lista `LOCALIDADES` y función `precioDomicilio`
- **Envío nacional:** `ZONAS` (precios por zona) y `CIUDADES_N` (ciudades de zona Nacional)

Después de editar, vuelve a publicar (con GitHub basta con subir el cambio).

## Notas
- Los pedidos se guardan en **Netlify Blobs** dentro de tu sitio. Para descargar un respaldo, usa el panel `/admin.html` o la API `/api/pedidos` con tu clave.
- Si algún día recibes muchas consultas falsas al asistente con IA, se puede agregar un límite por visitante o un captcha.
- Los textos legales (`terminos.html`, `privacidad.html`) son una base: haz que un abogado los revise.
