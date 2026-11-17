# mikarpa

SaaS multi-tenant de tiendas virtuales desplegable en Vercel: cada usuario crea su tienda,
la personaliza, gestiona productos y recibe pedidos por WhatsApp o con pasarela online.

> **Estado: Fase 0 completada.** Scaffold de Next.js 16, conexión a MongoDB, 12 modelos con
> índices, seed idempotente y `/api/health` funcionando. La Fase 1 (auth + onboarding +
> catálogo + storefront + checkout) está aprobada como siguiente paso, aún sin empezar.

- Arquitectura, modelo de datos, estructura de carpetas y plan por fases:
  [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)
- Esquemas Mongoose: [`models/`](models)
- Enumeraciones de dominio: [`lib/enums.ts`](lib/enums.ts)
- Variables de entorno: [`.env.example`](.env.example)

## Stack

Next.js 16.4.6 (App Router, Turbopack, `proxy.ts`) · TypeScript strict · MongoDB Atlas +
Mongoose 9 · Auth.js v5 · TailwindCSS 4 + shadcn/ui · Zustand · Zod 4 · Tiptap (rich text) ·
Cloudinary (imágenes) · Mercado Pago (pagos, Perú/LATAM) · Resend (opcional) · Vercel.

## Decisiones del MVP

- **País/moneda:** Perú, `PEN` (S/), `es-PE`, `America/Lima`.
- **Idioma:** español; estructura preparada para i18n.
- **Pagos:** WhatsApp por defecto (sin comisiones) y Mercado Pago como pasarela online.
  Stripe no opera en Perú. Culqi queda como adapter opcional.
- **Variantes:** soporte básico desde el esquema (opciones + variantes con precio/stock/SKU).
- **Descripciones:** rich text con Tiptap, HTML saneado en servidor con allowlist.

## Requisitos

- **Node.js ≥ 20.9** (requisito de Next 16). Verificado con Node 22.15.
- npm 11.
- Una base **MongoDB** (Atlas M0 gratis o MongoDB local para desarrollo).

## Puesta en marcha local

```bash
# 1. Dependencias
npm install

# 2. Variables de entorno
#    Windows (PowerShell):  Copy-Item .env.example .env.local
#    macOS/Linux:           cp .env.example .env.local
#    Luego completa MONGODB_URI y AUTH_SECRET.

# 3. Secreto de Auth.js (obligatorio)
#    Windows:        $env:AUTH_SECRET = [Convert]::ToBase64String((1..32 | % { Get-Random -Max 256 }))
#    macOS/Linux:    openssl rand -base64 32

# 4. Contraseña del superadmin para el seed
#    Edita SEED_SUPERADMIN_PASSWORD en .env.local (el seed falla si falta).

# 5. Índices + datos de ejemplo
npm run db:indexes
npm run db:seed

# 6. Servidor de desarrollo
npm run dev
```

Abre `http://localhost:3000` y comprueba `http://localhost:3000/api/health`:

```json
{ "ok": true, "db": "ok", "latencyMs": 54, "timestamp": "..." }
```

Sin `MONGODB_URI` el endpoint responde `503` con `db: "unconfigured"` (comportamiento esperado).

### Credenciales del seed

| Rol | Email | Contraseña |
| --- | --- | --- |
| Superadmin | `SEED_SUPERADMIN_EMAIL` (default `admin@mikarpa.xyz`) | `SEED_SUPERADMIN_PASSWORD` |
| Owner demo | `demo@mikarpa.xyz` | `demo1234` |
| Staff demo | `staff@mikarpa.xyz` | `demo1234` (solo permiso `orders`) |

Tienda de ejemplo: `/tienda/tienda-demo`. El seed es idempotente: se puede ejecutar N veces sin
duplicar datos y sin sobrescribir contraseñas existentes.

> ⚠ Cambia todas las contraseñas antes de desplegar a producción.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Turbopack). |
| `npm run build` | Build de producción. |
| `npm run start` | Sirve el build (`npx next start -p 3000` para otro puerto). |
| `npm run lint` | ESLint (flat config de Next 16). |
| `npm run typecheck` | `tsc --noEmit` con strict completo. |
| `npm run format` | Prettier + orden de clases Tailwind. |
| `npm run db:indexes` | Sincroniza los índices de los 12 modelos con la DB. |
| `npm run db:seed` | Datos de ejemplo idempotentes. |
| `npm run db:reset` | **Borra toda la base.** Requiere `CONFIRM_RESET=1`, rechaza producción. |

## Deploy en Vercel + MongoDB Atlas

1. **Atlas**: crea un cluster **M0** (free), un usuario de base de datos y permite acceso desde
   `0.0.0.0/0` (Vercel no tiene IPs fijas en Hobby). Copia la cadena SRV y añade el nombre de
   la base: `mongodb+srv://…/mikarpa?retryWrites=true&w=majority`.
2. **Vercel**: importa el repositorio. Framework detectado: Next.js; no requiere build custom.
3. **Environment Variables** (Production y Preview):
   `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`,
   `PAYMENT_TOKEN_KEY` y, cuando se activen, las de Cloudinary y Mercado Pago.
   `AUTH_URL`/`NEXT_PUBLIC_APP_URL` deben ser el dominio real (`https://tu-dominio.com`).
4. **Índices y seed en producción** (una sola vez, desde local apuntando a la base de Atlas):
   ```bash
   npm run db:indexes
   npm run db:seed
   ```
   En producción la app corre con `autoIndex: false`, por eso los índices se crean con el script.
5. Verifica `https://tu-dominio.com/api/health` → `db: "ok"`.

**Plan de Vercel:** Hobby es gratis y suficiente para desarrollar y validar. El plan Hobby está
pensado para proyectos personales; cuando mikarpa empiece a facturar o aloje tiendas de clientes,
lo recomendable es **Pro (US$20/mes)**. Cloudinary (25 créditos/mes) y Atlas M0 son gratis.

## Estructura

```text
app/            # App Router (landing + /api/health en Fase 0)
components/ui/  # shadcn/ui
lib/            # db.ts, enums.ts, utils.ts
models/         # 12 modelos Mongoose con índices y validaciones
scripts/        # seed, sync-indexes, reset-db
docs/           # arquitectura y plan por fases
```

## Verificación de la Fase 0

Ejecutado y en verde:

- `npm run typecheck` — sin errores (strict, `noUncheckedIndexedAccess`).
- `npm run lint` — sin warnings.
- `npm run build` — compila; rutas `/` (estática) y `/api/health` (dinámica).
- `npm run db:seed` dos veces — la segunda no duplica (`• ya existía`).
- `npm run db:indexes` — 12/12 modelos sincronizados (incluye texto `product_text`/`store_text`
  y únicos parciales de `sku`, `payment.externalId` y `externalRef`).
- `/api/health` — `503 db: "unconfigured"` sin variables y `200 db: "ok"` con base conectada.
- `npm run db:reset` — rechaza sin `CONFIRM_RESET=1`; borra y deja la base lista para re-seed.

### Base de datos creada

La base **`mikarpa`** ya existe en MongoDB Atlas (cluster `cluster0.ui6nvvg`) con las 12
colecciones, sus índices y el seed aplicado. La cadena de conexión vive en `.env.local`
(ignorado por git). Para recrear índices o datos:

```bash
npm run db:indexes
npm run db:seed
```
